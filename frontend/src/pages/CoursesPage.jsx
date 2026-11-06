import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { BookOpen, Plus, Edit2, Archive, Trash2, Users, CalendarDays, Search, X } from 'lucide-react';

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editCourse, setEditCourse] = useState(null);

  const [formData, setFormData] = useState({
    course_name: '',
    course_description: '',
    duration: '6 Months',
    technologies_covered: '',
    start_date: new Date().toISOString().split('T')[0],
    course_status: 'Active'
  });

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/courses?search=${encodeURIComponent(search)}`);
      if (res.data.success) {
        setCourses(res.data.courses || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [search]);

  const handleOpenAdd = () => {
    setEditCourse(null);
    setFormData({
      course_name: '',
      course_description: '',
      duration: '6 Months',
      technologies_covered: '',
      start_date: new Date().toISOString().split('T')[0],
      course_status: 'Active'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (c) => {
    setEditCourse(c);
    setFormData({
      course_name: c.course_name,
      course_description: c.course_description,
      duration: c.duration,
      technologies_covered: c.technologies_covered,
      start_date: c.start_date,
      course_status: c.course_status
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editCourse) {
        await api.put(`/courses/${editCourse.course_id}`, formData);
      } else {
        await api.post('/courses', formData);
      }
      setShowModal(false);
      fetchCourses();
    } catch (err) {
      alert('Error saving course: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleArchive = async (id) => {
    if (confirm('Archive this course?')) {
      try {
        await api.put(`/courses/${id}/archive`);
        fetchCourses();
      } catch (err) {
        alert('Failed: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleDelete = async (course) => {
    if (confirm(`Permanently delete course "${course.course_name}" (${course.course_id})? This action cannot be undone.`)) {
      try {
        const res = await api.delete(`/courses/${course.course_id}`);
        alert(res.data.message || 'Course deleted successfully');
        fetchCourses();
      } catch (err) {
        alert('Failed to delete: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Course Curriculum & Tracks</h2>
          <p className="text-xs text-slate-500 mt-1">
            Maintain training modules, durations, technical stacks, and associate student cohorts.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 cursor-pointer self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Add Course</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search courses by title or technologies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500 shadow-xs"
        />
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-3 text-center py-12 text-slate-400 text-xs">
            Loading course curriculum...
          </div>
        ) : courses.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-slate-400 text-xs">
            No courses found. Add your first course!
          </div>
        ) : (
          courses.map((c) => (
            <div
              key={c.course_id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    {c.course_id}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      c.course_status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {c.course_status}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-2">{c.course_name}</h3>
                <p className="text-xs text-slate-600 line-clamp-2 mt-1">{c.course_description}</p>

                {c.technologies_covered && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {c.technologies_covered.split(',').map((tech, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] rounded font-medium"
                      >
                        {tech.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <Users className="w-3.5 h-3.5 text-indigo-500" />
                    {c.studentCount || 0} Students
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                    {c.duration}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(c)}
                    className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-slate-50 cursor-pointer"
                    title="Edit Course"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleArchive(c.course_id)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-50 cursor-pointer"
                    title="Archive Course"
                  >
                    <Archive className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(c)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                    title="Delete Course Permanently"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">
                {editCourse ? `Edit Course: ${editCourse.course_id}` : 'Create New Course'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Course Name *</label>
                <input
                  type="text"
                  required
                  value={formData.course_name}
                  onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
                  placeholder="e.g. Full Stack MERN Development"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Duration</label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="e.g. 6 Months"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Technologies Covered (Comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.technologies_covered}
                  onChange={(e) => setFormData({ ...formData, technologies_covered: e.target.value })}
                  placeholder="React, Node.js, Express, MongoDB, Tailwind"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Course Description</label>
                <textarea
                  rows="3"
                  value={formData.course_description}
                  onChange={(e) => setFormData({ ...formData, course_description: e.target.value })}
                  placeholder="Brief curriculum description..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
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
                  Save Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

