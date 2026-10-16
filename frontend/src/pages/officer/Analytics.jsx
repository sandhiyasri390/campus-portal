import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout.jsx';
import StatCard from '../../components/StatCard.jsx';
import Loader from '../../components/Loader.jsx';
import api from '../../api/axios.js';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';

const COLORS = ['#3358E0', '#5C82F5', '#F5A524', '#10B981', '#8B5CF6', '#EC4899', '#06B6D4', '#F43F5E'];

function ChartCard({ title, children }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
      <h3 className="font-display font-semibold text-ink-900 mb-4">{title}</h3>
      <div style={{ width: '100%', height: 280 }}>{children}</div>
    </div>
  );
}

export default function Analytics() {
  const [placement, setPlacement] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/analytics/placements'), api.get('/analytics/skills')])
      .then(([p, s]) => { setPlacement(p.data); setSkills(s.data.topSkills); })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !placement) return <Layout title="Placement Analytics"><Loader /></Layout>;

  return (
    <Layout title="Placement Analytics">
      <p className="mb-4 text-xs text-slate-400">{placement.note}</p>
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <StatCard label="Placement Rate" value={`${placement.placementRate}%`} accent="text-emerald-600" />
        <StatCard label="Application Conversion" value={`${placement.applicationConversion}%`} accent="text-brand-600" />
        <StatCard label="Selection Rate" value={`${placement.selectionRate}%`} accent="text-amber-500" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Department-wise placements">
          <ResponsiveContainer>
            <BarChart data={placement.departmentStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef1f6" />
              <XAxis dataKey="department" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="total" fill="#B8CDFF" name="Total" radius={[4, 4, 0, 0]} />
              <Bar dataKey="placed" fill="#3358E0" name="Placed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Company-wise selections">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={placement.companyStats} dataKey="selections" nameKey="company" cx="50%" cy="50%" outerRadius={90} label>
                {placement.companyStats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip /><Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Job-role distribution (applications)">
          <ResponsiveContainer>
            <BarChart data={placement.roleStats} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef1f6" />
              <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
              <YAxis type="category" dataKey="role" tick={{ fontSize: 11 }} width={120} />
              <Tooltip />
              <Bar dataKey="applications" fill="#F5A524" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Applications by drive">
          <ResponsiveContainer>
            <BarChart data={placement.applicationsByDrive}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef1f6" />
              <XAxis dataKey="drive" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={70} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="applications" fill="#5C82F5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Skill demand across drives">
          <ResponsiveContainer>
            <BarChart data={skills} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef1f6" />
              <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
              <YAxis type="category" dataKey="skill" tick={{ fontSize: 11 }} width={90} />
              <Tooltip />
              <Bar dataKey="count" fill="#10B981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly recruitment activity">
          <ResponsiveContainer>
            <LineChart data={placement.monthlyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef1f6" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="applications" stroke="#3358E0" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </Layout>
  );
}
