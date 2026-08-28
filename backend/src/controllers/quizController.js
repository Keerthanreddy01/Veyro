const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const Module = require('../models/Module');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

/** Shuffle an array (Fisher-Yates) */
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/** POST /api/modules/:moduleId/quizzes — Instructor creates quiz */
const createQuiz = async (req, res, next) => {
  try {
    const mod = await Module.findById(req.params.moduleId);
    if (!mod) return res.status(404).json({ error: 'Module not found.' });
    const course = await Course.findById(mod.courseId);
    if (course.instructorId.toString() !== req.user.userId)
      return res.status(403).json({ error: 'Access denied.' });

    const { title, timeLimitSeconds, passingScore, maxAttempts, questions } = req.body;
    const quiz = await Quiz.create({ moduleId: mod._id, title, timeLimitSeconds, passingScore, maxAttempts, questions });
    res.status(201).json({ message: 'Quiz created.', quiz });
  } catch (err) { next(err); }
};

/**
 * GET /api/quizzes/:id — Get quiz info (NO correctOptionIndex sent to client).
 * Design Decision: correctOptionIndex is stripped from the response here.
 * Validation always happens server-side in submitQuiz(). Even if someone
 * intercepts the network response, they cannot see correct answers.
 */
const getQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found.' });

    // Strip correct answers before sending to client
    const safeQuiz = {
      _id: quiz._id,
      moduleId: quiz.moduleId,
      title: quiz.title,
      timeLimitSeconds: quiz.timeLimitSeconds,
      passingScore: quiz.passingScore,
      maxAttempts: quiz.maxAttempts,
      questions: quiz.questions.map((q) => ({
        _id: q._id,
        questionText: q.questionText,
        options: q.options,
        points: q.points,
        // correctOptionIndex intentionally omitted
      })),
    };
    res.json({ quiz: safeQuiz });
  } catch (err) { next(err); }
};

/**
 * POST /api/quizzes/:id/start — Student starts a quiz attempt.
 *
 * Anti-cheat: startedAt is set BY THE SERVER here, not by the client.
 * Question and option order are shuffled once and stored in the attempt
 * so reloading mid-quiz shows the same order consistently.
 */
const startQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found.' });

    // Check max attempts
    const attemptCount = await QuizAttempt.countDocuments({
      studentId: req.user.userId,
      quizId: quiz._id,
      submittedAt: { $ne: null },
    });
    if (attemptCount >= quiz.maxAttempts)
      return res.status(400).json({ error: `Maximum attempts (${quiz.maxAttempts}) reached.` });

    // Check for an existing in-progress attempt
    const existing = await QuizAttempt.findOne({
      studentId: req.user.userId,
      quizId: quiz._id,
      submittedAt: null,
    });
    if (existing) {
      // Check if it has timed out — if so, auto-submit it
      const deadline = new Date(existing.startedAt.getTime() + quiz.timeLimitSeconds * 1000);
      if (new Date() > deadline) {
        await _autoSubmit(existing, quiz, 'timeout');
        // Fall through to create a new attempt only if under maxAttempts
      } else {
        // Return the existing attempt with shuffled question map
        return res.json({ attempt: _safeAttempt(existing, quiz), secondsRemaining: Math.ceil((deadline - new Date()) / 1000) });
      }
    }

    // Shuffle question order
    const questionOrder = shuffle(quiz.questions.map((_, i) => i));
    // Shuffle option order per question
    const optionOrders = questionOrder.map((qi) =>
      shuffle(quiz.questions[qi].options.map((_, oi) => oi))
    );

    const attempt = await QuizAttempt.create({
      studentId: req.user.userId,
      quizId: quiz._id,
      startedAt: new Date(), // SERVER sets this
      questionOrder,
      optionOrders,
      answers: new Array(quiz.questions.length).fill(-1),
      maxViolationsAllowed: parseInt(process.env.MAX_TAB_VIOLATIONS) || 3,
    });

    const secondsRemaining = quiz.timeLimitSeconds;
    res.status(201).json({ attempt: _safeAttempt(attempt, quiz), secondsRemaining });
  } catch (err) { next(err); }
};

