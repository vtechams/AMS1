const excelService = require('../services/excelService');

exports.getDashboardStats = async (req, res) => {
  try {
    const [
      students,
      courses,
      batches,
      companies,
      requirements,
      applications,
      followups,
      attendance
    ] = await Promise.all([
      excelService.getSheetData('Students'),
      excelService.getSheetData('Courses'),
      excelService.getSheetData('Batches'),
      excelService.getSheetData('Companies'),
      excelService.getSheetData('Requirements'),
      excelService.getSheetData('Applications'),
      excelService.getSheetData('HR_Followups'),
      excelService.getSheetData('Attendance')
    ]);

    // Student counts
    const totalStudents = students.length;
    const activeStudents = students.filter((s) => s.student_status === 'Active').length;
    const archivedStudents = students.filter((s) => s.student_status === 'Archived').length;
    const trainingStudents = students.filter(
      (s) => s.admission_category && s.admission_category.toLowerCase().includes('training')
    ).length;
    const placementStudents = students.filter(
      (s) => s.admission_category && s.admission_category.toLowerCase().includes('placement')
    ).length;

    // Course and Batch counts
    const totalCourses = courses.length;
    const activeBatches = batches.filter((b) => b.batch_status === 'Active').length;

    // Company and Requirement counts
    const totalCompanies = companies.filter((c) => c.status !== 'Archived').length;
    const openRequirements = requirements.filter(
      (r) => r.requirement_status === 'Open' || r.requirement_status === 'Applications in Progress'
    ).length;

    // Application counts
    const totalApplications = applications.length;
    const studentsSelected = applications.filter((a) => a.result === 'Selected').length;
    const studentsRejected = applications.filter((a) => a.result === 'Rejected').length;
    const pendingInterviewResults = applications.filter(
      (a) => a.result === 'Result Pending' || a.result === 'Interview Attended'
    ).length;

    // Last 15 Dates Window (2026-11-01 to 2026-11-15)
    const last15Dates = [
      '2026-11-01', '2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05',
      '2026-11-06', '2026-11-07', '2026-11-08', '2026-11-09', '2026-11-10',
      '2026-11-11', '2026-11-12', '2026-11-13', '2026-11-14', '2026-11-15'
    ];

    const formatDayLabel = (d) => {
      const parts = d.split('-');
      return `Nov ${parts[2]}`;
    };

    // 1. Daily Admissions (Last 15 Dates)
    const dailyAdmissionsMap = {};
    last15Dates.forEach((d) => (dailyAdmissionsMap[d] = 0));
    students.forEach((s) => {
      if (s.admission_date) {
        const d = s.admission_date.substring(0, 10);
        if (dailyAdmissionsMap[d] !== undefined) {
          dailyAdmissionsMap[d]++;
        }
      }
    });

    const admissionDailyChart = last15Dates.map((d) => ({
      date: d,
      month: formatDayLabel(d),
      label: formatDayLabel(d),
      count: dailyAdmissionsMap[d]
    }));

    // Month-wise admission statistics
    const monthWiseAdmissions = {};
    students.forEach((s) => {
      if (s.admission_date) {
        const month = s.admission_date.substring(0, 7); // YYYY-MM
        monthWiseAdmissions[month] = (monthWiseAdmissions[month] || 0) + 1;
      }
    });
    const admissionMonthlyChart = Object.keys(monthWiseAdmissions)
      .sort()
      .map((m) => ({ month: m, label: m, count: monthWiseAdmissions[m] }));

    // 2. Daily Placements (Last 15 Dates)
    const dailyPlacementsMap = {};
    last15Dates.forEach((d) => (dailyPlacementsMap[d] = 0));
    applications
      .filter((a) => a.result === 'Selected')
      .forEach((a) => {
        const dateStr = a.interview_date || a.updated_at || a.application_date;
        if (dateStr) {
          const d = dateStr.substring(0, 10);
          if (dailyPlacementsMap[d] !== undefined) {
            dailyPlacementsMap[d]++;
          }
        }
      });

    const placementDailyChart = last15Dates.map((d) => ({
      date: d,
      month: formatDayLabel(d),
      label: formatDayLabel(d),
      count: dailyPlacementsMap[d]
    }));

    // Month-wise placement statistics (Applications Selected)
    const monthWisePlacements = {};
    applications
      .filter((a) => a.result === 'Selected')
      .forEach((a) => {
        const dateStr = a.interview_date || a.updated_at || a.application_date;
        if (dateStr) {
          const month = dateStr.substring(0, 7);
          monthWisePlacements[month] = (monthWisePlacements[month] || 0) + 1;
        }
      });
    const placementMonthlyChart = Object.keys(monthWisePlacements)
      .sort()
      .map((m) => ({ month: m, label: m, count: monthWisePlacements[m] }));

    // Default primary charts to 15-day level view
    const admissionChart = admissionDailyChart;
    const placementChart = placementDailyChart;

    // Course-wise student distribution
    const courseMap = {};
    courses.forEach((c) => {
      courseMap[c.course_id] = c.course_name;
    });
    const courseDistribution = {};
    students.forEach((s) => {
      const cName = courseMap[s.course_id] || s.course_id || 'Unassigned';
      courseDistribution[cName] = (courseDistribution[cName] || 0) + 1;
    });
    const courseDistributionChart = Object.entries(courseDistribution).map(([name, count]) => ({
      name,
      count
    }));

    // Batch-wise student distribution
    const batchMap = {};
    batches.forEach((b) => {
      batchMap[b.batch_id] = b.batch_name;
    });
    const batchDistribution = {};
    students.forEach((s) => {
      const bName = batchMap[s.batch_id] || s.batch_id || 'Unassigned';
      batchDistribution[bName] = (batchDistribution[bName] || 0) + 1;
    });
    const batchDistributionChart = Object.entries(batchDistribution).map(([name, count]) => ({
      name,
      count
    }));

    // Application status distribution
    const applicationStatusDistribution = {};
    applications.forEach((a) => {
      const status = a.result || 'Applied';
      applicationStatusDistribution[status] = (applicationStatusDistribution[status] || 0) + 1;
    });
    const applicationStatusChart = Object.entries(applicationStatusDistribution).map(([status, count]) => ({
      status,
      count
    }));

    // Recent Admissions (last 5)
    const recentAdmissions = [...students]
      .sort((a, b) => new Date(b.created_at || b.admission_date) - new Date(a.created_at || a.admission_date))
      .slice(0, 6)
      .map((s) => ({
        ...s,
        course_name: courseMap[s.course_id] || s.course_id,
        batch_name: batchMap[s.batch_id] || s.batch_id
      }));

    // Upcoming Interview Schedules
    const today = new Date().toISOString().split('T')[0];
    const upcomingInterviews = applications
      .filter((a) => a.interview_date && a.interview_date >= today && a.result === 'Interview Scheduled')
      .sort((a, b) => a.interview_date.localeCompare(b.interview_date))
      .slice(0, 5);

    // Upcoming Job Deadlines
    const upcomingDeadlines = requirements
      .filter(
        (r) =>
          r.application_deadline &&
          r.application_deadline >= today &&
          r.requirement_status !== 'Closed' &&
          r.requirement_status !== 'On Hold'
      )
      .sort((a, b) => a.application_deadline.localeCompare(b.application_deadline))
      .slice(0, 5);

    // Pending / Overdue HR Follow-ups
    const pendingFollowups = followups
      .filter((f) => f.status === 'Pending' || f.status === 'Overdue')
      .sort((a, b) => (a.next_followup_date || '').localeCompare(b.next_followup_date || ''))
      .slice(0, 5);

    return res.json({
      success: true,
      stats: {
        totalStudents,
        activeStudents,
        archivedStudents,
        trainingStudents,
        placementStudents,
        totalCourses,
        activeBatches,
        totalCompanies,
        openRequirements,
        totalApplications,
        studentsSelected,
        studentsRejected,
        pendingInterviewResults
      },
      charts: {
        admissionChart,
        admissionDailyChart,
        admissionMonthlyChart,
        placementChart,
        placementDailyChart,
        placementMonthlyChart,
        courseDistributionChart,
        batchDistributionChart,
        applicationStatusChart
      },
      lists: {
        recentAdmissions,
        upcomingInterviews,
        upcomingDeadlines,
        pendingFollowups
      }
    });
  } catch (error) {
    console.error('[DASHBOARD STATS ERROR]', error);
    return res.status(500).json({ success: false, message: 'Failed to compute dashboard metrics' });
  }
};

