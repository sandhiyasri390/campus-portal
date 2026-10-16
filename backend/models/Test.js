const mongoose = require('mongoose');

// Assessment / Test tied to a job drive
const testSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    title: { type: String, required: true },
    testType: { type: String, enum: ['aptitude', 'technical', 'coding'], default: 'aptitude' },
    scheduledDate: { type: Date, required: true },
    duration: { type: Number, default: 60 }, // minutes
    instructions: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Test', testSchema);
