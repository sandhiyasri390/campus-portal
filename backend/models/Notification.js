const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: [
        'job_posted', 'application_submitted', 'shortlisted', 'interview_scheduled',
        'status_changed', 'deadline_approaching', 'new_application', 'interview_response',
        'company_approved', 'company_rejected', 'drive_approved', 'drive_rejected', 'general',
      ],
      default: 'general',
    },
    relatedJob: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
    relatedApplication: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
    isRead: { type: Boolean, default: false },
    emailSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
