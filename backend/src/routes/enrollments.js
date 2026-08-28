const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const { getMyEnrollments } = require('../controllers/enrollmentController');

router.get('/my', authenticate, authorize('student'), getMyEnrollments);

module.exports = router;
