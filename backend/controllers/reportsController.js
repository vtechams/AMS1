const excelService = require('../services/excelService');
const ExcelJS = require('exceljs');

exports.getAdmissionReports = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let students = await excelService.getSheetData('Students');

    if (startDate) {
      students = students.filter((s) => s.admission_date >= startDate);
    }
    if (endDate) {
      students = students.filter((s) => s.admission_date <= endDate);
    }

    const trainingAdmissions = students.filter(
      (s) => s.admission_category && s.admission_category.toLowerCase().includes('training')
    );
    const placementAdmissions = students.filter(
      (s) => s.admission_category && s.admission_category.toLowerCase().includes('placement')
    );
    const activeStudents = students.filter((s) => s.student_status === 'Active');
    const archivedStudents = students.filter((s) => s.student_status === 'Archived');
    const placedStudents = students.filter((s) => s.student_status === 'Placed');

    // Month-wise aggregation
    const monthMap = {};
    students.forEach((s) => {
      const month = s.admission_date ? s.admission_date.substring(0, 7) : 'Unknown';
      if (!monthMap[month]) {
        monthMap[month] = { month, training: 0, placement: 0, total: 0 };
      }
      if (s.admission_category && s.admission_category.toLowerCase().includes('training')) {
        monthMap[month].training++;
      } else {
        monthMap[month].placement++;
      }
      monthMap[month].total++;
    });

    const monthData = Object.values(monthMap).sort((a, b) => a.month.localeCompare(b.month));

    return res.json({
      success: true,
      summary: {
        total: students.length,
        training: trainingAdmissions.length,
        placement: placementAdmissions.length,
        active: activeStudents.length,
        archived: archivedStudents.length,
        placed: placedStudents.length
      },
      monthData,
      students
    });
  } catch (error) {
    console.error('[REPORTS ADMISSION ERROR]', error);
    return res.status(500).json({ success: false, message: 'Failed to generate admission report' });
  }
};

exports.getBatchReports = async (req, res) => {
  try {
    const [courses, batches, students, attendance] = await Promise.all([
      excelService.getSheetData('Courses'),
      excelService.getSheetData('Batches'),
      excelService.getSheetData('Students'),
      excelService.getSheetData('Attendance')
    ]);

    const courseMap = {};
    courses.forEach((c) => (courseMap[c.course_id] = c.course_name));

    const batchSummary = batches.map((b) => {
      const enrolled = students.filter((s) => s.batch_id === b.batch_id);
      const batchAtt = attendance.filter((a) => a.batch_id === b.batch_id);
      const present = batchAtt.filter((a) => a.attendance_status === 'Present').length;
      const rate = batchAtt.length > 0 ? Math.round((present / batchAtt.length) * 100) : 0;

      return {
        batch_id: b.batch_id,
        batch_name: b.batch_name,
        course_name: courseMap[b.course_id] || b.course_id,
        trainer_name: b.trainer_name,
        batch_status: b.batch_status,
        enrolledCount: enrolled.length,
        totalAttendanceEntries: batchAtt.length,
        attendanceRate: rate
      };
    });

    return res.json({
      success: true,
      summary: {
        totalCourses: courses.length,
        totalBatches: batches.length,
        activeBatches: batches.filter((b) => b.batch_status === 'Active').length,
        completedBatches: batches.filter((b) => b.batch_status === 'Completed').length
      },
      batchSummary
    });
  } catch (error) {
    console.error('[REPORTS BATCH ERROR]', error);
    return res.status(500).json({ success: false, message: 'Failed to generate batch report' });
  }
};

