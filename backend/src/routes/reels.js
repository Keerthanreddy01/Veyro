const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  generateCourseReels,
  getFeed,
  getCourseReels,
  getReelById,
  recordProgress,
  updateReel,
  togglePublishReel,
  deleteReel,
  getInstructorReels,
} = require('../controllers/reelController');

// Student reel feed
router.get('/feed', authenticate, authorize('student', 'instructor', 'admin'), getFeed);

// Instructor reel management
router.get('/instructor/my', authenticate, authorize('instructor', 'admin'), getInstructorReels);

// Generation pipeline from course content
router.post('/courses/:courseId/generate', authenticate, authorize('instructor', 'admin'), generateCourseReels);

// Course reels listing
router.get('/courses/:courseId', authenticate, getCourseReels);

// Single reel details
router.get('/:id', authenticate, getReelById);

// Progress and interactive quick-question answer
router.post('/:id/progress', authenticate, authorize('student'), recordProgress);

// Reel editing & publishing
router.put('/:id', authenticate, authorize('instructor', 'admin'), updateReel);
router.patch('/:id/publish', authenticate, authorize('instructor', 'admin'), togglePublishReel);
router.delete('/:id', authenticate, authorize('instructor', 'admin'), deleteReel);

module.exports = router;
