const mongoose = require('mongoose');

const STATUS_FLOW = [
  'applied',
  'under_review',
  'shortlisted',
  'assessment',
  'technical_interview',
  'hr_interview',
  'selected',
  'rejected',
];

const applicationSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    status: { type: String, enum: STATUS_FLOW, default: 'applied' },
    matchScore: { type: Number, default: 0 },
    statusHistory: [
      {
        status: { type: String, enum: STATUS_FLOW },
        changedAt: { type: Date, default: Date.now },
        note: String,
      },
    ],
    recruiterNotes: { type: String },
  },
  { timestamps: true }
);

applicationSchema.index({ student: 1, job: 1 }, { unique: true });
applicationSchema.statics.STATUS_FLOW = STATUS_FLOW;

module.exports = mongoose.model('Application', applicationSchema);
