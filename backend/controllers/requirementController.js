const excelService = require('../services/excelService');

exports.getAllRequirements = async (req, res) => {
  try {
    const { month, status, companyId, search } = req.query;
    let requirements = await excelService.getSheetData('Requirements');
    const [applications, students] = await Promise.all([
      excelService.getSheetData('Applications'),
      excelService.getSheetData('Students')
    ]);

    const today = new Date().toISOString().split('T')[0];

    requirements = requirements.map((reqItem) => {
      const reqApps = applications.filter((a) => a.requirement_id === reqItem.requirement_id);
      const selected = reqApps.filter((a) => a.result === 'Selected').length;
      const vacancies = parseInt(reqItem.number_of_vacancies, 10) || 0;
      const vacanciesRemaining = Math.max(0, vacancies - selected);

      // Check if deadline passed and not closed
      const isExpired =
        reqItem.application_deadline &&
        reqItem.application_deadline < today &&
        reqItem.requirement_status !== 'Closed' &&
        reqItem.requirement_status !== 'On Hold';

      return {
        ...reqItem,
        appliedCount: reqApps.length,
        selectedCount: selected,
        vacanciesRemaining,
        isExpired
      };
    });

    if (search) {
      const q = search.toLowerCase().trim();
      requirements = requirements.filter(
        (r) =>
          r.job_role.toLowerCase().includes(q) ||
          r.company_name.toLowerCase().includes(q) ||
          r.requirement_id.toLowerCase().includes(q) ||
          (r.required_skills && r.required_skills.toLowerCase().includes(q))
      );
    }

    if (month) {
      requirements = requirements.filter(
        (r) =>
          (r.opening_date && r.opening_date.startsWith(month)) ||
          (r.application_deadline && r.application_deadline.startsWith(month))
      );
    }

    if (status) {
      if (status === 'Expired') {
        requirements = requirements.filter((r) => r.isExpired);
      } else {
        requirements = requirements.filter(
          (r) => r.requirement_status && r.requirement_status.toLowerCase() === status.toLowerCase()
        );
      }
    }

    if (companyId) {
      requirements = requirements.filter((r) => r.company_id === companyId);
    }

    return res.json({ success: true, count: requirements.length, requirements });
  } catch (error) {
    console.error('[REQUIREMENTS GET ALL ERROR]', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve requirements' });
  }
};

exports.getRequirementById = async (req, res) => {
  try {
    const { id } = req.params;
    const requirement = await excelService.findById('Requirements', id);
    if (!requirement) return res.status(404).json({ success: false, message: 'Requirement not found' });

    const [applications, students, company] = await Promise.all([
      excelService.getSheetData('Applications'),
      excelService.getSheetData('Students'),
      excelService.findById('Companies', requirement.company_id)
    ]);

    const reqApps = applications.filter((a) => a.requirement_id === id);
    const selected = reqApps.filter((a) => a.result === 'Selected').length;
    const vacancies = parseInt(requirement.number_of_vacancies, 10) || 0;

    // Determine eligible students in academy
    const eligibleCourseIds = (requirement.eligible_courses || '').split(',').map((c) => c.trim());
    const eligibleStudents = students.filter((s) => {
      const matchesCourse =
        eligibleCourseIds.length === 0 ||
        eligibleCourseIds.includes('') ||
        eligibleCourseIds.includes(s.course_id);
      const isEligible = s.placement_eligibility === 'Eligible';
      const isActive = s.student_status === 'Active';
      return matchesCourse && isEligible && isActive;
    });

    return res.json({
      success: true,
      requirement: {
        ...requirement,
        company,
        applications: reqApps,
        vacanciesRemaining: Math.max(0, vacancies - selected),
        eligibleStudentsCount: eligibleStudents.length,
        eligibleStudents
      }
    });
  } catch (error) {
    console.error('[REQUIREMENT GET BY ID ERROR]', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve requirement details' });
  }
};

exports.createRequirement = async (req, res) => {
  try {
    const {
      company_id,
      job_role,
      job_description,
      required_skills,
      eligibility_criteria,
      qualification,
      experience_requirement,
      number_of_vacancies,
      opening_date,
      application_deadline,
      salary_details,
      eligible_courses,
      eligible_batches,
      requirement_status,
      hr_contact,
      remarks
    } = req.body;

    if (!company_id || !job_role) {
      return res.status(400).json({ success: false, message: 'Company and Job role are required' });
    }

    const company = await excelService.findById('Companies', company_id);
    const company_name = company ? company.company_name : '';

    const newReq = await excelService.insert('Requirements', {
      company_id,
      company_name,
      job_role: job_role.trim(),
      job_description: job_description || '',
      required_skills: required_skills || '',
      eligibility_criteria: eligibility_criteria || '',
      qualification: qualification || '',
      experience_requirement: experience_requirement || 'Fresher',
      number_of_vacancies: parseInt(number_of_vacancies, 10) || 1,
      opening_date: opening_date || new Date().toISOString().split('T')[0],
      application_deadline: application_deadline || '',
      salary_details: salary_details || '',
      eligible_courses: eligible_courses || '',
      eligible_batches: eligible_batches || '',
      requirement_status: requirement_status || 'Open',
      hr_contact: hr_contact || (company ? `${company.hr_name} (${company.hr_email})` : ''),
      remarks: remarks || ''
    });

    return res.status(201).json({ success: true, message: 'Requirement created successfully', requirement: newReq });
  } catch (error) {
    console.error('[REQUIREMENT CREATE ERROR]', error);
    return res.status(500).json({ success: false, message: 'Failed to create requirement' });
  }
};

exports.updateRequirement = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await excelService.findById('Requirements', id);
    if (!existing) return res.status(404).json({ success: false, message: 'Requirement not found' });

    const updates = { ...req.body };
    delete updates.requirement_id;

    if (updates.company_id && updates.company_id !== existing.company_id) {
      const comp = await excelService.findById('Companies', updates.company_id);
      if (comp) updates.company_name = comp.company_name;
    }

    const updated = await excelService.update('Requirements', id, updates);
    return res.json({ success: true, message: 'Requirement updated successfully', requirement: updated });
  } catch (error) {
    console.error('[REQUIREMENT UPDATE ERROR]', error);
    return res.status(500).json({ success: false, message: 'Failed to update requirement' });
  }
};

