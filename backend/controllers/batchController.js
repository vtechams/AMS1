const excelService = require('../services/excelService');

exports.getAllBatches = async (req, res) => {
  try {
    const { status, courseId, search } = req.query;
    let batches = await excelService.getSheetData('Batches');
    const [courses, students] = await Promise.all([
      excelService.getSheetData('Courses'),
      excelService.getSheetData('Students')
    ]);

    const courseMap = {};
    courses.forEach((c) => (courseMap[c.course_id] = c.course_name));

    batches = batches.map((batch) => {
      const batchStudents = students.filter(
        (s) => s.batch_id === batch.batch_id && s.student_status !== 'Archived'
      );
      return {
        ...batch,
        course_name: courseMap[batch.course_id] || batch.course_id,
        totalStudents: batchStudents.length
      };
    });

    if (search) {
      const q = search.toLowerCase().trim();
      batches = batches.filter(
        (b) =>
          b.batch_name.toLowerCase().includes(q) ||
          b.batch_id.toLowerCase().includes(q) ||
          (b.trainer_name && b.trainer_name.toLowerCase().includes(q))
      );
    }

    if (status) {
      batches = batches.filter((b) => b.batch_status && b.batch_status.toLowerCase() === status.toLowerCase());
    }

    if (courseId) {
      batches = batches.filter((b) => b.course_id === courseId);
    }

    return res.json({ success: true, count: batches.length, batches });
  } catch (error) {
    console.error('[BATCH GET ALL ERROR]', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve batches' });
  }
};

exports.getBatchById = async (req, res) => {
  try {
    const { id } = req.params;
    const batch = await excelService.findById('Batches', id);
    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });

    const [courses, students, attendance] = await Promise.all([
      excelService.getSheetData('Courses'),
      excelService.getSheetData('Students'),
      excelService.getSheetData('Attendance')
    ]);

    const course = courses.find((c) => c.course_id === batch.course_id) || null;
    const enrolledStudents = students.filter((s) => s.batch_id === id);
    const batchAttendance = attendance.filter((a) => a.batch_id === id);

    // Calculate attendance percentage for this batch
    const totalRecords = batchAttendance.length;
    const presentRecords = batchAttendance.filter((a) => a.attendance_status === 'Present').length;
    const batchAttendanceRate = totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0;

    return res.json({
      success: true,
      batch: {
        ...batch,
        course,
        students: enrolledStudents,
        stats: {
          totalStudents: enrolledStudents.length,
          totalAttendanceDays: new Set(batchAttendance.map((a) => a.attendance_date)).size,
          batchAttendanceRate
        }
      }
    });
  } catch (error) {
    console.error('[BATCH GET BY ID ERROR]', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve batch details' });
  }
};

exports.createBatch = async (req, res) => {
  try {
    const { batch_name, course_id, trainer_name, start_date, end_date } = req.body;
    if (!batch_name || !course_id) {
      return res.status(400).json({ success: false, message: 'Batch name and Course are required' });
    }

    const newBatch = await excelService.insert('Batches', {
      batch_name: batch_name.trim(),
      course_id,
      trainer_name: trainer_name || '',
      start_date: start_date || new Date().toISOString().split('T')[0],
      end_date: end_date || '',
      batch_status: 'Active'
    });

    return res.status(201).json({ success: true, message: 'Batch created successfully', batch: newBatch });
  } catch (error) {
    console.error('[BATCH CREATE ERROR]', error);
    return res.status(500).json({ success: false, message: 'Failed to create batch' });
  }
};

exports.updateBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await excelService.findById('Batches', id);
    if (!existing) return res.status(404).json({ success: false, message: 'Batch not found' });

    const updates = { ...req.body };
    delete updates.batch_id;

    const updated = await excelService.update('Batches', id, updates);
    return res.json({ success: true, message: 'Batch updated successfully', batch: updated });
  } catch (error) {
    console.error('[BATCH UPDATE ERROR]', error);
    return res.status(500).json({ success: false, message: 'Failed to update batch' });
  }
};

// Transfer student between batches
exports.transferStudent = async (req, res) => {
  try {
    const { student_id, new_batch_id, new_course_id, remarks } = req.body;
    if (!student_id || !new_batch_id) {
      return res.status(400).json({ success: false, message: 'Student ID and target Batch ID are required' });
    }

    const student = await excelService.findById('Students', student_id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const newBatch = await excelService.findById('Batches', new_batch_id);
    if (!newBatch) return res.status(404).json({ success: false, message: 'Target batch not found' });

    const courseId = new_course_id || newBatch.course_id;

    // Update student's batch and course
    await excelService.update('Students', student_id, {
      batch_id: new_batch_id,
      course_id: courseId
    });

    // Record new enrollment record
    await excelService.insert('Enrollments', {
      student_id,
      course_id: courseId,
      batch_id: new_batch_id,
      enrollment_date: new Date().toISOString().split('T')[0],
      enrollment_status: 'Transferred'
    });

    return res.json({
      success: true,
      message: `Student ${student.full_name} successfully transferred to ${newBatch.batch_name}`
    });
  } catch (error) {
    console.error('[BATCH TRANSFER STUDENT ERROR]', error);
    return res.status(500).json({ success: false, message: 'Failed to transfer student' });
  }
};

exports.deleteBatch = async (req, res) => {
  try {
    const { id } = req.params;
    await excelService.delete('Batches', id);
    return res.json({ success: true, message: 'Batch permanently deleted successfully' });
  } catch (error) {
    console.error('[BATCH DELETE ERROR]', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to delete batch' });
  }
};