/**
 * PATCH /api/attempts/:id/answer — Save a single answer mid-quiz.
 * Client calls this whenever the student selects an answer (auto-save).
 * Server checks for timeout before saving.
 */
const saveAnswer = async (req, res, next) => {
  try {
    const attempt = await QuizAttempt.findById(req.params.id);
    if (!attempt) return res.status(404).json({ error: 'Attempt not found.' });
    if (attempt.studentId.toString() !== req.user.userId)
      return res.status(403).json({ error: 'Access denied.' });
    if (attempt.submittedAt)
      return res.status(400).json({ error: 'This attempt has already been submitted.' });

    const quiz = await Quiz.findById(attempt.quizId);
    const deadline = new Date(attempt.startedAt.getTime() + quiz.timeLimitSeconds * 1000);
    if (new Date() > deadline) {
      const submitted = await _autoSubmit(attempt, quiz, 'timeout');
      return res.status(400).json({ error: 'Time is up! Quiz auto-submitted.', attempt: submitted });
    }

    const { questionIndex, answerIndex } = req.body; // questionIndex in shuffled order
    if (questionIndex < 0 || questionIndex >= attempt.answers.length)
      return res.status(400).json({ error: 'Invalid question index.' });

    attempt.answers[questionIndex] = answerIndex;
    attempt.markModified('answers');
    await attempt.save();

    res.json({ message: 'Answer saved.', secondsRemaining: Math.ceil((deadline - new Date()) / 1000) });
  } catch (err) { next(err); }
};

/**
 * POST /api/attempts/:id/submit — Student voluntarily submits the quiz.
 * Server re-checks deadline; late submissions are still scored but flagged.
 */
const submitQuiz = async (req, res, next) => {
  try {
    const attempt = await QuizAttempt.findById(req.params.id);
    if (!attempt) return res.status(404).json({ error: 'Attempt not found.' });
    if (attempt.studentId.toString() !== req.user.userId)
      return res.status(403).json({ error: 'Access denied.' });
    if (attempt.submittedAt)
      return res.status(400).json({ error: 'Already submitted.' });

    const quiz = await Quiz.findById(attempt.quizId);
    const deadline = new Date(attempt.startedAt.getTime() + quiz.timeLimitSeconds * 1000);

    // If late, auto-submit with timeout flag instead
    if (new Date() > deadline) {
      const submitted = await _autoSubmit(attempt, quiz, 'timeout');
      return res.json({ message: 'Submitted after deadline — auto-scored.', attempt: submitted });
    }

    const scored = await _scoreAndSave(attempt, quiz, false, null);
    res.json({ message: 'Quiz submitted!', attempt: scored });
  } catch (err) { next(err); }
};

/**
 * POST /api/attempts/:id/violation — Client reports a tab-switch event.
 * After MAX_TAB_VIOLATIONS, the quiz is auto-submitted.
 */
const reportViolation = async (req, res, next) => {
  try {
    const attempt = await QuizAttempt.findById(req.params.id);
    if (!attempt) return res.status(404).json({ error: 'Attempt not found.' });
    if (attempt.studentId.toString() !== req.user.userId)
      return res.status(403).json({ error: 'Access denied.' });
    if (attempt.submittedAt)
      return res.json({ message: 'Already submitted.' });

    attempt.tabViolations += 1;
    const quiz = await Quiz.findById(attempt.quizId);

    if (attempt.tabViolations >= attempt.maxViolationsAllowed) {
      const submitted = await _autoSubmit(attempt, quiz, 'violations');
      return res.status(200).json({
        message: 'Too many tab switches. Quiz auto-submitted.',
        autoSubmitted: true,
        attempt: submitted,
      });
    }

    await attempt.save();
    res.json({
      message: 'Violation recorded.',
      tabViolations: attempt.tabViolations,
      violationsRemaining: attempt.maxViolationsAllowed - attempt.tabViolations,
    });
  } catch (err) { next(err); }
};

