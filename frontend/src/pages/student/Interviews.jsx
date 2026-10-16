import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout.jsx';
import Loader from '../../components/Loader.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import api from '../../api/axios.js';

const STATUS_STYLES = {
  scheduled: {
    label: 'Scheduled',
    className: 'bg-blue-50 text-blue-700 border-blue-100',
    icon: '📅',
  },
  completed: {
    label: 'Completed',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    icon: '✓',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-rose-50 text-rose-700 border-rose-100',
    icon: '✕',
  },
  pending: {
    label: 'Pending',
    className: 'bg-amber-50 text-amber-700 border-amber-100',
    icon: '⏳',
  },
};

function getStatus(status) {
  return (
    STATUS_STYLES[status?.toLowerCase()] || {
      label: status || 'Scheduled',
      className: 'bg-slate-50 text-slate-700 border-slate-100',
      icon: '•',
    }
  );
}

function getInterviewType(type) {
  if (!type) return 'Interview';

  return type
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(date) {
  if (!date) return 'Date not available';

  return new Date(date).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getDateParts(date) {
  if (!date) {
    return {
      day: '--',
      month: '---',
    };
  }

  const value = new Date(date);

  return {
    day: value.toLocaleDateString('en-IN', {
      day: '2-digit',
    }),
    month: value.toLocaleDateString('en-IN', {
      month: 'short',
    }),
  };
}

function getDaysDifference(date) {
  if (!date) return null;

  const target = new Date(date);
  const today = new Date();

  target.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return Math.ceil(
    (target - today) / (1000 * 60 * 60 * 24)
  );
}

function getTimingLabel(date) {
  const days = getDaysDifference(date);

  if (days === null) return '';

  if (days < 0) return 'Past';
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days <= 7) return `In ${days} days`;

  return formatDate(date);
}

export default function Interviews() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api
      .get('/interviews')
      .then((res) => setInterviews(res.data.interviews))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const upcoming = interviews.filter((iv) => {
      const days = getDaysDifference(iv.date);

      return (
        days !== null &&
        days >= 0 &&
        iv.status?.toLowerCase() !== 'cancelled'
      );
    }).length;

    const completed = interviews.filter(
      (iv) => iv.status?.toLowerCase() === 'completed'
    ).length;

    const cancelled = interviews.filter(
      (iv) => iv.status?.toLowerCase() === 'cancelled'
    ).length;

    const online = interviews.filter(
      (iv) =>
        iv.meetingLink ||
        iv.type?.toLowerCase().includes('online') ||
        iv.type?.toLowerCase().includes('virtual')
    ).length;

    return {
      total: interviews.length,
      upcoming,
      completed,
      cancelled,
      online,
    };
  }, [interviews]);

  const filteredInterviews = useMemo(() => {
    const query = search.trim().toLowerCase();

    return interviews
      .filter((iv) => {
        if (filter === 'all') return true;

        if (filter === 'upcoming') {
          const days = getDaysDifference(iv.date);

          return (
            days !== null &&
            days >= 0 &&
            iv.status?.toLowerCase() !== 'cancelled'
          );
        }

        return iv.status?.toLowerCase() === filter;
      })
      .filter((iv) => {
        if (!query) return true;

        return (
          iv.job?.title?.toLowerCase().includes(query) ||
          iv.interviewer?.toLowerCase().includes(query) ||
          iv.location?.toLowerCase().includes(query) ||
          iv.type?.toLowerCase().includes(query)
        );
      })
      .sort(
        (a, b) =>
          new Date(a.date || 0) -
          new Date(b.date || 0)
      );
  }, [interviews, filter, search]);

  if (loading) {
    return (
      <Layout title="Interviews">
        <Loader />
      </Layout>
    );
  }

  return (
    <Layout title="Interviews">
      <div className="space-y-6">

        {/* HERO */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 shadow-card">
          <div className="absolute inset-0">
            <div className="absolute -right-24 -top-28 h-80 w-80 rounded-full bg-brand-500/20 blur-3xl" />
            <div className="absolute -bottom-32 left-16 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
          </div>

          <div className="relative p-6 sm:p-8 lg:p-10">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Interview center
              </div>

              <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Prepare for every conversation.
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Keep track of your upcoming interviews, recruiter details,
                meeting links, venues and important interview stages.
              </p>

              {stats.upcoming > 0 && (
                <div className="mt-6 inline-flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
                  <span className="text-xl">⏰</span>

                  <div>
                    <p className="text-xs text-slate-400">
                      Upcoming interviews
                    </p>

                    <p className="text-sm font-bold text-white">
                      {stats.upcoming} scheduled
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* STATS */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">

          <div
            onClick={() => setFilter('all')}
            className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-xl">
              📅
            </div>

            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Total interviews
            </p>

            <p className="mt-1 font-display text-2xl font-bold text-ink-900">
              {stats.total}
            </p>
          </div>

          <div
            onClick={() => setFilter('upcoming')}
            className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-xl">
              ⏰
            </div>

            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Upcoming
            </p>

            <p className="mt-1 font-display text-2xl font-bold text-ink-900">
              {stats.upcoming}
            </p>
          </div>

          <div
            onClick={() => setFilter('completed')}
            className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-xl">
              ✓
            </div>

            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Completed
            </p>

            <p className="mt-1 font-display text-2xl font-bold text-ink-900">
              {stats.completed}
            </p>
          </div>

          <div
            onClick={() => setFilter('cancelled')}
            className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-xl">
              ✕
            </div>

            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Cancelled
            </p>

            <p className="mt-1 font-display text-2xl font-bold text-ink-900">
              {stats.cancelled}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-xl">
              💻
            </div>

            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Online / virtual
            </p>

            <p className="mt-1 font-display text-2xl font-bold text-ink-900">
              {stats.online}
            </p>
          </div>
        </div>

        {/* FILTERS */}
        {interviews.length > 0 && (
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card sm:p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  🔎
                </span>

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by role, interviewer, type or location..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-ink-900 outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-50"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  ['all', 'All'],
                  ['upcoming', 'Upcoming'],
                  ['completed', 'Completed'],
                  ['cancelled', 'Cancelled'],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setFilter(value)}
                    className={`rounded-xl px-4 py-2.5 text-xs font-semibold transition ${filter === value
                      ? 'bg-brand-500 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* EMPTY STATE */}
        {interviews.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-card">
            <EmptyState
              title="No interviews scheduled"
              description="Interviews will appear here once a recruiter schedules one for your application."
            />
          </div>
        ) : filteredInterviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-card">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
              🔎
            </div>

            <h3 className="mt-4 font-display text-lg font-bold text-ink-900">
              No matching interviews
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Try changing the search term or selecting another filter.
            </p>

            <button
              onClick={() => {
                setSearch('');
                setFilter('all');
              }}
              className="mt-5 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="space-y-5">

            {/* SECTION HEADER */}
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">
                  Your schedule
                </p>

                <h2 className="mt-1 font-display text-xl font-bold text-ink-900">
                  Interview timeline
                </h2>
              </div>

              <p className="text-xs text-slate-400">
                {filteredInterviews.length} interview
                {filteredInterviews.length === 1 ? '' : 's'}
              </p>
            </div>

            {/* INTERVIEW CARDS */}
            <div className="grid gap-5 lg:grid-cols-2">
              {filteredInterviews.map((iv) => {
                const status = getStatus(iv.status);
                const dateParts = getDateParts(iv.date);
                const timing = getTimingLabel(iv.date);
                const days = getDaysDifference(iv.date);

                const isToday = days === 0;
                const isTomorrow = days === 1;
                const isUpcoming = days !== null && days >= 0;

                return (
                  <article
                    key={iv._id}
                    className={`overflow-hidden rounded-2xl border bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-lg ${isToday && iv.status !== 'cancelled'
                      ? 'border-brand-300 ring-4 ring-brand-50'
                      : 'border-slate-200'
                      }`}
                  >
                    {/* TOP STRIP */}
                    <div
                      className={`h-1.5 ${iv.status?.toLowerCase() === 'cancelled'
                        ? 'bg-rose-400'
                        : iv.status?.toLowerCase() === 'completed'
                          ? 'bg-emerald-400'
                          : 'bg-gradient-to-r from-brand-500 to-cyan-400'
                        }`}
                    />

                    <div className="p-5 sm:p-6">

                      {/* HEADER */}
                      <div className="flex items-start justify-between gap-4">

                        <div className="flex gap-4">
                          <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                            <span className="text-lg font-bold leading-none">
                              {dateParts.day}
                            </span>

                            <span className="mt-1 text-[10px] font-bold uppercase tracking-wide">
                              {dateParts.month}
                            </span>
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-display text-lg font-bold text-ink-900">
                                {iv.job?.title || 'Interview'}
                              </h3>
                            </div>

                            <p className="mt-1 text-sm font-medium text-slate-500">
                              {getInterviewType(iv.type)}
                            </p>

                            {timing && (
                              <p
                                className={`mt-2 text-xs font-semibold ${isToday
                                  ? 'text-brand-600'
                                  : isTomorrow
                                    ? 'text-amber-600'
                                    : 'text-slate-400'
                                  }`}
                              >
                                {isToday
                                  ? '🔥 Today'
                                  : isTomorrow
                                    ? '⏰ Tomorrow'
                                    : timing}
                              </p>
                            )}
                          </div>
                        </div>

                        <span
                          className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold ${status.className
                            }`}
                        >
                          {status.icon} {status.label}
                        </span>
                      </div>

                      {/* DATE + TIME */}
                      <div className="mt-5 grid gap-3 sm:grid-cols-2">

                        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                          <div className="flex items-start gap-3">
                            <span className="text-lg">🗓️</span>

                            <div>
                              <p className="text-[11px] uppercase tracking-wide text-slate-400">
                                Date
                              </p>

                              <p className="mt-1 text-sm font-semibold text-ink-800">
                                {formatDate(iv.date)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                          <div className="flex items-start gap-3">
                            <span className="text-lg">⏰</span>

                            <div>
                              <p className="text-[11px] uppercase tracking-wide text-slate-400">
                                Time
                              </p>

                              <p className="mt-1 text-sm font-semibold text-ink-800">
                                {iv.time || 'Time not specified'}
                              </p>
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* DETAILS */}
                      <div className="mt-3 space-y-3">

                        {iv.interviewer && (
                          <div className="flex items-start gap-3 rounded-xl border border-slate-100 p-3.5">
                            <span className="text-lg">👤</span>

                            <div className="min-w-0">
                              <p className="text-[11px] uppercase tracking-wide text-slate-400">
                                Interviewer
                              </p>

                              <p className="mt-1 truncate text-sm font-semibold text-ink-800">
                                {iv.interviewer}
                              </p>
                            </div>
                          </div>
                        )}

                        {iv.location && (
                          <div className="flex items-start gap-3 rounded-xl border border-slate-100 p-3.5">
                            <span className="text-lg">📍</span>

                            <div className="min-w-0">
                              <p className="text-[11px] uppercase tracking-wide text-slate-400">
                                Location
                              </p>

                              <p className="mt-1 text-sm font-semibold text-ink-800">
                                {iv.location}
                              </p>
                            </div>
                          </div>
                        )}

                        {iv.meetingLink && (
                          <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-3.5">
                            <span className="text-lg">💻</span>

                            <div className="min-w-0 flex-1">
                              <p className="text-[11px] uppercase tracking-wide text-blue-500">
                                Online meeting
                              </p>

                              <a
                                href={iv.meetingLink}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-1 block truncate text-sm font-semibold text-blue-700 hover:underline"
                              >
                                Join meeting →
                              </a>
                            </div>
                          </div>
                        )}

                      </div>

                      {/* PREPARATION */}
                      {isUpcoming &&
                        iv.status?.toLowerCase() !== 'cancelled' && (
                          <div className="mt-5 rounded-xl border border-amber-100 bg-amber-50 p-4">
                            <div className="flex gap-3">
                              <span className="text-lg">💡</span>

                              <div>
                                <p className="text-sm font-semibold text-amber-800">
                                  Preparation reminder
                                </p>

                                <p className="mt-1 text-xs leading-5 text-amber-700">
                                  Review the job description, prepare your
                                  introduction, revise relevant technical
                                  skills, and keep your resume ready.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                      {/* FOOTER */}
                      <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-slate-400">
                          Interview type:{' '}
                          <span className="font-medium text-slate-600">
                            {getInterviewType(iv.type)}
                          </span>
                        </p>

                        {iv.meetingLink ? (
                          <a
                            href={iv.meetingLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center rounded-xl bg-brand-500 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-brand-600"
                          >
                            Join interview →
                          </a>
                        ) : (
                          <span className="rounded-xl bg-slate-100 px-4 py-2.5 text-center text-xs font-semibold text-slate-500">
                            Check venue details
                          </span>
                        )}
                      </div>

                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {/* PREPARATION CENTER */}
        {interviews.length > 0 && (
          <section className="rounded-2xl border border-brand-100 bg-gradient-to-r from-brand-50 via-white to-cyan-50 p-5 shadow-card sm:p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">
                  Interview preparation
                </p>

                <h3 className="mt-1 font-display text-xl font-bold text-ink-900">
                  Turn the interview into your next opportunity.
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Before every interview, review the company, understand the
                  role, revise your strongest skills and prepare concise
                  examples of your projects and achievements.
                </p>
              </div>

              <div className="grid shrink-0 grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  ['📄', 'Resume'],
                  ['💻', 'Technical'],
                  ['🗣️', 'HR'],
                  ['🏢', 'Company'],
                ].map(([icon, label]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-white bg-white/80 px-4 py-3 text-center shadow-sm"
                  >
                    <div className="text-lg">{icon}</div>
                    <p className="mt-1 text-[11px] font-semibold text-slate-600">
                      {label}
                    </p>
                  </div>
                ))}
              </div>

            </div>
          </section>
        )}

      </div>
    </Layout>
  );
}