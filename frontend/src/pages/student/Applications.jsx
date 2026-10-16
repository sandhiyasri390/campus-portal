import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout.jsx';
import Loader from '../../components/Loader.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import api from '../../api/axios.js';

const FLOW = [
  'applied',
  'under_review',
  'shortlisted',
  'assessment',
  'technical_interview',
  'hr_interview',
  'selected',
];

const STATUS_LABELS = {
  applied: 'Applied',
  under_review: 'Under Review',
  shortlisted: 'Shortlisted',
  assessment: 'Assessment',
  technical_interview: 'Technical Interview',
  hr_interview: 'HR Interview',
  selected: 'Selected',
  rejected: 'Not Selected',
};

const STATUS_ICONS = {
  applied: '📩',
  under_review: '👀',
  shortlisted: '⭐',
  assessment: '📝',
  technical_interview: '💻',
  hr_interview: '🤝',
  selected: '🎉',
  rejected: '✕',
};

function getStatusLabel(status) {
  return STATUS_LABELS[status] || status?.replaceAll('_', ' ') || 'Unknown';
}

function getStatusIcon(status) {
  return STATUS_ICONS[status] || '•';
}

function getProgress(status) {
  if (status === 'rejected') return 0;

  const index = FLOW.indexOf(status);

  if (index === -1) return 0;

  return Math.round(((index + 1) / FLOW.length) * 100);
}

