const excelService = require('../services/excelService');
const ExcelJS = require('exceljs');

// Get attendance sheet for a specific batch and date
exports.getBatchDailyAttendance = async (req, res) => {
  try {
    const { batch_id, date } = req.query;
    if (!batch_id || !date) {
      return res.status(400).json({ success: false, message: 'batch_id and date are required' });
    }

    const [allStudents, allAttendance, batch] = await Promise.all([
      excelService.getSheetData('Students'),
      excelService.getSheetData('Attendance'),
      excelService.findById('Batches', batch_id)
    ]);

    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });

    // Students in this batch (non-archived)
    const batchStudents = allStudents.filter(
      (s) => s.batch_id === batch_id && s.student_status !== 'Archived'
    );

    // Existing attendance entries for this batch and date
    const dayAttendance = allAttendance.filter(
      (a) => a.batch_id === batch_id && a.attendance_date === date
    );

    const attendanceMap = {};
    dayAttendance.forEach((a) => {
      attendanceMap[a.student_id] = a;
    });

    const studentsWithAttendance = batchStudents.map((s) => {
      const existing = attendanceMap[s.student_id];
      return {
        student_id: s.student_id,
        full_name: s.full_name,
        email: s.email,
        phone_number: s.phone_number,
        attendance_id: existing ? existing.attendance_id : null,
        attendance_status: existing ? existing.attendance_status : 'Present', // default present
        remarks: existing ? existing.remarks : '',
        isMarked: !!existing
      };
    });

    return res.json({
      success: true,
      batch,
      date,
      isDateRecorded: dayAttendance.length > 0,
      students: studentsWithAttendance
    });
  } catch (error) {
    console.error('[ATTENDANCE GET DAILY ERROR]', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve daily attendance' });
  }
};

// Save or bulk mark attendance for a batch on a date (preventing duplicate entries)
exports.saveBatchAttendance = async (req, res) => {
  try {
    const { batch_id, date, entries } = req.body;
    // entries: [ { student_id, attendance_status, remarks } ]

    if (!batch_id || !date || !Array.isArray(entries)) {
      return res.status(400).json({
        success: false,
        message: 'batch_id, date, and entries array are required'
      });
    }

    const allAttendance = await excelService.getSheetData('Attendance');

    for (const item of entries) {
      const existing = allAttendance.find(
        (a) => a.batch_id === batch_id && a.student_id === item.student_id && a.attendance_date === date
      );

      if (existing) {
        // Update existing record
        await excelService.update('Attendance', existing.attendance_id, {
          attendance_status: item.attendance_status || 'Present',
          remarks: item.remarks || ''
        });
      } else {
        // Insert new entry with auto ID
        await excelService.insert('Attendance', {
          student_id: item.student_id,
          batch_id,
          attendance_date: date,
          attendance_status: item.attendance_status || 'Present',
          remarks: item.remarks || ''
        });
      }
    }

    return res.json({
      success: true,
      message: `Attendance for batch on ${date} saved successfully.`
    });
  } catch (error) {
    console.error('[ATTENDANCE SAVE ERROR]', error);
    return res.status(500).json({ success: false, message: 'Failed to record attendance' });
  }
};

// Monthly attendance summary report
exports.getMonthlyReport = async (req, res) => {
  try {
    const { batch_id, month } = req.query; // month in 'YYYY-MM' format
    if (!batch_id || !month) {
      return res.status(400).json({ success: false, message: 'batch_id and month (YYYY-MM) are required' });
    }

    const [allStudents, allAttendance, batch] = await Promise.all([
      excelService.getSheetData('Students'),
      excelService.getSheetData('Attendance'),
      excelService.findById('Batches', batch_id)
    ]);

    const batchStudents = allStudents.filter((s) => s.batch_id === batch_id);
    const monthAttendance = allAttendance.filter(
      (a) => a.batch_id === batch_id && a.attendance_date && a.attendance_date.startsWith(month)
    );

    // Unique dates recorded in this month
    const dates = Array.from(new Set(monthAttendance.map((a) => a.attendance_date))).sort();

    const report = batchStudents.map((s) => {
      const studentRecords = monthAttendance.filter((a) => a.student_id === s.student_id);
      const presentCount = studentRecords.filter((a) => a.attendance_status === 'Present').length;
      const absentCount = studentRecords.filter((a) => a.attendance_status === 'Absent').length;
      const totalRecorded = studentRecords.length;
      const percentage = totalRecorded > 0 ? Math.round((presentCount / totalRecorded) * 100) : 0;

      const daily = {};
      dates.forEach((d) => {
        const found = studentRecords.find((r) => r.attendance_date === d);
        daily[d] = found ? found.attendance_status : '-';
      });

      return {
        student_id: s.student_id,
        full_name: s.full_name,
        presentCount,
        absentCount,
        totalRecorded,
        percentage,
        daily
      };
    });

    return res.json({
      success: true,
      batch,
      month,
      dates,
      totalWorkingDays: dates.length,
      report
    });
  } catch (error) {
    console.error('[ATTENDANCE MONTHLY REPORT ERROR]', error);
    return res.status(500).json({ success: false, message: 'Failed to generate monthly attendance report' });
  }
};

