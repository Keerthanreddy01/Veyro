const router = require('express').Router();
const { body } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const { upload } = require('../utils/fileUpload');
const { validate } = require('../middleware/validate');
const {
  getCourses, getCourseById, createCourse, updateCourse,
  deleteCourse, submitForReview, reviewCourse, getAllUsers, toggleUserStatus,
} = require('../controllers/courseController');
const { enrollInCourse, getCourseProgress, getCourseStudents, completeCourse } = require('../controllers/enrollmentController');
const { createModule, getModules } = require('../controllers/moduleController');

// Validation rules for Course
const createCourseRules = [
  body('title').trim().notEmpty().withMessage('Course title is required').isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters').escape(),
  body('description').optional().trim().escape(),
  body('category').optional().trim().escape(),
  body('level').optional().trim().isIn(['beginner', 'intermediate', 'advanced']).withMessage('Level must be beginner, intermediate, or advanced'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
];

const updateCourseRules = [
  body('title').optional().trim().notEmpty().withMessage('Course title cannot be empty').isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters').escape(),
  body('description').optional().trim().escape(),
  body('category').optional().trim().escape(),
  body('level').optional().trim().isIn(['beginner', 'intermediate', 'advanced']).withMessage('Level must be beginner, intermediate, or advanced'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
];

const createModuleRules = [
  body('title').trim().notEmpty().withMessage('Module title is required').isLength({ max: 200 }).withMessage('Module title cannot exceed 200 characters').escape(),
];

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
router.post('/', authenticate, authorize('instructor'), upload.single('thumbnail'), createCourseRules, validate, createCourse);
router.put('/:id', authenticate, authorize('instructor'), upload.single('thumbnail'), updateCourseRules, validate, updateCourse);
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
router.post('/:courseId/modules', authenticate, authorize('instructor'), createModuleRules, validate, createModule);

// Admin user management
router.get('/admin/users', authenticate, authorize('admin'), getAllUsers);
router.patch('/admin/users/:id/toggle', authenticate, authorize('admin'), toggleUserStatus);

module.exports = router;
