const mongoose = require('mongoose');

/**
 * QuizAttempt — records one student's attempt at a quiz.
 *
 * Anti-cheat design decisions (documented for interviews):
 *
 * 1. SERVER-AUTHORITATIVE TIMER:
 *    startedAt is recorded by the server when the student starts the quiz.
 *    The deadline is startedAt + quiz.timeLimitSeconds.
 *    Submissions received after the deadline are auto-scored immediately
 *    using whatever answers were saved so far. The client timer is purely cosmetic.
 *
 * 2. SHUFFLED QUESTIONS & OPTIONS PER ATTEMPT:
 *    questionOrder[] and optionOrders[][] store the shuffled indices for this attempt.
 *    This is generated once on attempt start and persisted here so that reloading
 *    mid-attempt shows the exact same order (consistent UX, no re-shuffle exploit).
 *
 * 3. TAB-SWITCH VIOLATIONS:
 *    The client tracks visibilitychange events and reports violations here.
 *    After N violations (configurable), the server auto-submits the attempt early.
 *
 * 4. AUTO-SUBMIT:
 *    autoSubmitted=true means the quiz was submitted by the server (timeout or violations),
 *    not by the student. Answers saved up to that point are used for scoring.
 */
const quizAttemptSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
    },
    // Server-set timestamp — this is the authoritative start time
    startedAt: {
      type: Date,
      default: Date.now,
    },
    submittedAt: {
      type: Date,
      default: null,
    },
    // Shuffled question indices, e.g. [2, 0, 3, 1] means question 2 shown first
    questionOrder: {
      type: [Number],
      default: [],
    },
    // Per-question shuffled option indices, parallel to questionOrder
    optionOrders: {
      type: [[Number]],
      default: [],
    },
    // answers[i] is the student's answer for the i-th question in questionOrder (shuffled index)
    answers: {
      type: [Number],  // -1 means not answered
      default: [],
    },
    // Score as a percentage (0–100), set on submission
    score: {
      type: Number,
      default: null,
    },
    passed: {
      type: Boolean,
      default: null,
    },
    // Tab-switch / window blur violations count
    tabViolations: {
      type: Number,
      default: 0,
    },
    // Max violations allowed before auto-submit (copied from config at attempt start)
    maxViolationsAllowed: {
      type: Number,
      default: 3,
    },
    // True if submitted automatically by server (timeout or violations exceeded)
    autoSubmitted: {
      type: Boolean,
      default: false,
    },
    autoSubmitReason: {
      type: String,
      enum: ['timeout', 'violations', null],
      default: null,
    },
  },
  { timestamps: true }
);

quizAttemptSchema.index({ studentId: 1, quizId: 1 });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
