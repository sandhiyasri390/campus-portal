const Job = require('../models/Job');
const Company = require('../models/Company');
const StudentProfile = require('../models/StudentProfile');
const User = require('../models/User');
const { calculateMatchScore } = require('../utils/matching');
const { checkEligibility } = require('../utils/eligibility');
const { notifyMany } = require('../utils/notifyService');

exports.createJob = async (req, res) => {
  const company = await Company.findById(req.body.company);
  if (!company) return res.status(404).json({ message: 'Company not found' });
  if (company.status !== 'approved') {
    return res.status(400).json({ message: 'Company must be approved before posting jobs' });
  }
  if (String(company.createdBy) !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'You can only post jobs for your own company' });
  }

  const job = await Job.create({ ...req.body, postedBy: req.user.id, status: 'pending_approval' });
  res.status(201).json({ job });
};

exports.updateJob = async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ message: 'Job not found' });
  if (String(job.postedBy) !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized to edit this job' });
  }
  const editable = [
    'title', 'location', 'jobType', 'ctc', 'description', 'requiredSkills', 'preferredSkills',
    'selectionProcess', 'openings', 'eligibility', 'applicationDeadline', 'driveDate',
  ];
  editable.forEach((f) => {
    if (req.body[f] !== undefined) job[f] = req.body[f];
  });
  // Editing a job sends it back for re-approval to keep drives trustworthy
  if (job.status === 'approved') job.status = 'pending_approval';
  await job.save();
  res.json({ job });
};

exports.closeJob = async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ message: 'Job not found' });
  if (String(job.postedBy) !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }
  job.status = 'closed';
  await job.save();
  res.json({ job });
};

exports.deleteJob = async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ message: 'Job not found' });
  if (String(job.postedBy) !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }
  await job.deleteOne();
  res.json({ message: 'Job deleted' });
};

exports.approveJob = async (req, res) => {
  const job = await Job.findByIdAndUpdate(
    req.params.id,
    { status: 'approved', reviewedBy: req.user.id, reviewedAt: new Date() },
    { new: true }
  ).populate('company');
  if (!job) return res.status(404).json({ message: 'Job not found' });

  // Notify eligible students that a new drive is open
  const students = await StudentProfile.find({});
  const eligibleUserIds = students
    .filter((p) => checkEligibility(job, p).eligible)
    .map((p) => p.user);
  if (eligibleUserIds.length) {
    await notifyMany(eligibleUserIds, {
      title: 'New placement drive available',
      message: `${job.company.name} posted "${job.title}" — you're eligible to apply.`,
      type: 'job_posted',
      relatedJob: job._id,
    });
  }
  res.json({ job });
};

exports.rejectJob = async (req, res) => {
  const job = await Job.findByIdAndUpdate(
    req.params.id,
    { status: 'rejected', reviewedBy: req.user.id, reviewedAt: new Date(), rejectionReason: req.body.reason || '' },
    { new: true }
  );
  if (!job) return res.status(404).json({ message: 'Job not found' });
  res.json({ job });
};

exports.listJobs = async (req, res) => {
  const { status, company, search } = req.query;
  const filter = {};

  if (req.user.role === 'student') {
    filter.status = 'approved';
  } else if (req.user.role === 'recruiter') {
    filter.postedBy = req.user.id;
    if (status) filter.status = status;
  } else {
    if (status) filter.status = status;
  }
  if (company) filter.company = company;
  if (search) filter.title = { $regex: search, $options: 'i' };

  const jobs = await Job.find(filter).populate('company', 'name industry location status').sort('-createdAt');

  if (req.user.role === 'student') {
    const profile = await StudentProfile.findOne({ user: req.user.id });
    const enriched = jobs.map((job) => {
      const obj = job.toObject();
      if (profile) {
        const m = calculateMatchScore(job, profile);
        obj.matchScore = m.score;
        obj.eligible = m.eligible;
        obj.eligibilityReasons = m.eligibilityReasons;
        obj.matchedSkills = m.matchedSkills;
        obj.missingSkills = m.missingSkills;
        obj.recommendedSkills = m.recommendedSkills;
      }
      return obj;
    });
    return res.json({ count: enriched.length, jobs: enriched });
  }

  res.json({ count: jobs.length, jobs });
};

exports.getJobById = async (req, res) => {
  const job = await Job.findById(req.params.id).populate('company').populate('postedBy', 'name email');
  if (!job) return res.status(404).json({ message: 'Job not found' });

  const obj = job.toObject();
  if (req.user.role === 'student') {
    const profile = await StudentProfile.findOne({ user: req.user.id });
    if (profile) {
      const m = calculateMatchScore(job, profile);
      obj.matchScore = m.score;
      obj.eligible = m.eligible;
      obj.eligibilityReasons = m.eligibilityReasons;
      obj.matchedSkills = m.matchedSkills;
      obj.missingSkills = m.missingSkills;
      obj.recommendedSkills = m.recommendedSkills;
    }
  }
  res.json({ job: obj });
};

exports.getEligibleStudentsForJob = async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ message: 'Job not found' });
  if (String(job.postedBy) !== req.user.id && !['admin', 'officer'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  const { minCgpa, department, minMatch, search, sortBy } = req.query;
  let students = await StudentProfile.find({}).populate('user', 'name email');

  let results = students.map((p) => {
    const m = calculateMatchScore(job, p);
    return { profile: p, ...m };
  });

  results = results.filter((r) => r.eligible);
  if (minCgpa) results = results.filter((r) => r.profile.cgpa >= Number(minCgpa));
  if (department) results = results.filter((r) => r.profile.department === department);
  if (minMatch) results = results.filter((r) => r.score >= Number(minMatch));
  if (search) {
    const s = search.toLowerCase();
    results = results.filter(
      (r) =>
        r.profile.fullName?.toLowerCase().includes(s) ||
        (r.profile.skills || []).some((sk) => sk.toLowerCase().includes(s))
    );
  }

  if (sortBy === 'cgpa') results.sort((a, b) => (b.profile.cgpa || 0) - (a.profile.cgpa || 0));
  else results.sort((a, b) => b.score - a.score);

  res.json({ count: results.length, students: results });
};
