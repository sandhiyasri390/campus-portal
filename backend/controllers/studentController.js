const StudentProfile = require('../models/StudentProfile');
const ResumeAnalysis = require('../models/ResumeAnalysis');
const PreparationTask = require('../models/PreparationTask');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { calculateReadiness } = require('../utils/readiness');
const { generateRoadmap } = require('../utils/roadmap');
const { analyzeResumeText } = require('../utils/resumeParser');
const path = require('path');

exports.getMyProfile = async (req, res) => {
  const profile = await StudentProfile.findOne({ user: req.user.id });
  if (!profile) return res.status(404).json({ message: 'Profile not found' });
  const completion = profile.getProfileCompletion();
  res.json({ profile, completion });
};

exports.updateMyProfile = async (req, res) => {
  const allowedFields = [
    'fullName', 'registerNumber', 'collegeEmail', 'personalEmail', 'phone',
    'department', 'degree', 'batch', 'graduationYear', 'cgpa', 'backlogs',
    'skills', 'programmingLanguages', 'certifications', 'projects', 'internships',
    'githubUrl', 'linkedinUrl', 'portfolioUrl', 'targetRole', 'preparation',
  ];
  const updates = {};
  allowedFields.forEach((f) => {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  });

  const profile = await StudentProfile.findOneAndUpdate(
    { user: req.user.id },
    { $set: updates },
    { new: true, upsert: true, runValidators: true }
  );
  const completion = profile.getProfileCompletion();
  res.json({ profile, completion });
};

exports.getStudentById = async (req, res) => {
  const profile = await StudentProfile.findOne({ user: req.params.id }).populate('user', 'name email role');
  if (!profile) return res.status(404).json({ message: 'Student not found' });
  res.json({ profile });
};

exports.listStudents = async (req, res) => {
  const { department, batch, minCgpa, maxBacklogs, verification, search } = req.query;
  const filter = {};
  if (department) filter.department = department;
  if (batch) filter.batch = batch;
  if (minCgpa) filter.cgpa = { $gte: Number(minCgpa) };
  if (maxBacklogs !== undefined) filter.backlogs = { $lte: Number(maxBacklogs) };
  if (verification) filter.verificationStatus = verification;
  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { registerNumber: { $regex: search, $options: 'i' } },
      { skills: { $regex: search, $options: 'i' } },
    ];
  }
  const students = await StudentProfile.find(filter).populate('user', 'name email').sort('-createdAt');
  res.json({ count: students.length, students });
};

exports.verifyStudent = async (req, res) => {
  const { status } = req.body; // 'verified' | 'pending'
  const profile = await StudentProfile.findOneAndUpdate(
    { user: req.params.id },
    { verificationStatus: status },
    { new: true }
  );
  if (!profile) return res.status(404).json({ message: 'Student not found' });
  res.json({ profile });
};

exports.uploadResume = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No resume file uploaded' });

  const profile = await StudentProfile.findOneAndUpdate(
    { user: req.user.id },
    {
      resume: {
        fileName: req.file.originalname,
        filePath: `/uploads/resumes/${req.file.filename}`,
        uploadedAt: new Date(),
      },
    },
    { new: true, upsert: true }
  );

  res.json({ message: 'Resume uploaded successfully', resume: profile.resume });
};

// Fallback path: student pastes resume text manually (or we'd otherwise parse
// the PDF) and we run the deterministic rule-based analyzer.
exports.analyzeResume = async (req, res) => {
  const { resumeText } = req.body;
  if (!resumeText || resumeText.trim().length < 20) {
    return res.status(400).json({ message: 'Please provide resume text (at least 20 characters) to analyze' });
  }
  const profile = await StudentProfile.findOne({ user: req.user.id });
  const extracted = analyzeResumeText(resumeText, profile ? profile.fullName : undefined);

  const analysis = await ResumeAnalysis.findOneAndUpdate(
    { student: req.user.id },
    { extracted, rawTextLength: resumeText.length, method: 'rule_based', analyzedAt: new Date() },
    { new: true, upsert: true }
  );

  // Merge extracted skills into profile skills automatically (deduped)
  if (profile && extracted.skills.length) {
    const merged = [...new Set([...(profile.skills || []), ...extracted.skills])];
    profile.skills = merged;
    await profile.save();
  }

  res.json({ analysis });
};

exports.getResumeAnalysis = async (req, res) => {
  const analysis = await ResumeAnalysis.findOne({ student: req.user.id });
  res.json({ analysis: analysis || null });
};

exports.getReadiness = async (req, res) => {
  const profile = await StudentProfile.findOne({ user: req.user.id });
  if (!profile) return res.status(404).json({ message: 'Profile not found' });
  const analysis = await ResumeAnalysis.findOne({ student: req.user.id });
  const readiness = calculateReadiness(profile, analysis);
  res.json({ readiness });
};

exports.getRoadmap = async (req, res) => {
  const profile = await StudentProfile.findOne({ user: req.user.id });
  if (!profile) return res.status(404).json({ message: 'Profile not found' });

  // Derive missing skills from currently open, eligible-ish jobs
  const jobs = await Job.find({ status: 'approved' }).limit(20);
  const studentSkills = new Set(
    [...(profile.skills || []), ...(profile.programmingLanguages || [])].map((s) => s.toLowerCase())
  );
  const missingSet = new Set();
  jobs.forEach((job) => {
    (job.requiredSkills || []).forEach((s) => {
      if (!studentSkills.has(s.toLowerCase())) missingSet.add(s);
    });
  });

  const weeks = generateRoadmap(profile.targetRole, [...missingSet]);

  const existingTasks = await PreparationTask.find({ student: req.user.id });
  if (existingTasks.length === 0) {
    const toCreate = [];
    weeks.forEach((w) => {
      w.topics.forEach((topic) => {
        toCreate.push({ student: req.user.id, week: w.week, title: topic, category: w.category, targetRole: profile.targetRole });
      });
    });
    await PreparationTask.insertMany(toCreate);
  }

  const tasks = await PreparationTask.find({ student: req.user.id }).sort('week');
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const progress = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  res.json({ weeks, tasks, progress });
};

exports.toggleTask = async (req, res) => {
  const task = await PreparationTask.findOne({ _id: req.params.taskId, student: req.user.id });
  if (!task) return res.status(404).json({ message: 'Task not found' });
  task.completed = !task.completed;
  task.completedAt = task.completed ? new Date() : null;
  await task.save();
  res.json({ task });
};

exports.getSkillDemand = async (req, res) => {
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
    .slice(0, 10)
    .map(([skill, count]) => ({ skill, count }));
  res.json({ topSkills });
};
