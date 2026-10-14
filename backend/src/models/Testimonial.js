const mongoose = require('mongoose');

/**
 * Testimonial — Learner / Audience reviews and feedback.
 * Status: 'pending' (submitted from landing page, awaiting admin evaluation),
 *         'approved' (published to landing page showcase),
 *         'rejected' (declined by moderator).
 */
const testimonialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 100,
    },
    occupation: {
      type: String,
      default: 'Veyro Learner',
      trim: true,
      maxlength: 120,
    },
    testimonial: {
      type: String,
      required: [true, 'Testimonial content is required'],
      trim: true,
      minlength: 10,
      maxlength: 1000,
    },
    rating: {
      type: Number,
      default: 5,
      min: 1,
      max: 5,
    },
    profilePicture: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Testimonial', testimonialSchema);
