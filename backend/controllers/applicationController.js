const Application = require('../models/Application');
const Job = require('../models/Job');
const StudentProfile = require('../models/StudentProfile');
const { calculateMatchScore } = require('../utils/matching');
const { checkEligibility } = require('../utils/eligibility');
const { notify, notifyMany } = require('../utils/notifyService');

const STATUS_FLOW = Application.STATUS_FLOW;

exports.applyToJob = async (req, res) => {
  const { jobId } = req.body;
  const job = await Job.findById(jobId);
  if (!job) return res.status(404).json({ message: 'Job not found' });
  if (job.status !== 'approved') return res.status(400).json({ message: 'This drive is not open for applications' });
  if (new Date() > new Date(job.applicationDeadline)) {
    return res.status(400).json({ message: 'Application deadline has passed' });
  }

  const existing = await Application.findOne({ student: req.user.id, job: jobId });
  if (existing) return res.status(409).json({ message: 'You have already applied to this job' });

  const profile = await StudentProfile.findOne({ user: req.user.id });
  if (!profile) return res.status(400).json({ message: 'Please complete your profile before applying' });

  const m = calculateMatchScore(job, profile);
  if (!m.eligible) {
    return res.status(400).json({ message: 'You are not eligible for this drive', reasons: m.eligibilityReasons });
  }

  const application = await Application.create({
    student: req.user.id,
    job: jobId,
    company: job.company,
    matchScore: m.score,
    statusHistory: [{ status: 'applied', note: 'Application submitted' }],
  });

  await notify({
    recipient: req.user.id,
    title: 'Application submitted',
    message: `Your application for "${job.title}" has been submitted successfully.`,
    type: 'application_submitted',
    relatedJob: job._id,
    relatedApplication: application._id,
  });
  await notify({
    recipient: job.postedBy,
    title: 'New application received',
    message: `A new candidate applied for "${job.title}".`,
    type: 'new_application',
    relatedJob: job._id,
    relatedApplication: application._id,
  });

  res.status(201).json({ application });
};

exports.getMyApplications = async (req, res) => {
  const applications = await Application.find({ student: req.user.id })
    .populate('job', 'title location ctc applicationDeadline driveDate status')
    .populate('company', 'name industry')
    .sort('-createdAt');
  res.json({ count: applications.length, applications });
};

exports.getApplicationById = async (req, res) => {
  const application = await Application.findById(req.params.id)
    .populate('job')
    .populate('company')
    .populate('student', 'name email');
  if (!application) return res.status(404).json({ message: 'Application not found' });

  const isOwner = String(application.student._id) === req.user.id;
  const isRecruiterOwner = req.user.role === 'recruiter' && String(application.job.postedBy) === req.user.id;
  if (!isOwner && !isRecruiterOwner && !['admin', 'officer'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  res.json({ application });
};

exports.listApplicationsForJob = async (req, res) => {
  const { jobId } = req.params;
  const job = await Job.findById(jobId);
  if (!job) return res.status(404).json({ message: 'Job not found' });
  if (String(job.postedBy) !== req.user.id && !['admin', 'officer'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  const { status } = req.query;
  const filter = { job: jobId };
  if (status) filter.status = status;

  const applications = await Application.find(filter)
    .populate({ path: 'student', select: 'name email' })
    .sort('-matchScore');

  const withProfiles = await Promise.all(
    applications.map(async (app) => {
      const profile = await StudentProfile.findOne({ user: app.student._id });
      return { ...app.toObject(), studentProfile: profile };
    })
  );

  res.json({ count: withProfiles.length, applications: withProfiles });
};

exports.updateApplicationStatus = async (req, res) => {
  const { status, note } = req.body;
  if (!STATUS_FLOW.includes(status)) return res.status(400).json({ message: 'Invalid status value' });

  const application = await Application.findById(req.params.id).populate('job');
  if (!application) return res.status(404).json({ message: 'Application not found' });
  if (String(application.job.postedBy) !== req.user.id && !['admin', 'officer'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  application.status = status;
  application.statusHistory.push({ status, note });
  if (note) application.recruiterNotes = note;
  await application.save();

  const messages = {
    under_review: `Your application for "${application.job.title}" is now under review.`,
    shortlisted: `Congratulations! You've been shortlisted for "${application.job.title}".`,
    assessment: `You've been moved to the assessment stage for "${application.job.title}".`,
    technical_interview: `You've been scheduled for a technical interview for "${application.job.title}".`,
    hr_interview: `You've advanced to the HR interview stage for "${application.job.title}".`,
    selected: `Congratulations! You've been selected for "${application.job.title}".`,
    rejected: `Your application for "${application.job.title}" was not selected this time.`,
  };
  if (messages[status]) {
    await notify({
      recipient: application.student,
      title: 'Application status updated',
      message: messages[status],
      type: status === 'shortlisted' ? 'shortlisted' : 'status_changed',
      relatedJob: application.job._id,
      relatedApplication: application._id,
    });
  }

  res.json({ application });
};

exports.bulkUpdateStatus = async (req, res) => {
  const { applicationIds, status, note } = req.body;
  if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
    return res.status(400).json({ message: 'applicationIds must be a non-empty array' });
  }
  if (!STATUS_FLOW.includes(status)) return res.status(400).json({ message: 'Invalid status value' });

  const applications = await Application.find({ _id: { $in: applicationIds } }).populate('job');
  const authorized = applications.filter(
    (a) => String(a.job.postedBy) === req.user.id || ['admin', 'officer'].includes(req.user.role)
  );

  await Promise.all(
    authorized.map(async (app) => {
      app.status = status;
      app.statusHistory.push({ status, note });
      await app.save();
    })
  );

  await notifyMany(
    authorized.map((a) => a.student),
    {
      title: 'Application status updated',
      message: `Your application status has been updated to "${status.replace('_', ' ')}".`,
      type: 'status_changed',
    }
  );

  res.json({ updated: authorized.length });
};
