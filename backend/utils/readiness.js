/**
 * Placement Readiness Score - measures preparation, not selection probability.
 */
function calculateReadiness(profile, resumeAnalysis) {
  const completion = profile.getProfileCompletion();
  const profileScore = completion.percentage;

  let resumeScore = 0;
  if (profile.resume && profile.resume.filePath) {
    resumeScore += 50;
    if (resumeAnalysis && resumeAnalysis.extracted) {
      const e = resumeAnalysis.extracted;
      if (e.skills && e.skills.length > 0) resumeScore += 20;
      if (e.projectLines && e.projectLines.length > 0) resumeScore += 15;
      if (e.certificationLines && e.certificationLines.length > 0) resumeScore += 15;
    } else {
      resumeScore += 20;
    }
  }
  resumeScore = Math.min(100, resumeScore);

  const skillCount = (profile.skills || []).length + (profile.programmingLanguages || []).length;
  const technicalScore = Math.min(100, skillCount * 12);

  const projectScore = Math.min(100, (profile.projects || []).length * 30 + (profile.internships || []).length * 20);

  const prep = profile.preparation || {};
  const interviewPrepScore = Math.min(
    100,
    (prep.aptitudePracticeCount || 0) * 8 +
      (prep.mockInterviewCount || 0) * 15 +
      (prep.codingPracticeCount || 0) * 6 +
      (prep.communicationScore || 0) * 0.3
  );

  const overall = Math.round(
    profileScore * 0.2 +
      resumeScore * 0.2 +
      technicalScore * 0.25 +
      projectScore * 0.2 +
      interviewPrepScore * 0.15
  );

  const recommendations = [];
  if (profileScore < 90) recommendations.push('Complete the remaining fields in your profile.');
  if (resumeScore < 70) recommendations.push('Upload or update your resume with a complete skills and project list.');
  if (technicalScore < 60) recommendations.push('Add more technical skills and programming languages to your profile.');
  if (projectScore < 60) recommendations.push('Add more projects or internships to strengthen your practical experience.');
  if (interviewPrepScore < 60) recommendations.push('Practice more aptitude questions and attempt mock interviews.');

  return {
    overall,
    breakdown: {
      profile: profileScore,
      resume: resumeScore,
      technicalSkills: technicalScore,
      projects: projectScore,
      interviewPreparation: interviewPrepScore,
    },
    recommendations,
  };
}

module.exports = { calculateReadiness };
