const excelService = require('../services/excelService');

exports.getAllCourses = async (req, res) => {
  try {
    const { status, search } = req.query;
    let courses = await excelService.getSheetData('Courses');
    const [batches, students] = await Promise.all([
      excelService.getSheetData('Batches'),
      excelService.getSheetData('Students')
    ]);

    // Attach batch and student statistics
    courses = courses.map((course) => {
      const associatedBatches = batches.filter((b) => b.course_id === course.course_id);
      const enrolledStudents = students.filter(
        (s) => s.course_id === course.course_id && s.student_status !== 'Archived'
      );
      return {
        ...course,
        batchCount: associatedBatches.length,
        studentCount: enrolledStudents.length
      };
    });

    if (search) {
      const q = search.toLowerCase().trim();
      courses = courses.filter(
        (c) =>
          c.course_name.toLowerCase().includes(q) ||
          c.course_id.toLowerCase().includes(q) ||
          (c.technologies_covered && c.technologies_covered.toLowerCase().includes(q))
      );
    }

    if (status) {
      courses = courses.filter((c) => c.course_status && c.course_status.toLowerCase() === status.toLowerCase());
    }

    return res.json({ success: true, count: courses.length, courses });
  } catch (error) {
    console.error('[COURSE GET ALL ERROR]', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve courses' });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await excelService.findById('Courses', id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const [batches, students] = await Promise.all([
      excelService.getSheetData('Batches'),
      excelService.getSheetData('Students')
    ]);

    const associatedBatches = batches.filter((b) => b.course_id === id);
    const enrolledStudents = students.filter((s) => s.course_id === id);

    return res.json({
      success: true,
      course: {
        ...course,
        batches: associatedBatches,
        students: enrolledStudents
      }
    });
  } catch (error) {
    console.error('[COURSE GET BY ID ERROR]', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve course details' });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const { course_name, course_description, duration, technologies_covered, start_date } = req.body;
    if (!course_name) {
      return res.status(400).json({ success: false, message: 'Course name is required' });
    }

    const newCourse = await excelService.insert('Courses', {
      course_name: course_name.trim(),
      course_description: course_description || '',
      duration: duration || '3 Months',
      technologies_covered: technologies_covered || '',
      start_date: start_date || new Date().toISOString().split('T')[0],
      course_status: 'Active'
    });

    return res.status(201).json({ success: true, message: 'Course created successfully', course: newCourse });
  } catch (error) {
    console.error('[COURSE CREATE ERROR]', error);
    return res.status(500).json({ success: false, message: 'Failed to create course' });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await excelService.findById('Courses', id);
    if (!existing) return res.status(404).json({ success: false, message: 'Course not found' });

    const updates = { ...req.body };
    delete updates.course_id;

    const updated = await excelService.update('Courses', id, updates);
    return res.json({ success: true, message: 'Course updated successfully', course: updated });
  } catch (error) {
    console.error('[COURSE UPDATE ERROR]', error);
    return res.status(500).json({ success: false, message: 'Failed to update course' });
  }
};

exports.archiveCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await excelService.archive('Courses', id);
    return res.json({ success: true, message: 'Course archived successfully', course: updated });
  } catch (error) {
    console.error('[COURSE ARCHIVE ERROR]', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to archive course' });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    await excelService.delete('Courses', id);
    return res.json({ success: true, message: 'Course permanently deleted successfully' });
  } catch (error) {
    console.error('[COURSE DELETE ERROR]', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to delete course' });
  }
};

