const mongoose = require('mongoose');

/**
 * Enrollment — tracks which student is enrolled in which course.
 * status: 'active' | 'completed' | 'dropped'
 */
const enrollmentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'dropped'],
      default: 'active',
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    // Populated when all lessons + quizzes are passed; triggers cert generation
    completedAt: {
      type: Date,
      default: null,
    },
    // Certificate verification code (UUID), set on completion
    certificateCode: {
      type: String,
      default: null,
      unique: true,
      sparse: true,
    },
  },
  { timestamps: true }
);

// A student can only enroll once per course
enrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
