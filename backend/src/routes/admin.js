const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getAuditLogs,
  exportAuditLogs,
  getCertificatesLedger,
  getPlatformMetrics,
} = require('../controllers/adminController');
const {
  getAllUsers,
  toggleUserStatus,
  reviewCourse,
} = require('../controllers/courseController');
const {
  getAdminTestimonials,
  reviewAdminTestimonial,
  deleteAdminTestimonial,
  createAdminTestimonial,
} = require('../controllers/testimonialController');

// All routes here strictly require admin authentication
router.use(authenticate, authorize('admin'));

// Platform Telemetry & Metrics
router.get('/metrics', getPlatformMetrics);

// Audit Logs
router.get('/audit-logs/export', exportAuditLogs);
router.get('/audit-logs', getAuditLogs);

// User Administration
router.get('/users', getAllUsers);
router.patch('/users/:id/toggle', toggleUserStatus);

// Course Accreditation / Moderation Queue
router.put('/courses/:id/status', reviewCourse);
router.patch('/courses/:id/status', reviewCourse);

// Convenient POST /approve and /reject endpoints
router.post('/courses/:id/approve', (req, res, next) => {
  req.body = req.body || {};
  req.body.action = req.body.action || 'publish';
  return reviewCourse(req, res, next);
});

router.post('/courses/:id/reject', (req, res, next) => {
  req.body = req.body || {};
  req.body.action = req.body.action || 'reject';
  return reviewCourse(req, res, next);
});

// Certificate Ledger & Cryptographic Audit
router.get('/certificates', getCertificatesLedger);

// Testimonials Moderation Queue
router.get('/testimonials', getAdminTestimonials);
router.post('/testimonials', createAdminTestimonial);
router.patch('/testimonials/:id/status', reviewAdminTestimonial);
router.patch('/testimonials/:id', reviewAdminTestimonial);
router.delete('/testimonials/:id', deleteAdminTestimonial);

module.exports = router;
