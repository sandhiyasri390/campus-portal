import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout.jsx';
import Loader from '../../components/Loader.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import api from '../../api/axios.js';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => api.get('/notifications').then((res) => setNotifications(res.data.notifications));
  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const markRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    load();
  };
  const markAllRead = async () => {
    await api.put('/notifications/read-all');
    load();
  };

  if (loading) return <Layout title="Notifications"><Loader /></Layout>;

  return (
    <Layout title="Notifications">
      {notifications.length > 0 && (
        <div className="mb-4 flex justify-end">
          <button onClick={markAllRead} className="text-sm font-medium text-brand-600 hover:underline">Mark all as read</button>
        </div>
      )}
      {notifications.length === 0 ? (
        <EmptyState title="No notifications" description="You'll see updates about applications, interviews and drives here." />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div key={n._id} onClick={() => !n.isRead && markRead(n._id)}
              className={`rounded-xl border p-4 shadow-card cursor-pointer ${n.isRead ? 'border-slate-200 bg-white' : 'border-brand-200 bg-brand-50/50'}`}>
              <div className="flex items-center justify-between">
                <p className="font-medium text-ink-900 text-sm">{n.title}</p>
                {!n.isRead && <span className="h-2 w-2 rounded-full bg-brand-500" />}
              </div>
              <p className="mt-1 text-sm text-slate-600">{n.message}</p>
              <p className="mt-1 text-xs text-slate-400">{new Date(n.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
