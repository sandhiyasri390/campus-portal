import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout.jsx';
import Loader from '../../components/Loader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import api from '../../api/axios.js';
import { useToast } from '../../context/ToastContext.jsx';

const EMPTY = { name: '', industry: '', website: '', description: '', location: '', logoUrl: '' };

export default function Company() {
  const { push } = useToast();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => api.get('/companies').then((res) => setCompanies(res.data.companies));
  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/companies/${editingId}`, form);
        push('Company updated.', 'success');
      } else {
        await api.post('/companies', form);
        push('Company profile created — pending placement officer approval.', 'success');
      }
      setForm(EMPTY);
      setEditingId(null);
      load();
    } catch (err) {
      push(err.response?.data?.message || 'Could not save company.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const edit = (c) => {
    setForm({ name: c.name, industry: c.industry || '', website: c.website || '', description: c.description || '', location: c.location || '', logoUrl: c.logoUrl || '' });
    setEditingId(c._id);
  };

  if (loading) return <Layout title="Company"><Loader /></Layout>;

  return (
    <Layout title="Company Profile">
      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={submit} className="rounded-xl border border-slate-200 bg-white p-6 shadow-card space-y-4">
          <h3 className="font-display font-semibold text-ink-900">{editingId ? 'Edit company' : 'Create a company profile'}</h3>
          {['name', 'industry', 'website', 'location', 'logoUrl'].map((f) => (
            <div key={f}>
              <label className="block text-sm font-medium text-ink-800 capitalize">{f}</label>
              <input value={form[f]} onChange={(e) => setField(f, e.target.value)} required={f === 'name'}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus-ring focus:border-brand-400" />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-ink-800">Description</label>
            <textarea value={form.description} onChange={(e) => setField('description', e.target.value)} rows={4}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus-ring focus:border-brand-400" />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60 focus-ring">
              {saving ? 'Saving…' : editingId ? 'Update company' : 'Create company'}
            </button>
            {editingId && (
              <button type="button" onClick={() => { setForm(EMPTY); setEditingId(null); }} className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-600 focus-ring">
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
          <h3 className="font-display font-semibold text-ink-900 mb-4">Your companies</h3>
          {companies.length === 0 && <p className="text-sm text-slate-400">No company profiles yet.</p>}
          <div className="space-y-3">
            {companies.map((c) => (
              <div key={c._id} className="rounded-lg border border-slate-100 p-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-ink-800 text-sm">{c.name}</p>
                  <StatusBadge status={c.status} />
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{c.industry} · {c.location}</p>
                {c.status === 'rejected' && c.rejectionReason && <p className="mt-1 text-xs text-rose-600">Reason: {c.rejectionReason}</p>}
                <button onClick={() => edit(c)} className="mt-2 text-xs font-medium text-brand-600 hover:underline">Edit</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
