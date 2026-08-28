const mongoose = require('mongoose');

/**
 * Quiz schema.
 *
 * SECURITY: correctOptionIndex is stored here but NEVER sent to the client
 * before submission. The server validates answers server-side only.
 * See routes/quiz.js — the GET /quiz/:id route explicitly omits correctOptionIndex.
 */
const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: {
    type: [String],
    required: true,
    validate: [(arr) => arr.length >= 2, 'At least 2 options required'],
  },
  // Index into options[] — NEVER returned to client before submission
  correctOptionIndex: { type: Number, required: true },
  points: { type: Number, default: 1 },
});

const quizSchema = new mongoose.Schema(
  {
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Quiz title is required'],
      trim: true,
    },
    // Server-authoritative time limit in seconds.
    // Design Decision: The client shows a visual countdown, but the server
    // independently records startedAt on each attempt. Any submission received
    // after startedAt + timeLimitSeconds is auto-scored with answers saved so far.
    // This prevents the common cheat of pausing the client timer or submitting late.
    timeLimitSeconds: {
      type: Number,
      required: true,
      min: [30, 'Time limit must be at least 30 seconds'],
    },
    questions: {
      type: [questionSchema],
      validate: [(arr) => arr.length >= 1, 'Quiz must have at least one question'],
    },
    passingScore: {
      type: Number,
      default: 50, // percentage
      min: 0,
      max: 100,
    },
    maxAttempts: {
      type: Number,
      default: 3,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Quiz', quizSchema);