function formatDate(date) {
  if (!date) return '—';

  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getDaysSince(date) {
  if (!date) return 0;

  const created = new Date(date);
  const now = new Date();

  return Math.max(
    0,
    Math.floor((now - created) / (1000 * 60 * 60 * 24))
  );
}

function Tracker({ status }) {
  if (status === 'rejected') {
    return (
      <div className="rounded-xl border border-rose-100 bg-rose-50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-100 text-sm font-bold text-rose-600">
            ✕
          </div>

          <div>
            <p className="text-sm font-semibold text-rose-800">
              Application closed
            </p>

            <p className="mt-0.5 text-xs text-rose-600">
              Not selected this time. Keep applying to upcoming opportunities.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentIndex = FLOW.indexOf(status);

  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex min-w-[650px] items-start">
        {FLOW.map((step, index) => {
          const completed = index <= currentIndex;
          const active = index === currentIndex;

          return (
            <React.Fragment key={step}>
              <div className="flex flex-1 flex-col items-center">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-bold transition ${completed
                      ? 'border-brand-500 bg-brand-500 text-white'
                      : 'border-slate-200 bg-white text-slate-400'
                    } ${active
                      ? 'ring-4 ring-brand-50'
                      : ''
                    }`}
                  title={getStatusLabel(step)}
                >
                  {completed ? '✓' : index + 1}
                </div>

                <p
                  className={`mt-2 max-w-[90px] text-center text-[10px] font-medium leading-4 ${active
                      ? 'text-brand-700'
                      : completed
                        ? 'text-slate-600'
                        : 'text-slate-400'
                    }`}
                >
                  {getStatusLabel(step)}
                </p>
              </div>

              {index < FLOW.length - 1 && (
                <div
                  className={`mt-[17px] h-0.5 flex-1 ${index < currentIndex
                      ? 'bg-brand-500'
                      : 'bg-slate-200'
                    }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api
      .get('/applications/my')
      .then((res) => setApplications(res.data.applications))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const total = applications.length;

    const active = applications.filter(
      (app) =>
        app.status !== 'rejected' &&
        app.status !== 'selected'
    ).length;

    const shortlisted = applications.filter(
      (app) =>
        app.status === 'shortlisted' ||
        app.status === 'assessment' ||
        app.status === 'technical_interview' ||
        app.status === 'hr_interview'
    ).length;

    const selected = applications.filter(
      (app) => app.status === 'selected'
    ).length;

    const rejected = applications.filter(
      (app) => app.status === 'rejected'
    ).length;

    const averageMatch =
      total > 0
        ? Math.round(
          applications.reduce(
            (sum, app) => sum + (app.matchScore || 0),
            0
          ) / total
        )
        : 0;

    return {
      total,
      active,
      shortlisted,
      selected,
      rejected,
      averageMatch,
    };
  }, [applications]);

  const filteredApplications = useMemo(() => {
    const query = search.trim().toLowerCase();

    return applications
      .filter((app) => {
        if (filter === 'all') return true;

        if (filter === 'active') {
          return (
            app.status !== 'rejected' &&
            app.status !== 'selected'
          );
        }

        if (filter === 'shortlisted') {
          return [
            'shortlisted',
            'assessment',
            'technical_interview',
            'hr_interview',
          ].includes(app.status);
        }

        return app.status === filter;
      })
      .filter((app) => {
        if (!query) return true;

        return (
          app.job?.title?.toLowerCase().includes(query) ||
          app.company?.name?.toLowerCase().includes(query) ||
          app.status?.toLowerCase().includes(query)
        );
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0) -
          new Date(a.createdAt || 0)
      );
  }, [applications, search, filter]);

  if (loading) {
    return (
      <Layout title="My Applications">
        <Loader />
      </Layout>
    );
  }

  return (
    <Layout title="My Applications">
      <div className="space-y-6">

        {/* HERO */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-brand-950 shadow-card">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl" />
            <div className="absolute -bottom-32 left-20 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
          </div>

          <div className="relative p-6 sm:p-8 lg:p-10">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Placement journey
              </div>

              <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Track every opportunity in one place.
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Monitor your applications, follow recruitment progress,
                and stay focused on the opportunities that are moving forward.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  to="/student/jobs"
                  className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  Browse more drives →
                </Link>

                <Link
                  to="/student/profile"
                  className="rounded-xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
                >
                  Improve my profile
                </Link>
              </div>
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
              📋
            </div>

            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Total applications
            </p>

            <p className="mt-1 font-display text-2xl font-bold text-ink-900">
              {stats.total}
            </p>
          </div>

          <div
            onClick={() => setFilter('active')}
            className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-xl">
              ⚡
            </div>

            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Active
            </p>

            <p className="mt-1 font-display text-2xl font-bold text-ink-900">
              {stats.active}
            </p>
          </div>

          <div
            onClick={() => setFilter('shortlisted')}
            className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-xl">
              ⭐
            </div>

            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              In progress
            </p>

            <p className="mt-1 font-display text-2xl font-bold text-ink-900">
              {stats.shortlisted}
            </p>
          </div>

          <div
            onClick={() => setFilter('selected')}
            className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-xl">
              🎉
            </div>

            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Selected
            </p>

            <p className="mt-1 font-display text-2xl font-bold text-ink-900">
              {stats.selected}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-xl">
              🎯
            </div>

            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Avg. match
            </p>

            <p className="mt-1 font-display text-2xl font-bold text-ink-900">
              {stats.averageMatch}%
            </p>
          </div>
        </div>

        {/* FILTER BAR */}
        {applications.length > 0 && (
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card sm:p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  🔎
                </span>

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by job, company or status..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-ink-900 outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-50"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  ['all', 'All'],
                  ['active', 'Active'],
                  ['shortlisted', 'In progress'],
                  ['selected', 'Selected'],
                  ['rejected', 'Not selected'],
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

        {/* APPLICATIONS */}
        {applications.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-card">
            <EmptyState
              title="No applications yet"
              description="Browse open drives and apply to the opportunities you're eligible for."
            />

            <div className="mt-5 flex justify-center">
              <Link
                to="/student/jobs"
                className="rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-600"
              >
                Explore placement drives →
              </Link>
            </div>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-card">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
              🔎
            </div>

            <h3 className="mt-4 font-display text-lg font-bold text-ink-900">
              No matching applications
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Try changing the search term or selecting a different status filter.
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
            {filteredApplications.map((app) => {
              const progress = getProgress(app.status);
              const daysSince = getDaysSince(app.createdAt);

              return (
                <article
                  key={app._id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card transition hover:shadow-lg"
                >
                  {/* TOP */}
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                      <div className="flex gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 text-xl font-bold text-white shadow-sm">
                          {(app.company?.name || 'C')
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="font-display text-lg font-bold text-ink-900">
                              {app.job?.title || 'Placement opportunity'}
                            </h2>

                            {app.status === 'selected' && (
                              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                                Selected
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-sm font-medium text-slate-500">
                            {app.company?.name || 'Company'}
                          </p>

                          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                            <span>
                              Applied {formatDate(app.createdAt)}
                            </span>

                            <span>•</span>

                            <span>
                              {daysSince === 0
                                ? 'Today'
                                : `${daysSince} day${daysSince === 1 ? '' : 's'} ago`}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                        <div className="rounded-xl bg-brand-50 px-4 py-2.5 text-center">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-500">
                            Match
                          </p>

                          <p className="mt-0.5 text-lg font-bold text-brand-700">
                            {app.matchScore ?? 0}%
                          </p>
                        </div>

                        <StatusBadge status={app.status} />
                      </div>
                    </div>

                    {/* PROGRESS */}
                    <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:p-5">
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Recruitment progress
                          </p>

                          <p className="mt-1 text-sm font-bold text-ink-900">
                            {getStatusIcon(app.status)}{' '}
                            {getStatusLabel(app.status)}
                          </p>
                        </div>

                        {app.status !== 'rejected' && (
                          <span className="text-sm font-bold text-brand-600">
                            {progress}%
                          </span>
                        )}
                      </div>

                      <Tracker status={app.status} />

                      {app.status !== 'rejected' && (
                        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-200">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-cyan-400 transition-all"
                            style={{
                              width: `${progress}%`,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* FOOTER */}
                  <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                      <span>
                        <span className="font-semibold text-slate-700">
                          Current stage:
                        </span>{' '}
                        {getStatusLabel(app.status)}
                      </span>

                      {app.matchScore !== undefined && (
                        <span>
                          <span className="font-semibold text-slate-700">
                            Match:
                          </span>{' '}
                          {app.matchScore}%
                        </span>
                      )}
                    </div>

                    {app.job?._id && (
                      <Link
                        to={`/student/jobs/${app.job._id}`}
                        className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
                      >
                        View opportunity →
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* BOTTOM CAREER TIP */}
        {applications.length > 0 && (
          <section className="rounded-2xl border border-brand-100 bg-gradient-to-r from-brand-50 to-cyan-50 p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">
                  Career action
                </p>

                <h3 className="mt-1 font-display text-lg font-bold text-ink-900">
                  Keep your placement pipeline moving.
                </h3>

                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
                  Continue applying to relevant drives while improving the
                  skills that appear most often in your target roles.
                </p>
              </div>

              <Link
                to="/student/jobs"
                className="shrink-0 rounded-xl bg-brand-500 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-brand-600 hover:shadow-md"
              >
                Find more opportunities →
              </Link>
            </div>
          </section>
        )}

      </div>
    </Layout>
  );
}
