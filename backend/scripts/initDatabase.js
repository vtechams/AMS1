const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const DB_DIR = path.resolve(__dirname, '../../database');
const DB_PATH = path.join(DB_DIR, 'Academy_Database.xlsx');
const BACKUP_DIR = path.resolve(__dirname, '../../backups');

async function initializeDatabase(force = false) {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_PATH) && !force) {
    console.log(`[INIT] Database file already exists at: ${DB_PATH}`);
    return;
  }

  console.log(`[INIT] Creating new structured Academy_Database.xlsx workbook...`);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Academy Management System (AMS)';
  workbook.created = new Date();
  workbook.modified = new Date();

  const headerFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E293B' } // slate-800
  };

  const headerFont = {
    name: 'Calibri',
    size: 11,
    bold: true,
    color: { argb: 'FFFFFFFF' }
  };

  const borderStyle = {
    top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
  };

  function applySheetStyles(sheet) {
    const headerRow = sheet.getRow(1);
    headerRow.height = 28;
    headerRow.eachCell((cell) => {
      cell.fill = headerFill;
      cell.font = headerFont;
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = borderStyle;
    });

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.height = 22;
        row.eachCell((cell) => {
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
          cell.border = borderStyle;
        });
      }
    });

    sheet.columns.forEach((col) => {
      let maxLen = 12;
      col.eachCell({ includeEmpty: true }, (cell) => {
        const val = cell.value ? cell.value.toString() : '';
        if (val.length > maxLen) maxLen = Math.min(val.length + 4, 40);
      });
      col.width = maxLen;
    });
  }

  // 1. Students Sheet
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
    { header: 'Created At', key: 'created_at' },
    { header: 'Updated At', key: 'updated_at' }
  ];

  const now = new Date().toISOString();
  studentsSheet.addRows([
    {
      student_id: 'STU-1001',
      full_name: 'Aarav Sharma',
      email: 'aarav.sharma@example.com',
      phone_number: '+91 98765 43210',
      address: 'Plot 42, Green Park, Bangalore',
      admission_category: 'Placement Admission',
      course_id: 'CRS-101',
      batch_id: 'BAT-201',
      admission_date: '2026-08-15',
      educational_qualification: 'B.Tech Computer Science (2025)',
      training_status: 'Completed',
      placement_eligibility: 'Eligible',
      student_status: 'Active',
      created_at: now,
      updated_at: now
    },
    {
      student_id: 'STU-1002',
      full_name: 'Priya Patel',
      email: 'priya.patel@example.com',
      phone_number: '+91 98123 45678',
      address: 'Flat 302, Sunrise Towers, Pune',
      admission_category: 'Training Admission',
      course_id: 'CRS-102',
      batch_id: 'BAT-202',
      admission_date: '2026-09-01',
      educational_qualification: 'B.Sc Information Technology (2026)',
      training_status: 'In Progress',
      placement_eligibility: 'Pending Evaluation',
      student_status: 'Active',
      created_at: now,
      updated_at: now
    },
    {
      student_id: 'STU-1003',
      full_name: 'Rohan Verma',
      email: 'rohan.verma@example.com',
      phone_number: '+91 99887 76655',
      address: '15/B Lake View Road, Hyderabad',
      admission_category: 'Placement Admission',
      course_id: 'CRS-101',
      batch_id: 'BAT-201',
      admission_date: '2026-08-20',
      educational_qualification: 'MCA (2025)',
      training_status: 'Completed',
      placement_eligibility: 'Eligible',
      student_status: 'Placed',
      created_at: now,
      updated_at: now
    },
    {
      student_id: 'STU-1004',
      full_name: 'Sneha Reddy',
      email: 'sneha.reddy@example.com',
      phone_number: '+91 91234 56780',
      address: '7th Cross, Indiranagar, Bangalore',
      admission_category: 'Placement Admission',
      course_id: 'CRS-103',
      batch_id: 'BAT-203',
      admission_date: '2026-09-10',
      educational_qualification: 'B.E Electronics (2025)',
      training_status: 'In Progress',
      placement_eligibility: 'Eligible',
      student_status: 'Active',
      created_at: now,
      updated_at: now
    },
    {
      student_id: 'STU-1005',
      full_name: 'Vikram Joshi',
      email: 'vikram.joshi@example.com',
      phone_number: '+91 97654 32109',
      address: '88 MG Road, Chennai',
      admission_category: 'Training Admission',
      course_id: 'CRS-101',
      batch_id: 'BAT-201',
      admission_date: '2026-08-18',
      educational_qualification: 'BCA (2024)',
      training_status: 'Dropped',
      placement_eligibility: 'Not Eligible',
      student_status: 'Archived',
      created_at: now,
      updated_at: now
    }
  ]);
  applySheetStyles(studentsSheet);

  // 2. Courses Sheet
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

  coursesSheet.addRows([
    {
      course_id: 'CRS-101',
      course_name: 'Full Stack MERN Development',
      course_description: 'End-to-end web development with React, Node.js, Express, MongoDB, and modern architecture.',
      duration: '6 Months',
      technologies_covered: 'React, Node.js, Express, MongoDB, JavaScript, Tailwind CSS, REST APIs',
      start_date: '2026-08-01',
      course_status: 'Active',
      created_at: now,
      updated_at: now
    },
    {
      course_id: 'CRS-102',
      course_name: 'Python Data Science & AI',
      course_description: 'Comprehensive data analysis, machine learning, deep learning, and predictive modeling with Python.',
      duration: '5 Months',
      technologies_covered: 'Python, Pandas, NumPy, Scikit-Learn, TensorFlow, SQL, PowerBI',
      start_date: '2026-09-01',
      course_status: 'Active',
      created_at: now,
      updated_at: now
    },
    {
      course_id: 'CRS-103',
      course_name: 'Cloud & DevOps Engineering',
      course_description: 'Master CI/CD pipelines, Docker, Kubernetes, AWS/GCP, and infrastructure as code.',
      duration: '4 Months',
      technologies_covered: 'Docker, Kubernetes, AWS, Terraform, GitHub Actions, Linux',
      start_date: '2026-09-15',
      course_status: 'Active',
      created_at: now,
      updated_at: now
    },
    {
      course_id: 'CRS-104',
      course_name: 'Java Enterprise Full Stack',
      course_description: 'Enterprise backend development with Spring Boot, Microservices, Hibernate, and Angular/React.',
      duration: '6 Months',
      technologies_covered: 'Java, Spring Boot, Microservices, Hibernate, PostgreSQL, Docker',
      start_date: '2026-10-01',
      course_status: 'Upcoming',
      created_at: now,
      updated_at: now
    }
  ]);
  applySheetStyles(coursesSheet);

  // 3. Batches Sheet
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

  batchesSheet.addRows([
    {
      batch_id: 'BAT-201',
      batch_name: 'MERN Alpha 2026',
      course_id: 'CRS-101',
      trainer_name: 'Karthik Raman',
      start_date: '2026-08-15',
      end_date: '2027-02-15',
      batch_status: 'Active',
      created_at: now,
      updated_at: now
    },
    {
      batch_id: 'BAT-202',
      batch_name: 'Data Sci Beta 2026',
      course_id: 'CRS-102',
      trainer_name: 'Dr. Ananya Sen',
      start_date: '2026-09-01',
      end_date: '2027-02-01',
      batch_status: 'Active',
      created_at: now,
      updated_at: now
    },
    {
      batch_id: 'BAT-203',
      batch_name: 'DevOps Cloud 2026',
      course_id: 'CRS-103',
      trainer_name: 'Rajesh Nair',
      start_date: '2026-09-15',
      end_date: '2027-01-15',
      batch_status: 'Active',
      created_at: now,
      updated_at: now
    }
  ]);
  applySheetStyles(batchesSheet);

  // 4. Enrollments Sheet
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

  enrollmentsSheet.addRows([
    {
      enrollment_id: 'ENR-301',
      student_id: 'STU-1001',
      course_id: 'CRS-101',
      batch_id: 'BAT-201',
      enrollment_date: '2026-08-15',
      enrollment_status: 'Active',
      created_at: now,
      updated_at: now
    },
    {
      enrollment_id: 'ENR-302',
      student_id: 'STU-1002',
      course_id: 'CRS-102',
      batch_id: 'BAT-202',
      enrollment_date: '2026-09-01',
      enrollment_status: 'Active',
      created_at: now,
      updated_at: now
    },
    {
      enrollment_id: 'ENR-303',
      student_id: 'STU-1003',
      course_id: 'CRS-101',
      batch_id: 'BAT-201',
      enrollment_date: '2026-08-20',
      enrollment_status: 'Completed',
      created_at: now,
      updated_at: now
    },
    {
      enrollment_id: 'ENR-304',
      student_id: 'STU-1004',
      course_id: 'CRS-103',
      batch_id: 'BAT-203',
      enrollment_date: '2026-09-10',
      enrollment_status: 'Active',
      created_at: now,
      updated_at: now
    },
    {
      enrollment_id: 'ENR-305',
      student_id: 'STU-1005',
      course_id: 'CRS-101',
      batch_id: 'BAT-201',
      enrollment_date: '2026-08-18',
      enrollment_status: 'Dropped',
      created_at: now,
      updated_at: now
    }
  ]);
  applySheetStyles(enrollmentsSheet);

  // 5. Companies Sheet
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

  companiesSheet.addRows([
    {
      company_id: 'CMP-401',
      company_name: 'NexGen Digital Solutions',
      industry: 'Information Technology & Services',
      company_location: 'Bangalore, India',
      hr_name: 'Meera Nambiar',
      hr_email: 'meera.nambiar@nexgendigital.com',
      hr_contact_number: '+91 98450 11223',
      company_website: 'https://nexgendigital.example.com',
      notes: 'Premium hiring partner. Recruits React and MERN developers regularly.',
      status: 'Active',
      created_at: now,
      updated_at: now
    },
    {
      company_id: 'CMP-402',
      company_name: 'Cognitive Insights AI',
      industry: 'Artificial Intelligence & Analytics',
      company_location: 'Hyderabad, India',
      hr_name: 'Suresh Menon',
      hr_email: 'suresh.menon@cognitiveinsights.io',
      hr_contact_number: '+91 99001 22334',
      company_website: 'https://cognitiveinsights.example.io',
      notes: 'Looking for Python and ML specialists with good SQL proficiency.',
      status: 'Active',
      created_at: now,
      updated_at: now
    },
    {
      company_id: 'CMP-403',
      company_name: 'CloudMatrix Technologies',
      industry: 'Cloud Infrastructure & Security',
      company_location: 'Pune, India',
      hr_name: 'Tanvi Saxena',
      hr_email: 'tanvi.saxena@cloudmatrix.com',
      hr_contact_number: '+91 97112 33445',
      company_website: 'https://cloudmatrix.example.com',
      notes: 'Regular recruitment for DevOps and Cloud support roles.',
      status: 'Active',
      created_at: now,
      updated_at: now
    }
  ]);
  applySheetStyles(companiesSheet);

  // 6. Requirements Sheet
  const requirementsSheet = workbook.addWorksheet('Requirements');
  requirementsSheet.columns = [
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

  requirementsSheet.addRows([
    {
      requirement_id: 'REQ-501',
      company_id: 'CMP-401',
      company_name: 'NexGen Digital Solutions',
      job_role: 'Associate Full Stack Developer',
      job_description: 'Build robust single page web applications using React, Node.js, and Express.',
      required_skills: 'React.js, Node.js, JavaScript, Tailwind, REST APIs',
      eligibility_criteria: 'Minimum 65% aggregate, complete course projects',
      qualification: 'B.Tech / B.E / MCA / BCA',
      experience_requirement: 'Fresher (0 - 1 year)',
      number_of_vacancies: 4,
      opening_date: '2026-10-15',
      application_deadline: '2026-11-20',
      salary_details: '₹4.5 - ₹6.0 LPA',
      eligible_courses: 'CRS-101',
      eligible_batches: 'BAT-201',
      requirement_status: 'Interview in Progress',
      hr_contact: 'Meera Nambiar (meera.nambiar@nexgendigital.com)',
      remarks: 'First round technical interviews completed for 3 candidates.',
      created_at: now,
      updated_at: now
    },
    {
      requirement_id: 'REQ-502',
      company_id: 'CMP-402',
      company_name: 'Cognitive Insights AI',
      job_role: 'Junior Data Analyst',
      job_description: 'Assist in ETL pipelines, data hygiene, exploratory data analysis, and building dashboards.',
      required_skills: 'Python, SQL, Pandas, Matplotlib, Excel, Basic ML',
      eligibility_criteria: 'Strong analytical skills and SQL proficiency',
      qualification: 'B.Sc IT / B.Tech / BCA / M.Sc',
      experience_requirement: 'Fresher',
      number_of_vacancies: 2,
      opening_date: '2026-10-25',
      application_deadline: '2026-11-25',
      salary_details: '₹4.0 - ₹5.5 LPA',
      eligible_courses: 'CRS-102',
      eligible_batches: 'BAT-202',
      requirement_status: 'Applications in Progress',
      hr_contact: 'Suresh Menon (suresh.menon@cognitiveinsights.io)',
      remarks: 'Profile collection ongoing.',
      created_at: now,
      updated_at: now
    },
    {
      requirement_id: 'REQ-503',
      company_id: 'CMP-403',
      company_name: 'CloudMatrix Technologies',
      job_role: 'Cloud Operations Trainee',
      job_description: 'Support cloud deployments, monitoring infrastructure, container deployments.',
      required_skills: 'Linux, Docker, AWS fundamentals, Bash scripting',
      eligibility_criteria: 'Good fundamentals of Linux and Networking',
      qualification: 'B.Tech / B.E / B.Sc',
      experience_requirement: 'Fresher',
      number_of_vacancies: 3,
      opening_date: '2026-11-01',
      application_deadline: '2026-11-30',
      salary_details: '₹4.2 - ₹5.2 LPA',
      eligible_courses: 'CRS-103',
      eligible_batches: 'BAT-203',
      requirement_status: 'Open',
      hr_contact: 'Tanvi Saxena (tanvi.saxena@cloudmatrix.com)',
      remarks: 'Requirement just opened, candidate nomination required.',
      created_at: now,
      updated_at: now
    }
  ]);
  applySheetStyles(requirementsSheet);

  // 7. Applications Sheet
  const applicationsSheet = workbook.addWorksheet('Applications');
  applicationsSheet.columns = [
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

  applicationsSheet.addRows([
    {
      application_id: 'APP-601',
      student_id: 'STU-1001',
      student_name: 'Aarav Sharma',
      company_id: 'CMP-401',
      company_name: 'NexGen Digital Solutions',
      requirement_id: 'REQ-501',
      job_role: 'Associate Full Stack Developer',
      application_date: '2026-10-20',
      resume_submission_status: 'Shortlisted',
      interview_date: '2026-11-08',
      interview_round: 'Round 2 - Managerial',
      interview_attendance: 'Scheduled',
      hr_feedback: 'Strong JavaScript fundamentals and good React project demonstration in Round 1.',
      result: 'Interview Scheduled',
      follow_up_date: '2026-11-09',
      remarks: 'Admin informed student about interview timing.',
      created_at: now,
      updated_at: now
    },
    {
      application_id: 'APP-602',
      student_id: 'STU-1003',
      student_name: 'Rohan Verma',
      company_id: 'CMP-401',
      company_name: 'NexGen Digital Solutions',
      requirement_id: 'REQ-501',
      job_role: 'Associate Full Stack Developer',
      application_date: '2026-10-20',
      resume_submission_status: 'Shortlisted',
      interview_date: '2026-11-02',
      interview_round: 'Final HR Round',
      interview_attendance: 'Attended',
      hr_feedback: 'Selected! Offer letter released for ₹5.5 LPA.',
      result: 'Selected',
      follow_up_date: '2026-11-04',
      remarks: 'Candidate accepted offer. Joining Dec 1, 2026.',
      created_at: now,
      updated_at: now
    },
    {
      application_id: 'APP-603',
      student_id: 'STU-1004',
      student_name: 'Sneha Reddy',
      company_id: 'CMP-403',
      company_name: 'CloudMatrix Technologies',
      requirement_id: 'REQ-503',
      job_role: 'Cloud Operations Trainee',
      application_date: '2026-11-03',
      resume_submission_status: 'Submitted',
      interview_date: '',
      interview_round: 'Screening',
      interview_attendance: 'Pending',
      hr_feedback: 'Profile sent to hiring team.',
      result: 'Applied',
      follow_up_date: '2026-11-08',
      remarks: 'Follow up needed with Tanvi on shortlist status.',
      created_at: now,
      updated_at: now
    }
  ]);
  applySheetStyles(applicationsSheet);

  // 8. Attendance Sheet
  const attendanceSheet = workbook.addWorksheet('Attendance');
  attendanceSheet.columns = [
    { header: 'Attendance ID', key: 'attendance_id' },
    { header: 'Student ID', key: 'student_id' },
    { header: 'Batch ID', key: 'batch_id' },
    { header: 'Attendance Date', key: 'attendance_date' },
    { header: 'Attendance Status', key: 'attendance_status' },
    { header: 'Remarks', key: 'remarks' },
    { header: 'Created At', key: 'created_at' },
    { header: 'Updated At', key: 'updated_at' }
  ];

  attendanceSheet.addRows([
    {
      attendance_id: 'ATT-701',
      student_id: 'STU-1001',
      batch_id: 'BAT-201',
      attendance_date: '2026-11-04',
      attendance_status: 'Present',
      remarks: 'On time, active participation',
      created_at: now,
      updated_at: now
    },
    {
      attendance_id: 'ATT-702',
      student_id: 'STU-1003',
      batch_id: 'BAT-201',
      attendance_date: '2026-11-04',
      attendance_status: 'Present',
      remarks: 'Completed lab exercise',
      created_at: now,
      updated_at: now
    },
    {
      attendance_id: 'ATT-703',
      student_id: 'STU-1002',
      batch_id: 'BAT-202',
      attendance_date: '2026-11-04',
      attendance_status: 'Absent',
      remarks: 'Informed sick leave',
      created_at: now,
      updated_at: now
    },
    {
      attendance_id: 'ATT-704',
      student_id: 'STU-1001',
      batch_id: 'BAT-201',
      attendance_date: '2026-11-05',
      attendance_status: 'Present',
      remarks: 'Attended React Redux session',
      created_at: now,
      updated_at: now
    },
    {
      attendance_id: 'ATT-705',
      student_id: 'STU-1003',
      batch_id: 'BAT-201',
      attendance_date: '2026-11-05',
      attendance_status: 'Present',
      remarks: '',
      created_at: now,
      updated_at: now
    }
  ]);
  applySheetStyles(attendanceSheet);

  // 9. HR_Followups Sheet
  const followupsSheet = workbook.addWorksheet('HR_Followups');
  followupsSheet.columns = [
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

  followupsSheet.addRows([
    {
      followup_id: 'FLW-801',
      requirement_id: 'REQ-501',
      company_id: 'CMP-401',
      company_name: 'NexGen Digital Solutions',
      hr_contact: 'Meera Nambiar',
      followup_date: '2026-11-05',
      followup_method: 'Call',
      discussion_summary: 'Discussed schedule for Round 2 managerial interviews for Aarav Sharma.',
      hr_response: 'Slot confirmed for Nov 8 at 11:30 AM via Teams.',
      next_followup_date: '2026-11-08',
      responsible_person: 'Admin',
      status: 'Completed',
      created_at: now,
      updated_at: now
    },
    {
      followup_id: 'FLW-802',
      requirement_id: 'REQ-503',
      company_id: 'CMP-403',
      company_name: 'CloudMatrix Technologies',
      hr_contact: 'Tanvi Saxena',
      followup_date: '2026-11-04',
      followup_method: 'Email',
      discussion_summary: 'Sent 3 recommended candidate profiles for Cloud Operations Trainee.',
      hr_response: 'Awaiting feedback from engineering manager.',
      next_followup_date: '2026-11-06',
      responsible_person: 'Admin',
      status: 'Pending',
      created_at: now,
      updated_at: now
    }
  ]);
  applySheetStyles(followupsSheet);

  // 10. Admin Sheet
  const adminSheet = workbook.addWorksheet('Admin');
  adminSheet.columns = [
    { header: 'Admin ID', key: 'admin_id' },
    { header: 'Full Name', key: 'full_name' },
    { header: 'Email', key: 'email' },
    { header: 'Password Hash', key: 'password_hash' },
    { header: 'Role', key: 'role' },
    { header: 'Status', key: 'status' },
    { header: 'Created At', key: 'created_at' },
    { header: 'Updated At', key: 'updated_at' }
  ];

  const salt = await bcrypt.genSalt(10);
  const defaultPasswordHash = await bcrypt.hash('admin123', salt);

  adminSheet.addRows([
    {
      admin_id: 'ADM-001',
      full_name: 'Chief Administrator',
      email: 'admin@ams.local',
      password_hash: defaultPasswordHash,
      role: 'SuperAdmin',
      status: 'Active',
      created_at: now,
      updated_at: now
    }
  ]);
  applySheetStyles(adminSheet);

  await workbook.xlsx.writeFile(DB_PATH);
  console.log(`[INIT] Successfully created Excel database at: ${DB_PATH}`);
}

if (require.main === module) {
  initializeDatabase(process.argv.includes('--force'))
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[INIT ERROR]', err);
      process.exit(1);
    });
}

module.exports = { initializeDatabase };

