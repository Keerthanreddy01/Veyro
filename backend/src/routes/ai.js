const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/aiRateLimiter');
const {
  handleChat,
  getChatHistory,
  clearChatHistory,
  handleRecommendations,
  handleGenerateQuiz,
  handleEvaluateQuiz,
  handleSummarize,
  handleFlashcards,
  handleStudyPlan,
  handleInsights,
  handleHealth,
} = require('../controllers/aiController');

// Public health & capability check
router.get('/health', handleHealth);

// Authenticated AI Endpoints
router.use(authenticate);

// 1. Conversational Tutor & Course-Aware RAG
router.post('/chat', aiRateLimiter, handleChat);
router.get('/chat/history', getChatHistory);
router.delete('/chat/history', clearChatHistory);

// 2. Real Course Recommendations
router.get('/recommendations', aiRateLimiter, handleRecommendations);
router.post('/recommendations', aiRateLimiter, handleRecommendations);

// 3. Practice Quiz Generator & Evaluator
router.post('/quiz/generate', aiRateLimiter, handleGenerateQuiz);
router.post('/quiz/evaluate', handleEvaluateQuiz);

// 4. Notes & Summarization
router.post('/summarize', aiRateLimiter, handleSummarize);

// 5. Revision Flashcards
router.post('/flashcards', aiRateLimiter, handleFlashcards);

// 6. Study Planner
router.post('/study-plan', aiRateLimiter, handleStudyPlan);

// 7. Student Learning Insights & Knowledge Gaps
router.get('/insights', handleInsights);

module.exports = router;

