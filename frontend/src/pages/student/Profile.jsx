import React, { useEffect, useMemo, useState } from 'react';
import Layout from '../../components/Layout.jsx';
import Loader from '../../components/Loader.jsx';
import api from '../../api/axios.js';
import { useToast } from '../../context/ToastContext.jsx';

const TEXT_FIELDS = [
  ['fullName', 'Full Name'],
  ['registerNumber', 'Register Number'],
  ['collegeEmail', 'College Email'],
  ['personalEmail', 'Personal Email'],
  ['phone', 'Phone'],
  ['department', 'Department'],
  ['degree', 'Degree'],
  ['batch', 'Batch'],
  ['targetRole', 'Target Role'],
];

const SOCIAL_FIELDS = [
  ['githubUrl', 'GitHub URL', 'GitHub'],
  ['linkedinUrl', 'LinkedIn URL', 'LinkedIn'],
  ['portfolioUrl', 'Portfolio URL', 'Portfolio'],
];

const LIST_FIELDS = [
  ['skills', 'Skills', 'Add your technical and professional skills'],
  ['programmingLanguages', 'Programming Languages', 'JavaScript, Python, Java, C++...'],
  ['certifications', 'Certifications', 'Add certifications separated by commas'],
];

const inputClass =
  'mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100';

