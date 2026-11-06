const excelService = require('../services/excelService');

exports.getAllCompanies = async (req, res) => {
  try {
    const { search, status } = req.query;
    let companies = await excelService.getSheetData('Companies');
    const [requirements, applications] = await Promise.all([
      excelService.getSheetData('Requirements'),
      excelService.getSheetData('Applications')
    ]);

    companies = companies.map((c) => {
      const companyReqs = requirements.filter((r) => r.company_id === c.company_id);
      const companyApps = applications.filter((a) => a.company_id === c.company_id);
      const hires = companyApps.filter((a) => a.result === 'Selected').length;

      return {
        ...c,
        activeRequirementsCount: companyReqs.filter(
          (r) => r.requirement_status === 'Open' || r.requirement_status === 'Applications in Progress'
        ).length,
        totalRequirementsCount: companyReqs.length,
        totalHires: hires
      };
    });

    if (search) {
      const q = search.toLowerCase().trim();
      companies = companies.filter(
        (c) =>
          c.company_name.toLowerCase().includes(q) ||
          (c.industry && c.industry.toLowerCase().includes(q)) ||
          (c.company_location && c.company_location.toLowerCase().includes(q)) ||
          (c.hr_name && c.hr_name.toLowerCase().includes(q))
      );
    }

    if (status) {
      companies = companies.filter((c) => c.status && c.status.toLowerCase() === status.toLowerCase());
    }

    return res.json({ success: true, count: companies.length, companies });
  } catch (error) {
    console.error('[COMPANY GET ALL ERROR]', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve companies' });
  }
};

exports.getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;
    const company = await excelService.findById('Companies', id);
    if (!company) return res.status(404).json({ success: false, message: 'Company not found' });

    const [requirements, applications, followups] = await Promise.all([
      excelService.getSheetData('Requirements'),
      excelService.getSheetData('Applications'),
      excelService.getSheetData('HR_Followups')
    ]);

    const companyReqs = requirements.filter((r) => r.company_id === id);
    const companyApps = applications.filter((a) => a.company_id === id);
    const companyFollowups = followups.filter((f) => f.company_id === id);

    return res.json({
      success: true,
      company: {
        ...company,
        requirements: companyReqs,
        applications: companyApps,
        followups: companyFollowups
      }
    });
  } catch (error) {
    console.error('[COMPANY GET BY ID ERROR]', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve company details' });
  }
};

exports.createCompany = async (req, res) => {
  try {
    const {
      company_name,
      industry,
      company_location,
      hr_name,
      hr_email,
      hr_contact_number,
      company_website,
      notes
    } = req.body;

    if (!company_name) {
      return res.status(400).json({ success: false, message: 'Company name is required' });
    }

    const newCompany = await excelService.insert('Companies', {
      company_name: company_name.trim(),
      industry: industry || '',
      company_location: company_location || '',
      hr_name: hr_name || '',
      hr_email: hr_email || '',
      hr_contact_number: hr_contact_number || '',
      company_website: company_website || '',
      notes: notes || '',
      status: 'Active'
    });

    return res.status(201).json({ success: true, message: 'Company created successfully', company: newCompany });
  } catch (error) {
    console.error('[COMPANY CREATE ERROR]', error);
    return res.status(500).json({ success: false, message: 'Failed to create company' });
  }
};

exports.updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await excelService.findById('Companies', id);
    if (!existing) return res.status(404).json({ success: false, message: 'Company not found' });

    const updates = { ...req.body };
    delete updates.company_id;

    const updated = await excelService.update('Companies', id, updates);
    return res.json({ success: true, message: 'Company updated successfully', company: updated });
  } catch (error) {
    console.error('[COMPANY UPDATE ERROR]', error);
    return res.status(500).json({ success: false, message: 'Failed to update company' });
  }
};

exports.archiveCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await excelService.archive('Companies', id);
    return res.json({ success: true, message: 'Company archived successfully', company: updated });
  } catch (error) {
    console.error('[COMPANY ARCHIVE ERROR]', error);
    return res.status(500).json({ success: false, message: 'Failed to archive company' });
  }
};

exports.restoreCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await excelService.restore('Companies', id, 'Active');
    return res.json({ success: true, message: 'Company restored successfully', company: updated });
  } catch (error) {
    console.error('[COMPANY RESTORE ERROR]', error);
    return res.status(500).json({ success: false, message: 'Failed to restore company' });
  }
};

