import React, { useEffect, useMemo, useState } from 'react';
import Layout from '../../components/Layout.jsx';
import Loader from '../../components/Loader.jsx';
import api from '../../api/axios.js';

const LABELS = {
  profile: 'Profile',
  resume: 'Resume',
  technicalSkills: 'Technical Skills',
  projects: 'Projects',
  interviewPreparation: 'Interview Preparation',
};

const ICONS = {
  profile: '👤',
  resume: '📄',
  technicalSkills: '⚡',
  projects: '◈',
  interviewPreparation: '🎤',
};

const DESCRIPTIONS = {
  profile: 'Personal, academic and career information',
  resume: 'Resume quality and placement presentation',
  technicalSkills: 'Technical capabilities and skill coverage',
  projects: 'Practical development experience',
  interviewPreparation: 'Preparation for placement interviews',
};

function ScoreRing({ score }) {
  const safeScore = Math.max(0, Math.min(100, Number(score) || 0));
  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safeScore / 100) * circumference;

  return (
    <div className="relative h-48 w-48 shrink-0">
      <svg
        viewBox="0 0 180 180"
        className="-rotate-90 h-48 w-48"
      >
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="12"
          className="text-white/10"
        />

        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-brand-400 transition-all duration-1000"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-black text-white">
          {safeScore}
        </span>

        <span className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
          / 100
        </span>
      </div>
    </div>
  );
}

function Progress({ value }) {
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));

  return (
    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
      <div
        className="h-full rounded-full bg-gradient-to-r from-brand-500 to-indigo-500 transition-all duration-700"
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}

function getReadinessLevel(score) {
  if (score >= 85) {
    return {
      label: 'Placement Ready',
      description: 'Your profile is strongly prepared for placement activity.',
      color: 'emerald',
    };
  }

  if (score >= 70) {
    return {
      label: 'Nearly Ready',
      description: 'You have a strong base. Focus on your remaining gaps.',
      color: 'blue',
    };
  }

  if (score >= 50) {
    return {
      label: 'Building Momentum',
      description: 'Your foundation is developing. Consistent improvement will help.',
      color: 'amber',
    };
  }

  return {
    label: 'Getting Started',
    description: 'Focus on building the core placement fundamentals first.',
    color: 'rose',
  };
}

function getScoreLabel(score) {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Strong';
  if (score >= 50) return 'Developing';
  return 'Needs Focus';
}