function SectionTitle({ eyebrow, title, description }) {
  return (
    <div className="mb-6">
      {eyebrow && (
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-brand-600">
          {eyebrow}
        </p>
      )}
      <h2 className="font-display text-xl font-bold text-ink-900">{title}</h2>
      {description && (
        <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700">{label}</label>
      <input
        type={type}
        value={value ?? ''}
        onChange={onChange}
        placeholder={placeholder}
        className={inputClass}
      />
    </div>
  );
}

function CompletionRing({ percentage }) {
  const value = Math.max(0, Math.min(100, Number(percentage) || 0));
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative h-32 w-32 shrink-0">
      <svg
        className="h-32 w-32 -rotate-90"
        viewBox="0 0 120 120"
      >
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          className="text-slate-200"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-brand-500 transition-all duration-700"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-ink-900">{value}%</span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Complete
        </span>
      </div>
    </div>
  );
}

function SkillChip({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-brand-100 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700">
      {children}
    </span>
  );
}

export default function Profile() {
  const { push } = useToast();

  const [form, setForm] = useState(null);
  const [completion, setCompletion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [resume, setResume] = useState(null);

  useEffect(() => {
    let mounted = true;

    api
      .get('/students/profile')
      .then((res) => {
        if (!mounted) return;

        setForm(res.data.profile);
        setCompletion(res.data.completion);
        setResume(res.data.profile.resume);
      })
      .catch((err) => {
        push(
          err.response?.data?.message || 'Could not load profile.',
          'error'
        );
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [push]);

  const setField = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = { ...form };

      const res = await api.put('/students/profile', payload);

      setForm(res.data.profile);
      setCompletion(res.data.completion);

      push('Profile updated successfully.', 'success');
    } catch (err) {
      push(
        err.response?.data?.message || 'Could not save profile.',
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  const uploadResume = async () => {
    if (!resumeFile) {
      push('Please select a PDF resume first.', 'error');
      return;
    }

    const fd = new FormData();
    fd.append('resume', resumeFile);

    try {
      const res = await api.post('/students/resume', fd, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResume(res.data.resume);
      setResumeFile(null);

      push('Resume uploaded successfully.', 'success');
    } catch (err) {
      push(
        err.response?.data?.message || 'Resume upload failed.',
        'error'
      );
    }
  };

  const skills = useMemo(
    () => (Array.isArray(form?.skills) ? form.skills : []),
    [form]
  );

  const languages = useMemo(
    () =>
      Array.isArray(form?.programmingLanguages)
        ? form.programmingLanguages
        : [],
    [form]
  );

  const certifications = useMemo(
    () =>
      Array.isArray(form?.certifications)
        ? form.certifications
        : [],
    [form]
  );

  if (loading || !form) {
    return (
      <Layout title="My Profile">
        <Loader />
      </Layout>
    );
  }

  const percentage = completion?.percentage || 0;

  return (
    <Layout title="My Profile">
      <div className="space-y-6">

        {/* HERO */}
        <section className="relative overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-xl md:p-8">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl" />
          <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-indigo-600 text-3xl font-black shadow-lg shadow-brand-900/40">
                {(form.fullName || 'S').charAt(0).toUpperCase()}
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-300">
                  Student Profile
                </p>

                <h1 className="mt-1 font-display text-2xl font-black tracking-tight md:text-3xl">
                  {form.fullName || 'Complete your profile'}
                </h1>

                <p className="mt-2 text-sm text-slate-300">
                  {form.targetRole || 'Set your target career role'}
                  {form.department ? ` • ${form.department}` : ''}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {form.registerNumber && (
                    <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200">
                      {form.registerNumber}
                    </span>
                  )}

                  {form.batch && (
                    <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200">
                      Batch {form.batch}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-5 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <CompletionRing percentage={percentage} />

              <div>
                <p className="text-sm font-bold text-white">
                  Profile strength
                </p>
                <p className="mt-1 max-w-[220px] text-xs leading-5 text-slate-400">
                  Complete your profile to improve job matching and placement
                  recommendations.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* COMPLETION INSIGHT */}
        <section className="grid gap-4 md:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Academic
                </p>
                <p className="mt-1 text-lg font-black text-ink-900">
                  {form.cgpa || '—'}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                🎓
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-500">
              CGPA • {form.backlogs || 0} active backlog
              {Number(form.backlogs || 0) === 1 ? '' : 's'}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Skills
                </p>
                <p className="mt-1 text-lg font-black text-ink-900">
                  {skills.length}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                ⚡
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-500">
              Skills added to your placement profile
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Certifications
                </p>
                <p className="mt-1 text-lg font-black text-ink-900">
                  {certifications.length}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                🏆
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-500">
              Credentials supporting your profile
            </p>
          </div>

        </section>

        <form onSubmit={save} className="space-y-6">

          {/* PERSONAL INFORMATION */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card md:p-7">
            <SectionTitle
              eyebrow="01 • Personal information"
              title="Tell recruiters about yourself"
              description="Keep your contact and academic identity information accurate."
            />

            <div className="grid gap-5 md:grid-cols-2">
              {TEXT_FIELDS.map(([key, label]) => (
                <Field
                  key={key}
                  label={label}
                  value={form[key] || ''}
                  onChange={(e) => setField(key, e.target.value)}
                />
              ))}

              <Field
                label="Graduation Year"
                type="number"
                value={form.graduationYear || ''}
                onChange={(e) =>
                  setField(
                    'graduationYear',
                    e.target.value === ''
                      ? ''
                      : Number(e.target.value)
                  )
                }
              />

              <Field
                label="CGPA"
                type="number"
                value={form.cgpa ?? ''}
                onChange={(e) =>
                  setField(
                    'cgpa',
                    e.target.value === ''
                      ? ''
                      : Number(e.target.value)
                  )
                }
              />

              <Field
                label="Active Backlogs"
                type="number"
                value={form.backlogs ?? 0}
                onChange={(e) =>
                  setField(
                    'backlogs',
                    e.target.value === ''
                      ? 0
                      : Number(e.target.value)
                  )
                }
              />
            </div>
          </section>

          {/* CAREER */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card md:p-7">
            <SectionTitle
              eyebrow="02 • Career direction"
              title="Define your placement goals"
              description="Your target role helps the portal personalize job matching and recommendations."
            />

            <div className="grid gap-5 md:grid-cols-3">

              <div className="rounded-2xl border border-brand-100 bg-brand-50/60 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-brand-600">
                  Target role
                </p>
                <p className="mt-2 text-lg font-black text-ink-900">
                  {form.targetRole || 'Not set'}
                </p>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Set the role you want recruiters to associate with your
                  profile.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Degree
                </p>
                <p className="mt-2 text-lg font-black text-ink-900">
                  {form.degree || 'Not set'}
                </p>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Your academic qualification.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Department
                </p>
                <p className="mt-2 text-lg font-black text-ink-900">
                  {form.department || 'Not set'}
                </p>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Used for academic and placement eligibility.
                </p>
              </div>

            </div>
          </section>

          {/* SKILLS */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card md:p-7">
            <SectionTitle
              eyebrow="03 • Skills & certifications"
              title="Showcase your capabilities"
              description="Add skills, programming languages and certifications that represent your current profile."
            />

            <div className="space-y-5">
              {LIST_FIELDS.map(([key, label, placeholder]) => (
                <div key={key}>
                  <label className="block text-sm font-semibold text-slate-700">
                    {label}
                  </label>

                  <input
                    value={(form[key] || []).join(', ')}
                    onChange={(e) =>
                      setField(
                        key,
                        e.target.value
                          .split(',')
                          .map((item) => item.trim())
                          .filter(Boolean)
                      )
                    }
                    placeholder={placeholder}
                    className={inputClass}
                  />

                  {Array.isArray(form[key]) && form[key].length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {form[key].map((item, index) => (
                        <SkillChip key={`${item}-${index}`}>
                          {item}
                        </SkillChip>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* SOCIAL */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card md:p-7">
            <SectionTitle
              eyebrow="04 • Professional presence"
              title="Connect your online profiles"
              description="Give recruiters a way to explore your projects, experience and professional work."
            />

            <div className="grid gap-5 md:grid-cols-3">
              {SOCIAL_FIELDS.map(([key, label, shortLabel]) => (
                <div key={key}>
                  <label className="block text-sm font-semibold text-slate-700">
                    {label}
                  </label>

                  <div className="relative mt-2">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">
                      {shortLabel}
                    </span>

                    <input
                      value={form[key] || ''}
                      onChange={(e) => setField(key, e.target.value)}
                      placeholder={`https://${shortLabel.toLowerCase()}.com/...`}
                      className={`${inputClass} pl-16`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* RESUME */}
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-card">
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-6 text-white md:p-7">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-300">
                    05 • Resume
                  </p>

                  <h2 className="mt-1 font-display text-xl font-bold">
                    Keep your resume placement-ready
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                    Upload your latest PDF resume so the portal can use it for
                    profile analysis and career recommendations.
                  </p>
                </div>

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-2xl">
                  📄
                </div>
              </div>
            </div>

            <div className="p-6 md:p-7">

              {resume?.filePath ? (
                <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
                      PDF
                    </div>

                    <div>
                      <p className="text-sm font-bold text-emerald-900">
                        {resume.fileName || 'Current Resume'}
                      </p>
                      <p className="mt-1 text-xs text-emerald-700">
                        Current resume uploaded
                      </p>
                    </div>
                  </div>

                  <a
                    href={`http://localhost:5000${resume.filePath}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-emerald-700 shadow-sm transition hover:bg-emerald-100"
                  >
                    View Resume →
                  </a>
                </div>
              ) : (
                <div className="mb-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
                  <p className="text-sm font-bold text-slate-700">
                    No resume uploaded yet
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Upload a PDF to strengthen your placement profile.
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <label className="flex min-h-[52px] flex-1 cursor-pointer items-center rounded-xl border border-slate-200 bg-slate-50 px-4 transition hover:border-brand-300 hover:bg-brand-50">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) =>
                      setResumeFile(e.target.files?.[0] || null)
                    }
                    className="w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-100 file:px-4 file:py-2 file:text-xs file:font-bold file:text-brand-700"
                  />
                </label>

                <button
                  type="button"
                  onClick={uploadResume}
                  disabled={!resumeFile}
                  className="min-h-[52px] rounded-xl bg-ink-900 px-6 text-sm font-bold text-white transition hover:bg-ink-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Upload Resume
                </button>
              </div>

              {resumeFile && (
                <p className="mt-3 text-xs font-medium text-brand-600">
                  Selected: {resumeFile.name}
                </p>
              )}
            </div>
          </section>

          {/* SAVE BAR */}
          <div className="sticky bottom-4 z-20">
            <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-bold text-ink-900">
                  Keep your placement profile updated
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Updated profile information improves matching accuracy.
                </p>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-brand-500 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-brand-500/20 transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? 'Saving profile…' : 'Save Profile'}
              </button>
            </div>
          </div>

        </form>
      </div>
    </Layout>
  );
}