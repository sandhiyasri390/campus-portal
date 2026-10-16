import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../../components/Layout.jsx';
import Loader from '../../components/Loader.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import Modal from '../../components/Modal.jsx';
import api from '../../api/axios.js';
import { useToast } from '../../context/ToastContext.jsx';

const STATUS_OPTIONS = ['applied', 'under_review', 'shortlisted', 'assessment', 'technical_interview', 'hr_interview', 'selected', 'rejected'];

export default function Applicants() {
  const { push } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const jobId = searchParams.get('jobId') || '';
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState('');
  const [minCgpa, setMinCgpa] = useState('');
  const [sortBy, setSortBy] = useState('matchScore');
  const [interviewApp, setInterviewApp] = useState(null);
  const [ivForm, setIvForm] = useState({ date: '', time: '', type: 'technical', interviewer: '', meetingLink: '', location: '' });

  useEffect(() => {
    api.get('/jobs').then((res) => {
      setJobs(res.data.jobs);
      if (!jobId && res.data.jobs.length) setSearchParams({ jobId: res.data.jobs[0]._id });
    });
  }, []);

  const loadApplicants = (id) => {
    if (!id) return;
    setLoading(true);
    api.get(`/applications/job/${id}`).then((res) => setApplications(res.data.applications)).finally(() => setLoading(false));
  };

  useEffect(() => { if (jobId) loadApplicants(jobId); }, [jobId]);

  const filtered = useMemo(() => {
    let list = applications;
    if (search) {
      const s = search.toLowerCase();
      list = list.filter((a) => a.student?.name?.toLowerCase().includes(s) || (a.studentProfile?.skills || []).some((sk) => sk.toLowerCase().includes(s)));
    }
    if (minCgpa) list = list.filter((a) => (a.studentProfile?.cgpa || 0) >= Number(minCgpa));
    return [...list].sort((a, b) => {
      if (sortBy === 'cgpa') return (b.studentProfile?.cgpa || 0) - (a.studentProfile?.cgpa || 0);
      if (sortBy === 'date') return new Date(b.createdAt) - new Date(a.createdAt);
      return (b.matchScore || 0) - (a.matchScore || 0);
    });
  }, [applications, search, minCgpa, sortBy]);

  const toggleSelect = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const updateStatus = async (id, status) => {
    await api.put(`/applications/${id}/status`, { status });
    push(`Status updated to ${status.replace('_', ' ')}.`, 'success');
    loadApplicants(jobId);
  };

  const bulkUpdate = async (status) => {
    if (selected.length === 0) return;
    if (!window.confirm(`${status.replace('_', ' ')} ${selected.length} candidate(s)?`)) return;
    await api.put('/applications/bulk-status', { applicationIds: selected, status });
    push(`${selected.length} candidate(s) updated.`, 'success');
    setSelected([]);
    loadApplicants(jobId);
  };

  const openInterviewModal = (app) => {
    setInterviewApp(app);
    setIvForm({ date: '', time: '', type: 'technical', interviewer: '', meetingLink: '', location: '' });
  };

  const scheduleInterview = async () => {
    try {
      await api.post('/interviews', { applicationId: interviewApp._id, ...ivForm });
      push('Interview scheduled and candidate notified.', 'success');
      setInterviewApp(null);
    } catch (err) {
      push(err.response?.data?.message || 'Could not schedule interview.', 'error');
    }
  };

  return (
    <Layout title="Applicants">
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <select value={jobId} onChange={(e) => setSearchParams({ jobId: e.target.value })}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus-ring focus:border-brand-400">
          {jobs.map((j) => <option key={j._id} value={j._id}>{j.title}</option>)}
        </select>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or skill…"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus-ring focus:border-brand-400" />
        <input type="number" value={minCgpa} onChange={(e) => setMinCgpa(e.target.value)} placeholder="Min CGPA"
          className="w-28 rounded-lg border border-slate-300 px-3 py-2 text-sm focus-ring focus:border-brand-400" />
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus-ring focus:border-brand-400">
          <option value="matchScore">Sort: Match Score</option>
          <option value="cgpa">Sort: CGPA</option>
          <option value="date">Sort: Application Date</option>
        </select>
      </div>

      {selected.length > 0 && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 px-4 py-2.5 text-sm">
          <span className="font-medium text-brand-800">{selected.length} selected</span>
          <button onClick={() => bulkUpdate('shortlisted')} className="rounded-md bg-white px-3 py-1 text-brand-700 border border-brand-200 hover:bg-brand-100">Shortlist</button>
          <button onClick={() => bulkUpdate('assessment')} className="rounded-md bg-white px-3 py-1 text-brand-700 border border-brand-200 hover:bg-brand-100">Move to Assessment</button>
          <button onClick={() => bulkUpdate('rejected')} className="rounded-md bg-white px-3 py-1 text-rose-700 border border-rose-200 hover:bg-rose-50">Reject</button>
        </div>
      )}

      {loading ? <Loader /> : filtered.length === 0 ? (
        <EmptyState title="No applicants" description="No applications match your current filters yet." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-card">
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="w-10 px-4 py-3"></th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Candidate</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">CGPA</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Match</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Status</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((app) => (
                <tr key={app._id}>
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.includes(app._id)} onChange={() => toggleSelect(app._id)} className="rounded border-slate-300 text-brand-500 focus-ring" />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink-800">{app.student?.name}</p>
                    <p className="text-xs text-slate-500">{app.studentProfile?.department} · {(app.studentProfile?.skills || []).slice(0, 3).join(', ')}</p>
                  </td>
                  <td className="px-4 py-3 text-ink-700">{app.studentProfile?.cgpa}</td>
                  <td className="px-4 py-3 text-ink-700">{app.matchScore}%</td>
                  <td className="px-4 py-3"><StatusBadge status={app.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <select value={app.status} onChange={(e) => updateStatus(app._id, e.target.value)}
                        className="rounded-md border border-slate-300 px-2 py-1 text-xs focus-ring">
                        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                      </select>
                      <button onClick={() => openInterviewModal(app)} className="rounded-md border border-slate-200 px-2 py-1 text-xs text-brand-700 hover:border-brand-300">Schedule</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!interviewApp} onClose={() => setInterviewApp(null)} title={`Schedule interview — ${interviewApp?.student?.name || ''}`}
        footer={<button onClick={scheduleInterview} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600">Schedule</button>}>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-ink-800">Date</label>
              <input type="date" value={ivForm.date} onChange={(e) => setIvForm({ ...ivForm, date: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus-ring" />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-800">Time</label>
              <input placeholder="10:00 AM" value={ivForm.time} onChange={(e) => setIvForm({ ...ivForm, time: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus-ring" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-800">Type</label>
            <select value={ivForm.type} onChange={(e) => setIvForm({ ...ivForm, type: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus-ring">
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="technical">Technical</option>
              <option value="hr">HR</option>
              <option value="group_discussion">Group Discussion</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-800">Interviewer</label>
            <input value={ivForm.interviewer} onChange={(e) => setIvForm({ ...ivForm, interviewer: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus-ring" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-800">Meeting link (if online)</label>
            <input value={ivForm.meetingLink} onChange={(e) => setIvForm({ ...ivForm, meetingLink: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus-ring" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-800">Location (if offline)</label>
            <input value={ivForm.location} onChange={(e) => setIvForm({ ...ivForm, location: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus-ring" />
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
