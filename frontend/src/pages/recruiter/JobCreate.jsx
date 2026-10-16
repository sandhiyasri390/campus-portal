import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout.jsx';
import api from '../../api/axios.js';
import { useToast } from '../../context/ToastContext.jsx';

const DEPARTMENTS = ['CSE', 'IT', 'ECE', 'MECH', 'EEE'];

const JOB_TYPES = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'internship', label: 'Internship' },
  { value: 'internship+ppo', label: 'Internship + PPO' },
];

const INITIAL_FORM = {
  company: '',
  title: '',
  location: '',
  jobType: 'full-time',
  ctc: '',
  description: '',
  requiredSkills: '',
  preferredSkills: '',
  selectionProcess:
    'Online Test, Technical Interview, HR Interview',
  openings: 1,
  minCgpa: 6.5,
  maxBacklogs: 0,
  departments: [],
  graduationYears: '',
  minExperienceMonths: 0,
  requiredCertifications: '',
  applicationDeadline: '',
  driveDate: '',
};

function FieldLabel({ children, required = false, hint }) {
  return (
    <div className="mb-2">
      <div className="flex items-center gap-1">
        <label className="text-sm font-bold text-slate-800">
          {children}
        </label>
        {required && (
          <span className="text-rose-500">*</span>
        )}
      </div>

      {hint && (
        <p className="mt-0.5 text-[11px] text-slate-400">
          {hint}
        </p>
      )}
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
  min,
  max,
  step,
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      min={min}
      max={max}
      step={step}
      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100"
    />
  );
}

