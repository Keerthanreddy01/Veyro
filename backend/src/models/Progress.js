const mongoose = require('mongoose');

/**
 * Progress — per-student, per-lesson tracking.
 *
 * Design Decision (important for interviews):
 * We track real watch time via HTML5 video 'timeupdate' events on the client.
 * The client periodically POSTs { watchedSeconds, lastPosition } to the server.
 * A lesson is only marked 'completed' when watchedSeconds >= 90% of durationSeconds.
 * lastPosition allows resuming exactly where the student left off.
 *
 * We intentionally do NOT trust a client-sent 'completed: true' flag —
 * completion is computed server-side from watchedSeconds vs. durationSeconds.
 */
const progressSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    // Total unique seconds watched (de-duped on client via timeupdate tracking)
    watchedSeconds: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Where to resume playback (in seconds)
    lastPosition: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Set to true only when watchedSeconds >= 90% of lesson.durationSeconds (server-enforced)
    completed: {
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

// One progress record per student per lesson
progressSchema.index({ studentId: 1, lessonId: 1 }, { unique: true });
// For querying all progress for a student in a course
progressSchema.index({ studentId: 1, courseId: 1 });

module.exports = mongoose.model('Progress', progressSchema);
