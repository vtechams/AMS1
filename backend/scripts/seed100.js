const mongoose = require('mongoose');
const config = require('../config/config');
const models = require('../models');
const excelSyncService = require('../services/excelSyncService');

const FIRST_NAMES = [
  'Aarav', 'Priya', 'Rohan', 'Sneha', 'Vikram', 'Ananya', 'Rahul', 'Pooja', 'Karthik', 'Divya',
  'Aditya', 'Meera', 'Arjun', 'Siddharth', 'Neha', 'Varun', 'Kavya', 'Gautam', 'Deepika', 'Manish',
  'Swati', 'Harish', 'Tanvi', 'Abhishek', 'Shruti', 'Naveen', 'Ritu', 'Pranav', 'Shreya', 'Sanjay',
  'Sandhya', 'Akash', 'Malini', 'Venkatesh', 'Bhavana', 'Dinesh', 'Lavanya', 'Surya', 'Aishwarya', 'Rajesh',
  'Preethi', 'Manoj', 'Gayathri', 'Vijay', 'Ishita', 'Suresh', 'Komal', 'Ashwin', 'Nandini', 'Ajay'
];

const LAST_NAMES = [
  'Sharma', 'Patel', 'Verma', 'Reddy', 'Joshi', 'Iyer', 'Nair', 'Hegde', 'Subramanian', 'Menon',
  'Deshmukh', 'Chopra', 'Gupta', 'Kumar', 'Pillai', 'Rao', 'Bhat', 'Shetty', 'Kulkarni', 'Naidu',
  'Nambiar', 'Agarwal', 'Chatterjee', 'Banerjee', 'Ghosh', 'Sen', 'Dutta', 'Mukherjee', 'Das', 'Roy'
];

const CITIES = ['Bengaluru', 'Chennai', 'Hyderabad', 'Pune', 'Coimbatore', 'Kochi', 'Mumbai', 'Delhi'];
const DEGREES = ['B.Tech Computer Science', 'B.Sc Information Technology', 'BCA', 'MCA', 'B.E Electronics', 'M.Tech Software Eng'];
const ADMISSION_DATES = [
  '2026-05-10', '2026-05-24', '2026-06-08', '2026-06-22',
  '2026-07-05', '2026-07-20', '2026-08-04', '2026-08-18',
  '2026-09-02', '2026-09-19', '2026-10-06', '2026-10-24',
  '2026-11-02', '2026-11-08'
];

