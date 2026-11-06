const excelService = require('../services/excelService');
const ExcelJS = require('exceljs');

exports.getAllStudents = async (req, res) => {
  try {
    const {
      search,
      category,
      status,
      courseId,
      batchId,
      eligibility,
      page = 1,
      limit = 50
    } = req.query;

    let students = await excelService.getSheetData('Students');
    const courses = await excelService.getSheetData('Courses');
    const batches = await excelService.getSheetData('Batches');

    const courseMap = {};
    courses.forEach((c) => (courseMap[c.course_id] = c.course_name));

    const batchMap = {};
    batches.forEach((b) => (batchMap[b.batch_id] = b.batch_name));

    // Map course_name and batch_name for easier UI consumption
    students = students.map((s) => ({
      ...s,
      course_name: courseMap[s.course_id] || s.course_id,
      batch_name: batchMap[s.batch_id] || s.batch_id
    }));

    // Search filter
    if (search) {
      const q = search.toLowerCase().trim();
      students = students.filter(
        (s) =>
          (s.full_name && s.full_name.toLowerCase().includes(q)) ||
          (s.student_id && s.student_id.toLowerCase().includes(q)) ||
          (s.email && s.email.toLowerCase().includes(q)) ||
          (s.phone_number && s.phone_number.includes(q))
      );
    }

    // Category filter
    if (category) {
      students = students.filter(
        (s) => s.admission_category && s.admission_category.toLowerCase() === category.toLowerCase()
      );
    }

    // Status filter
    if (status) {
      students = students.filter(
        (s) => s.student_status && s.student_status.toLowerCase() === status.toLowerCase()
      );
    }

    // Course filter
    if (courseId) {
      students = students.filter((s) => s.course_id === courseId);
    }

    // Batch filter
    if (batchId) {
      students = students.filter((s) => s.batch_id === batchId);
    }

    // Placement Eligibility filter
    if (eligibility) {
      students = students.filter(
        (s) => s.placement_eligibility && s.placement_eligibility.toLowerCase() === eligibility.toLowerCase()
      );
    }

    const total = students.length;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = students.slice(startIndex, startIndex + limitNum);

    return res.json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      students: paginated
    });
  } catch (error) {
    console.error('[STUDENT GET ALL ERROR]', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve students' });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await excelService.findById('Students', id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Load related courses, batches, applications, attendance
    const [courses, batches, applications, attendance] = await Promise.all([
      excelService.getSheetData('Courses'),
      excelService.getSheetData('Batches'),
      excelService.getSheetData('Applications'),
      excelService.getSheetData('Attendance')
    ]);

    const course = courses.find((c) => c.course_id === student.course_id) || null;
    const batch = batches.find((b) => b.batch_id === student.batch_id) || null;
    const studentApplications = applications.filter((a) => a.student_id === id);
    const studentAttendance = attendance.filter((a) => a.student_id === id);

    // Calculate attendance percentage
    const totalDays = studentAttendance.length;
    const presentDays = studentAttendance.filter((a) => a.attendance_status === 'Present').length;
    const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    return res.json({
      success: true,
      student: {
        ...student,
        course,
        batch,
        applications: studentApplications,
        attendanceHistory: studentAttendance,
        attendanceStats: {
          totalDays,
          presentDays,
          attendancePercentage
        }
      }
    });
  } catch (error) {
    console.error('[STUDENT GET BY ID ERROR]', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve student details' });
  }
};

exports.createStudent = async (req, res) => {
  try {
    const {
      full_name,
      email,
      phone_number,
      address,
      admission_category,
      course_id,
      batch_id,
      admission_date,
      educational_qualification,
      training_status,
      placement_eligibility
    } = req.body;

    if (!full_name || !email || !admission_category || !course_id) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, admission category, and course are required.'
      });
    }

    // Check duplicate email in students
    const existing = await excelService.getSheetData('Students');
    const isDuplicate = existing.some(
      (s) => s.email && s.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (isDuplicate) {
      return res.status(400).json({
        success: false,
        message: 'A student with this email address already exists.'
      });
    }

    const newStudent = await excelService.insert('Students', {
      full_name: full_name.trim(),
      email: email.trim().toLowerCase(),
      phone_number: phone_number || '',
      address: address || '',
      admission_category: admission_category || 'Training Admission',
      course_id: course_id || '',
      batch_id: batch_id || '',
      admission_date: admission_date || new Date().toISOString().split('T')[0],
      educational_qualification: educational_qualification || '',
      training_status: training_status || 'In Progress',
      placement_eligibility: placement_eligibility || (admission_category === 'Placement Admission' ? 'Eligible' : 'Pending Evaluation'),
      student_status: 'Active'
    });

    // Also auto-record enrollment if batch is assigned
    if (batch_id) {
      await excelService.insert('Enrollments', {
        student_id: newStudent.student_id,
        course_id,
        batch_id,
        enrollment_date: newStudent.admission_date,
        enrollment_status: 'Active'
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Student admitted successfully',
      student: newStudent
    });
  } catch (error) {
    console.error('[STUDENT CREATE ERROR]', error);
    return res.status(500).json({ success: false, message: 'Failed to create student record' });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await excelService.findById('Students', id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const updates = { ...req.body };
    delete updates.student_id; // Disallow changing primary ID

    const updated = await excelService.update('Students', id, updates);

    return res.json({
      success: true,
      message: 'Student record updated successfully',
      student: updated
    });
  } catch (error) {
    console.error('[STUDENT UPDATE ERROR]', error);
    return res.status(500).json({ success: false, message: 'Failed to update student' });
  }
};

exports.archiveStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await excelService.archive('Students', id);
    return res.json({
      success: true,
      message: 'Student archived successfully (historical records preserved)',
      student: updated
    });
  } catch (error) {
    console.error('[STUDENT ARCHIVE ERROR]', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to archive student' });
  }
};

