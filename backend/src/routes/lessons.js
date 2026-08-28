const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const { upload } = require('../utils/fileUpload');
const { updateLesson, deleteLesson, getLessonById, updateProgress } = require('../controllers/lessonController');

router.get('/:id', authenticate, getLessonById);
router.put('/:id', authenticate, authorize('instructor'), upload.single('file'), updateLesson);
router.delete('/:id', authenticate, authorize('instructor', 'admin'), deleteLesson);
router.post('/:id/progress', authenticate, authorize('student'), updateProgress);

module.exports = router;
