const mongoose = require('mongoose');

/**
 * Reel — LearnVerse-style vertical micro-learning concept.
 *
 * Generated from course lessons / curriculum content.
 * Features concept extraction, bite-sized script, structured takeaways,
 * captions, interactive quick knowledge-check question, and engagement analytics.
 */
const reelSectionSchema = new mongoose.Schema({
  heading: { type: String, default: '' },
  body: { type: String, required: true },
  visualPrompt: { type: String, default: '' },
  duration: { type: Number, default: 15 }, // seconds
});

const captionSchema = new mongoose.Schema({
  start: { type: Number, required: true },
  end: { type: Number, required: true },
  text: { type: String, required: true },
});

const quickQuestionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: {
    type: [String],
    required: true,
    validate: [(arr) => arr.length >= 2, 'At least 2 options required'],
  },
  correctOptionIndex: { type: Number, required: true },
  explanation: { type: String, default: '' },
});

const reelSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
      default: null,
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      default: null,
    },
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Reel title is required'],
      trim: true,
    },
    concept: {
      type: String,
      required: [true, 'Core concept summary is required'],
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    durationSeconds: {
      type: Number,
      default: 60,
      min: 15,
      max: 180,
    },
    status: {
      type: String,
      enum: ['draft', 'processing', 'review', 'published', 'failed'],
      default: 'draft',
    },
    generationError: {
      type: String,
      default: null,
    },
    videoUrl: {
      type: String,
      default: null,
    },
    thumbnailUrl: {
      type: String,
      default: null,
    },
    script: {
      hook: { type: String, default: '' },
      sections: { type: [reelSectionSchema], default: [] },
      summary: { type: String, default: '' },
    },
    captions: {
      type: [captionSchema],
      default: [],
    },
    takeaways: {
      type: [String],
      default: [],
    },
    quickQuestion: {
      type: quickQuestionSchema,
      default: null,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    completionsCount: {
      type: Number,
      default: 0,
    },
    quizAttemptsCount: {
      type: Number,
      default: 0,
    },
    quizPassCount: {
      type: Number,
      default: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

reelSchema.index({ courseId: 1, status: 1 });
reelSchema.index({ instructorId: 1 });
reelSchema.index({ lessonId: 1 });

module.exports = mongoose.model('Reel', reelSchema);
