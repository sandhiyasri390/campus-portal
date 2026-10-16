import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout.jsx';
import Loader from '../../components/Loader.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import api from '../../api/axios.js';
import { useToast } from '../../context/ToastContext.jsx';

export default function Drives() {
  const { push } = useToast();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending_approval');

  const load = () => api.get('/jobs', { params: filter ? { status: filter } : {} }).then((res) => setJobs(res.data.jobs));
  useEffect(() => { load().finally(() => setLoading(false)); }, [filter]);

  const approve = async (id) => {
    await api.put(`/jobs/${id}/approve`);
    push('Drive approved. Eligible students notified.', 'success');
    load();
  };
  const reject = async (id) => {
    const reason = window.prompt('Reason for rejection (optional):') || '';
    await api.put(`/jobs/${id}/reject`, { reason });
    push('Drive rejected.', 'success');
    load();
  };

  return (
    <Layout title="Placement Drives">
      <div className="mb-4 flex gap-2">
        {['pending_approval', 'approved', 'rejected', 'closed', ''].map((f) => (
          <button key={f || 'all'} onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize ${filter === f ? 'bg-ink-900 text-white' : 'bg-slate-100 text-slate-600'}`}>
            {(f || 'all').replace('_', ' ')}
          </button>
        ))}
      </div>
      {loading ? <Loader /> : jobs.length === 0 ? (
        <EmptyState title="No drives" description="Nothing to show for this filter." />
      ) : (
        <div className="space-y-3">
          {jobs.map((j) => (
            <div key={j._id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-card flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-display font-semibold text-ink-900">{j.title}</p>
                <p className="text-sm text-slate-500">{j.company?.name} · {j.location} · {j.ctc}</p>
                <p className="mt-1 text-xs text-slate-400">Min CGPA {j.eligibility?.minCgpa} · Deadline {new Date(j.applicationDeadline).toDateString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={j.status} />
                {j.status !== 'approved' && j.status !== 'closed' && (
                  <button onClick={() => approve(j._id)} className="rounded-md border border-emerald-200 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50">Approve</button>
                )}
                {j.status !== 'rejected' && j.status !== 'closed' && (
                  <button onClick={() => reject(j._id)} className="rounded-md border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50">Reject</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
