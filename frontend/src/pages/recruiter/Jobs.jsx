import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout.jsx';
import Loader from '../../components/Loader.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import api from '../../api/axios.js';
import { useToast } from '../../context/ToastContext.jsx';

const STATUS_FILTERS = [
  'all',
  'approved',
  'pending',
  'rejected',
  'closed',
];

function getDeadlineInfo(deadline) {
  if (!deadline) {
    return {
      label: 'No deadline',
      className: 'bg-slate-100 text-slate-500',
    };
  }

  const date = new Date(deadline);

  if (Number.isNaN(date.getTime())) {
    return {
      label: 'No deadline',
      className: 'bg-slate-100 text-slate-500',
    };
  }

  const diff = Math.ceil(
    (date.getTime() - Date.now()) /
    (1000 * 60 * 60 * 24)
  );

  if (diff < 0) {
    return {
      label: 'Closed',
      className: 'bg-rose-50 text-rose-600',
    };
  }

  if (diff === 0) {
    return {
      label: 'Ends today',
      className: 'bg-amber-50 text-amber-700',
    };
  }

  if (diff === 1) {
    return {
      label: '1 day left',
      className: 'bg-amber-50 text-amber-700',
    };
  }

  if (diff <= 3) {
    return {
      label: `${diff} days left`,
      className: 'bg-amber-50 text-amber-700',
    };
  }

  return {
    label: `${diff} days left`,
    className: 'bg-emerald-50 text-emerald-700',
  };
}

function getApplicantCount(job) {
  return (
    job.applicantCount ??
    job.applicantsCount ??
    job.applicationCount ??
    0
  );
}

function getJobType(job) {
  return (
    job.jobType ||
    job.type ||
    job.employmentType ||
    'Placement Drive'
  );
}

