const mongoose = require('mongoose');

// Job also represents the Placement Drive: one drive = one job posting.
const jobSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    location: { type: String, trim: true },
    jobType: { type: String, enum: ['full-time', 'internship', 'internship+ppo'], default: 'full-time' },
    ctc: { type: String, trim: true }, // e.g. "6-8 LPA"
    description: { type: String, required: true },
    requiredSkills: [{ type: String, trim: true }],
    preferredSkills: [{ type: String, trim: true }],
    selectionProcess: [{ type: String, trim: true }], // e.g. ["Online Test", "Technical Interview", "HR Interview"]
    openings: { type: Number, default: 1 },

    eligibility: {
      minCgpa: { type: Number, default: 0 },
      maxBacklogs: { type: Number, default: 0 },
      departments: [{ type: String, trim: true }], // empty = all departments
      graduationYears: [{ type: Number }], // empty = all years
      minExperienceMonths: { type: Number, default: 0 },
      requiredCertifications: [{ type: String, trim: true }],
      strictSkills: { type: Boolean, default: false },
    },

    applicationDeadline: { type: Date, required: true },
    driveDate: { type: Date },

    status: {
      type: String,
      enum: ['pending_approval', 'approved', 'rejected', 'closed'],
      default: 'pending_approval',
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

jobSchema.virtual('isOpen').get(function () {
  return this.status === 'approved' && new Date() < new Date(this.applicationDeadline);
});
jobSchema.set('toJSON', { virtuals: true });
jobSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Job', jobSchema);
