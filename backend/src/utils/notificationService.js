const Notification = require('../models/Notification');
const User = require('../models/User');
const { sanitizeMetadata } = require('./auditLogger');

/**
 * Dispatches a single notification for a specific recipient.
 * Strips sensitive fields from metadata and catches exceptions safely.
 */
async function createNotification({
  recipientId,
  type,
  title,
  message,
  entityType = null,
  entityId = null,
  metadata = {},
}) {
  try {
    if (!recipientId || !type || !title || !message) {
      console.warn('createNotification missing required arguments:', { recipientId, type, title });
      return null;
    }

    const cleanMetadata = sanitizeMetadata(metadata);

    const notification = await Notification.create({
      recipientId,
      type,
      title,
      message,
      entityType,
      entityId: entityId ? String(entityId) : null,
      read: false,
      metadata: cleanMetadata,
      createdAt: new Date(),
    });

    return notification;
  } catch (err) {
    console.error('Notification Dispatch Error:', err.message);
    return null;
  }
}

/**
 * Dispatches a notification to all active system administrators.
 */
async function notifyAdmins({
  type,
  title,
  message,
  entityType = null,
  entityId = null,
  metadata = {},
}) {
  try {
    const admins = await User.find({ role: 'admin' }, '_id').lean();
    if (!admins || admins.length === 0) return [];

    const cleanMetadata = sanitizeMetadata(metadata);
    const notificationsToInsert = admins.map((admin) => ({
      recipientId: admin._id,
      type,
      title,
      message,
      entityType,
      entityId: entityId ? String(entityId) : null,
      read: false,
      metadata: cleanMetadata,
      createdAt: new Date(),
    }));

    return await Notification.insertMany(notificationsToInsert);
  } catch (err) {
    console.error('notifyAdmins Error:', err.message);
    return [];
  }
}

/**
 * Dispatches the same notification to multiple user IDs.
 */
async function notifyUsers(
  recipientIds,
  { type, title, message, entityType = null, entityId = null, metadata = {} }
) {
  try {
    if (!Array.isArray(recipientIds) || recipientIds.length === 0) return [];

    const cleanMetadata = sanitizeMetadata(metadata);
    const uniqueIds = Array.from(new Set(recipientIds.map((id) => String(id))));

    const notificationsToInsert = uniqueIds.map((id) => ({
      recipientId: id,
      type,
      title,
      message,
      entityType,
      entityId: entityId ? String(entityId) : null,
      read: false,
      metadata: cleanMetadata,
      createdAt: new Date(),
    }));

    return await Notification.insertMany(notificationsToInsert);
  } catch (err) {
    console.error('notifyUsers Error:', err.message);
    return [];
  }
}

module.exports = {
  createNotification,
  notifyAdmins,
  notifyUsers,
};
