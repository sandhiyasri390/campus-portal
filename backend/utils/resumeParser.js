/**
 * Rule-based resume "analysis" fallback (works without any AI API key).
 * If AI_API_KEY is set, controllers may optionally call an LLM instead;
 * this module is the guaranteed deterministic fallback.
 */
const KNOWN_SKILLS = [
  'javascript', 'typescript', 'python', 'java', 'c++', 'c', 'react', 'node.js', 'node',
  'express', 'mongodb', 'sql', 'mysql', 'postgresql', 'aws', 'docker', 'kubernetes',
  'git', 'html', 'css', 'redux', 'graphql', 'next.js', 'django', 'flask', 'spring',
  'tailwind', 'vue', 'angular', 'firebase', 'linux', 'rest api', 'machine learning',
];

function extractEmail(text) {
  const m = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return m ? m[0] : null;
}

function extractPhone(text) {
  const m = text.match(/(\+?\d{1,3}[-\s]?)?\d{10}/);
  return m ? m[0] : null;
}

function extractSkills(text) {
  const lower = text.toLowerCase();
  return KNOWN_SKILLS.filter((skill) => lower.includes(skill)).map((s) =>
    s.replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

function extractSectionLines(text, keywords) {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const lower = keywords.map((k) => k.toLowerCase());
  let capturing = false;
  const out = [];
  for (const line of lines) {
    const lc = line.toLowerCase();
    if (lower.some((k) => lc === k || lc.startsWith(k))) {
      capturing = true;
      continue;
    }
    if (capturing) {
      if (/^[a-z\s]{2,30}:?$/i.test(line) && line.length < 30 && line.toUpperCase() === line) {
        capturing = false;
        continue;
      }
      out.push(line);
      if (out.length >= 8) break;
    }
  }
  return out;
}

/**
 * Given plain text (already extracted from a PDF, or manually pasted by the
 * student when PDF parsing isn't available), produce a structured analysis.
 */
function analyzeResumeText(text, fallbackName) {
  const safeText = text || '';
  return {
    name: fallbackName || null,
    email: extractEmail(safeText),
    phone: extractPhone(safeText),
    skills: extractSkills(safeText),
    educationLines: extractSectionLines(safeText, ['education', 'academic background']),
    projectLines: extractSectionLines(safeText, ['projects', 'project experience']),
    internshipLines: extractSectionLines(safeText, ['internship', 'experience', 'work experience']),
    certificationLines: extractSectionLines(safeText, ['certifications', 'certificates']),
  };
}

module.exports = { analyzeResumeText, KNOWN_SKILLS };
