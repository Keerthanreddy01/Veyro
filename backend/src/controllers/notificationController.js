const Notification = require('../models/Notification');

/**
 * GET /api/notifications
 * Retrieves notifications for the currently authenticated user.
 * Supports pagination and optional read filter (?read=false).
 */
const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { read } = req.query;

    const query = { recipientId: userId };
    if (read !== undefined) {
      query.read = read === 'true';
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(query),
      Notification.countDocuments({ recipientId: userId, read: false }),
    ]);

    res.json({
      notifications,
      unreadCount,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit) || 1,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/notifications/:id/read
 * Marks a single notification as read.
 * Strict IDOR check: Actor must own the notification.
 */
const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found.' });
    }

    // Strict IDOR authorization
    if (notification.recipientId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ error: "Access denied. You cannot modify another user's notifications." });
    }

    notification.read = true;
    await notification.save();

    res.json({ message: 'Notification marked as read.', notification });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/notifications/read-all
 * Marks all unread notifications for the authenticated user as read.
 */
const markAllRead = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    await Notification.updateMany(
      { recipientId: userId, read: false },
      { $set: { read: true } }
    );

    res.json({ message: 'All notifications marked as read.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getNotifications,
  markNotificationRead,
  markAllRead,
};
