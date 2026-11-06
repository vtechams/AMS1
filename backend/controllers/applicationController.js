const excelService = require('../services/excelService');

exports.getAllApplications = async (req, res) => {
  try {
    const { studentId, requirementId, companyId, result, search } = req.query;
    let applications = await excelService.getSheetData('Applications');

    if (studentId) {
      applications = applications.filter((a) => a.student_id === studentId);
    }
    if (requirementId) {
      applications = applications.filter((a) => a.requirement_id === requirementId);
    }
    if (companyId) {
      applications = applications.filter((a) => a.company_id === companyId);
    }
    if (result) {
      applications = applications.filter((a) => a.result && a.result.toLowerCase() === result.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase().trim();
      applications = applications.filter(
        (a) =>
          a.student_name.toLowerCase().includes(q) ||
          a.company_name.toLowerCase().includes(q) ||
          a.job_role.toLowerCase().includes(q) ||
          a.application_id.toLowerCase().includes(q) ||
          a.student_id.toLowerCase().includes(q)
      );
    }

    return res.json({ success: true, count: applications.length, applications });
  } catch (error) {
    console.error('[APPLICATIONS GET ALL ERROR]', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve applications' });
  }
};

exports.getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await excelService.findById('Applications', id);
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    const [student, requirement, company] = await Promise.all([
      excelService.findById('Students', application.student_id),
      excelService.findById('Requirements', application.requirement_id),
      excelService.findById('Companies', application.company_id)
    ]);

    return res.json({
      success: true,
      application: {
        ...application,
        student,
        requirement,
        company
      }
    });
  } catch (error) {
    console.error('[APPLICATION GET BY ID ERROR]', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve application details' });
  }
};

// Apply student to a requirement
exports.createApplication = async (req, res) => {
  try {
    const { student_id, requirement_id, resume_submission_status, remarks } = req.body;
    if (!student_id || !requirement_id) {
      return res.status(400).json({ success: false, message: 'Student ID and Requirement ID are required' });
    }

    const [student, requirement] = await Promise.all([
      excelService.findById('Students', student_id),
      excelService.findById('Requirements', requirement_id)
    ]);

    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    if (!requirement) return res.status(404).json({ success: false, message: 'Requirement not found' });

    // Check if student already applied to this requirement
    const existing = await excelService.getSheetData('Applications');
    const duplicate = existing.find(
      (a) => a.student_id === student_id && a.requirement_id === requirement_id
    );
    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: 'This student has already applied for this requirement.'
      });
    }

    const newApp = await excelService.insert('Applications', {
      student_id,
      student_name: student.full_name,
      company_id: requirement.company_id,
      company_name: requirement.company_name,
      requirement_id,
      job_role: requirement.job_role,
      application_date: new Date().toISOString().split('T')[0],
      resume_submission_status: resume_submission_status || 'Submitted',
      interview_date: '',
      interview_round: 'Screening',
      interview_attendance: 'Pending',
      hr_feedback: '',
      result: 'Applied',
      follow_up_date: '',
      remarks: remarks || ''
    });

    return res.status(201).json({ success: true, message: 'Application submitted successfully', application: newApp });
  } catch (error) {
    console.error('[APPLICATION CREATE ERROR]', error);
    return res.status(500).json({ success: false, message: 'Failed to create application' });
  }
};

// Update application workflow status
exports.updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await excelService.findById('Applications', id);
    if (!existing) return res.status(404).json({ success: false, message: 'Application not found' });

    const updates = { ...req.body };
    delete updates.application_id;

    const updated = await excelService.update('Applications', id, updates);

    // If result changed to 'Selected', update student status to 'Placed' if student still exists
    if (updates.result === 'Selected' && existing.student_id) {
      try {
        const student = await excelService.findById('Students', existing.student_id);
        if (student) {
          await excelService.update('Students', existing.student_id, {
            student_status: 'Placed'
          });
        }
      } catch (err) {
        console.warn('[AUTO-UPDATE STUDENT STATUS TO PLACED]', err.message);
      }
    }

    return res.json({ success: true, message: 'Application updated successfully', application: updated });
  } catch (error) {
    console.error('[APPLICATION UPDATE ERROR]', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to update application' });
  }
};

// Permanently delete an application
exports.deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;
    await excelService.delete('Applications', id);
    return res.json({ success: true, message: 'Application deleted successfully' });
  } catch (error) {
    console.error('[APPLICATION DELETE ERROR]', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to delete application' });
  }
};