export default function Jobs() {
  const { push } = useToast();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('latest');

  const load = async () => {
    const res = await api.get('/jobs');
    setJobs(res.data.jobs || []);
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const close = async (id) => {
    if (
      !window.confirm(
        'Close this drive? Students will no longer be able to apply.'
      )
    ) {
      return;
    }

    try {
      await api.put(`/jobs/${id}/close`);
      push('Drive closed successfully.', 'success');
      await load();
    } catch (err) {
      push(
        err.response?.data?.message ||
        'Could not close the drive.',
        'error'
      );
    }
  };

  const remove = async (id) => {
    if (
      !window.confirm(
        'Delete this drive permanently? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      await api.delete(`/jobs/${id}`);
      push('Drive deleted successfully.', 'success');
      await load();
    } catch (err) {
      push(
        err.response?.data?.message ||
        'Could not delete the drive.',
        'error'
      );
    }
  };

  const filteredJobs = useMemo(() => {
    let list = [...jobs];

    const query = search.trim().toLowerCase();

    if (query) {
      list = list.filter((job) => {
        const searchable = [
          job.title,
          job.location,
          job.ctc,
          getJobType(job),
          ...(job.requiredSkills || []),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return searchable.includes(query);
      });
    }

    if (statusFilter !== 'all') {
      list = list.filter(
        (job) => job.status === statusFilter
      );
    }

    if (sortBy === 'applicants') {
      list.sort(
        (a, b) =>
          getApplicantCount(b) -
          getApplicantCount(a)
      );
    }

    if (sortBy === 'deadline') {
      list.sort((a, b) => {
        const aDate = a.deadline
          ? new Date(a.deadline).getTime()
          : Infinity;

        const bDate = b.deadline
          ? new Date(b.deadline).getTime()
          : Infinity;

        return aDate - bDate;
      });
    }

    if (sortBy === 'latest') {
      list.sort(
        (a, b) =>
          new Date(b.createdAt || 0) -
          new Date(a.createdAt || 0)
      );
    }

    if (sortBy === 'title') {
      list.sort((a, b) =>
        String(a.title || '').localeCompare(
          String(b.title || '')
        )
      );
    }

    return list;
  }, [jobs, search, statusFilter, sortBy]);

  const stats = useMemo(() => {
    const active = jobs.filter(
      (job) => job.status === 'approved'
    ).length;

    const pending = jobs.filter(
      (job) => job.status === 'pending'
    ).length;

    const rejected = jobs.filter(
      (job) => job.status === 'rejected'
    ).length;

    const closed = jobs.filter(
      (job) => job.status === 'closed'
    ).length;

    const applicants = jobs.reduce(
      (sum, job) => sum + getApplicantCount(job),
      0
    );

    const openings = jobs.reduce(
      (sum, job) => sum + Number(job.openings || 0),
      0
    );

    return {
      total: jobs.length,
      active,
      pending,
      rejected,
      closed,
      applicants,
      openings,
    };
  }, [jobs]);

  if (loading) {
    return (
      <Layout title="My Drives">
        <Loader />
      </Layout>
    );
  }

  return (
    <Layout title="My Drives">
      <div className="space-y-6">

        {/* HERO */}
        <section className="relative overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-xl md:p-8">

          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brand-500/20 blur-3xl" />
          <div className="absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-400/20 bg-brand-500/10 px-3 py-1.5 text-xs font-bold text-brand-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Recruitment Drives
              </div>

              <h1 className="font-display text-3xl font-black tracking-tight md:text-4xl">
                Manage your
                <span className="text-brand-400">
                  {' '}placement drives.
                </span>
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                Create opportunities, monitor applications, track deadlines
                and manage every recruitment drive from one workspace.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">

                <Link
                  to="/recruiter/jobs/create"
                  className="rounded-xl bg-brand-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand-500/20 transition hover:bg-brand-600"
                >
                  + Post New Drive
                </Link>

                <Link
                  to="/recruiter/applicants"
                  className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  View Applicants →
                </Link>

              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Total
                </p>
                <p className="mt-1 text-2xl font-black">
                  {stats.total}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Active
                </p>
                <p className="mt-1 text-2xl font-black text-emerald-300">
                  {stats.active}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Applicants
                </p>
                <p className="mt-1 text-2xl font-black">
                  {stats.applicants}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Openings
                </p>
                <p className="mt-1 text-2xl font-black">
                  {stats.openings}
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              All Drives
            </p>
            <p className="mt-2 text-3xl font-black text-ink-900">
              {stats.total}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Total opportunities posted
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 shadow-card">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Active
            </p>
            <p className="mt-2 text-3xl font-black text-emerald-700">
              {stats.active}
            </p>
            <p className="mt-2 text-xs text-emerald-600">
              Approved and accepting applications
            </p>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-5 shadow-card">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-600">
              Pending
            </p>
            <p className="mt-2 text-3xl font-black text-amber-700">
              {stats.pending}
            </p>
            <p className="mt-2 text-xs text-amber-600">
              Awaiting placement approval
            </p>
          </div>

          <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-5 shadow-card">
            <p className="text-xs font-bold uppercase tracking-wider text-rose-600">
              Rejected
            </p>
            <p className="mt-2 text-3xl font-black text-rose-700">
              {stats.rejected}
            </p>
            <p className="mt-2 text-xs text-rose-600">
              Drives requiring attention
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Closed
            </p>
            <p className="mt-2 text-3xl font-black text-slate-700">
              {stats.closed}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Completed recruitment drives
            </p>
          </div>

        </section>

        {/* FILTER BAR */}
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-card md:p-6">

          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

            <div className="relative flex-1 xl:max-w-xl">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                🔎
              </span>

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search by role, location, skills or CTC..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map((status) => {
                const active =
                  statusFilter === status;

                const label =
                  status === 'all'
                    ? 'All'
                    : status.charAt(0).toUpperCase() +
                    status.slice(1);

                return (
                  <button
                    key={status}
                    onClick={() =>
                      setStatusFilter(status)
                    }
                    className={`rounded-xl px-4 py-2.5 text-xs font-bold transition ${active
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value)
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 outline-none focus:border-brand-400"
            >
              <option value="latest">
                Sort: Latest
              </option>
              <option value="applicants">
                Sort: Applicants
              </option>
              <option value="deadline">
                Sort: Deadline
              </option>
              <option value="title">
                Sort: Title
              </option>
            </select>

          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
            <span>
              Showing{' '}
              <strong className="text-slate-700">
                {filteredJobs.length}
              </strong>{' '}
              of {jobs.length} drives
            </span>

            {(search || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearch('');
                  setStatusFilter('all');
                }}
                className="font-bold text-brand-600 hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>

        </section>

        {/* DRIVE LIST */}
        {filteredJobs.length === 0 ? (
          <EmptyState
            title={
              jobs.length === 0
                ? 'No drives yet'
                : 'No matching drives'
            }
            description={
              jobs.length === 0
                ? 'Post your first placement drive to start receiving applications.'
                : 'Try changing your search or filters.'
            }
          />
        ) : (
          <section className="space-y-4">

            {filteredJobs.map((job) => {
              const applicants =
                getApplicantCount(job);

              const deadline =
                getDeadlineInfo(job.deadline);

              const skills =
                Array.isArray(job.requiredSkills)
                  ? job.requiredSkills
                  : [];

              const applicantRatio =
                Number(job.openings) > 0
                  ? Math.min(
                    100,
                    (applicants /
                      Number(job.openings)) *
                    100
                  )
                  : 0;

              return (
                <article
                  key={job._id}
                  className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-card transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-xl"
                >

                  <div className="p-6 md:p-7">

                    {/* TOP */}
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                      <div className="flex min-w-0 gap-4">

                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-100 to-indigo-100 text-xl font-black text-brand-700 shadow-sm">
                          {job.title?.charAt(0)?.toUpperCase() || 'J'}
                        </div>

                        <div className="min-w-0">

                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="font-display text-lg font-black text-ink-900">
                              {job.title}
                            </h2>

                            <StatusBadge status={job.status} />
                          </div>

                          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                            <span>
                              📍 {job.location || 'Location not specified'}
                            </span>

                            <span className="text-slate-300">
                              •
                            </span>

                            <span>
                              💼 {getJobType(job)}
                            </span>

                            {job.ctc && (
                              <>
                                <span className="text-slate-300">
                                  •
                                </span>

                                <span>
                                  💰 {job.ctc}
                                </span>
                              </>
                            )}
                          </div>

                        </div>
                      </div>

                      <div
                        className={`self-start rounded-full px-3 py-1.5 text-xs font-bold ${deadline.className}`}
                      >
                        ⏳ {deadline.label}
                      </div>

                    </div>

                    {/* METRICS */}
                    <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Applicants
                        </p>

                        <p className="mt-1 text-2xl font-black text-ink-900">
                          {applicants}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Candidates received
                        </p>
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Openings
                        </p>

                        <p className="mt-1 text-2xl font-black text-ink-900">
                          {job.openings || 0}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Positions available
                        </p>
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Application load
                        </p>

                        <p className="mt-1 text-2xl font-black text-indigo-600">
                          {Math.round(applicantRatio)}%
                        </p>

                        <div className="mt-2">
                          <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                            <div
                              className="h-full rounded-full bg-indigo-500"
                              style={{
                                width: `${applicantRatio}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Drive deadline
                        </p>

                        <p className="mt-1 text-sm font-black text-ink-900">
                          {job.deadline
                            ? new Date(
                              job.deadline
                            ).toLocaleDateString(
                              'en-IN',
                              {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              }
                            )
                            : 'Not specified'}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Application closing date
                        </p>
                      </div>

                    </div>

                    {/* SKILLS */}
                    {skills.length > 0 && (
                      <div className="mt-5">

                        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Required skills
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {skills.slice(0, 8).map(
                            (skill) => (
                              <span
                                key={skill}
                                className="rounded-full border border-brand-100 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700"
                              >
                                {skill}
                              </span>
                            )
                          )}

                          {skills.length > 8 && (
                            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500">
                              +{skills.length - 8} more
                            </span>
                          )}
                        </div>

                      </div>
                    )}

                    {/* REJECTION */}
                    {job.status === 'rejected' &&
                      job.rejectionReason && (
                        <div className="mt-5 rounded-2xl border border-rose-100 bg-rose-50 p-4">
                          <p className="text-xs font-bold uppercase tracking-wider text-rose-500">
                            Placement officer feedback
                          </p>

                          <p className="mt-1 text-sm leading-6 text-rose-700">
                            {job.rejectionReason}
                          </p>
                        </div>
                      )}

                    {/* ACTIONS */}
                    <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">

                      <div className="flex flex-wrap gap-2">

                        <Link
                          to={`/recruiter/applicants?jobId=${job._id}`}
                          className="rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800"
                        >
                          View Applicants
                        </Link>

                        <Link
                          to={`/recruiter/jobs/${job._id}`}
                          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:border-brand-300 hover:text-brand-600"
                        >
                          Manage Drive
                        </Link>

                      </div>

                      <div className="flex flex-wrap gap-2">

                        {job.status !== 'closed' && (
                          <button
                            onClick={() =>
                              close(job._id)
                            }
                            className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
                          >
                            Close Drive
                          </button>
                        )}

                        <button
                          onClick={() =>
                            remove(job._id)
                          }
                          className="rounded-xl border border-rose-100 px-4 py-2.5 text-xs font-bold text-rose-600 transition hover:bg-rose-50"
                        >
                          Delete
                        </button>

                      </div>

                    </div>

                  </div>

                </article>
              );
            })}

          </section>
        )}

        {/* BOTTOM CTA */}
        <section className="rounded-3xl bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-700 p-6 text-white shadow-xl md:p-8">

          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-200">
                Recruitment workspace
              </p>

              <h2 className="mt-1 font-display text-xl font-black">
                Ready to launch another opportunity?
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-indigo-100">
                Create a new placement drive and start building your
                candidate pipeline.
              </p>
            </div>

            <Link
              to="/recruiter/jobs/create"
              className="shrink-0 rounded-xl bg-white px-5 py-3 text-sm font-bold text-indigo-700 transition hover:bg-indigo-50"
            >
              + Create New Drive
            </Link>

          </div>
        </section>

      </div>
    </Layout>
  );
}