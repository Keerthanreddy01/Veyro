const mongoose = require('mongoose');

/**
 * AiConversation — stores recent chat conversations per student for contextual memory.
 * Preserves student privacy; only accessible by the owner student.
 */
const aiMessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: [10000, 'Message content cannot exceed 10000 characters'],
    },
    provider: {
      type: String,
      enum: ['nvidia', 'groq', 'database', 'system'],
      default: 'nvidia',
    },
    model: {
      type: String,
      default: null,
    },
    sources: [
      {
        sourceType: String,
        courseTitle: String,
        moduleTitle: String,
        lessonTitle: String,
        _id: false,
      },
    ],
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const aiConversationSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      default: null,
    },
    title: {
      type: String,
      default: 'New Conversation',
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    messages: [aiMessageSchema],
  },
  { timestamps: true }
);

// One primary active conversation per student or per course
aiConversationSchema.index({ studentId: 1, courseId: 1 });

module.exports = mongoose.model('AiConversation', aiConversationSchema);

