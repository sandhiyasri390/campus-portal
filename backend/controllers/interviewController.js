const Interview = require('../models/Interview');
const Application = require('../models/Application');
const { notify } = require('../utils/notifyService');

exports.scheduleInterview = async (req, res) => {
  const { applicationId, date, time, type, interviewer, meetingLink, location } = req.body;
  const application = await Application.findById(applicationId).populate('job');
  if (!application) return res.status(404).json({ message: 'Application not found' });
  if (String(application.job.postedBy) !== req.user.id && !['admin', 'officer'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  const interview = await Interview.create({
    application: applicationId,
    student: application.student,
    job: application.job._id,
    scheduledBy: req.user.id,
    date, time, type, interviewer, meetingLink, location,
  });

  await notify({
    recipient: application.student,
    title: 'Interview scheduled',
    message: `Your ${type.replace('_', ' ')} interview for "${application.job.title}" is scheduled on ${new Date(date).toDateString()} at ${time}.`,
    type: 'interview_scheduled',
    relatedJob: application.job._id,
    relatedApplication: application._id,
  });

  res.status(201).json({ interview });
};

exports.listInterviews = async (req, res) => {
  const filter = {};
  if (req.user.role === 'student') filter.student = req.user.id;
  else if (req.user.role === 'recruiter') filter.scheduledBy = req.user.id;

  const { status, upcoming } = req.query;
  if (status) filter.status = status;
  if (upcoming === 'true') filter.date = { $gte: new Date() };

  const interviews = await Interview.find(filter)
    .populate('job', 'title')
    .populate('student', 'name email')
    .sort('date');
  res.json({ count: interviews.length, interviews });
};

exports.updateInterview = async (req, res) => {
  const interview = await Interview.findById(req.params.id);
  if (!interview) return res.status(404).json({ message: 'Interview not found' });
  if (String(interview.scheduledBy) !== req.user.id && !['admin', 'officer'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  const editable = ['date', 'time', 'type', 'interviewer', 'meetingLink', 'location', 'status', 'feedback', 'result'];
  editable.forEach((f) => {
    if (req.body[f] !== undefined) interview[f] = req.body[f];
  });
  await interview.save();

  if (req.body.status === 'rescheduled' || req.body.date) {
    await notify({
      recipient: interview.student,
      title: 'Interview updated',
      message: `Your interview schedule was updated. New date: ${new Date(interview.date).toDateString()} at ${interview.time}.`,
      type: 'interview_scheduled',
      relatedJob: interview.job,
    });
  }

  res.json({ interview });
};
