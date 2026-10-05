const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const {
  getNotifications,
  markNotificationRead,
  markAllRead,
} = require('../controllers/notificationController');

// All notification routes strictly require authentication
router.use(authenticate);

router.get('/', getNotifications);
router.patch('/read-all', markAllRead);
router.patch('/:id/read', markNotificationRead);

module.exports = router;
