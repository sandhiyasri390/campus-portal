import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout.jsx';
import Loader from '../../components/Loader.jsx';
import api from '../../api/axios.js';
import { useToast } from '../../context/ToastContext.jsx';

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { push } = useToast();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  const load = () =>
    api
      .get(`/jobs/${id}`)
      .then((res) => setJob(res.data.job))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, [id]);

  useEffect(() => {
    api
      .get('/applications/my')
      .then((res) => {
        setApplied(
          (res.data.applications || []).some(
            (a) => (typeof a.job === 'object' ? a.job?._id : a.job) === id
          )
        );
      })
      .catch(() => {});
  }, [id]);

  const apply = async () => {
    setApplying(true);

    try {
      await api.post('/applications', { jobId: id });
      push('Application submitted successfully.', 'success');
      setApplied(true);
    } catch (err) {
      push(
        err.response?.data?.message || 'Could not apply.',
        'error'
      );
    } finally {
      setApplying(false);
    }
  };

  if (loading || !job) {
    return (
      <Layout title="Drive Details">
        <Loader />
      </Layout>
    );
  }

  const deadline = new Date(job.applicationDeadline);
  const now = new Date();
  const deadlinePassed = now > deadline;

  const daysLeft = Math.max(
    0,
    Math.ceil((deadline - now) / (1000 * 60 * 60 * 24))
  );

  const matchScore = job.matchScore ?? 0;

  const matchLabel =
    matchScore >= 85
      ? 'Excellent match'
      : matchScore >= 70
        ? 'Strong match'
        : matchScore >= 50
          ? 'Good match'
          : 'Low match';

  const matchColor =
    matchScore >= 85
      ? 'emerald'
      : matchScore >= 70
        ? 'brand'
        : matchScore >= 50
          ? 'amber'
          : 'rose';

  return (
    <Layout title="Job Details">
      <div className="space-y-6">

        {/* BACK */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-ink-900"
        >
          <span className="text-lg">←</span>
          Back to placement drives
        </button>

        {/* HERO */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-brand-950 shadow-card">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-brand-400 blur-3xl" />
            <div className="absolute -bottom-32 left-20 h-72 w-72 rounded-full bg-cyan-400 blur-3xl" />
          </div>

          <div className="relative p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">

              <div className="flex-1">
                <div className="mb-5 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-white/80 backdrop-blur">
                    Placement Drive
                  </span>

                  {deadlinePassed ? (
                    <span className="rounded-full border border-rose-300/30 bg-rose-500/20 px-3 py-1 text-xs font-semibold text-rose-300">
                      🔴 Expired / Closed
                    </span>
                  ) : (
                    <span className="rounded-full border border-emerald-300/30 bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
                      🟢 Active Drive
                    </span>
                  )}

                  {job.eligible === true && (
                    <span className="rounded-full border border-emerald-300/20 bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-300">
                      ✓ Eligible
                    </span>
                  )}

                  {job.eligible === false && (
                    <span className="rounded-full border border-rose-300/20 bg-rose-400/15 px-3 py-1 text-xs font-semibold text-rose-300">
                      Eligibility issue
                    </span>
                  )}
                </div>

                <h1 className="max-w-3xl font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  {job.title}
                </h1>

                <p className="mt-3 text-base text-slate-300">
                  {job.company?.name || 'Company'}{' '}
                  <span className="mx-2 text-slate-500">•</span>
                  {job.location || 'Location not specified'}
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <div className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
                    <p className="text-[11px] uppercase tracking-wider text-slate-400">
                      CTC
                    </p>
                    <p className="mt-1 font-semibold text-white">
                      {job.ctc || 'Not specified'}
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
                    <p className="text-[11px] uppercase tracking-wider text-slate-400">
                      Openings
                    </p>
                    <p className="mt-1 font-semibold text-white">
                      {job.openings ?? '—'}
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
                    <p className="text-[11px] uppercase tracking-wider text-slate-400">
                      Drive date
                    </p>
                    <p className="mt-1 font-semibold text-white">
                      {job.driveDate
                        ? new Date(job.driveDate).toLocaleDateString(
                          'en-IN',
                          {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          }
                        )
                        : 'To be announced'}
                    </p>
                  </div>
                </div>
              </div>

              {/* MATCH SCORE */}
              {job.matchScore !== undefined && (
                <div className="flex shrink-0 justify-center">
                  <div className="relative flex h-36 w-36 items-center justify-center rounded-full border-[10px] border-white/10 bg-white/5">
                    <div
                      className={`absolute inset-0 rounded-full border-[10px] border-${matchColor}-400`}
                      style={{
                        clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%)`,
                        opacity: 0.85,
                      }}
                    />

                    <div className="text-center">
                      <p className="text-3xl font-bold text-white">
                        {matchScore}%
                      </p>
                      <p className="mt-1 text-[11px] font-medium text-slate-400">
                        Match score
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* QUICK STATS */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-xl">
              💰
            </div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Compensation
            </p>
            <p className="mt-1 font-display text-lg font-bold text-ink-900">
              {job.ctc || 'Not specified'}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-xl">
              📍
            </div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Location
            </p>
            <p className="mt-1 font-display text-lg font-bold text-ink-900">
              {job.location || 'Not specified'}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-xl">
              👥
            </div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Openings
            </p>
            <p className="mt-1 font-display text-lg font-bold text-ink-900">
              {job.openings ?? '—'}
            </p>
          </div>

          <div
            className={`rounded-2xl border p-5 shadow-card ${deadlinePassed
                ? 'border-rose-200 bg-rose-50'
                : daysLeft <= 3
                  ? 'border-amber-200 bg-amber-50'
                  : 'border-emerald-200 bg-emerald-50'
              }`}
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
              ⏳
            </div>

            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Application deadline
            </p>

            <p className="mt-1 font-display text-lg font-bold text-ink-900">
              {deadlinePassed
                ? 'Closed'
                : `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`}
            </p>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="grid gap-6 lg:grid-cols-3">

          {/* LEFT */}
          <div className="space-y-6 lg:col-span-2">

            {/* ABOUT */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card sm:p-7">
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">
                  Opportunity overview
                </p>

                <h2 className="mt-1 font-display text-xl font-bold text-ink-900">
                  About this role
                </h2>
              </div>

              <p className="whitespace-pre-line text-sm leading-7 text-slate-600">
                {job.description || 'No job description has been provided.'}
              </p>
            </section>

            {/* SKILL MATCH */}
            {job.matchScore !== undefined && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card sm:p-7">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">
                      Personalized analysis
                    </p>

                    <h2 className="mt-1 font-display text-xl font-bold text-ink-900">
                      Your skill match
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {matchLabel} based on your current profile.
                    </p>
                  </div>

                  <div className="rounded-xl bg-brand-50 px-4 py-3 text-center">
                    <p className="text-2xl font-bold text-brand-700">
                      {matchScore}%
                    </p>
                    <p className="text-[11px] font-medium text-brand-600">
                      profile match
                    </p>
                  </div>
                </div>

                <div className="mt-6 h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-500 to-cyan-400 transition-all"
                    style={{
                      width: `${Math.min(100, Math.max(0, matchScore))}%`,
                    }}
                  />
                </div>

                <div className="mt-7 space-y-5">

                  {job.matchedSkills?.length > 0 && (
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-sm font-semibold text-emerald-700">
                          ✓ Skills you have
                        </p>

                        <span className="text-xs text-slate-400">
                          {job.matchedSkills.length} matched
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {job.matchedSkills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700"
                          >
                            ✓ {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {job.missingSkills?.length > 0 && (
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-sm font-semibold text-rose-700">
                          Skills to improve
                        </p>

                        <span className="text-xs text-slate-400">
                          {job.missingSkills.length} missing
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {job.missingSkills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {job.recommendedSkills?.length > 0 && (
                    <div>
                      <div className="mb-2">
                        <p className="text-sm font-semibold text-amber-700">
                          Recommended skills
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {job.recommendedSkills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700"
                          >
                            + {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 rounded-xl bg-slate-50 p-4">
                  <p className="text-xs leading-5 text-slate-500">
                    Your match score is a recommendation based on the skills
                    and profile information currently available in the portal.
                    It does not guarantee selection.
                  </p>
                </div>
              </section>
            )}

            {/* SELECTION PROCESS */}
            {job.selectionProcess?.length > 0 && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card sm:p-7">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">
                  Recruitment journey
                </p>

                <h2 className="mt-1 font-display text-xl font-bold text-ink-900">
                  Selection process
                </h2>

                <div className="mt-6 space-y-4">
                  {job.selectionProcess.map((step, index) => (
                    <div
                      key={`${step}-${index}`}
                      className="flex items-center gap-4"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-700">
                        {index + 1}
                      </div>

                      <div className="flex-1 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                        <p className="text-sm font-semibold text-ink-800">
                          {step}
                        </p>
                      </div>

                      {index < job.selectionProcess.length - 1 && (
                        <span className="hidden text-slate-300 sm:block">
                          ↓
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ELIGIBILITY REQUIREMENTS */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">
                Requirements
              </p>

              <h2 className="mt-1 font-display text-xl font-bold text-ink-900">
                Eligibility criteria
              </h2>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">
                    Minimum CGPA
                  </p>
                  <p className="mt-1 text-lg font-bold text-ink-900">
                    {job.eligibility?.minCgpa ?? '—'}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">
                    Maximum backlogs
                  </p>
                  <p className="mt-1 text-lg font-bold text-ink-900">
                    {job.eligibility?.maxBacklogs ?? '—'}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">
                    Eligible departments
                  </p>
                  <p className="mt-1 text-sm font-semibold text-ink-900">
                    {job.eligibility?.departments?.join(', ') || 'All departments'}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">
                    Graduation years
                  </p>
                  <p className="mt-1 text-sm font-semibold text-ink-900">
                    {job.eligibility?.graduationYears?.join(', ') || 'All years'}
                  </p>
                </div>

              </div>
            </section>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="space-y-6">

            {/* APPLY CARD */}
            <section className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-card">

              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">
                  Your application
                </p>

                <h2 className="mt-1 font-display text-xl font-bold text-ink-900">
                  Take the next step
                </h2>
              </div>

              {/* ELIGIBILITY */}
              {job.eligible === true && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm text-emerald-700">
                      ✓
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-emerald-800">
                        You are eligible
                      </p>

                      <p className="mt-1 text-xs leading-5 text-emerald-700">
                        Your current academic profile meets the eligibility
                        criteria for this placement drive.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {job.eligible === false && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-100 text-sm text-rose-700">
                      !
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-rose-800">
                        You are not eligible
                      </p>

                      <p className="mt-1 text-xs leading-5 text-rose-700">
                        Review the requirements below before applying.
                      </p>
                    </div>
                  </div>

                  {job.eligibilityReasons?.length > 0 && (
                    <div className="mt-4 border-t border-rose-200 pt-3">
                      <p className="mb-2 text-xs font-semibold text-rose-800">
                        Eligibility issues
                      </p>

                      <ul className="space-y-1.5">
                        {job.eligibilityReasons.map((reason) => (
                          <li
                            key={reason}
                            className="flex gap-2 text-xs leading-5 text-rose-700"
                          >
                            <span>•</span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* DEADLINE */}
              <div
                className={`mt-4 rounded-xl p-4 ${deadlinePassed
                    ? 'bg-rose-50'
                    : daysLeft <= 3
                      ? 'bg-amber-50'
                      : 'bg-slate-50'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">
                      Application deadline
                    </p>

                    <p className="mt-1 text-sm font-semibold text-ink-900">
                      {deadline.toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>

                  <div className="text-right">
                    <p
                      className={`text-sm font-bold ${deadlinePassed
                          ? 'text-rose-600'
                          : daysLeft <= 3
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                        }`}
                    >
                      {deadlinePassed
                        ? 'Closed'
                        : `${daysLeft}d left`}
                    </p>
                  </div>
                </div>
              </div>

              {/* APPLY BUTTON */}
              <button
                onClick={apply}
                disabled={
                  applying ||
                  applied ||
                  deadlinePassed ||
                  job.eligible === false
                }
                className="mt-5 w-full rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:bg-slate-200 disabled:bg-none disabled:text-slate-500 disabled:shadow-none"
              >
                {applied
                  ? '✓ Already applied'
                  : deadlinePassed
                    ? 'Application closed'
                    : job.eligible === false
                      ? 'Not eligible to apply'
                      : applying
                        ? 'Submitting application…'
                        : 'Apply for this drive →'}
              </button>

              {!applied && !deadlinePassed && job.eligible !== false && (
                <p className="mt-3 text-center text-[11px] leading-5 text-slate-400">
                  Make sure your profile, resume and skills are up to date
                  before applying.
                </p>
              )}
            </section>

            {/* COMPANY */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
              <div className="h-24 bg-gradient-to-br from-brand-600 via-indigo-600 to-slate-900" />

              <div className="p-6">
                <div className="-mt-12 mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-white bg-white text-2xl font-bold text-brand-700 shadow-md">
                  {(job.company?.name || 'C').charAt(0).toUpperCase()}
                </div>

                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Hiring company
                </p>

                <h3 className="mt-1 font-display text-xl font-bold text-ink-900">
                  {job.company?.name || 'Company'}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Explore this opportunity and understand the role requirements
                  before submitting your application.
                </p>
              </div>
            </section>

            {/* DRIVE INFORMATION */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">
                Drive information
              </p>

              <div className="mt-4 space-y-4">

                <div className="flex items-start gap-3">
                  <span className="text-lg">📍</span>
                  <div>
                    <p className="text-xs text-slate-400">
                      Work location
                    </p>
                    <p className="text-sm font-semibold text-ink-800">
                      {job.location || 'Not specified'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-lg">📅</span>
                  <div>
                    <p className="text-xs text-slate-400">
                      Application closes
                    </p>
                    <p className="text-sm font-semibold text-ink-800">
                      {deadline.toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                {job.driveDate && (
                  <div className="flex items-start gap-3">
                    <span className="text-lg">🎯</span>
                    <div>
                      <p className="text-xs text-slate-400">
                        Placement drive
                      </p>
                      <p className="text-sm font-semibold text-ink-800">
                        {new Date(job.driveDate).toLocaleDateString(
                          'en-IN',
                          {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                          }
                        )}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <span className="text-lg">👥</span>
                  <div>
                    <p className="text-xs text-slate-400">
                      Available positions
                    </p>
                    <p className="text-sm font-semibold text-ink-800">
                      {job.openings ?? '—'} openings
                    </p>
                  </div>
                </div>

              </div>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
}