async function seed100() {
  console.log('[SEED 100] Connecting to database...');
  if (!mongoose.connection || mongoose.connection.readyState !== 1) {
    await mongoose.connect(config.MONGODB_URI);
  }
  console.log('[SEED 100] Connected successfully.');

  const now = new Date().toISOString();

  // 1. Ensure Courses
  console.log('[SEED 100] Setting up base Courses...');
  const baseCourses = [
    {
      course_id: 'CRS-101',
      course_name: 'Full Stack MERN Development',
      course_description: 'End-to-end web engineering with React, Node.js, Express, MongoDB, and Tailwind CSS.',
      duration: '6 Months',
      technologies_covered: 'React, Node.js, Express, MongoDB, Tailwind CSS, TypeScript, REST APIs',
      start_date: '2026-08-01',
      course_status: 'Active',
      created_at: now,
      updated_at: now
    },
    {
      course_id: 'CRS-102',
      course_name: 'Python Data Science & AI',
      course_description: 'Data analytics, predictive machine learning, deep learning, and statistical modeling with Python.',
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
      course_description: 'Automated CI/CD pipelines, Docker, Kubernetes container orchestration, and cloud infrastructure.',
      duration: '4 Months',
      technologies_covered: 'Docker, Kubernetes, AWS, Terraform, GitHub Actions, Linux Shell',
      start_date: '2026-09-15',
      course_status: 'Active',
      created_at: now,
      updated_at: now
    },
    {
      course_id: 'CRS-104',
      course_name: 'Java Enterprise Full Stack',
      course_description: 'Enterprise backend microservices architecture with Spring Boot, JPA/Hibernate, and Angular.',
      duration: '6 Months',
      technologies_covered: 'Java, Spring Boot, Microservices, Hibernate, PostgreSQL, Docker',
      start_date: '2026-10-01',
      course_status: 'Active',
      created_at: now,
      updated_at: now
    }
  ];

  for (const c of baseCourses) {
    await models.Courses.findOneAndUpdate({ course_id: c.course_id }, c, { upsert: true });
  }

  // 2. Ensure Batches
  console.log('[SEED 100] Setting up base Batches...');
  const baseBatches = [
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
      trainer_name: 'Dr. Ramesh Sundaram',
      start_date: '2026-09-10',
      end_date: '2027-02-10',
      batch_status: 'Active',
      created_at: now,
      updated_at: now
    },
    {
      batch_id: 'BAT-203',
      batch_name: 'DevOps Cloud 2026',
      course_id: 'CRS-103',
      trainer_name: 'Vikas Nambiar',
      start_date: '2026-09-20',
      end_date: '2027-01-20',
      batch_status: 'Active',
      created_at: now,
      updated_at: now
    },
    {
      batch_id: 'BAT-204',
      batch_name: 'Java Spring Gamma 2026',
      course_id: 'CRS-104',
      trainer_name: 'Anand Kulkarni',
      start_date: '2026-10-15',
      end_date: '2027-04-15',
      batch_status: 'Active',
      created_at: now,
      updated_at: now
    }
  ];

  for (const b of baseBatches) {
    await models.Batches.findOneAndUpdate({ batch_id: b.batch_id }, b, { upsert: true });
  }

  // 3. Ensure Companies & Requirements
  console.log('[SEED 100] Setting up base Companies & Requirements...');
  const baseCompanies = [
    {
      company_id: 'CMP-401',
      company_name: 'CloudMatrix Technologies',
      industry: 'Cloud & Software Services',
      company_location: 'Bengaluru, India',
      hr_name: 'Pooja Hegde',
      hr_email: 'pooja.hr@cloudmatrix.example.com',
      hr_contact_number: '+91 98765 11223',
      company_website: 'https://cloudmatrix.example.com',
      notes: 'Tier 1 Hiring Partner for Cloud & MERN roles',
      status: 'Active',
      created_at: now,
      updated_at: now
    },
    {
      company_id: 'CMP-402',
      company_name: 'FinScale Data Systems',
      industry: 'FinTech & Analytics',
      company_location: 'Hyderabad, India',
      hr_name: 'Manoj Kumar',
      hr_email: 'manoj.k@finscale.example.com',
      hr_contact_number: '+91 98450 33445',
      company_website: 'https://finscale.example.com',
      notes: 'Specializes in AI/ML & Python analytics engineering',
      status: 'Active',
      created_at: now,
      updated_at: now
    },
    {
      company_id: 'CMP-403',
      company_name: 'NexaCore Solutions',
      industry: 'Enterprise Web & Mobility',
      company_location: 'Pune, India',
      hr_name: 'Anjali Sharma',
      hr_email: 'recruitment@nexacore.example.com',
      hr_contact_number: '+91 99887 55667',
      company_website: 'https://nexacore.example.com',
      notes: 'Annual campus recruitment partner for React & Java',
      status: 'Active',
      created_at: now,
      updated_at: now
    },
    {
      company_id: 'CMP-404',
      company_name: 'InfraCloud Global',
      industry: 'Cloud Infrastructure & SRE',
      company_location: 'Chennai, India',
      hr_name: 'Suresh Babu',
      hr_email: 'careers@infracloud.example.com',
      hr_contact_number: '+91 91234 66778',
      company_website: 'https://infracloud.example.com',
      notes: 'Hiring DevOps & Linux associates',
      status: 'Active',
      created_at: now,
      updated_at: now
    }
  ];

  for (const c of baseCompanies) {
    await models.Companies.findOneAndUpdate({ company_id: c.company_id }, c, { upsert: true });
  }

  const baseRequirements = [
    {
      requirement_id: 'REQ-501',
      company_id: 'CMP-401',
      company_name: 'CloudMatrix Technologies',
      job_role: 'Associate Full Stack Developer',
      job_description: 'Develop responsive frontends in React and microservices in Node.js/Express.',
      required_skills: 'React, Node.js, Express, MongoDB, REST APIs, Git',
      eligibility_criteria: '60% throughout academics; completion of MERN training track.',
      qualification: 'B.Tech / B.E / MCA',
      experience_requirement: 'Fresher (2025/2026 batch)',
      number_of_vacancies: 10,
      opening_date: '2026-10-01',
      application_deadline: '2026-11-30',
      salary_details: '₹4.5 - ₹6.5 LPA',
      eligible_courses: 'Full Stack MERN Development',
      eligible_batches: 'MERN Alpha 2026',
      requirement_status: 'Open',
      hr_contact: 'Pooja Hegde (+91 98765 11223)',
      remarks: 'Fast-track interview process with 2 technical rounds.',
      created_at: now,
      updated_at: now
    },
    {
      requirement_id: 'REQ-502',
      company_id: 'CMP-402',
      company_name: 'FinScale Data Systems',
      job_role: 'Data Analyst / Python Trainee',
      job_description: 'Build predictive dashboards, clean financial datasets, and execute automated analytics pipelines.',
      required_skills: 'Python, SQL, Pandas, NumPy, Tableau/PowerBI',
      eligibility_criteria: 'B.Tech/B.Sc/MCA with strong quantitative and SQL fundamentals.',
      qualification: 'B.Tech / B.Sc / BCA / MCA',
      experience_requirement: 'Fresher',
      number_of_vacancies: 8,
      opening_date: '2026-10-15',
      application_deadline: '2026-12-15',
      salary_details: '₹5.0 - ₹7.2 LPA',
      eligible_courses: 'Python Data Science & AI',
      eligible_batches: 'Data Sci Beta 2026',
      requirement_status: 'Open',
      hr_contact: 'Manoj Kumar (+91 98450 33445)',
      remarks: 'Includes coding test followed by technical discussion.',
      created_at: now,
      updated_at: now
    },
    {
      requirement_id: 'REQ-503',
      company_id: 'CMP-404',
      company_name: 'InfraCloud Global',
      job_role: 'Cloud Operations Trainee',
      job_description: 'Assist in configuring Kubernetes clusters, containerizing services, and monitoring CI/CD workflows.',
      required_skills: 'Linux, Docker, Kubernetes, AWS basics, Shell Scripting',
      eligibility_criteria: 'Eligible evaluation status in Cloud & DevOps track.',
      qualification: 'B.Tech / B.E / MCA',
      experience_requirement: 'Fresher',
      number_of_vacancies: 6,
      opening_date: '2026-10-20',
      application_deadline: '2026-12-05',
      salary_details: '₹4.8 - ₹6.0 LPA',
      eligible_courses: 'Cloud & DevOps Engineering',
      eligible_batches: 'DevOps Cloud 2026',
      requirement_status: 'Open',
      hr_contact: 'Suresh Babu (+91 91234 66778)',
      remarks: 'Hands-on Linux assessment in round 1.',
      created_at: now,
      updated_at: now
    },
    {
      requirement_id: 'REQ-504',
      company_id: 'CMP-403',
      company_name: 'NexaCore Solutions',
      job_role: 'Junior Software Engineer (Java / React)',
      job_description: 'Collaborate with agile sprint teams to develop enterprise portals.',
      required_skills: 'Java, Spring Boot, React, SQL',
      eligibility_criteria: 'Completed or active in Java or MERN track.',
      qualification: 'B.Tech / B.E / MCA / BCA',
      experience_requirement: '0-1 Years',
      number_of_vacancies: 12,
      opening_date: '2026-11-01',
      application_deadline: '2026-12-20',
      salary_details: '₹4.2 - ₹5.8 LPA',
      eligible_courses: 'Full Stack MERN Development, Java Enterprise Full Stack',
      eligible_batches: 'MERN Alpha 2026, Java Spring Gamma 2026',
      requirement_status: 'Open',
      hr_contact: 'Anjali Sharma (+91 99887 55667)',
      remarks: 'Direct hiring drive.',
      created_at: now,
      updated_at: now
    }
  ];

  for (const r of baseRequirements) {
    await models.Requirements.findOneAndUpdate({ requirement_id: r.requirement_id }, r, { upsert: true });
  }

  // 4. Generate 100 Students
  console.log('[SEED 100] Generating 100 realistic Student records (STU-1001 to STU-1100)...');
  await models.Students.deleteMany({});
  await models.Enrollments.deleteMany({});
  await models.Applications.deleteMany({});
  await models.Attendance.deleteMany({});
  await models.HR_Followups.deleteMany({});

  const courseList = ['CRS-101', 'CRS-102', 'CRS-103', 'CRS-104'];
  const courseBatchMap = {
    'CRS-101': 'BAT-201',
    'CRS-102': 'BAT-202',
    'CRS-103': 'BAT-203',
    'CRS-104': 'BAT-204'
  };

  // 15 days pool (Nov 01 to Nov 15) + past months (May to Oct) for realistic 15-day and monthly charts
  const admissionDatesPool = [
    // 15 days in November
    '2026-11-01', '2026-11-01',
    '2026-11-02', '2026-11-02', '2026-11-02',
    '2026-11-03',
    '2026-11-04', '2026-11-04', '2026-11-04', '2026-11-04',
    '2026-11-05', '2026-11-05',
    '2026-11-06', '2026-11-06', '2026-11-06',
    '2026-11-07', '2026-11-07',
    '2026-11-08', '2026-11-08', '2026-11-08', '2026-11-08',
    '2026-11-09', '2026-11-09', '2026-11-09',
    '2026-11-10', '2026-11-10', '2026-11-10', '2026-11-10', '2026-11-10',
    '2026-11-11', '2026-11-11', '2026-11-11', '2026-11-11',
    '2026-11-12', '2026-11-12', '2026-11-12',
    '2026-11-13', '2026-11-13',
    '2026-11-14',
    '2026-11-15', '2026-11-15', '2026-11-15',
    // Previous months for smooth monthly growth
    '2026-05-12', '2026-05-25',
    '2026-06-04', '2026-06-18', '2026-06-28',
    '2026-07-03', '2026-07-14', '2026-07-22', '2026-07-31',
    '2026-08-04', '2026-08-12', '2026-08-20', '2026-08-28', '2026-08-31',
    '2026-09-02', '2026-09-10', '2026-09-17', '2026-09-24', '2026-09-29', '2026-09-30',
    '2026-10-02', '2026-10-08', '2026-10-15', '2026-10-21', '2026-10-26', '2026-10-31'
  ];

  const studentsToInsert = [];
  const enrollmentsToInsert = [];

  for (let i = 1; i <= 100; i++) {
    const studentNum = 1000 + i;
    const studentId = `STU-${studentNum}`;

    const firstName = FIRST_NAMES[(i - 1) % FIRST_NAMES.length];
    const lastName = LAST_NAMES[(i * 3 + 7) % LAST_NAMES.length];
    const fullName = `${firstName} ${lastName}`;

    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${studentNum}@example.com`;
    const phone = `+91 98${String(10000000 + (i * 7919) % 89999999).substring(0, 8)}`;
    const city = CITIES[i % CITIES.length];
    const degree = DEGREES[i % DEGREES.length];
    const admissionDate = admissionDatesPool[(i - 1) % admissionDatesPool.length];

    // 65% Placement Admission, 35% Training Admission
    const isPlacement = i % 10 < 7;
    const admissionCategory = isPlacement ? 'Placement Admission' : 'Training Admission';

    const courseId = courseList[(i - 1) % courseList.length];
    const batchId = courseBatchMap[courseId];

    // Status distributions
    const isArchived = i % 15 === 0;
    const studentStatus = isArchived ? 'Archived' : 'Active';

    let trainingStatus = 'Active';
    if (i % 7 === 0) trainingStatus = 'Completed';
    else if (i % 12 === 0) trainingStatus = 'On Leave';

    let placementEligibility = 'Eligible';
    if (!isPlacement) {
      placementEligibility = i % 3 === 0 ? 'Eligible' : 'Pending Evaluation';
    } else {
      if (i % 8 === 0) placementEligibility = 'Pending Evaluation';
      else if (i % 17 === 0) placementEligibility = 'Not Eligible';
    }

    const studentDoc = {
      student_id: studentId,
      full_name: fullName,
      email,
      phone_number: phone,
      address: `${12 + (i % 80)}, Tech Park Road, ${city}`,
      admission_category: admissionCategory,
      course_id: courseId,
      batch_id: batchId,
      admission_date: admissionDate,
      educational_qualification: `${degree} (2025)`,
      training_status: trainingStatus,
      placement_eligibility: placementEligibility,
      student_status: studentStatus,
      notes: `Batch enrollment generated. Progress tracking active.`,
      created_at: admissionDate,
      updated_at: now
    };

    studentsToInsert.push(studentDoc);

    // Corresponding Enrollment
    enrollmentsToInsert.push({
      enrollment_id: `ENR-${300 + i}`,
      student_id: studentId,
      course_id: courseId,
      batch_id: batchId,
      enrollment_date: admissionDate,
      enrollment_status: studentStatus === 'Archived' ? 'Withdrawn' : 'Enrolled',
      created_at: admissionDate,
      updated_at: now
    });
  }

  await models.Students.insertMany(studentsToInsert);
  await models.Enrollments.insertMany(enrollmentsToInsert);
  console.log(`[SEED 100] Inserted ${studentsToInsert.length} students and enrollments.`);

  // 5. Generate Placement Applications with Selections across ALL 15 dates + past months
  console.log('[SEED 100] Generating 60 Placement Applications across the 15 dates & past months...');
  const applicationsToInsert = [];
  const reqList = ['REQ-501', 'REQ-502', 'REQ-503', 'REQ-504'];
  const reqMap = {
    'REQ-501': { company_id: 'CMP-401', company_name: 'CloudMatrix Technologies', job_role: 'Associate Full Stack Developer' },
    'REQ-502': { company_id: 'CMP-402', company_name: 'FinScale Data Systems', job_role: 'Data Analyst / Python Trainee' },
    'REQ-503': { company_id: 'CMP-404', company_name: 'InfraCloud Global', job_role: 'Cloud Operations Trainee' },
    'REQ-504': { company_id: 'CMP-403', company_name: 'NexaCore Solutions', job_role: 'Junior Software Engineer (Java / React)' }
  };

  const placementEligibleStudents = studentsToInsert.filter(
    (s) => s.admission_category === 'Placement Admission' && s.student_status === 'Active'
  );

  // Dedicated selection dates: every single day from 2026-11-01 to 2026-11-15 has selections!
  const selectionDatesPool = [
    '2026-11-01',
    '2026-11-02', '2026-11-02',
    '2026-11-03',
    '2026-11-04', '2026-11-04', '2026-11-04',
    '2026-11-05', '2026-11-05',
    '2026-11-06', '2026-11-06',
    '2026-11-07',
    '2026-11-08', '2026-11-08', '2026-11-08', '2026-11-08',
    '2026-11-09', '2026-11-09',
    '2026-11-10', '2026-11-10', '2026-11-10',
    '2026-11-11', '2026-11-11',
    '2026-11-12', '2026-11-12',
    '2026-11-13',
    '2026-11-14', '2026-11-14',
    '2026-11-15',
    // Past months selections
    '2026-06-20', '2026-07-15', '2026-07-28', '2026-08-14', '2026-08-26',
    '2026-09-12', '2026-09-25', '2026-10-10', '2026-10-22', '2026-10-30'
  ];

  let selectDateIdx = 0;

  for (let j = 0; j < Math.min(60, placementEligibleStudents.length); j++) {
    const student = placementEligibleStudents[j];
    const appId = `APP-${601 + j}`;
    const reqId = reqList[j % reqList.length];
    const reqInfo = reqMap[reqId];

    // Every 2nd application is a successful Selection on one of the 15 dates!
    let result = 'Applied';
    let interviewDate = '';
    let appDate = `2026-10-${String(10 + (j % 18)).padStart(2, '0')}`;

    if (j % 2 === 0 && selectDateIdx < selectionDatesPool.length) {
      result = 'Selected';
      interviewDate = selectionDatesPool[selectDateIdx];
      appDate = interviewDate < '2026-11-01' ? '2026-06-01' : '2026-10-20';
      selectDateIdx++;
    } else if (j % 4 === 1) {
      result = 'Interview Scheduled';
      interviewDate = `2026-11-${String(10 + (j % 5)).padStart(2, '0')}`;
    } else if (j % 4 === 3) {
      result = 'Interview Attended';
      interviewDate = `2026-11-${String(2 + (j % 8)).padStart(2, '0')}`;
    } else if (j % 8 === 7) {
      result = 'Rejected';
      interviewDate = `2026-11-${String(3 + (j % 5)).padStart(2, '0')}`;
    }

    applicationsToInsert.push({
      application_id: appId,
      student_id: student.student_id,
      student_name: student.full_name,
      company_id: reqInfo.company_id,
      company_name: reqInfo.company_name,
      requirement_id: reqId,
      job_role: reqInfo.job_role,
      application_date: appDate,
      resume_submission_status: 'Submitted',
      interview_date: interviewDate,
      interview_round: result === 'Selected' ? 'Final HR Round' : 'Technical Round 1',
      interview_attendance: result === 'Applied' ? 'Pending' : 'Attended',
      hr_feedback: result === 'Selected' ? 'Offer letter released by partner company.' : 'Profile under evaluation.',
      result,
      follow_up_date: '2026-11-20',
      remarks: 'Automated campus application profile.',
      created_at: appDate,
      updated_at: now
    });
  }

  await models.Applications.insertMany(applicationsToInsert);
  console.log(`[SEED 100] Inserted ${applicationsToInsert.length} placement applications (${selectDateIdx} Selected across 15 dates).`);

  // 6. Generate 15 Days of Attendance records for all 100 students (1,500 records)
  console.log('[SEED 100] Generating 15 Days of Attendance records for all 100 students (1,500 total records)...');
  const attendanceDates = [
    '2026-11-01',
    '2026-11-02',
    '2026-11-03',
    '2026-11-04',
    '2026-11-05',
    '2026-11-06',
    '2026-11-07',
    '2026-11-08',
    '2026-11-09',
    '2026-11-10',
    '2026-11-11',
    '2026-11-12', // Today!
    '2026-11-13',
    '2026-11-14',
    '2026-11-15'
  ];
  const attendanceToInsert = [];
  let attCount = 1;

  for (const dateStr of attendanceDates) {
    for (let k = 0; k < studentsToInsert.length; k++) {
      const student = studentsToInsert[k];
      // Realistic ~88% present rate
      const isPresent = ((attCount * 13 + k * 7) % 100) < 88;
      attendanceToInsert.push({
        attendance_id: `ATT-${7000 + attCount}`,
        student_id: student.student_id,
        batch_id: student.batch_id,
        attendance_date: dateStr,
        attendance_status: isPresent ? 'Present' : 'Absent',
        remarks: isPresent ? 'Attended theory & hands-on lab' : 'Informed leave',
        created_at: dateStr,
        updated_at: now
      });
      attCount++;
    }
  }

  await models.Attendance.insertMany(attendanceToInsert);
  console.log(`[SEED 100] Inserted ${attendanceToInsert.length} daily attendance records across 15 days.`);

  // 7. Generate ~10 HR Followups
  console.log('[SEED 100] Generating 10 HR followups...');
  const followupsToInsert = [
    {
      followup_id: 'FLW-801',
      requirement_id: 'REQ-501',
      company: 'CloudMatrix Technologies',
      hr_contact: 'Pooja Hegde',
      followup_date: '2026-11-10',
      followup_method: 'Call',
      discussion_summary: 'Reviewed 15 student resumes for the MERN Associate role.',
      hr_response: 'Shortlisted 8 candidates for Round 1 interviews next week.',
      next_followup_date: '2026-11-16',
      responsible_person: 'Admin',
      status: 'Completed',
      created_at: now,
      updated_at: now
    },
    {
      followup_id: 'FLW-802',
      requirement_id: 'REQ-502',
      company: 'FinScale Data Systems',
      hr_contact: 'Manoj Kumar',
      followup_date: '2026-11-12',
      followup_method: 'Email',
      discussion_summary: 'Requested feedback on test submissions for Data Analyst trainee profiles.',
      hr_response: 'Feedback pending from analytics team lead.',
      next_followup_date: '2026-11-18',
      responsible_person: 'Admin',
      status: 'Pending',
      created_at: now,
      updated_at: now
    },
    {
      followup_id: 'FLW-803',
      requirement_id: 'REQ-503',
      company: 'InfraCloud Global',
      hr_contact: 'Suresh Babu',
      followup_date: '2026-11-09',
      followup_method: 'Meeting',
      discussion_summary: 'Discussed schedule for on-site interviews for Cloud Operations candidates.',
      hr_response: 'Confirmed slot for Friday morning.',
      next_followup_date: '2026-11-15',
      responsible_person: 'Admin',
      status: 'Completed',
      created_at: now,
      updated_at: now
    }
  ];

  await models.HR_Followups.insertMany(followupsToInsert);
  console.log(`[SEED 100] Inserted ${followupsToInsert.length} HR followups.`);

  // 8. Synchronize all newly created data to Excel database
  console.log('[SEED 100] Synchronizing complete data to database/Academy_Database.xlsx...');
  await excelSyncService.syncToDisk();

  console.log('[SEED 100] SUCCESS! 100 duplicate/mock records populated and synchronized.');
  return {
    success: true,
    totalStudents: studentsToInsert.length,
    totalApplications: applicationsToInsert.length,
    totalAttendance: attendanceToInsert.length,
    totalAttendanceDays: attendanceDates.length,
    message: `100 student records and 15 full days of attendance (${attendanceToInsert.length} records) populated successfully!`
  };
}

// Allow CLI execution: `node backend/scripts/seed100.js`
if (require.main === module) {
  seed100()
    .then((res) => {
      console.log(JSON.stringify(res, null, 2));
      process.exit(0);
    })
    .catch((err) => {
      console.error('[SEED 100 ERROR]', err);
      process.exit(1);
    });
}

module.exports = seed100;

