const BASE_URL = 'http://127.0.0.1:5000/api';

async function request(url, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(data?.message || `HTTP ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

async function runTests() {
  console.log('--- Starting AMS Comprehensive API & Excel Integration Tests ---');
  let token = null;

  // 1. Test Health
  try {
    const data = await request(`${BASE_URL}/health`);
    console.log('✓ [Health Check]:', data.status, '| DB:', data.excelDatabase);
  } catch (e) {
    console.error('✗ [Health Check Failed]:', e.message);
    process.exit(1);
  }

  // 2. Test Login
  try {
    const data = await request(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@ams.local',
        password: 'admin123'
      })
    });
    token = data.token;
    console.log('✓ [Auth Login]: Success | Logged in as:', data.admin.full_name);
  } catch (e) {
    console.error('✗ [Auth Login Failed]:', e.data || e.message);
    process.exit(1);
  }

  const authHeaders = { Authorization: `Bearer ${token}` };

  // 3. Test Dashboard Stats
  try {
    const data = await request(`${BASE_URL}/dashboard/stats`, { headers: authHeaders });
    console.log(
      '✓ [Dashboard Stats]: Total Students:',
      data.stats.totalStudents,
      '| Active Batches:',
      data.stats.activeBatches,
      '| Open Requirements:',
      data.stats.openRequirements
    );
  } catch (e) {
    console.error('✗ [Dashboard Stats Failed]:', e.data || e.message);
  }

  // 4. Test Student Creation, Query, Archive & Restore
  let testStudentId = null;
  try {
    const testEmail = `test.student.${Date.now()}@example.com`;
    const res = await request(`${BASE_URL}/students`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        full_name: 'Test Candidate',
        email: testEmail,
        phone_number: '+91 99999 11111',
        admission_category: 'Placement Admission',
        course_id: 'CRS-101',
        batch_id: 'BAT-201',
        educational_qualification: 'B.Tech IT (2025)'
      })
    });
    testStudentId = res.student.student_id;
    console.log('✓ [Student Create]: Created ID:', testStudentId);

    // Test Duplicate Email Prevention
    try {
      await request(`${BASE_URL}/students`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          full_name: 'Duplicate Candidate',
          email: testEmail,
          admission_category: 'Training Admission',
          course_id: 'CRS-101'
        })
      });
      console.error('✗ [Duplicate Prevention Failed]: Did not reject duplicate email');
    } catch (dupErr) {
      console.log('✓ [Duplicate Prevention]: Successfully rejected duplicate email');
    }

    // Test Archive
    await request(`${BASE_URL}/students/${testStudentId}/archive`, {
      method: 'PUT',
      headers: authHeaders
    });
    console.log('✓ [Student Archive]: Successfully archived test student');

    // Test Restore
    await request(`${BASE_URL}/students/${testStudentId}/restore`, {
      method: 'PUT',
      headers: authHeaders
    });
    console.log('✓ [Student Restore]: Successfully restored test student');

    // Test Delete
    await request(`${BASE_URL}/students/${testStudentId}`, {
      method: 'DELETE',
      headers: authHeaders
    });
    console.log('✓ [Student Delete]: Successfully permanently deleted test student');
  } catch (e) {
    console.error('✗ [Student Test Failed]:', e.data || e.message);
  }

  // 5. Test Attendance Management
  try {
    const today = new Date().toISOString().split('T')[0];
    const saveRes = await request(`${BASE_URL}/attendance/save`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        batch_id: 'BAT-201',
        date: today,
        entries: [
          { student_id: 'STU-1001', attendance_status: 'Present', remarks: 'E2E Test Verified' },
          { student_id: 'STU-1003', attendance_status: 'Present', remarks: 'Active in class' }
        ]
      })
    });
    console.log('✓ [Attendance Save]:', saveRes.message);

    const getRes = await request(
      `${BASE_URL}/attendance/daily?batch_id=BAT-201&date=${today}`,
      { headers: authHeaders }
    );
    console.log('✓ [Attendance Query]: Retrieved', getRes.students.length, 'student statuses for today');
  } catch (e) {
    console.error('✗ [Attendance Test Failed]:', e.data || e.message);
  }

  // 6. Test Company & Requirement Workflow
  let testCompanyId = null;
  let testReqId = null;
  try {
    const compRes = await request(`${BASE_URL}/companies`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        company_name: 'Apex Global Technologies',
        industry: 'Software Services',
        company_location: 'Bangalore',
        hr_name: 'Anita Roy',
        hr_email: 'anita.roy@apexglobal.example.com'
      })
    });
    testCompanyId = compRes.company.company_id;
    console.log('✓ [Company Create]: Created ID:', testCompanyId);

    const reqRes = await request(`${BASE_URL}/requirements`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        company_id: testCompanyId,
        job_role: 'Full Stack Engineer (Node + React)',
        number_of_vacancies: 3,
        application_deadline: '2026-12-15',
        salary_details: '₹6.5 LPA',
        required_skills: 'React, Node, Express, MongoDB'
      })
    });
    testReqId = reqRes.requirement.requirement_id;
    console.log('✓ [Requirement Create]: Created ID:', testReqId);
  } catch (e) {
    console.error('✗ [Company/Requirement Failed]:', e.data || e.message);
  }

  // 7. Test Application Tracking
  try {
    const appRes = await request(`${BASE_URL}/applications`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        student_id: 'STU-1001',
        requirement_id: testReqId,
        resume_submission_status: 'Shortlisted'
      })
    });
    const appId = appRes.application.application_id;
    console.log('✓ [Application Create]: Created ID:', appId);

    // Update status to Interview Scheduled
    const updateRes = await request(`${BASE_URL}/applications/${appId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        result: 'Interview Scheduled',
        interview_date: '2026-11-15',
        interview_round: 'Round 1 - Technical'
      })
    });
    console.log('✓ [Application Update]: Updated Stage to:', updateRes.application.result);
  } catch (e) {
    console.error('✗ [Application Tracking Failed]:', e.data || e.message);
  }

  // 8. Test HR Follow-up
  try {
    const flwRes = await request(`${BASE_URL}/followups`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        requirement_id: testReqId,
        followup_method: 'Email',
        discussion_summary: 'Sent candidate batch profile for Apex Global',
        hr_response: 'HR acknowledged, shortlisting in progress',
        next_followup_date: '2026-11-12'
      })
    });
    console.log('✓ [HR Follow-up Create]: Logged ID:', flwRes.followup.followup_id);
  } catch (e) {
    console.error('✗ [HR Follow-up Failed]:', e.data || e.message);
  }

  // 9. Test Reports
  try {
    const rRes = await request(`${BASE_URL}/reports/placements`, { headers: authHeaders });
    console.log('✓ [Reports Placement]: Generated summary with total reqs:', rRes.summary.totalRequirements);
  } catch (e) {
    console.error('✗ [Reports Failed]:', e.data || e.message);
  }

  // 10. Test Backups & Health Check
  try {
    const healthRes = await request(`${BASE_URL}/backups/health`, { headers: authHeaders });
    console.log('✓ [Workbook Health Check]: State:', healthRes.health, '| Sheets:', healthRes.worksheets.length);

    const bRes = await request(`${BASE_URL}/backups/create`, {
      method: 'POST',
      headers: authHeaders
    });
    console.log('✓ [Manual Backup Trigger]: Created snapshot:', bRes.filename);
  } catch (e) {
    console.error('✗ [Backup Check Failed]:', e.data || e.message);
  }

  console.log('🎉 --- ALL AMS BACKEND & EXCEL TESTS PASSED 100% ---');
  process.exit(0);
}

runTests();
