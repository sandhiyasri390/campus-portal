import React, { useEffect, useMemo, useState } from 'react';
import Layout from '../../components/Layout.jsx';
import Loader from '../../components/Loader.jsx';
import api from '../../api/axios.js';
import { useToast } from '../../context/ToastContext.jsx';

const CATEGORY_MAP = {
  frontend: [
    'html',
    'css',
    'javascript',
    'typescript',
    'react',
    'react.js',
    'next.js',
    'nextjs',
    'tailwind',
    'bootstrap',
    'vue',
    'angular',
  ],
  backend: [
    'node.js',
    'nodejs',
    'express',
    'express.js',
    'flask',
    'django',
    'spring',
    'spring boot',
    'rest api',
    'rest',
  ],
  database: [
    'mongodb',
    'mysql',
    'postgresql',
    'postgres',
    'sql',
    'oracle',
    'redis',
    'firebase',
  ],
  programming: [
    'python',
    'java',
    'c',
    'c++',
    'javascript',
    'typescript',
    'go',
    'rust',
  ],
  cloud: [
    'aws',
    'azure',
    'gcp',
    'docker',
    'kubernetes',
    'lambda',
    's3',
    'ec2',
  ],
  tools: [
    'git',
    'github',
    'gitlab',
    'postman',
    'figma',
    'vs code',
    'vscode',
  ],
};

const CATEGORY_META = {
  frontend: {
    label: 'Frontend',
    icon: '◈',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
  },
  backend: {
    label: 'Backend',
    icon: '⌘',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-100',
  },
  database: {
    label: 'Database',
    icon: '◉',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
  },
  programming: {
    label: 'Programming',
    icon: '</>',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
  },
  cloud: {
    label: 'Cloud & DevOps',
    icon: '☁',
    color: 'text-cyan-600',
    bg: 'bg-cyan-50',
    border: 'border-cyan-100',
  },
  tools: {
    label: 'Tools',
    icon: '⚙',
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    border: 'border-rose-100',
  },
  other: {
    label: 'Other',
    icon: '✦',
    color: 'text-slate-600',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
  },
};

function normalizeSkill(skill) {
  return String(skill || '').trim().toLowerCase();
}

function getCategory(skill) {
  const normalized = normalizeSkill(skill);

  for (const [category, values] of Object.entries(CATEGORY_MAP)) {
    if (values.some((value) => normalized === value || normalized.includes(value))) {
      return category;
    }
  }

  return 'other';
}

function ScoreRing({ score = 0 }) {
  const safeScore = Math.max(0, Math.min(100, Number(score) || 0));
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safeScore / 100) * circumference;

  return (
    <div className="relative h-32 w-32 shrink-0">
      <svg
        viewBox="0 0 120 120"
        className="-rotate-90 h-32 w-32"
      >
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          className="text-white/10"
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
          className="text-brand-400 transition-all duration-700"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-white">
          {safeScore}
        </span>

        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Score
        </span>
      </div>
    </div>
  );
}

function Progress({ value }) {
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));

  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
      <div
        className="h-full rounded-full bg-gradient-to-r from-brand-500 to-indigo-500 transition-all duration-700"
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}