export default function Readiness() {
  const [readiness, setReadiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/students/readiness')
      .then((res) => setReadiness(res.data.readiness))
      .finally(() => setLoading(false));
  }, []);

  const breakdown = readiness?.breakdown || {};

  const dimensions = useMemo(() => {
    return Object.entries(breakdown).map(([key, value]) => ({
      key,
      value: Number(value) || 0,
      label: LABELS[key] || key,
      icon: ICONS[key] || '✦',
      description:
        DESCRIPTIONS[key] || 'Placement readiness dimension',
    }));
  }, [breakdown]);

  const score = Number(readiness?.overall) || 0;
  const level = getReadinessLevel(score);

  const strengths = dimensions
    .filter((item) => item.value >= 75)
    .sort((a, b) => b.value - a.value);

  const focusAreas = dimensions
    .filter((item) => item.value < 70)
    .sort((a, b) => a.value - b.value);

  const averageDimension =
    dimensions.length > 0
      ? Math.round(
        dimensions.reduce((sum, item) => sum + item.value, 0) /
        dimensions.length
      )
      : 0;

  if (loading || !readiness) {
    return (
      <Layout title="Placement Readiness">
        <Loader />
      </Layout>
    );
  }

  return (
    <Layout title="Placement Readiness">
      <div className="space-y-6">

        {/* HERO */}
        <section className="relative overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-xl md:p-8">

          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl" />
          <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">

            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-400/20 bg-brand-500/10 px-3 py-1.5 text-xs font-bold text-brand-300">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                Placement Readiness
              </div>

              <h1 className="max-w-3xl font-display text-3xl font-black tracking-tight md:text-4xl">
                Know exactly how prepared
                <span className="text-brand-400">
                  {' '}you are.
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
                Your readiness score combines your profile, resume,
                technical skills, projects and interview preparation into
                one placement-focused view.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">

                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Readiness level
                  </p>

                  <p className="mt-1 text-sm font-black text-white">
                    {level.label}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Dimensions
                  </p>

                  <p className="mt-1 text-sm font-black text-white">
                    {dimensions.length}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Average
                  </p>

                  <p className="mt-1 text-sm font-black text-white">
                    {averageDimension}%
                  </p>
                </div>

              </div>
            </div>

            <div className="flex flex-col items-center">
              <ScoreRing score={score} />

              <div className="mt-4 text-center">
                <p className="text-lg font-black text-white">
                  {level.label}
                </p>

                <p className="mt-1 max-w-[260px] text-xs leading-5 text-slate-400">
                  {level.description}
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* QUICK STATS */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Overall
              </span>
              <span className="rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-black text-brand-700">
                {getScoreLabel(score)}
              </span>
            </div>

            <p className="mt-3 text-3xl font-black text-ink-900">
              {score}%
            </p>

            <div className="mt-3">
              <Progress value={score} />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Strong Areas
              </span>

              <span className="text-lg">💪</span>
            </div>

            <p className="mt-3 text-3xl font-black text-emerald-600">
              {strengths.length}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Dimensions above 75%
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Focus Areas
              </span>

              <span className="text-lg">🎯</span>
            </div>

            <p className="mt-3 text-3xl font-black text-amber-600">
              {focusAreas.length}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Dimensions needing attention
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Readiness Gap
              </span>

              <span className="text-lg">📈</span>
            </div>

            <p className="mt-3 text-3xl font-black text-indigo-600">
              {Math.max(0, 100 - score)}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Points remaining to reach 100
            </p>
          </div>

        </section>

        {/* BREAKDOWN */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card md:p-7">

          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">
                Readiness breakdown
              </p>

              <h2 className="mt-1 font-display text-xl font-black text-ink-900">
                Your placement preparation map
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Each dimension highlights a different part of your
                placement preparation.
              </p>
            </div>

            <span className="text-xs font-semibold text-slate-400">
              Updated from your current profile
            </span>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-2">

            {dimensions.map((item) => (
              <div
                key={item.key}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-5"
              >

                <div className="flex items-start gap-4">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
                    {item.icon}
                  </div>

                  <div className="min-w-0 flex-1">

                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-black text-ink-900">
                          {item.label}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {item.description}
                        </p>
                      </div>

                      <span className="text-lg font-black text-ink-900">
                        {item.value}%
                      </span>
                    </div>

                    <div className="mt-4">
                      <Progress value={item.value} />
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider ${item.value >= 75
                            ? 'text-emerald-600'
                            : item.value >= 50
                              ? 'text-amber-600'
                              : 'text-rose-600'
                          }`}
                      >
                        {getScoreLabel(item.value)}
                      </span>

                      <span className="text-[10px] font-semibold text-slate-400">
                        {item.value >= 75
                          ? 'Strong'
                          : item.value >= 50
                            ? 'Developing'
                            : 'Priority'}
                      </span>
                    </div>

                  </div>
                </div>
              </div>
            ))}

          </div>
        </section>

        {/* STRENGTHS + FOCUS */}
        <section className="grid gap-6 lg:grid-cols-2">

          {/* STRENGTHS */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card md:p-7">

            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">
                  Your strengths
                </p>

                <h2 className="mt-1 font-display text-xl font-black text-ink-900">
                  What is already working
                </h2>
              </div>

              <div className="rounded-xl bg-emerald-50 px-3 py-2 text-lg">
                💪
              </div>
            </div>

            <div className="mt-6 space-y-3">

              {strengths.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                  <p className="text-sm font-bold text-slate-700">
                    Keep building your foundation
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Once a readiness dimension crosses 75%, it will appear
                    here as a strength.
                  </p>
                </div>
              ) : (
                strengths.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg shadow-sm">
                      {item.icon}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-black text-ink-900">
                        {item.label}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {item.description}
                      </p>
                    </div>

                    <span className="text-lg font-black text-emerald-600">
                      {item.value}%
                    </span>
                  </div>
                ))
              )}

            </div>
          </div>

          {/* FOCUS */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card md:p-7">

            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-600">
                  Priority areas
                </p>

                <h2 className="mt-1 font-display text-xl font-black text-ink-900">
                  Where to improve next
                </h2>
              </div>

              <div className="rounded-xl bg-amber-50 px-3 py-2 text-lg">
                🎯
              </div>
            </div>

            <div className="mt-6 space-y-3">

              {focusAreas.length === 0 ? (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6 text-center">
                  <p className="text-sm font-bold text-emerald-800">
                    No major weak areas
                  </p>

                  <p className="mt-1 text-xs text-emerald-600">
                    Continue maintaining your current preparation level.
                  </p>
                </div>
              ) : (
                focusAreas.map((item, index) => (
                  <div
                    key={item.key}
                    className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-xs font-black text-slate-400 shadow-sm">
                      {String(index + 1).padStart(2, '0')}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-black text-ink-900">
                          {item.label}
                        </p>

                        <span className="text-sm font-black text-amber-600">
                          {item.value}%
                        </span>
                      </div>

                      <div className="mt-2">
                        <Progress value={item.value} />
                      </div>

                      <p className="mt-2 text-xs text-slate-400">
                        Focus on this area to improve overall readiness.
                      </p>
                    </div>
                  </div>
                ))
              )}

            </div>
          </div>

        </section>

        {/* RECOMMENDATIONS */}
        {readiness.recommendations?.length > 0 && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card md:p-7">

            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
                  Action plan
                </p>

                <h2 className="mt-1 font-display text-xl font-black text-ink-900">
                  Recommended next moves
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Use these recommendations to close your current readiness
                  gaps.
                </p>
              </div>

              <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700">
                {readiness.recommendations.length} actions
              </span>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">

              {readiness.recommendations.map((recommendation, index) => (
                <div
                  key={recommendation}
                  className="group rounded-2xl border border-slate-100 bg-slate-50 p-5 transition hover:border-indigo-200 hover:bg-indigo-50/40"
                >

                  <div className="flex gap-4">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-xs font-black text-white">
                      {String(index + 1).padStart(2, '0')}
                    </div>

                    <div>
                      <p className="text-sm font-black text-ink-900">
                        Action {index + 1}
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {recommendation}
                      </p>
                    </div>

                  </div>

                </div>
              ))}

            </div>
          </section>
        )}

        {/* PLACEMENT CHECKLIST */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card md:p-7">

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">
              Placement checklist
            </p>

            <h2 className="mt-1 font-display text-xl font-black text-ink-900">
              Are you placement-ready?
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Use your readiness dimensions as a practical checklist before
              major placement drives.
            </p>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2">

            {dimensions.map((item) => {
              const complete = item.value >= 75;

              return (
                <div
                  key={item.key}
                  className={`flex items-center gap-4 rounded-2xl border p-4 ${complete
                      ? 'border-emerald-100 bg-emerald-50/60'
                      : 'border-slate-100 bg-slate-50'
                    }`}
                >

                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-black ${complete
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white text-slate-400'
                      }`}
                  >
                    {complete ? '✓' : '○'}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-ink-900">
                      {item.label}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {complete
                        ? 'Ready'
                        : 'Continue improving this area'}
                    </p>
                  </div>

                  <span
                    className={`text-sm font-black ${complete
                        ? 'text-emerald-600'
                        : 'text-slate-500'
                      }`}
                  >
                    {item.value}%
                  </span>

                </div>
              );
            })}

          </div>
        </section>

        {/* FINAL INSIGHT */}
        <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-700 p-6 text-white shadow-xl md:p-8">

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-200">
                Keep progressing
              </p>

              <h2 className="mt-1 font-display text-2xl font-black">
                Small improvements compound into placement readiness.
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-indigo-100">
                Focus on the lowest-scoring readiness area first, then
                gradually strengthen your profile, resume, skills, projects
                and interview preparation.
              </p>
            </div>

            <div className="shrink-0 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
              <p className="text-xs font-semibold text-indigo-100">
                Current readiness
              </p>

              <p className="mt-1 text-4xl font-black">
                {score}%
              </p>

              <p className="mt-1 text-xs text-indigo-200">
                {level.label}
              </p>
            </div>

          </div>

        </section>

        {/* DISCLAIMER */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-center text-xs leading-5 text-slate-500">
            Your readiness score is a preparation indicator based on the
            information available in your placement profile. It is not a
            prediction of selection, hiring outcome, or recruiter decision.
          </p>
        </div>

      </div>
    </Layout>
  );
}