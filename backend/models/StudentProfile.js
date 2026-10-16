const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    fullName: { type: String, trim: true },
    registerNumber: { type: String, trim: true },
    collegeEmail: { type: String, trim: true, lowercase: true },
    personalEmail: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    department: { type: String, trim: true },
    degree: { type: String, trim: true },
    batch: { type: String, trim: true },
    graduationYear: { type: Number },
    cgpa: { type: Number, min: 0, max: 10 },
    backlogs: { type: Number, default: 0, min: 0 },
    skills: [{ type: String, trim: true }],
    programmingLanguages: [{ type: String, trim: true }],
    certifications: [{ type: String, trim: true }],
    projects: [
      {
        title: String,
        description: String,
        techStack: [String],
        link: String,
      },
    ],
    internships: [
      {
        company: String,
        role: String,
        duration: String,
        description: String,
      },
    ],
    resume: {
      fileName: String,
      filePath: String,
      uploadedAt: Date,
    },
    githubUrl: { type: String, trim: true },
    linkedinUrl: { type: String, trim: true },
    portfolioUrl: { type: String, trim: true },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified'],
      default: 'pending',
    },
    preparation: {
      aptitudePracticeCount: { type: Number, default: 0 },
      mockInterviewCount: { type: Number, default: 0 },
      codingPracticeCount: { type: Number, default: 0 },
      communicationScore: { type: Number, default: 0, min: 0, max: 100 },
    },
    targetRole: { type: String, trim: true },
  },
  { timestamps: true }
);

const REQUIRED_FIELDS = [
  'fullName', 'registerNumber', 'collegeEmail', 'personalEmail', 'phone',
  'department', 'degree', 'batch', 'graduationYear', 'cgpa',
  'githubUrl', 'linkedinUrl',
];

studentProfileSchema.methods.getProfileCompletion = function () {
  let filled = 0;
  const missing = [];
  REQUIRED_FIELDS.forEach((field) => {
    const val = this[field];
    if (val !== undefined && val !== null && val !== '') filled += 1;
    else missing.push(field);
  });
  let bonus = 0;
  const bonusChecks = [
    this.skills && this.skills.length > 0,
    this.projects && this.projects.length > 0,
    this.resume && this.resume.filePath,
    this.certifications && this.certifications.length > 0,
  ];
  bonusChecks.forEach((ok) => {
    if (ok) bonus += 1; else missing.push('extras');
  });
  const totalChecks = REQUIRED_FIELDS.length + bonusChecks.length;
  const totalFilled = filled + bonus;
  const percentage = Math.round((totalFilled / totalChecks) * 100);
  return { percentage, missing: [...new Set(missing)] };
};

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