exports.restoreStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await excelService.restore('Students', id, 'Active');
    return res.json({
      success: true,
      message: 'Student restored to Active successfully',
      student: updated
    });
  } catch (error) {
    console.error('[STUDENT RESTORE ERROR]', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to restore student' });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    await excelService.delete('Students', id);
    return res.json({
      success: true,
      message: 'Student record permanently deleted successfully'
    });
  } catch (error) {
    console.error('[STUDENT DELETE ERROR]', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to delete student' });
  }
};

exports.exportStudentsExcel = async (req, res) => {
  try {
    const students = await excelService.getSheetData('Students');
    const courses = await excelService.getSheetData('Courses');
    const batches = await excelService.getSheetData('Batches');

    const courseMap = {};
    courses.forEach((c) => (courseMap[c.course_id] = c.course_name));

    const batchMap = {};
    batches.forEach((b) => (batchMap[b.batch_id] = b.batch_name));

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Students Export');

    sheet.columns = [
      { header: 'Student ID', key: 'student_id', width: 14 },
      { header: 'Full Name', key: 'full_name', width: 22 },
      { header: 'Email', key: 'email', width: 28 },
      { header: 'Phone Number', key: 'phone_number', width: 18 },
      { header: 'Admission Category', key: 'admission_category', width: 22 },
      { header: 'Course', key: 'course_name', width: 28 },
      { header: 'Batch', key: 'batch_name', width: 20 },
      { header: 'Admission Date', key: 'admission_date', width: 16 },
      { header: 'Qualification', key: 'educational_qualification', width: 24 },
      { header: 'Training Status', key: 'training_status', width: 16 },
      { header: 'Placement Eligibility', key: 'placement_eligibility', width: 20 },
      { header: 'Student Status', key: 'student_status', width: 14 }
    ];

    sheet.getRow(1).height = 25;
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E293B' }
    };
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    students.forEach((s) => {
      sheet.addRow({
        ...s,
        course_name: courseMap[s.course_id] || s.course_id,
        batch_name: batchMap[s.batch_id] || s.batch_id
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename=Students_Report.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('[STUDENT EXPORT ERROR]', error);
    return res.status(500).json({ success: false, message: 'Failed to export students' });
  }
};

