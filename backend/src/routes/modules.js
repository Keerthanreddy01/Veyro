const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const { upload } = require('../utils/fileUpload');
const { updateModule, deleteModule } = require('../controllers/moduleController');
const { createLesson } = require('../controllers/lessonController');
const { createQuiz } = require('../controllers/quizController');

router.put('/:id', authenticate, authorize('instructor'), updateModule);
router.delete('/:id', authenticate, authorize('instructor', 'admin'), deleteModule);
router.post('/:moduleId/lessons', authenticate, authorize('instructor'), upload.single('file'), createLesson);
router.post('/:moduleId/quizzes', authenticate, authorize('instructor'), createQuiz);

module.exports = router;
