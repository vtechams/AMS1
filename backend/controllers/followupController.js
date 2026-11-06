const excelService = require('../services/excelService');

exports.getAllFollowups = async (req, res) => {
  try {
    const { requirementId, companyId, status, overdueOnly } = req.query;
    let followups = await excelService.getSheetData('HR_Followups');

    const today = new Date().toISOString().split('T')[0];

    // Compute overdue flag dynamically
    followups = followups.map((f) => {
      const isOverdue =
        f.status !== 'Completed' &&
        f.next_followup_date &&
        f.next_followup_date < today;

      return {
        ...f,
        isOverdue: isOverdue || f.status === 'Overdue'
      };
    });

    if (requirementId) {
      followups = followups.filter((f) => f.requirement_id === requirementId);
    }
    if (companyId) {
      followups = followups.filter((f) => f.company_id === companyId);
    }
    if (status) {
      followups = followups.filter((f) => f.status && f.status.toLowerCase() === status.toLowerCase());
    }
    if (overdueOnly === 'true') {
      followups = followups.filter((f) => f.isOverdue);
    }

    return res.json({ success: true, count: followups.length, followups });
  } catch (error) {
    console.error('[FOLLOWUP GET ALL ERROR]', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve follow-ups' });
  }
};

exports.createFollowup = async (req, res) => {
  try {
    const {
      requirement_id,
      company_id,
      hr_contact,
      followup_date,
      followup_method,
      discussion_summary,
      hr_response,
      next_followup_date,
      responsible_person,
      status
    } = req.body;

    if (!requirement_id || !discussion_summary) {
      return res.status(400).json({
        success: false,
        message: 'Requirement and discussion summary are required'
      });
    }

    let company_name = '';
    let finalCompanyId = company_id;

    const requirement = await excelService.findById('Requirements', requirement_id);
    if (requirement) {
      finalCompanyId = requirement.company_id;
      company_name = requirement.company_name;
    }

    const newFollowup = await excelService.insert('HR_Followups', {
      requirement_id,
      company_id: finalCompanyId || '',
      company_name,
      hr_contact: hr_contact || (requirement ? requirement.hr_contact : ''),
      followup_date: followup_date || new Date().toISOString().split('T')[0],
      followup_method: followup_method || 'Call',
      discussion_summary: discussion_summary.trim(),
      hr_response: hr_response || '',
      next_followup_date: next_followup_date || '',
      responsible_person: responsible_person || 'Admin',
      status: status || 'Pending'
    });

    return res.status(201).json({
      success: true,
      message: 'HR follow-up recorded successfully',
      followup: newFollowup
    });
  } catch (error) {
    console.error('[FOLLOWUP CREATE ERROR]', error);
    return res.status(500).json({ success: false, message: 'Failed to record follow-up' });
  }
};

exports.updateFollowup = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await excelService.findById('HR_Followups', id);
    if (!existing) return res.status(404).json({ success: false, message: 'Follow-up not found' });

    const updates = { ...req.body };
    delete updates.followup_id;

    const updated = await excelService.update('HR_Followups', id, updates);
    return res.json({ success: true, message: 'Follow-up updated successfully', followup: updated });
  } catch (error) {
    console.error('[FOLLOWUP UPDATE ERROR]', error);
    return res.status(500).json({ success: false, message: 'Failed to update follow-up' });
  }
};

