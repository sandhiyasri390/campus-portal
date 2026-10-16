const mongoose = require('mongoose');

const preparationTaskSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    week: { type: Number, required: true },
    title: { type: String, required: true },
    category: { type: String, trim: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
    targetRole: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PreparationTask', preparationTaskSchema);
