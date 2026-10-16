const mongoose = require('mongoose');

const resumeAnalysisSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    extracted: {
      name: String,
      email: String,
      phone: String,
      skills: [String],
      educationLines: [String],
      projectLines: [String],
      internshipLines: [String],
      certificationLines: [String],
    },
    rawTextLength: { type: Number, default: 0 },
    method: { type: String, enum: ['ai', 'rule_based', 'manual'], default: 'rule_based' },
    analyzedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ResumeAnalysis', resumeAnalysisSchema);
