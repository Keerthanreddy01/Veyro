const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getQuiz, startQuiz, saveAnswer, submitQuiz,
  reportViolation, getMyAttempts, getAttemptResult,
} = require('../controllers/quizController');

router.get('/:id', authenticate, getQuiz);
router.post('/:id/start', authenticate, authorize('student'), startQuiz);
router.get('/:id/attempts', authenticate, authorize('student'), getMyAttempts);
router.get('/:id/results/:attemptId', authenticate, getAttemptResult);
router.patch('/attempts/:id/answer', authenticate, authorize('student'), saveAnswer);
router.post('/attempts/:id/submit', authenticate, authorize('student'), submitQuiz);
router.post('/attempts/:id/violation', authenticate, authorize('student'), reportViolation);

module.exports = router;
