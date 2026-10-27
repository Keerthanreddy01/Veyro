const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const Module = require('../models/Module');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { logAudit, AUDIT_ACTIONS } = require('../utils/auditLogger');

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

    const {
      title,
      timeLimitSeconds,
      passingScore,
      maxAttempts,
      questions,
      isProctored,
      requireCamera,
      maxTabViolations,
      randomizeQuestions,
      randomizeOptions,
      questionPoolSize,
      reviewStatusPolicy,
    } = req.body;

    const quiz = await Quiz.create({
      moduleId: mod._id,
      title,
      timeLimitSeconds: timeLimitSeconds ? Math.max(30, Number(timeLimitSeconds)) : 300,
      passingScore: passingScore !== undefined ? Math.min(100, Math.max(0, Number(passingScore))) : 50,
      maxAttempts: maxAttempts !== undefined ? Math.max(1, Number(maxAttempts)) : 3,
      questions,
      isProctored: Boolean(isProctored || requireCamera),
      requireCamera: Boolean(requireCamera),
      maxTabViolations: maxTabViolations ? Math.max(1, Number(maxTabViolations)) : 3,
      randomizeQuestions: randomizeQuestions !== undefined ? Boolean(randomizeQuestions) : true,
      randomizeOptions: randomizeOptions !== undefined ? Boolean(randomizeOptions) : true,
      questionPoolSize: questionPoolSize ? Math.max(0, Number(questionPoolSize)) : 0,
      reviewStatusPolicy: reviewStatusPolicy || 'standard',
    });

    await logAudit({
      req,
      actorId: req.user.userId,
      actorRole: req.user.role,
      action: AUDIT_ACTIONS.QUIZ_CREATED,
      entityType: 'quiz',
      entityId: quiz._id,
      metadata: {
        title: quiz.title,
        moduleId: mod._id,
        courseId: course._id,
        isProctored: quiz.isProctored,
        requireCamera: quiz.requireCamera,
      },
    });

    res.status(201).json({ message: 'Quiz created.', quiz });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/quizzes/:id — Get quiz info.
 * Instructors/Admins owning the course receive the full quiz with correct answers for editing.
 * Students receive safeQuiz where correctOptionIndex is stripped.
 */
const getQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found.' });

    const mod = await Module.findById(quiz.moduleId);
    if (!mod) return res.status(404).json({ error: 'Module not found.' });

    const course = await Course.findById(mod.courseId);
    if (!course) return res.status(404).json({ error: 'Course not found.' });

    const isManager =
      req.user.role === 'admin' ||
      (req.user.role === 'instructor' && course.instructorId.toString() === req.user.userId);

    if (isManager) {
      const qObj = quiz.toObject ? quiz.toObject() : quiz;
      qObj.courseId = course._id;
      qObj.course = { _id: course._id, title: course.title };
      return res.json({ quiz: qObj });
    }

    if (req.user.role === 'student') {
      const enrolled = await Enrollment.findOne({
        studentId: req.user.userId,
        courseId: mod.courseId,
        status: { $in: ['active', 'completed'] },
      });
      if (!enrolled) {
        return res.status(403).json({ error: 'You must enroll in this course to access this quiz.' });
      }
    }

    // Strip correct answers before sending to student
    const safeQuiz = {
      _id: quiz._id,
      moduleId: quiz.moduleId,
      courseId: course._id,
      course: { _id: course._id, title: course.title },
      title: quiz.title,
      timeLimitSeconds: quiz.timeLimitSeconds,
      passingScore: quiz.passingScore,
      maxAttempts: quiz.maxAttempts,
      isProctored: quiz.isProctored || false,
      requireCamera: quiz.requireCamera || false,
      maxTabViolations: quiz.maxTabViolations || 3,
      randomizeQuestions: quiz.randomizeQuestions ?? true,
      randomizeOptions: quiz.randomizeOptions ?? true,
      questionPoolSize: quiz.questionPoolSize || 0,
      questions: quiz.questions.map((q) => ({
        _id: q._id,
        questionText: q.questionText,
        options: q.options,
        points: q.points,
        // correctOptionIndex intentionally omitted
      })),
    };
    res.json({ quiz: safeQuiz });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/quizzes/:id — Instructor updates their quiz
 */
const updateQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found.' });

    const mod = await Module.findById(quiz.moduleId);
    if (!mod) return res.status(404).json({ error: 'Module not found.' });

    const course = await Course.findById(mod.courseId);
    if (!course) return res.status(404).json({ error: 'Course not found.' });

    if (course.instructorId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. You can only edit quizzes in your own courses.' });
    }

    if (['pending', 'published'].includes(course.status)) {
      return res.status(400).json({
        error: 'Cannot edit quizzes for a course that is pending review or published. Retract to draft first.',
      });
    }

    const {
      title,
      timeLimitSeconds,
      passingScore,
      maxAttempts,
      questions,
      isProctored,
      requireCamera,
      maxTabViolations,
      randomizeQuestions,
      randomizeOptions,
      questionPoolSize,
      reviewStatusPolicy,
    } = req.body;

    if (title !== undefined) quiz.title = title.trim();
    if (timeLimitSeconds !== undefined) quiz.timeLimitSeconds = Math.max(30, Number(timeLimitSeconds) || 30);
    if (passingScore !== undefined) quiz.passingScore = Math.min(100, Math.max(0, Number(passingScore) || 50));
    if (maxAttempts !== undefined) quiz.maxAttempts = Math.max(1, Number(maxAttempts) || 1);
    if (isProctored !== undefined) quiz.isProctored = Boolean(isProctored || requireCamera);
    if (requireCamera !== undefined) {
      quiz.requireCamera = Boolean(requireCamera);
      if (quiz.requireCamera) quiz.isProctored = true;
    }
    if (maxTabViolations !== undefined) quiz.maxTabViolations = Math.max(1, Number(maxTabViolations) || 3);
    if (randomizeQuestions !== undefined) quiz.randomizeQuestions = Boolean(randomizeQuestions);
    if (randomizeOptions !== undefined) quiz.randomizeOptions = Boolean(randomizeOptions);
    if (questionPoolSize !== undefined) quiz.questionPoolSize = Math.max(0, Number(questionPoolSize) || 0);
    if (reviewStatusPolicy !== undefined) quiz.reviewStatusPolicy = reviewStatusPolicy;

    if (questions !== undefined) {
      if (!Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({ error: 'Quiz must have at least one question.' });
      }
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!q.questionText || !q.questionText.trim()) {
          return res.status(400).json({ error: `Question ${i + 1} must have question text.` });
        }
        if (!Array.isArray(q.options) || q.options.length < 2) {
          return res.status(400).json({ error: `Question ${i + 1} must have at least 2 options.` });
        }
        const optIdx = Number(q.correctOptionIndex);
        if (isNaN(optIdx) || optIdx < 0 || optIdx >= q.options.length) {
          return res.status(400).json({ error: `Question ${i + 1} has an invalid correctOptionIndex.` });
        }
      }
      quiz.questions = questions;
    }

    await quiz.save();

    await logAudit({
      req,
      actorId: req.user.userId,
      actorRole: req.user.role,
      action: AUDIT_ACTIONS.QUIZ_UPDATED,
      entityType: 'quiz',
      entityId: quiz._id,
      metadata: {
        title: quiz.title,
        questionCount: quiz.questions?.length,
        isProctored: quiz.isProctored,
        requireCamera: quiz.requireCamera,
      },
    });

    res.json({ message: 'Quiz updated successfully.', quiz });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/quizzes/:id — Instructor/Admin deletes a quiz
 */
const deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found.' });

    const mod = await Module.findById(quiz.moduleId);
    if (!mod) return res.status(404).json({ error: 'Module not found.' });

    const course = await Course.findById(mod.courseId);
    if (!course) return res.status(404).json({ error: 'Course not found.' });

    if (course.instructorId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. You can only delete quizzes in your own courses.' });
    }

    await Quiz.findByIdAndDelete(quiz._id);

    await logAudit({
      req,
      actorId: req.user.userId,
      actorRole: req.user.role,
      action: AUDIT_ACTIONS.QUIZ_DELETED,
      entityType: 'quiz',
      entityId: quiz._id,
      metadata: { title: quiz.title },
    });

    res.json({ message: 'Quiz deleted successfully.' });
  } catch (err) {
    next(err);
  }
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

    const mod = await Module.findById(quiz.moduleId);
    if (!mod) return res.status(404).json({ error: 'Module not found.' });

    const enrolled = await Enrollment.findOne({
      studentId: req.user.userId,
      courseId: mod.courseId,
      status: { $in: ['active', 'completed'] },
    });
    if (!enrolled) {
      return res.status(403).json({ error: 'You must enroll in this course to start the quiz.' });
    }

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
        // Record session_resumed integrity event
        existing.integrityEvents.push({
          eventType: 'session_resumed',
          timestamp: new Date(),
          severity: 'info',
          description: 'Student resumed active examination session after page refresh or network reconnect.',
        });
        await existing.save();

        // Return the existing attempt with shuffled question map
        return res.json({
          attempt: _safeAttempt(existing, quiz),
          secondsRemaining: Math.ceil((deadline - new Date()) / 1000),
          resumed: true,
        });
      }
    }

    // Determine question pool or all questions
    let questionIndices = quiz.questions.map((_, i) => i);
    if (quiz.questionPoolSize && quiz.questionPoolSize > 0 && quiz.questionPoolSize < quiz.questions.length) {
      // Pick random subset of size questionPoolSize
      const shuffledPool = shuffle(questionIndices);
      questionIndices = shuffledPool.slice(0, quiz.questionPoolSize);
    }

    // Question order (shuffled if randomizeQuestions !== false)
    const questionOrder = quiz.randomizeQuestions !== false ? shuffle(questionIndices) : questionIndices;

    // Option orders per question
    const optionOrders = questionOrder.map((qi) => {
      const opts = quiz.questions[qi].options.map((_, oi) => oi);
      return quiz.randomizeOptions !== false ? shuffle(opts) : opts;
    });

    const maxViolations = quiz.maxTabViolations || parseInt(process.env.MAX_TAB_VIOLATIONS, 10) || 3;

    const attempt = await QuizAttempt.create({
      studentId: req.user.userId,
      quizId: quiz._id,
      startedAt: new Date(), // SERVER authoritative start timestamp
      questionOrder,
      optionOrders,
      answers: new Array(questionOrder.length).fill(-1),
      maxViolationsAllowed: maxViolations,
      isProctored: quiz.isProctored || false,
      requireCamera: quiz.requireCamera || false,
      cameraViolations: 0,
      integrityEvents: [],
      reviewStatus: quiz.isProctored ? 'pending_review' : 'cleared',
    });

    await logAudit({
      req,
      actorId: req.user.userId,
      actorRole: req.user.role,
      action: AUDIT_ACTIONS.QUIZ_ATTEMPT_STARTED,
      entityType: 'quiz',
      entityId: quiz._id,
      metadata: {
        attemptId: attempt._id,
        title: quiz.title,
        isProctored: quiz.isProctored,
        requireCamera: quiz.requireCamera,
      },
    });

    const secondsRemaining = quiz.timeLimitSeconds;
    res.status(201).json({ attempt: _safeAttempt(attempt, quiz), secondsRemaining });
  } catch (err) {
    next(err);
  }
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
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/attempts/:id/submit — Student voluntarily submits the quiz.
 * Idempotent: returns existing score if already submitted.
 * Server re-checks deadline; late submissions are auto-scored with timeout reason.
 */
