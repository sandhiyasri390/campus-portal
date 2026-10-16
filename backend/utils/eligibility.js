/**
 * Deterministic, rule-based eligibility engine.
 * Returns { eligible: boolean, reasons: string[] }
 * reasons is empty when eligible; otherwise lists every failed criterion.
 */
function checkEligibility(job, profile) {
  const reasons = [];
  const elig = job?.eligibility || {};
  const p = profile || {};

  // 1. Deadline check
  if (job?.applicationDeadline && new Date() > new Date(job.applicationDeadline)) {
    reasons.push('The application deadline for this drive has expired.');
  }

  // 2. CGPA check
  if (elig.minCgpa && (p.cgpa === undefined || p.cgpa === null)) {
    reasons.push('Your CGPA is not set in your profile.');
  } else if (elig.minCgpa && p.cgpa < elig.minCgpa) {
    reasons.push(`CGPA requirement is ${elig.minCgpa} but your CGPA is ${p.cgpa}.`);
  }

  // 3. Backlogs check
  if (elig.maxBacklogs !== undefined && elig.maxBacklogs !== null) {
    const backlogs = p.backlogs || 0;
    if (backlogs > elig.maxBacklogs) {
      reasons.push(
        elig.maxBacklogs === 0
          ? `This drive requires no active backlogs, but you have ${backlogs}.`
          : `Maximum allowed backlogs is ${elig.maxBacklogs}, but you have ${backlogs}.`
      );
    }
  }

  // 4. Department check
  if (elig.departments && elig.departments.length > 0) {
    if (!p.department || !elig.departments.includes(p.department)) {
      reasons.push(`This drive is open to: ${elig.departments.join(', ')}. Your department is ${p.department || 'not set'}.`);
    }
  }

  // 5. Graduation year check
  if (elig.graduationYears && elig.graduationYears.length > 0) {
    if (!p.graduationYear || !elig.graduationYears.includes(p.graduationYear)) {
      reasons.push(`This drive is open to graduation year(s): ${elig.graduationYears.join(', ')}. Yours is ${p.graduationYear || 'not set'}.`);
    }
  }

  // 6. Required skills check (when strictSkills or requireAllSkills is set)
  if ((elig.strictSkills || elig.requireAllSkills) && job?.requiredSkills && job.requiredSkills.length > 0) {
    const studentSkills = new Set([
      ...(p.skills || []).map((s) => String(s).trim().toLowerCase()),
      ...(p.programmingLanguages || []).map((s) => String(s).trim().toLowerCase()),
    ]);
    const missing = job.requiredSkills.filter(
      (s) => !studentSkills.has(String(s).trim().toLowerCase())
    );
    if (missing.length > 0) {
      reasons.push(`Missing required skill(s): ${missing.join(', ')}.`);
    }
  }

  // 7. Required certifications check
  if (elig.requiredCertifications && elig.requiredCertifications.length > 0) {
    const have = new Set((p.certifications || []).map((c) => String(c).trim().toLowerCase()));
    const missing = elig.requiredCertifications.filter((c) => !have.has(String(c).trim().toLowerCase()));
    if (missing.length > 0) {
      reasons.push(`Missing required certification(s): ${missing.join(', ')}.`);
    }
  }

  // 8. Experience check
  if (elig.minExperienceMonths && elig.minExperienceMonths > 0) {
    const internshipMonths = (p.internships || []).length * 3;
    if (internshipMonths < elig.minExperienceMonths) {
      reasons.push(`This drive prefers at least ${elig.minExperienceMonths} months of experience/internship exposure.`);
    }
  }

  return { eligible: reasons.length === 0, reasons };
}

module.exports = { checkEligibility };

