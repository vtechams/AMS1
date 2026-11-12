import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  Users,
  UserCheck,
  Archive,
  BookOpen,
  CalendarDays,
  Building2,
  Briefcase,
  FileCheck,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [admissionPeriod, setAdmissionPeriod] = useState('daily'); // 'daily' or 'monthly'
  const [placementPeriod, setPlacementPeriod] = useState('daily'); // 'daily' or 'monthly'

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/stats');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading dashboard analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-700">
        <p className="font-semibold text-sm">Error Loading Dashboard</p>
        <p className="text-xs mt-1">{error}</p>
        <button
          onClick={fetchDashboard}
          className="mt-3 px-3 py-1.5 bg-rose-600 text-white text-xs rounded-lg font-medium hover:bg-rose-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const { stats, charts, lists } = data;

  const statCards = [
    {
      title: 'Total Students',
      value: stats.totalStudents,
      sub: `${stats.activeStudents} Active | ${stats.archivedStudents} Archived`,
      icon: Users,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100'
    },
    {
      title: 'Training Admissions',
      value: stats.trainingStudents,
      sub: 'Skill Development Tracks',
      icon: BookOpen,
      color: 'text-sky-600 bg-sky-50 border-sky-100'
    },
    {
      title: 'Placement Admissions',
      value: stats.placementStudents,
      sub: 'Direct Job Assistance',
      icon: UserCheck,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100'
    },
    {
      title: 'Courses & Batches',
      value: stats.totalCourses,
      sub: `${stats.activeBatches} Active Batches Running`,
      icon: CalendarDays,
      color: 'text-violet-600 bg-violet-50 border-violet-100'
    },
    {
      title: 'Partner Companies',
      value: stats.totalCompanies,
      sub: `${stats.openRequirements} Open Job Requirements`,
      icon: Building2,
      color: 'text-amber-600 bg-amber-50 border-amber-100'
    },
    {
      title: 'Students Selected',
      value: stats.studentsSelected,
      sub: `${stats.studentsRejected} Rejected | ${stats.pendingInterviewResults} Pending`,
      icon: CheckCircle2,
      color: 'text-teal-600 bg-teal-50 border-teal-100'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-2xl text-white shadow-lg">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold tracking-wider uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Academy Operations Central</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Executive Performance Dashboard</h2>
          <p className="text-xs text-slate-300 mt-1">
            Real-time operational metrics across academy operations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/admissions"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
          >
            <span>New Admission</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/requirements"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-all"
          >
            Job Openings
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                  {card.title}
                </span>
                <div className={`p-2 rounded-lg border ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-extrabold text-slate-900 tracking-tight">{card.value}</span>
                <p className="text-[11px] text-slate-500 mt-1 truncate">{card.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Primary Analytics Charts */}
      {(() => {
        const activeAdmissionData =
          admissionPeriod === 'daily'
            ? charts.admissionDailyChart || charts.admissionChart
            : charts.admissionMonthlyChart || charts.admissionChart;

        const activePlacementData =
          placementPeriod === 'daily'
            ? charts.placementDailyChart || charts.placementChart
            : charts.placementMonthlyChart || charts.placementChart;

        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Student Admissions Trend */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Student Admissions Trend</h3>
                  <p className="text-xs text-slate-500">
                    {admissionPeriod === 'daily'
                      ? 'Daily student enrollments across the last 15 days'
                      : 'Monthly student enrollments over time'}
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setAdmissionPeriod('daily')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] transition-all cursor-pointer ${
                      admissionPeriod === 'daily'
                        ? 'bg-white text-indigo-700 shadow-xs font-bold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Last 15 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdmissionPeriod('monthly')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] transition-all cursor-pointer ${
                      admissionPeriod === 'monthly'
                        ? 'bg-white text-indigo-700 shadow-xs font-bold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Monthly Trend
                  </button>
                </div>
              </div>
              <div className="h-64">
                {activeAdmissionData && activeAdmissionData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activeAdmissionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="admissionGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748b' }} interval={0} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '12px'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="#6366f1"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#admissionGrad)"
                        name="Students Admitted"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    No admission data recorded yet.
                  </div>
                )}
              </div>
            </div>

            {/* Placement Success Statistics */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Placement Success Statistics</h3>
                  <p className="text-xs text-slate-500">
                    {placementPeriod === 'daily'
                      ? 'Candidates selected across the last 15 days'
                      : 'Monthly candidate selections by partner companies'}
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setPlacementPeriod('daily')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] transition-all cursor-pointer ${
                      placementPeriod === 'daily'
                        ? 'bg-white text-emerald-700 shadow-xs font-bold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Last 15 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlacementPeriod('monthly')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] transition-all cursor-pointer ${
                      placementPeriod === 'monthly'
                        ? 'bg-white text-emerald-700 shadow-xs font-bold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Monthly Trend
                  </button>
                </div>
              </div>
              <div className="h-64">
                {activePlacementData && activePlacementData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activePlacementData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748b' }} interval={0} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '12px'
                        }}
                      />
                      <Bar
                        dataKey="count"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                        name="Selections"
                        barSize={placementPeriod === 'daily' ? 16 : 32}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    No placement selections recorded yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course-wise student distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Course Distribution</h3>
          <p className="text-xs text-slate-500 mb-4">Enrollment distribution across courses</p>
          <div className="h-56">
            {charts.courseDistributionChart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.courseDistributionChart}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                  >
                    {charts.courseDistributionChart.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '11px'
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={(val) => <span className="text-[10px] text-slate-600">{val}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">No course data</div>
            )}
          </div>
        </div>

        {/* Batch-wise student distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Batch Enrolments</h3>
          <p className="text-xs text-slate-500 mb-4">Active student counts per batch</p>
          <div className="h-56">
            {charts.batchDistributionChart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.batchDistributionChart} layout="vertical" margin={{ left: 10, right: 10 }}>
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#64748b' }} width={90} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '11px'
                    }}
                  />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={16} name="Students" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">No batch data</div>
            )}
          </div>
        </div>

        {/* Placement application status */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Application Pipeline</h3>
          <p className="text-xs text-slate-500 mb-4">Student application stages</p>
          <div className="h-56">
            {charts.applicationStatusChart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.applicationStatusChart}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={65}
                    paddingAngle={3}
                  >
                    {charts.applicationStatusChart.map((entry, index) => (
                      <Cell key={`cell-app-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '11px'
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={(val) => <span className="text-[10px] text-slate-600">{val}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No application data
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actionable Tables / Operational Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Interview Schedules */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Upcoming Interview Schedules</h3>
            </div>
            <Link to="/applications" className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold">
              View All
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {lists.upcomingInterviews.length > 0 ? (
              lists.upcomingInterviews.map((item, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
                  <div>
                    <p className="text-xs font-bold text-slate-800">{item.student_name}</p>
                    <p className="text-[11px] text-slate-500">
                      {item.company_name} • {item.job_role}
                    </p>
                    <span className="inline-block mt-1 text-[10px] font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {item.interview_round || 'Technical Round'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-900">{item.interview_date}</span>
                    <p className="text-[10px] text-emerald-600 font-medium">Scheduled</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-slate-400">No interviews scheduled in near future</div>
            )}
          </div>
        </div>

        {/* Pending HR Follow-ups & Reminders */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900">Pending & Overdue HR Follow-ups</h3>
            </div>
            <Link to="/followups" className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold">
              Manage Tracker
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {lists.pendingFollowups.length > 0 ? (
              lists.pendingFollowups.map((f, idx) => (
                <div key={idx} className="p-4 flex items-start justify-between hover:bg-slate-50/60 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-slate-800">{f.company_name}</p>
                      {f.status === 'Overdue' && (
                        <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded font-bold">
                          OVERDUE
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">{f.discussion_summary}</p>
                    <p className="text-[10px] text-slate-400 mt-1">HR: {f.hr_contact}</p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <span className="text-xs font-semibold text-slate-700">Due: {f.next_followup_date || 'N/A'}</span>
                    <p className="text-[10px] text-slate-500 capitalize">{f.followup_method}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-slate-400">All HR follow-ups are up to date!</div>
            )}
          </div>
        </div>

        {/* Recent Student Admissions */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden lg:col-span-2">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Recent Student Admissions</h3>
            </div>
            <Link to="/students" className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold">
              View All Students
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="px-5 py-3">Student ID</th>
                  <th className="px-5 py-3">Student Name</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Course</th>
                  <th className="px-5 py-3">Admission Date</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lists.recentAdmissions.map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3 font-mono font-medium text-indigo-600">{s.student_id}</td>
                    <td className="px-5 py-3 font-semibold text-slate-800">{s.full_name}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          s.admission_category.includes('Placement')
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-sky-50 text-sky-700 border border-sky-100'
                        }`}
                      >
                        {s.admission_category}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{s.course_name}</td>
                    <td className="px-5 py-3 text-slate-500">{s.admission_date}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                          s.student_status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : s.student_status === 'Placed'
                            ? 'bg-purple-100 text-purple-800 font-bold'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {s.student_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

