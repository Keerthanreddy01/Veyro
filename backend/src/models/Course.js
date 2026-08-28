const mongoose = require('mongoose');

/**
 * Course schema.
 * status flow: draft → pending (instructor submits for review) → published | rejected
 * Only 'published' courses appear in the student catalog.
 */
const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'pending', 'published', 'rejected'],
      default: 'draft',
    },
    // thumbnail: relative path inside /uploads, easy to swap for a full URL (S3/Cloudinary)
    thumbnail: {
      type: String,
      default: null,
    },
    // Optional rejection reason from admin
    rejectionReason: {
      type: String,
      default: null,
    },
    category: {
      type: String,
      trim: true,
      default: 'General',
    },
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

// Text index for search
courseSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Course', courseSchema);
