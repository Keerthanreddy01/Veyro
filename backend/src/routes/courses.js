const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const { upload } = require('../utils/fileUpload');
const {
  getCourses, getCourseById, createCourse, updateCourse,
  deleteCourse, submitForReview, reviewCourse, getAllUsers, toggleUserStatus,
} = require('../controllers/courseController');
const { enrollInCourse, getCourseProgress, getCourseStudents, completeCourse } = require('../controllers/enrollmentController');
const { createModule, getModules } = require('../controllers/moduleController');

// Public + student catalog — authenticate is optional here (handled inside controller)
router.get('/', (req, res, next) => {
  // Attach user if token present, but don't block if missing
  const auth = req.headers.authorization;
  if (auth) {
    const { verifyAccessToken } = require('../utils/jwt');
    try { req.user = verifyAccessToken(auth.split(' ')[1]); } catch {}
  }
  next();
}, getCourses);

router.get('/:id', (req, res, next) => {
  const auth = req.headers.authorization;
  if (auth) {
    const { verifyAccessToken } = require('../utils/jwt');
    try { req.user = verifyAccessToken(auth.split(' ')[1]); } catch {}
  }
  next();
}, getCourseById);

// Instructor CRUD
router.post('/', authenticate, authorize('instructor'), upload.single('thumbnail'), createCourse);
router.put('/:id', authenticate, authorize('instructor'), upload.single('thumbnail'), updateCourse);
router.delete('/:id', authenticate, authorize('instructor', 'admin'), deleteCourse);
router.patch('/:id/submit', authenticate, authorize('instructor'), submitForReview);

// Admin review
router.patch('/:id/review', authenticate, authorize('admin'), reviewCourse);

// Enrollment
router.post('/:courseId/enroll', authenticate, authorize('student'), enrollInCourse);
router.get('/:courseId/progress', authenticate, authorize('student'), getCourseProgress);
router.post('/:courseId/complete', authenticate, authorize('student'), completeCourse);
router.get('/:courseId/students', authenticate, authorize('instructor', 'admin'), getCourseStudents);

// Modules under a course
router.get('/:courseId/modules', authenticate, getModules);
router.post('/:courseId/modules', authenticate, authorize('instructor'), createModule);

// Admin user management
router.get('/admin/users', authenticate, authorize('admin'), getAllUsers);
router.patch('/admin/users/:id/toggle', authenticate, authorize('admin'), toggleUserStatus);

module.exports = router;
