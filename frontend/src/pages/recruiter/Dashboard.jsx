import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout.jsx';
import Loader from '../../components/Loader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import api from '../../api/axios.js';

const PIPELINE = [
  {
    key: 'applied',
    label: 'Applied',
    color: 'bg-slate-400',
  },
  {
    key: 'under_review',
    label: 'Under Review',
    color: 'bg-blue-500',
  },
  {
    key: 'shortlisted',
    label: 'Shortlisted',
    color: 'bg-indigo-500',
  },
  {
    key: 'assessment',
    label: 'Assessment',
    color: 'bg-violet-500',
  },
  {
    key: 'technical_interview',
    label: 'Technical',
    color: 'bg-amber-500',
  },
  {
    key: 'hr_interview',
    label: 'HR Interview',
    color: 'bg-orange-500',
  },
  {
    key: 'selected',
    label: 'Selected',
    color: 'bg-emerald-500',
  },
];

function MetricCard({ label, value, icon, description, accent = 'brand' }) {
  const accents = {
    brand: 'bg-brand-50 text-brand-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    violet: 'bg-violet-50 text-violet-600',
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {label}
          </p>

          <p className="mt-2 text-3xl font-black text-ink-900">
            {value}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl text-lg ${accents[accent] || accents.brand
            }`}
        >
          {icon}
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-500">
        {description}
      </p>
    </div>
  );
}

function MiniProgress({ value, color = 'bg-brand-500' }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
      <div
        className={`h-full rounded-full ${color}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

function getDeadlineStatus(deadline) {
  if (!deadline) return null;

  const date = new Date(deadline);
  if (Number.isNaN(date.getTime())) return null;

  const diff = Math.ceil(
    (date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
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

  if (diff <= 3) {
    return {
      label: `${diff}d left`,
      className: 'bg-amber-50 text-amber-700',
    };
  }

  return {
    label: `${diff}d left`,
    className: 'bg-emerald-50 text-emerald-700',
  };
}

export default function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appCounts, setAppCounts] = useState({});

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      try {
        const res = await api.get('/jobs');

        if (!mounted) return;

        const jobList = res.data.jobs || [];
        setJobs(jobList);

        const counts = {};

        await Promise.all(
          jobList.map(async (job) => {
            try {
              const response = await api.get(
                `/applications/job/${job._id}`
              );

              counts[job._id] = response.data.applications || [];
            } catch {
              counts[job._id] = [];
            }
          })
        );

        if (mounted) {
          setAppCounts(counts);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  const allApps = useMemo(
    () => Object.values(appCounts).flat(),
    [appCounts]
  );

  const activeJobs = jobs.filter(
    (job) => job.status === 'approved'
  ).length;

  const totalApplicants = allApps.length;

  const shortlisted = allApps.filter((application) =>
    [
      'shortlisted',
      'assessment',
      'technical_interview',
      'hr_interview',
    ].includes(application.status)
  ).length;

  const interviews = allApps.filter((application) =>
    [
      'technical_interview',
      'hr_interview',
    ].includes(application.status)
  ).length;

  const selected = allApps.filter(
    (application) => application.status === 'selected'
  ).length;

  const selectionRate =
    totalApplicants > 0
      ? Math.round((selected / totalApplicants) * 100)
      : 0;

  const shortlistRate =
    totalApplicants > 0
      ? Math.round((shortlisted / totalApplicants) * 100)
      : 0;

  const pipeline = PIPELINE.map((stage) => ({
    ...stage,
    count: allApps.filter(
      (application) => application.status === stage.key
    ).length,
  }));

  const maxPipelineCount = Math.max(
    ...pipeline.map((stage) => stage.count),
    1
  );

  const recentApplications = [...allApps]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0) -
        new Date(a.createdAt || 0)
    )
    .slice(0, 5);

  const topDrives = [...jobs]
    .sort(
      (a, b) =>
        ((appCounts[b._id] || []).length) -
        ((appCounts[a._id] || []).length)
    )
    .slice(0, 5);

  const upcomingDrives = [...jobs]
    .filter((job) => job.deadline)
    .sort(
      (a, b) =>
        new Date(a.deadline) -
        new Date(b.deadline)
    )
    .slice(0, 4);

  if (loading) {
    return (
      <Layout title="Recruiter Dashboard">
        <Loader />
      </Layout>
    );
  }

  return (
    <Layout title="Recruiter Dashboard">
      <div className="space-y-6">

        {/* HERO */}
        <section className="relative overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-xl md:p-8">

          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl" />
          <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-400/20 bg-brand-500/10 px-3 py-1.5 text-xs font-bold text-brand-300">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                Recruitment Operations
              </div>

              <h1 className="font-display text-3xl font-black tracking-tight md:text-4xl">
                Your recruitment
                <span className="text-brand-400">
                  {' '}command center.
                </span>
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                Monitor your placement drives, review applicant activity,
                manage your recruitment pipeline and track selections from
                one workspace.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">

                <Link
                  to="/recruiter/jobs/create"
                  className="rounded-xl bg-brand-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand-500/20 transition hover:bg-brand-600"
                >
                  + Post New Drive
                </Link>

                <Link
                  to="/recruiter/jobs"
                  className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  Manage Drives →
                </Link>

              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:w-[430px]">

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Drives
                </p>
                <p className="mt-1 text-2xl font-black">
                  {jobs.length}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Applicants
                </p>
                <p className="mt-1 text-2xl font-black">
                  {totalApplicants}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Interviews
                </p>
                <p className="mt-1 text-2xl font-black">
                  {interviews}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Selected
                </p>
                <p className="mt-1 text-2xl font-black text-emerald-300">
                  {selected}
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* KPI CARDS */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

          <MetricCard
            label="Active Drives"
            value={activeJobs}
            icon="💼"
            description="Currently approved placement drives"
            accent="brand"
          />

          <MetricCard
            label="Applicants"
            value={totalApplicants}
            icon="👥"
            description="Applications received across drives"
            accent="blue"
          />

          <MetricCard
            label="Shortlisted"
            value={shortlisted}
            icon="🎯"
            description={`${shortlistRate}% of applicants progressed`}
            accent="violet"
          />

          <MetricCard
            label="Interviews"
            value={interviews}
            icon="🎤"
            description="Technical and HR interview stages"
            accent="amber"
          />

          <MetricCard
            label="Selected"
            value={selected}
            icon="✓"
            description={`${selectionRate}% overall selection rate`}
            accent="emerald"
          />

        </section>

        {/* PIPELINE + PERFORMANCE */}
        <section className="grid gap-6 xl:grid-cols-[1.5fr_0.8fr]">

          {/* PIPELINE */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card md:p-7">

            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">
                  Recruitment funnel
                </p>

                <h2 className="mt-1 font-display text-xl font-black text-ink-900">
                  Applicant pipeline
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Track how candidates are progressing through your
                  recruitment process.
                </p>
              </div>

              <span className="rounded-full bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700">
                {totalApplicants} total
              </span>
            </div>

            <div className="mt-7 space-y-4">

              {pipeline.map((stage) => {
                const width =
                  (stage.count / maxPipelineCount) * 100;

                return (
                  <div key={stage.key}>

                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${stage.color}`}
                        />

                        <span className="text-sm font-semibold text-slate-700">
                          {stage.label}
                        </span>
                      </div>

                      <span className="text-sm font-black text-ink-900">
                        {stage.count}
                      </span>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${stage.color} transition-all duration-700`}
                        style={{
                          width: `${width}%`,
                        }}
                      />
                    </div>

                  </div>
                );
              })}

            </div>
          </div>

          {/* CONVERSION */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card md:p-7">

            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
              Recruitment analytics
            </p>

            <h2 className="mt-1 font-display text-xl font-black text-ink-900">
              Conversion snapshot
            </h2>

            <div className="mt-6 space-y-5">

              <div>
                <div className="mb-2 flex justify-between">
                  <span className="text-sm font-semibold text-slate-600">
                    Applicants → Shortlisted
                  </span>

                  <span className="text-sm font-black text-ink-900">
                    {shortlistRate}%
                  </span>
                </div>

                <MiniProgress
                  value={shortlistRate}
                  color="bg-indigo-500"
                />
              </div>

              <div>
                <div className="mb-2 flex justify-between">
                  <span className="text-sm font-semibold text-slate-600">
                    Applicants → Interviews
                  </span>

                  <span className="text-sm font-black text-ink-900">
                    {totalApplicants
                      ? Math.round(
                        (interviews / totalApplicants) * 100
                      )
                      : 0}
                    %
                  </span>
                </div>

                <MiniProgress
                  value={
                    totalApplicants
                      ? (interviews / totalApplicants) * 100
                      : 0
                  }
                  color="bg-amber-500"
                />
              </div>

              <div>
                <div className="mb-2 flex justify-between">
                  <span className="text-sm font-semibold text-slate-600">
                    Applicants → Selected
                  </span>

                  <span className="text-sm font-black text-ink-900">
                    {selectionRate}%
                  </span>
                </div>

                <MiniProgress
                  value={selectionRate}
                  color="bg-emerald-500"
                />
              </div>

            </div>

            <div className="mt-7 rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Pipeline status
              </p>

              <p className="mt-1 text-sm font-bold text-slate-700">
                {selected > 0
                  ? `${selected} candidate${selected === 1 ? '' : 's'} selected so far`
                  : 'No candidates selected yet'}
              </p>
            </div>

          </div>
        </section>

        {/* DRIVES */}
        <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">

          {/* TOP DRIVES */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card md:p-7">

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">
                  Drive performance
                </p>

                <h2 className="mt-1 font-display text-xl font-black text-ink-900">
                  Your placement drives
                </h2>
              </div>

              <Link
                to="/recruiter/jobs"
                className="text-sm font-bold text-brand-600 hover:underline"
              >
                View all →
              </Link>
            </div>

            <div className="mt-6 space-y-3">

              {topDrives.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                  <p className="text-sm font-bold text-slate-700">
                    No placement drives yet
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Create your first drive to start receiving candidates.
                  </p>

                  <Link
                    to="/recruiter/jobs/create"
                    className="mt-4 inline-flex rounded-xl bg-brand-500 px-4 py-2.5 text-xs font-bold text-white"
                  >
                    + Post Drive
                  </Link>
                </div>
              ) : (
                topDrives.map((job) => {
                  const applicants =
                    appCounts[job._id] || [];

                  const deadline =
                    getDeadlineStatus(job.deadline);

                  return (
                    <div
                      key={job._id}
                      className="group rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-brand-200 hover:bg-brand-50/30"
                    >

                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                        <div className="flex min-w-0 items-center gap-4">

                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-lg font-black text-brand-600 shadow-sm">
                            {job.title?.charAt(0)?.toUpperCase() || 'J'}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-black text-ink-900">
                              {job.title}
                            </p>

                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              <span className="text-xs text-slate-500">
                                {applicants.length} applicants
                              </span>

                              <span className="text-slate-300">
                                •
                              </span>

                              <StatusBadge status={job.status} />

                              {deadline && (
                                <>
                                  <span className="text-slate-300">
                                    •
                                  </span>

                                  <span
                                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${deadline.className}`}
                                  >
                                    {deadline.label}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                        </div>

                        <div className="flex items-center gap-3">
                          <Link
                            to={`/recruiter/jobs/${job._id}`}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:border-brand-300 hover:text-brand-600"
                          >
                            Manage
                          </Link>
                        </div>

                      </div>

                    </div>
                  );
                })
              )}

            </div>
          </div>

          {/* UPCOMING DEADLINES */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card md:p-7">

            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-600">
              Upcoming
            </p>

            <h2 className="mt-1 font-display text-xl font-black text-ink-900">
              Drive deadlines
            </h2>

            <div className="mt-6 space-y-3">

              {upcomingDrives.length === 0 ? (
                <p className="rounded-2xl bg-slate-50 p-5 text-center text-xs text-slate-400">
                  No upcoming deadlines available.
                </p>
              ) : (
                upcomingDrives.map((job) => {
                  const deadline =
                    getDeadlineStatus(job.deadline);

                  return (
                    <div
                      key={job._id}
                      className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">

                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-ink-900">
                            {job.title}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Deadline
                          </p>

                          <p className="mt-1 text-xs font-semibold text-slate-600">
                            {new Date(
                              job.deadline
                            ).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        </div>

                        {deadline && (
                          <span
                            className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${deadline.className}`}
                          >
                            {deadline.label}
                          </span>
                        )}

                      </div>
                    </div>
                  );
                })
              )}

            </div>
          </div>

        </section>

        {/* RECENT ACTIVITY */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card md:p-7">

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
                Recent activity
              </p>

              <h2 className="mt-1 font-display text-xl font-black text-ink-900">
                Latest candidate movement
              </h2>
            </div>

            <Link
              to="/recruiter/applicants"
              className="text-sm font-bold text-brand-600 hover:underline"
            >
              View applicants →
            </Link>
          </div>

          <div className="mt-6 divide-y divide-slate-100">

            {recentApplications.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm font-bold text-slate-700">
                  No application activity yet.
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Candidate activity will appear here as applications arrive.
                </p>
              </div>
            ) : (
              recentApplications.map((application, index) => {

                const student =
                  application.student ||
                  application.applicant ||
                  {};

                const name =
                  student.fullName ||
                  student.name ||
                  'Student';

                const initials = name
                  .split(' ')
                  .slice(0, 2)
                  .map((part) => part.charAt(0))
                  .join('')
                  .toUpperCase();

                return (
                  <div
                    key={
                      application._id ||
                      `${application.job?._id}-${index}`
                    }
                    className="flex items-center gap-4 py-4"
                  >

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-100 to-indigo-100 text-xs font-black text-brand-700">
                      {initials || 'ST'}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-ink-900">
                        {name}
                      </p>

                      <p className="mt-1 truncate text-xs text-slate-400">
                        Applied for{' '}
                        {application.job?.title ||
                          'placement drive'}
                      </p>
                    </div>

                    <div className="hidden sm:block">
                      <StatusBadge
                        status={application.status}
                      />
                    </div>

                  </div>
                );
              })
            )}

          </div>
        </section>

        {/* QUICK ACTIONS */}
        <section className="rounded-3xl bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-700 p-6 text-white shadow-xl md:p-8">

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-200">
                Recruiter workspace
              </p>

              <h2 className="mt-1 font-display text-2xl font-black">
                Keep your recruitment moving.
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-indigo-100">
                Post new opportunities, review applicants, move candidates
                through your pipeline and manage interviews from the recruiter
                workspace.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">

              <Link
                to="/recruiter/jobs/create"
                className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-indigo-700 transition hover:bg-indigo-50"
              >
                Create Drive
              </Link>

              <Link
                to="/recruiter/applicants"
                className="rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/15"
              >
                Review Applicants
              </Link>

            </div>

          </div>

        </section>

      </div>
    </Layout>
  );
}