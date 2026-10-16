import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  LayoutDashboard,
  LineChart,
  BriefcaseBusiness,
  Users,
  UserCheck,
  UserX,
  Trophy,
  Activity,
  CalendarDays,
  ShieldCheck,
} from 'lucide-react';

import Layout from '../../components/Layout.jsx';
import Loader from '../../components/Loader.jsx';
import api from '../../api/axios.js';

const statConfig = [
  {
    key: 'totalStudents',
    label: 'Total Students',
    description: 'Registered student accounts',
    icon: GraduationCap,
    color: 'blue',
    to: '/admin/users',
  },
  {
    key: 'activeCompanies',
    label: 'Active Companies',
    description: 'Companies participating',
    icon: Building2,
    color: 'violet',
    to: '/admin/companies',
  },
  {
    key: 'placementDrives',
    label: 'Placement Drives',
    description: 'Drives available in portal',
    icon: BriefcaseBusiness,
    color: 'cyan',
    to: '/admin/jobs',
  },
  {
    key: 'applications',
    label: 'Applications',
    description: 'Applications submitted',
    icon: Activity,
    color: 'indigo',
    to: '/admin/analytics',
  },
  {
    key: 'shortlistedStudents',
    label: 'Shortlisted',
    description: 'Students moved forward',
    icon: UserCheck,
    color: 'amber',
    to: '/admin/analytics',
  },
  {
    key: 'selectedStudents',
    label: 'Selected',
    description: 'Students selected by recruiters',
    icon: CheckCircle2,
    color: 'emerald',
    to: '/admin/analytics',
  },
  {
    key: 'placedStudents',
    label: 'Placed Students',
    description: 'Students successfully placed',
    icon: Trophy,
    color: 'green',
    to: '/admin/analytics',
  },
  {
    key: 'unplacedStudents',
    label: 'Unplaced Students',
    description: 'Students still seeking placement',
    icon: UserX,
    color: 'rose',
    to: '/admin/users',
  },
];

const colorMap = {
  blue: {
    icon: 'bg-blue-50 text-blue-600',
    number: 'text-blue-700',
    line: 'bg-blue-500',
    hover: 'hover:border-blue-200 hover:shadow-blue-100/60',
  },
  violet: {
    icon: 'bg-violet-50 text-violet-600',
    number: 'text-violet-700',
    line: 'bg-violet-500',
    hover: 'hover:border-violet-200 hover:shadow-violet-100/60',
  },
  cyan: {
    icon: 'bg-cyan-50 text-cyan-600',
    number: 'text-cyan-700',
    line: 'bg-cyan-500',
    hover: 'hover:border-cyan-200 hover:shadow-cyan-100/60',
  },
  indigo: {
    icon: 'bg-indigo-50 text-indigo-600',
    number: 'text-indigo-700',
    line: 'bg-indigo-500',
    hover: 'hover:border-indigo-200 hover:shadow-indigo-100/60',
  },
  amber: {
    icon: 'bg-amber-50 text-amber-600',
    number: 'text-amber-700',
    line: 'bg-amber-500',
    hover: 'hover:border-amber-200 hover:shadow-amber-100/60',
  },
  emerald: {
    icon: 'bg-emerald-50 text-emerald-600',
    number: 'text-emerald-700',
    line: 'bg-emerald-500',
    hover: 'hover:border-emerald-200 hover:shadow-emerald-100/60',
  },
  green: {
    icon: 'bg-green-50 text-green-600',
    number: 'text-green-700',
    line: 'bg-green-500',
    hover: 'hover:border-green-200 hover:shadow-green-100/60',
  },
  rose: {
    icon: 'bg-rose-50 text-rose-600',
    number: 'text-rose-700',
    line: 'bg-rose-500',
    hover: 'hover:border-rose-200 hover:shadow-rose-100/60',
  },
};

