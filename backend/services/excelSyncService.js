const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const config = require('../config/config');
const models = require('../models');

class ExcelSyncService {
  constructor() {
    this.dbPath = config.DB_PATH;
    this.dbDir = config.DB_DIR;
    this.backupDir = config.BACKUP_DIR;
    this.syncInProgress = false;
    this.pendingSync = false;

    this.ensureDirs();
  }

  ensureDirs() {
    if (process.env.VERCEL) return;
    if (!fs.existsSync(this.dbDir)) fs.mkdirSync(this.dbDir, { recursive: true });
    if (!fs.existsSync(this.backupDir)) fs.mkdirSync(this.backupDir, { recursive: true });
  }

  // Common styling for worksheets
  applySheetStyles(sheet) {
    const headerRow = sheet.getRow(1);
    headerRow.height = 28;
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E293B' } // slate-800
      };
      cell.font = {
        name: 'Calibri',
        size: 11,
        bold: true,
        color: { argb: 'FFFFFFFF' }
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };
    });

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.height = 22;
        row.eachCell((cell) => {
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
          };
        });
      }
    });

    sheet.columns.forEach((col) => {
      let maxLen = 14;
      col.eachCell({ includeEmpty: true }, (cell) => {
        const val = cell.value ? cell.value.toString() : '';
        if (val.length > maxLen) maxLen = Math.min(val.length + 4, 45);
      });
      col.width = maxLen;
    });
  }

  // Build complete multi-sheet workbook from MongoDB Atlas data
  async buildWorkbook() {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Academy Management System (AMS)';
    workbook.created = new Date();
    workbook.modified = new Date();

    // 1. Students
    const studentsSheet = workbook.addWorksheet('Students');
    studentsSheet.columns = [
      { header: 'Student ID', key: 'student_id' },
      { header: 'Full Name', key: 'full_name' },
      { header: 'Email', key: 'email' },
      { header: 'Phone Number', key: 'phone_number' },
      { header: 'Address', key: 'address' },
      { header: 'Admission Category', key: 'admission_category' },
      { header: 'Course ID', key: 'course_id' },
      { header: 'Batch ID', key: 'batch_id' },
      { header: 'Admission Date', key: 'admission_date' },
      { header: 'Educational Qualification', key: 'educational_qualification' },
      { header: 'Training Status', key: 'training_status' },
      { header: 'Placement Eligibility', key: 'placement_eligibility' },
      { header: 'Student Status', key: 'student_status' },
      { header: 'Notes', key: 'notes' },
      { header: 'Created At', key: 'created_at' },
      { header: 'Updated At', key: 'updated_at' }
    ];
    const students = await models.Students.find({}).lean();
    students.forEach((s) => studentsSheet.addRow(s));
    this.applySheetStyles(studentsSheet);

    // 2. Courses
    const coursesSheet = workbook.addWorksheet('Courses');
    coursesSheet.columns = [
      { header: 'Course ID', key: 'course_id' },
      { header: 'Course Name', key: 'course_name' },
      { header: 'Course Description', key: 'course_description' },
      { header: 'Duration', key: 'duration' },
      { header: 'Technologies Covered', key: 'technologies_covered' },
      { header: 'Start Date', key: 'start_date' },
      { header: 'Course Status', key: 'course_status' },
      { header: 'Created At', key: 'created_at' },
      { header: 'Updated At', key: 'updated_at' }
    ];
    const courses = await models.Courses.find({}).lean();
    courses.forEach((c) => coursesSheet.addRow(c));
    this.applySheetStyles(coursesSheet);

    // 3. Batches
    const batchesSheet = workbook.addWorksheet('Batches');
    batchesSheet.columns = [
      { header: 'Batch ID', key: 'batch_id' },
      { header: 'Batch Name', key: 'batch_name' },
      { header: 'Course ID', key: 'course_id' },
      { header: 'Trainer Name', key: 'trainer_name' },
      { header: 'Start Date', key: 'start_date' },
      { header: 'End Date', key: 'end_date' },
      { header: 'Batch Status', key: 'batch_status' },
      { header: 'Created At', key: 'created_at' },
      { header: 'Updated At', key: 'updated_at' }
    ];
    const batches = await models.Batches.find({}).lean();
    batches.forEach((b) => batchesSheet.addRow(b));
    this.applySheetStyles(batchesSheet);

    // 4. Enrollments
    const enrollmentsSheet = workbook.addWorksheet('Enrollments');
    enrollmentsSheet.columns = [
      { header: 'Enrollment ID', key: 'enrollment_id' },
      { header: 'Student ID', key: 'student_id' },
      { header: 'Course ID', key: 'course_id' },
      { header: 'Batch ID', key: 'batch_id' },
      { header: 'Enrollment Date', key: 'enrollment_date' },
      { header: 'Enrollment Status', key: 'enrollment_status' },
      { header: 'Created At', key: 'created_at' },
      { header: 'Updated At', key: 'updated_at' }
    ];
    const enrollments = await models.Enrollments.find({}).lean();
    enrollments.forEach((e) => enrollmentsSheet.addRow(e));
    this.applySheetStyles(enrollmentsSheet);

    // 5. Companies
    const companiesSheet = workbook.addWorksheet('Companies');
    companiesSheet.columns = [
      { header: 'Company ID', key: 'company_id' },
      { header: 'Company Name', key: 'company_name' },
      { header: 'Industry', key: 'industry' },
      { header: 'Company Location', key: 'company_location' },
      { header: 'HR Name', key: 'hr_name' },
      { header: 'HR Email', key: 'hr_email' },
      { header: 'HR Contact Number', key: 'hr_contact_number' },
      { header: 'Company Website', key: 'company_website' },
      { header: 'Notes', key: 'notes' },
      { header: 'Status', key: 'status' },
      { header: 'Created At', key: 'created_at' },
      { header: 'Updated At', key: 'updated_at' }
    ];
    const companies = await models.Companies.find({}).lean();
    companies.forEach((cp) => companiesSheet.addRow(cp));
    this.applySheetStyles(companiesSheet);

    // 6. Requirements
    const reqSheet = workbook.addWorksheet('Requirements');
    reqSheet.columns = [
      { header: 'Requirement ID', key: 'requirement_id' },
      { header: 'Company ID', key: 'company_id' },
      { header: 'Company Name', key: 'company_name' },
      { header: 'Job Role', key: 'job_role' },
      { header: 'Job Description', key: 'job_description' },
      { header: 'Required Skills', key: 'required_skills' },
      { header: 'Eligibility Criteria', key: 'eligibility_criteria' },
      { header: 'Qualification', key: 'qualification' },
      { header: 'Experience Requirement', key: 'experience_requirement' },
      { header: 'Number of Vacancies', key: 'number_of_vacancies' },
      { header: 'Opening Date', key: 'opening_date' },
      { header: 'Application Deadline', key: 'application_deadline' },
      { header: 'Salary Details', key: 'salary_details' },
      { header: 'Eligible Courses', key: 'eligible_courses' },
      { header: 'Eligible Batches', key: 'eligible_batches' },
      { header: 'Requirement Status', key: 'requirement_status' },
      { header: 'HR Contact', key: 'hr_contact' },
      { header: 'Remarks', key: 'remarks' },
      { header: 'Created At', key: 'created_at' },
      { header: 'Updated At', key: 'updated_at' }
    ];
    const reqs = await models.Requirements.find({}).lean();
    reqs.forEach((r) => reqSheet.addRow(r));
    this.applySheetStyles(reqSheet);

    // 7. Applications
    const appsSheet = workbook.addWorksheet('Applications');
    appsSheet.columns = [
      { header: 'Application ID', key: 'application_id' },
      { header: 'Student ID', key: 'student_id' },
      { header: 'Student Name', key: 'student_name' },
      { header: 'Company ID', key: 'company_id' },
      { header: 'Company Name', key: 'company_name' },
      { header: 'Requirement ID', key: 'requirement_id' },
      { header: 'Job Role', key: 'job_role' },
      { header: 'Application Date', key: 'application_date' },
      { header: 'Resume Submission Status', key: 'resume_submission_status' },
      { header: 'Interview Date', key: 'interview_date' },
      { header: 'Interview Round', key: 'interview_round' },
      { header: 'Interview Attendance', key: 'interview_attendance' },
      { header: 'HR Feedback', key: 'hr_feedback' },
      { header: 'Result', key: 'result' },
      { header: 'Follow-up Date', key: 'follow_up_date' },
      { header: 'Remarks', key: 'remarks' },
      { header: 'Created At', key: 'created_at' },
      { header: 'Updated At', key: 'updated_at' }
    ];
    const apps = await models.Applications.find({}).lean();
    apps.forEach((a) => appsSheet.addRow(a));
    this.applySheetStyles(appsSheet);

    // 8. Attendance
    const attSheet = workbook.addWorksheet('Attendance');
    attSheet.columns = [
      { header: 'Attendance ID', key: 'attendance_id' },
      { header: 'Student ID', key: 'student_id' },
      { header: 'Batch ID', key: 'batch_id' },
      { header: 'Attendance Date', key: 'attendance_date' },
      { header: 'Attendance Status', key: 'attendance_status' },
      { header: 'Remarks', key: 'remarks' },
      { header: 'Created At', key: 'created_at' },
      { header: 'Updated At', key: 'updated_at' }
    ];
    const att = await models.Attendance.find({}).lean();
    att.forEach((at) => attSheet.addRow(at));
    this.applySheetStyles(attSheet);

    // 9. HR_Followups
    const flwSheet = workbook.addWorksheet('HR_Followups');
    flwSheet.columns = [
      { header: 'Follow-up ID', key: 'followup_id' },
      { header: 'Requirement ID', key: 'requirement_id' },
      { header: 'Company ID', key: 'company_id' },
      { header: 'Company Name', key: 'company_name' },
      { header: 'HR Contact', key: 'hr_contact' },
      { header: 'Follow-up Date', key: 'followup_date' },
      { header: 'Follow-up Method', key: 'followup_method' },
      { header: 'Discussion Summary', key: 'discussion_summary' },
      { header: 'HR Response', key: 'hr_response' },
      { header: 'Next Follow-up Date', key: 'next_followup_date' },
      { header: 'Responsible Person', key: 'responsible_person' },
      { header: 'Status', key: 'status' },
      { header: 'Created At', key: 'created_at' },
      { header: 'Updated At', key: 'updated_at' }
    ];
    const flws = await models.HR_Followups.find({}).lean();
    flws.forEach((f) => flwSheet.addRow(f));
    this.applySheetStyles(flwSheet);

    // 10. Admin
    const adminSheet = workbook.addWorksheet('Admin');
    adminSheet.columns = [
      { header: 'Admin ID', key: 'admin_id' },
      { header: 'Full Name', key: 'full_name' },
      { header: 'Email', key: 'email' },
      { header: 'Role', key: 'role' },
      { header: 'Status', key: 'status' },
      { header: 'Last Login', key: 'last_login' },
      { header: 'Created At', key: 'created_at' },
      { header: 'Updated At', key: 'updated_at' }
    ];
    const admins = await models.Admin.find({}, '-password_hash').lean();
    admins.forEach((ad) => adminSheet.addRow(ad));
    this.applySheetStyles(adminSheet);

    return workbook;
  }

  // Sync to disk file Academy_Database.xlsx
  async syncToDisk() {
    if (process.env.VERCEL) {
      // In Vercel serverless environment, local filesystem is read-only.
      // Master data is in MongoDB Atlas, and exports are generated on the fly via streamFullWorkbook.
      return;
    }

    if (this.syncInProgress) {
      this.pendingSync = true;
      return;
    }

    this.syncInProgress = true;
    try {
      const workbook = await this.buildWorkbook();
      await workbook.xlsx.writeFile(this.dbPath);
      console.log(`[EXCEL SYNC] Synchronized latest database to: ${this.dbPath}`);
    } catch (err) {
      if (err.code === 'EBUSY' || err.code === 'EPERM') {
        console.warn('[EXCEL SYNC] Notice: Excel file is currently open in Microsoft Excel. Background sync will retry.');
      } else {
        console.error('[EXCEL SYNC ERROR]', err.message);
      }
    } finally {
      this.syncInProgress = false;
      if (this.pendingSync) {
        this.pendingSync = false;
        setTimeout(() => this.syncToDisk(), 1000);
      }
    }
  }

  // Trigger non-blocking async sync
  triggerSync() {
    setImmediate(() => {
      this.syncToDisk().catch(() => {});
    });
  }

  // Stream full workbook directly to HTTP response
  async streamFullWorkbook(res) {
    const workbook = await this.buildWorkbook();
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `Academy_Database_Complete_${timestamp}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    await workbook.xlsx.write(res);
    res.end();
  }
}

module.exports = new ExcelSyncService();

