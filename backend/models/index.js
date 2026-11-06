const mongoose = require('mongoose');

// 1. Admin Schema
const AdminSchema = new mongoose.Schema(
  {
    admin_id: { type: String, required: true, unique: true },
    full_name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password_hash: { type: String, required: true },
    role: { type: String, default: 'SuperAdmin' },
    status: { type: String, default: 'Active' },
    last_login: { type: String, default: '' },
    created_at: { type: String },
    updated_at: { type: String }
  },
  { timestamps: { createdAt: 'created_at_dt', updatedAt: 'updated_at_dt' } }
);

// 2. Student Schema
const StudentSchema = new mongoose.Schema(
  {
    student_id: { type: String, required: true, unique: true },
    full_name: { type: String, required: true },
    email: { type: String, default: '' },
    phone_number: { type: String, default: '' },
    address: { type: String, default: '' },
    admission_category: { type: String, default: 'Training Admission' },
    course_id: { type: String, default: '' },
    batch_id: { type: String, default: '' },
    admission_date: { type: String, default: '' },
    educational_qualification: { type: String, default: '' },
    training_status: { type: String, default: 'Active' },
    placement_eligibility: { type: String, default: 'Pending Evaluation' },
    student_status: { type: String, default: 'Active' },
    notes: { type: String, default: '' },
    created_at: { type: String },
    updated_at: { type: String }
  },
  { timestamps: { createdAt: 'created_at_dt', updatedAt: 'updated_at_dt' } }
);

// 3. Course Schema
const CourseSchema = new mongoose.Schema(
  {
    course_id: { type: String, required: true, unique: true },
    course_name: { type: String, required: true },
    course_description: { type: String, default: '' },
    duration: { type: String, default: '3 Months' },
    technologies_covered: { type: String, default: '' },
    start_date: { type: String, default: '' },
    course_status: { type: String, default: 'Active' },
    created_at: { type: String },
    updated_at: { type: String }
  },
  { timestamps: { createdAt: 'created_at_dt', updatedAt: 'updated_at_dt' } }
);

// 4. Batch Schema
const BatchSchema = new mongoose.Schema(
  {
    batch_id: { type: String, required: true, unique: true },
    batch_name: { type: String, required: true },
    course_id: { type: String, default: '' },
    trainer_name: { type: String, default: '' },
    start_date: { type: String, default: '' },
    end_date: { type: String, default: '' },
    batch_status: { type: String, default: 'Active' },
    created_at: { type: String },
    updated_at: { type: String }
  },
  { timestamps: { createdAt: 'created_at_dt', updatedAt: 'updated_at_dt' } }
);

// 5. Enrollment Schema
const EnrollmentSchema = new mongoose.Schema(
  {
    enrollment_id: { type: String, required: true, unique: true },
    student_id: { type: String, required: true },
    course_id: { type: String, default: '' },
    batch_id: { type: String, default: '' },
    enrollment_date: { type: String, default: '' },
    enrollment_status: { type: String, default: 'Enrolled' },
    created_at: { type: String },
    updated_at: { type: String }
  },
  { timestamps: { createdAt: 'created_at_dt', updatedAt: 'updated_at_dt' } }
);

// 6. Company Schema
const CompanySchema = new mongoose.Schema(
  {
    company_id: { type: String, required: true, unique: true },
    company_name: { type: String, required: true },
    industry: { type: String, default: '' },
    company_location: { type: String, default: '' },
    hr_name: { type: String, default: '' },
    hr_email: { type: String, default: '' },
    hr_contact_number: { type: String, default: '' },
    company_website: { type: String, default: '' },
    notes: { type: String, default: '' },
    status: { type: String, default: 'Active' },
    created_at: { type: String },
    updated_at: { type: String }
  },
  { timestamps: { createdAt: 'created_at_dt', updatedAt: 'updated_at_dt' } }
);