function StatCard({ item, value }) {
  const Icon = item.icon;
  const colors = colorMap[item.color];

  return (
    <Link
      to={item.to}
      className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${colors.hover}`}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-20" />

      <div className="flex items-start justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${colors.icon}`}>
          <Icon size={21} />
        </div>

        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-all group-hover:bg-slate-100 group-hover:text-slate-700">
          <ArrowRight
            size={16}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </div>
      </div>

      <div className="mt-5">
        <p className="text-sm font-medium text-slate-500">{item.label}</p>

        <p className={`mt-1 text-3xl font-bold tracking-tight ${colors.number}`}>
          {value ?? 0}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          {item.description}
        </p>
      </div>

      <div className="mt-5 h-1 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full w-2/3 rounded-full ${colors.line} transition-all duration-500 group-hover:w-full`}
        />
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="font-medium text-slate-400">View details</span>
        <span className="font-semibold text-slate-600">
          Open <ChevronRight size={13} className="inline" />
        </span>
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/analytics/dashboard')
      .then((res) => setStats(res.data))
      .finally(() => setLoading(false));
  }, []);

  const placementRate = useMemo(() => {
    if (!stats?.totalStudents) return 0;

    return Math.round(
      ((stats.placedStudents || 0) / stats.totalStudents) * 100
    );
  }, [stats]);

  const selectionRate = useMemo(() => {
    if (!stats?.applications) return 0;

    return Math.round(
      ((stats.selectedStudents || 0) / stats.applications) * 100
    );
  }, [stats]);

  const remainingRate = Math.max(100 - placementRate, 0);

  if (loading || !stats) {
    return (
      <Layout title="Admin Dashboard">
        <Loader />
      </Layout>
    );
  }

  return (
    <Layout title="Admin Dashboard">
      <div className="space-y-6">

        {/* HERO */}
        <section className="relative overflow-hidden rounded-3xl bg-slate-950 shadow-xl">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1800&q=85"
              alt="University students collaborating"
              className="h-full w-full object-cover opacity-35"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/35" />
          </div>

          <div className="relative grid gap-8 px-6 py-8 lg:grid-cols-[1.5fr_1fr] lg:px-9 lg:py-10">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
                <ShieldCheck size={14} />
                Placement Administration
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Campus placement overview
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                Monitor students, companies, placement drives and recruitment
                activity from one centralized administration workspace.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/admin/users"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                >
                  <Users size={17} />
                  Manage Users
                  <ArrowRight size={15} />
                </Link>

                <Link
                  to="/admin/analytics"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
                >
                  <BarChart3 size={17} />
                  View Analytics
                </Link>
              </div>
            </div>

            <div className="flex items-end justify-end">
              <div className="w-full max-w-sm rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-300">
                      Placement rate
                    </p>
                    <p className="mt-1 text-4xl font-bold text-white">
                      {placementRate}%
                    </p>
                  </div>

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                    <Trophy className="text-amber-300" size={28} />
                  </div>
                </div>

                <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-emerald-400 transition-all duration-700"
                    style={{ width: `${placementRate}%` }}
                  />
                </div>

                <div className="mt-3 flex justify-between text-xs text-slate-300">
                  <span>{stats.placedStudents || 0} placed</span>
                  <span>{stats.unplacedStudents || 0} remaining</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* KPI HEADER */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
              Live overview
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">
              Placement performance
            </h2>
          </div>

          <Link
            to="/admin/analytics"
            className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Open full analytics
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* STAT CARDS */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statConfig.map((item) => (
            <StatCard
              key={item.key}
              item={item}
              value={stats[item.key]}
            />
          ))}
        </div>

        {/* ANALYTICS ROW */}
        <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">

          {/* PLACEMENT PIPELINE */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <LineChart size={18} />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900">
                      Placement pipeline
                    </h3>
                    <p className="text-xs text-slate-400">
                      Current student progression
                    </p>
                  </div>
                </div>
              </div>

              <Link
                to="/admin/analytics"
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Details
              </Link>
            </div>

            <div className="mt-7 space-y-6">

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">
                    Registered students
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {stats.totalStudents}
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full w-full rounded-full bg-blue-500" />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">
                    Shortlisted
                  </span>
                  <span className="text-sm font-bold text-indigo-600">
                    {stats.shortlistedStudents}
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-indigo-500 transition-all"
                    style={{
                      width: `${stats.totalStudents
                        ? Math.min(
                          (stats.shortlistedStudents /
                            stats.totalStudents) *
                          100,
                          100
                        )
                        : 0
                        }%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">
                    Selected
                  </span>
                  <span className="text-sm font-bold text-emerald-600">
                    {stats.selectedStudents}
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{
                      width: `${stats.totalStudents
                        ? Math.min(
                          (stats.selectedStudents /
                            stats.totalStudents) *
                          100,
                          100
                        )
                        : 0
                        }%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">
                    Placed
                  </span>
                  <span className="text-sm font-bold text-green-600">
                    {stats.placedStudents}
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-green-500 transition-all"
                    style={{ width: `${placementRate}%` }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* RECRUITMENT SNAPSHOT */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                <BarChart3 size={18} />
              </div>

              <div>
                <h3 className="font-bold text-slate-900">
                  Recruitment snapshot
                </h3>
                <p className="text-xs text-slate-400">
                  Portal activity at a glance
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">

              <div className="rounded-xl bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                      <Building2 size={17} />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Active companies
                      </p>
                      <p className="text-xs text-slate-400">
                        Recruiting through campus
                      </p>
                    </div>
                  </div>

                  <span className="text-2xl font-bold text-slate-900">
                    {stats.activeCompanies}
                  </span>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                      <BriefcaseBusiness size={17} />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Placement drives
                      </p>
                      <p className="text-xs text-slate-400">
                        Opportunities currently tracked
                      </p>
                    </div>
                  </div>

                  <span className="text-2xl font-bold text-slate-900">
                    {stats.placementDrives}
                  </span>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                      <Users size={17} />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Applications
                      </p>
                      <p className="text-xs text-slate-400">
                        Candidate applications submitted
                      </p>
                    </div>
                  </div>

                  <span className="text-2xl font-bold text-slate-900">
                    {stats.applications}
                  </span>
                </div>
              </div>

            </div>
          </section>
        </div>

        {/* PERFORMANCE SUMMARY */}
        <section className="grid gap-6 md:grid-cols-3">

          <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Placement
                </p>
                <p className="mt-2 text-3xl font-bold text-emerald-700">
                  {placementRate}%
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                <Trophy size={23} />
              </div>
            </div>

            <p className="mt-3 text-sm text-slate-500">
              Current share of students who have been placed.
            </p>
          </div>

          <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                  Selection
                </p>
                <p className="mt-2 text-3xl font-bold text-indigo-700">
                  {selectionRate}%
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                <UserCheck size={23} />
              </div>
            </div>

            <p className="mt-3 text-sm text-slate-500">
              Selected students compared with total submitted applications.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-amber-700">
                  Still seeking
                </p>
                <p className="mt-2 text-3xl font-bold text-amber-700">
                  {remainingRate}%
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                <UserX size={23} />
              </div>
            </div>

            <p className="mt-3 text-sm text-slate-500">
              Approximate share of students who are not yet placed.
            </p>
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <LayoutDashboard size={18} className="text-indigo-600" />
                <h3 className="font-bold text-slate-900">
                  Administration center
                </h3>
              </div>

              <p className="mt-1 text-sm text-slate-400">
                Jump directly into the areas you manage most often.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

            <Link
              to="/admin/users"
              className="group rounded-xl border border-slate-200 p-4 transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/50"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Users size={19} />
                </div>
                <ArrowRight size={16} className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600" />
              </div>

              <p className="mt-4 font-semibold text-slate-800">
                Manage Users
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Students and portal accounts
              </p>
            </Link>

            <Link
              to="/admin/companies"
              className="group rounded-xl border border-slate-200 p-4 transition hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50/50"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <Building2 size={19} />
                </div>
                <ArrowRight size={16} className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-violet-600" />
              </div>

              <p className="mt-4 font-semibold text-slate-800">
                Companies
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Recruiters and organizations
              </p>
            </Link>

            <Link
              to="/admin/jobs"
              className="group rounded-xl border border-slate-200 p-4 transition hover:-translate-y-0.5 hover:border-cyan-200 hover:bg-cyan-50/50"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                  <BriefcaseBusiness size={19} />
                </div>
                <ArrowRight size={16} className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-cyan-600" />
              </div>

              <p className="mt-4 font-semibold text-slate-800">
                Placement Drives
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Review recruitment drives
              </p>
            </Link>

            <Link
              to="/admin/analytics"
              className="group rounded-xl border border-slate-200 p-4 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50/50"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <BarChart3 size={19} />
                </div>
                <ArrowRight size={16} className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-emerald-600" />
              </div>

              <p className="mt-4 font-semibold text-slate-800">
                Analytics
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Placement performance data
              </p>
            </Link>

          </div>
        </section>

        {/* FOOTER STATUS */}
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-slate-600">
            <CalendarDays size={17} className="text-indigo-500" />
            <span>
              Placement administration workspace
            </span>
          </div>

          <Link
            to="/admin/analytics"
            className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Review placement analytics
            <ArrowRight size={15} />
          </Link>
        </div>

      </div>
    </Layout>
  );
}