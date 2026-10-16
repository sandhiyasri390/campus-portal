import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout.jsx';
import StatCard from '../../components/StatCard.jsx';
import Loader from '../../components/Loader.jsx';
import api from '../../api/axios.js';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [pendingCompanies, setPendingCompanies] = useState([]);
  const [pendingDrives, setPendingDrives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/analytics/dashboard'),
      api.get('/companies', { params: { status: 'pending' } }),
      api.get('/jobs', { params: { status: 'pending_approval' } }),
    ]).then(([s, c, j]) => {
      setStats(s.data);
      setPendingCompanies(c.data.companies);
      setPendingDrives(j.data.jobs);
    }).finally(() => setLoading(false));
  }, []);

  if (loading || !stats) return <Layout title="Placement Officer Dashboard"><Loader /></Layout>;

  return (
    <Layout title="Placement Officer Dashboard">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Students" value={stats.totalStudents} />
        <StatCard label="Active Companies" value={stats.activeCompanies} />
        <StatCard label="Placement Drives" value={stats.placementDrives} />
        <StatCard label="Applications" value={stats.applications} />
        <StatCard label="Shortlisted" value={stats.shortlistedStudents} accent="text-brand-600" />
        <StatCard label="Selected" value={stats.selectedStudents} accent="text-emerald-600" />
        <StatCard label="Placed Students" value={stats.placedStudents} accent="text-emerald-600" />
        <StatCard label="Unplaced Students" value={stats.unplacedStudents} accent="text-amber-500" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
          <h3 className="font-display font-semibold text-ink-900 mb-3">Companies awaiting approval</h3>
          {pendingCompanies.length === 0 && <p className="text-sm text-slate-400">Nothing pending.</p>}
          <ul className="space-y-2">
            {pendingCompanies.map((c) => <li key={c._id} className="text-sm text-ink-700">{c.name} · {c.industry}</li>)}
          </ul>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
          <h3 className="font-display font-semibold text-ink-900 mb-3">Drives awaiting approval</h3>
          {pendingDrives.length === 0 && <p className="text-sm text-slate-400">Nothing pending.</p>}
          <ul className="space-y-2">
            {pendingDrives.map((j) => <li key={j._id} className="text-sm text-ink-700">{j.title} · {j.company?.name}</li>)}
          </ul>
        </div>
      </div>
    </Layout>
  );
}
