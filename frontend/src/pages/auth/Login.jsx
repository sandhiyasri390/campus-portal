import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Building2,
  UserCheck,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

const DEMO_ACCOUNTS = [
  {
    role: 'Student',
    email: 'student1@campus.edu',
    password: 'Student@123',
    icon: GraduationCap,
    desc: 'B.Tech CSE · Batch 2027',
    badgeCls:
      'bg-blue-50 text-blue-700 border-blue-200 hover:border-blue-400 hover:bg-blue-100/60',
  },
  {
    role: 'Recruiter',
    email: 'recruiter1@technova.com',
    password: 'Recruiter@123',
    icon: Building2,
    desc: 'TechNova Solutions HR',
    badgeCls:
      'bg-emerald-50 text-emerald-700 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-100/60',
  },
  {
    role: 'Placement Officer',
    email: 'officer@campus.edu',
    password: 'Officer@123',
    icon: ShieldCheck,
    desc: 'Head of Career Services',
    badgeCls:
      'bg-amber-50 text-amber-700 border-amber-200 hover:border-amber-400 hover:bg-amber-100/60',
  },
  {
    role: 'Admin',
    email: 'admin@campus.edu',
    password: 'Admin@123',
    icon: UserCheck,
    desc: 'System Administrator',
    badgeCls:
      'bg-slate-100 text-slate-700 border-slate-300 hover:border-slate-400 hover:bg-slate-200/60',
  },
];

export default function Login() {
  const { login } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeDemo, setActiveDemo] = useState(null);

  const submit = async (e) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      const user = await login(form.email, form.password);

      push(`Welcome back, ${user.name.split(' ')[0]}.`, 'success');

      navigate(`/${user.role}/dashboard`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (acc) => {
    setForm({
      email: acc.email,
      password: acc.password,
    });

    setActiveDemo(acc.role);
    setError('');
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-12 bg-white">
      {/* Left Column: Realistic University / Campus Visual Showcase */}
      <div className="relative hidden lg:flex lg:col-span-6 xl:col-span-7 flex-col justify-between p-12 xl:p-16 text-white overflow-hidden bg-slate-950">
        {/* Real Campus Photography Background */}
        <img
          src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1600&q=85"
          alt="University campus library and students collaborating"
          className="absolute inset-0 h-full w-full object-cover object-center opacity-35 filter saturate-90"
        />

        {/* Sophisticated Dark Photographic Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-950/75 to-slate-950/95" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-transparent to-slate-950/40" />

        {/* Top Header Branding */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-md ring-1 ring-white/20">
              <GraduationCap
                className="h-6 w-6 text-white"
                strokeWidth={2.25}
              />
            </div>

            <div>
              <span className="font-display text-xl font-bold tracking-tight text-white">
                Campus Recruitment Portal
              </span>

              <p className="text-[11px] font-medium tracking-wide uppercase text-blue-200/80">
                Campus Recruitment Cell
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3.5 py-1 text-xs font-medium text-slate-200 backdrop-blur-sm">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            Accredited Placement Office
          </span>
        </div>

        {/* Hero Narrative */}
        <div className="relative z-10 max-w-xl my-auto py-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/15 px-3 py-1 text-xs font-semibold text-blue-200 mb-6 backdrop-blur-sm">
            <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />
            Official Placement Season 2026–27
          </div>

          <h1 className="font-display text-4xl xl:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Your career starts here.
          </h1>

          <p className="mt-4 text-base xl:text-lg text-slate-300 leading-relaxed font-normal">
            A unified, transparent platform connecting students with premier
            global recruiters. Track applications, test eligibility in
            real-time, and manage interviews with full institutional support.
          </p>

          {/* Key Placement Highlights */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-white/15">
            <div className="rounded-lg bg-white/5 border border-white/10 p-3 backdrop-blur-sm">
              <p className="text-2xl font-bold text-white font-display">
                94.2%
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Placement Rate
              </p>
            </div>

            <div className="rounded-lg bg-white/5 border border-white/10 p-3 backdrop-blur-sm">
              <p className="text-2xl font-bold text-white font-display">
                180+
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Drive Partners
              </p>
            </div>

            <div className="rounded-lg bg-white/5 border border-white/10 p-3 backdrop-blur-sm">
              <p className="text-2xl font-bold text-white font-display">
                1,240+
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Offers Extended
              </p>
            </div>

            <div className="rounded-lg bg-white/5 border border-white/10 p-3 backdrop-blur-sm">
              <p className="text-2xl font-bold text-emerald-400 font-display">
                8.6 LPA
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Average Package
              </p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 pt-6 border-t border-white/10">
          <p>© 2026 University Directorate of Training & Placement</p>

          <div className="flex items-center gap-4 text-slate-300">
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />
              Automated Eligibility
            </span>

            <span className="inline-flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />
              Skill Matching
            </span>
          </div>
        </div>
      </div>

      {/* Right Column: Authentication Form */}
      <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-center px-6 sm:px-12 xl:px-16 py-12 bg-slate-50/60 min-h-screen">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile-Only Header Branding */}
          <div className="flex items-center gap-3 lg:hidden mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
              <GraduationCap className="h-5 w-5" />
            </div>

            <div>
              <span className="font-display text-lg font-bold text-slate-900">
                Campus Recruitment Portal
              </span>

              <p className="text-xs text-slate-500">
                Campus Recruitment Portal
              </p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Sign in to your portal
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Access your personalized placement dashboard, drives, and
              schedules.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-sm text-rose-800 animate-[fadeIn_0.2s_ease-out]">
              <AlertCircle className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />

              <div className="flex-1">
                <p className="font-semibold">Authentication Error</p>

                <p className="mt-0.5 text-xs text-rose-700 leading-relaxed">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                University / Official Email
              </label>

              <div className="relative rounded-xl shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>

                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      email: e.target.value,
                    })
                  }
                  placeholder="name@campus.edu or recruiter@company.com"
                  className="block w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Password
                </label>
              </div>

              <div className="relative rounded-xl shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>

                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      password: e.target.value,
                    })
                  }
                  placeholder="Enter your password"
                  className="block w-full rounded-xl border border-slate-300 bg-white pl-10 pr-10 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-colors"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label={
                    showPassword ? 'Hide password' : 'Show password'
                  }
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Signing in…</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Registration Link */}
          <div className="mt-6 text-center text-sm text-slate-600">
            Don't have an active account?{' '}
            <Link
              to="/register"
              className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              Create student or recruiter account
            </Link>
          </div>

          {/* Interactive Demo Credentials Section */}
          <div className="mt-8 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Quick Demo Access
              </span>

              <span className="text-[11px] text-slate-400">
                Click role to auto-fill
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((acc) => {
                const Icon = acc.icon;
                const isSelected = activeDemo === acc.role;

                return (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => fillDemo(acc)}
                    className={`flex items-start gap-2.5 rounded-xl border p-2.5 text-left transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                      acc.badgeCls
                    } ${
                      isSelected
                        ? 'ring-2 ring-blue-600/40 font-medium'
                        : ''
                    }`}
                  >
                    <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-white/80 shadow-xs">
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate leading-tight">
                        {acc.role}
                      </p>

                      <p className="text-[10px] text-slate-500 truncate mt-0.5">
                        {acc.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}