// 7. Requirement Schema
const RequirementSchema = new mongoose.Schema(
  {
    requirement_id: { type: String, required: true, unique: true },
    company_id: { type: String, required: true },
    company_name: { type: String, default: '' },
    job_role: { type: String, required: true },
    job_description: { type: String, default: '' },
    required_skills: { type: String, default: '' },
    eligibility_criteria: { type: String, default: '' },
    qualification: { type: String, default: '' },
    experience_requirement: { type: String, default: '' },
    number_of_vacancies: { type: mongoose.Schema.Types.Mixed, default: 1 },
    opening_date: { type: String, default: '' },
    application_deadline: { type: String, default: '' },
    salary_details: { type: String, default: '' },
    eligible_courses: { type: String, default: '' },
    eligible_batches: { type: String, default: '' },
    requirement_status: { type: String, default: 'Open' },
    hr_contact: { type: String, default: '' },
    remarks: { type: String, default: '' },
    created_at: { type: String },
    updated_at: { type: String }
  },
  { timestamps: { createdAt: 'created_at_dt', updatedAt: 'updated_at_dt' } }
);

// 8. Application Schema
const ApplicationSchema = new mongoose.Schema(
  {
    application_id: { type: String, required: true, unique: true },
    student_id: { type: String, required: true },
    student_name: { type: String, default: '' },
    company_id: { type: String, default: '' },
    company_name: { type: String, default: '' },
    requirement_id: { type: String, default: '' },
    job_role: { type: String, default: '' },
    application_date: { type: String, default: '' },
    resume_submission_status: { type: String, default: 'Submitted' },
    interview_date: { type: String, default: '' },
    interview_round: { type: String, default: 'Round 1' },
    interview_attendance: { type: String, default: 'Pending' },
    hr_feedback: { type: String, default: '' },
    result: { type: String, default: 'Applied' },
    follow_up_date: { type: String, default: '' },
    remarks: { type: String, default: '' },
    created_at: { type: String },
    updated_at: { type: String }
  },
  { timestamps: { createdAt: 'created_at_dt', updatedAt: 'updated_at_dt' } }
);

// 9. Attendance Schema
const AttendanceSchema = new mongoose.Schema(
  {
    attendance_id: { type: String, required: true, unique: true },
    student_id: { type: String, required: true },
    batch_id: { type: String, required: true },
    attendance_date: { type: String, required: true },
    attendance_status: { type: String, default: 'Present' },
    remarks: { type: String, default: '' },
    created_at: { type: String },
    updated_at: { type: String }
  },
  { timestamps: { createdAt: 'created_at_dt', updatedAt: 'updated_at_dt' } }
);

// 10. HR Followup Schema
const HRFollowupSchema = new mongoose.Schema(
  {
    followup_id: { type: String, required: true, unique: true },
    requirement_id: { type: String, default: '' },
    company: { type: String, default: '' },
    hr_contact: { type: String, default: '' },
    followup_date: { type: String, default: '' },
    followup_method: { type: String, default: 'Call' },
    discussion_summary: { type: String, default: '' },
    hr_response: { type: String, default: '' },
    next_followup_date: { type: String, default: '' },
    responsible_person: { type: String, default: 'Admin' },
    status: { type: String, default: 'Pending' },
    created_at: { type: String },
    updated_at: { type: String }
  },
  { timestamps: { createdAt: 'created_at_dt', updatedAt: 'updated_at_dt' } }
);

module.exports = {
  Admin: mongoose.models.Admin || mongoose.model('Admin', AdminSchema),
  Students: mongoose.models.Students || mongoose.model('Students', StudentSchema),
  Courses: mongoose.models.Courses || mongoose.model('Courses', CourseSchema),
  Batches: mongoose.models.Batches || mongoose.model('Batches', BatchSchema),
  Enrollments: mongoose.models.Enrollments || mongoose.model('Enrollments', EnrollmentSchema),
  Companies: mongoose.models.Companies || mongoose.model('Companies', CompanySchema),
  Requirements: mongoose.models.Requirements || mongoose.model('Requirements', RequirementSchema),
  Applications: mongoose.models.Applications || mongoose.model('Applications', ApplicationSchema),
  Attendance: mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema),
  HR_Followups: mongoose.models.HR_Followups || mongoose.model('HR_Followups', HRFollowupSchema)
};