const submitQuiz = async (req, res, next) => {
  try {
    const attempt = await QuizAttempt.findById(req.params.id);
    if (!attempt) return res.status(404).json({ error: 'Attempt not found.' });
    if (attempt.studentId.toString() !== req.user.userId)
      return res.status(403).json({ error: 'Access denied.' });

    // Idempotent submission: if already submitted, return current result
    if (attempt.submittedAt) {
      return res.json({ message: 'Quiz already submitted.', attempt, duplicate: true });
    }

    const quiz = await Quiz.findById(attempt.quizId);
    const deadline = new Date(attempt.startedAt.getTime() + quiz.timeLimitSeconds * 1000);

    // If late, auto-submit with timeout flag instead
    if (new Date() > deadline) {
      const submitted = await _autoSubmit(attempt, quiz, 'timeout');
      return res.json({ message: 'Submitted after deadline — auto-scored.', attempt: submitted });
    }

    const scored = await _scoreAndSave(attempt, quiz, false, null);

    await logAudit({
      req,
      actorId: req.user.userId,
      actorRole: req.user.role,
      action: AUDIT_ACTIONS.QUIZ_ATTEMPT_SUBMITTED,
      entityType: 'quiz',
      entityId: quiz._id,
      metadata: { attemptId: scored._id, score: scored.score, passed: scored.passed, title: quiz.title },
    });

    res.json({ message: 'Quiz submitted!', attempt: scored });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/quizzes/attempts/:id/integrity-event — Record monitoring & anti-cheat events.
 * Handles tab_hidden, tab_blur, face_absent, prolonged_absence, multiple_faces, camera interruptions.
 * Includes throttling/debouncing and server-side enforcement.
 */
const reportIntegrityEvent = async (req, res, next) => {
  try {
    const attempt = await QuizAttempt.findById(req.params.id);
    if (!attempt) return res.status(404).json({ error: 'Attempt not found.' });
    if (attempt.studentId.toString() !== req.user.userId)
      return res.status(403).json({ error: 'Access denied.' });
    if (attempt.submittedAt)
      return res.json({ message: 'Attempt already submitted.' });

    const { eventType, severity = 'warning', description = '' } = req.body;
    const validTypes = [
      'tab_hidden',
      'tab_blur',
      'face_absent',
      'prolonged_absence',
      'multiple_faces',
      'camera_interrupted',
      'camera_restored',
      'network_disconnect',
      'network_reconnect',
      'session_resumed',
    ];

    if (!validTypes.includes(eventType)) {
      return res.status(400).json({ error: `Invalid eventType: ${eventType}` });
    }

    const quiz = await Quiz.findById(attempt.quizId);
    const now = new Date();

    // Debounce / Cooldown check: avoid duplicate identical events within 2 seconds
    const lastEvent = attempt.integrityEvents[attempt.integrityEvents.length - 1];
    if (lastEvent && lastEvent.eventType === eventType && now - new Date(lastEvent.timestamp) < 2000) {
      return res.json({
        message: 'Duplicate event throttled.',
        tabViolations: attempt.tabViolations,
        cameraViolations: attempt.cameraViolations,
        violationsRemaining: Math.max(0, attempt.maxViolationsAllowed - attempt.tabViolations),
      });
    }

    // Process event-specific logic
    if (eventType === 'tab_hidden' || eventType === 'tab_blur') {
      attempt.tabViolations += 1;
      attempt.integrityEvents.push({
        eventType,
        timestamp: now,
        severity: attempt.tabViolations >= attempt.maxViolationsAllowed ? 'critical' : 'warning',
        description: description || `Browser focus lost / tab switched (Violation ${attempt.tabViolations}/${attempt.maxViolationsAllowed})`,
      });

      if (attempt.tabViolations >= attempt.maxViolationsAllowed) {
        attempt.reviewStatus = 'flagged';
        const submitted = await _autoSubmit(attempt, quiz, 'violations');
        return res.status(200).json({
          message: 'Too many tab switches. Assessment auto-submitted.',
          autoSubmitted: true,
          attempt: submitted,
        });
      }
    } else if (
      eventType === 'face_absent' ||
      eventType === 'prolonged_absence' ||
      eventType === 'multiple_faces' ||
      eventType === 'camera_interrupted'
    ) {
      attempt.cameraViolations = (attempt.cameraViolations || 0) + 1;
      const isCritical = eventType === 'prolonged_absence' || attempt.cameraViolations >= 3;
      if (isCritical) {
        attempt.reviewStatus = 'flagged';
      }

      attempt.integrityEvents.push({
        eventType,
        timestamp: now,
        severity: isCritical ? 'critical' : severity,
        description: description || `Camera signal alert: ${eventType.replace(/_/g, ' ')}`,
      });
    } else {
      // General informative event (camera_restored, network_reconnect, etc.)
      attempt.integrityEvents.push({
        eventType,
        timestamp: now,
        severity,
        description: description || `Integrity notice: ${eventType.replace(/_/g, ' ')}`,
      });
    }

    await attempt.save();

    res.json({
      message: 'Integrity event recorded.',
      tabViolations: attempt.tabViolations,
      cameraViolations: attempt.cameraViolations,
      violationsRemaining: Math.max(0, attempt.maxViolationsAllowed - attempt.tabViolations),
      reviewStatus: attempt.reviewStatus,
      autoSubmitted: false,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/quizzes/attempts/:id/violation — Backward-compatible tab violation endpoint.
 * Dispatches to reportIntegrityEvent logic.
 */
const reportViolation = async (req, res, next) => {
  req.body = {
    eventType: 'tab_hidden',
    severity: 'warning',
    description: 'Tab switch detected via client visibility monitor.',
  };
  return reportIntegrityEvent(req, res, next);
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
  } catch (err) {
    next(err);
  }
};

/** GET /api/quizzes/:id/results/:attemptId — Full results after submission */
const getAttemptResult = async (req, res, next) => {
  try {
    const attempt = await QuizAttempt.findById(req.params.attemptId).populate('quizId');
    if (!attempt) return res.status(404).json({ error: 'Attempt not found.' });

    if (attempt.studentId.toString() !== req.user.userId) {
      if (req.user.role === 'student') {
        return res.status(403).json({ error: 'Access denied.' });
      }
      if (req.user.role === 'instructor') {
        const mod = await Module.findById(attempt.quizId.moduleId);
        const course = mod ? await Course.findById(mod.courseId) : null;
        if (!course || course.instructorId.toString() !== req.user.userId) {
          return res.status(403).json({ error: 'Access denied.' });
        }
      }
    }
    if (!attempt.submittedAt)
      return res.status(400).json({ error: 'Quiz not yet submitted.' });

    const quiz = attempt.quizId;
    // Safe to return review questions with correct answers
    const review = attempt.questionOrder.map((qi, shuffledIdx) => {
      const question = quiz.questions[qi];
      const optionOrder = attempt.optionOrders[shuffledIdx];
      const studentShuffledAnswer = attempt.answers[shuffledIdx];
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
  } catch (err) {
    next(err);
  }
};

/** GET /api/quizzes/:id/submissions — Instructor: list student attempts with full integrity metrics */
const getQuizSubmissions = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found.' });

    const mod = await Module.findById(quiz.moduleId);
    if (!mod) return res.status(404).json({ error: 'Module not found.' });

    const course = await Course.findById(mod.courseId);
    if (!course) return res.status(404).json({ error: 'Course not found.' });

    if (course.instructorId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. You can only view submissions for your own quizzes.' });
    }

    const attempts = await QuizAttempt.find({
      quizId: quiz._id,
      submittedAt: { $ne: null },
    })
      .populate('studentId', 'name email')
      .populate('reviewedBy', 'name email')
      .sort({ submittedAt: -1 })
      .lean();

    const submissions = attempts.map((a) => ({
      _id: a._id,
      student: a.studentId,
      score: a.score,
      passed: a.passed,
      tabViolations: a.tabViolations || 0,
      cameraViolations: a.cameraViolations || 0,
      integrityEvents: a.integrityEvents || [],
      reviewStatus: a.reviewStatus || 'cleared',
      instructorNotes: a.instructorNotes || '',
      reviewedBy: a.reviewedBy || null,
      reviewedAt: a.reviewedAt || null,
      isProctored: a.isProctored || quiz.isProctored || false,
      requireCamera: a.requireCamera || quiz.requireCamera || false,
      maxViolationsAllowed: a.maxViolationsAllowed || 3,
      autoSubmitted: a.autoSubmitted || false,
      autoSubmitReason: a.autoSubmitReason || null,
      startedAt: a.startedAt,
      submittedAt: a.submittedAt,
    }));

    res.json({
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        passingScore: quiz.passingScore,
        timeLimitSeconds: quiz.timeLimitSeconds,
        totalQuestions: quiz.questions?.length || 0,
        isProctored: quiz.isProctored || false,
        requireCamera: quiz.requireCamera || false,
      },
      submissions,
      total: submissions.length,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/quizzes/attempts/:id/review — Instructor reviews attempt and updates status/notes
 */
const reviewAttempt = async (req, res, next) => {
  try {
    const attempt = await QuizAttempt.findById(req.params.id);
    if (!attempt) return res.status(404).json({ error: 'Attempt not found.' });

    const quiz = await Quiz.findById(attempt.quizId);
    const mod = quiz ? await Module.findById(quiz.moduleId) : null;
    const course = mod ? await Course.findById(mod.courseId) : null;

    if (!course) return res.status(404).json({ error: 'Associated course not found.' });

    if (course.instructorId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. You can only review attempts for your own courses.' });
    }

    const { reviewStatus, instructorNotes } = req.body;
    const allowedStatuses = ['cleared', 'flagged', 'verified', 'pending_review'];

    if (reviewStatus && !allowedStatuses.includes(reviewStatus)) {
      return res.status(400).json({ error: `Invalid reviewStatus. Allowed: ${allowedStatuses.join(', ')}` });
    }

    if (reviewStatus) attempt.reviewStatus = reviewStatus;
    if (instructorNotes !== undefined) attempt.instructorNotes = String(instructorNotes).trim();
    attempt.reviewedBy = req.user.userId;
    attempt.reviewedAt = new Date();

    await attempt.save();

    await logAudit({
      req,
      actorId: req.user.userId,
      actorRole: req.user.role,
      action: AUDIT_ACTIONS.QUIZ_ATTEMPT_REVIEWED,
      entityType: 'quiz_attempt',
      entityId: attempt._id,
      metadata: {
        quizId: quiz._id,
        studentId: attempt.studentId,
        reviewStatus: attempt.reviewStatus,
        notesLength: attempt.instructorNotes.length,
      },
    });

    res.json({
      message: 'Attempt review updated successfully.',
      attempt: {
        _id: attempt._id,
        reviewStatus: attempt.reviewStatus,
        instructorNotes: attempt.instructorNotes,
        reviewedBy: attempt.reviewedBy,
        reviewedAt: attempt.reviewedAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Internal helpers ──────────────────────────────────────────────────────────

const _scoreAndSave = async (attempt, quiz, autoSubmitted, autoSubmitReason) => {
  let totalPoints = 0,
    earnedPoints = 0;
  attempt.questionOrder.forEach((qi, shuffledIdx) => {
    const question = quiz.questions[qi];
    totalPoints += question.points || 1;
    const studentShuffledAnswer = attempt.answers[shuffledIdx] ?? -1;
    if (studentShuffledAnswer >= 0) {
      const optionOrder = attempt.optionOrders[shuffledIdx];
      const originalAnswerIdx = optionOrder[studentShuffledAnswer];
      if (originalAnswerIdx === question.correctOptionIndex) earnedPoints += question.points || 1;
    }
  });

  const scorePercent = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  attempt.score = scorePercent;
  attempt.passed = scorePercent >= quiz.passingScore;
  attempt.submittedAt = new Date();
  attempt.autoSubmitted = autoSubmitted;
  attempt.autoSubmitReason = autoSubmitReason;

  // Auto-flag if severe violations occurred
  if (attempt.tabViolations >= attempt.maxViolationsAllowed || (attempt.cameraViolations && attempt.cameraViolations >= 3)) {
    attempt.reviewStatus = 'flagged';
  } else if (!attempt.reviewStatus) {
    attempt.reviewStatus = quiz.isProctored ? 'pending_review' : 'cleared';
  }

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
  tabViolations: attempt.tabViolations || 0,
  cameraViolations: attempt.cameraViolations || 0,
  maxViolationsAllowed: attempt.maxViolationsAllowed || 3,
  isProctored: attempt.isProctored || false,
  requireCamera: attempt.requireCamera || false,
  integrityEvents: attempt.integrityEvents || [],
  reviewStatus: attempt.reviewStatus || 'cleared',
  submittedAt: attempt.submittedAt,
});

module.exports = {
  createQuiz,
  getQuiz,
  updateQuiz,
  deleteQuiz,
  startQuiz,
  saveAnswer,
  submitQuiz,
  reportViolation,
  reportIntegrityEvent,
  reviewAttempt,
  getMyAttempts,
  getAttemptResult,
  getQuizSubmissions,
};
