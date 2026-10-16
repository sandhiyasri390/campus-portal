import React, { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Search,
  Users,
  Video,
  MapPin,
  XCircle,
  BriefcaseBusiness,
  ArrowUpRight,
  Sparkles,
  Filter,
  ChevronRight,
} from 'lucide-react';

import Layout from '../../components/Layout.jsx';
import Loader from '../../components/Loader.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import api from '../../api/axios.js';
import { useToast } from '../../context/ToastContext.jsx';

const TYPE_LABELS = {
  online: 'Online',
  offline: 'Offline',
  technical: 'Technical',
  hr: 'HR',
  group_discussion: 'Group Discussion',
};

const formatType = (type) =>
  TYPE_LABELS[type] || type?.replaceAll('_', ' ') || 'Interview';

const formatDate = (date) => {
  if (!date) return 'Date not set';

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return 'Date not set';
  }

  return parsed.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const getDateTime = (date, time) => {
  if (!date) return null;

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return null;

  return parsed;
};

export default function Interviews() {
  const { push } = useToast();

  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const load = () =>
    api
      .get('/interviews')
      .then((res) => setInterviews(res.data.interviews || []));

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const updateResult = async (id, result) => {
    try {
      await api.put(`/interviews/${id}`, {
        result,
        status: 'completed',
      });

      push('Interview result updated.', 'success');
      load();
    } catch (err) {
      push(
        err.response?.data?.message || 'Could not update interview result.',
        'error'
      );
    }
  };

  const stats = useMemo(() => {
    const scheduled = interviews.filter(
      (iv) => iv.status !== 'completed'
    ).length;

    const completed = interviews.filter(
      (iv) => iv.status === 'completed'
    ).length;

    const passed = interviews.filter(
      (iv) => iv.result === 'pass'
    ).length;

    const failed = interviews.filter(
      (iv) => iv.result === 'fail'
    ).length;

    return {
      total: interviews.length,
      scheduled,
      completed,
      passed,
      failed,
    };
  }, [interviews]);

  const filteredInterviews = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...interviews]
      .filter((iv) => {
        if (statusFilter !== 'all' && iv.status !== statusFilter) {
          return false;
        }

        if (typeFilter !== 'all' && iv.type !== typeFilter) {
          return false;
        }

        if (!query) return true;

        const candidate = iv.student?.name || '';
        const job = iv.job?.title || '';
        const interviewer = iv.interviewer || '';
        const type = formatType(iv.type);

        return `${candidate} ${job} ${interviewer} ${type}`
          .toLowerCase()
          .includes(query);
      })
      .sort((a, b) => {
        const dateA = getDateTime(a.date, a.time);
        const dateB = getDateTime(b.date, b.time);

        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;

        return dateA - dateB;
      });
  }, [interviews, search, statusFilter, typeFilter]);

  const upcomingCount = interviews.filter(
    (iv) => iv.status !== 'completed'
  ).length;

  const statusLabel = (status) => {
    if (!status) return 'Scheduled';

    return status
      .replaceAll('_', ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const statusClass = (status) => {
    if (status === 'completed') {
      return 'border-slate-200 bg-slate-100 text-slate-600';
    }

    if (status === 'cancelled') {
      return 'border-rose-200 bg-rose-50 text-rose-700';
    }

    return 'border-amber-200 bg-amber-50 text-amber-700';
  };

  const typeIcon = (type) => {
    if (type === 'offline') {
      return <MapPin className="h-4 w-4" />;
    }

    return <Video className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <Layout title="Interview Management">
        <Loader label="Loading interview schedule..." />
      </Layout>
    );
  }

  return (
    <Layout title="Interview Management">
      <div className="space-y-6 pb-10">

        {/* ========================================================= */}
        {/* HERO */}
        {/* ========================================================= */}

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 shadow-xl">
          <div className="absolute -right-24 -top-28 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative grid gap-8 p-7 sm:p-9 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-8">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-indigo-100 backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Recruitment Operations
                <span className="text-indigo-300">•</span>
                Interview Management
              </div>

              <h1 className="max-w-3xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Manage every candidate conversation.
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-indigo-100 sm:text-base">
                Coordinate technical rounds, HR discussions and group
                interviews from one centralized recruitment workspace.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur">
                  <CalendarDays className="h-4 w-4 text-cyan-300" />
                  {upcomingCount} active interviews
                </div>

                <div className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  {stats.completed} completed
                </div>
              </div>
            </div>

            <div className="hidden lg:col-span-4 lg:block">
              <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-cyan-300">
                    <CalendarDays className="h-6 w-6" />
                  </div>

                  <Sparkles className="h-5 w-5 text-violet-300" />
                </div>

                <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-indigo-300">
                  Recruitment Calendar
                </p>

                <p className="mt-2 text-3xl font-extrabold text-white">
                  {stats.total}
                </p>

                <p className="mt-1 text-xs leading-5 text-indigo-200">
                  Interviews currently tracked across placement drives.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* KPI CARDS */}
        {/* ========================================================= */}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Total Interviews
                </p>
                <p className="mt-2 text-3xl font-extrabold text-slate-900">
                  {stats.total}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Across all recruitment rounds
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Scheduled
                </p>
                <p className="mt-2 text-3xl font-extrabold text-slate-900">
                  {stats.scheduled}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Awaiting completion
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Clock3 className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Passed
                </p>
                <p className="mt-2 text-3xl font-extrabold text-slate-900">
                  {stats.passed}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Candidates advancing
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Not Passed
                </p>
                <p className="mt-2 text-3xl font-extrabold text-slate-900">
                  {stats.failed}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Recorded outcomes
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <XCircle className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* PIPELINE SUMMARY */}
        {/* ========================================================= */}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-500">
                Interview Pipeline
              </p>

              <h2 className="mt-1 text-xl font-extrabold text-slate-900">
                Recruitment activity snapshot
              </h2>
            </div>

            <div className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
              {stats.total} total
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

            <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-700">
                  Scheduled
                </span>
                <Clock3 className="h-4 w-4 text-indigo-500" />
              </div>
              <p className="mt-3 text-2xl font-extrabold text-indigo-950">
                {stats.scheduled}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">
                  Completed
                </span>
                <CheckCircle2 className="h-4 w-4 text-slate-500" />
              </div>
              <p className="mt-3 text-2xl font-extrabold text-slate-900">
                {stats.completed}
              </p>
            </div>

            <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700">
                  Passed
                </span>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </div>
              <p className="mt-3 text-2xl font-extrabold text-emerald-950">
                {stats.passed}
              </p>
            </div>

            <div className="rounded-xl border border-rose-100 bg-rose-50/70 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-700">
                  Failed
                </span>
                <XCircle className="h-4 w-4 text-rose-500" />
              </div>
              <p className="mt-3 text-2xl font-extrabold text-rose-950">
                {stats.failed}
              </p>
            </div>

          </div>
        </section>

        {/* ========================================================= */}
        {/* FILTER BAR */}
        {/* ========================================================= */}

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">

            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search candidate, role or interviewer..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">

              <div className="relative">
                <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-9 text-sm font-medium text-slate-700 outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 sm:w-44"
                >
                  <option value="all">All statuses</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 sm:w-44"
              >
                <option value="all">All interview types</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="technical">Technical</option>
                <option value="hr">HR</option>
                <option value="group_discussion">
                  Group Discussion
                </option>
              </select>

            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* INTERVIEW LIST */}
        {/* ========================================================= */}

        {interviews.length === 0 ? (
          <EmptyState
            title="No interviews scheduled"
            description="Schedule interviews from the Applicants page."
          />
        ) : filteredInterviews.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <Search className="h-6 w-6" />
            </div>

            <h3 className="mt-4 text-base font-bold text-slate-900">
              No matching interviews
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <section>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Interview Schedule
                </p>

                <h2 className="mt-1 text-xl font-extrabold text-slate-900">
                  Candidate conversations
                </h2>
              </div>

              <span className="text-xs font-semibold text-slate-500">
                {filteredInterviews.length} result
                {filteredInterviews.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">

              {filteredInterviews.map((iv) => (
                <div
                  key={iv._id}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg"
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400" />

                  <div className="p-5 sm:p-6">

                    {/* Candidate header */}

                    <div className="flex items-start justify-between gap-4">

                      <div className="flex min-w-0 items-center gap-3">

                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-extrabold text-white shadow-md">
                          {(iv.student?.name || 'C')
                            .split(' ')
                            .map((part) => part[0])
                            .slice(0, 2)
                            .join('')
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate text-base font-extrabold text-slate-900">
                            {iv.student?.name || 'Candidate'}
                          </h3>

                          <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-slate-500">
                            <BriefcaseBusiness className="h-3.5 w-3.5 flex-shrink-0" />
                            {iv.job?.title || 'Placement Interview'}
                          </p>
                        </div>

                      </div>

                      <span
                        className={`flex-shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-bold ${statusClass(
                          iv.status
                        )}`}
                      >
                        {statusLabel(iv.status)}
                      </span>

                    </div>

                    {/* Date / time */}

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">

                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                          <CalendarDays className="h-3.5 w-3.5" />
                          Date
                        </div>

                        <p className="mt-2 text-sm font-bold text-slate-900">
                          {formatDate(iv.date)}
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                          <Clock3 className="h-3.5 w-3.5" />
                          Time
                        </div>

                        <p className="mt-2 text-sm font-bold text-slate-900">
                          {iv.time || 'Time not set'}
                        </p>
                      </div>

                    </div>

                    {/* Interview information */}

                    <div className="mt-4 flex flex-wrap gap-2">

                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs font-bold text-indigo-700">
                        {typeIcon(iv.type)}
                        {formatType(iv.type)}
                      </span>

                      {iv.interviewer && (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-600">
                          <Users className="h-3.5 w-3.5" />
                          {iv.interviewer}
                        </span>
                      )}

                      {iv.location && (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-600">
                          <MapPin className="h-3.5 w-3.5" />
                          {iv.location}
                        </span>
                      )}

                    </div>

                    {/* Existing result */}

                    {iv.result && (
                      <div
                        className={`mt-4 flex items-center justify-between rounded-xl border p-3 ${iv.result === 'pass'
                            ? 'border-emerald-100 bg-emerald-50'
                            : 'border-rose-100 bg-rose-50'
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          {iv.result === 'pass' ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-rose-600" />
                          )}

                          <span
                            className={`text-xs font-bold ${iv.result === 'pass'
                                ? 'text-emerald-700'
                                : 'text-rose-700'
                              }`}
                          >
                            Interview Result
                          </span>
                        </div>

                        <span
                          className={`text-xs font-extrabold uppercase ${iv.result === 'pass'
                              ? 'text-emerald-700'
                              : 'text-rose-700'
                            }`}
                        >
                          {iv.result}
                        </span>
                      </div>
                    )}

                    {/* Actions */}

                    {iv.status !== 'completed' && (
                      <div className="mt-5 flex flex-col gap-2 sm:flex-row">

                        <button
                          onClick={() => updateResult(iv._id, 'pass')}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Mark Pass
                        </button>

                        <button
                          onClick={() => updateResult(iv._id, 'fail')}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-xs font-bold text-rose-700 transition hover:bg-rose-50"
                        >
                          <XCircle className="h-4 w-4" />
                          Mark Fail
                        </button>

                      </div>
                    )}

                    {iv.status === 'completed' && (
                      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                        <span className="text-xs font-medium text-slate-400">
                          Interview completed
                        </span>

                        <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-500">
                          View record
                          <ChevronRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    )}

                  </div>
                </div>
              ))}

            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* BOTTOM INSIGHT */}
        {/* ========================================================= */}

        <section className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-cyan-50 p-6">
          <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-indigo-100/60 blur-2xl" />

          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
                <Sparkles className="h-5 w-5" />
              </div>

              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Keep candidate decisions moving.
                </h3>

                <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
                  Record interview outcomes promptly so shortlisted candidates
                  can progress through the recruitment pipeline without delay.
                </p>
              </div>
            </div>

            <div className="inline-flex flex-shrink-0 items-center gap-1.5 text-xs font-bold text-indigo-600">
              Recruitment pipeline
              <ArrowUpRight className="h-4 w-4" />
            </div>

          </div>
        </section>

      </div>
    </Layout>
  );
}