function SkillPill({ skill, highlighted = false }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold ${highlighted
          ? 'border-brand-200 bg-brand-50 text-brand-700'
          : 'border-slate-200 bg-white text-slate-700'
        }`}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-brand-500" />
      {skill}
    </span>
  );
}

export default function Skills() {
  const { push } = useToast();

  const [analysis, setAnalysis] = useState(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    api
      .get('/students/resume/analysis')
      .then((res) => setAnalysis(res.data.analysis))
      .catch(() => {
        setAnalysis(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const analyze = async () => {
    if (text.trim().length < 20) {
      return push(
        'Paste at least a few lines of resume text.',
        'error'
      );
    }

    setAnalyzing(true);

    try {
      const res = await api.post('/students/resume/analyze', {
        resumeText: text,
      });

      setAnalysis(res.data.analysis);

      push(
        'Resume analyzed and skills synced to your profile.',
        'success'
      );
    } catch (err) {
      push(
        err.response?.data?.message || 'Analysis failed.',
        'error'
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const extracted = analysis?.extracted || {};

  const detectedSkills = Array.isArray(extracted.skills)
    ? extracted.skills
    : [];

  const categories = useMemo(() => {
    const result = {};

    detectedSkills.forEach((skill) => {
      const category = getCategory(skill);

      if (!result[category]) {
        result[category] = [];
      }

      result[category].push(skill);
    });

    return result;
  }, [detectedSkills]);

  const categoryCount = Object.keys(categories).length;

  const skillScore = useMemo(() => {
    if (!detectedSkills.length) return 0;

    const base = Math.min(detectedSkills.length * 8, 72);
    const categoryBonus = Math.min(categoryCount * 4, 20);
    const resumeBonus =
      extracted.projectLines?.length ||
        extracted.internshipLines?.length
        ? 8
        : 0;

    return Math.min(100, base + categoryBonus + resumeBonus);
  }, [detectedSkills, categoryCount, extracted]);

  const skillGaps = useMemo(() => {
    const current = new Set(
      detectedSkills.map((skill) => normalizeSkill(skill))
    );

    const commonSkills = [
      'Git',
      'REST API',
      'SQL',
      'React',
      'Node.js',
      'MongoDB',
      'Docker',
      'AWS',
    ];

    return commonSkills.filter(
      (skill) =>
        !Array.from(current).some(
          (existing) =>
            existing === normalizeSkill(skill) ||
            existing.includes(normalizeSkill(skill))
        )
    );
  }, [detectedSkills]);

  const totalEvidence = [
    extracted.educationLines?.length || 0,
    extracted.projectLines?.length || 0,
    extracted.internshipLines?.length || 0,
    extracted.certificationLines?.length || 0,
  ];

  const evidenceTotal = totalEvidence.reduce(
    (sum, value) => sum + value,
    0
  );

  const profileSignals = [
    {
      label: 'Skills',
      value: detectedSkills.length,
      icon: '⚡',
    },
    {
      label: 'Projects',
      value: extracted.projectLines?.length || 0,
      icon: '◈',
    },
    {
      label: 'Experience',
      value: extracted.internshipLines?.length || 0,
      icon: '💼',
    },
    {
      label: 'Certifications',
      value: extracted.certificationLines?.length || 0,
      icon: '🏆',
    },
  ];

  if (loading) {
    return (
      <Layout title="Resume & Skill Analysis">
        <Loader />
      </Layout>
    );
  }

  return (
    <Layout title="Resume & Skill Analysis">
      <div className="space-y-6">

        {/* HERO */}
        <section className="relative overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-xl md:p-8">

          <div className="absolute -right-20 -top-24 h-80 w-80 rounded-full bg-brand-500/20 blur-3xl" />
          <div className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">

            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-400/20 bg-brand-500/10 px-3 py-1.5 text-xs font-bold text-brand-300">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                Placement Intelligence
              </div>

              <h1 className="max-w-3xl font-display text-3xl font-black tracking-tight md:text-4xl">
                Turn your resume into a
                <span className="text-brand-400"> placement advantage.</span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
                Analyze your resume to identify technical skills, projects,
                internships, certifications and education signals. Use the
                results to understand where your profile is strong and where
                you can improve.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Skills detected
                  </p>
                  <p className="mt-1 text-xl font-black">
                    {detectedSkills.length}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Categories
                  </p>
                  <p className="mt-1 text-xl font-black">
                    {categoryCount}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Resume evidence
                  </p>
                  <p className="mt-1 text-xl font-black">
                    {evidenceTotal}
                  </p>
                </div>
              </div>
            </div>

            <ScoreRing score={skillScore} />

          </div>
        </section>

        {/* ANALYZER */}
        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card md:p-7">

            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">
                  Resume Analyzer
                </p>

                <h2 className="mt-1 font-display text-xl font-black text-ink-900">
                  Analyze your latest resume
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                  Paste your resume content below. The portal extracts
                  structured information without requiring an external AI key.
                </p>
              </div>

              <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 sm:flex">
                ✦
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-3">

              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={14}
                placeholder={`Paste your resume here...

Example:
• Full Stack Developer Intern
• Built React and Node.js applications
• Worked with MongoDB and REST APIs
• Developed projects using Python and Java
• AWS Certified Cloud Practitioner`}
                className="w-full resize-none rounded-xl border-0 bg-transparent px-3 py-2 text-sm leading-6 text-slate-700 outline-none placeholder:text-slate-400 focus:ring-0"
              />

              <div className="flex flex-col gap-3 border-t border-slate-200 px-3 pt-3 sm:flex-row sm:items-center sm:justify-between">

                <p className="text-xs text-slate-400">
                  {text.length} characters
                </p>

                <button
                  onClick={analyze}
                  disabled={analyzing}
                  className="rounded-xl bg-brand-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-brand-500/20 transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {analyzing
                    ? 'Analyzing resume…'
                    : 'Analyze Resume →'}
                </button>

              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-xs font-bold text-slate-700">
                  Skill extraction
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  Technical keywords
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-xs font-bold text-slate-700">
                  Experience signals
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  Projects & internships
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-xs font-bold text-slate-700">
                  Profile sync
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  Skills added automatically
                </p>
              </div>

            </div>
          </div>

          {/* ANALYSIS SUMMARY */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card md:p-7">

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
                  Analysis snapshot
                </p>

                <h2 className="mt-1 font-display text-xl font-black text-ink-900">
                  Profile signals
                </h2>
              </div>

              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                {analysis ? 'Analyzed' : 'Waiting'}
              </span>
            </div>

            {!analysis ? (
              <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                  📄
                </div>

                <p className="mt-4 text-sm font-bold text-slate-700">
                  No resume analysis yet
                </p>

                <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-slate-400">
                  Paste your resume on the left and run the analyzer to
                  generate your profile intelligence.
                </p>
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-2 gap-3">
                {profileSignals.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg">{item.icon}</span>
                      <span className="text-2xl font-black text-ink-900">
                        {item.value}
                      </span>
                    </div>

                    <p className="mt-3 text-xs font-bold text-slate-600">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {analysis && (
              <div className="mt-4 rounded-2xl border border-brand-100 bg-brand-50/60 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-brand-700">
                    Resume strength
                  </p>

                  <span className="text-sm font-black text-brand-700">
                    {skillScore}%
                  </span>
                </div>

                <div className="mt-3">
                  <Progress value={skillScore} />
                </div>

                <p className="mt-3 text-xs leading-5 text-slate-500">
                  Your score is based on detected skills, skill diversity and
                  resume evidence available to the analyzer.
                </p>
              </div>
            )}
          </div>

        </section>

        {/* SKILL INVENTORY */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card md:p-7">

          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">
                Skill inventory
              </p>

              <h2 className="mt-1 font-display text-xl font-black text-ink-900">
                Your technical skill map
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Detected technologies grouped into practical placement
                categories.
              </p>
            </div>

            <span className="text-sm font-bold text-slate-400">
              {detectedSkills.length} skills detected
            </span>
          </div>

          {detectedSkills.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
              <p className="text-sm font-bold text-slate-700">
                Your skill inventory is empty
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Analyze your resume to populate your technical skill map.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">

              {Object.entries(categories).map(
                ([category, skills]) => {
                  const meta =
                    CATEGORY_META[category] || CATEGORY_META.other;

                  return (
                    <div
                      key={category}
                      className={`rounded-2xl border ${meta.border} ${meta.bg} p-5`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white ${meta.color} shadow-sm`}
                          >
                            {meta.icon}
                          </div>

                          <div>
                            <p className="text-sm font-black text-ink-900">
                              {meta.label}
                            </p>

                            <p className="text-xs text-slate-400">
                              {skills.length}{' '}
                              {skills.length === 1
                                ? 'skill'
                                : 'skills'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {skills.map((skill) => (
                          <SkillPill
                            key={skill}
                            skill={skill}
                            highlighted
                          />
                        ))}
                      </div>
                    </div>
                  );
                }
              )}

            </div>
          )}
        </section>

        {/* SKILL GAP + LEARNING */}
        <section className="grid gap-6 lg:grid-cols-2">

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card md:p-7">

            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-600">
                  Skill gap
                </p>

                <h2 className="mt-1 font-display text-xl font-black text-ink-900">
                  Skills worth adding
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Common placement skills not currently detected in your
                  resume.
                </p>
              </div>

              <div className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700">
                Improve
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {skillGaps.length === 0 ? (
                <div className="rounded-2xl bg-emerald-50 p-5 text-center">
                  <p className="text-sm font-bold text-emerald-800">
                    Strong coverage 🎉
                  </p>

                  <p className="mt-1 text-xs text-emerald-600">
                    The common skills checked here are already represented.
                  </p>
                </div>
              ) : (
                skillGaps.slice(0, 6).map((skill, index) => (
                  <div
                    key={skill}
                    className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-xs font-black text-slate-400 shadow-sm">
                        {String(index + 1).padStart(2, '0')}
                      </div>

                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          {skill}
                        </p>

                        <p className="text-xs text-slate-400">
                          Recommended for placement readiness
                        </p>
                      </div>
                    </div>

                    <span className="rounded-full bg-white px-3 py-1 text-[10px] font-bold text-slate-500">
                      Gap
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card md:p-7">

            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
              Learning priorities
            </p>

            <h2 className="mt-1 font-display text-xl font-black text-ink-900">
              Build your next advantage
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              A simple progression you can use to strengthen your placement
              profile.
            </p>

            <div className="mt-6 space-y-4">

              {[
                {
                  step: '01',
                  title: 'Strengthen fundamentals',
                  text: 'Keep your programming and database fundamentals interview-ready.',
                },
                {
                  step: '02',
                  title: 'Build production projects',
                  text: 'Turn your skills into projects with real APIs, authentication and deployment.',
                },
                {
                  step: '03',
                  title: 'Add cloud exposure',
                  text: 'Learn deployment basics with AWS, Docker or another cloud platform.',
                },
                {
                  step: '04',
                  title: 'Document your work',
                  text: 'Add GitHub repositories and measurable project outcomes to your resume.',
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="flex gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-xs font-black text-white">
                    {item.step}
                  </div>

                  <div>
                    <p className="text-sm font-black text-ink-900">
                      {item.title}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}

            </div>
          </div>

        </section>

        {/* CONTACT */}
        {analysis && (
          <section className="grid gap-6 lg:grid-cols-2">

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                Contact extraction
              </p>

              <h2 className="mt-1 font-display text-lg font-black text-ink-900">
                Resume contact details
              </h2>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Email
                  </p>

                  <p className="mt-2 break-all text-sm font-semibold text-slate-700">
                    {extracted.email || 'Not found'}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Phone
                  </p>

                  <p className="mt-2 text-sm font-semibold text-slate-700">
                    {extracted.phone || 'Not found'}
                  </p>
                </div>

              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card">

              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                Resume evidence
              </p>

              <h2 className="mt-1 font-display text-lg font-black text-ink-900">
                What your resume demonstrates
              </h2>

              <div className="mt-5 space-y-3">

                {[
                  ['Education', extracted.educationLines],
                  ['Projects', extracted.projectLines],
                  ['Internships', extracted.internshipLines],
                  ['Certifications', extracted.certificationLines],
                ].map(([label, items]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3"
                  >
                    <span className="text-sm font-semibold text-slate-700">
                      {label}
                    </span>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                      {items?.length || 0}
                    </span>
                  </div>
                ))}

              </div>
            </div>

          </section>
        )}

        {/* FOOTER INSIGHT */}
        <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 to-indigo-700 p-6 text-white shadow-xl md:p-8">

          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-200">
                Placement tip
              </p>

              <h2 className="mt-1 font-display text-xl font-black">
                Skills matter more when backed by evidence.
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-brand-100">
                Connect every important technology to a project, internship,
                certification or measurable result. This gives recruiters
                stronger context than a simple keyword list.
              </p>
            </div>

            <div className="shrink-0 rounded-2xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur">
              <p className="text-xs text-brand-100">
                Current skill score
              </p>

              <p className="mt-1 text-3xl font-black">
                {skillScore}%
              </p>
            </div>

          </div>
        </section>

      </div>
    </Layout>
  );
}