const mongoose = require('mongoose');

/**
 * Lesson — a single piece of content inside a module.
 * type: 'video' | 'pdf' | 'text'
 * contentUrl: relative path in /uploads (videos/pdfs) or raw HTML string (text lessons).
 * durationSeconds: only relevant for video lessons; used to calculate 90% completion threshold.
 */
const lessonSchema = new mongoose.Schema(
  {
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Lesson title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    type: {
      type: String,
      enum: ['video', 'pdf', 'text'],
      required: true,
    },
    // For video/pdf: relative path inside /uploads.
    // For text: store content directly in this field.
    contentUrl: {
      type: String,
      default: null,
    },
    textContent: {
      type: String,
      default: null,
    },
    // Duration in seconds — set when instructor uploads video (can be updated later)
    durationSeconds: {
      type: Number,
      default: 0,
    },
    order: {
      type: Number,
      default: 0,
    },
    isPreview: {
      type: Boolean,
      default: false, // if true, visible to non-enrolled students
    },
  },
  { timestamps: true }
);

lessonSchema.index({ moduleId: 1, order: 1 });

module.exports = mongoose.model('Lesson', lessonSchema);
