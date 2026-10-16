import React, { useEffect, useMemo, useState } from 'react';
import Layout from '../../components/Layout.jsx';
import Loader from '../../components/Loader.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import api from '../../api/axios.js';
import { useToast } from '../../context/ToastContext.jsx';

export default function Students() {
  const { push } = useToast();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('');

  const load = () => api.get('/students', { params: { search: search || undefined, department: dept || undefined } }).then((res) => setStudents(res.data.students));
  useEffect(() => { load().finally(() => setLoading(false)); }, [search, dept]);

  const verify = async (userId, status) => {
    await api.put(`/students/${userId}/verify`, { status });
    push(`Profile marked ${status}.`, 'success');
    load();
  };

  const departments = useMemo(() => [...new Set(students.map((s) => s.department).filter(Boolean))], [students]);

  return (
    <Layout title="Students">
      <div className="mb-4 flex flex-wrap gap-3">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, register no. or skill…"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus-ring focus:border-brand-400" />
        <select value={dept} onChange={(e) => setDept(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus-ring">
          <option value="">All departments</option>
          {departments.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>
      {loading ? <Loader /> : students.length === 0 ? (
        <EmptyState title="No students found" description="Try adjusting your search or filters." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-card">
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Name</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Department</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">CGPA</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Backlogs</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Verification</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((s) => (
                <tr key={s._id}>
                  <td className="px-4 py-3 font-medium text-ink-800">{s.fullName}</td>
                  <td className="px-4 py-3 text-ink-700">{s.department}</td>
                  <td className="px-4 py-3 text-ink-700">{s.cgpa}</td>
                  <td className="px-4 py-3 text-ink-700">{s.backlogs}</td>
                  <td className="px-4 py-3"><StatusBadge status={s.verificationStatus} /></td>
                  <td className="px-4 py-3">
                    {s.verificationStatus !== 'verified' ? (
                      <button onClick={() => verify(s.user._id, 'verified')} className="rounded-md border border-emerald-200 px-3 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50">Verify</button>
                    ) : (
                      <button onClick={() => verify(s.user._id, 'pending')} className="rounded-md border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50">Unverify</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
