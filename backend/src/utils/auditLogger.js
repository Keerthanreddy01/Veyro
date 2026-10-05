const AuditLog = require('../models/AuditLog');

// Predefined platform audit actions
const AUDIT_ACTIONS = {
  // Authentication / Security
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  SESSION_REVOKED: 'SESSION_REVOKED',

  // Courses
  COURSE_CREATED: 'COURSE_CREATED',
  COURSE_UPDATED: 'COURSE_UPDATED',
  COURSE_SUBMITTED: 'COURSE_SUBMITTED',
  COURSE_APPROVED: 'COURSE_APPROVED',
  COURSE_REJECTED: 'COURSE_REJECTED',
  COURSE_PUBLISHED: 'COURSE_PUBLISHED',
  COURSE_RETRACTED: 'COURSE_RETRACTED',

  // Enrollment
  COURSE_ENROLLED: 'COURSE_ENROLLED',
  COURSE_DROPPED: 'COURSE_DROPPED',
  COURSE_COMPLETED: 'COURSE_COMPLETED',

  // Assessment
  QUIZ_CREATED: 'QUIZ_CREATED',
  QUIZ_UPDATED: 'QUIZ_UPDATED',
  QUIZ_DELETED: 'QUIZ_DELETED',
  QUIZ_ATTEMPT_STARTED: 'QUIZ_ATTEMPT_STARTED',
  QUIZ_ATTEMPT_SUBMITTED: 'QUIZ_ATTEMPT_SUBMITTED',

  // Certificates
  CERTIFICATE_ISSUED: 'CERTIFICATE_ISSUED',

  // User Administration
  USER_STATUS_CHANGED: 'USER_STATUS_CHANGED',
  USER_ROLE_CHANGED: 'USER_ROLE_CHANGED',
};

// Blacklist of sensitive keys that must NEVER be persisted in audit logs (lowercase for case-insensitive matching)
const SENSITIVE_KEYS = new Set([
  'password',
  'passwordhash',
  'token',
  'accesstoken',
  'refreshtoken',
  'refreshtokens',
  'secret',
  'jwt',
  'authorization',
  'creditcard',
  'apikey',
  'api_key',
]);

/**
 * Recursively deep sanitize metadata to strip sensitive secrets
 */
function sanitizeMetadata(data) {
  if (!data || typeof data !== 'object') return data;
  if (data instanceof Date) return data;
  if (Array.isArray(data)) return data.map(sanitizeMetadata);

  const clean = {};
  for (const [key, value] of Object.entries(data)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      clean[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      clean[key] = sanitizeMetadata(value);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

/**
 * Safe Audit Logger
 * Dispatches an append-only audit log entry.
 * Never throws an unhandled error into caller flow if logging fails.
 */
async function logAudit({
  req = null,
  actorId = null,
  actorRole = null,
  action,
  entityType,
  entityId = null,
  metadata = {},
}) {
  try {
    if (!action || !entityType) {
      console.warn('logAudit invoked without required action or entityType');
      return null;
    }

    // Safely extract client telemetry
    let ipAddress = null;
    let userAgent = null;
    if (req) {
      ipAddress =
        req.headers?.['x-forwarded-for']?.split(',')[0]?.trim() ||
        req.ip ||
        req.socket?.remoteAddress ||
        null;
      userAgent = req.headers?.['user-agent'] || null;
    }

    // Determine actor attributes
    const finalActorId = actorId || req?.user?.userId || null;
    const finalActorRole = actorRole || req?.user?.role || 'anonymous';
    const cleanMetadata = sanitizeMetadata(metadata);

    const logEntry = await AuditLog.create({
      actorId: finalActorId,
      actorRole: finalActorRole,
      action,
      entityType,
      entityId: entityId ? String(entityId) : null,
      metadata: cleanMetadata,
      ipAddress,
      userAgent,
      createdAt: new Date(),
    });

    return logEntry;
  } catch (err) {
    // Audit logging failure should not crash core application operations
    console.error('AuditLog Write Failure:', err.message);
    return null;
  }
}

module.exports = {
  logAudit,
  sanitizeMetadata,
  AUDIT_ACTIONS,
};
