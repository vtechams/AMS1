import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Users,
  Search,
  Filter,
  Download,
  Plus,
  Edit2,
  Archive,
  RotateCcw,
  Eye,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  X,
  GraduationCap,
  Trash2
} from 'lucide-react';

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [batchFilter, setBatchFilter] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [viewStudent, setViewStudent] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    address: '',
    admission_category: 'Placement Admission',
    course_id: '',
    batch_id: '',
    admission_date: new Date().toISOString().split('T')[0],
    educational_qualification: '',
    training_status: 'In Progress',
    placement_eligibility: 'Eligible',
    student_status: 'Active'
  });

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (categoryFilter) params.append('category', categoryFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (courseFilter) params.append('courseId', courseFilter);
      if (batchFilter) params.append('batchId', batchFilter);

      const res = await api.get(`/students?${params.toString()}`);
      if (res.data.success) {
        setStudents(res.data.students || []);
      }
    } catch (err) {
      console.error('Error fetching students', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function loadMeta() {
      try {
        const [cRes, bRes] = await Promise.all([api.get('/courses'), api.get('/batches')]);
        if (cRes.data.success) setCourses(cRes.data.courses || []);
        if (bRes.data.success) setBatches(bRes.data.batches || []);
      } catch (e) {
        console.error(e);
      }
    }
    loadMeta();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, categoryFilter, statusFilter, courseFilter, batchFilter]);

  const handleOpenAdd = () => {
    setFormData({
      full_name: '',
      email: '',
      phone_number: '',
      address: '',
      admission_category: 'Placement Admission',
      course_id: courses[0]?.course_id || '',
      batch_id: '',
      admission_date: new Date().toISOString().split('T')[0],
      educational_qualification: '',
      training_status: 'In Progress',
      placement_eligibility: 'Eligible',
      student_status: 'Active'
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (stu) => {
    setEditStudent(stu);
    setFormData({
      full_name: stu.full_name || '',
      email: stu.email || '',
      phone_number: stu.phone_number || '',
      address: stu.address || '',
      admission_category: stu.admission_category || 'Training Admission',
      course_id: stu.course_id || '',
      batch_id: stu.batch_id || '',
      admission_date: stu.admission_date || '',
      educational_qualification: stu.educational_qualification || '',
      training_status: stu.training_status || 'In Progress',
      placement_eligibility: stu.placement_eligibility || 'Eligible',
      student_status: stu.student_status || 'Active'
    });
  };

  const handleOpenView = async (id) => {
    setViewLoading(true);
    setViewStudent(null);
    try {
      const res = await api.get(`/students/${id}`);
      if (res.data.success) {
        setViewStudent(res.data.student);
      }
    } catch (err) {
      alert('Failed to load student details: ' + (err.response?.data?.message || err.message));
    } finally {
      setViewLoading(false);
    }
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    try {
      if (editStudent) {
        await api.put(`/students/${editStudent.student_id}`, formData);
      } else {
        await api.post('/students', formData);
      }
      setShowAddModal(false);
      setEditStudent(null);
      fetchStudents();
    } catch (err) {
      alert('Error saving student: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleArchive = async (id) => {
    if (confirm('Archive this student? Their historical placement & attendance records will be preserved.')) {
      try {
        await api.put(`/students/${id}/archive`);
        fetchStudents();
      } catch (err) {
        alert('Failed to archive: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleRestore = async (id) => {
    try {
      await api.put(`/students/${id}/restore`);
      fetchStudents();
    } catch (err) {
      alert('Failed to restore: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (stu) => {
    if (confirm(`Are you sure you want to permanently delete student ${stu.full_name} (${stu.student_id})?`)) {
      try {
        await api.delete(`/students/${stu.student_id}`);
        fetchStudents();
      } catch (err) {
        alert('Failed to delete: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleExport = () => {
    window.open(`${api.defaults.baseURL}/students/export`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Student Records & Directory</h2>
          <p className="text-xs text-slate-500 mt-1">
            Search, filter, edit, delete, archive and export student profiles.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExport}
            className="px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Export to Excel</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, ID, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Categories</option>
              <option value="Placement Admission">Placement Admission</option>
              <option value="Training Admission">Training Admission</option>
            </select>
          </div>

          {/* Course Filter */}
          <div>
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Courses</option>
              {courses.map((c) => (
                <option key={c.course_id} value={c.course_id}>
                  {c.course_name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Placed">Placed</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px]">
              <tr>
                <th className="px-5 py-3">ID</th>
                <th className="px-5 py-3">Student Name</th>
                <th className="px-5 py-3">Contact</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Course / Batch</th>
                <th className="px-5 py-3">Eligibility</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-5 py-8 text-center text-slate-400">
                    <div className="inline-block w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mr-2 align-middle" />
                    Loading student records...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-5 py-8 text-center text-slate-400">
                    No student records found matching filters.
                  </td>
                </tr>
              ) : (
                students.map((stu) => (
                  <tr key={stu.student_id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3 font-mono font-medium text-indigo-600">{stu.student_id}</td>
                    <td className="px-5 py-3 font-semibold text-slate-900">
                      <div>{stu.full_name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{stu.educational_qualification}</div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="text-slate-800">{stu.email}</div>
                      <div className="text-[10px] text-slate-500">{stu.phone_number}</div>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          stu.admission_category.includes('Placement')
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-sky-50 text-sky-700 border border-sky-100'
                        }`}
                      >
                        {stu.admission_category}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="text-slate-800">{stu.course_name}</div>
                      <div className="text-[10px] text-slate-500">{stu.batch_name || 'No Batch'}</div>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                          stu.placement_eligibility === 'Eligible'
                            ? 'bg-emerald-100 text-emerald-800'
                            : stu.placement_eligibility === 'Not Eligible'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {stu.placement_eligibility}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          stu.student_status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : stu.student_status === 'Placed'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {stu.student_status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenView(stu.student_id)}
                        title="View Profile"
                        className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-md hover:bg-indigo-50 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(stu)}
                        title="Edit Details"
                        className="p-1.5 text-slate-500 hover:text-amber-600 rounded-md hover:bg-amber-50 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {stu.student_status === 'Archived' ? (
                        <button
                          onClick={() => handleRestore(stu.student_id)}
                          title="Restore Student"
                          className="p-1.5 text-emerald-600 hover:text-emerald-700 rounded-md hover:bg-emerald-50 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleArchive(stu.student_id)}
                          title="Archive Student (Preserve Records)"
                          className="p-1.5 text-slate-400 hover:text-amber-600 rounded-md hover:bg-amber-50 cursor-pointer"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(stu)}
                        title="Permanently Delete Student"
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 cursor-pointer"
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

      {/* Add / Edit Student Modal */}
      {(showAddModal || editStudent) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">
                {editStudent ? `Edit Student: ${editStudent.student_id}` : 'Enroll New Student'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditStudent(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveStudent} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Admission Category</label>
                  <select
                    value={formData.admission_category}
                    onChange={(e) => setFormData({ ...formData, admission_category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="Placement Admission">Placement Admission</option>
                    <option value="Training Admission">Training Admission</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Course *</label>
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Batch</label>
                  <select
                    value={formData.batch_id}
                    onChange={(e) => setFormData({ ...formData, batch_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="">Unassigned</option>
                    {batches
                      .filter((b) => !formData.course_id || b.course_id === formData.course_id)
                      .map((b) => (
                        <option key={b.batch_id} value={b.batch_id}>
                          {b.batch_name}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Placement Eligibility</label>
                  <select
                    value={formData.placement_eligibility}
                    onChange={(e) => setFormData({ ...formData, placement_eligibility: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="Eligible">Eligible</option>
                    <option value="Pending Evaluation">Pending Evaluation</option>
                    <option value="Not Eligible">Not Eligible</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Student Status</label>
                  <select
                    value={formData.student_status}
                    onChange={(e) => setFormData({ ...formData, student_status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="Active">Active</option>
                    <option value="Placed">Placed</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Educational Qualification
                  </label>
                  <input
                    type="text"
                    value={formData.educational_qualification}
                    onChange={(e) =>
                      setFormData({ ...formData, educational_qualification: e.target.value })
                    }
                    placeholder="e.g. B.Tech Computer Science (2025)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Complete residential address"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditStudent(null);
                  }}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
                >
                  Save Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Student Profile Drawer / Modal */}
      {viewStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Student Profile — {viewStudent.full_name} ({viewStudent.student_id})
                </h3>
              </div>
              <button onClick={() => setViewStudent(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Profile Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Email</span>
                  <p className="font-medium text-slate-800 truncate">{viewStudent.email}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Phone</span>
                  <p className="font-medium text-slate-800">{viewStudent.phone_number || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Course</span>
                  <p className="font-medium text-slate-800">{viewStudent.course?.course_name || viewStudent.course_id}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Batch</span>
                  <p className="font-medium text-slate-800">{viewStudent.batch?.batch_name || 'Unassigned'}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Category</span>
                  <p className="font-medium text-slate-800">{viewStudent.admission_category}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Admission Date</span>
                  <p className="font-medium text-slate-800">{viewStudent.admission_date}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Attendance Rate</span>
                  <p className="font-bold text-indigo-600">{viewStudent.attendanceStats?.attendancePercentage || 0}%</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Status</span>
                  <p className="font-bold text-slate-900">{viewStudent.student_status}</p>
                </div>
              </div>

              {/* Placement History */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Corporate Placement Applications ({viewStudent.applications?.length || 0})
                </h4>
                {viewStudent.applications?.length > 0 ? (
                  <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px]">
                        <tr>
                          <th className="px-4 py-2">Company</th>
                          <th className="px-4 py-2">Job Role</th>
                          <th className="px-4 py-2">Applied Date</th>
                          <th className="px-4 py-2">Interview Date</th>
                          <th className="px-4 py-2">Result</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {viewStudent.applications.map((app, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-2 font-medium text-slate-800">{app.company_name}</td>
                            <td className="px-4 py-2 text-slate-600">{app.job_role}</td>
                            <td className="px-4 py-2 text-slate-500">{app.application_date}</td>
                            <td className="px-4 py-2 text-slate-500">{app.interview_date || 'N/A'}</td>
                            <td className="px-4 py-2">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  app.result === 'Selected'
                                    ? 'bg-purple-100 text-purple-800'
                                    : app.result === 'Rejected'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-indigo-50 text-indigo-700'
                                }`}
                              >
                                {app.result}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 p-4 border border-dashed rounded-xl text-center">
                    No placement applications submitted yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

