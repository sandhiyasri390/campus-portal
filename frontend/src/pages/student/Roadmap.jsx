import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout.jsx';
import Loader from '../../components/Loader.jsx';
import ProgressBar from '../../components/ProgressBar.jsx';
import api from '../../api/axios.js';

export default function Roadmap() {
  const [weeks, setWeeks] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = () => api.get('/students/roadmap').then((res) => {
    setWeeks(res.data.weeks);
    setTasks(res.data.tasks);
    setProgress(res.data.progress);
  });

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const toggle = async (taskId) => {
    await api.put(`/students/roadmap/tasks/${taskId}/toggle`);
    load();
  };

  if (loading) return <Layout title="Preparation Roadmap"><Loader /></Layout>;

  return (
    <Layout title="Preparation Roadmap">
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-card">
        <div className="flex items-center justify-between">
          <p className="font-display font-semibold text-ink-900">Overall progress</p>
          <span className="text-sm font-semibold text-brand-600">{progress}%</span>
        </div>
        <div className="mt-2"><ProgressBar value={progress} /></div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {weeks.map((w) => {
          const weekTasks = tasks.filter((t) => t.week === w.week);
          return (
            <div key={w.week} className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">Week {w.week}</p>
              <p className="font-display font-semibold text-ink-900 mt-0.5">{w.category}</p>
              <ul className="mt-3 space-y-2">
                {weekTasks.map((t) => (
                  <li key={t._id}>
                    <label className="flex items-start gap-2 text-sm text-ink-700 cursor-pointer">
                      <input type="checkbox" checked={t.completed} onChange={() => toggle(t._id)} className="mt-0.5 rounded border-slate-300 text-brand-500 focus-ring" />
                      <span className={t.completed ? 'line-through text-slate-400' : ''}>{t.title}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </Layout>
  );
}
