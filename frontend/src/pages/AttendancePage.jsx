import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  ClipboardCheck,
  Calendar,
  Save,
  CheckCheck,
  XCircle,
  BarChart2,
  AlertCircle,
  CheckCircle2,
  Users
} from 'lucide-react';

export default function AttendancePage() {
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // View Mode: 'daily' or 'monthly'
  const [viewMode, setViewMode] = useState('daily');
  const [monthlyReport, setMonthlyReport] = useState(null);
  const [monthlyLoading, setMonthlyLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7));

  useEffect(() => {
    async function loadMeta() {
      try {
        const [cRes, bRes] = await Promise.all([api.get('/courses'), api.get('/batches')]);
        if (cRes.data.success) {
          setCourses(cRes.data.courses || []);
          if (cRes.data.courses?.length > 0) setSelectedCourse(cRes.data.courses[0].course_id);
        }
        if (bRes.data.success) {
          setBatches(bRes.data.batches || []);
          if (bRes.data.batches?.length > 0) setSelectedBatch(bRes.data.batches[0].batch_id);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadMeta();
  }, []);

  const fetchDailyAttendance = async () => {
    if (!selectedBatch || !selectedDate) return;
    try {
      setLoading(true);
      setFeedback({ type: '', message: '' });
      const res = await api.get(`/attendance/daily?batch_id=${selectedBatch}&date=${selectedDate}`);
      if (res.data.success) {
        setStudents(res.data.students || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyReport = async () => {
    if (!selectedBatch || !selectedMonth) return;
    try {
      setMonthlyLoading(true);
      const res = await api.get(`/attendance/monthly-report?batch_id=${selectedBatch}&month=${selectedMonth}`);
      if (res.data.success) {
        setMonthlyReport(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setMonthlyLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode === 'daily') {
      fetchDailyAttendance();
    } else {
      fetchMonthlyReport();
    }
  }, [selectedBatch, selectedDate, selectedMonth, viewMode]);

  const handleStatusChange = (studentId, status) => {
    setStudents((prev) =>
      prev.map((s) => (s.student_id === studentId ? { ...s, attendance_status: status } : s))
    );
  };

  const handleRemarksChange = (studentId, remarks) => {
    setStudents((prev) =>
      prev.map((s) => (s.student_id === studentId ? { ...s, remarks } : s))
    );
  };

  const handleMarkAll = (status) => {
    setStudents((prev) => prev.map((s) => ({ ...s, attendance_status: status })));
  };

  const handleSaveAttendance = async () => {
    if (!selectedBatch || !selectedDate) return;
    try {
      setSaveLoading(true);
      setFeedback({ type: '', message: '' });

      const entries = students.map((s) => ({
        student_id: s.student_id,
        attendance_status: s.attendance_status,
        remarks: s.remarks || ''
      }));

      const res = await api.post('/attendance/save', {
        batch_id: selectedBatch,
        date: selectedDate,
        entries
      });

      if (res.data.success) {
        setFeedback({
          type: 'success',
          message: `Attendance for ${selectedDate} saved successfully!`
        });
        fetchDailyAttendance();
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to record attendance'
      });
    } finally {
      setSaveLoading(false);
    }
  };

  const filteredBatches = batches.filter((b) => !selectedCourse || b.course_id === selectedCourse);

  const presentCount = students.filter((s) => s.attendance_status === 'Present').length;
  const absentCount = students.filter((s) => s.attendance_status === 'Absent').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Daily Batch Attendance Register</h2>
          <p className="text-xs text-slate-500 mt-1">
            Track daily attendance records, prevent duplicates, and calculate student percentage metrics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('daily')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'daily'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Daily Register
          </button>
          <button
            onClick={() => setViewMode('monthly')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'monthly'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Monthly Summary Report
          </button>
        </div>
      </div>

      {/* Control Bar: Course, Batch, Date Pickers */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Filter by Course</label>
            <select
              value={selectedCourse}
              onChange={(e) => {
                setSelectedCourse(e.target.value);
                const matching = batches.filter((b) => b.course_id === e.target.value);
                if (matching.length > 0) setSelectedBatch(matching[0].batch_id);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            >
              <option value="">All Courses</option>
              {courses.map((c) => (
                <option key={c.course_id} value={c.course_id}>
                  {c.course_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Batch *</label>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            >
              {filteredBatches.map((b) => (
                <option key={b.batch_id} value={b.batch_id}>
                  {b.batch_name} ({b.trainer_name || 'No Trainer'})
                </option>
              ))}
            </select>
          </div>

          {viewMode === 'daily' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Attendance Date *</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Month (YYYY-MM)</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          )}
        </div>
      </div>

      {feedback.message && (
        <div
          className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-medium ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Daily Register View */}
      {viewMode === 'daily' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="text-slate-800">
                Enrolled: <strong className="text-indigo-600">{students.length}</strong>
              </span>
              <span className="text-emerald-700">
                Present: <strong>{presentCount}</strong>
              </span>
              <span className="text-rose-700">
                Absent: <strong>{absentCount}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleMarkAll('Present')}
                className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-medium hover:bg-emerald-100"
              >
                Mark All Present
              </button>
              <button
                type="button"
                onClick={() => handleMarkAll('Absent')}
                className="px-2.5 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-medium hover:bg-rose-100"
              >
                Mark All Absent
              </button>
              <button
                type="button"
                onClick={handleSaveAttendance}
                disabled={saveLoading || students.length === 0}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saveLoading ? 'Saving...' : 'Save Attendance'}</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="px-5 py-3">Student ID</th>
                  <th className="px-5 py-3">Student Name</th>
                  <th className="px-5 py-3">Phone</th>
                  <th className="px-5 py-3 text-center">Status</th>
                  <th className="px-5 py-3">Remarks / Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-5 py-8 text-center text-slate-400">
                      Loading attendance records...
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-5 py-8 text-center text-slate-400">
                      No active students found in this batch.
                    </td>
                  </tr>
                ) : (
                  students.map((stu) => (
                    <tr key={stu.student_id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3 font-mono font-medium text-indigo-600">{stu.student_id}</td>
                      <td className="px-5 py-3 font-semibold text-slate-900">{stu.full_name}</td>
                      <td className="px-5 py-3 text-slate-500">{stu.phone_number || 'N/A'}</td>
                      <td className="px-5 py-3 text-center">
                        <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                          {['Present', 'Absent', 'Late', 'Excused'].map((status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() => handleStatusChange(stu.student_id, status)}
                              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                                stu.attendance_status === status
                                  ? status === 'Present'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : status === 'Absent'
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : 'bg-amber-600 text-white shadow-xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <input
                          type="text"
                          placeholder="Optional notes or excuse"
                          value={stu.remarks || ''}
                          onChange={(e) => handleRemarksChange(stu.student_id, e.target.value)}
                          className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs"
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Monthly Summary View */}
      {viewMode === 'monthly' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden p-5">
          <h3 className="font-bold text-slate-900 text-sm mb-4">
            Monthly Attendance Roster for {selectedMonth}
          </h3>
          {monthlyLoading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading monthly breakdown...</div>
          ) : !monthlyReport || monthlyReport.report?.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No attendance records logged for this batch in {selectedMonth}.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-600 text-[10px] uppercase font-semibold">
                  <tr>
                    <th className="p-2 border border-slate-200">ID</th>
                    <th className="p-2 border border-slate-200">Name</th>
                    <th className="p-2 border border-slate-200 text-center">Present</th>
                    <th className="p-2 border border-slate-200 text-center">Absent</th>
                    <th className="p-2 border border-slate-200 text-center">% Rate</th>
                    {monthlyReport.dates.map((d) => (
                      <th key={d} className="p-2 border border-slate-200 text-center font-mono">
                        {d.substring(8)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {monthlyReport.report.map((item) => (
                    <tr key={item.student_id} className="hover:bg-slate-50/60">
                      <td className="p-2 border border-slate-200 font-mono text-indigo-600">
                        {item.student_id}
                      </td>
                      <td className="p-2 border border-slate-200 font-semibold text-slate-800">
                        {item.full_name}
                      </td>
                      <td className="p-2 border border-slate-200 text-center text-emerald-600 font-bold">
                        {item.presentCount}
                      </td>
                      <td className="p-2 border border-slate-200 text-center text-rose-600 font-bold">
                        {item.absentCount}
                      </td>
                      <td className="p-2 border border-slate-200 text-center font-bold text-slate-900">
                        {item.percentage}%
                      </td>
                      {monthlyReport.dates.map((d) => {
                        const status = item.daily[d];
                        return (
                          <td
                            key={d}
                            className={`p-2 border border-slate-200 text-center font-bold ${
                              status === 'Present'
                                ? 'text-emerald-600 bg-emerald-50/30'
                                : status === 'Absent'
                                ? 'text-rose-600 bg-rose-50/30'
                                : 'text-slate-400'
                            }`}
                          >
                            {status === 'Present' ? 'P' : status === 'Absent' ? 'A' : status || '-'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