/** GET /api/quizzes/:id/attempts — Student's past attempts for a quiz */
const getMyAttempts = async (req, res, next) => {
  try {
    const attempts = await QuizAttempt.find({
      studentId: req.user.userId,
      quizId: req.params.id,
      submittedAt: { $ne: null },
    }).sort({ submittedAt: -1 });
    res.json({ attempts });
  } catch (err) { next(err); }
};

/** GET /api/quizzes/:id/results/:attemptId — Full results after submission */
const getAttemptResult = async (req, res, next) => {
  try {
    const attempt = await QuizAttempt.findById(req.params.attemptId).populate('quizId');
    if (!attempt) return res.status(404).json({ error: 'Attempt not found.' });
    if (attempt.studentId.toString() !== req.user.userId && req.user.role === 'student')
      return res.status(403).json({ error: 'Access denied.' });
    if (!attempt.submittedAt)
      return res.status(400).json({ error: 'Quiz not yet submitted.' });

    const quiz = attempt.quizId;
    // Now it's safe to send correct answers for review
    const review = attempt.questionOrder.map((qi, shuffledIdx) => {
      const question = quiz.questions[qi];
      const optionOrder = attempt.optionOrders[shuffledIdx];
      const studentShuffledAnswer = attempt.answers[shuffledIdx];
      // Map student's shuffled answer back to original option index
      const studentOriginalAnswer = studentShuffledAnswer >= 0 ? optionOrder[studentShuffledAnswer] : -1;
      return {
        questionText: question.questionText,
        options: optionOrder.map((oi) => question.options[oi]),
        correctOption: optionOrder.indexOf(question.correctOptionIndex),
        studentAnswer: studentShuffledAnswer,
        correct: studentOriginalAnswer === question.correctOptionIndex,
        points: question.points,
      };
    });

    res.json({ attempt, review });
  } catch (err) { next(err); }
};

// ─── Internal helpers ──────────────────────────────────────────────────────────

const _scoreAndSave = async (attempt, quiz, autoSubmitted, autoSubmitReason) => {
  let totalPoints = 0, earnedPoints = 0;
  attempt.questionOrder.forEach((qi, shuffledIdx) => {
    const question = quiz.questions[qi];
    totalPoints += question.points;
    const studentShuffledAnswer = attempt.answers[shuffledIdx] ?? -1;
    if (studentShuffledAnswer >= 0) {
      const optionOrder = attempt.optionOrders[shuffledIdx];
      const originalAnswerIdx = optionOrder[studentShuffledAnswer];
      if (originalAnswerIdx === question.correctOptionIndex) earnedPoints += question.points;
    }
  });

  const scorePercent = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  attempt.score = scorePercent;
  attempt.passed = scorePercent >= quiz.passingScore;
  attempt.submittedAt = new Date();
  attempt.autoSubmitted = autoSubmitted;
  attempt.autoSubmitReason = autoSubmitReason;
  await attempt.save();
  return attempt;
};

const _autoSubmit = async (attempt, quiz, reason) => {
  return _scoreAndSave(attempt, quiz, true, reason);
};

const _safeAttempt = (attempt, quiz) => ({
  _id: attempt._id,
  quizId: attempt.quizId,
  startedAt: attempt.startedAt,
  questionOrder: attempt.questionOrder,
  optionOrders: attempt.optionOrders,
  answers: attempt.answers,
  tabViolations: attempt.tabViolations,
  maxViolationsAllowed: attempt.maxViolationsAllowed,
  submittedAt: attempt.submittedAt,
});

module.exports = { createQuiz, getQuiz, startQuiz, saveAnswer, submitQuiz, reportViolation, getMyAttempts, getAttemptResult };
