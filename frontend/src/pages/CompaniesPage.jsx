import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Building2,
  Plus,
  Edit2,
  Archive,
  RotateCcw,
  Search,
  ExternalLink,
  Eye,
  Briefcase,
  Users,
  X,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editCompany, setEditCompany] = useState(null);
  const [viewCompany, setViewCompany] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    company_name: '',
    industry: '',
    company_location: '',
    hr_name: '',
    hr_email: '',
    hr_contact_number: '',
    company_website: '',
    notes: '',
    status: 'Active'
  });

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);

      const res = await api.get(`/companies?${params.toString()}`);
      if (res.data.success) {
        setCompanies(res.data.companies || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [search, statusFilter]);

  const handleOpenAdd = () => {
    setEditCompany(null);
    setFormData({
      company_name: '',
      industry: '',
      company_location: '',
      hr_name: '',
      hr_email: '',
      hr_contact_number: '',
      company_website: '',
      notes: '',
      status: 'Active'
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (c) => {
    setEditCompany(c);
    setFormData({
      company_name: c.company_name,
      industry: c.industry || '',
      company_location: c.company_location || '',
      hr_name: c.hr_name || '',
      hr_email: c.hr_email || '',
      hr_contact_number: c.hr_contact_number || '',
      company_website: c.company_website || '',
      notes: c.notes || '',
      status: c.status || 'Active'
    });
    setShowAddModal(true);
  };

  const handleView = async (id) => {
    try {
      const res = await api.get(`/companies/${id}`);
      if (res.data.success) {
        setViewCompany(res.data.company);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editCompany) {
        await api.put(`/companies/${editCompany.company_id}`, formData);
      } else {
        await api.post('/companies', formData);
      }
      setShowAddModal(false);
      fetchCompanies();
    } catch (err) {
      alert('Error saving company: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleArchive = async (id) => {
    if (confirm('Archive this hiring company? Historical placement records will be preserved.')) {
      try {
        await api.put(`/companies/${id}/archive`);
        fetchCompanies();
      } catch (err) {
        alert('Failed: ' + err.message);
      }
    }
  };

  const handleRestore = async (id) => {
    try {
      await api.put(`/companies/${id}/restore`);
      fetchCompanies();
    } catch (err) {
      alert('Failed to restore: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Hiring Partner Companies</h2>
          <p className="text-xs text-slate-500 mt-1">
            Maintain corporate recruiters, HR contacts, industry profiles, and recruitment histories.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 cursor-pointer self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Add Company</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search companies by name, location, HR, or industry..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs self-stretch sm:self-auto"
        >
          <option value="">All Statuses</option>
          <option value="Active">Active Partners</option>
          <option value="Archived">Archived</option>
        </select>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-3 text-center py-12 text-slate-400 text-xs">
            Loading hiring partner companies...
          </div>
        ) : companies.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-slate-400 text-xs">
            No partner companies found.
          </div>
        ) : (
          companies.map((c) => (
            <div
              key={c.company_id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    {c.company_id}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      c.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-2.5">{c.company_name}</h3>
                <p className="text-xs text-indigo-600 font-medium">{c.industry || 'Technology'}</p>

                <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{c.company_location || 'Not Specified'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>HR: {c.hr_name || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{c.hr_email || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold text-[11px]">
                    {c.activeRequirementsCount || 0} Openings
                  </span>
                  <span className="text-emerald-700 font-semibold text-[11px]">
                    {c.totalHires || 0} Placed
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleView(c.company_id)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-50 cursor-pointer"
                    title="View Profile & Openings"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleOpenEdit(c)}
                    className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-slate-50 cursor-pointer"
                    title="Edit Partner"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  {c.status === 'Archived' ? (
                    <button
                      onClick={() => handleRestore(c.company_id)}
                      className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer"
                      title="Restore Partner"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleArchive(c.company_id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-50 cursor-pointer"
                      title="Archive Partner"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Company Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">
                {editCompany ? `Edit Company: ${editCompany.company_id}` : 'Add Hiring Partner Company'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    placeholder="e.g. Infosys Technologies"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Industry</label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    placeholder="e.g. IT & Software"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.company_location}
                    onChange={(e) => setFormData({ ...formData, company_location: e.target.value })}
                    placeholder="e.g. Bangalore, India"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">HR Contact Name</label>
                  <input
                    type="text"
                    value={formData.hr_name}
                    onChange={(e) => setFormData({ ...formData, hr_name: e.target.value })}
                    placeholder="e.g. Sneha Roy"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">HR Email</label>
                  <input
                    type="email"
                    value={formData.hr_email}
                    onChange={(e) => setFormData({ ...formData, hr_email: e.target.value })}
                    placeholder="sneha.roy@company.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">HR Phone</label>
                  <input
                    type="text"
                    value={formData.hr_contact_number}
                    onChange={(e) => setFormData({ ...formData, hr_contact_number: e.target.value })}
                    placeholder="+91 98000 00000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company Website</label>
                  <input
                    type="url"
                    value={formData.company_website}
                    onChange={(e) => setFormData({ ...formData, company_website: e.target.value })}
                    placeholder="https://company.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Relationship Details</label>
                  <textarea
                    rows="2"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Hiring preferences, salary ranges, past feedback..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
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
                  Save Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Company Profile & History Modal */}
      {viewCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-3xl overflow-hidden max-h-[85vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  {viewCompany.company_name} ({viewCompany.company_id})
                </h3>
                <p className="text-[11px] text-slate-500">
                  {viewCompany.industry} • {viewCompany.company_location}
                </p>
              </div>
              <button onClick={() => setViewCompany(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Requirements posted */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Job Requirements ({viewCompany.requirements?.length || 0})
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px]">
                      <tr>
                        <th className="px-4 py-2">Role</th>
                        <th className="px-4 py-2">Vacancies</th>
                        <th className="px-4 py-2">Deadline</th>
                        <th className="px-4 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {viewCompany.requirements?.map((r) => (
                        <tr key={r.requirement_id}>
                          <td className="px-4 py-2 font-semibold text-slate-800">{r.job_role}</td>
                          <td className="px-4 py-2 text-slate-600">{r.number_of_vacancies}</td>
                          <td className="px-4 py-2 text-slate-500">{r.application_deadline}</td>
                          <td className="px-4 py-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700">
                              {r.requirement_status}
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
        </div>
      )}
    </div>
  );
}

