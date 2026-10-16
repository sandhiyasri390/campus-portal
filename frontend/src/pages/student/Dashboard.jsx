import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Briefcase,
  FileText,
  CalendarCheck,
  Trophy,
  Target,
  Bell,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Building2,
  UserCircle,
  Star,
  FileSearch,
  Compass,
  TrendingUp,
  ChevronRight,
  Video,
  MapPin,
  ArrowUpRight,
  CircleDot,
  Zap,
  Award,
  BarChart3,
  Search,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

import Layout from '../../components/Layout.jsx';
import ProgressBar from '../../components/ProgressBar.jsx';
import Loader from '../../components/Loader.jsx';
import api from '../../api/axios.js';

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [completion, setCompletion] = useState(null);
  const [readiness, setReadiness] = useState(null);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/students/profile'),
      api.get('/students/readiness'),
      api.get('/applications/my'),
      api.get('/interviews?upcoming=true'),
      api.get('/notifications?unreadOnly=true'),
      api.get('/students/skills/demand'),
    ])
      .then(([p, r, a, i, n, s]) => {
        setProfile(p.data.profile);
        setCompletion(p.data.completion);
        setReadiness(r.data.readiness);
        setApplications(a.data.applications || []);
        setInterviews(i.data.interviews || []);
        setNotifications(n.data.notifications || []);
        setSkills(s.data.topSkills || []);
      })
      .catch((error) => {
        console.error('Student dashboard loading error:', error);
      })
      .finally(() => setLoading(false));
  }, []);

  /*
   * IMPORTANT:
   * All calculations are done BEFORE the return.
   * This avoids the React Hooks order problem.
   */

  const total = applications.length;

  const shortlisted = applications.filter((a) =>
    [
      'shortlisted',
      'assessment',
      'technical_interview',
      'hr_interview',
    ].includes(a.status)
  ).length;

  const inInterviews = applications.filter((a) =>
    ['technical_interview', 'hr_interview'].includes(a.status)
  ).length;

  const offers = applications.filter(
    (a) => a.status === 'selected'
  ).length;

  const rejected = applications.filter(
    (a) => ['rejected', 'not_selected'].includes(a.status)
  ).length;

  const applied = applications.filter(
    (a) => a.status === 'applied'
  ).length;

  const firstName = profile?.fullName
    ? profile.fullName.split(' ')[0]
    : 'Student';

  const maxSkillCount =
    skills.length > 0
      ? Math.max(...skills.map((s) => s.count || 1))
      : 1;

  const readinessScore = readiness?.overall || 0;
  const completionScore = completion?.percentage || 0;

  const placementMessage =
    readinessScore >= 75
      ? 'You are showing strong placement readiness.'
      : readinessScore >= 50
        ? 'You are making good progress. Keep improving consistently.'
        : 'Build your profile, skills and interview preparation step by step.';

  const statusLabel = (status) => {
    const labels = {
      applied: 'Applied',
      shortlisted: 'Shortlisted',
      assessment: 'Assessment',
      technical_interview: 'Technical Interview',
      hr_interview: 'HR Interview',
      selected: 'Selected',
      rejected: 'Not Selected',
      not_selected: 'Not Selected',
    };

    return labels[status] || status?.replaceAll('_', ' ') || 'Application';
  };

  const statusStyle = (status) => {
    if (status === 'selected') {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }

    if (
      ['technical_interview', 'hr_interview'].includes(status)
    ) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }

    if (
      ['shortlisted', 'assessment'].includes(status)
    ) {
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    }

    if (
      ['rejected', 'not_selected'].includes(status)
    ) {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    }

    return 'bg-blue-50 text-blue-700 border-blue-200';
  };

  const applicationProgress = [
    {
      label: 'Applied',
      value: total,
      color: 'bg-blue-500',
    },
    {
      label: 'Shortlisted',
      value: shortlisted,
      color: 'bg-indigo-500',
    },
    {
      label: 'Interviews',
      value: inInterviews,
      color: 'bg-amber-500',
    },
    {
      label: 'Offers',
      value: offers,
      color: 'bg-emerald-500',
    },
  ];

  /*
   * IMPORTANT:
   * Do NOT return before all hooks.
   * There are no hooks below this point.
   */

  if (loading) {
    return (
      <Layout title="Student Dashboard">
        <Loader label="Loading your career portal…" />
      </Layout>
    );
  }

  return (
    <Layout title={`Student Portal · ${firstName}`}>
      <div className="space-y-6 pb-8">

        {/* ========================================================= */}
        {/* HERO */}
        {/* ========================================================= */}

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-900 shadow-xl">

          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />

          <div className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-12 lg:items-center">

            <div className="p-7 sm:p-9 lg:col-span-7 xl:col-span-8">

              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">

                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />

                Academic Year 2026–27

                <span className="text-indigo-200">•</span>

                Placement Drive Active

              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">

                Welcome back,

                <span className="block bg-gradient-to-r from-cyan-300 to-violet-300 bg-clip-text text-transparent">
                  {firstName} 👋
                </span>

              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-indigo-100 sm:text-base">
                Your personalized placement workspace. Track applications,
                discover eligible opportunities, prepare for interviews and
                build the skills companies are looking for.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">

                <Link
                  to="/student/jobs"
                  className="group inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-indigo-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-indigo-50"
                >
                  <Briefcase className="h-4 w-4" />

                  Browse Placement Drives

                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </Link>

                <Link
                  to="/student/profile"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
                >
                  <UserCircle className="h-4 w-4" />

                  Update Profile
                </Link>

              </div>

              <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-xs text-indigo-200">

                {profile?.department && (
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5" />
                    {profile.department}
                  </span>
                )}

                {profile?.batch && (
                  <span>
                    Batch {profile.batch}
                  </span>
                )}

                {profile?.cgpa && (
                  <span>
                    CGPA {profile.cgpa}
                  </span>
                )}

                {profile?.backlogs !== undefined && (
                  <span>
                    {profile.backlogs} Backlogs
                  </span>
                )}

              </div>

            </div>

            <div className="relative p-6 lg:col-span-5 xl:col-span-4">

              <div className="relative overflow-hidden rounded-2xl border border-white/20 shadow-2xl">

                <img
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=85"
                  alt="Students collaborating on campus"
                  className="h-64 w-full object-cover transition duration-700 hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/95 via-indigo-950/20 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-5">

                  <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
                    <Sparkles className="h-3 w-3 text-cyan-300" />
                    Smart Campus
                  </div>

                  <p className="text-lg font-bold text-white">
                    Your career journey starts here.
                  </p>

                  <p className="mt-1 text-xs text-indigo-200">
                    Discover • Prepare • Apply • Get Selected
                  </p>

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* ========================================================= */}
        {/* KPI CARDS */}
        {/* ========================================================= */}

        <section>

          <div className="mb-4 flex items-end justify-between">

            <div>

              <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
                Placement Overview
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                Your application journey
              </h2>

            </div>

            <Link
              to="/student/applications"
              className="hidden items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700 sm:flex"
            >
              View all applications
              <ArrowUpRight className="h-4 w-4" />
            </Link>

          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            {/* TOTAL APPLICATIONS */}

            <Link
              to="/student/applications"
              className="group relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-white to-blue-50/60 p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
            >

              <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-blue-100/60 blur-2xl" />

              <div className="relative flex items-start justify-between">

                <div>

                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Total Applications
                  </p>

                  <p className="mt-2 text-4xl font-black text-slate-900">
                    {total}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Applications submitted
                  </p>

                </div>

                <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                  <FileText className="h-5 w-5" />
                </div>

              </div>

              <div className="relative mt-5 flex items-center justify-between border-t border-blue-100 pt-3">

                <span className="text-xs font-semibold text-blue-600">
                  View applications
                </span>

                <ArrowRight className="h-4 w-4 text-blue-500 transition group-hover:translate-x-1" />

              </div>

            </Link>


            {/* SHORTLISTED */}

            <Link
              to="/student/applications"
              className="group relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-white to-indigo-50/60 p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-lg"
            >

              <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-indigo-100/60 blur-2xl" />

              <div className="relative flex items-start justify-between">

                <div>

                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Shortlisted
                  </p>

                  <p className="mt-2 text-4xl font-black text-indigo-600">
                    {shortlisted}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Passed initial screening
                  </p>

                </div>

                <div className="rounded-xl bg-indigo-100 p-3 text-indigo-600">
                  <Star className="h-5 w-5" />
                </div>

              </div>

              <div className="relative mt-5 flex items-center justify-between border-t border-indigo-100 pt-3">

                <span className="text-xs font-semibold text-indigo-600">
                  Track status
                </span>

                <ArrowRight className="h-4 w-4 text-indigo-500 transition group-hover:translate-x-1" />

              </div>

            </Link>


            {/* INTERVIEWS */}

            <Link
              to="/student/interviews"
              className="group relative overflow-hidden rounded-2xl border border-amber-100 bg-gradient-to-br from-white to-amber-50/60 p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-amber-300 hover:shadow-lg"
            >

              <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-amber-100/60 blur-2xl" />

              <div className="relative flex items-start justify-between">

                <div>

                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Active Interviews
                  </p>

                  <p className="mt-2 text-4xl font-black text-amber-600">
                    {inInterviews}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Technical & HR rounds
                  </p>

                </div>

                <div className="rounded-xl bg-amber-100 p-3 text-amber-600">
                  <CalendarCheck className="h-5 w-5" />
                </div>

              </div>

              <div className="relative mt-5 flex items-center justify-between border-t border-amber-100 pt-3">

                <span className="text-xs font-semibold text-amber-600">
                  View interviews
                </span>

                <ArrowRight className="h-4 w-4 text-amber-500 transition group-hover:translate-x-1" />

              </div>

            </Link>


            {/* OFFERS */}

            <Link
              to="/student/applications"
              className="group relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/60 p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg"
            >

              <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-emerald-100/60 blur-2xl" />

              <div className="relative flex items-start justify-between">

                <div>

                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Offers Extended
                  </p>

                  <p className="mt-2 text-4xl font-black text-emerald-600">
                    {offers}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Final selections
                  </p>

                </div>

                <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
                  <Trophy className="h-5 w-5" />
                </div>

              </div>

              <div className="relative mt-5 flex items-center justify-between border-t border-emerald-100 pt-3">

                <span className="text-xs font-semibold text-emerald-600">
                  View results
                </span>

                <ArrowRight className="h-4 w-4 text-emerald-500 transition group-hover:translate-x-1" />

              </div>

            </Link>

          </div>

        </section>


        {/* ========================================================= */}
        {/* APPLICATION PIPELINE */}
        {/* ========================================================= */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-indigo-50/40 p-6">

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <div className="flex items-center gap-2">

                  <div className="rounded-lg bg-indigo-100 p-2 text-indigo-600">
                    <BarChart3 className="h-4 w-4" />
                  </div>

                  <h2 className="font-bold text-slate-900">
                    Application Pipeline
                  </h2>

                </div>

                <p className="mt-1 text-xs text-slate-500">
                  See how your applications are progressing through the
                  recruitment process.
                </p>

              </div>

              <Link
                to="/student/applications"
                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700"
              >
                Open applications
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>

            </div>

          </div>

          <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">

            {applicationProgress.map((item) => {

              const percentage =
                total > 0
                  ? Math.round((item.value / total) * 100)
                  : 0;

              return (
                <div
                  key={item.label}
                  className="rounded-xl border border-slate-100 bg-slate-50/70 p-4"
                >

                  <div className="flex items-center justify-between">

                    <span className="text-xs font-semibold text-slate-600">
                      {item.label}
                    </span>

                    <span className="text-lg font-black text-slate-900">
                      {item.value}
                    </span>

                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">

                    <div
                      className={`h-full rounded-full ${item.color} transition-all duration-700`}
                      style={{ width: `${percentage}%` }}
                    />

                  </div>

                  <p className="mt-2 text-[11px] text-slate-400">
                    {percentage}% of applications
                  </p>

                </div>
              );
            })}

          </div>

        </section>


        {/* ========================================================= */}
        {/* PROFILE + READINESS + SKILLS */}
        {/* ========================================================= */}

        <div className="grid gap-6 xl:grid-cols-3">

          {/* PROFILE */}

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-400" />

            <div className="p-6">

              <div className="flex items-start justify-between">

                <div className="flex items-center gap-3">

                  <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                    <UserCircle className="h-5 w-5" />
                  </div>

                  <div>

                    <h2 className="font-bold text-slate-900">
                      Profile Strength
                    </h2>

                    <p className="text-xs text-slate-500">
                      Complete your profile to improve eligibility.
                    </p>

                  </div>

                </div>

                <span className="text-2xl font-black text-blue-600">
                  {completionScore}%
                </span>

              </div>

              <div className="mt-5">

                <ProgressBar
                  value={completionScore}
                  colorClass="bg-gradient-to-r from-blue-500 to-cyan-400"
                  trackClass="bg-slate-100"
                  height="h-3"
                />

              </div>

              {completion?.missing?.length > 0 ? (

                <div className="mt-5">

                  <p className="text-xs font-bold text-slate-700">
                    Complete these fields
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">

                    {completion.missing.slice(0, 6).map((field) => (

                      <span
                        key={field}
                        className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold capitalize text-amber-700"
                      >
                        {field.replace(/([A-Z])/g, ' $1')}
                      </span>

                    ))}

                  </div>

                </div>

              ) : (

                <div className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-700">

                  <CheckCircle2 className="h-4 w-4" />

                  Your profile is complete.

                </div>

              )}

              <Link
                to="/student/profile"
                className="mt-6 flex items-center justify-between rounded-xl bg-blue-600 px-4 py-3 text-xs font-bold text-white transition hover:bg-blue-700"
              >
                Complete full profile
                <ArrowRight className="h-4 w-4" />
              </Link>

            </div>

          </section>


          {/* READINESS */}

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="h-2 bg-gradient-to-r from-amber-500 to-orange-400" />

            <div className="p-6">

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                    <Target className="h-5 w-5" />
                  </div>

                  <div>

                    <h2 className="font-bold text-slate-900">
                      Placement Readiness
                    </h2>

                    <p className="text-xs text-slate-500">
                      Your current preparation level.
                    </p>

                  </div>

                </div>

                <Link
                  to="/student/readiness"
                  className="text-xs font-bold text-amber-600 hover:text-amber-700"
                >
                  Details
                </Link>

              </div>

              <div className="mt-6 flex items-center gap-4">

                <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg">

                  <span className="text-3xl font-black">
                    {readinessScore}
                  </span>

                </div>

                <div>

                  <p className="font-bold text-slate-900">

                    {readinessScore >= 75
                      ? 'High Placement Fit'
                      : readinessScore >= 50
                        ? 'Moderate Preparation'
                        : 'Early Stage Preparation'}

                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {placementMessage}
                  </p>

                </div>

              </div>

              <div className="mt-6">

                <ProgressBar
                  value={readinessScore}
                  colorClass="bg-gradient-to-r from-amber-500 to-orange-500"
                  trackClass="bg-slate-100"
                  height="h-3"
                />

              </div>

              <div className="mt-5 grid grid-cols-3 gap-2">

                <div className="rounded-xl bg-slate-50 p-3 text-center">

                  <p className="text-[10px] font-bold uppercase text-slate-400">
                    Academic
                  </p>

                  <p className="mt-1 font-bold text-slate-800">
                    {profile?.cgpa || '—'}
                  </p>

                </div>

                <div className="rounded-xl bg-slate-50 p-3 text-center">

                  <p className="text-[10px] font-bold uppercase text-slate-400">
                    Profile
                  </p>

                  <p className="mt-1 font-bold text-slate-800">
                    {completionScore}%
                  </p>

                </div>

                <div className="rounded-xl bg-slate-50 p-3 text-center">

                  <p className="text-[10px] font-bold uppercase text-slate-400">
                    Applied
                  </p>

                  <p className="mt-1 font-bold text-slate-800">
                    {total}
                  </p>

                </div>

              </div>

            </div>

          </section>


          {/* SKILLS */}

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="h-2 bg-gradient-to-r from-teal-500 to-cyan-400" />

            <div className="p-6">

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <div className="rounded-xl bg-teal-50 p-3 text-teal-600">
                    <TrendingUp className="h-5 w-5" />
                  </div>

                  <div>

                    <h2 className="font-bold text-slate-900">
                      In-Demand Skills
                    </h2>

                    <p className="text-xs text-slate-500">
                      Skills appearing in campus drives.
                    </p>

                  </div>

                </div>

                <Link
                  to="/student/skills"
                  className="text-xs font-bold text-teal-600"
                >
                  Explore
                </Link>

              </div>

              <div className="mt-5 space-y-4">

                {skills.slice(0, 5).map((skill) => {

                  const percent = Math.min(
                    100,
                    Math.round(
                      ((skill.count || 0) / maxSkillCount) * 100
                    )
                  );

                  return (
                    <div key={skill.skill}>

                      <div className="mb-1.5 flex items-center justify-between">

                        <span className="text-xs font-bold text-slate-700">
                          {skill.skill}
                        </span>

                        <span className="text-[11px] font-semibold text-slate-400">
                          {skill.count} drives
                        </span>

                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                        <div
                          className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-400 transition-all duration-700"
                          style={{ width: `${percent}%` }}
                        />

                      </div>

                    </div>
                  );
                })}

                {skills.length === 0 && (

                  <div className="rounded-xl bg-slate-50 p-6 text-center">

                    <TrendingUp className="mx-auto h-7 w-7 text-slate-300" />

                    <p className="mt-2 text-xs text-slate-500">
                      No skill demand data available yet.
                    </p>

                  </div>

                )}

              </div>

              <Link
                to="/student/skills"
                className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-xs font-bold text-teal-700 transition hover:bg-teal-100"
              >
                <FileSearch className="h-4 w-4" />
                Analyze my resume & skills
              </Link>

            </div>

          </section>

        </div>


        {/* ========================================================= */}
        {/* RECENT APPLICATIONS */}
        {/* ========================================================= */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col gap-3 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <div className="flex items-center gap-2">

                <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                  <Briefcase className="h-4 w-4" />
                </div>

                <h2 className="font-bold text-slate-900">
                  Recent Applications
                </h2>

              </div>

              <p className="mt-1 text-xs text-slate-500">
                Keep track of your latest placement applications.
              </p>

            </div>

            <Link
              to="/student/applications"
              className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600"
            >
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

          </div>

          {applications.length === 0 ? (

            <div className="p-10 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
                <Search className="h-6 w-6" />
              </div>

              <h3 className="mt-4 font-bold text-slate-900">
                No applications yet
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Browse available placement drives and find opportunities
                matching your profile.
              </p>

              <Link
                to="/student/jobs"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-700"
              >
                Browse drives
                <ArrowRight className="h-4 w-4" />
              </Link>

            </div>

          ) : (

            <div className="divide-y divide-slate-100">

              {applications.slice(0, 5).map((application) => {

                const jobTitle =
                  application.job?.title ||
                  application.jobTitle ||
                  application.title ||
                  'Placement Application';

                const companyName =
                  application.company?.name ||
                  application.companyName ||
                  'Company';

                const matchScore =
                  application.matchScore ??
                  application.match ??
                  null;

                return (
                  <Link
                    key={application._id}
                    to="/student/applications"
                    className="group flex flex-col gap-4 p-5 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                  >

                    <div className="flex min-w-0 items-center gap-4">

                      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-sm">
                        <Building2 className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">

                        <p className="truncate text-sm font-bold text-slate-900 group-hover:text-indigo-600">
                          {jobTitle}
                        </p>

                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">

                          <span className="font-medium">
                            {companyName}
                          </span>

                          {matchScore !== null && (
                            <>
                              <span>•</span>

                              <span className="font-semibold text-indigo-600">
                                {matchScore}% match
                              </span>
                            </>
                          )}

                        </div>

                      </div>

                    </div>

                    <div className="flex items-center gap-3">

                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-[11px] font-bold capitalize ${statusStyle(
                          application.status
                        )}`}
                      >

                        {application.status === 'selected' ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : application.status === 'rejected' ||
                          application.status === 'not_selected' ? (
                          <AlertCircle className="h-3 w-3" />
                        ) : (
                          <CircleDot className="h-3 w-3" />
                        )}

                        {statusLabel(application.status)}

                      </span>

                      <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-indigo-500" />

                    </div>

                  </Link>
                );
              })}

            </div>

          )}

        </section>


        {/* ========================================================= */}
        {/* INTERVIEWS + NOTIFICATIONS */}
        {/* ========================================================= */}

        <div className="grid gap-6 lg:grid-cols-2">

          {/* INTERVIEWS */}

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 bg-gradient-to-r from-amber-50 to-orange-50 p-6">

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <div className="rounded-xl bg-white p-3 text-amber-600 shadow-sm">
                    <CalendarCheck className="h-5 w-5" />
                  </div>

                  <div>

                    <h2 className="font-bold text-slate-900">
                      Upcoming Interviews
                    </h2>

                    <p className="text-xs text-slate-500">
                      Your next recruitment activities.
                    </p>

                  </div>

                </div>

                <Link
                  to="/student/interviews"
                  className="text-xs font-bold text-amber-600"
                >
                  View all
                </Link>

              </div>

            </div>

            <div className="space-y-3 p-6">

              {interviews.length === 0 ? (

                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-7 text-center">

                  <CalendarCheck className="mx-auto h-8 w-8 text-slate-300" />

                  <p className="mt-3 text-sm font-bold text-slate-700">
                    No interviews scheduled
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    When recruiters schedule your interview, the details will
                    appear here.
                  </p>

                </div>

              ) : (

                interviews.slice(0, 4).map((interview) => (

                  <Link
                    key={interview._id}
                    to="/student/interviews"
                    className="group flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/70 p-4 transition hover:border-amber-200 hover:bg-amber-50/40"
                  >

                    <div className="flex min-w-0 items-center gap-3">

                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm">

                        {interview.meetingLink ? (
                          <Video className="h-4 w-4" />
                        ) : (
                          <MapPin className="h-4 w-4" />
                        )}

                      </div>

                      <div className="min-w-0">

                        <p className="truncate text-sm font-bold text-slate-900">
                          {interview.job?.title ||
                            'Placement Interview'}
                        </p>

                        <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-500">

                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />

                            {new Date(
                              interview.date
                            ).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>

                          <span>•</span>

                          <span>
                            {interview.time}
                          </span>

                          {interview.interviewer && (
                            <>
                              <span>•</span>

                              <span>
                                {interview.interviewer}
                              </span>
                            </>
                          )}

                        </div>

                      </div>

                    </div>

                    <ChevronRight className="h-4 w-4 flex-shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-amber-500" />

                  </Link>

                ))

              )}

            </div>

          </section>


          {/* NOTIFICATIONS */}

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-violet-50 p-6">

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <div className="rounded-xl bg-white p-3 text-indigo-600 shadow-sm">
                    <Bell className="h-5 w-5" />
                  </div>

                  <div>

                    <h2 className="font-bold text-slate-900">
                      Recent Notifications
                    </h2>

                    <p className="text-xs text-slate-500">
                      Important placement updates and alerts.
                    </p>

                  </div>

                </div>

                <Link
                  to="/student/notifications"
                  className="text-xs font-bold text-indigo-600"
                >
                  View all
                </Link>

              </div>

            </div>

            <div className="space-y-3 p-6">

              {notifications.length === 0 ? (

                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-7 text-center">

                  <Bell className="mx-auto h-8 w-8 text-slate-300" />

                  <p className="mt-3 text-sm font-bold text-slate-700">
                    You're all caught up
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    No new unread notifications right now.
                  </p>

                </div>

              ) : (

                notifications.slice(0, 4).map((notification) => (

                  <Link
                    key={notification._id}
                    to="/student/notifications"
                    className="group block rounded-xl border border-slate-100 bg-slate-50/70 p-4 transition hover:border-indigo-200 hover:bg-indigo-50/40"
                  >

                    <div className="flex items-start justify-between gap-3">

                      <div className="flex min-w-0 gap-3">

                        <div className="mt-0.5 rounded-lg bg-white p-2 text-indigo-500 shadow-sm">
                          <Bell className="h-4 w-4" />
                        </div>

                        <div className="min-w-0">

                          <p className="truncate text-sm font-bold text-slate-900">
                            {notification.title}
                          </p>

                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                            {notification.message}
                          </p>

                        </div>

                      </div>

                      <span className="flex-shrink-0 text-[10px] font-medium text-slate-400">

                        {new Date(
                          notification.createdAt
                        ).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}

                      </span>

                    </div>

                  </Link>

                ))

              )}

            </div>

          </section>

        </div>


        {/* ========================================================= */}
        {/* CAREER ACTION CENTER */}
        {/* ========================================================= */}

        <section>

          <div className="mb-4">

            <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
              Career Action Center
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              Keep moving forward
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Quick access to the tools that can improve your placement
              preparation.
            </p>

          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            {/* JOBS */}

            <Link
              to="/student/jobs"
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-5 text-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
            >

              <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10" />

              <div className="relative">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                  <Briefcase className="h-5 w-5" />
                </div>

                <h3 className="mt-5 font-bold">
                  Find Placement Drives
                </h3>

                <p className="mt-1 text-xs leading-5 text-emerald-50">
                  Discover eligible and non-eligible opportunities with
                  match scores.
                </p>

                <div className="mt-5 flex items-center gap-1 text-xs font-bold">
                  Explore drives
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </div>

              </div>

            </Link>


            {/* RESUME */}

            <Link
              to="/student/skills"
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 p-5 text-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
            >

              <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10" />

              <div className="relative">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                  <Zap className="h-5 w-5" />
                </div>

                <h3 className="mt-5 font-bold">
                  Analyze Resume
                </h3>

                <p className="mt-1 text-xs leading-5 text-cyan-50">
                  Extract skills and identify what you should improve for
                  upcoming drives.
                </p>

                <div className="mt-5 flex items-center gap-1 text-xs font-bold">
                  Analyze skills
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </div>

              </div>

            </Link>


            {/* READINESS */}

            <Link
              to="/student/readiness"
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 p-5 text-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
            >

              <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10" />

              <div className="relative">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                  <Target className="h-5 w-5" />
                </div>

                <h3 className="mt-5 font-bold">
                  Improve Readiness
                </h3>

                <p className="mt-1 text-xs leading-5 text-orange-50">
                  Understand your preparation score and the areas that need
                  attention.
                </p>

                <div className="mt-5 flex items-center gap-1 text-xs font-bold">
                  View readiness
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </div>

              </div>

            </Link>


            {/* ROADMAP */}

            <Link
              to="/student/roadmap"
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 p-5 text-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
            >

              <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10" />

              <div className="relative">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                  <Compass className="h-5 w-5" />
                </div>

                <h3 className="mt-5 font-bold">
                  Follow Your Roadmap
                </h3>

                <p className="mt-1 text-xs leading-5 text-violet-100">
                  Follow your preparation roadmap and build interview-ready
                  skills week by week.
                </p>

                <div className="mt-5 flex items-center gap-1 text-xs font-bold">
                  Open roadmap
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </div>

              </div>

            </Link>

          </div>

        </section>


        {/* ========================================================= */}
        {/* FOOTER MOTIVATION */}
        {/* ========================================================= */}

        <section className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-cyan-50 p-6">

          <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-indigo-100/50 blur-2xl" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-start gap-4">

              <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 p-3 text-white shadow-lg">
                <Award className="h-6 w-6" />
              </div>

              <div>

                <h3 className="font-bold text-slate-900">
                  Keep building your placement profile.
                </h3>

                <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
                  Every completed profile field, improved skill, application
                  and interview brings you one step closer to your placement
                  goal.
                </p>

              </div>

            </div>

            <Link
              to="/student/profile"
              className="inline-flex flex-shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700"
            >
              Improve my profile
              <ArrowRight className="h-4 w-4" />
            </Link>

          </div>

        </section>

      </div>
    </Layout>
  );
}