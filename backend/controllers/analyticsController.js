const StudentProfile = require('../models/StudentProfile');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');
const User = require('../models/User');

exports.getDashboardStats = async (req, res) => {
  const [
    totalStudents, verifiedStudents, activeCompanies, totalDrives,
    totalApplications, shortlisted, selected,
  ] = await Promise.all([
    StudentProfile.countDocuments({}),
    StudentProfile.countDocuments({ verificationStatus: 'verified' }),
    Company.countDocuments({ status: 'approved' }),
    Job.countDocuments({ status: 'approved' }),
    Application.countDocuments({}),
    Application.countDocuments({ status: { $in: ['shortlisted', 'assessment', 'technical_interview', 'hr_interview'] } }),
    Application.countDocuments({ status: 'selected' }),
  ]);

  const placedStudentIds = await Application.distinct('student', { status: 'selected' });
  const placedStudents = placedStudentIds.length;
  const unplacedStudents = Math.max(0, totalStudents - placedStudents);

  res.json({
    totalStudents,
    registeredStudents: totalStudents,
    verifiedStudents,
    activeCompanies,
    placementDrives: totalDrives,
    applications: totalApplications,
    shortlistedStudents: shortlisted,
    selectedStudents: selected,
    placedStudents,
    unplacedStudents,
  });
};

exports.getSkillAnalytics = async (req, res) => {
  const jobs = await Job.find({ status: 'approved' });
  const counts = {};
  jobs.forEach((job) => {
    [...(job.requiredSkills || []), ...(job.preferredSkills || [])].forEach((skill) => {
      const key = skill.trim();
      if (!key) return;
      counts[key] = (counts[key] || 0) + 1;
    });
  });
  const topSkills = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([skill, count]) => ({ skill, count }));
  res.json({ topSkills });
};

exports.getPlacementAnalytics = async (req, res) => {
  const applications = await Application.find({}).populate('job', 'title company').populate('company', 'name');
  const totalApplications = applications.length;
  const shortlistedCount = applications.filter((a) =>
    ['shortlisted', 'assessment', 'technical_interview', 'hr_interview', 'selected'].includes(a.status)
  ).length;
  const selectedCount = applications.filter((a) => a.status === 'selected').length;

  const eligibleStudents = await StudentProfile.countDocuments({});
  const placedStudentIds = await Application.distinct('student', { status: 'selected' });

  const placementRate = eligibleStudents ? Math.round((placedStudentIds.length / eligibleStudents) * 100) : 0;
  const applicationConversion = totalApplications ? Math.round((shortlistedCount / totalApplications) * 100) : 0;
  const selectionRate = totalApplications ? Math.round((selectedCount / totalApplications) * 100) : 0;

  // Department-wise placements
  const students = await StudentProfile.find({});
  const deptMap = {};
  for (const s of students) {
    const dept = s.department || 'Unspecified';
    if (!deptMap[dept]) deptMap[dept] = { department: dept, total: 0, placed: 0 };
    deptMap[dept].total += 1;
  }
  const placedSet = new Set(placedStudentIds.map(String));
  for (const s of students) {
    const dept = s.department || 'Unspecified';
    if (placedSet.has(String(s.user))) deptMap[dept].placed += 1;
  }
  const departmentStats = Object.values(deptMap);

  // Company-wise selections (include companies with zero selections)
  const companyMap = {};
  // Count selected applications per company
  applications.forEach((a) => {
    if (a.status !== 'selected') return;
    const name = a.company ? a.company.name : 'Unknown';
    companyMap[name] = (companyMap[name] || 0) + 1;
  });
  // Ensure all approved companies are represented
  const allCompanies = await Company.find({ status: 'approved' }).select('name');
  allCompanies.forEach((comp) => {
    if (!companyMap.hasOwnProperty(comp.name)) {
      companyMap[comp.name] = 0;
    }
  });
  const companyStats = Object.entries(companyMap).map(([company, selections]) => ({ company, selections }));

  // Job-role distribution (applications by job title)
  const roleMap = {};
  applications.forEach((a) => {
    const title = a.job ? a.job.title : 'Unknown';
    roleMap[title] = (roleMap[title] || 0) + 1;
  });
  const roleStats = Object.entries(roleMap).map(([role, applications]) => ({ role, applications }));

  // Applications by drive
  const jobs = await Job.find({ status: 'approved' }).select('title');
  const applicationsByDrive = await Promise.all(
    jobs.map(async (job) => ({
      drive: job.title,
      applications: await Application.countDocuments({ job: job._id }),
    }))
  );

  // Monthly recruitment activity (applications per month, last 6 months)
  const monthlyMap = {};
  applications.forEach((a) => {
    const d = new Date(a.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthlyMap[key] = (monthlyMap[key] || 0) + 1;
  });
  const monthlyActivity = Object.entries(monthlyMap)
    .sort((a, b) => (a[0] > b[0] ? 1 : -1))
    .slice(-6)
    .map(([month, count]) => ({ month, applications: count }));

  res.json({
    note: 'These figures reflect current/historical data and are not a guarantee of future placement outcomes.',
    placementRate,
    applicationConversion,
    selectionRate,
    departmentStats,
    companyStats,
    roleStats,
    applicationsByDrive,
    monthlyActivity,
  });
};
