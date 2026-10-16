const { checkEligibility } = require('./eligibility');

function normalizeList(arr) {
  return (arr || []).map((s) => String(s).trim().toLowerCase()).filter(Boolean);
}

/**
 * Deterministic rule-based match score (0-100).
 * Weights: eligibility gate (must pass base checks to score well),
 * required skills (50%), preferred skills (20%), CGPA headroom (15%),
 * certifications (10%), experience (5%).
 * This is a matching/recommendation score only — never a selection guarantee.
 */
function calculateMatchScore(job, profile) {
  const { eligible, reasons } = checkEligibility(job, profile);

  const studentSkills = new Set([
    ...normalizeList(profile.skills),
    ...normalizeList(profile.programmingLanguages),
  ]);

  const required = normalizeList(job.requiredSkills);
  const preferred = normalizeList(job.preferredSkills);

  const matchedRequired = required.filter((s) => studentSkills.has(s));
  const matchedPreferred = preferred.filter((s) => studentSkills.has(s));
  const missingRequired = required.filter((s) => !studentSkills.has(s));
  const missingPreferred = preferred.filter((s) => !studentSkills.has(s));

  const requiredScore = required.length ? (matchedRequired.length / required.length) * 50 : 50;
  const preferredScore = preferred.length ? (matchedPreferred.length / preferred.length) * 20 : 20;

  let cgpaScore = 15;
  if (job.eligibility && job.eligibility.minCgpa) {
    if (profile.cgpa >= job.eligibility.minCgpa) {
      const headroom = Math.min((profile.cgpa - job.eligibility.minCgpa) / 2.5, 1);
      cgpaScore = 10 + headroom * 5;
    } else {
      cgpaScore = 0;
    }
  }

  const requiredCerts = normalizeList(job.eligibility ? job.eligibility.requiredCertifications : []);
  const haveCerts = normalizeList(profile.certifications);
  const certScore = requiredCerts.length
    ? (requiredCerts.filter((c) => haveCerts.includes(c)).length / requiredCerts.length) * 10
    : 10;

  const expScore = (profile.internships && profile.internships.length > 0) ? 5 : 2;

  let score = requiredScore + preferredScore + cgpaScore + certScore + expScore;
  if (!eligible) score = Math.min(score, 55); // not eligible caps the score, still informative

  score = Math.round(Math.max(0, Math.min(100, score)));

  return {
    score,
    eligible,
    eligibilityReasons: reasons,
    matchedSkills: [...new Set([...matchedRequired, ...matchedPreferred])],
    missingSkills: missingRequired,
    recommendedSkills: missingPreferred,
  };
}

module.exports = { calculateMatchScore };
