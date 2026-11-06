import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  BarChart3,
  Download,
  Calendar,
  Users,
  Briefcase,
  GraduationCap,
  Building2,
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('placements'); // 'placements' | 'admissions' | 'batches'
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchReportData = async () => {
    try {
      setLoading(true);
      let url = `/reports/${activeTab}`;
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await api.get(url);
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [activeTab, startDate, endDate]);

  const [exportingMaster, setExportingMaster] = useState(false);

  const handleExport = () => {
    window.open(`${api.defaults.baseURL}/reports/export/${activeTab}`, '_blank');
  };

  const handleExportMaster = async () => {
    try {
      setExportingMaster(true);
      const res = await api.get('/reports/export-full-database', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      const today = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `Academy_Database_Complete_${today}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      alert('Failed to download master Excel: ' + (err.response?.data?.message || err.message));
    } finally {
      setExportingMaster(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Reports & Executive Analytics</h2>
          <p className="text-xs text-slate-500 mt-1">
            Generate and export comprehensive audits on admissions, cohort health, and corporate placements.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExport}
            className="px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-slate-400" />
            <span>Export {activeTab.toUpperCase()}</span>
          </button>
          <button
            onClick={handleExportMaster}
            disabled={exportingMaster}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
            <span>{exportingMaster ? 'Generating...' : 'Download Complete Excel (All Sheets)'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { key: 'placements', label: 'Placement Reports', icon: Briefcase },
          { key: 'admissions', label: 'Admission Reports', icon: Users },
          { key: 'batches', label: 'Batch & Attendance Reports', icon: GraduationCap }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Date Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-4 text-xs">
        <span className="font-semibold text-slate-700">Filter By Date Range:</span>
        <div className="flex items-center gap-2">
          <label className="text-slate-500">From:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-slate-500">To:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          />
        </div>
        {(startDate || endDate) && (
          <button
            onClick={() => {
              setStartDate('');
              setEndDate('');
            }}
            className="text-xs text-indigo-600 hover:underline"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Content for Active Tab */}
      {loading ? (
        <div className="bg-white rounded-xl p-12 text-center text-xs text-slate-400">
          Compiling analytics reports...
        </div>
      ) : !data ? (
        <div className="bg-white rounded-xl p-12 text-center text-xs text-slate-400">
          No report data available.
        </div>
      ) : activeTab === 'placements' ? (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Requirements</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">{data.summary.totalRequirements}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Applications</span>
              <p className="text-2xl font-bold text-indigo-600 mt-1">{data.summary.totalApplications}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Selected Students</span>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{data.summary.selectedCount}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Pending Results</span>
              <p className="text-2xl font-bold text-amber-600 mt-1">{data.summary.pendingCount}</p>
            </div>
          </div>

          {/* Company Breakdown Table */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Company-Wise Application & Selection Audit</h3>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="px-5 py-3">Company</th>
                  <th className="px-5 py-3 text-center">Total Candidates Applied</th>
                  <th className="px-5 py-3 text-center">Selected</th>
                  <th className="px-5 py-3 text-center">Rejected</th>
                  <th className="px-5 py-3 text-center">Pending / In Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.companyBreakdown?.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3 font-semibold text-slate-800">{item.company}</td>
                    <td className="px-5 py-3 text-center font-bold text-slate-900">{item.total}</td>
                    <td className="px-5 py-3 text-center font-bold text-emerald-600">{item.selected}</td>
                    <td className="px-5 py-3 text-center font-bold text-rose-600">{item.rejected}</td>
                    <td className="px-5 py-3 text-center font-bold text-amber-600">{item.pending}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Role Breakdown Table */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Role-Wise Demand & Hires</h3>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="px-5 py-3">Job Role</th>
                  <th className="px-5 py-3 text-center">Total Applications</th>
                  <th className="px-5 py-3 text-center">Students Placed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.roleBreakdown?.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3 font-semibold text-slate-800">{item.role}</td>
                    <td className="px-5 py-3 text-center font-bold text-slate-900">{item.total}</td>
                    <td className="px-5 py-3 text-center font-bold text-emerald-600">{item.selected}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'admissions' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Admissions</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">{data.summary.total}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Training Track</span>
              <p className="text-2xl font-bold text-sky-600 mt-1">{data.summary.training}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Placement Track</span>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{data.summary.placement}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Placed Students</span>
              <p className="text-2xl font-bold text-purple-600 mt-1">{data.summary.placed}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Monthly Admissions Breakdown</h3>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="px-5 py-3">Month</th>
                  <th className="px-5 py-3 text-center">Training Admissions</th>
                  <th className="px-5 py-3 text-center">Placement Admissions</th>
                  <th className="px-5 py-3 text-center">Total Monthly Inflow</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.monthData?.map((m, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3 font-semibold text-slate-800">{m.month}</td>
                    <td className="px-5 py-3 text-center font-bold text-sky-600">{m.training}</td>
                    <td className="px-5 py-3 text-center font-bold text-emerald-600">{m.placement}</td>
                    <td className="px-5 py-3 text-center font-bold text-slate-900">{m.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Batches Tab */
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Courses</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">{data.summary.totalCourses}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Active Batches</span>
              <p className="text-2xl font-bold text-indigo-600 mt-1">{data.summary.activeBatches}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Completed Batches</span>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{data.summary.completedBatches}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Batches</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">{data.summary.totalBatches}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Batch Capacity & Overall Attendance Rate</h3>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="px-5 py-3">Batch</th>
                  <th className="px-5 py-3">Course</th>
                  <th className="px-5 py-3">Trainer</th>
                  <th className="px-5 py-3 text-center">Students Enrolled</th>
                  <th className="px-5 py-3 text-center">Attendance Logged</th>
                  <th className="px-5 py-3 text-center">Overall Attendance Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.batchSummary?.map((b) => (
                  <tr key={b.batch_id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3 font-semibold text-slate-800">{b.batch_name}</td>
                    <td className="px-5 py-3 text-slate-600">{b.course_name}</td>
                    <td className="px-5 py-3 text-slate-500">{b.trainer_name || 'N/A'}</td>
                    <td className="px-5 py-3 text-center font-bold text-indigo-600">{b.enrolledCount}</td>
                    <td className="px-5 py-3 text-center text-slate-600">{b.totalAttendanceEntries}</td>
                    <td className="px-5 py-3 text-center font-bold text-slate-900">{b.attendanceRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

