const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const { getAuditLogs, exportAuditLogs } = require('../controllers/adminController');
const { getAllUsers, toggleUserStatus, reviewCourse } = require('../controllers/courseController');

// All routes here strictly require admin authentication
router.use(authenticate, authorize('admin'));

// Audit Logs
router.get('/audit-logs/export', exportAuditLogs);
router.get('/audit-logs', getAuditLogs);

// User Administration
router.get('/users', getAllUsers);
router.patch('/users/:id/toggle', toggleUserStatus);

// Course Accreditation / Status Review
router.put('/courses/:id/status', reviewCourse);
router.patch('/courses/:id/status', reviewCourse);

module.exports = router;
