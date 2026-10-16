import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Briefcase,
  Building2,
  MapPin,
  CalendarDays,
  ArrowRight,
  CheckCircle2,
  XCircle,
  SlidersHorizontal,
  Sparkles,
  Users,
  IndianRupee,
  Clock3,
  ChevronDown,
  RotateCcw,
  Check,
  AlertTriangle,
} from 'lucide-react';

import Layout from '../../components/Layout.jsx';
import Loader from '../../components/Loader.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import api from '../../api/axios.js';
import { useToast } from '../../context/ToastContext.jsx';

export default function Jobs() {
  const { push } = useToast();
  const [jobs, setJobs] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  const [applyingJobId, setApplyingJobId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [onlyEligible, setOnlyEligible] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [sortBy, setSortBy] = useState('match');

  useEffect(() => {
    Promise.all([
      api.get('/jobs'),
      api.get('/applications/my').catch(() => ({ data: { applications: [] } })),
    ])
      .then(([jobsRes, appsRes]) => {
        setJobs(jobsRes.data.jobs || []);
        const appliedSet = new Set(
          (appsRes.data.applications || [])
            .map((app) => (typeof app.job === 'object' ? app.job?._id : app.job))
            .filter(Boolean)
        );
        setAppliedJobIds(appliedSet);
      })
      .catch((error) => {
        console.error('Jobs loading error:', error);
        setJobs([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const getDriveStatus = (job) => {
    if (!job?.applicationDeadline) return 'active';
    const now = new Date();
    const deadline = new Date(job.applicationDeadline);
    if (now > deadline) return 'expired';

    const driveDate = job.driveDate ? new Date(job.driveDate) : null;
    if (driveDate && driveDate > now && deadline - now > 7 * 86400000) {
      return 'upcoming';
    }
    return 'active';
  };

  const getDaysLeft = (deadline) => {
    if (!deadline) return null;
    const date = new Date(deadline);
    if (Number.isNaN(date.getTime())) return null;
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const formatDeadline = (deadline) => {
    if (!deadline) return 'Deadline not specified';
    const date = new Date(deadline);
    if (Number.isNaN(date.getTime())) return 'Deadline not specified';
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleQuickApply = async (e, job) => {
    e.preventDefault();
    e.stopPropagation();

    if (appliedJobIds.has(job._id)) {
      push('You have already applied to this drive.', 'info');
      return;
    }

    if (!job.eligible) {
      const reason = job.eligibilityReasons?.[0] || 'You do not meet the eligibility requirements.';
      push(`Cannot apply: ${reason}`, 'error');
      return;
    }

    const driveStatus = getDriveStatus(job);
    if (driveStatus === 'expired') {
      push('This placement drive has expired. Applications are closed.', 'error');
      return;
    }

    setApplyingJobId(job._id);
    try {
      await api.post('/applications', { jobId: job._id });
      push(`Successfully applied to ${job.title} at ${job.company?.name || 'Company'}!`, 'success');
      setAppliedJobIds((prev) => new Set([...prev, job._id]));
    } catch (err) {
      push(err.response?.data?.message || 'Could not submit application.', 'error');
    } finally {
      setApplyingJobId(null);
    }
  };

  const locations = useMemo(() => {
    const values = jobs.map((job) => job.location).filter(Boolean);
    return [...new Set(values)];
  }, [jobs]);

  const filtered = useMemo(() => {
    let list = [...jobs];
    const query = search.trim().toLowerCase();

    if (query) {
      list = list.filter((job) => {
        const title = job.title?.toLowerCase() || '';
        const company = job.company?.name?.toLowerCase() || '';
        const location = job.location?.toLowerCase() || '';
        const skills = (job.requiredSkills || []).join(' ').toLowerCase();

        return (
          title.includes(query) ||
          company.includes(query) ||
          location.includes(query) ||
          skills.includes(query)
        );
      });
    }

    if (onlyEligible) {
      list = list.filter((job) => job.eligible === true);
    }

    if (statusFilter === 'eligible') {
      list = list.filter((job) => job.eligible === true);
    } else if (statusFilter === 'not_eligible') {
      list = list.filter((job) => job.eligible === false);
    } else if (statusFilter === 'active') {
      list = list.filter((job) => getDriveStatus(job) === 'active');
    } else if (statusFilter === 'upcoming') {
      list = list.filter((job) => getDriveStatus(job) === 'upcoming');
    } else if (statusFilter === 'expired') {
      list = list.filter((job) => getDriveStatus(job) === 'expired');
    }

    if (locationFilter !== 'all') {
      list = list.filter((job) => job.location === locationFilter);
    }

    if (sortBy === 'match') {
      list.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    } else if (sortBy === 'deadline') {
      list.sort(
        (a, b) =>
          new Date(a.applicationDeadline || 0) - new Date(b.applicationDeadline || 0)
      );
    } else if (sortBy === 'latest') {
      list.sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
    }

    return list;
  }, [jobs, search, onlyEligible, statusFilter, locationFilter, sortBy]);

  // Overall counts for summary cards
  const totalDrivesCount = jobs.length;
  const totalEligibleCount = jobs.filter((job) => job.eligible === true).length;
  const totalActiveCount = jobs.filter((job) => getDriveStatus(job) === 'active' || getDriveStatus(job) === 'upcoming').length;
  const totalExpiredCount = jobs.filter((job) => getDriveStatus(job) === 'expired').length;

  // Filtered counts to keep dashboard numbers strictly consistent
  const filteredEligibleCount = filtered.filter((job) => job.eligible === true).length;
  const filteredNotEligibleCount = filtered.filter((job) => job.eligible === false).length;
  const filteredActiveCount = filtered.filter((job) => getDriveStatus(job) === 'active').length;
  const filteredExpiredCount = filtered.filter((job) => getDriveStatus(job) === 'expired').length;

  const resetFilters = () => {
    setSearch('');
    setOnlyEligible(false);
    setStatusFilter('all');
    setLocationFilter('all');
    setSortBy('match');
  };

  const getMatchStyle = (score, eligible) => {
    if (!eligible) {
      return 'bg-slate-100 text-slate-600 border-slate-200';
    }
    if (score >= 85) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (score >= 65) {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    return 'bg-amber-50 text-amber-700 border-amber-200';
  };

  if (loading) {
    return (
      <Layout title="Browse Placement Drives">
        <Loader label="Loading placement opportunities…" />
      </Layout>
    );
  }

  return (
    <Layout title="Browse Placement Drives">
      <div className="space-y-6 pb-8">
        {/* ========================================================= */}
        {/* HERO */}
        {/* ========================================================= */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-900 shadow-xl">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-12 lg:items-center">
            <div className="p-7 sm:p-9 lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
                Campus Recruitment Drives
              </div>

              <h1 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-4xl">
                Explore placement drives &
                <span className="block bg-gradient-to-r from-cyan-300 to-violet-300 bg-clip-text text-transparent">
                  apply with verified eligibility.
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-indigo-100 sm:text-base">
                Discover active campus hiring opportunities tailored to your degree and skills.
                Review verified academic criteria, match percentages, and application deadlines.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-xs font-semibold text-white backdrop-blur">
                  <Briefcase className="h-4 w-4 text-cyan-300" />
                  {totalDrivesCount} Total Drives
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-xs font-semibold text-white backdrop-blur">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  {totalEligibleCount} Eligible Opportunities
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-xs font-semibold text-white backdrop-blur">
                  <Clock3 className="h-4 w-4 text-amber-300" />
                  {totalActiveCount} Active & Upcoming
                </div>
              </div>
            </div>

            <div className="hidden p-6 lg:col-span-5 lg:block">
              <div className="relative overflow-hidden rounded-2xl border border-white/20 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1000&q=85"
                  alt="Professionals collaborating"
                  className="h-64 w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/90 via-indigo-950/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-lg font-bold text-white">Your recruitment roadmap</p>
                  <p className="mt-1 text-xs text-indigo-200">
                    Live Eligibility • One-Click Application • Verified Criteria
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* OVERVIEW STATS */}
        {/* ========================================================= */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Total Drives
                </p>
                <p className="mt-2 text-3xl font-black text-slate-900">{totalDrivesCount}</p>
              </div>
              <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                <Briefcase className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-500">Placement opportunities listed</p>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/60 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Eligible Drives
                </p>
                <p className="mt-2 text-3xl font-black text-emerald-600">{totalEligibleCount}</p>
              </div>
              <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-500">Drives matching your profile</p>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-white to-blue-50/60 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Active & Upcoming
                </p>
                <p className="mt-2 text-3xl font-black text-blue-600">{totalActiveCount}</p>
              </div>
              <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                <Clock3 className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-500">Open for application submission</p>
          </div>

          <div className="rounded-2xl border border-rose-100 bg-gradient-to-br from-white to-rose-50/60 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Expired / Closed
                </p>
                <p className="mt-2 text-3xl font-black text-rose-600">{totalExpiredCount}</p>
              </div>
              <div className="rounded-xl bg-rose-100 p-3 text-rose-600">
                <XCircle className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-500">Deadlines that have passed</p>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SEARCH + FILTERS */}
        {/* ========================================================= */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                <SlidersHorizontal className="h-4 w-4" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900">Find the right opportunity</h2>
                <p className="text-xs text-slate-500">
                  Search by role, company, skill, status, or location.
                </p>
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-12">
              {/* SEARCH */}
              <div className="relative lg:col-span-5">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search role, company, skill or location..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              {/* STATUS FILTER */}
              <div className="relative lg:col-span-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 pr-9 text-sm font-medium text-slate-700 outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                >
                  <option value="all">All Opportunities</option>
                  <option value="eligible">Eligible Only</option>
                  <option value="not_eligible">Not Eligible</option>
                  <option value="active">Active Drives</option>
                  <option value="upcoming">Upcoming Drives</option>
                  <option value="expired">Expired Drives</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>

              {/* LOCATION */}
              <div className="relative lg:col-span-2">
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 pr-9 text-sm font-medium text-slate-700 outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                >
                  <option value="all">All Locations</option>
                  {locations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>

              {/* SORT */}
              <div className="relative lg:col-span-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 pr-9 text-sm font-medium text-slate-700 outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                >
                  <option value="match">Best Match</option>
                  <option value="deadline">Deadline Soon</option>
                  <option value="latest">Latest Drives</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>

              {/* RESET */}
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 lg:col-span-1"
                title="Reset all filters"
              >
                <RotateCcw className="h-4 w-4" />
                <span className="lg:hidden">Reset</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50/60 px-3 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100/60">
                <input
                  type="checkbox"
                  checked={onlyEligible}
                  onChange={(e) => setOnlyEligible(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                Show eligible drives only
              </label>

              <span className="text-xs text-slate-400">
                Showing {filtered.length} of {jobs.length} total drives
              </span>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* RESULT HEADER */}
        {/* ========================================================= */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
              Placement Opportunities
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">
              {filtered.length} {filtered.length === 1 ? 'drive' : 'drives'} matching your criteria
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 font-semibold text-emerald-700">
              {filteredEligibleCount} eligible
            </span>
            <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 font-semibold text-rose-700">
              {filteredNotEligibleCount} not eligible
            </span>
            <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 font-semibold text-blue-700">
              {filteredActiveCount} active
            </span>
            {filteredExpiredCount > 0 && (
              <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 font-semibold text-slate-600">
                {filteredExpiredCount} expired
              </span>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* JOB CARDS */}
        {/* ========================================================= */}
        {filtered.length === 0 ? (
          <EmptyState
            title="No placement drives found"
            description="Try loosening your search filters or resetting them to view all opportunities."
          />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((job) => {
              const driveStatus = getDriveStatus(job);
              const isExpired = driveStatus === 'expired';
              const isUpcoming = driveStatus === 'upcoming';
              const isApplied = appliedJobIds.has(job._id);
              const daysLeft = getDaysLeft(job.applicationDeadline);
              const matchScore = job.matchScore ?? 0;

              return (
                <div
                  key={job._id}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl"
                >
                  {/* TOP COLOR BAR */}
                  <div
                    className={`h-1.5 ${
                      isExpired
                        ? 'bg-slate-300'
                        : job.eligible
                        ? 'bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-500'
                        : 'bg-gradient-to-r from-amber-400 to-rose-400'
                    }`}
                  />

                  <div className="flex flex-1 flex-col p-5">
                    {/* STATUS PILLS & MATCH SCORE */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1.5">
                        {isExpired && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold text-rose-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                            Expired
                          </span>
                        )}
                        {!isExpired && isUpcoming && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-0.5 text-[11px] font-bold text-violet-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                            Upcoming
                          </span>
                        )}
                        {!isExpired && !isUpcoming && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Active
                          </span>
                        )}

                        {isApplied && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700">
                            <Check className="h-3 w-3" />
                            Applied
                          </span>
                        )}
                      </div>

                      {job.matchScore !== undefined && (
                        <span
                          className={`flex-shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${getMatchStyle(
                            matchScore,
                            job.eligible
                          )}`}
                        >
                          {matchScore}% match
                        </span>
                      )}
                    </div>

                    {/* COMPANY & TITLE */}
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md font-bold text-lg">
                        {(job.company?.name || 'C').charAt(0)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-slate-500">
                          {job.company?.name || 'Company'}
                        </p>
                        <Link
                          to={`/student/jobs/${job._id}`}
                          className="mt-0.5 block font-extrabold text-slate-900 transition hover:text-indigo-600"
                        >
                          <h3 className="line-clamp-2 text-base font-extrabold">{job.title}</h3>
                        </Link>
                      </div>
                    </div>

                    {/* ELIGIBILITY BANNER WITH SPECIFIC REASONS */}
                    <div className="mt-4">
                      {job.eligible ? (
                        <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2">
                          <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-600" />
                          <div>
                            <p className="text-xs font-bold text-emerald-700">You are eligible</p>
                            <p className="text-[10px] text-emerald-600">
                              Your academic profile and skills match this placement drive.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-2 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2">
                          <XCircle className="h-4 w-4 flex-shrink-0 text-rose-500 mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-rose-700">Currently not eligible</p>
                            <p className="text-[11px] font-medium leading-4 text-rose-600 mt-0.5">
                              {job.eligibilityReasons && job.eligibilityReasons.length > 0
                                ? job.eligibilityReasons[0]
                                : 'Check job requirements before applying.'}
                            </p>
                            {job.eligibilityReasons && job.eligibilityReasons.length > 1 && (
                              <p className="text-[10px] font-semibold text-rose-500 mt-1">
                                +{job.eligibilityReasons.length - 1} more issue(s)
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* REQUIRED SKILLS */}
                    <div className="mt-4">
                      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Required Skills
                      </p>
                      <div className="flex min-h-[46px] flex-wrap content-start gap-1.5">
                        {(job.requiredSkills || []).slice(0, 4).map((skill) => (
                          <span
                            key={skill}
                            className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-600"
                          >
                            {skill}
                          </span>
                        ))}
                        {(job.requiredSkills || []).length > 4 && (
                          <span className="rounded-lg bg-indigo-50 px-2 py-1 text-[11px] font-bold text-indigo-600">
                            +{(job.requiredSkills || []).length - 4} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* DETAILS: LOCATION & CTC */}
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="rounded-xl bg-slate-50 p-2.5">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <MapPin className="h-3.5 w-3.5" />
                          <span className="text-[10px] font-bold uppercase">Location</span>
                        </div>
                        <p className="mt-0.5 truncate text-xs font-bold text-slate-700">
                          {job.location || 'Not specified'}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-2.5">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <IndianRupee className="h-3.5 w-3.5" />
                          <span className="text-[10px] font-bold uppercase">Package</span>
                        </div>
                        <p className="mt-0.5 truncate text-xs font-bold text-slate-700">
                          {job.ctc || 'Not specified'}
                        </p>
                      </div>
                    </div>

                    {/* DEADLINE */}
                    <div className="mt-3 flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-2.5">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-indigo-500" />
                        <div>
                          <p className="text-[10px] font-semibold text-slate-400">Deadline</p>
                          <p className="text-xs font-bold text-slate-700">
                            {formatDeadline(job.applicationDeadline)}
                          </p>
                        </div>
                      </div>

                      {daysLeft !== null && (
                        <span
                          className={`rounded-lg px-2 py-0.5 text-[10px] font-bold ${
                            isExpired
                              ? 'bg-rose-100 text-rose-700'
                              : daysLeft <= 3
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isExpired
                            ? 'Expired'
                            : daysLeft === 0
                            ? 'Today'
                            : daysLeft === 1
                            ? '1 day left'
                            : `${daysLeft}d left`}
                        </span>
                      )}
                    </div>

                    {/* FOOTER & APPLY BUTTON */}
                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                      <Link
                        to={`/student/jobs/${job._id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-indigo-600 transition"
                      >
                        Details
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>

                      {isApplied ? (
                        <Link
                          to="/student/applications"
                          className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition"
                        >
                          <Check className="h-3.5 w-3.5 text-indigo-600" />
                          View Application
                        </Link>
                      ) : isExpired ? (
                        <span className="inline-flex items-center rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-400 cursor-not-allowed">
                          Closed
                        </span>
                      ) : job.eligible ? (
                        <button
                          type="button"
                          onClick={(e) => handleQuickApply(e, job)}
                          disabled={applyingJobId === job._id}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:from-emerald-500 hover:to-teal-500 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {applyingJobId === job._id ? (
                            'Applying…'
                          ) : (
                            <>
                              Apply Now
                              <ArrowRight className="h-3.5 w-3.5" />
                            </>
                          )}
                        </button>
                      ) : (
                        <Link
                          to={`/student/jobs/${job._id}`}
                          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                        >
                          View Requirements
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ========================================================= */}
        {/* BOTTOM INFORMATION */}
        {/* ========================================================= */}
        <section className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-cyan-50 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-indigo-600 p-3 text-white shadow-md">
                <Clock3 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Keep your academic profile updated</h3>
                <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
                  Eligibility checks evaluate your verified CGPA, department, graduation year, and
                  technical skills in real-time. Improving your skills or clearing backlogs will
                  unlock additional placement drives.
                </p>
              </div>
            </div>

            <Link
              to="/student/profile"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-xs font-bold text-white transition hover:bg-indigo-700 shadow-sm"
            >
              Update Profile
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  );
}