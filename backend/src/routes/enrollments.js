const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const { getMyEnrollments, dropCourse } = require('../controllers/enrollmentController');

router.get('/my', authenticate, authorize('student'), getMyEnrollments);
router.delete('/:courseId', authenticate, authorize('student'), dropCourse);

module.exports = router;
