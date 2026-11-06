import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import {
  FileCheck,
  Plus,
  Edit2,
  Calendar,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  User,
  Building2,
  Trash2,
  X
} from 'lucide-react';

const APPLICATION_RESULTS = [
  'Applied',
  'Resume Shortlisted',
  'Interview Scheduled',
  'Interview Attended',
  'Result Pending',
  'Selected',
  'Rejected',
  'Not Attended',
  'Withdrawn',
  'On Hold'
];

export default function ApplicationsPage() {
  const [searchParams] = useSearchParams();
  const reqParam = searchParams.get('requirementId') || '';

  const [applications, setApplications] = useState([]);
  const [students, setStudents] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [resultFilter, setResultFilter] = useState('');
  const [requirementFilter, setRequirementFilter] = useState(reqParam);

  // Modals
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [editApp, setEditApp] = useState(null);

  // Apply Form
  const [applyForm, setApplyForm] = useState({
    student_id: '',
    requirement_id: reqParam || '',
    resume_submission_status: 'Submitted',
    remarks: ''
  });

  // Edit Workflow Form
  const [editForm, setEditForm] = useState({
    resume_submission_status: 'Submitted',
    interview_date: '',
    interview_round: '',
    interview_attendance: 'Scheduled',
    hr_feedback: '',
    result: 'Applied',
    follow_up_date: '',
    remarks: ''
  });

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (resultFilter) params.append('result', resultFilter);
      if (requirementFilter) params.append('requirementId', requirementFilter);

      const res = await api.get(`/applications?${params.toString()}`);
      if (res.data.success) {
        setApplications(res.data.applications || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function loadMeta() {
      try {
        const [sRes, rRes] = await Promise.all([api.get('/students'), api.get('/requirements')]);
        if (sRes.data.success) setStudents(sRes.data.students || []);
        if (rRes.data.success) setRequirements(rRes.data.requirements || []);
      } catch (e) {
        console.error(e);
      }
    }
    loadMeta();
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [search, resultFilter, requirementFilter]);

  const handleOpenApply = () => {
    setApplyForm({
      student_id: students[0]?.student_id || '',
      requirement_id: requirements[0]?.requirement_id || '',
      resume_submission_status: 'Submitted',
      remarks: ''
    });
    setShowApplyModal(true);
  };

  const handleOpenEdit = (app) => {
    setEditApp(app);
    setEditForm({
      resume_submission_status: app.resume_submission_status || 'Submitted',
      interview_date: app.interview_date || '',
      interview_round: app.interview_round || 'Round 1 - Technical',
      interview_attendance: app.interview_attendance || 'Pending',
      hr_feedback: app.hr_feedback || '',
      result: app.result || 'Applied',
      follow_up_date: app.follow_up_date || '',
      remarks: app.remarks || ''
    });
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/applications', applyForm);
      if (res.data.success) {
        setShowApplyModal(false);
        fetchApplications();
      }
    } catch (err) {
      alert('Error submitting application: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/applications/${editApp.application_id}`, editForm);
      if (res.data.success) {
        setEditApp(null);
        fetchApplications();
      }
    } catch (err) {
      alert('Error updating application: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (app) => {
    if (confirm(`Delete application for ${app.student_name} (${app.application_id})?`)) {
      try {
        const res = await api.delete(`/applications/${app.application_id}`);
        alert(res.data.message || 'Application deleted');
        fetchApplications();
      } catch (err) {
        alert('Failed to delete: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Student Placement Applications</h2>
          <p className="text-xs text-slate-500 mt-1">
            Track interview pipeline progression from submission to offer releases with Excel record preservation.
          </p>
        </div>
        <button
          onClick={handleOpenApply}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 cursor-pointer self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Apply Student</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search candidate, company, role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          />
        </div>

        <div>
          <select
            value={requirementFilter}
            onChange={(e) => setRequirementFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          >
            <option value="">All Job Requirements</option>
            {requirements.map((r) => (
              <option key={r.requirement_id} value={r.requirement_id}>
                {r.job_role} @ {r.company_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={resultFilter}
            onChange={(e) => setResultFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          >
            <option value="">All Results / Stages</option>
            {APPLICATION_RESULTS.map((res) => (
              <option key={res} value={res}>
                {res}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px]">
              <tr>
                <th className="px-5 py-3">App ID</th>
                <th className="px-5 py-3">Candidate</th>
                <th className="px-5 py-3">Company & Role</th>
                <th className="px-5 py-3">Applied Date</th>
                <th className="px-5 py-3">Interview Schedule</th>
                <th className="px-5 py-3">Stage / Result</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-5 py-8 text-center text-slate-400">
                    Loading applications...
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-8 text-center text-slate-400">
                    No applications found matching filters.
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.application_id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3 font-mono font-medium text-indigo-600">{app.application_id}</td>
                    <td className="px-5 py-3 font-semibold text-slate-900">
                      <div>{app.student_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{app.student_id}</div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="font-semibold text-slate-800">{app.company_name}</div>
                      <div className="text-[10px] text-slate-500">{app.job_role}</div>
                    </td>
                    <td className="px-5 py-3 text-slate-500">{app.application_date}</td>
                    <td className="px-5 py-3">
                      {app.interview_date ? (
                        <div>
                          <div className="font-semibold text-slate-800">{app.interview_date}</div>
                          <div className="text-[10px] text-indigo-600">{app.interview_round}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Not scheduled</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          app.result === 'Selected'
                            ? 'bg-purple-100 text-purple-800'
                            : app.result === 'Rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : app.result === 'Interview Scheduled'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-indigo-50 text-indigo-700'
                        }`}
                      >
                        {app.result}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(app)}
                          className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 rounded-lg font-medium transition-colors"
                        >
                          Update Stage
                        </button>
                        <button
                          onClick={() => handleDelete(app)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                          title="Delete Application"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Student Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Submit Student Application</h3>
              <button onClick={() => setShowApplyModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleApplySubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Student *</label>
                <select
                  required
                  value={applyForm.student_id}
                  onChange={(e) => setApplyForm({ ...applyForm, student_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="">Select Candidate</option>
                  {students
                    .filter((s) => s.student_status !== 'Archived')
                    .map((s) => (
                      <option key={s.student_id} value={s.student_id}>
                        {s.full_name} ({s.student_id}) - {s.course_name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Requirement *</label>
                <select
                  required
                  value={applyForm.requirement_id}
                  onChange={(e) => setApplyForm({ ...applyForm, requirement_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="">Select Opening</option>
                  {requirements
                    .filter((r) => r.requirement_status !== 'Closed')
                    .map((r) => (
                      <option key={r.requirement_id} value={r.requirement_id}>
                        {r.job_role} @ {r.company_name} ({r.vacanciesRemaining} vacancies)
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Resume Submission</label>
                <select
                  value={applyForm.resume_submission_status}
                  onChange={(e) => setApplyForm({ ...applyForm, resume_submission_status: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="Submitted">Submitted to HR</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Pending">Pending Review</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Remarks</label>
                <input
                  type="text"
                  placeholder="Optional notes"
                  value={applyForm.remarks}
                  onChange={(e) => setApplyForm({ ...applyForm, remarks: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Stage Modal */}
      {editApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Update Stage: {editApp.student_name}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {editApp.company_name} • {editApp.job_role}
                </p>
              </div>
              <button onClick={() => setEditApp(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Workflow Status *</label>
                <select
                  required
                  value={editForm.result}
                  onChange={(e) => setEditForm({ ...editForm, result: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                >
                  {APPLICATION_RESULTS.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Interview Date</label>
                  <input
                    type="date"
                    value={editForm.interview_date}
                    onChange={(e) => setEditForm({ ...editForm, interview_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Interview Round</label>
                  <input
                    type="text"
                    placeholder="e.g. Technical Round 1"
                    value={editForm.interview_round}
                    onChange={(e) => setEditForm({ ...editForm, interview_round: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Interview Attendance</label>
                <select
                  value={editForm.interview_attendance}
                  onChange={(e) => setEditForm({ ...editForm, interview_attendance: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="Pending">Pending</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Attended">Attended</option>
                  <option value="Not Attended">Not Attended</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">HR Feedback & Evaluation</label>
                <textarea
                  rows="2"
                  placeholder="Feedback from interviewers or HR discussion..."
                  value={editForm.hr_feedback}
                  onChange={(e) => setEditForm({ ...editForm, hr_feedback: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditApp(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
                >
                  Save Application Stage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

