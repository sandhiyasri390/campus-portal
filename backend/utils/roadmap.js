/**
 * Generates a personalized 4-week preparation roadmap based on skill gaps
 * derived from the student's target role / recent job matches.
 */
const TOPIC_LIBRARY = {
  foundations: ['Arrays & Strings', 'Data Structures Basics', 'Time & Space Complexity'],
  dsa: ['Recursion & Backtracking', 'Trees & Graphs', 'Dynamic Programming'],
  frontend: ['JavaScript ES6+', 'React Fundamentals', 'State Management'],
  backend: ['Node.js & Express', 'REST API Design', 'Authentication (JWT)'],
  database: ['SQL Fundamentals', 'MongoDB & Mongoose', 'Database Indexing'],
  cloud: ['AWS Basics (EC2, S3)', 'CI/CD Concepts', 'Docker Fundamentals'],
  aptitude: ['Quantitative Aptitude', 'Logical Reasoning', 'Verbal Ability'],
  interview: ['Mock Technical Interview', 'HR Interview Prep', 'Resume Walkthrough Practice'],
};

function pickTopicsForSkills(missingSkills) {
  const skills = missingSkills.map((s) => s.toLowerCase());
  const picks = [];
  if (skills.some((s) => ['react', 'javascript', 'html', 'css', 'vue', 'angular'].includes(s))) {
    picks.push(...TOPIC_LIBRARY.frontend);
  }
  if (skills.some((s) => ['node.js', 'node', 'express', 'django', 'spring'].includes(s))) {
    picks.push(...TOPIC_LIBRARY.backend);
  }
  if (skills.some((s) => ['mongodb', 'sql', 'mysql', 'postgresql'].includes(s))) {
    picks.push(...TOPIC_LIBRARY.database);
  }
  if (skills.some((s) => ['aws', 'docker', 'kubernetes', 'azure', 'gcp'].includes(s))) {
    picks.push(...TOPIC_LIBRARY.cloud);
  }
  return picks;
}

function generateRoadmap(targetRole, missingSkills = []) {
  const skillTopics = pickTopicsForSkills(missingSkills);

  const weeks = [
    { week: 1, category: 'Foundations', topics: TOPIC_LIBRARY.foundations },
    { week: 2, category: 'Core / DSA', topics: TOPIC_LIBRARY.dsa },
    {
      week: 3,
      category: 'Role-specific Skills',
      topics: skillTopics.length > 0 ? skillTopics.slice(0, 3) : [...TOPIC_LIBRARY.frontend].slice(0, 3),
    },
    { week: 4, category: 'Interview Readiness', topics: [...TOPIC_LIBRARY.aptitude.slice(0, 2), ...TOPIC_LIBRARY.interview.slice(0, 1)] },
  ];

  return weeks;
}

module.exports = { generateRoadmap };
