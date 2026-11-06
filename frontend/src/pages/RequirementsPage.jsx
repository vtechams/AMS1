import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Briefcase,
  Plus,
  Edit2,
  Calendar,
  Search,
  Filter,
  Users,
  AlertTriangle,
  Clock,
  ArrowRight,
  X,
  Building2,
  DollarSign
} from 'lucide-react';

const REQUIREMENT_STATUSES = [
  'Open',
  'Applications in Progress',
  'Interview Scheduling',
  'Interview in Progress',
  'Result Pending',
  'Closed',
  'On Hold',
  'No Eligible Students'
];

export default function RequirementsPage() {
  const navigate = useNavigate();
  const [requirements, setRequirements] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editReq, setEditReq] = useState(null);
  const [viewDetails, setViewDetails] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    company_id: '',
    job_role: '',
    job_description: '',
    required_skills: '',
    eligibility_criteria: '',
    qualification: '',
    experience_requirement: 'Fresher (0-1 year)',
    number_of_vacancies: 2,
    opening_date: new Date().toISOString().split('T')[0],
    application_deadline: '',
    salary_details: '₹4.5 - ₹6.0 LPA',
    eligible_courses: '',
    eligible_batches: '',
    requirement_status: 'Open',
    hr_contact: '',
    remarks: ''
  });

  const fetchRequirements = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (monthFilter) params.append('month', monthFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (companyFilter) params.append('companyId', companyFilter);

      const res = await api.get(`/requirements?${params.toString()}`);
      if (res.data.success) {
        setRequirements(res.data.requirements || []);
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
        const [cRes, coRes] = await Promise.all([api.get('/companies'), api.get('/courses')]);
        if (cRes.data.success) setCompanies(cRes.data.companies || []);
        if (coRes.data.success) setCourses(coRes.data.courses || []);
      } catch (e) {
        console.error(e);
      }
    }
    loadMeta();
  }, []);

  useEffect(() => {
    fetchRequirements();
  }, [search, monthFilter, statusFilter, companyFilter]);

  const handleOpenAdd = () => {
    setEditReq(null);
    setFormData({
      company_id: companies[0]?.company_id || '',
      job_role: '',
      job_description: '',
      required_skills: '',
      eligibility_criteria: '',
      qualification: '',
      experience_requirement: 'Fresher (0-1 year)',
      number_of_vacancies: 2,
      opening_date: new Date().toISOString().split('T')[0],
      application_deadline: '',
      salary_details: '₹4.5 - ₹6.0 LPA',
      eligible_courses: '',
      eligible_batches: '',
      requirement_status: 'Open',
      hr_contact: '',
      remarks: ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (r) => {
    setEditReq(r);
    setFormData({
      company_id: r.company_id,
      job_role: r.job_role,
      job_description: r.job_description || '',
      required_skills: r.required_skills || '',
      eligibility_criteria: r.eligibility_criteria || '',
      qualification: r.qualification || '',
      experience_requirement: r.experience_requirement || '',
      number_of_vacancies: r.number_of_vacancies || 1,
      opening_date: r.opening_date || '',
      application_deadline: r.application_deadline || '',
      salary_details: r.salary_details || '',
      eligible_courses: r.eligible_courses || '',
      eligible_batches: r.eligible_batches || '',
      requirement_status: r.requirement_status || 'Open',
      hr_contact: r.hr_contact || '',
      remarks: r.remarks || ''
    });
    setShowModal(true);
  };

  const handleView = async (id) => {
    try {
      const res = await api.get(`/requirements/${id}`);
      if (res.data.success) {
        setViewDetails(res.data.requirement);
      }
    } catch (err) {
      alert('Failed: ' + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editReq) {
        await api.put(`/requirements/${editReq.requirement_id}`, formData);
      } else {
        await api.post('/requirements', formData);
      }
      setShowModal(false);
      fetchRequirements();
    } catch (err) {
      alert('Error saving requirement: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Placement Job Requirements</h2>
          <p className="text-xs text-slate-500 mt-1">
            Month-wise corporate mandates, hiring criteria, application deadlines, and vacancy statuses.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 cursor-pointer self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Post Requirement</span>
        </button>
      </div>

      {/* Filter and Month Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search role, company, skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          />
        </div>

        <div>
          <input
            type="month"
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          >
            <option value="">All Statuses</option>
            <option value="Expired">⚠️ Expired (Passed Deadline)</option>
            {REQUIREMENT_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          >
            <option value="">All Companies</option>
            {companies.map((c) => (
              <option key={c.company_id} value={c.company_id}>
                {c.company_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Requirements List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-3 text-center py-12 text-slate-400 text-xs">
            Loading job requirements...
          </div>
        ) : requirements.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-slate-400 text-xs">
            No job requirements found matching filters.
          </div>
        ) : (
          requirements.map((r) => (
            <div
              key={r.requirement_id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
            >
              {/* Expired Ribbon */}
              {r.isExpired && (
                <div className="bg-amber-500 text-white text-[10px] font-bold px-3 py-0.5 text-center -mx-5 -mt-5 mb-3 flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Application Deadline Passed — Awaiting Closure</span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    {r.requirement_id}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {r.requirement_status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-2">{r.job_role}</h3>
                <p className="text-xs text-indigo-600 font-semibold">{r.company_name}</p>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Vacancies:</span>
                    <span className="font-bold text-slate-800">
                      {r.vacanciesRemaining} remaining / {r.number_of_vacancies} total
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Package:</span>
                    <span className="font-medium text-slate-800">{r.salary_details || 'As per industry'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Deadline:</span>
                    <span className={`font-medium ${r.isExpired ? 'text-amber-600 font-bold' : 'text-slate-800'}`}>
                      {r.application_deadline || 'Open'}
                    </span>
                  </div>
                </div>

                {r.required_skills && (
                  <p className="text-[11px] text-slate-500 mt-3 line-clamp-2 bg-slate-50 p-2 rounded-lg">
                    Skills: {r.required_skills}
                  </p>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => navigate(`/applications?requirementId=${r.requirement_id}`)}
                  className="font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>{r.appliedCount || 0} Applicants</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleView(r.requirement_id)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-50 cursor-pointer"
                    title="View Full Details"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleOpenEdit(r)}
                    className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-slate-50 cursor-pointer"
                    title="Edit Requirement"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden max-h-[85vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">
                {editReq ? `Edit Requirement: ${editReq.requirement_id}` : 'Post New Job Requirement'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company *</label>
                  <select
                    required
                    value={formData.company_id}
                    onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="">Select Company</option>
                    {companies.map((c) => (
                      <option key={c.company_id} value={c.company_id}>
                        {c.company_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Job Role *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Associate React Developer"
                    value={formData.job_role}
                    onChange={(e) => setFormData({ ...formData, job_role: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Number of Vacancies *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.number_of_vacancies}
                    onChange={(e) => setFormData({ ...formData, number_of_vacancies: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Salary / CTC Details</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹5.0 - ₹7.0 LPA"
                    value={formData.salary_details}
                    onChange={(e) => setFormData({ ...formData, salary_details: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Application Deadline</label>
                  <input
                    type="date"
                    value={formData.application_deadline}
                    onChange={(e) => setFormData({ ...formData, application_deadline: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Requirement Status</label>
                  <select
                    value={formData.requirement_status}
                    onChange={(e) => setFormData({ ...formData, requirement_status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    {REQUIREMENT_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Required Skills</label>
                  <input
                    type="text"
                    placeholder="e.g. React, Node.js, Express, Tailwind CSS, Git"
                    value={formData.required_skills}
                    onChange={(e) => setFormData({ ...formData, required_skills: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Job Description</label>
                  <textarea
                    rows="2"
                    placeholder="Key responsibilities and day-to-day duties..."
                    value={formData.job_description}
                    onChange={(e) => setFormData({ ...formData, job_description: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
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
                  Save Requirement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Requirement Details Modal */}
      {viewDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden max-h-[85vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{viewDetails.job_role}</h3>
                <p className="text-[11px] text-slate-500">{viewDetails.company_name}</p>
              </div>
              <button onClick={() => setViewDetails(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Total Vacancies</span>
                  <p className="font-bold text-slate-800">{viewDetails.number_of_vacancies}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Remaining Vacancies</span>
                  <p className="font-bold text-indigo-600">{viewDetails.vacanciesRemaining}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Eligible Academy Students</span>
                  <p className="font-bold text-emerald-600">{viewDetails.eligibleStudentsCount}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Status</span>
                  <p className="font-bold text-slate-800">{viewDetails.requirement_status}</p>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Required Skills</span>
                <p className="text-slate-700 mt-1">{viewDetails.required_skills || 'None specified'}</p>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Job Description</span>
                <p className="text-slate-700 mt-1 leading-relaxed">{viewDetails.job_description || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

