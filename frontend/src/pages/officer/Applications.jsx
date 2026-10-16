import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout.jsx';
import Loader from '../../components/Loader.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import api from '../../api/axios.js';

export default function Applications() {
  const [jobs, setJobs] = useState([]);
  const [jobId, setJobId] = useState('');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/jobs', { params: { status: 'approved' } }).then((res) => {
      setJobs(res.data.jobs);
      if (res.data.jobs.length) setJobId(res.data.jobs[0]._id);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!jobId) return;
    setLoading(true);
    api.get(`/applications/job/${jobId}`).then((res) => setApplications(res.data.applications)).finally(() => setLoading(false));
  }, [jobId]);

  return (
    <Layout title="Monitor Applications">
      <select value={jobId} onChange={(e) => setJobId(e.target.value)} className="mb-4 rounded-lg border border-slate-300 px-3 py-2 text-sm focus-ring">
        {jobs.map((j) => <option key={j._id} value={j._id}>{j.title} — {j.company?.name}</option>)}
      </select>

      {loading ? <Loader /> : applications.length === 0 ? (
        <EmptyState title="No applications" description="No students have applied to this drive yet." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-card">
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Candidate</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Department</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">CGPA</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Match</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applications.map((a) => (
                <tr key={a._id}>
                  <td className="px-4 py-3 font-medium text-ink-800">{a.student?.name}</td>
                  <td className="px-4 py-3 text-ink-700">{a.studentProfile?.department}</td>
                  <td className="px-4 py-3 text-ink-700">{a.studentProfile?.cgpa}</td>
                  <td className="px-4 py-3 text-ink-700">{a.matchScore}%</td>
                  <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
