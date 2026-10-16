import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout.jsx';
import Loader from '../../components/Loader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import api from '../../api/axios.js';

// Lightweight aggregate view built from the students/companies endpoints
// (there is no separate list-all-users endpoint to keep API surface small).
export default function Users() {
  const [students, setStudents] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('students');

  useEffect(() => {
    Promise.all([api.get('/students'), api.get('/companies')])
      .then(([s, c]) => { setStudents(s.data.students); setCompanies(c.data.companies); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout title="Users"><Loader /></Layout>;

  return (
    <Layout title="Users">
      <div className="mb-4 flex gap-2">
        <button onClick={() => setTab('students')} className={`rounded-full px-3 py-1.5 text-xs font-medium ${tab === 'students' ? 'bg-ink-900 text-white' : 'bg-slate-100 text-slate-600'}`}>Students ({students.length})</button>
        <button onClick={() => setTab('recruiters')} className={`rounded-full px-3 py-1.5 text-xs font-medium ${tab === 'recruiters' ? 'bg-ink-900 text-white' : 'bg-slate-100 text-slate-600'}`}>Recruiters / Companies ({companies.length})</button>
      </div>

      {tab === 'students' ? (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-card">
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Name</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Email</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Department</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((s) => (
                <tr key={s._id}>
                  <td className="px-4 py-3 font-medium text-ink-800">{s.fullName}</td>
                  <td className="px-4 py-3 text-ink-700">{s.user?.email}</td>
                  <td className="px-4 py-3 text-ink-700">{s.department}</td>
                  <td className="px-4 py-3"><StatusBadge status={s.verificationStatus} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-card">
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Company</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Recruiter</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Industry</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {companies.map((c) => (
                <tr key={c._id}>
                  <td className="px-4 py-3 font-medium text-ink-800">{c.name}</td>
                  <td className="px-4 py-3 text-ink-700">{c.createdBy?.name} ({c.createdBy?.email})</td>
                  <td className="px-4 py-3 text-ink-700">{c.industry}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
