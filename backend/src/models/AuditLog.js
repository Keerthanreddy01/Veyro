const mongoose = require('mongoose');

/**
 * AuditLog — Immutable, append-only security and operational audit trail.
 * Captures all critical state-changing actions across the platform.
 * 
 * Rules:
 * - Append-only: updates and deletes are strictly prohibited by schema pre-hooks.
 * - Sanitized: never store passwords, refresh tokens, or secret tokens.
 * - Access: accessible strictly by administrators.
 */
const auditLogSchema = new mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    actorRole: {
      type: String,
      enum: ['student', 'instructor', 'admin', 'system', 'anonymous'],
      default: 'anonymous',
      index: true,
    },
    action: {
      type: String,
      required: [true, 'Action type is required'],
      index: true,
      trim: true,
    },
    entityType: {
      type: String,
      required: [true, 'Entity type is required'],
      enum: ['auth', 'course', 'module', 'lesson', 'quiz', 'enrollment', 'certificate', 'user', 'system'],
      index: true,
    },
    entityId: {
      type: String,
      default: null,
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Prevent updatedAt creation
    versionKey: false,
  }
);

// Block any mutation or deletion of audit logs (append-only enforcement)
const blockMutation = function (next) {
  const err = new Error('Immutable Platform Audit Log: Modification or deletion of audit records is strictly prohibited.');
  err.status = 403;
  return next(err);
};

auditLogSchema.pre('updateOne', blockMutation);
auditLogSchema.pre('updateMany', blockMutation);
auditLogSchema.pre('findOneAndUpdate', blockMutation);
auditLogSchema.pre('replaceOne', blockMutation);
auditLogSchema.pre('deleteOne', blockMutation);
auditLogSchema.pre('deleteMany', blockMutation);
auditLogSchema.pre('findOneAndDelete', blockMutation);
auditLogSchema.pre('findOneAndRemove', blockMutation);

module.exports = mongoose.model('AuditLog', auditLogSchema);