function SectionHeader({
  number,
  eyebrow,
  title,
  description,
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-sm font-black text-brand-600">
        {number}
      </div>

      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-600">
          {eyebrow}
        </p>

        <h2 className="mt-1 font-display text-xl font-black text-ink-900">
          {title}
        </h2>

        <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function JobCreate() {
  const { push } = useToast();
  const navigate = useNavigate();

  const [companies, setCompanies] = useState([]);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState(INITIAL_FORM);

  useEffect(() => {
    api
      .get('/companies', {
        params: { status: 'approved' },
      })
      .then((res) =>
        setCompanies(res.data.companies || [])
      )
      .catch(() => {
        push(
          'Could not load approved companies.',
          'error'
        );
      });
  }, []);

  const setField = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const toggleDept = (department) => {
    setForm((current) => ({
      ...current,
      departments: current.departments.includes(
        department
      )
        ? current.departments.filter(
          (item) => item !== department
        )
        : [...current.departments, department],
    }));
  };

  const parseList = (value) =>
    value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

  const selectedCompany = useMemo(
    () =>
      companies.find(
        (company) => company._id === form.company
      ),
    [companies, form.company]
  );

  const selectedJobType = JOB_TYPES.find(
    (type) => type.value === form.jobType
  );

  const selectionStages = parseList(
    form.selectionProcess
  );

  const requiredSkills = parseList(
    form.requiredSkills
  );

  const submit = async (e) => {
    e.preventDefault();

    if (!form.company) {
      push(
        'Select an approved company first.',
        'error'
      );
      return;
    }

    if (!form.title.trim()) {
      push('Enter a job title.', 'error');
      return;
    }

    if (!form.description.trim()) {
      push('Add a job description.', 'error');
      return;
    }

    if (requiredSkills.length === 0) {
      push(
        'Add at least one required skill.',
        'error'
      );
      return;
    }

    if (selectionStages.length === 0) {
      push(
        'Add at least one selection stage.',
        'error'
      );
      return;
    }

    setSaving(true);

    try {
      const payload = {
        company: form.company,
        title: form.title,
        location: form.location,
        jobType: form.jobType,
        ctc: form.ctc,
        description: form.description,
        openings: Number(form.openings),

        requiredSkills: parseList(
          form.requiredSkills
        ),

        preferredSkills: parseList(
          form.preferredSkills
        ),

        selectionProcess: parseList(
          form.selectionProcess
        ),

        applicationDeadline:
          form.applicationDeadline,

        driveDate:
          form.driveDate || undefined,

        eligibility: {
          minCgpa: Number(form.minCgpa),
          maxBacklogs: Number(form.maxBacklogs),
          departments: form.departments,

          graduationYears: parseList(
            form.graduationYears
          )
            .map((year) => Number(year))
            .filter(Boolean),

          minExperienceMonths: Number(
            form.minExperienceMonths
          ),

          requiredCertifications: parseList(
            form.requiredCertifications
          ),
        },
      };

      await api.post('/jobs', payload);

      push(
        'Drive submitted for placement officer approval.',
        'success'
      );

      navigate('/recruiter/jobs');
    } catch (err) {
      push(
        err.response?.data?.message ||
        'Could not create drive.',
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout title="Post a Placement Drive">
      <div className="mx-auto max-w-7xl">

        {/* HERO */}
        <section className="relative mb-6 overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-xl md:p-8">

          <div className="absolute -right-20 -top-32 h-80 w-80 rounded-full bg-brand-500/20 blur-3xl" />
          <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-400/20 bg-brand-500/10 px-3 py-1.5 text-[11px] font-bold text-brand-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                New Recruitment Drive
              </div>

              <h1 className="font-display text-3xl font-black tracking-tight md:text-4xl">
                Build your next
                <span className="text-brand-400">
                  {' '}candidate pipeline.
                </span>
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                Publish a structured placement opportunity with
                clear eligibility criteria, skills and selection stages.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                <p className="text-2xl font-black">
                  01
                </p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Role
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                <p className="text-2xl font-black">
                  02
                </p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Eligibility
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                <p className="text-2xl font-black">
                  03
                </p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Publish
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* APPROVAL NOTICE */}
        <div className="mb-6 flex gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            ℹ
          </div>

          <div>
            <p className="text-sm font-bold text-blue-900">
              Placement approval workflow
            </p>

            <p className="mt-1 text-xs leading-5 text-blue-700">
              Your drive will be submitted to the placement
              officer for review. Students can apply only after
              the drive has been approved.
            </p>
          </div>
        </div>

        {companies.length === 0 ? (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8 shadow-card">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-2xl">
                ⚠️
              </div>

              <div>
                <h2 className="font-display text-xl font-black text-amber-900">
                  No approved company available
                </h2>

                <p className="mt-1 max-w-2xl text-sm leading-6 text-amber-800">
                  You need at least one approved company before
                  posting a placement drive. Create or wait for
                  approval on the Company page.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <form
            onSubmit={submit}
            className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_330px]"
          >

            {/* MAIN FORM */}
            <div className="space-y-6">

              {/* SECTION 1 */}
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card md:p-7">

                <SectionHeader
                  number="01"
                  eyebrow="Opportunity"
                  title="Drive details"
                  description="Define the company, role and commercial details students will see."
                />

                <div className="mt-7 space-y-5">

                  <div>
                    <FieldLabel
                      required
                      hint="Only approved companies can publish placement drives."
                    >
                      Company
                    </FieldLabel>

                    <select
                      value={form.company}
                      onChange={(e) =>
                        setField(
                          'company',
                          e.target.value
                        )
                      }
                      required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100"
                    >
                      <option value="">
                        Select approved company
                      </option>

                      {companies.map((company) => (
                        <option
                          key={company._id}
                          value={company._id}
                        >
                          {company.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">

                    <div>
                      <FieldLabel required>
                        Job title
                      </FieldLabel>

                      <Input
                        value={form.title}
                        onChange={(e) =>
                          setField(
                            'title',
                            e.target.value
                          )
                        }
                        placeholder="e.g. Software Engineer"
                        required
                      />
                    </div>

                    <div>
                      <FieldLabel>
                        Location
                      </FieldLabel>

                      <Input
                        value={form.location}
                        onChange={(e) =>
                          setField(
                            'location',
                            e.target.value
                          )
                        }
                        placeholder="e.g. Chennai / Bengaluru / Remote"
                      />
                    </div>

                    <div>
                      <FieldLabel>
                        Job type
                      </FieldLabel>

                      <select
                        value={form.jobType}
                        onChange={(e) =>
                          setField(
                            'jobType',
                            e.target.value
                          )
                        }
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100"
                      >
                        {JOB_TYPES.map((type) => (
                          <option
                            key={type.value}
                            value={type.value}
                          >
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <FieldLabel>
                        CTC / Stipend
                      </FieldLabel>

                      <Input
                        value={form.ctc}
                        onChange={(e) =>
                          setField(
                            'ctc',
                            e.target.value
                          )
                        }
                        placeholder="e.g. 8–10 LPA"
                      />
                    </div>

                    <div>
                      <FieldLabel required>
                        Number of openings
                      </FieldLabel>

                      <Input
                        type="number"
                        min="1"
                        value={form.openings}
                        onChange={(e) =>
                          setField(
                            'openings',
                            e.target.value
                          )
                        }
                        required
                      />
                    </div>

                    <div>
                      <FieldLabel required>
                        Application deadline
                      </FieldLabel>

                      <Input
                        type="date"
                        value={
                          form.applicationDeadline
                        }
                        onChange={(e) =>
                          setField(
                            'applicationDeadline',
                            e.target.value
                          )
                        }
                        required
                      />
                    </div>

                    <div>
                      <FieldLabel
                        hint="Optional date on which the actual recruitment drive happens."
                      >
                        Drive date
                      </FieldLabel>

                      <Input
                        type="date"
                        value={form.driveDate}
                        onChange={(e) =>
                          setField(
                            'driveDate',
                            e.target.value
                          )
                        }
                      />
                    </div>

                  </div>

                  <div>
                    <FieldLabel required>
                      Role description
                    </FieldLabel>

                    <textarea
                      required
                      rows={6}
                      value={form.description}
                      onChange={(e) =>
                        setField(
                          'description',
                          e.target.value
                        )
                      }
                      placeholder="Describe the role, responsibilities, expectations and what the selected candidates will work on..."
                      className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100"
                    />

                    <p className="mt-2 text-right text-[11px] text-slate-400">
                      {form.description.length} characters
                    </p>
                  </div>

                </div>
              </section>

              {/* SECTION 2 */}
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card md:p-7">

                <SectionHeader
                  number="02"
                  eyebrow="Candidate profile"
                  title="Skills & selection"
                  description="Tell students what skills matter and how your recruitment process will work."
                />

                <div className="mt-7 space-y-5">

                  <div className="grid gap-5 md:grid-cols-2">

                    <div>
                      <FieldLabel
                        required
                        hint="Separate multiple skills with commas."
                      >
                        Required skills
                      </FieldLabel>

                      <Input
                        value={form.requiredSkills}
                        onChange={(e) =>
                          setField(
                            'requiredSkills',
                            e.target.value
                          )
                        }
                        placeholder="React, JavaScript, SQL, Git"
                        required
                      />

                      {requiredSkills.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {requiredSkills.map(
                            (skill) => (
                              <span
                                key={skill}
                                className="rounded-full bg-brand-50 px-3 py-1 text-[11px] font-bold text-brand-700"
                              >
                                {skill}
                              </span>
                            )
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <FieldLabel
                        hint="Nice-to-have skills that can improve candidate fit."
                      >
                        Preferred skills
                      </FieldLabel>

                      <Input
                        value={form.preferredSkills}
                        onChange={(e) =>
                          setField(
                            'preferredSkills',
                            e.target.value
                          )
                        }
                        placeholder="AWS, Docker, TypeScript"
                      />
                    </div>

                  </div>

                  <div>
                    <FieldLabel
                      required
                      hint="Enter stages in the exact order candidates will follow."
                    >
                      Selection process
                    </FieldLabel>

                    <Input
                      value={form.selectionProcess}
                      onChange={(e) =>
                        setField(
                          'selectionProcess',
                          e.target.value
                        )
                      }
                      placeholder="Online Test, Technical Interview, HR Interview"
                      required
                    />

                    {selectionStages.length > 0 && (
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        {selectionStages.map(
                          (stage, index) => (
                            <React.Fragment key={`${stage}-${index}`}>
                              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[9px] font-black text-white">
                                  {index + 1}
                                </span>

                                <span className="text-xs font-bold text-slate-700">
                                  {stage}
                                </span>
                              </div>

                              {index <
                                selectionStages.length -
                                1 && (
                                  <span className="text-slate-300">
                                    →
                                  </span>
                                )}
                            </React.Fragment>
                          )
                        )}
                      </div>
                    )}
                  </div>

                </div>
              </section>

              {/* SECTION 3 */}
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card md:p-7">

                <SectionHeader
                  number="03"
                  eyebrow="Eligibility"
                  title="Candidate eligibility"
                  description="Set academic and profile requirements used by the placement eligibility engine."
                />

                <div className="mt-7 space-y-6">

                  <div className="grid gap-5 sm:grid-cols-3">

                    <div>
                      <FieldLabel>
                        Minimum CGPA
                      </FieldLabel>

                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={form.minCgpa}
                        onChange={(e) =>
                          setField(
                            'minCgpa',
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div>
                      <FieldLabel>
                        Maximum backlogs
                      </FieldLabel>

                      <Input
                        type="number"
                        min="0"
                        value={form.maxBacklogs}
                        onChange={(e) =>
                          setField(
                            'maxBacklogs',
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div>
                      <FieldLabel>
                        Minimum experience
                      </FieldLabel>

                      <Input
                        type="number"
                        min="0"
                        value={
                          form.minExperienceMonths
                        }
                        onChange={(e) =>
                          setField(
                            'minExperienceMonths',
                            e.target.value
                          )
                        }
                      />

                      <p className="mt-1 text-[11px] text-slate-400">
                        Months
                      </p>
                    </div>

                  </div>

                  <div>
                    <FieldLabel hint="Leave all unselected if students from every department are eligible.">
                      Eligible departments
                    </FieldLabel>

                    <div className="flex flex-wrap gap-2">
                      {DEPARTMENTS.map(
                        (department) => {
                          const selected =
                            form.departments.includes(
                              department
                            );

                          return (
                            <button
                              type="button"
                              key={department}
                              onClick={() =>
                                toggleDept(
                                  department
                                )
                              }
                              className={`rounded-xl border px-4 py-2.5 text-xs font-bold transition ${selected
                                  ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm'
                                  : 'border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:bg-brand-50/50'
                                }`}
                            >
                              {selected
                                ? '✓ '
                                : ''}
                              {department}
                            </button>
                          );
                        }
                      )}
                    </div>

                    <p className="mt-2 text-[11px] text-slate-400">
                      {form.departments.length === 0
                        ? 'All departments eligible'
                        : `${form.departments.length} department${form.departments.length > 1 ? 's' : ''} selected`}
                    </p>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">

                    <div>
                      <FieldLabel
                        hint="Example: 2027, 2028"
                      >
                        Graduation years
                      </FieldLabel>

                      <Input
                        value={
                          form.graduationYears
                        }
                        onChange={(e) =>
                          setField(
                            'graduationYears',
                            e.target.value
                          )
                        }
                        placeholder="2027, 2028"
                      />
                    </div>

                    <div>
                      <FieldLabel
                        hint="Separate multiple certifications with commas."
                      >
                        Required certifications
                      </FieldLabel>

                      <Input
                        value={
                          form.requiredCertifications
                        }
                        onChange={(e) =>
                          setField(
                            'requiredCertifications',
                            e.target.value
                          )
                        }
                        placeholder="AWS Cloud Practitioner, Java Certification"
                      />
                    </div>

                  </div>

                </div>
              </section>

              {/* SUBMIT */}
              <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-card md:p-6">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <div>
                    <p className="text-sm font-black text-slate-900">
                      Ready to submit?
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Your drive will be reviewed by the placement
                      officer before becoming visible to students.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-brand-500 px-6 py-3 text-sm font-black text-white shadow-lg shadow-brand-500/20 transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving
                      ? 'Submitting…'
                      : 'Submit for Approval →'}
                  </button>

                </div>
              </section>

            </div>

            {/* SIDE PREVIEW */}
            <aside className="lg:sticky lg:top-6 lg:self-start">

              <div className="space-y-5">

                {/* PREVIEW */}
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-card">

                  <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-5 text-white">

                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold text-slate-300">
                        LIVE PREVIEW
                      </span>

                      <span className="text-[10px] font-bold text-emerald-300">
                        ● DRAFT
                      </span>
                    </div>

                    <div className="mt-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-xl font-black">
                      {selectedCompany?.name
                        ?.charAt(0)
                        ?.toUpperCase() || 'C'}
                    </div>

                    <p className="mt-4 text-xs font-bold text-indigo-300">
                      {selectedCompany?.name ||
                        'Company name'}
                    </p>

                    <h3 className="mt-1 font-display text-xl font-black">
                      {form.title ||
                        'Software Engineer'}
                    </h3>

                    <p className="mt-2 text-xs text-slate-400">
                      {form.location ||
                        'Location not specified'}
                    </p>

                  </div>

                  <div className="p-5">

                    <div className="grid grid-cols-2 gap-3">

                      <div className="rounded-2xl bg-slate-50 p-3">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                          Type
                        </p>

                        <p className="mt-1 text-xs font-black text-slate-800">
                          {selectedJobType?.label ||
                            'Full-time'}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-3">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                          Package
                        </p>

                        <p className="mt-1 text-xs font-black text-slate-800">
                          {form.ctc || 'Not specified'}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-3">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                          Openings
                        </p>

                        <p className="mt-1 text-xs font-black text-slate-800">
                          {form.openings || 0}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-3">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                          Min CGPA
                        </p>

                        <p className="mt-1 text-xs font-black text-slate-800">
                          {form.minCgpa}
                        </p>
                      </div>

                    </div>

                    <div className="mt-5">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Required skills
                      </p>

                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {requiredSkills.length > 0 ? (
                          requiredSkills
                            .slice(0, 6)
                            .map((skill) => (
                              <span
                                key={skill}
                                className="rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-bold text-brand-700"
                              >
                                {skill}
                              </span>
                            ))
                        ) : (
                          <span className="text-xs text-slate-400">
                            Skills will appear here
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 border-t border-slate-100 pt-5">

                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Eligibility
                      </p>

                      <div className="mt-3 space-y-2">

                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">
                            Minimum CGPA
                          </span>
                          <strong className="text-slate-800">
                            {form.minCgpa}
                          </strong>
                        </div>

                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">
                            Max backlogs
                          </span>
                          <strong className="text-slate-800">
                            {form.maxBacklogs}
                          </strong>
                        </div>

                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">
                            Departments
                          </span>
                          <strong className="text-slate-800">
                            {form.departments.length === 0
                              ? 'All'
                              : form.departments.join(', ')}
                          </strong>
                        </div>

                      </div>
                    </div>

                  </div>
                </div>

                {/* CHECKLIST */}
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-card">

                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-sm font-black text-slate-900">
                      Publishing checklist
                    </h3>

                    <span className="text-xs font-black text-brand-600">
                      {
                        [
                          !!form.company,
                          !!form.title,
                          !!form.description,
                          requiredSkills.length > 0,
                          !!form.applicationDeadline,
                          selectionStages.length > 0,
                        ].filter(Boolean).length
                      }/6
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">

                    {[
                      [
                        !!form.company,
                        'Approved company selected',
                      ],
                      [
                        !!form.title,
                        'Job title added',
                      ],
                      [
                        !!form.description,
                        'Role description added',
                      ],
                      [
                        requiredSkills.length > 0,
                        'Required skills added',
                      ],
                      [
                        !!form.applicationDeadline,
                        'Application deadline set',
                      ],
                      [
                        selectionStages.length > 0,
                        'Selection process defined',
                      ],
                    ].map(
                      ([complete, label]) => (
                        <div
                          key={label}
                          className="flex items-center gap-3"
                        >
                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-black ${complete
                                ? 'bg-emerald-100 text-emerald-600'
                                : 'bg-slate-100 text-slate-400'
                              }`}
                          >
                            {complete
                              ? '✓'
                              : '○'}
                          </span>

                          <span
                            className={`text-xs font-semibold ${complete
                                ? 'text-slate-700'
                                : 'text-slate-400'
                              }`}
                          >
                            {label}
                          </span>
                        </div>
                      )
                    )}

                  </div>
                </div>

                {/* TIP */}
                <div className="rounded-3xl border border-indigo-100 bg-indigo-50 p-5">

                  <div className="flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100">
                      💡
                    </div>

                    <div>
                      <p className="text-xs font-black text-indigo-900">
                        Recruiter tip
                      </p>

                      <p className="mt-1 text-xs leading-5 text-indigo-700">
                        Clear skill requirements and a well-defined
                        selection process help students understand
                        whether the role matches their profile.
                      </p>
                    </div>
                  </div>

                </div>

              </div>
            </aside>

          </form>
        )}
      </div>
    </Layout>
  );
}