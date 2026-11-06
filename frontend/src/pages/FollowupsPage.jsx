import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  PhoneCall,
  Plus,
  Clock,
  AlertTriangle,
  CheckCircle,
  Search,
  Filter,
  X,
  Calendar,
  MessageSquare,
  Building2
} from 'lucide-react';

export default function FollowupsPage() {
  const [followups, setFollowups] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [overdueOnly, setOverdueOnly] = useState(false);

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editFollowup, setEditFollowup] = useState(null);

  const [formData, setFormData] = useState({
    requirement_id: '',
    company_id: '',
    hr_contact: '',
    followup_date: new Date().toISOString().split('T')[0],
    followup_method: 'Call',
    discussion_summary: '',
    hr_response: '',
    next_followup_date: '',
    responsible_person: 'Admin',
    status: 'Pending'
  });

  const fetchFollowups = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (overdueOnly) params.append('overdueOnly', 'true');

      const res = await api.get(`/followups?${params.toString()}`);
      if (res.data.success) {
        setFollowups(res.data.followups || []);
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
        const [rRes, cRes] = await Promise.all([api.get('/requirements'), api.get('/companies')]);
        if (rRes.data.success) setRequirements(rRes.data.requirements || []);
        if (cRes.data.success) setCompanies(cRes.data.companies || []);
      } catch (e) {
        console.error(e);
      }
    }
    loadMeta();
  }, []);

  useEffect(() => {
    fetchFollowups();
  }, [statusFilter, overdueOnly]);

  const handleOpenAdd = () => {
    setEditFollowup(null);
    setFormData({
      requirement_id: requirements[0]?.requirement_id || '',
      company_id: '',
      hr_contact: '',
      followup_date: new Date().toISOString().split('T')[0],
      followup_method: 'Call',
      discussion_summary: '',
      hr_response: '',
      next_followup_date: '',
      responsible_person: 'Admin',
      status: 'Pending'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (f) => {
    setEditFollowup(f);
    setFormData({
      requirement_id: f.requirement_id,
      company_id: f.company_id,
      hr_contact: f.hr_contact || '',
      followup_date: f.followup_date,
      followup_method: f.followup_method || 'Call',
      discussion_summary: f.discussion_summary,
      hr_response: f.hr_response || '',
      next_followup_date: f.next_followup_date || '',
      responsible_person: f.responsible_person || 'Admin',
      status: f.status || 'Pending'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editFollowup) {
        await api.put(`/followups/${editFollowup.followup_id}`, formData);
      } else {
        await api.post('/followups', formData);
      }
      setShowModal(false);
      fetchFollowups();
    } catch (err) {
      alert('Error saving follow-up: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleMarkComplete = async (f) => {
    try {
      await api.put(`/followups/${f.followup_id}`, { status: 'Completed' });
      fetchFollowups();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">HR Follow-Up Management</h2>
          <p className="text-xs text-slate-500 mt-1">
            Track communication cadences (24h/48h rules), interview feedbacks, and pending result discussions.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 cursor-pointer self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Log HR Follow-Up</span>
        </button>
      </div>

      {/* Rules Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
            24h
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">Initial Scheduling Rule</p>
            <p className="text-[11px] text-slate-500">Contact HR within 24h if interview slot is unassigned.</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs shrink-0">
            48h
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">Feedback Follow-Up</p>
            <p className="text-[11px] text-slate-500">Follow up within 48h when response is pending.</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">
            ✓
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">Outcome Recording</p>
            <p className="text-[11px] text-slate-500">Log written HR confirmation for student placements.</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending Action</option>
            <option value="Completed">Completed</option>
            <option value="Overdue">Overdue</option>
          </select>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={overdueOnly}
              onChange={(e) => setOverdueOnly(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span>Show Only Overdue Follow-ups</span>
          </label>
        </div>
      </div>

      {/* Follow-ups List */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white rounded-xl p-8 text-center text-xs text-slate-400">
            Loading follow-up communication logs...
          </div>
        ) : followups.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-xs text-slate-400">
            No follow-ups found matching filters.
          </div>
        ) : (
          followups.map((f) => (
            <div
              key={f.followup_id}
              className={`bg-white rounded-xl border p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                f.isOverdue ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200/80'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    {f.followup_id}
                  </span>
                  <span className="font-bold text-slate-900 text-sm">{f.company_name}</span>
                  {f.isOverdue && (
                    <span className="bg-rose-100 text-rose-700 font-bold text-[10px] px-2 py-0.5 rounded-full border border-rose-200">
                      OVERDUE
                    </span>
                  )}
                  <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium capitalize">
                    {f.followup_method}
                  </span>
                </div>
                <p className="text-xs text-slate-700 font-medium">{f.discussion_summary}</p>
                {f.hr_response && (
                  <p className="text-[11px] text-slate-500 italic">HR Response: {f.hr_response}</p>
                )}
                <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                  <span>Contact: {f.hr_contact || 'N/A'}</span>
                  <span>Logged Date: {f.followup_date}</span>
                  <span className={f.isOverdue ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                    Next Follow-up Due: {f.next_followup_date || 'N/A'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                {f.status !== 'Completed' && (
                  <button
                    onClick={() => handleMarkComplete(f)}
                    className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Mark Done
                  </button>
                )}
                <button
                  onClick={() => handleOpenEdit(f)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Edit
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Follow-up Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">
                {editFollowup ? `Edit Follow-Up: ${editFollowup.followup_id}` : 'Log Corporate HR Follow-Up'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Job Requirement *</label>
                <select
                  required
                  value={formData.requirement_id}
                  onChange={(e) => setFormData({ ...formData, requirement_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="">Select Requirement</option>
                  {requirements.map((r) => (
                    <option key={r.requirement_id} value={r.requirement_id}>
                      {r.job_role} @ {r.company_name} ({r.requirement_id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Follow-up Date</label>
                  <input
                    type="date"
                    value={formData.followup_date}
                    onChange={(e) => setFormData({ ...formData, followup_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Method</label>
                  <select
                    value={formData.followup_method}
                    onChange={(e) => setFormData({ ...formData, followup_method: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="Call">Phone Call</option>
                    <option value="Email">Email</option>
                    <option value="Message">WhatsApp / Message</option>
                    <option value="Meeting">Virtual Meeting</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Discussion Summary *</label>
                <textarea
                  rows="2"
                  required
                  placeholder="Summary of discussion with HR, scheduling questions, feedback..."
                  value={formData.discussion_summary}
                  onChange={(e) => setFormData({ ...formData, discussion_summary: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">HR Response / Commitments</label>
                <input
                  type="text"
                  placeholder="e.g. Will confirm slots by tomorrow 2 PM"
                  value={formData.hr_response}
                  onChange={(e) => setFormData({ ...formData, hr_response: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Next Follow-up Due</label>
                  <input
                    type="date"
                    value={formData.next_followup_date}
                    onChange={(e) => setFormData({ ...formData, next_followup_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
                >
                  Save Follow-Up Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

