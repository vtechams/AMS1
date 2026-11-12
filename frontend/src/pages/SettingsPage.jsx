import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Settings,
  Database,
  ShieldCheck,
  RotateCcw,
  Download,
  Lock,
  User,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  HardDrive,
  Trash2,
  Sparkles
} from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const [health, setHealth] = useState(null);
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [wipeLoading, setWipeLoading] = useState(false);
  const [seedLoading, setSeedLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Password Update Form
  const [passData, setPassData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passLoading, setPassLoading] = useState(false);

  const fetchHealthAndBackups = async () => {
    try {
      setLoading(true);
      const [hRes, bRes] = await Promise.all([
        api.get('/backups/health'),
        api.get('/backups')
      ]);
      if (hRes.data.success) setHealth(hRes.data);
      if (bRes.data.success) setBackups(bRes.data.backups || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthAndBackups();
  }, []);

  const handleCreateBackup = async () => {
    try {
      setBackupLoading(true);
      setMessage({ type: '', text: '' });
      const res = await api.post('/backups/create');
      if (res.data.success) {
        setMessage({ type: 'success', text: `Snapshot created: ${res.data.filename}` });
        fetchHealthAndBackups();
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Backup failed' });
    } finally {
      setBackupLoading(false);
    }
  };

  const handleRestoreBackup = async (filename) => {
    if (
      !confirm(
        `Are you sure you want to restore database state from "${filename}"?\nA safety backup of current state will be created first.`
      )
    ) {
      return;
    }

    try {
      setRestoreLoading(true);
      setMessage({ type: '', text: '' });
      const res = await api.post('/backups/restore', { filename });
      if (res.data.success) {
        setMessage({ type: 'success', text: res.data.message });
        fetchHealthAndBackups();
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Restore failed' });
    } finally {
      setRestoreLoading(false);
    }
  };

  const handleWipeCompleteData = async () => {
    const confirmation = window.confirm(
      "⚠️ DANGER: COMPLETE DATA RESET ALERT!\n\n" +
      "Are you sure you want to permanently delete ALL records from the database?\n\n" +
      "• All Students, Courses, Batches, and Enrollments will be WIPED.\n" +
      "• All Companies, Job Requirements, and Applications will be WIPED.\n" +
      "• All Daily Attendance records will be WIPED.\n\n" +
      "🛡️ An automatic safety backup snapshot will be saved in 'backups/' before wiping.\n\n" +
      "Click OK to permanently delete all data, or Cancel to abort."
    );

    if (!confirmation) return;

    try {
      setWipeLoading(true);
      setMessage({ type: '', text: '' });
      const res = await api.post('/backups/wipe-all');
      if (res.data.success) {
        alert(`✅ Database Reset Complete!\n\n${res.data.message}\nSafety Backup: ${res.data.backup}`);
        setMessage({
          type: 'success',
          text: `All records wiped. Safety snapshot saved: ${res.data.backup}`
        });
        fetchHealthAndBackups();
      }
    } catch (err) {
      alert('Error wiping database: ' + (err.response?.data?.message || err.message));
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to wipe database'
      });
    } finally {
      setWipeLoading(false);
    }
  };

  const handleSeed100Data = async () => {
    try {
      setSeedLoading(true);
      setMessage({ type: '', text: '' });
      const res = await api.post('/backups/seed-100');
      if (res.data.success) {
        alert(
          `🎉 100 Demo Records Generated Successfully!\n\n` +
          `• ${res.data.totalStudents} Students & Enrollments\n` +
          `• ${res.data.totalApplications} Placement Applications\n` +
          `• ${res.data.totalAttendance} Attendance Records\n\n` +
          `You can now review the Analytics Dashboard, Student Directory, and Attendance tracking!`
        );
        setMessage({
          type: 'success',
          text: '100 sample records generated and synchronized across MongoDB Atlas and Excel.'
        });
        fetchHealthAndBackups();
      }
    } catch (err) {
      alert('Error generating sample data: ' + (err.response?.data?.message || err.message));
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to populate 100 records'
      });
    } finally {
      setSeedLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passData.newPassword !== passData.confirmPassword) {
      alert('New password and confirm password do not match');
      return;
    }

    try {
      setPassLoading(true);
      const res = await api.put('/auth/update-password', {
        currentPassword: passData.currentPassword,
        newPassword: passData.newPassword
      });
      if (res.data.success) {
        alert('Password updated successfully');
        setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      alert('Error updating password: ' + (err.response?.data?.message || err.message));
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">System & Database Administration</h2>
        <p className="text-xs text-slate-500 mt-1">
          Monitor Excel workbook integrity, manage automated safety snapshots, restore backups, and update credentials.
        </p>
      </div>

      {message.text && (
        <div
          className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-medium ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Excel Database Health Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Primary Excel Storage Engine</h3>
              <p className="text-xs text-slate-500 font-mono">{health?.filePath || 'Academy_Database.xlsx'}</p>
            </div>
          </div>
          <button
            onClick={handleCreateBackup}
            disabled={backupLoading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 self-start"
          >
            <HardDrive className="w-4 h-4" />
            <span>{backupLoading ? 'Creating Backup...' : 'Take Manual Snapshot'}</span>
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400">Inspecting workbook structure...</div>
        ) : health ? (
          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Integrity State</span>
                <p className="font-bold text-emerald-600 mt-0.5 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {health.health}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">File Size</span>
                <p className="font-bold text-slate-800 mt-0.5">{health.fileSizeKb} KB</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Worksheets</span>
                <p className="font-bold text-indigo-600 mt-0.5">{health.worksheets?.length || 0} Sheets</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Last Modified</span>
                <p className="font-medium text-slate-800 mt-0.5 truncate">
                  {new Date(health.lastModified).toLocaleTimeString()}
                </p>
              </div>
            </div>

            {/* Worksheets Grid */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 mb-2">Worksheet Schema Inventory:</h4>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                {health.worksheets?.map((ws, i) => (
                  <div key={i} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex flex-col">
                    <span className="font-semibold text-slate-800 text-[11px] truncate">{ws.name}</span>
                    <span className="text-[10px] text-slate-500 mt-0.5">{ws.rowCount} rows recorded</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Backup and Restore Management */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
        <h3 className="text-sm font-bold text-slate-900 mb-1">Automated Safe Snapshots (Dated Backups)</h3>
        <p className="text-xs text-slate-500 mb-4">
          Every write modification creates an atomic snapshot before saving. Restore anytime with 1-click.
        </p>

        <div className="border border-slate-200 rounded-xl overflow-hidden text-xs max-h-72 overflow-y-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] sticky top-0">
              <tr>
                <th className="px-4 py-2.5">Snapshot Filename</th>
                <th className="px-4 py-2.5">Created Date & Time</th>
                <th className="px-4 py-2.5">Size</th>
                <th className="px-4 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {backups.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-4 py-6 text-center text-slate-400">
                    No safety snapshots created yet.
                  </td>
                </tr>
              ) : (
                backups.map((b) => (
                  <tr key={b.filename} className="hover:bg-slate-50/60">
                    <td className="px-4 py-2.5 font-mono text-slate-800 text-[11px] font-medium">
                      {b.filename}
                    </td>
                    <td className="px-4 py-2.5 text-slate-500">
                      {new Date(b.modifiedAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 text-slate-600">{b.sizeKb} KB</td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        onClick={() => handleRestoreBackup(b.filename)}
                        disabled={restoreLoading}
                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50"
                      >
                        Restore State
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Password Management */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <Lock className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">Change Admin Password</h3>
        </div>

        <form onSubmit={handlePasswordSubmit} className="max-w-md space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Current Password *</label>
            <input
              type="password"
              required
              value={passData.currentPassword}
              onChange={(e) => setPassData({ ...passData, currentPassword: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">New Password *</label>
            <input
              type="password"
              required
              value={passData.newPassword}
              onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password *</label>
            <input
              type="password"
              required
              value={passData.confirmPassword}
              onChange={(e) => setPassData({ ...passData, confirmPassword: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={passLoading}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer disabled:opacity-50"
          >
            {passLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Demo & Test Data Generator */}
      <div className="bg-indigo-50/70 rounded-2xl border-2 border-indigo-200 shadow-xs p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-indigo-950 flex items-center gap-2">
                Demo & Test Data Generator
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-indigo-200 text-indigo-800 rounded-full">
                  100 Records
                </span>
              </h3>
              <p className="text-xs text-indigo-700 mt-1 max-w-2xl">
                Quickly populate 100 realistic student profiles, batch enrollments, placement interview applications, and attendance logs to test dashboard analytics and charts.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSeed100Data}
            disabled={seedLoading}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0 self-start sm:self-center transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>{seedLoading ? 'Generating 100 Records...' : 'Generate 100 Test Records'}</span>
          </button>
        </div>
      </div>

      {/* Danger Zone: Factory Data Reset */}
      <div className="bg-rose-50/70 rounded-2xl border-2 border-rose-200 shadow-xs p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-rose-950 flex items-center gap-2">
                Danger Zone: Complete Database Wipe
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-rose-200 text-rose-800 rounded-full">
                  Irreversible
                </span>
              </h3>
              <p className="text-xs text-rose-700 mt-1 max-w-2xl">
                Permanently purge all records across Students, Courses, Batches, Enrollments, Companies, Requirements, Applications, and Attendance. An automatic pre-wipe safety backup snapshot is saved in <code className="font-mono bg-rose-100 px-1 rounded">backups/</code> before wiping.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleWipeCompleteData}
            disabled={wipeLoading}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0 self-start sm:self-center transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>{wipeLoading ? 'Wiping All Records...' : 'Wipe Complete Database'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