exports.getPlacementReports = async (req, res) => {
  try {
    const [requirements, applications, students, companies] = await Promise.all([
      excelService.getSheetData('Requirements'),
      excelService.getSheetData('Applications'),
      excelService.getSheetData('Students'),
      excelService.getSheetData('Companies')
    ]);

    const totalRequirements = requirements.length;
    const openRequirements = requirements.filter(
      (r) => r.requirement_status === 'Open' || r.requirement_status === 'Applications in Progress'
    ).length;
    const closedRequirements = requirements.filter((r) => r.requirement_status === 'Closed').length;

    const selectedApps = applications.filter((a) => a.result === 'Selected');
    const rejectedApps = applications.filter((a) => a.result === 'Rejected');
    const pendingApps = applications.filter(
      (a) => a.result === 'Result Pending' || a.result === 'Interview Attended' || a.result === 'Interview Scheduled'
    );

    // Company-wise application breakdown
    const companyMap = {};
    applications.forEach((a) => {
      const cName = a.company_name || 'Unknown';
      if (!companyMap[cName]) {
        companyMap[cName] = { company: cName, total: 0, selected: 0, rejected: 0, pending: 0 };
      }
      companyMap[cName].total++;
      if (a.result === 'Selected') companyMap[cName].selected++;
      else if (a.result === 'Rejected') companyMap[cName].rejected++;
      else companyMap[cName].pending++;
    });

    // Role-wise application breakdown
    const roleMap = {};
    applications.forEach((a) => {
      const role = a.job_role || 'General';
      if (!roleMap[role]) {
        roleMap[role] = { role, total: 0, selected: 0 };
      }
      roleMap[role].total++;
      if (a.result === 'Selected') roleMap[role].selected++;
    });

    // Requirements without eligible students
    const reqsWithoutEligible = requirements.filter((r) => {
      const eligibleCourseIds = (r.eligible_courses || '').split(',').map((c) => c.trim());
      const matches = students.filter(
        (s) =>
          (eligibleCourseIds.length === 0 || eligibleCourseIds.includes(s.course_id)) &&
          s.placement_eligibility === 'Eligible'
      );
      return matches.length === 0;
    });

    return res.json({
      success: true,
      summary: {
        totalRequirements,
        openRequirements,
        closedRequirements,
        totalApplications: applications.length,
        selectedCount: selectedApps.length,
        rejectedCount: rejectedApps.length,
        pendingCount: pendingApps.length,
        reqsWithoutEligibleCount: reqsWithoutEligible.length
      },
      companyBreakdown: Object.values(companyMap),
      roleBreakdown: Object.values(roleMap),
      selectedStudents: selectedApps,
      reqsWithoutEligible
    });
  } catch (error) {
    console.error('[REPORTS PLACEMENT ERROR]', error);
    return res.status(500).json({ success: false, message: 'Failed to generate placement report' });
  }
};

// Universal Excel export for reports
exports.exportReportExcel = async (req, res) => {
  try {
    const { reportType } = req.params;
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(`${reportType} Report`);

    const headerFill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E293B' }
    };
    const headerFont = { bold: true, color: { argb: 'FFFFFFFF' } };

    if (reportType === 'placements') {
      const applications = await excelService.getSheetData('Applications');
      sheet.columns = [
        { header: 'App ID', key: 'application_id', width: 14 },
        { header: 'Student Name', key: 'student_name', width: 22 },
        { header: 'Company Name', key: 'company_name', width: 24 },
        { header: 'Job Role', key: 'job_role', width: 24 },
        { header: 'Application Date', key: 'application_date', width: 16 },
        { header: 'Interview Date', key: 'interview_date', width: 16 },
        { header: 'Interview Round', key: 'interview_round', width: 20 },
        { header: 'Result', key: 'result', width: 18 },
        { header: 'Feedback', key: 'hr_feedback', width: 30 }
      ];
      applications.forEach((a) => sheet.addRow(a));
    } else if (reportType === 'admissions') {
      const students = await excelService.getSheetData('Students');
      sheet.columns = [
        { header: 'Student ID', key: 'student_id', width: 14 },
        { header: 'Name', key: 'full_name', width: 22 },
        { header: 'Category', key: 'admission_category', width: 20 },
        { header: 'Course ID', key: 'course_id', width: 14 },
        { header: 'Batch ID', key: 'batch_id', width: 14 },
        { header: 'Admission Date', key: 'admission_date', width: 16 },
        { header: 'Status', key: 'student_status', width: 14 }
      ];
      students.forEach((s) => sheet.addRow(s));
    }

    sheet.getRow(1).height = 25;
    sheet.getRow(1).fill = headerFill;
    sheet.getRow(1).font = headerFont;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${reportType}_Report.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('[REPORT EXCEL EXPORT ERROR]', error);
    return res.status(500).json({ success: false, message: 'Failed to export report' });
  }
};

exports.exportFullDatabase = async (req, res) => {
  try {
    const excelSyncService = require('../services/excelSyncService');
    await excelSyncService.streamFullWorkbook(res);
  } catch (error) {
    console.error('[EXPORT FULL DATABASE ERROR]', error);
    return res.status(500).json({ success: false, message: 'Failed to export full database' });
  }
};


