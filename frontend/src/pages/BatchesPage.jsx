import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  CalendarDays,
  Plus,
  Edit2,
  Trash2,
  Users,
  ArrowRightLeft,
  Search,
  X,
  CheckCircle,
  GraduationCap
} from 'lucide-react';

export default function BatchesPage() {
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editBatch, setEditBatch] = useState(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [viewBatchDetails, setViewBatchDetails] = useState(null);

  // Forms
  const [formData, setFormData] = useState({
    batch_name: '',
    course_id: '',
    trainer_name: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    batch_status: 'Active'
  });

  const [transferData, setTransferData] = useState({
    student_id: '',
    new_batch_id: '',
    remarks: ''
  });

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/batches?search=${encodeURIComponent(search)}`);
      if (res.data.success) {
        setBatches(res.data.batches || []);
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
        const [cRes, sRes] = await Promise.all([api.get('/courses'), api.get('/students')]);
        if (cRes.data.success) setCourses(cRes.data.courses || []);
        if (sRes.data.success) setStudents(sRes.data.students || []);
      } catch (e) {
        console.error(e);
      }
    }
    loadMeta();
  }, []);

  useEffect(() => {
    fetchBatches();
  }, [search]);

  const handleOpenAdd = () => {
    setEditBatch(null);
    setFormData({
      batch_name: '',
      course_id: courses[0]?.course_id || '',
      trainer_name: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      batch_status: 'Active'
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (b) => {
    setEditBatch(b);
    setFormData({
      batch_name: b.batch_name,
      course_id: b.course_id,
      trainer_name: b.trainer_name,
      start_date: b.start_date,
      end_date: b.end_date || '',
      batch_status: b.batch_status
    });
    setShowAddModal(true);
  };

  const handleSubmitBatch = async (e) => {
    e.preventDefault();
    try {
      if (editBatch) {
        await api.put(`/batches/${editBatch.batch_id}`, formData);
      } else {
        await api.post('/batches', formData);
      }
      setShowAddModal(false);
      fetchBatches();
    } catch (err) {
      alert('Error saving batch: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/batches/transfer-student', transferData);
      alert(res.data.message);
      setShowTransferModal(false);
      fetchBatches();
    } catch (err) {
      alert('Error transferring student: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleViewBatch = async (id) => {
    try {
      const res = await api.get(`/batches/${id}`);
      if (res.data.success) {
        setViewBatchDetails(res.data.batch);
      }
    } catch (err) {
      alert('Failed to load batch: ' + err.message);
    }
  };

  const handleDelete = async (batch) => {
    if (confirm(`Permanently delete batch "${batch.batch_name}" (${batch.batch_id})? This action cannot be undone.`)) {
      try {
        const res = await api.delete(`/batches/${batch.batch_id}`);
        alert(res.data.message || 'Batch deleted successfully');
        fetchBatches();
      } catch (err) {
        alert('Failed to delete: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Batch Management & Cohorts</h2>
          <p className="text-xs text-slate-500 mt-1">
            Organize training schedules, trainers, cohort sizes, and transfer students seamlessly.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setTransferData({
                student_id: students[0]?.student_id || '',
                new_batch_id: batches[0]?.batch_id || '',
                remarks: ''
              });
              setShowTransferModal(true);
            }}
            className="px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowRightLeft className="w-4 h-4 text-indigo-600" />
            <span>Transfer Student</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Batch</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search batches by name, ID, or trainer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500 shadow-xs"
        />
      </div>

      {/* Batches Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px]">
              <tr>
                <th className="px-5 py-3">Batch ID</th>
                <th className="px-5 py-3">Batch Name</th>
                <th className="px-5 py-3">Course</th>
                <th className="px-5 py-3">Trainer</th>
                <th className="px-5 py-3">Duration</th>
                <th className="px-5 py-3">Enrolled</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-5 py-8 text-center text-slate-400">
                    Loading batch cohorts...
                  </td>
                </tr>
              ) : batches.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-5 py-8 text-center text-slate-400">
                    No batches found.
                  </td>
                </tr>
              ) : (
                batches.map((b) => (
                  <tr key={b.batch_id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3 font-mono font-medium text-indigo-600">{b.batch_id}</td>
                    <td className="px-5 py-3 font-semibold text-slate-900">{b.batch_name}</td>
                    <td className="px-5 py-3 text-slate-700">{b.course_name}</td>
                    <td className="px-5 py-3 text-slate-600">{b.trainer_name || 'Unassigned'}</td>
                    <td className="px-5 py-3 text-slate-500">
                      {b.start_date} {b.end_date ? `to ${b.end_date}` : ''}
                    </td>
                    <td className="px-5 py-3">
                      <span className="font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        {b.totalStudents} Students
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          b.batch_status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {b.batch_status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => handleViewBatch(b.batch_id)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-md hover:bg-indigo-50"
                        title="View Roster"
                      >
                        <Users className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(b)}
                        className="p-1.5 text-slate-500 hover:text-amber-600 rounded-md hover:bg-amber-50"
                        title="Edit Batch"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(b)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 rounded-md hover:bg-rose-50"
                        title="Delete Batch Permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Batch Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">
                {editBatch ? `Edit Batch: ${editBatch.batch_id}` : 'Create New Batch'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitBatch} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Batch Name *</label>
                <input
                  type="text"
                  required
                  value={formData.batch_name}
                  onChange={(e) => setFormData({ ...formData, batch_name: e.target.value })}
                  placeholder="e.g. MERN Delta 2026"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Associated Course *</label>
                <select
                  required
                  value={formData.course_id}
                  onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="">Select Course</option>
                  {courses.map((c) => (
                    <option key={c.course_id} value={c.course_id}>
                      {c.course_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Trainer Name</label>
                <input
                  type="text"
                  value={formData.trainer_name}
                  onChange={(e) => setFormData({ ...formData, trainer_name: e.target.value })}
                  placeholder="e.g. Rajesh Nair"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Batch Status</label>
                <select
                  value={formData.batch_status}
                  onChange={(e) => setFormData({ ...formData, batch_status: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="Upcoming">Upcoming</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
                >
                  Save Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Student Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Transfer Student to Another Batch</h3>
              <button onClick={() => setShowTransferModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleTransferSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Student *</label>
                <select
                  required
                  value={transferData.student_id}
                  onChange={(e) => setTransferData({ ...transferData, student_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="">Select Student</option>
                  {students.map((s) => (
                    <option key={s.student_id} value={s.student_id}>
                      {s.full_name} ({s.student_id}) - Currently in: {s.batch_name || 'No Batch'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Batch *</label>
                <select
                  required
                  value={transferData.new_batch_id}
                  onChange={(e) => setTransferData({ ...transferData, new_batch_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="">Select Target Batch</option>
                  {batches.map((b) => (
                    <option key={b.batch_id} value={b.batch_id}>
                      {b.batch_name} ({b.course_name})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Transfer Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. Schedule shift requested by student"
                  value={transferData.remarks}
                  onChange={(e) => setTransferData({ ...transferData, remarks: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
                >
                  Execute Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Batch Students Modal */}
      {viewBatchDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden max-h-[85vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  {viewBatchDetails.batch_name} ({viewBatchDetails.batch_id})
                </h3>
                <p className="text-[11px] text-slate-500">
                  Course: {viewBatchDetails.course?.course_name} | Trainer: {viewBatchDetails.trainer_name || 'N/A'}
                </p>
              </div>
              <button onClick={() => setViewBatchDetails(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Enrolled Students ({viewBatchDetails.students?.length || 0})</span>
                <span className="text-indigo-600">
                  Batch Attendance Rate: {viewBatchDetails.stats?.batchAttendanceRate || 0}%
                </span>
              </div>
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-semibold">
                    <tr>
                      <th className="px-4 py-2">ID</th>
                      <th className="px-4 py-2">Name</th>
                      <th className="px-4 py-2">Email</th>
                      <th className="px-4 py-2">Category</th>
                      <th className="px-4 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {viewBatchDetails.students?.map((s) => (
                      <tr key={s.student_id}>
                        <td className="px-4 py-2 font-mono text-indigo-600">{s.student_id}</td>
                        <td className="px-4 py-2 font-semibold text-slate-800">{s.full_name}</td>
                        <td className="px-4 py-2 text-slate-500">{s.email}</td>
                        <td className="px-4 py-2 text-slate-600">{s.admission_category}</td>
                        <td className="px-4 py-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
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
      )}
    </div>
  );
}

