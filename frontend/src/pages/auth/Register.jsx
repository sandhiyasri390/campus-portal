import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap, Building2, User, Mail, Lock, Eye, EyeOff,
  ArrowRight, ShieldCheck, AlertCircle, Loader2, CheckCircle2, Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await register(form);
      push('Account created. Letâ€™s complete your profile.', 'success');
      navigate(`/${user.role}/dashboard`);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-12 bg-white">
      {/* Left Column: Realistic University / Campus Visual Showcase */}
      <div className="relative hidden lg:flex lg:col-span-6 xl:col-span-7 flex-col justify-between p-12 xl:p-16 text-white overflow-hidden bg-slate-950">
        {/* Real Campus Photography Background */}
        <img
          src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=85"
          alt="University students collaborating around laptops in modern campus career center"
          className="absolute inset-0 h-full w-full object-cover object-center opacity-35 filter saturate-90"
        />

        {/* Sophisticated Dark Photographic Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-950/75 to-slate-950/95" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-transparent to-slate-950/40" />

        {/* Top Header Branding */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-md ring-1 ring-white/20">
              <GraduationCap className="h-6 w-6 text-white" strokeWidth={2.25} />
            </div>
            <div>
              <span className="font-display text-xl font-bold tracking-tight text-white">Campus Placements</span>
              <p className="text-[11px] font-medium tracking-wide uppercase text-blue-200/80">Campus Recruitment Cell</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3.5 py-1 text-xs font-medium text-slate-200 backdrop-blur-sm">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            Verified Campus Portal
          </span>
        </div>

        {/* Hero Narrative */}
        <div className="relative z-10 max-w-xl my-auto py-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/15 px-3 py-1 text-xs font-semibold text-blue-200 mb-6 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            Begin Your Career Journey
          </div>
          <h1 className="font-display text-4xl xl:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Join the campus placement network.
          </h1>
          <p className="mt-4 text-base xl:text-lg text-slate-300 leading-relaxed font-normal">
            Whether you are a student preparing for campus drives or a talent partner scouting high-caliber graduates, Campus Placements delivers transparency, precision, and speed to every recruitment phase.
          </p>

          {/* Pillars List */}
          <div className="mt-8 space-y-3.5 pt-6 border-t border-white/15">
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 flex-shrink-0 mt-0.5">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Automated Eligibility Validation</p>
                <p className="text-xs text-slate-400">Instantly matches CGPA, backlogs, branch, and graduation year criteria.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 flex-shrink-0 mt-0.5">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Rule-Based Skill Intelligence</p>
                <p className="text-xs text-slate-400">Identifies strengths, missing competencies, and tailored 4-week roadmaps.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 flex-shrink-0 mt-0.5">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Direct Recruiter Collaboration</p>
                <p className="text-xs text-slate-400">Manage interviews, assessments, and offer letters in one unified pipeline.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 pt-6 border-t border-white/10">
          <p>Â© 2026 University Directorate of Training & Placement</p>
          <p className="text-slate-300">Secure Institutional Registration</p>
        </div>
      </div>

      {/* Right Column: Clean Registration Form */}
      <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-center px-6 sm:px-12 xl:px-16 py-12 bg-slate-50/60 min-h-screen">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile-Only Header Branding */}
          <div className="flex items-center gap-3 lg:hidden mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <span className="font-display text-lg font-bold text-slate-900">Campus Placements</span>
              <p className="text-xs text-slate-500">Campus Recruitment Portal</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Students and corporate recruiters can register below to get started.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-sm text-rose-800 animate-[fadeIn_0.2s_ease-out]">
              <AlertCircle className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Registration Issue</p>
                <p className="mt-0.5 text-xs text-rose-700 leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={submit} className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                I am registering as a
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: 'student' })}
                  className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                    form.role === 'student'
                      ? 'border-blue-600 bg-blue-50/80 text-blue-900 shadow-sm ring-1 ring-blue-600'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                    form.role === 'student' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <GraduationCap className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-none">Student</p>
                    <p className="text-[10px] text-slate-500 mt-1">Campus Candidate</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: 'recruiter' })}
                  className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                    form.role === 'recruiter'
                      ? 'border-emerald-600 bg-emerald-50/80 text-emerald-900 shadow-sm ring-1 ring-emerald-600'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                    form.role === 'recruiter' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-none">Recruiter</p>
                    <p className="text-[10px] text-slate-500 mt-1">Talent Partner</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Full Name
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. John Doe or Jane Smith"
                  className="block w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-colors"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder={form.role === 'student' ? 'student@campus.edu' : 'recruiter@company.com'}
                  className="block w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Password <span className="font-normal text-slate-400">(Minimum 6 characters)</span>
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Create a strong password"
                  className="block w-full rounded-xl border border-slate-300 bg-white pl-10 pr-10 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creating accountâ€¦</span>
                </>
              ) : (
                <>
                  <span>Complete Registration</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center text-sm text-slate-600">
            Already have an active account?{' '}
            <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
              Sign in to portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


