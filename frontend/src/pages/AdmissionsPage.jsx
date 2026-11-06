import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  UserCheck,
  BookOpen,
  GraduationCap,
  Sparkles,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Users
} from 'lucide-react';

export default function AdmissionsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Placement Admission');
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

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
    placement_eligibility: 'Eligible'
  });

  useEffect(() => {
    async function loadMeta() {
      try {
        const [cRes, bRes] = await Promise.all([
          api.get('/courses'),
          api.get('/batches')
        ]);
        if (cRes.data.success) setCourses(cRes.data.courses || []);
        if (bRes.data.success) setBatches(bRes.data.batches || []);
        if (cRes.data.courses?.length > 0) {
          setFormData((prev) => ({ ...prev, course_id: cRes.data.courses[0].course_id }));
        }
      } catch (err) {
        console.error('Failed to load courses/batches metadata', err);
      }
    }
    loadMeta();
  }, []);

  const handleTabChange = (category) => {
    setActiveTab(category);
    setFormData((prev) => ({
      ...prev,
      admission_category: category,
      placement_eligibility: category === 'Placement Admission' ? 'Eligible' : 'Pending Evaluation'
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await api.post('/students', formData);
      if (res.data.success) {
        setSuccessMsg(`Student admitted successfully! Assigned ID: ${res.data.student.student_id}`);
        setFormData({
          full_name: '',
          email: '',
          phone_number: '',
          address: '',
          admission_category: activeTab,
          course_id: courses[0]?.course_id || '',
          batch_id: '',
          admission_date: new Date().toISOString().split('T')[0],
          educational_qualification: '',
          training_status: 'In Progress',
          placement_eligibility: activeTab === 'Placement Admission' ? 'Eligible' : 'Pending Evaluation'
        });
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to process admission');
    } finally {
      setLoading(false);
    }
  };

  const filteredBatches = batches.filter((b) => !formData.course_id || b.course_id === formData.course_id);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Student Admission Portal</h2>
          <p className="text-xs text-slate-500 mt-1">
            Enroll new students into Training or Placement admission tracks.
          </p>
        </div>
        <button
          onClick={() => navigate('/students')}
          className="px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 self-start cursor-pointer"
        >
          <Users className="w-4 h-4 text-slate-500" />
          <span>View Student Directory</span>
        </button>
      </div>

      {/* Admission Category Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          onClick={() => handleTabChange('Placement Admission')}
          className={`p-5 rounded-2xl border-2 transition-all cursor-pointer ${
            activeTab === 'Placement Admission'
              ? 'border-indigo-600 bg-indigo-50/50 shadow-md shadow-indigo-100'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                activeTab === 'Placement Admission'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              Category A
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900 mt-3">Placement Admission</h3>
          <p className="text-xs text-slate-600 mt-1">
            For students seeking direct career assistance, corporate interview scheduling, and job placements.
          </p>
        </div>

        <div
          onClick={() => handleTabChange('Training Admission')}
          className={`p-5 rounded-2xl border-2 transition-all cursor-pointer ${
            activeTab === 'Training Admission'
              ? 'border-sky-600 bg-sky-50/50 shadow-md shadow-sky-100'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                activeTab === 'Training Admission'
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              Category B
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900 mt-3">Training Admission</h3>
          <p className="text-xs text-slate-600 mt-1">
            For students enrolling in core technical curriculum, laboratory sessions, and certification tracks.
          </p>
        </div>
      </div>

      {/* Admission Form */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
          <GraduationCap className="w-5 h-5 text-indigo-600" />
          <h3 className="text-base font-bold text-slate-900">
            Admit Student — <span className="text-indigo-600">{activeTab}</span>
          </h3>
        </div>

        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-xs">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="full_name"
                required
                value={formData.full_name}
                onChange={handleChange}
                placeholder="e.g. Ramesh Kumar"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="ramesh.kumar@example.com"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Phone Number</label>
              <input
                type="text"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Educational Qualification */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Educational Qualification
              </label>
              <input
                type="text"
                name="educational_qualification"
                value={formData.educational_qualification}
                onChange={handleChange}
                placeholder="e.g. B.Tech Computer Science (2025)"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Course */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Enrolled Course <span className="text-rose-500">*</span>
              </label>
              <select
                name="course_id"
                required
                value={formData.course_id}
                onChange={handleChange}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              >
                <option value="">Select Course</option>
                {courses.map((c) => (
                  <option key={c.course_id} value={c.course_id}>
                    {c.course_name} ({c.duration})
                  </option>
                ))}
              </select>
            </div>

            {/* Batch */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Assigned Batch</label>
              <select
                name="batch_id"
                value={formData.batch_id}
                onChange={handleChange}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              >
                <option value="">Unassigned (Assign Later)</option>
                {filteredBatches.map((b) => (
                  <option key={b.batch_id} value={b.batch_id}>
                    {b.batch_name} (Trainer: {b.trainer_name || 'N/A'})
                  </option>
                ))}
              </select>
            </div>

            {/* Admission Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Admission Date</label>
              <input
                type="date"
                name="admission_date"
                value={formData.admission_date}
                onChange={handleChange}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Placement Eligibility */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Placement Eligibility</label>
              <select
                name="placement_eligibility"
                value={formData.placement_eligibility}
                onChange={handleChange}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              >
                <option value="Eligible">Eligible</option>
                <option value="Pending Evaluation">Pending Evaluation</option>
                <option value="Not Eligible">Not Eligible</option>
              </select>
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Residential Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Street address, city, state"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/students')}
              className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Complete Admission</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

