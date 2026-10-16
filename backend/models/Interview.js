const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema(
  {
    application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    scheduledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true }, // "10:00 AM"
    type: {
      type: String,
      enum: ['online', 'offline', 'technical', 'hr', 'group_discussion'],
      required: true,
    },
    interviewer: { type: String, trim: true },
    meetingLink: { type: String, trim: true },
    location: { type: String, trim: true },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
      default: 'scheduled',
    },
    feedback: { type: String },
    result: { type: String, enum: ['pending', 'pass', 'fail'], default: 'pending' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Interview', interviewSchema);
