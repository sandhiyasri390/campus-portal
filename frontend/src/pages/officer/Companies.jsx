import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout.jsx';
import Loader from '../../components/Loader.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import api from '../../api/axios.js';
import { useToast } from '../../context/ToastContext.jsx';

export default function Companies() {
  const { push } = useToast();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  const load = () => api.get('/companies', { params: filter ? { status: filter } : {} }).then((res) => setCompanies(res.data.companies));
  useEffect(() => { load().finally(() => setLoading(false)); }, [filter]);

  const setStatus = async (id, status) => {
    let rejectionReason = '';
    if (status === 'rejected') rejectionReason = window.prompt('Reason for rejection (optional):') || '';
    await api.put(`/companies/${id}/status`, { status, rejectionReason });
    push(`Company ${status}.`, 'success');
    load();
  };

  return (
    <Layout title="Companies">
      <div className="mb-4 flex gap-2">
        {['pending', 'approved', 'rejected', ''].map((f) => (
          <button key={f || 'all'} onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize ${filter === f ? 'bg-ink-900 text-white' : 'bg-slate-100 text-slate-600'}`}>
            {f || 'All'}
          </button>
        ))}
      </div>
      {loading ? <Loader /> : companies.length === 0 ? (
        <EmptyState title="No companies" description="Nothing to show for this filter." />
      ) : (
        <div className="space-y-3">
          {companies.map((c) => (
            <div key={c._id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-card flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-display font-semibold text-ink-900">{c.name}</p>
                <p className="text-sm text-slate-500">{c.industry} · {c.location} · by {c.createdBy?.name}</p>
                <p className="mt-1 text-sm text-ink-600 max-w-xl">{c.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={c.status} />
                {c.status !== 'approved' && (
                  <button onClick={() => setStatus(c._id, 'approved')} className="rounded-md border border-emerald-200 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50">Approve</button>
                )}
                {c.status !== 'rejected' && (
                  <button onClick={() => setStatus(c._id, 'rejected')} className="rounded-md border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50">Reject</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
