const mongoose = require('mongoose');

/**
 * ReelProgress — tracks student engagement with a learning reel.
 */
const reelProgressSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reel',
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    watched: {
      type: Boolean,
      default: false,
    },
    watchedSeconds: {
      type: Number,
      default: 0,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    quizAnswered: {
      type: Boolean,
      default: false,
    },
    selectedOptionIndex: {
      type: Number,
      default: null,
    },
    quizCorrect: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

reelProgressSchema.index({ studentId: 1, reelId: 1 }, { unique: true });
reelProgressSchema.index({ studentId: 1, courseId: 1 });

module.exports = mongoose.model('ReelProgress', reelProgressSchema);
