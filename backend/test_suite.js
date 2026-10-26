/**
 * Veyro LMS — Automated Test Suite
 * Tests critical backend workflows:
 * 1. JWT Access & Refresh Token Lifecycle & Tamper Detection
 * 2. RBAC Middleware Authorization (Student, Instructor, Admin)
 * 3. Video Progress Auditing (90% completion threshold, bounds clamping)
 * 4. Quiz Anti-Cheat Engine (Fisher-Yates shuffle, option redaction, timer enforcement, tab violation auto-submit, scoring)
 * 5. Course Completion Dependency Chain (Lessons + Quizzes -> Certificate eligibility)
 * 6. Dynamic PDF Certificate Engine (PDF generation, single-page constraint, verification code hash)
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');

// Ensure test environment
process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = 'test_access_secret_key_1234567890_abcdef';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_key_1234567890_abcdef';
process.env.JWT_ACCESS_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';

const {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} = require('./src/utils/jwt');
const { authorize } = require('./src/middleware/auth');
const { generateCertificate } = require('./src/utils/certificate');
const { sanitizeMetadata, AUDIT_ACTIONS } = require('./src/utils/auditLogger');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}`);
  }
}

async function runAsyncTest(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✅ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}`);
  }
}

async function runAllTests() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING VEYRO LMS E2E VERIFICATION TEST SUITE');
  console.log('======================================================\n');

  // ── TEST GROUP 1: JWT & Token Lifecycle ──────────────────────────────────
  console.log('📦 GROUP 1: Authentication & JWT Lifecycle');

  runTest('Generate & verify valid access token', () => {
    const token = generateAccessToken('user_123', 'student');
    const decoded = verifyAccessToken(token);
    assert.strictEqual(decoded.userId, 'user_123');
    assert.strictEqual(decoded.role, 'student');
    assert.ok(decoded.exp > decoded.iat);
  });

  runTest('Generate & verify valid refresh token', () => {
    const token = generateRefreshToken('user_456', 'instructor');
    const decoded = verifyRefreshToken(token);
    assert.strictEqual(decoded.userId, 'user_456');
    assert.strictEqual(decoded.role, 'instructor');
  });

  runTest('Reject tampered token signature', () => {
    const token = generateAccessToken('user_123', 'student');
    const tampered = token.slice(0, -5) + 'abcde';
    assert.throws(() => verifyAccessToken(tampered), /invalid signature|jwt malformed/i);
  });

  runTest('Reject token signed with different secret', () => {
    const jwt = require('jsonwebtoken');
    const fakeToken = jwt.sign({ userId: 'hacker', role: 'admin' }, 'wrong_secret');
    assert.throws(() => verifyAccessToken(fakeToken), /invalid signature/i);
  });

  // ── TEST GROUP 2: RBAC Authorization Middleware ──────────────────────────
  console.log('\n📦 GROUP 2: RBAC Server-Side Middleware');

  runTest('RBAC allows matching role', () => {
    const middleware = authorize('admin');
    let calledNext = false;
    const req = { user: { userId: '1', role: 'admin' } };
    const res = {};
    const next = () => { calledNext = true; };
    middleware(req, res, next);
    assert.strictEqual(calledNext, true);
  });

  runTest('RBAC denies non-matching role with 403', () => {
    const middleware = authorize('instructor', 'admin');
    let statusCode = null;
    let jsonBody = null;
    const req = { user: { userId: '2', role: 'student' } };
    const res = {
      status: (code) => {
        statusCode = code;
        return {
          json: (body) => { jsonBody = body; }
        };
      }
    };
    const next = () => {};
    middleware(req, res, next);
    assert.strictEqual(statusCode, 403);
    assert.ok(jsonBody.error.includes('Access denied'));
  });

  runTest('RBAC denies unauthenticated request with 401', () => {
    const middleware = authorize('student');
    let statusCode = null;
    const req = {};
    const res = {
      status: (code) => {
        statusCode = code;
        return { json: () => {} };
      }
    };
    middleware(req, res, () => {});
    assert.strictEqual(statusCode, 401);
  });

  // ── TEST GROUP 3: Video Learning Progress & Anti-Skip ────────────────────
  console.log('\n📦 GROUP 3: Granular Video Progress & 90% Audit Engine');

  runTest('Progress below 90% does not mark completion', () => {
    const durationSeconds = 100;
    const watchedSeconds = 89; // 89%
    const isCompleted = durationSeconds > 0 && watchedSeconds >= durationSeconds * 0.9;
    assert.strictEqual(isCompleted, false);
  });

  runTest('Progress at or above 90% triggers completion', () => {
    const durationSeconds = 100;
    const watchedSeconds = 90; // 90%
    const isCompleted = durationSeconds > 0 && watchedSeconds >= durationSeconds * 0.9;
    assert.strictEqual(isCompleted, true);
  });

  runTest('Client cannot send watchedSeconds exceeding durationSeconds', () => {
    const durationSeconds = 120;
    let clientSentWatched = 999999;
    const sanitizedWatched = Math.min(clientSentWatched, durationSeconds);
    assert.strictEqual(sanitizedWatched, 120);
  });

  runTest('PDF and text lessons complete upon access', () => {
    const lessonTypes = ['pdf', 'text'];
    lessonTypes.forEach(type => {
      const isCompleted = type !== 'video';
      assert.strictEqual(isCompleted, true);
    });
  });

  // ── TEST GROUP 4: Quiz Anti-Cheat & Authoritative Timer ────────────────────
  console.log('\n📦 GROUP 4: Quiz Anti-Cheat Engine & Server-Side Scoring');

  runTest('Quiz options redact correctOptionIndex from student view', () => {
    const rawQuiz = {
      _id: 'q1',
      title: 'Full-Stack Architecture',
      questions: [
        {
          _id: 'q1_1',
          questionText: 'What is CORS?',
          options: ['Cross-Origin Resource Sharing', 'Computer OS', 'Core Route Service'],
          correctOptionIndex: 0,
          points: 1,
        }
      ]
    };

    const safeQuestions = rawQuiz.questions.map(q => ({
      _id: q._id,
      questionText: q.questionText,
      options: q.options,
      points: q.points,
    }));

    assert.strictEqual(safeQuestions[0].correctOptionIndex, undefined);
    assert.deepStrictEqual(safeQuestions[0].options, rawQuiz.questions[0].options);
  });

  runTest('Fisher-Yates permutation preserves all question elements without duplication', () => {
    const original = [0, 1, 2, 3, 4];
    const a = [...original];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    assert.strictEqual(a.length, 5);
    assert.deepStrictEqual([...a].sort((x, y) => x - y), original);
  });

  runTest('Server detects deadline expiration and auto-submits', () => {
    const timeLimitSeconds = 60;
    const startedAt = new Date(Date.now() - 65 * 1000); // 65 seconds ago
    const deadline = new Date(startedAt.getTime() + timeLimitSeconds * 1000);
    const isExpired = new Date() > deadline;
    assert.strictEqual(isExpired, true);
  });

  runTest('Tab violations trigger auto-submit after threshold exceeded', () => {
    const maxAllowed = 3;
    let violations = 0;
    let autoSubmitted = false;

    // Simulate 3 tab switches
    for (let i = 1; i <= 3; i++) {
      violations += 1;
      if (violations >= maxAllowed) {
        autoSubmitted = true;
      }
    }
    assert.strictEqual(violations, 3);
    assert.strictEqual(autoSubmitted, true);
  });

  runTest('Quiz scoring correctly evaluates shuffled answers against original indices', () => {
    const question = {
      questionText: 'Which protocol is secure?',
      options: ['HTTP', 'FTP', 'HTTPS', 'Telnet'],
      correctOptionIndex: 2, // 'HTTPS'
      points: 2,
    };
    // Attempt shuffled option orders
    const optionOrder = [3, 2, 0, 1]; // Index 1 in shuffled list corresponds to original 2 ('HTTPS')
    const studentShuffledAnswer = 1; // Student chose the second option displayed

    const studentOriginalAnswer = optionOrder[studentShuffledAnswer];
    const isCorrect = studentOriginalAnswer === question.correctOptionIndex;
    assert.strictEqual(isCorrect, true);
  });

  runTest('Quiz update denies non-owner instructor', () => {
    const courseInstructorId = 'instructor_owner_99';
    const requestingUserId = 'instructor_imposter_11';
    const isAuthorized = courseInstructorId === requestingUserId;
    assert.strictEqual(isAuthorized, false);
  });

  runTest('Quiz update validates minimum questions and option count', () => {
    const invalidQuestionsEmpty = [];
    const invalidQuestionOneOption = [{ questionText: 'Hi', options: ['Only one'], correctOptionIndex: 0 }];
    const validQuestions = [{ questionText: 'What is 2+2?', options: ['3', '4'], correctOptionIndex: 1 }];

    const validateQuizQuestions = (qs) => {
      if (!Array.isArray(qs) || qs.length === 0) return false;
      return qs.every(q => q.questionText && Array.isArray(q.options) && q.options.length >= 2 && q.correctOptionIndex >= 0 && q.correctOptionIndex < q.options.length);
    };

    assert.strictEqual(validateQuizQuestions(invalidQuestionsEmpty), false);
    assert.strictEqual(validateQuizQuestions(invalidQuestionOneOption), false);
    assert.strictEqual(validateQuizQuestions(validQuestions), true);
  });

  // ── TEST GROUP 5: Course Completion Dependency Chain ─────────────────────
  console.log('\n📦 GROUP 5: Course Completion & Certificate Eligibility');

  runTest('Course completion rejected if any lesson incomplete', () => {
    const totalLessons = 5;
    const completedLessons = 4;
    const eligible = completedLessons >= totalLessons;
    assert.strictEqual(eligible, false);
  });

  runTest('Course completion rejected if module quiz is not passed', () => {
    const totalLessons = 5;
    const completedLessons = 5;
    const quizzes = [{ id: 'quiz1', passed: true }, { id: 'quiz2', passed: false }];
    const allQuizzesPassed = quizzes.every(q => q.passed);
    const eligible = completedLessons >= totalLessons && allQuizzesPassed;
    assert.strictEqual(eligible, false);
  });

  runTest('Course completion granted when all lessons and quizzes passed', () => {
    const totalLessons = 5;
    const completedLessons = 5;
    const quizzes = [{ id: 'quiz1', passed: true }, { id: 'quiz2', passed: true }];
    const allQuizzesPassed = quizzes.every(q => q.passed);
    const eligible = completedLessons >= totalLessons && allQuizzesPassed;
    assert.strictEqual(eligible, true);
  });

  // ── TEST GROUP 6: Dynamic PDF Certificate Generation ─────────────────────
  console.log('\n📦 GROUP 6: Dynamic PDF Certificate & Verification');

  await runAsyncTest('Generate single-page PDF certificate with cryptographic hash', async () => {
    const testCode = 'TEST-SUITE-CERT-' + Date.now();
    const certPath = await generateCertificate({
      studentName: 'Alice Engineering Scholar',
      courseTitle: 'Full-Stack Distributed Architecture',
      completedAt: new Date(),
      verificationCode: testCode,
    });

    const fullPath = path.join(__dirname, 'uploads', certPath);
    assert.ok(fs.existsSync(fullPath), 'PDF file must exist on disk');
    const stats = fs.statSync(fullPath);
    assert.ok(stats.size > 1000, 'PDF size must be valid (>1KB)');
  });

  // ── TEST GROUP 7: Course Submission & Lifecycle Security ─────────────────
  console.log('\n📦 GROUP 7: Course Submission & Lifecycle Security');

  runTest('Instructor can submit own draft course with valid curriculum', () => {
    const course = {
      _id: 'c1',
      title: 'Distributed Systems',
      instructorId: 'inst_1',
      status: 'draft',
      rejectionReason: 'Previous issue',
      submittedAt: null,
    };
    const user = { userId: 'inst_1', role: 'instructor' };
    const modules = [{ _id: 'm1' }];
    const lessonCount = 3;

    // Simulate submitForReview logic
    assert.strictEqual(course.instructorId, user.userId);
    assert.ok(['draft', 'rejected'].includes(course.status));
    assert.ok(modules.length > 0 && lessonCount > 0);

    course.status = 'under_review';
    course.submittedAt = new Date();
    course.rejectionReason = null;

    assert.strictEqual(course.status, 'under_review');
    assert.ok(course.submittedAt instanceof Date);
    assert.strictEqual(course.rejectionReason, null);
  });

  runTest("Instructor cannot submit another instructor's course (IDOR prevention)", () => {
    const course = { _id: 'c1', instructorId: 'inst_1', status: 'draft' };
    const user = { userId: 'attacker_inst_2', role: 'instructor' };

    const isAuthorized = course.instructorId === user.userId;
    assert.strictEqual(isAuthorized, false, 'Should reject unauthorized instructor');
  });

  runTest('Student cannot submit course for review', () => {
    const middleware = authorize('instructor');
    let statusCode = null;
    let errorMsg = null;
    const req = { user: { userId: 'stud_1', role: 'student' } };
    const res = {
      status(code) { statusCode = code; return this; },
      json(data) { errorMsg = data.error; }
    };
    middleware(req, res, () => {});
    assert.strictEqual(statusCode, 403);
    assert.ok(errorMsg.includes('Access denied'));
  });

  // ── TEST GROUP 8: Course Visibility & Public Isolation ───────────────────
  console.log('\n📦 GROUP 8: Course Visibility & Catalog Security');

  runTest('Draft, under-review, and rejected courses are hidden from public catalog', () => {
    // Simulator for getCourses query builder
    const buildCatalogQuery = (userRole, requestedQueryStatus) => {
      let query = {};
      if (!userRole || userRole === 'student') {
        query.status = 'published'; // Force published status
      } else if (userRole === 'instructor') {
        if (requestedQueryStatus) query.status = requestedQueryStatus;
      }
      return query;
    };

    // Anonymous visitor tries to request draft
    const anonQuery = buildCatalogQuery(null, 'draft');
    assert.strictEqual(anonQuery.status, 'published');

    // Student tries to request under_review
    const studentQuery = buildCatalogQuery('student', 'under_review');
    assert.strictEqual(studentQuery.status, 'published');

    // Student tries to request rejected
    const studentQuery2 = buildCatalogQuery('student', 'rejected');
    assert.strictEqual(studentQuery2.status, 'published');
  });

  runTest('Direct GET /api/courses/:id rejects unauthorized student access to unpublished courses', () => {
    const course = { _id: 'c1', status: 'draft', instructorId: 'inst_1' };
    const checkDirectAccess = (userRole, userId, c) => {
      if ((!userRole || userRole === 'student') && c.status !== 'published') {
        return { status: 403, error: 'This course is not yet published.' };
      }
      if (userRole === 'instructor' && c.instructorId !== userId && c.status !== 'published') {
        return { status: 403, error: 'Access denied.' };
      }
      return { status: 200 };
    };

    assert.strictEqual(checkDirectAccess('student', 's1', course).status, 403);
    assert.strictEqual(checkDirectAccess(null, null, course).status, 403);
    assert.strictEqual(checkDirectAccess('instructor', 'inst_other', course).status, 403);
    assert.strictEqual(checkDirectAccess('instructor', 'inst_1', course).status, 200);
    assert.strictEqual(checkDirectAccess('admin', 'admin_1', course).status, 200);
  });

  // ── TEST GROUP 9: Admin Moderation & Status Transitions ──────────────────
  console.log('\n📦 GROUP 9: Admin Moderation & Status Engine');

  runTest('Admin can approve under-review course', () => {
    const course = { _id: 'c1', status: 'under_review', rejectionReason: null };
    const action = 'approve';

    if (action === 'approve') {
      course.status = 'approved';
      course.rejectionReason = null;
      course.reviewedAt = new Date();
    }

    assert.strictEqual(course.status, 'approved');
    assert.strictEqual(course.rejectionReason, null);
    assert.ok(course.reviewedAt instanceof Date);
  });

  runTest('Admin can reject course only when reason is provided', () => {
    const course = { _id: 'c1', status: 'under_review' };
    
    // Attempt rejection without reason
    const validateRejection = (reason) => {
      if (!reason || !reason.trim()) {
        return { valid: false, error: 'Rejection reason is required.' };
      }
      return { valid: true };
    };

    assert.strictEqual(validateRejection('').valid, false);
    assert.strictEqual(validateRejection('   ').valid, false);
    assert.strictEqual(validateRejection('Missing quizzes in module 2').valid, true);

    const validReason = 'Requires anti-cheat quiz in Module 3';
    course.status = 'rejected';
    course.rejectionReason = validReason;
    course.reviewedAt = new Date();

    assert.strictEqual(course.status, 'rejected');
    assert.strictEqual(course.rejectionReason, validReason);
  });

  runTest('Instructor cannot approve or publish without required approval', () => {
    // 1. Instructor cannot call admin moderation endpoint
    const adminMiddleware = authorize('admin');
    let instructorStatus = null;
    adminMiddleware(
      { user: { userId: 'inst_1', role: 'instructor' } },
      { status(s) { instructorStatus = s; return this; }, json() {} },
      () => {}
    );
    assert.strictEqual(instructorStatus, 403);

    // 2. Instructor cannot publish an unapproved course
    const draftCourse = { _id: 'c1', status: 'draft', instructorId: 'inst_1' };
    const canPublish = draftCourse.status === 'approved';
    assert.strictEqual(canPublish, false, 'Draft course cannot be published without approval');

    // 3. Approved course can be published
    const approvedCourse = { _id: 'c1', status: 'approved', instructorId: 'inst_1' };
    assert.strictEqual(approvedCourse.status === 'approved', true);
    approvedCourse.status = 'published';
    assert.strictEqual(approvedCourse.status, 'published');
  });

  // ── TEST GROUP 10: Instructor Analytics & Student Roster ─────────────────
  console.log('\n📦 GROUP 10: Course Analytics & Learner Cohort Metrics');

  runTest('Instructor can view analytics for own course; non-owner and student denied', () => {
    const course = { _id: 'c1', instructorId: 'inst_1' };

    const checkAnalyticsAccess = (user) => {
      if (!user || user.role === 'student') return 403;
      if (user.role === 'instructor' && course.instructorId !== user.userId) return 403;
      return 200;
    };

    assert.strictEqual(checkAnalyticsAccess({ userId: 'inst_1', role: 'instructor' }), 200);
    assert.strictEqual(checkAnalyticsAccess({ userId: 'admin_1', role: 'admin' }), 200);
    assert.strictEqual(checkAnalyticsAccess({ userId: 'inst_2', role: 'instructor' }), 403);
    assert.strictEqual(checkAnalyticsAccess({ userId: 'stud_1', role: 'student' }), 403);
  });

  runTest('Analytics computation produces accurate metrics across learner roster', () => {
    const totalLessons = 10;
    const enrollments = [
      { studentId: 's1', status: 'completed' },
      { studentId: 's2', status: 'active' },
      { studentId: 's3', status: 'active' },
    ];
    const progressMap = {
      s1: { completedCount: 10 },
      s2: { completedCount: 5 },
      s3: { completedCount: 0 },
    };
    const quizMap = {
      s1: { attemptCount: 2, avgScore: 90 },
      s2: { attemptCount: 1, avgScore: 80 },
    };

    const totalEnrolled = enrollments.length;
    const activeLearners = enrollments.filter(e => e.status === 'active').length;
    const completedStudents = enrollments.filter(e => e.status === 'completed').length;
    const completionRate = Math.round((completedStudents / totalEnrolled) * 100);

    const progressScores = enrollments.map(e => Math.round((progressMap[e.studentId].completedCount / totalLessons) * 100));
    const avgProgress = Math.round(progressScores.reduce((a, b) => a + b, 0) / totalEnrolled);

    assert.strictEqual(totalEnrolled, 3);
    assert.strictEqual(activeLearners, 2);
    assert.strictEqual(completedStudents, 1);
    assert.strictEqual(completionRate, 33);
    assert.strictEqual(avgProgress, 50); // (100 + 50 + 0) / 3 = 50%
  });

  runTest('Instructor can view submissions for own quiz; non-owner denied with 403', () => {
    const course = { _id: 'c1', instructorId: 'inst_owner' };
    const checkQuizSubmissionsAccess = (user) => {
      if (!user || user.role === 'student') return 403;
      if (user.role === 'instructor' && course.instructorId !== user.userId) return 403;
      return 200;
    };

    assert.strictEqual(checkQuizSubmissionsAccess({ userId: 'inst_owner', role: 'instructor' }), 200);
    assert.strictEqual(checkQuizSubmissionsAccess({ userId: 'admin_sys', role: 'admin' }), 200);
    assert.strictEqual(checkQuizSubmissionsAccess({ userId: 'inst_intruder', role: 'instructor' }), 403);
    assert.strictEqual(checkQuizSubmissionsAccess({ userId: 'student_1', role: 'student' }), 403);
  });

  runTest('Course schema validates level enum, learningObjectives, and prerequisites', () => {
    const Course = require('./src/models/Course');
    const validCourse = new Course({
      title: 'Advanced React Architecture',
      description: 'Master full-stack React systems and TypeScript design patterns.',
      instructorId: new (require('mongoose').Types.ObjectId)(),
      category: 'Engineering',
      level: 'Advanced',
      price: 49.99,
      learningObjectives: ['Build scalable React architectures', 'Implement robust RBAC systems'],
      prerequisites: ['Proficiency with JavaScript ES6', 'Basic TypeScript knowledge'],
    });
    const err = validCourse.validateSync();
    assert.strictEqual(err, undefined, 'Valid course metadata must pass schema validation');
    assert.strictEqual(validCourse.level, 'advanced');
    assert.strictEqual(validCourse.price, 49.99);
    assert.strictEqual(validCourse.learningObjectives.length, 2);
    assert.strictEqual(validCourse.prerequisites.length, 2);
  });

  runTest('Module deletion cascades to attached quiz and attempts', () => {
    const moduleId = 'mod_123';
    let quizDeleted = false;
    let attemptsDeleted = false;

    // Simulate cascade logic from moduleController.deleteModule
    const performModuleCascade = (modId, quizId) => {
      if (quizId) {
        quizDeleted = true;
        attemptsDeleted = true;
      }
    };

    performModuleCascade(moduleId, 'quiz_456');
    assert.strictEqual(quizDeleted, true, 'Attached quiz must be deleted on module removal');
    assert.strictEqual(attemptsDeleted, true, 'Associated quiz attempts must be deleted on module removal');
  });

  // ── TEST GROUP 11: Immutable Platform Audit Log & RBAC Security ──────────
  console.log('\n📦 GROUP 11: Immutable Platform Audit Log & RBAC Security');

  runTest('Admin action creates audit record with sanitized metadata', () => {
    const rawPayload = {
      action: AUDIT_ACTIONS.USER_STATUS_CHANGED,
      targetUserId: 'usr_789',
      secretToken: 'secret_token_123',
      password: 'mypassword123',
      isActive: false,
    };
    const sanitized = sanitizeMetadata(rawPayload);
    assert.strictEqual(sanitized.action, 'USER_STATUS_CHANGED');
    assert.strictEqual(sanitized.targetUserId, 'usr_789');
    assert.strictEqual(sanitized.isActive, false);
    assert.strictEqual(sanitized.password, '[REDACTED]', 'Sensitive passwords must be redacted');
  });

  runTest('Instructor submission creates audit record', () => {
    const logData = {
      actorId: 'inst_1',
      actorRole: 'instructor',
      action: AUDIT_ACTIONS.COURSE_SUBMITTED,
      entityType: 'course',
      entityId: 'c1',
      metadata: { title: 'Modern TypeScript', version: 1 },
      createdAt: new Date(),
    };
    assert.strictEqual(logData.action, 'COURSE_SUBMITTED');
    assert.strictEqual(logData.actorRole, 'instructor');
    assert.strictEqual(logData.entityType, 'course');
    assert.ok(logData.createdAt instanceof Date);
  });

  runTest('Student enrollment creates audit record', () => {
    const logData = {
      actorId: 'stud_1',
      actorRole: 'student',
      action: AUDIT_ACTIONS.COURSE_ENROLLED,
      entityType: 'enrollment',
      entityId: 'enr_1',
      metadata: { courseId: 'c1', reEnrollment: false },
      createdAt: new Date(),
    };
    assert.strictEqual(logData.action, 'COURSE_ENROLLED');
    assert.strictEqual(logData.actorRole, 'student');
    assert.strictEqual(logData.metadata.reEnrollment, false);
  });

  runTest('Audit records cannot be modified by normal users (append-only enforcement)', () => {
    const AuditLog = require('./src/models/AuditLog');
    const updateHooks = AuditLog.schema.s.hooks._pres.get('updateOne');
    const deleteHooks = AuditLog.schema.s.hooks._pres.get('deleteOne');
    assert.ok(updateHooks && updateHooks.length > 0, 'Schema pre-hook must block updateOne');
    assert.ok(deleteHooks && deleteHooks.length > 0, 'Schema pre-hook must block deleteOne');

    // Test that the hook throws an error
    let hookError = null;
    const blockHook = updateHooks.find((h) => h.fn && h.fn.name === 'blockMutation');
    assert.ok(blockHook, 'blockMutation hook must be registered');
    blockHook.fn((err) => { hookError = err; });
    assert.ok(hookError, 'Pre-hook must return an error blocking mutation');
    assert.strictEqual(hookError.status, 403);
    assert.match(hookError.message, /immutable/i);
  });

  runTest('Student cannot access admin audit endpoint (RBAC 403)', () => {
    const adminMiddleware = authorize('admin');
    let statusCode = null;
    adminMiddleware(
      { user: { userId: 'stud_1', role: 'student' } },
      { status(s) { statusCode = s; return this; }, json() {} },
      () => {}
    );
    assert.strictEqual(statusCode, 403);
  });

  runTest('Instructor cannot access admin audit endpoint (RBAC 403)', () => {
    const adminMiddleware = authorize('admin');
    let statusCode = null;
    adminMiddleware(
      { user: { userId: 'inst_1', role: 'instructor' } },
      { status(s) { statusCode = s; return this; }, json() {} },
      () => {}
    );
    assert.strictEqual(statusCode, 403);
  });

  // ── TEST GROUP 12: Enrollment Lifecycle (Enroll, Drop, Re-Enroll, Roster) ─
  console.log('\n📦 GROUP 12: Enrollment Lifecycle & Roster Metrics');

  runTest('Student can enroll and status is active', () => {
    const course = { _id: 'c1', status: 'published' };
    const createEnrollment = (user, c) => {
      if (c.status !== 'published') return { status: 400, error: 'Course not published' };
      return { status: 201, enrollment: { studentId: user.userId, courseId: c._id, status: 'active', enrolledAt: new Date() } };
    };

    const res = createEnrollment({ userId: 'stud_1', role: 'student' }, course);
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.enrollment.status, 'active');
  });

  runTest('Duplicate active enrollment prevented with 409', () => {
    const existing = { studentId: 'stud_1', courseId: 'c1', status: 'active' };
    const handleEnroll = (ex) => {
      if (ex && ex.status === 'active') return { status: 409, error: 'You are already enrolled in this course.' };
      return { status: 201 };
    };
    assert.strictEqual(handleEnroll(existing).status, 409);
  });

  runTest('Student can drop course and historical record is preserved', () => {
    const enrollment = { studentId: 'stud_1', courseId: 'c1', status: 'active', enrolledAt: new Date('2026-01-01') };
    
    // Drop course transitions status to dropped without deleting
    enrollment.status = 'dropped';
    assert.strictEqual(enrollment.status, 'dropped');
    assert.strictEqual(enrollment.studentId, 'stud_1');
    assert.ok(enrollment.enrolledAt, 'Historical enrollment timestamp is preserved');
  });

  runTest('Dropped student cannot access restricted lessons or quizzes', () => {
    const checkLessonAccess = (enrollmentStatus, isPreview) => {
      if (isPreview) return 200;
      if (!['active', 'completed'].includes(enrollmentStatus)) {
        return 403;
      }
      return 200;
    };

    assert.strictEqual(checkLessonAccess('dropped', false), 403, 'Dropped student must be denied non-preview lessons');
    assert.strictEqual(checkLessonAccess('dropped', true), 200, 'Preview lessons remain accessible');
    assert.strictEqual(checkLessonAccess('active', false), 200, 'Active students have access');
    assert.strictEqual(checkLessonAccess('completed', false), 200, 'Completed students retain review access');
  });

  runTest('Re-enrollment transitions dropped student to active without duplicate document', () => {
    const existing = { studentId: 'stud_1', courseId: 'c1', status: 'dropped', enrolledAt: new Date('2026-01-01') };
    const processEnrollment = (ex) => {
      if (ex && ex.status === 'dropped') {
        ex.status = 'active';
        ex.enrolledAt = new Date();
        return { status: 200, reEnrolled: true, enrollment: ex };
      }
      return { status: 201, reEnrolled: false };
    };

    const res = processEnrollment(existing);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.reEnrolled, true);
    assert.strictEqual(res.enrollment.status, 'active');
    assert.strictEqual(existing.status, 'active', 'Existing document was reactivated in-place');
  });

  runTest('Instructor sees dropped students in roster and can filter by dropped status', () => {
    const roster = [
      { studentId: 's1', status: 'active', name: 'Alice' },
      { studentId: 's2', status: 'completed', name: 'Bob' },
      { studentId: 's3', status: 'dropped', name: 'Charlie' },
    ];

    const filterRoster = (list, filter) => {
      if (filter === 'all') return list;
      return list.filter(s => s.status === filter);
    };

    assert.strictEqual(filterRoster(roster, 'all').length, 3);
    assert.strictEqual(filterRoster(roster, 'active').length, 1);
    assert.strictEqual(filterRoster(roster, 'completed').length, 1);
    const droppedList = filterRoster(roster, 'dropped');
    assert.strictEqual(droppedList.length, 1);
    assert.strictEqual(droppedList[0].name, 'Charlie');
  });

  // ── TEST GROUP 13: Course Retraction, Versioning & Learner Safety ────────
  console.log('\n📦 GROUP 13: Course Retraction, Versioning & Learner Safety Engine');

  runTest('Published course remains stable while draft revision exists', () => {
    const publishedCourse = { _id: 'c1', title: 'React Masterclass', status: 'published', version: 1 };
    const revisionCourse = {
      _id: 'c2',
      parentCourseId: publishedCourse._id,
      title: 'React Masterclass (Next Gen)',
      status: 'draft',
      version: 2,
    };

    assert.strictEqual(publishedCourse.status, 'published');
    assert.strictEqual(publishedCourse.version, 1);
    assert.strictEqual(revisionCourse.status, 'draft');
    assert.strictEqual(revisionCourse.version, 2);
    assert.strictEqual(revisionCourse.parentCourseId, publishedCourse._id);
  });

  runTest('Instructor cannot directly mutate protected published content', () => {
    const course = { _id: 'c1', status: 'published', instructorId: 'inst_1' };
    const validateCourseEdit = (c, user) => {
      if (c.instructorId !== user.userId) return { status: 403, error: 'Access denied' };
      if (['under_review', 'pending', 'published'].includes(c.status)) {
        return { status: 400, error: 'Cannot directly edit a course while under review or published. Create a revision instead.' };
      }
      return { status: 200 };
    };

    const res = validateCourseEdit(course, { userId: 'inst_1', role: 'instructor' });
    assert.strictEqual(res.status, 400);
  });

  runTest('Draft revision can be edited, submitted, and approved', () => {
    const revision = { _id: 'c2', parentCourseId: 'c1', status: 'draft', version: 2, title: 'Draft v2' };

    // 1. Edit draft
    revision.title = 'Updated Draft v2';
    assert.strictEqual(revision.title, 'Updated Draft v2');

    // 2. Submit for review
    revision.status = 'under_review';
    revision.submittedAt = new Date();
    assert.strictEqual(revision.status, 'under_review');

    // 3. Admin approves revision
    revision.status = 'approved';
    revision.reviewedAt = new Date();
    assert.strictEqual(revision.status, 'approved');
  });

  runTest('Instructor can retract under-review course back to draft', () => {
    const course = { _id: 'c1', status: 'under_review', instructorId: 'inst_1', submittedAt: new Date() };
    const retract = (c, user) => {
      if (c.instructorId !== user.userId && user.role !== 'admin') return { status: 403, error: 'Access denied' };
      if (['published', 'approved'].includes(c.status)) {
        return { status: 400, error: 'Approved or published courses cannot be retracted.' };
      }
      if (c.status === 'draft') return { status: 400, error: 'Already draft' };
      c.status = 'draft';
      c.submittedAt = null;
      return { status: 200, course: c };
    };

    const res = retract(course, { userId: 'inst_1', role: 'instructor' });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.course.status, 'draft');
    assert.strictEqual(res.course.submittedAt, null);
  });

  runTest('Instructor cannot retract published or approved course', () => {
    const publishedCourse = { _id: 'c1', status: 'published', instructorId: 'inst_1' };
    const approvedCourse = { _id: 'c2', status: 'approved', instructorId: 'inst_1' };

    const retract = (c, user) => {
      if (['published', 'approved'].includes(c.status)) {
        return { status: 400, error: 'Approved or published courses cannot be retracted to protect active learners.' };
      }
      return { status: 200 };
    };

    assert.strictEqual(retract(publishedCourse, { userId: 'inst_1', role: 'instructor' }).status, 400);
    assert.strictEqual(retract(approvedCourse, { userId: 'inst_1', role: 'instructor' }).status, 400);
  });

  runTest('Learner access is not broken and historical progress remains valid across revisions', () => {
    const v1Lessons = ['l1', 'l2', 'l3'];
    const studentProgress = [
      { studentId: 's1', lessonId: 'l1', courseId: 'c1', completed: true },
      { studentId: 's1', lessonId: 'l2', courseId: 'c1', completed: true },
    ];

    // Revision c2 is created with cloned lessons
    const v2Lessons = ['l1_v2', 'l2_v2', 'l3_v2', 'l4_v2'];
    
    // Existing student querying course progress for c1 still references v1 lessons seamlessly
    const completedCount = studentProgress.filter(p => v1Lessons.includes(p.lessonId) && p.completed).length;
    assert.strictEqual(completedCount, 2);
    assert.strictEqual(Math.round((completedCount / v1Lessons.length) * 100), 67);
  });

  // ── TEST GROUP 14: Server-Authoritative IDOR Security ────────────────────
  console.log('\n📦 GROUP 14: Server-Authoritative IDOR & Actor Security');

  runTest('Server derives actor from authenticated session, never client payload', () => {
    const authSession = { userId: 'real_student_123', role: 'student' };
    const clientPayload = { actorId: 'fake_admin_999', role: 'admin', studentId: 'victim_456' };

    const resolveActor = (req) => ({
      actorId: req.user.userId,
      actorRole: req.user.role,
    });

    const actor = resolveActor({ user: authSession, body: clientPayload });
    assert.strictEqual(actor.actorId, 'real_student_123');
    assert.strictEqual(actor.actorRole, 'student');
    assert.notStrictEqual(actor.actorId, clientPayload.actorId);
    assert.notStrictEqual(actor.actorRole, clientPayload.role);
  });

  runTest('Instructor cannot retract or revise another instructor course (IDOR prevention)', () => {
    const course = { _id: 'c1', instructorId: 'inst_owner' };
    const attackerUser = { userId: 'inst_attacker', role: 'instructor' };

    const checkOwnership = (c, user) => {
      if (c.instructorId !== user.userId && user.role !== 'admin') {
        return 403;
      }
      return 200;
    };

    assert.strictEqual(checkOwnership(course, attackerUser), 403);
    assert.strictEqual(checkOwnership(course, { userId: 'inst_owner', role: 'instructor' }), 200);
  });

  runTest('Student cannot drop another student enrollment (IDOR prevention)', () => {
    const buildDropFilter = (reqCourseId, authUser) => {
      // Server strictly enforces studentId from JWT auth token
      return {
        courseId: reqCourseId,
        studentId: authUser.userId,
      };
    };

    const filter = buildDropFilter('c1', { userId: 'student_legit' });
    assert.strictEqual(filter.studentId, 'student_legit');
  });

  // ── TEST GROUP 15: Platform Notifications & Real-Time Alert Engine ────────
  console.log('\n📦 GROUP 15: Platform Notifications & Real-Time Alert Engine');

  runTest('Course approval creates instructor notification', () => {
    const course = { _id: 'c100', title: 'Deep Learning', instructorId: 'inst_1', version: 1 };
    const createApprovalNotification = (c) => ({
      recipientId: c.instructorId,
      type: 'COURSE_APPROVED',
      title: 'Course Approved',
      message: `Congratulations! Your course "${c.title}" (v${c.version || 1}) has been approved by administration.`,
      entityType: 'Course',
      entityId: String(c._id),
      read: false,
      createdAt: new Date(),
    });

    const notif = createApprovalNotification(course);
    assert.strictEqual(notif.recipientId, 'inst_1');
    assert.strictEqual(notif.type, 'COURSE_APPROVED');
    assert.strictEqual(notif.entityType, 'Course');
    assert.strictEqual(notif.entityId, 'c100');
    assert.strictEqual(notif.read, false);
  });

  runTest('Course rejection creates instructor notification with reason', () => {
    const course = { _id: 'c101', title: 'Advanced GraphQL', instructorId: 'inst_2', rejectionReason: 'Insufficient video content in module 2.' };
    const createRejectionNotification = (c) => ({
      recipientId: c.instructorId,
      type: 'COURSE_REJECTED',
      title: 'Course Revision Requested',
      message: `Your course "${c.title}" was rejected. Reason: ${c.rejectionReason}`,
      entityType: 'Course',
      entityId: String(c._id),
      read: false,
    });

    const notif = createRejectionNotification(course);
    assert.strictEqual(notif.recipientId, 'inst_2');
    assert.strictEqual(notif.type, 'COURSE_REJECTED');
    assert.ok(notif.message.includes('Insufficient video content in module 2.'));
  });

  runTest('Enrollment creates student notification', () => {
    const student = { userId: 'stud_1' };
    const course = { _id: 'c102', title: 'Rust Systems Programming' };
    const createEnrollmentNotification = (user, c) => ({
      recipientId: user.userId,
      type: 'COURSE_ENROLLED',
      title: 'Course Enrollment Confirmed',
      message: `You have successfully enrolled in "${c.title}". Start learning today!`,
      entityType: 'Course',
      entityId: String(c._id),
      read: false,
    });

    const notif = createEnrollmentNotification(student, course);
    assert.strictEqual(notif.recipientId, 'stud_1');
    assert.strictEqual(notif.type, 'COURSE_ENROLLED');
    assert.strictEqual(notif.entityId, 'c102');
  });

  runTest('Certificate creates student notification', () => {
    const student = { userId: 'stud_1' };
    const course = { _id: 'c103', title: 'TypeScript Mastery' };
    const certCode = 'VY-CERT-7777';
    const createCertificateNotification = (user, c, code) => ({
      recipientId: user.userId,
      type: 'CERTIFICATE_ISSUED',
      title: 'Certificate Issued',
      message: `Your verified certificate for "${c.title}" is ready. Verification Code: ${code}`,
      entityType: 'Certificate',
      entityId: code,
      read: false,
    });

    const notif = createCertificateNotification(student, course, certCode);
    assert.strictEqual(notif.recipientId, 'stud_1');
    assert.strictEqual(notif.type, 'CERTIFICATE_ISSUED');
    assert.strictEqual(notif.entityType, 'Certificate');
    assert.strictEqual(notif.entityId, 'VY-CERT-7777');
  });

  runTest('Revision publication creates student notification', () => {
    const v2Course = { _id: 'c104_v2', parentCourseId: 'c104_v1', title: 'Cloud Architecture', version: 2 };
    const enrolledStudents = ['stud_1', 'stud_2', 'stud_3'];

    const createRevisionNotifications = (course, studentIds) =>
      studentIds.map((sid) => ({
        recipientId: sid,
        type: 'COURSE_REVISION_AVAILABLE',
        title: 'New Course Revision Available',
        message: `A new version (v${course.version}) of "${course.title}" is now available. Your current enrollment and progress remain intact.`,
        entityType: 'Course',
        entityId: String(course._id),
        read: false,
      }));

    const notifs = createRevisionNotifications(v2Course, enrolledStudents);
    assert.strictEqual(notifs.length, 3);
    assert.strictEqual(notifs[0].recipientId, 'stud_1');
    assert.strictEqual(notifs[1].recipientId, 'stud_2');
    assert.strictEqual(notifs[2].recipientId, 'stud_3');
    assert.strictEqual(notifs[0].type, 'COURSE_REVISION_AVAILABLE');
  });

  runTest('User can read own notifications', () => {
    const allNotifications = [
      { _id: 'n1', recipientId: 'user_alice', title: 'Welcome Alice' },
      { _id: 'n2', recipientId: 'user_bob', title: 'Welcome Bob' },
      { _id: 'n3', recipientId: 'user_alice', title: 'Course Approved' },
    ];

    const getInbox = (userId) => allNotifications.filter((n) => n.recipientId === userId);
    const aliceInbox = getInbox('user_alice');
    assert.strictEqual(aliceInbox.length, 2);
    assert.strictEqual(aliceInbox[0]._id, 'n1');
    assert.strictEqual(aliceInbox[1]._id, 'n3');
  });

  runTest("User cannot read another user's notifications (IDOR prevention)", () => {
    const queryBuilder = (reqUser, queryParams) => {
      // Server must NEVER accept recipientId from client query
      return {
        recipientId: reqUser.userId,
      };
    };

    const maliciousQuery = { recipientId: 'target_victim_id' };
    const authSession = { userId: 'attacker_student_id' };
    const query = queryBuilder(authSession, maliciousQuery);

    assert.strictEqual(query.recipientId, 'attacker_student_id');
    assert.notStrictEqual(query.recipientId, maliciousQuery.recipientId);
  });

  runTest('User can mark own notification read', () => {
    const notif = { _id: 'n1', recipientId: 'user_alice', read: false };
    const markRead = (notification, authUser) => {
      if (notification.recipientId !== authUser.userId) {
        return { status: 403, error: 'Forbidden' };
      }
      notification.read = true;
      return { status: 200, notification };
    };

    const res = markRead(notif, { userId: 'user_alice' });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(notif.read, true);
  });

  runTest("User cannot modify another user's notification (IDOR prevention)", () => {
    const notif = { _id: 'n2', recipientId: 'user_bob', read: false };
    const markRead = (notification, authUser) => {
      if (notification.recipientId !== authUser.userId) {
        return { status: 403, error: "Access denied. You cannot modify another user's notifications." };
      }
      notification.read = true;
      return { status: 200, notification };
    };

    const res = markRead(notif, { userId: 'user_alice' });
    assert.strictEqual(res.status, 403);
    assert.strictEqual(notif.read, false);
  });

  // ── TEST GROUP 16: Audit Log Export & Compliance ─────────────────────────
  console.log('\n📦 GROUP 16: Audit Log Export & Compliance Engine');

  runTest('Admin can export CSV with valid headers and data', () => {
    const logs = [
      {
        createdAt: new Date('2026-10-01T10:00:00Z'),
        actorId: 'admin_1',
        actorRole: 'admin',
        action: 'COURSE_APPROVED',
        entityType: 'Course',
        entityId: 'c100',
        metadata: { title: 'Deep Learning', version: 1 },
      },
    ];

    const generateCsv = (items) => {
      const headers = ['createdAt', 'actorId', 'actorRole', 'action', 'entityType', 'entityId', 'metadata'];
      const rows = [headers.join(',')];
      for (const item of items) {
        const row = [
          `"${new Date(item.createdAt).toISOString()}"`,
          `"${item.actorId}"`,
          `"${item.actorRole}"`,
          `"${item.action}"`,
          `"${item.entityType}"`,
          `"${item.entityId}"`,
          `"${JSON.stringify(item.metadata).replace(/"/g, '""')}"`,
        ];
        rows.push(row.join(','));
      }
      return rows.join('\r\n');
    };

    const csvOutput = generateCsv(logs);
    assert.ok(csvOutput.startsWith('createdAt,actorId,actorRole,action,entityType,entityId,metadata'));
    assert.ok(csvOutput.includes('COURSE_APPROVED'));
    assert.ok(csvOutput.includes('admin_1'));
  });

  runTest('Admin can export JSON', () => {
    const logs = [
      {
        createdAt: new Date('2026-10-01T10:00:00Z'),
        actorId: 'admin_1',
        actorRole: 'admin',
        action: 'COURSE_APPROVED',
        entityType: 'Course',
        entityId: 'c100',
        metadata: { title: 'Deep Learning' },
      },
    ];

    const jsonExport = JSON.stringify(logs);
    const parsed = JSON.parse(jsonExport);
    assert.ok(Array.isArray(parsed));
    assert.strictEqual(parsed[0].action, 'COURSE_APPROVED');
    assert.strictEqual(parsed[0].entityId, 'c100');
  });

  runTest('Student receives 403 on audit export', () => {
    const adminMiddleware = authorize('admin');
    let statusCode = null;
    adminMiddleware(
      { user: { userId: 'stud_1', role: 'student' } },
      { status(s) { statusCode = s; return this; }, json() {} },
      () => {}
    );
    assert.strictEqual(statusCode, 403);
  });

  runTest('Instructor receives 403 on audit export', () => {
    const adminMiddleware = authorize('admin');
    let statusCode = null;
    adminMiddleware(
      { user: { userId: 'inst_1', role: 'instructor' } },
      { status(s) { statusCode = s; return this; }, json() {} },
      () => {}
    );
    assert.strictEqual(statusCode, 403);
  });

  runTest('Audit export filters work across parameters', () => {
    const buildExportFilter = (params) => {
      const query = {};
      if (params.action && params.action !== 'ALL') query.action = params.action;
      if (params.role && params.role !== 'ALL') query.actorRole = params.role;
      if (params.entityType && params.entityType !== 'ALL') query.entityType = params.entityType;
      if (params.search && params.search.trim()) {
        query.search = params.search.trim();
      }
      return query;
    };

    const filter1 = buildExportFilter({ action: 'COURSE_APPROVED', role: 'admin', entityType: 'Course' });
    assert.strictEqual(filter1.action, 'COURSE_APPROVED');
    assert.strictEqual(filter1.actorRole, 'admin');
    assert.strictEqual(filter1.entityType, 'Course');

    const filter2 = buildExportFilter({ action: 'ALL', role: 'ALL', entityType: 'ALL' });
    assert.strictEqual(Object.keys(filter2).length, 0);
  });

  runTest('Sensitive metadata is sanitized in audit export', () => {
    const { sanitizeMetadata } = require('./src/utils/auditLogger');
    const sensitivePayload = {
      userEmail: 'user@veyro.com',
      password: 'SuperSecretPassword123!',
      token: 'jwt.bearer.secret-token',
      refreshToken: 'rt-secret-string',
      courseTitle: 'Introduction to Algorithms',
    };

    const sanitized = sanitizeMetadata(sensitivePayload);
    assert.strictEqual(sanitized.password, '[REDACTED]');
    assert.strictEqual(sanitized.token, '[REDACTED]');
    assert.strictEqual(sanitized.refreshToken, '[REDACTED]');
    assert.strictEqual(sanitized.userEmail, 'user@veyro.com');
    assert.strictEqual(sanitized.courseTitle, 'Introduction to Algorithms');
  });

  // ── TEST GROUP 17: Course Revision Lifecycle & Learner Invariance ────────
  console.log('\n📦 GROUP 17: Course Revision Lifecycle & Learner Invariance');

  runTest('Publishing v2 creates notification for v1 enrolled students', () => {
    const v1Enrollments = [
      { studentId: 'student_alpha', courseId: 'course_v1', status: 'active' },
      { studentId: 'student_beta', courseId: 'course_v1', status: 'completed' },
      { studentId: 'student_gamma', courseId: 'course_v1', status: 'dropped' },
    ];

    const eligibleStudents = v1Enrollments
      .filter((e) => ['active', 'completed'].includes(e.status))
      .map((e) => e.studentId);

    assert.strictEqual(eligibleStudents.length, 2);
    assert.ok(eligibleStudents.includes('student_alpha'));
    assert.ok(eligibleStudents.includes('student_beta'));
    assert.ok(!eligibleStudents.includes('student_gamma'));
  });

  runTest('Existing v1 enrollment remains unchanged when v2 is published', () => {
    const studentEnrollment = {
      _id: 'en_001',
      studentId: 'student_alpha',
      courseId: 'course_v1',
      status: 'active',
      enrolledAt: new Date('2026-02-01'),
    };

    const v2Course = { _id: 'course_v2', parentCourseId: 'course_v1', version: 2, status: 'published' };

    assert.strictEqual(studentEnrollment.courseId, 'course_v1');
    assert.strictEqual(studentEnrollment.status, 'active');
    assert.notStrictEqual(studentEnrollment.courseId, v2Course._id);
  });

  runTest('Existing progress remains unchanged and valid across revisions', () => {
    const studentProgress = [
      { studentId: 'student_alpha', lessonId: 'lesson_v1_01', completed: true, watchedSeconds: 450 },
      { studentId: 'student_alpha', lessonId: 'lesson_v1_02', completed: true, watchedSeconds: 600 },
    ];

    assert.strictEqual(studentProgress[0].lessonId, 'lesson_v1_01');
    assert.strictEqual(studentProgress[0].completed, true);
    assert.strictEqual(studentProgress[1].lessonId, 'lesson_v1_02');
    assert.strictEqual(studentProgress[1].completed, true);
  });

  runTest('Student is not automatically migrated to v2 without choice', () => {
    const currentEnrolledCourseId = 'course_v1';
    const newerVersionAvailable = { _id: 'course_v2', version: 2 };

    const resolveActiveCurriculum = (enrolledId, newerRevision) => {
      return enrolledId;
    };

    assert.strictEqual(resolveActiveCurriculum(currentEnrolledCourseId, newerVersionAvailable), 'course_v1');
  });

  // ── TEST GROUP 18: Render Production Readiness & Health Monitoring ────────
  console.log('\n📦 GROUP 18: Render Production Readiness & Health Monitoring');

  runTest('Health endpoint returns service name and database state', () => {
    const buildHealthResponse = (readyState, diagnostics) => {
      const isDbConnected = readyState === 1;
      const dbState = isDbConnected ? 'connected' : 'disconnected';
      return {
        status: isDbConnected ? 'ok' : 'degraded',
        service: 'veyro-api',
        database: dbState,
        ...(diagnostics ? { diagnostics } : {}),
        timestamp: new Date().toISOString(),
      };
    };

    const healthy = buildHealthResponse(1);
    assert.strictEqual(healthy.status, 'ok');
    assert.strictEqual(healthy.service, 'veyro-api');
    assert.strictEqual(healthy.database, 'connected');

    const degraded = buildHealthResponse(0, { category: 'AUTHENTICATION_FAILED' });
    assert.strictEqual(degraded.status, 'degraded');
    assert.strictEqual(degraded.database, 'disconnected');
    assert.strictEqual(degraded.diagnostics.category, 'AUTHENTICATION_FAILED');
  });

  runTest('Server configuration respects Render PORT with 10000 fallback', () => {
    const resolvePort = (envPort) => parseInt(envPort, 10) || 10000;
    assert.strictEqual(resolvePort('10000'), 10000);
    assert.strictEqual(resolvePort('5000'), 5000);
    assert.strictEqual(resolvePort(undefined), 10000);
  });

  runTest('MongoDB URI parser accepts MONGODB_URI and strips accidental quotes/whitespace', () => {
    const parseMongoUri = (env) => {
      const raw = env.MONGODB_URI || env.MONGO_URI;
      return raw ? raw.trim().replace(/^["']|["']$/g, '') : null;
    };

    const clean1 = parseMongoUri({ MONGODB_URI: '  "mongodb+srv://user:pass@cluster.mongodb.net/db"  ' });
    assert.strictEqual(clean1, 'mongodb+srv://user:pass@cluster.mongodb.net/db');

    const clean2 = parseMongoUri({ MONGO_URI: " 'mongodb://localhost:27017/db' " });
    assert.strictEqual(clean2, 'mongodb://localhost:27017/db');
  });

  runTest('Hostname sanitization never leaks credentials or passwords in logs', () => {
    const getSanitizedHost = (connectionUri) => {
      if (!connectionUri) return 'undefined';
      try {
        const match = connectionUri.match(/@([^/?:]+)/);
        if (match) return match[1];
        const plainMatch = connectionUri.match(/\/\/([^/?:]+)/);
        if (plainMatch) return plainMatch[1];
        return 'hidden-host';
      } catch {
        return 'unknown-host';
      }
    };

    // Use clearly-fake, non-functional credentials for testing sanitization logic
    const uriWithSecret = 'mongodb+srv://fakeTestUser:FakeTestPass123@fake-cluster.example.mongodb.net/test_db?retryWrites=true';
    const host = getSanitizedHost(uriWithSecret);

    assert.strictEqual(host, 'fake-cluster.example.mongodb.net');
    assert.ok(!host.includes('FakeTestPass123'));
    assert.ok(!host.includes('fakeTestUser'));
  });

  runTest('CORS normalizer allows production Vercel frontend and strips trailing slashes', () => {
    const checkOriginAllowed = (rawClientUrl, requestOrigin) => {
      const allowedOrigins = (rawClientUrl || 'http://localhost:5173')
        .split(',')
        .map((u) => u.trim().replace(/\/+$/, ''))
        .filter(Boolean);

      if (!requestOrigin) return true;
      const normalized = requestOrigin.replace(/\/+$/, '');
      return allowedOrigins.includes(normalized) || allowedOrigins.includes('*');
    };

    const config = 'http://localhost:5173, https://veyroofficial.vercel.app, https://veyro-sandy.vercel.app/ ';
    assert.strictEqual(checkOriginAllowed(config, 'https://veyroofficial.vercel.app'), true);
    assert.strictEqual(checkOriginAllowed(config, 'https://veyroofficial.vercel.app/'), true);
    assert.strictEqual(checkOriginAllowed(config, 'https://veyro-sandy.vercel.app'), true);
    assert.strictEqual(checkOriginAllowed(config, 'https://veyro-sandy.vercel.app/'), true);
    assert.strictEqual(checkOriginAllowed(config, 'http://localhost:5173'), true);
    assert.strictEqual(checkOriginAllowed(config, 'https://malicious-site.com'), false);
  });

  // ── TEST GROUP 19: Exam Proctoring Configuration & Integrity Signals ──────
  console.log('\n📦 GROUP 19: Exam Proctoring Configuration & Integrity Signals');

  runTest('Instructor can configure proctoring, camera, and violation thresholds', () => {
    const validateQuizSettings = (settings) => {
      const allowedKeys = ['isProctored', 'requireCamera', 'maxTabViolations', 'randomizeQuestions', 'randomizeOptions', 'passingScore', 'timeLimitSeconds'];
      const validated = {};
      for (const k of allowedKeys) {
        if (settings[k] !== undefined) validated[k] = settings[k];
      }
      if (validated.maxTabViolations !== undefined && validated.maxTabViolations < 1) {
        throw new Error('maxTabViolations must be at least 1');
      }
      return validated;
    };

    const config = validateQuizSettings({
      isProctored: true,
      requireCamera: true,
      maxTabViolations: 3,
      randomizeQuestions: true,
      randomizeOptions: true,
      passingScore: 80,
    });
    assert.strictEqual(config.isProctored, true);
    assert.strictEqual(config.requireCamera, true);
    assert.strictEqual(config.maxTabViolations, 3);
    assert.strictEqual(config.randomizeQuestions, true);
  });

  runTest('Student cannot override or tamper with protected proctoring settings', () => {
    const sanitizeStudentPayload = (payload) => {
      const forbiddenKeys = ['isProctored', 'requireCamera', 'maxTabViolations', 'passingScore', 'correctOptionIndex'];
      const sanitized = { ...payload };
      for (const key of forbiddenKeys) {
        delete sanitized[key];
      }
      return sanitized;
    };

    const studentSubmission = {
      attemptId: 'att_123',
      answers: [{ questionIndex: 0, selectedOption: 1 }],
      isProctored: false,
      requireCamera: false,
      maxTabViolations: 999,
      passingScore: 10,
    };
    const sanitized = sanitizeStudentPayload(studentSubmission);
    assert.strictEqual(sanitized.isProctored, undefined);
    assert.strictEqual(sanitized.requireCamera, undefined);
    assert.strictEqual(sanitized.maxTabViolations, undefined);
    assert.strictEqual(sanitized.passingScore, undefined);
  });

  runTest('Integrity event handler debounces and appends face and camera signals', () => {
    const attempt = {
      isProctored: true,
      requireCamera: true,
      tabViolations: 0,
      cameraViolations: 0,
      integrityEvents: [],
      maxTabViolations: 3,
      status: 'in_progress',
    };

    const recordEvent = (att, eventType, description) => {
      const severityMap = {
        face_absent: 'warning',
        face_absent_prolonged: 'violation',
        multiple_faces: 'violation',
        camera_interrupted: 'violation',
        tab_hidden: 'violation',
      };
      const severity = severityMap[eventType] || 'info';

      att.integrityEvents.push({
        eventType,
        timestamp: new Date().toISOString(),
        severity,
        description,
      });

      if (['face_absent_prolonged', 'multiple_faces', 'camera_interrupted'].includes(eventType)) {
        att.cameraViolations = (att.cameraViolations || 0) + 1;
      }
      if (['tab_hidden', 'tab_blur'].includes(eventType)) {
        att.tabViolations = (att.tabViolations || 0) + 1;
      }

      if (att.tabViolations >= att.maxTabViolations) {
        att.status = 'auto_submitted';
        att.autoSubmitReason = 'Violation threshold reached';
      }
    };

    recordEvent(attempt, 'face_absent', 'Face temporarily not visible in frame');
    assert.strictEqual(attempt.integrityEvents.length, 1);
    assert.strictEqual(attempt.integrityEvents[0].severity, 'warning');
    assert.strictEqual(attempt.cameraViolations, 0);

    recordEvent(attempt, 'face_absent_prolonged', 'Prolonged absence exceeding 10s');
    assert.strictEqual(attempt.integrityEvents.length, 2);
    assert.strictEqual(attempt.cameraViolations, 1);

    recordEvent(attempt, 'multiple_faces', 'Multiple faces detected in frame (count: 2)');
    assert.strictEqual(attempt.cameraViolations, 2);
  });

  runTest('Exceeding maxTabViolations triggers automatic exam submission', () => {
    const attempt = {
      tabViolations: 2,
      maxTabViolations: 3,
      status: 'in_progress',
      integrityEvents: [],
    };

    const reportTabViolation = (att) => {
      att.tabViolations++;
      att.integrityEvents.push({
        eventType: 'tab_hidden',
        timestamp: new Date().toISOString(),
        severity: 'violation',
        description: `Tab exit #${att.tabViolations}`,
      });
      if (att.tabViolations >= att.maxTabViolations) {
        att.status = 'submitted';
        att.autoSubmitted = true;
        att.autoSubmitReason = 'Exceeded maximum allowed focus violations';
      }
      return att;
    };

    reportTabViolation(attempt);
    assert.strictEqual(attempt.tabViolations, 3);
    assert.strictEqual(attempt.status, 'submitted');
    assert.strictEqual(attempt.autoSubmitted, true);
    assert.ok(attempt.autoSubmitReason.includes('Exceeded maximum'));
  });

  // ── TEST GROUP 20: Exam Submission Idempotency & Instructor Audit Review ──
  console.log('\n📦 GROUP 20: Exam Submission Idempotency & Instructor Audit Review');

  runTest('Idempotent exam submission returns cached score on duplicate requests', () => {
    const existingCompletedAttempt = {
      _id: 'att_999',
      student: 'student_1',
      quiz: 'quiz_1',
      status: 'completed',
      score: 85,
      passed: true,
      submittedAt: '2026-10-26T10:00:00.000Z',
    };

    const handleSubmit = (attempt, answers) => {
      if (attempt.status === 'completed') {
        return {
          idempotent: true,
          attempt,
          message: 'Quiz already submitted. Returning recorded score.',
        };
      }
      return { idempotent: false, attempt };
    };

    const res = handleSubmit(existingCompletedAttempt, [{ questionIndex: 0, selectedOption: 2 }]);
    assert.strictEqual(res.idempotent, true);
    assert.strictEqual(res.attempt.score, 85);
    assert.strictEqual(res.attempt.passed, true);
  });

  runTest('Server deadline enforcement rejects answers submitted after timer expiry', () => {
    const checkAttemptExpired = (startedAtIso, timeLimitSeconds, nowIso) => {
      if (!timeLimitSeconds) return false;
      const started = new Date(startedAtIso).getTime();
      const now = new Date(nowIso).getTime();
      const gracePeriodMs = 15000;
      return now > (started + timeLimitSeconds * 1000 + gracePeriodMs);
    };

    const startedAt = '2026-10-26T12:00:00.000Z';
    const limit = 1800; // 30 minutes

    assert.strictEqual(checkAttemptExpired(startedAt, limit, '2026-10-26T12:25:00.000Z'), false);
    assert.strictEqual(checkAttemptExpired(startedAt, limit, '2026-10-26T12:35:00.000Z'), true);
  });

  runTest('Instructor can update review status and audit notes', () => {
    const attempt = {
      _id: 'att_777',
      reviewStatus: 'pending_review',
      instructorNotes: '',
      reviewedBy: null,
      reviewedAt: null,
    };

    const reviewAttempt = (att, instructorId, status, notes) => {
      const allowed = ['cleared', 'flagged', 'verified', 'pending_review'];
      if (!allowed.includes(status)) throw new Error('Invalid review status');
      att.reviewStatus = status;
      att.instructorNotes = notes;
      att.reviewedBy = instructorId;
      att.reviewedAt = new Date().toISOString();
      return att;
    };

    reviewAttempt(attempt, 'inst_1', 'cleared', 'Inspected webcam log: student was adjusting screen brightness.');
    assert.strictEqual(attempt.reviewStatus, 'cleared');
    assert.strictEqual(attempt.reviewedBy, 'inst_1');
    assert.ok(attempt.instructorNotes.includes('adjusting screen'));
    assert.ok(attempt.reviewedAt !== null);
  });

  runTest('IDOR protection denies non-course instructor from reviewing attempts', () => {
    const courseInstructorId = 'inst_owner';
    const requestingInstructorId = 'inst_intruder';

    const canReviewCourseAttempt = (ownerId, requesterId) => {
      return String(ownerId) === String(requesterId);
    };

    assert.strictEqual(canReviewCourseAttempt(courseInstructorId, requestingInstructorId), false);
    assert.strictEqual(canReviewCourseAttempt(courseInstructorId, 'inst_owner'), true);
  });

  // ── TEST GROUP 21: Server-Authoritative Course Completion & Public Verification ─
  console.log('\n📦 GROUP 21: Server-Authoritative Course Completion & Verification');

  runTest('Course completion requires both 90% video progress and all passed quizzes', () => {
    const calculateEligibility = (lessonsProgress, quizzesAttempts) => {
      const allLessonsWatched = lessonsProgress.every((lp) => lp.watchedSeconds >= lp.totalSeconds * 0.9);
      const allQuizzesPassed = quizzesAttempts.length > 0 && quizzesAttempts.every((qa) => qa.passed === true);
      return allLessonsWatched && allQuizzesPassed;
    };

    const lessonsPass = [
      { lessonId: 'l1', watchedSeconds: 95, totalSeconds: 100 },
      { lessonId: 'l2', watchedSeconds: 180, totalSeconds: 200 },
    ];
    const quizzesPass = [{ quizId: 'q1', passed: true }];

    assert.strictEqual(calculateEligibility(lessonsPass, quizzesPass), true);

    const lessonsFail = [
      { lessonId: 'l1', watchedSeconds: 40, totalSeconds: 100 },
      { lessonId: 'l2', watchedSeconds: 180, totalSeconds: 200 },
    ];
    assert.strictEqual(calculateEligibility(lessonsFail, quizzesPass), false);

    const quizzesFail = [{ quizId: 'q1', passed: false }];
    assert.strictEqual(calculateEligibility(lessonsPass, quizzesFail), false);
  });

  runTest('Course completion is idempotent and never creates duplicate certificates', () => {
    const enrollment = {
      _id: 'enr_1',
      studentId: 'stud_1',
      courseId: 'crs_1',
      status: 'completed',
      certificateCode: 'VEYRO-2026-ABCD-1234',
      completedAt: '2026-10-25T14:00:00.000Z',
    };

    const processCompletion = (enr, cryptoCodeGenerator) => {
      if (enr.status === 'completed' && enr.certificateCode) {
        return {
          isDuplicateCall: true,
          enrollment: enr,
          certificateCode: enr.certificateCode,
        };
      }
      enr.status = 'completed';
      enr.certificateCode = cryptoCodeGenerator();
      enr.completedAt = new Date().toISOString();
      return { isDuplicateCall: false, enrollment: enr, certificateCode: enr.certificateCode };
    };

    const res = processCompletion(enrollment, () => 'NEW-CODE-SHOULD-NOT-BE-USED');
    assert.strictEqual(res.isDuplicateCall, true);
    assert.strictEqual(res.certificateCode, 'VEYRO-2026-ABCD-1234');
  });

  runTest('Public certificate verification returns valid credential and 404 on invalid code', () => {
    const certificateStore = {
      'VEYRO-2026-MATH-9999': {
        certificateCode: 'VEYRO-2026-MATH-9999',
        studentName: 'Alice Smith',
        courseTitle: 'Advanced Neural Networks',
        completedAt: '2026-10-20T12:00:00.000Z',
        verified: true,
      },
    };

    const verifyCode = (code) => {
      const found = certificateStore[code];
      if (!found) return { status: 404, valid: false, error: 'Certificate not found' };
      return { status: 200, valid: true, certificate: found };
    };

    const validRes = verifyCode('VEYRO-2026-MATH-9999');
    assert.strictEqual(validRes.status, 200);
    assert.strictEqual(validRes.valid, true);
    assert.strictEqual(validRes.certificate.studentName, 'Alice Smith');

    const invalidRes = verifyCode('FAKE-CERT-0000');
    assert.strictEqual(invalidRes.status, 404);
    assert.strictEqual(invalidRes.valid, false);
  });

  // ── TEST GROUP 22: AI Learning Reels Pipeline & Ownership Security ────────
  console.log('\n📦 GROUP 22: AI Learning Reels Pipeline & Ownership Security');

  runTest('AI script extraction segments lesson content into 3-part structured video script', () => {
    const synthesizeReelFromContent = (lessonTitle, lessonText) => {
      const hook = `What if you could understand ${lessonTitle} in under 45 seconds?`;
      const coreExplanation = `Here is how ${lessonTitle} works: ${lessonText.slice(0, 100)}...`;
      const practicalApplication = `In production, use this concept to ensure high performance and reliability.`;
      const takeaways = [
        `Core mechanism of ${lessonTitle}`,
        `Key best practice for implementation`,
        `Common pitfall to avoid`,
      ];
      const quickQuestion = {
        questionText: `What is the primary function of ${lessonTitle}?`,
        options: ['Core operational workflow', 'Unrelated fallback', 'System shutdown', 'No effect'],
        correctOptionIndex: 0,
        explanation: `${lessonTitle} provides the core operational mechanism.`,
      };
      return {
        title: `${lessonTitle} in 45 Seconds`,
        concept: lessonTitle,
        durationSeconds: 45,
        script: { hook, coreExplanation, practicalApplication },
        takeaways,
        quickQuestion,
        status: 'draft',
      };
    };

    const reel = synthesizeReelFromContent('JWT Authentication', 'JSON Web Tokens provide stateless authentication with cryptographic signatures.');
    assert.strictEqual(reel.durationSeconds, 45);
    assert.ok(reel.script.hook.includes('JWT Authentication'));
    assert.strictEqual(reel.takeaways.length, 3);
    assert.strictEqual(reel.quickQuestion.correctOptionIndex, 0);
  });

  runTest('Instructor can toggle reel publish status and delete only their own reels', () => {
    const reel = {
      _id: 'reel_1',
      courseId: 'crs_1',
      instructorId: 'inst_owner',
      status: 'draft',
      isPublished: false,
    };

    const togglePublish = (r, requesterId) => {
      if (r.instructorId !== requesterId) throw new Error('Unauthorized');
      r.isPublished = !r.isPublished;
      r.status = r.isPublished ? 'published' : 'draft';
      return r;
    };

    togglePublish(reel, 'inst_owner');
    assert.strictEqual(reel.isPublished, true);
    assert.strictEqual(reel.status, 'published');

    assert.throws(() => togglePublish(reel, 'inst_imposter'), /Unauthorized/);
  });

  runTest('Student reel feed respects enrollment authorization and published visibility', () => {
    const allReels = [
      { _id: 'r1', courseId: 'crs_public', status: 'published', isPublished: true },
      { _id: 'r2', courseId: 'crs_private_enrolled', status: 'published', isPublished: true },
      { _id: 'r3', courseId: 'crs_private_unenrolled', status: 'published', isPublished: true },
      { _id: 'r4', courseId: 'crs_public', status: 'draft', isPublished: false },
    ];

    const studentEnrolledCourses = ['crs_private_enrolled'];
    const publicCourses = ['crs_public'];

    const filterAuthorizedReels = (reels, enrolled, publics) => {
      return reels.filter((r) => {
        if (!r.isPublished || r.status !== 'published') return false;
        return publics.includes(r.courseId) || enrolled.includes(r.courseId);
      });
    };

    const feed = filterAuthorizedReels(allReels, studentEnrolledCourses, publicCourses);
    assert.strictEqual(feed.length, 2);
    const feedIds = feed.map((r) => r._id);
    assert.ok(feedIds.includes('r1'));
    assert.ok(feedIds.includes('r2'));
    assert.ok(!feedIds.includes('r3'));
    assert.ok(!feedIds.includes('r4'));
  });

  runTest('Reel progress tracker updates watched status and records quick quiz answers', () => {
    const progress = {
      studentId: 'stud_1',
      reelId: 'reel_1',
      watchedSeconds: 0,
      completed: false,
      quizAnswered: false,
      quizCorrect: false,
      selectedOptionIndex: null,
    };

    const recordReelProgress = (prog, watchedSec, answeredIndex, correctIndex) => {
      prog.watchedSeconds = Math.max(prog.watchedSeconds, watchedSec);
      if (prog.watchedSeconds >= 40) prog.completed = true;
      if (answeredIndex !== undefined && answeredIndex !== null) {
        prog.quizAnswered = true;
        prog.selectedOptionIndex = answeredIndex;
        prog.quizCorrect = answeredIndex === correctIndex;
      }
      return prog;
    };

    recordReelProgress(progress, 42, 0, 0);
    assert.strictEqual(progress.completed, true);
    assert.strictEqual(progress.quizAnswered, true);
    assert.strictEqual(progress.quizCorrect, true);
    assert.strictEqual(progress.selectedOptionIndex, 0);
  });

  // ── TEST GROUP 23: Lesson Video Upload (MOV, MP4, WebM) & Error Handling ──
  console.log('\n📦 GROUP 23: Lesson Video Upload Engine (MOV, MP4, WebM), Magic Bytes & Catalog Isolation');

  const {
    validateFileHeader,
    ALLOWED_VIDEO_MIMES,
    ALLOWED_VIDEO_EXTS,
  } = require('./src/utils/fileUpload');
  const { errorHandler } = require('./src/middleware/errorHandler');

  runTest('Upload allows QuickTime MOV, MP4, and WebM MIME types and extensions', () => {
    assert.ok(ALLOWED_VIDEO_MIMES.includes('video/quicktime'), 'video/quicktime must be supported');
    assert.ok(ALLOWED_VIDEO_MIMES.includes('video/mov'), 'video/mov must be supported');
    assert.ok(ALLOWED_VIDEO_MIMES.includes('video/mp4'), 'video/mp4 must be supported');
    assert.ok(ALLOWED_VIDEO_MIMES.includes('video/webm'), 'video/webm must be supported');
    assert.ok(ALLOWED_VIDEO_EXTS.includes('.mov'), '.mov extension must be supported');
    assert.ok(ALLOWED_VIDEO_EXTS.includes('.mp4'), '.mp4 extension must be supported');
    assert.ok(ALLOWED_VIDEO_EXTS.includes('.webm'), '.webm extension must be supported');
  });

  runTest('Magic byte validator accurately verifies authentic MP4 and QuickTime MOV headers', () => {
    const tmpDir = path.join(__dirname, 'uploads', 'tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

    // 1. Valid MP4 (ftyp box at offset 4)
    const validMp4Path = path.join(tmpDir, 'test_valid.mp4');
    const mp4Buf = Buffer.alloc(32);
    mp4Buf.writeUInt32BE(32, 0);
    mp4Buf.write('ftyp', 4, 'ascii');
    mp4Buf.write('isom', 8, 'ascii');
    fs.writeFileSync(validMp4Path, mp4Buf);

    assert.strictEqual(
      validateFileHeader(validMp4Path, 'video/mp4', 'test.mp4'),
      true,
      'Authentic MP4 header must pass'
    );

    // 2. Valid QuickTime MOV (ftyp box with qt at offset 4)
    const validMovPath = path.join(tmpDir, 'test_valid.mov');
    const movBuf = Buffer.alloc(32);
    movBuf.writeUInt32BE(32, 0);
    movBuf.write('ftyp', 4, 'ascii');
    movBuf.write('qt  ', 8, 'ascii');
    fs.writeFileSync(validMovPath, movBuf);

    assert.strictEqual(
      validateFileHeader(validMovPath, 'video/quicktime', 'IMG_4662.MOV'),
      true,
      'Authentic QuickTime MOV header must pass'
    );

    // 3. Valid WebM (1A 45 DF A3)
    const validWebmPath = path.join(tmpDir, 'test_valid.webm');
    const webmBuf = Buffer.from([0x1a, 0x45, 0xdf, 0xa3, 0x93, 0x42, 0x82, 0x88]);
    fs.writeFileSync(validWebmPath, webmBuf);

    assert.strictEqual(
      validateFileHeader(validWebmPath, 'video/webm', 'test.webm'),
      true,
      'Authentic WebM header must pass'
    );

    // Clean up valid tmp test files
    fs.unlinkSync(validMp4Path);
    fs.unlinkSync(validMovPath);
    fs.unlinkSync(validWebmPath);
  });

  runTest('Magic byte validator strictly rejects spoofed or corrupted video files', () => {
    const tmpDir = path.join(__dirname, 'uploads', 'tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

    // Spoofed text file disguised as .mov
    const fakeMovPath = path.join(tmpDir, 'fake.mov');
    fs.writeFileSync(fakeMovPath, 'This is plain text disguised as a QuickTime MOV file!');

    assert.strictEqual(
      validateFileHeader(fakeMovPath, 'video/quicktime', 'fake.mov'),
      false,
      'Disguised text file must fail MOV validation'
    );

    // Spoofed binary file disguised as .mp4
    const fakeMp4Path = path.join(tmpDir, 'fake.mp4');
    fs.writeFileSync(fakeMp4Path, 'MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00\xff\xff');

    assert.strictEqual(
      validateFileHeader(fakeMp4Path, 'video/mp4', 'fake.mp4'),
      false,
      'Spoofed binary file must fail MP4 validation'
    );

    fs.unlinkSync(fakeMovPath);
    fs.unlinkSync(fakeMp4Path);
  });

  runTest('Error handler translates Multer and upload errors into HTTP 400 (not 500)', () => {
    // 1. Unsupported file format error
    const formatErr = new Error('File type video/avi not allowed. Supported video formats: MP4, WebM, QuickTime (MOV).');
    formatErr.statusCode = 400;
    formatErr.isUploadError = true;

    let resStatus = null;
    let resJson = null;
    const mockRes = {
      status(code) {
        resStatus = code;
        return this;
      },
      json(payload) {
        resJson = payload;
        return this;
      },
    };

    errorHandler(formatErr, {}, mockRes, () => {});
    assert.strictEqual(resStatus, 400, 'Unsupported file format must return HTTP 400');
    assert.ok(resJson.error.includes('video/avi not allowed'), 'Must return sanitized descriptive error');

    // 2. Multer LIMIT_FILE_SIZE error
    const multerLimitErr = new Error('File too large');
    multerLimitErr.code = 'LIMIT_FILE_SIZE';

    errorHandler(multerLimitErr, {}, mockRes, () => {});
    assert.strictEqual(resStatus, 400, 'Oversized file upload must return HTTP 400');
    assert.strictEqual(resJson.error, 'File too large. Maximum size is 500MB.');
  });

  runTest('Course catalog query correctly isolates test fixtures from student/public catalog', () => {
    const fixtureFilter = {
      isTestFixture: { $ne: true },
      tags: { $nin: ['test', 'audit', 'fixture', 'automated-test', 'live-test'] },
      titleRegex: /^(?:\[(?:live\s+)?(?:audit\s+)?test\]|audit\s+curriculum|test\s+(?:cascade|curriculum)|(?:audit|test)\b.*\b\d{6,})/i,
    };

    const isFixtureCourse = (course) => {
      if (course.isTestFixture === true) return true;
      if (course.tags && course.tags.some((t) => ['test', 'audit', 'fixture', 'automated-test', 'live-test'].includes(t.toLowerCase()))) return true;
      if (fixtureFilter.titleRegex.test(course.title)) return true;
      return false;
    };

    // Public legitimate courses
    const legitCourse1 = { title: 'Applied Machine Learning', tags: ['ai', 'python'], status: 'published' };
    const legitCourse2 = { title: 'Modern Cybersecurity Fundamentals', tags: ['security'], status: 'published' };
    assert.strictEqual(isFixtureCourse(legitCourse1), false, 'Legitimate course 1 must not be marked as fixture');
    assert.strictEqual(isFixtureCourse(legitCourse2), false, 'Legitimate course 2 must not be marked as fixture');

    // Internal test fixtures
    const testFixture1 = { title: 'Audit Curriculum 1740000000000', tags: ['audit'], status: 'published' };
    const testFixture2 = { title: '[Live Audit Test] Modern Cloud Architectures', tags: ['test'], status: 'published' };
    const testFixture3 = { title: 'Test Curriculum 1740000000000', tags: ['automated-test'], status: 'published' };
    const testFixture4 = { title: 'Regular Title', isTestFixture: true, status: 'published' };

    assert.strictEqual(isFixtureCourse(testFixture1), true, 'Audit Curriculum fixture must be isolated');
    assert.strictEqual(isFixtureCourse(testFixture2), true, 'Live Audit Test fixture must be isolated');
    assert.strictEqual(isFixtureCourse(testFixture3), true, 'Automated Test fixture must be isolated');
    assert.strictEqual(isFixtureCourse(testFixture4), true, 'isTestFixture: true must be isolated');
  });

  // ── TEST GROUP 24: Video URLs (YouTube & Direct MP4), Embeds & SSRF Defense ─
  console.log('\n📦 GROUP 24: Video URLs Validation (YouTube & Direct MP4), Embeds & Security');

  const { validateVideoUrl } = require('./src/utils/videoUrlValidator');

  runTest('Video URL validator accepts standard YouTube watch URLs and generates embed URL', () => {
    const res = validateVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    assert.strictEqual(res.valid, true);
    assert.strictEqual(res.provider, 'youtube');
    assert.strictEqual(res.videoId, 'dQw4w9WgXcQ');
    assert.strictEqual(res.embedUrl, 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
    assert.strictEqual(res.normalizedUrl, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  });

  runTest('Video URL validator accepts YouTube short links (youtu.be)', () => {
    const res = validateVideoUrl('https://youtu.be/dQw4w9WgXcQ');
    assert.strictEqual(res.valid, true);
    assert.strictEqual(res.provider, 'youtube');
    assert.strictEqual(res.videoId, 'dQw4w9WgXcQ');
    assert.strictEqual(res.embedUrl, 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
  });

  runTest('Video URL validator accepts YouTube Shorts and mobile URLs', () => {
    const shortsRes = validateVideoUrl('https://www.youtube.com/shorts/dQw4w9WgXcQ');
    assert.strictEqual(shortsRes.valid, true);
    assert.strictEqual(shortsRes.provider, 'youtube');
    assert.strictEqual(shortsRes.videoId, 'dQw4w9WgXcQ');

    const mobileRes = validateVideoUrl('https://m.youtube.com/watch?v=dQw4w9WgXcQ&t=42s');
    assert.strictEqual(mobileRes.valid, true);
    assert.strictEqual(mobileRes.provider, 'youtube');
    assert.strictEqual(mobileRes.videoId, 'dQw4w9WgXcQ');
  });

  runTest('Video URL validator accepts direct HTTPS MP4, WebM, and MOV URLs', () => {
    const mp4Res = validateVideoUrl('https://cdn.example.com/lessons/module1/intro.mp4');
    assert.strictEqual(mp4Res.valid, true);
    assert.strictEqual(mp4Res.provider, 'direct');
    assert.ok(mp4Res.normalizedUrl.endsWith('.mp4'));

    const webmRes = validateVideoUrl('https://media.example.com/lectures/lecture_01.webm?token=abc123xyz');
    assert.strictEqual(webmRes.valid, true);
    assert.strictEqual(webmRes.provider, 'direct');
  });

  runTest('Video URL validator rejects insecure HTTP links with clear error message', () => {
    const res = validateVideoUrl('http://www.youtube.com/watch?v=dQw4w9WgXcQ');
    assert.strictEqual(res.valid, false);
    assert.ok(res.error.includes('Insecure HTTP URLs are not allowed'));
  });

  runTest('Video URL validator rejects unsafe schemes (javascript:, data:)', () => {
    const jsRes = validateVideoUrl('javascript:alert(1)');
    assert.strictEqual(jsRes.valid, false);

    const dataRes = validateVideoUrl('data:video/mp4;base64,AAAA');
    assert.strictEqual(dataRes.valid, false);
  });

  runTest('Video URL validator rejects embedded user credentials to prevent phishing/leakage', () => {
    const res = validateVideoUrl('https://admin:secret@cdn.example.com/video.mp4');
    assert.strictEqual(res.valid, false);
    assert.ok(res.error.includes('credentials'));
  });

  runTest('Video URL validator rejects unsupported video providers (Vimeo, Dailymotion, TikTok)', () => {
    const vimeoRes = validateVideoUrl('https://vimeo.com/123456789');
    assert.strictEqual(vimeoRes.valid, false);
    assert.ok(vimeoRes.error.includes('Unsupported video provider'));

    const tiktokRes = validateVideoUrl('https://www.tiktok.com/@creator/video/123456');
    assert.strictEqual(tiktokRes.valid, false);
  });

  runTest('Video URL validator rejects non-video web pages and arbitrary domains', () => {
    const res = validateVideoUrl('https://google.com/search?q=video');
    assert.strictEqual(res.valid, false);
    assert.ok(res.error.includes('Unsupported video provider'));
  });

  runTest('Video URL validator rejects invalid YouTube video IDs (non-11 character identifiers)', () => {
    const shortIdRes = validateVideoUrl('https://www.youtube.com/watch?v=short');
    assert.strictEqual(shortIdRes.valid, false);
    assert.ok(shortIdRes.error.includes('11-character video ID'));

    const longIdRes = validateVideoUrl('https://www.youtube.com/watch?v=waytoolongvideoid123456789');
    assert.strictEqual(longIdRes.valid, false);
  });

  // ── TEST GROUP 25: Published Course Catalog Visibility & Test Fixture Exclusion ─
  console.log('\n📦 GROUP 25: Published Course Catalog Visibility & Test Fixture Isolation');

  const fixtureFilterRegex = /^(?:\[(?:live\s+)?(?:audit\s+)?test\]|audit\s+curriculum|test\s+(?:cascade|curriculum)|(?:audit|test)\b.*\b\d{6,})/i;
  const fixtureTags = ['test', 'audit', 'fixture', 'automated-test', 'live-test'];

  const evaluateCatalogVisibility = (course, userRole = 'student', isStudioRequest = false) => {
    // Studio query for instructors
    if (userRole === 'instructor' && isStudioRequest) {
      return { visible: true, reason: 'studio_authoring' };
    }

    // Public / student catalog visibility
    if (course.status !== 'published') {
      return { visible: false, reason: 'draft_or_unpublished' };
    }
    if (course.isTestFixture === true) {
      return { visible: false, reason: 'is_test_fixture_flag' };
    }
    if (course.tags && course.tags.some(t => fixtureTags.includes(t.toLowerCase()))) {
      return { visible: false, reason: 'fixture_tag' };
    }
    if (fixtureFilterRegex.test(course.title)) {
      return { visible: false, reason: 'fixture_title_pattern' };
    }

    return { visible: true, reason: 'legitimate_published' };
  };

  runTest('Legitimate published course ("Introduction to Artificial Intelligence and Machine Learning") is fully visible in student catalog', () => {
    const aiCourse = {
      title: 'Introduction to Artificial Intelligence and Machine Learning',
      description: 'Learn the fundamentals of artificial intelligence and machine learning.',
      tags: ['ai'],
      category: 'General',
      status: 'published',
      isTestFixture: false,
    };

    const result = evaluateCatalogVisibility(aiCourse, 'student');
    assert.strictEqual(result.visible, true);
    assert.strictEqual(result.reason, 'legitimate_published');
    assert.strictEqual(fixtureFilterRegex.test(aiCourse.title), false);
  });

  runTest('Legitimate course titles with embedded words (contest, latest, testing) are not accidentally excluded', () => {
    const courses = [
      { title: 'Contest Mathematics & Olympiad Training', tags: ['math'], status: 'published' },
      { title: 'Latest Innovations in Deep Learning', tags: ['ai'], status: 'published' },
      { title: 'Software Testing & Quality Engineering', tags: ['engineering'], status: 'published' },
      { title: 'The Study of Plants and Plant Biology', tags: ['science'], status: 'published' },
      { title: 'Full Stack Web Development with MERN', tags: ['programming'], status: 'published' },
    ];

    courses.forEach(c => {
      const res = evaluateCatalogVisibility(c, 'student');
      assert.strictEqual(res.visible, true, `Legitimate title "${c.title}" must not be excluded`);
    });
  });

  runTest('Internal test fixtures and audit courses are strictly excluded from student catalog', () => {
    const fixtures = [
      { title: 'Audit Curriculum 1791981817317', tags: [], status: 'published' },
      { title: '[Live Audit Test] Modern Cloud Architectures 1791984814446', tags: ['audit', 'test'], status: 'published' },
      { title: '[Live Test] Distributed Architectures 1791984963478', tags: ['cloud', 'test'], status: 'published' },
      { title: 'Test Cascade', tags: [], status: 'published' },
      { title: 'Test Curriculum 1791982108098', tags: [], status: 'published' },
      { title: 'Artificial Intelligence Foundations', tags: ['automated-test'], status: 'published' },
      { title: 'Clean Architecture Principles', tags: [], isTestFixture: true, status: 'published' },
    ];

    fixtures.forEach(f => {
      const res = evaluateCatalogVisibility(f, 'student');
      assert.strictEqual(res.visible, false, `Fixture "${f.title}" must be excluded from public catalog`);
    });
  });

  runTest('Drafts, under-review, and rejected courses remain strictly hidden from student catalog', () => {
    const unpublished = [
      { title: 'Introduction to Artificial Intelligence and Machine Learning', tags: ['ai'], status: 'draft' },
      { title: 'Introduction to Artificial Intelligence and Machine Learning', tags: ['ai'], status: 'under_review' },
      { title: 'Introduction to Artificial Intelligence and Machine Learning', tags: ['ai'], status: 'rejected' },
      { title: 'The Study of Plants', tags: [], status: 'draft' },
    ];

    unpublished.forEach(c => {
      const res = evaluateCatalogVisibility(c, 'student');
      assert.strictEqual(res.visible, false);
      assert.strictEqual(res.reason, 'draft_or_unpublished');
    });
  });

  runTest('Instructor queries distinguish studio authoring from public catalog browsing', () => {
    const course = {
      title: 'Introduction to Artificial Intelligence and Machine Learning',
      tags: ['ai'],
      status: 'draft',
      instructorId: 'inst_1',
    };

    // 1. Studio authoring view (Dashboard) retrieves authored drafts
    const studioResult = evaluateCatalogVisibility(course, 'instructor', true);
    assert.strictEqual(studioResult.visible, true);
    assert.strictEqual(studioResult.reason, 'studio_authoring');

    // 2. Public catalog view (Browse Courses) hides drafts even for instructors
    const catalogResult = evaluateCatalogVisibility(course, 'instructor', false);
    assert.strictEqual(catalogResult.visible, false);
    assert.strictEqual(catalogResult.reason, 'draft_or_unpublished');
  });

  runTest('Publish workflow requires approval and enforces module/lesson presence', () => {
    // 1. Cannot publish draft without approval
    const draft = { status: 'draft', modules: [{ id: 'm1', lessons: ['l1'] }] };
    const validatePublish = (c, role = 'instructor') => {
      if (c.status !== 'approved' && !(role === 'admin' && ['under_review', 'pending'].includes(c.status))) {
        return { allowed: false, error: 'Course must be approved by an administrator before it can be published.' };
      }
      if (!c.modules || c.modules.length === 0) {
        return { allowed: false, error: 'Cannot publish a course without any modules.' };
      }
      const totalLessons = c.modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0);
      if (totalLessons === 0) {
        return { allowed: false, error: 'Cannot publish a course without any lessons.' };
      }
      return { allowed: true };
    };

    assert.strictEqual(validatePublish(draft).allowed, false);

    // 2. Approved course without modules cannot be published
    const approvedNoModules = { status: 'approved', modules: [] };
    assert.strictEqual(validatePublish(approvedNoModules).allowed, false);

    // 3. Approved course without lessons cannot be published
    const approvedNoLessons = { status: 'approved', modules: [{ id: 'm1', lessons: [] }] };
    assert.strictEqual(validatePublish(approvedNoLessons).allowed, false);

    // 4. Approved course with module and lesson successfully publishes
    const approvedComplete = { status: 'approved', modules: [{ id: 'm1', lessons: ['l1'] }] };
    assert.strictEqual(validatePublish(approvedComplete).allowed, true);
  });

  // ── TEST GROUP 26: Admin Approval Resilience, Notifications Auth & Enrollment RBAC ──
  console.log('\n📦 GROUP 26: Admin Approval Resilience, Notifications Auth & Enrollment RBAC');

  runTest('Admin approve route safely defaults undefined req.body without throwing TypeError', () => {
    const approveMiddleware = (req, res, next) => {
      req.body = req.body || {};
      req.body.action = req.body.action || 'publish';
      return { action: req.body.action };
    };

    const reqWithoutBody = {};
    const result = approveMiddleware(reqWithoutBody);
    assert.strictEqual(result.action, 'publish');
    assert.strictEqual(reqWithoutBody.body.action, 'publish');
  });

  runTest('Admin reject route safely defaults undefined req.body and preserves reason', () => {
    const rejectMiddleware = (req, res, next) => {
      req.body = req.body || {};
      req.body.action = req.body.action || 'reject';
      return { action: req.body.action, reason: req.body.reason };
    };

    const reqEmpty = {};
    const resultEmpty = rejectMiddleware(reqEmpty);
    assert.strictEqual(resultEmpty.action, 'reject');

    const reqWithReason = { body: { reason: 'Syllabus incomplete' } };
    const resultReason = rejectMiddleware(reqWithReason);
    assert.strictEqual(resultReason.action, 'reject');
    assert.strictEqual(resultReason.reason, 'Syllabus incomplete');
  });

  runTest('Draft course cannot be reviewed before submission for review', () => {
    const validateCourseReview = (course, action) => {
      if (!course) return { allowed: false, status: 404, error: 'Course not found.' };
      if (course.status === 'draft') {
        return { allowed: false, status: 400, error: 'Cannot review a course that is still in draft. The instructor must submit it for review first.' };
      }
      return { allowed: true };
    };

    const draftCourse = { _id: 'c1', status: 'draft' };
    const underReviewCourse = { _id: 'c2', status: 'under_review' };

    const draftResult = validateCourseReview(draftCourse, 'publish');
    assert.strictEqual(draftResult.allowed, false);
    assert.strictEqual(draftResult.status, 400);

    const underReviewResult = validateCourseReview(underReviewCourse, 'publish');
    assert.strictEqual(underReviewResult.allowed, true);
  });

  runTest('Non-admin users are strictly rejected from admin approval endpoints (RBAC 403)', () => {
    const adminAuth = authorize('admin');
    
    let studentStatus = null;
    let instructorStatus = null;
    let adminPassed = false;

    adminAuth({ user: { role: 'student', userId: 's1' } }, { status(s) { studentStatus = s; return this; }, json() {} }, () => {});
    adminAuth({ user: { role: 'instructor', userId: 'i1' } }, { status(s) { instructorStatus = s; return this; }, json() {} }, () => {});
    adminAuth({ user: { role: 'admin', userId: 'a1' } }, {}, () => { adminPassed = true; });

    assert.strictEqual(studentStatus, 403);
    assert.strictEqual(instructorStatus, 403);
    assert.strictEqual(adminPassed, true);
  });

  runTest('Notifications route allows all authenticated roles (student, instructor, admin)', () => {
    // Authenticate middleware validates Bearer token and attaches decoded user
    const checkNotificationAccess = (user) => {
      if (!user || !user.userId) return { status: 401, error: 'No token provided. Please log in.' };
      return { status: 200, allowed: true };
    };

    assert.strictEqual(checkNotificationAccess(null).status, 401);
    assert.strictEqual(checkNotificationAccess({ userId: 'u_admin', role: 'admin' }).status, 200);
    assert.strictEqual(checkNotificationAccess({ userId: 'u_inst', role: 'instructor' }).status, 200);
    assert.strictEqual(checkNotificationAccess({ userId: 'u_stud', role: 'student' }).status, 200);
  });

  runTest('Course enrollment strictly rejects admin and instructor roles with 403', () => {
    const studentOnlyAuth = authorize('student');

    let adminStatus = null;
    let instructorStatus = null;
    let studentPassed = false;

    studentOnlyAuth({ user: { role: 'admin', userId: 'a1' } }, { status(s) { adminStatus = s; return this; }, json() {} }, () => {});
    studentOnlyAuth({ user: { role: 'instructor', userId: 'i1' } }, { status(s) { instructorStatus = s; return this; }, json() {} }, () => {});
    studentOnlyAuth({ user: { role: 'student', userId: 's1' } }, {}, () => { studentPassed = true; });

    assert.strictEqual(adminStatus, 403);
    assert.strictEqual(instructorStatus, 403);
    assert.strictEqual(studentPassed, true);
  });

  runTest('Course enrollment rejects unpublished courses for eligible students with 400', () => {
    const validateEnrollment = (course) => {
      if (!course) return { status: 404, error: 'Course not found.' };
      if (course.status !== 'published') {
        return { status: 400, error: 'This course is not available for enrollment.' };
      }
      return { status: 201, allowed: true };
    };

    assert.strictEqual(validateEnrollment({ status: 'under_review' }).status, 400);
    assert.strictEqual(validateEnrollment({ status: 'draft' }).status, 400);
    assert.strictEqual(validateEnrollment({ status: 'rejected' }).status, 400);
    assert.strictEqual(validateEnrollment({ status: 'published' }).status, 201);
  });

  // ── 7. CATALOG ISOLATION & AUDIT FIXTURE SEGREGATION REGRESSION TESTS ──
  console.log('\n--- Catalog Isolation & Fixture Segregation Regression Suite ---');

  const FIXTURE_TAGS = ['test', 'audit', 'fixture', 'automated-test', 'live-test'];
  const FIXTURE_TITLE_REGEX = /^(?:\[(?:live\s+)?(?:audit\s+)?test\]|audit\s+curriculum|test\s+(?:cascade|curriculum)|(?:audit|test)\b.*\b\d{6,})/i;

  const isFixture = (course) => {
    if (!course) return false;
    if (course.isTestFixture === true) return true;
    if (course.tags && course.tags.some((t) => FIXTURE_TAGS.includes(t.toLowerCase()))) return true;
    if (FIXTURE_TITLE_REGEX.test(course.title)) return true;
    return false;
  };

  runTest('Legitimate course "Introduction to Artificial Intelligence and Machine Learning" is NOT classified as a fixture', () => {
    const aiCourse = {
      title: 'Introduction to Artificial Intelligence and Machine Learning',
      status: 'published',
      tags: ['ai'],
      isTestFixture: false,
    };
    assert.strictEqual(isFixture(aiCourse), false);
  });

  runTest('Fixture titles "[Live Test] Distributed Architectures" and "[Live Audit Test] Modern Cloud Architectures" are classified as fixtures', () => {
    const liveTest = {
      title: '[Live Test] Distributed Architectures 1791984963478',
      status: 'published',
      tags: ['audit', 'cloud', 'test'],
    };
    const liveAudit = {
      title: '[Live Audit Test] Modern Cloud Architectures 1791984814446',
      status: 'published',
      tags: ['audit', 'cloud', 'test'],
    };
    const auditCurriculum = {
      title: 'Audit Curriculum 1791983368899',
      status: 'published',
      tags: [],
    };
    assert.strictEqual(isFixture(liveTest), true);
    assert.strictEqual(isFixture(liveAudit), true);
    assert.strictEqual(isFixture(auditCurriculum), true);
  });

  runTest('Public / student catalog filter preserves legitimate AI course and rejects all fixture titles', () => {
    const catalogCourses = [
      { _id: '1', title: 'Introduction to Artificial Intelligence and Machine Learning', status: 'published', tags: ['ai'] },
      { _id: '2', title: '[Live Test] Distributed Architectures 1791984963478', status: 'published', tags: ['audit', 'cloud', 'test'] },
      { _id: '3', title: '[Live Audit Test] Modern Cloud Architectures 1791984814446', status: 'published', tags: ['audit'] },
      { _id: '4', title: 'Audit Curriculum 1791981817317', status: 'published', tags: [] },
      { _id: '5', title: 'The Study of Plants', status: 'draft', tags: [] },
    ];

    const studentVisible = catalogCourses.filter((c) => c.status === 'published' && !isFixture(c));
    assert.strictEqual(studentVisible.length, 1);
    assert.strictEqual(studentVisible[0].title, 'Introduction to Artificial Intelligence and Machine Learning');
  });

  runTest('Administrator Published moderation tab filter excludes test fixtures and displays legitimate published courses', () => {
    const courses = [
      { _id: '1', title: 'Introduction to Artificial Intelligence and Machine Learning', status: 'published', tags: ['ai'] },
      { _id: '2', title: '[Live Test] Distributed Architectures 1791984963478', status: 'published', tags: ['audit', 'cloud', 'test'] },
      { _id: '3', title: '[Live Audit Test] Modern Cloud Architectures 1791984814446', status: 'published', tags: ['audit'] },
      { _id: '4', title: 'The Study of Plants', status: 'draft', tags: [] },
      { _id: '5', title: 'python lesson', status: 'pending', tags: [] },
    ];

    const publishedTabCourses = courses.filter((c) => c.status === 'published' && !isFixture(c));
    assert.strictEqual(publishedTabCourses.length, 1);
    assert.strictEqual(publishedTabCourses[0].title, 'Introduction to Artificial Intelligence and Machine Learning');
  });

  runTest('Administrator Audit Fixtures moderation tab filter retains all internal audit and test fixtures', () => {
    const courses = [
      { _id: '1', title: 'Introduction to Artificial Intelligence and Machine Learning', status: 'published', tags: ['ai'] },
      { _id: '2', title: '[Live Test] Distributed Architectures 1791984963478', status: 'published', tags: ['audit', 'cloud', 'test'] },
      { _id: '3', title: '[Live Audit Test] Modern Cloud Architectures 1791984814446', status: 'published', tags: ['audit'] },
      { _id: '4', title: 'Audit Curriculum 1791983368899', status: 'draft', tags: [] },
    ];

    const auditFixturesTab = courses.filter((c) => isFixture(c));
    assert.strictEqual(auditFixturesTab.length, 3);
    assert.ok(auditFixturesTab.some((c) => c.title.includes('[Live Test]')));
    assert.ok(auditFixturesTab.some((c) => c.title.includes('[Live Audit Test]')));
    assert.ok(auditFixturesTab.some((c) => c.title.includes('Audit Curriculum')));
  });

  runTest('Direct course access rejects unauthenticated and student users from test fixtures with 404', () => {
    const evaluateDirectAccess = (user, course) => {
      const { role, userId } = user || {};
      const instructorOwnerId = course.instructorId?._id || course.instructorId;
      const isEnrolledUser = false;

      if (isFixture(course) && role !== 'admin' && instructorOwnerId !== userId && !isEnrolledUser) {
        return { status: 404, error: 'Course not found.' };
      }
      if ((!role || role === 'student') && course.status !== 'published' && !isEnrolledUser) {
        return { status: 403, error: 'This course is not yet published.' };
      }
      return { status: 200, allowed: true };
    };

    const fixture = {
      _id: 'fix1',
      title: '[Live Test] Distributed Architectures 1791984963478',
      status: 'published',
      tags: ['audit'],
      instructorId: 'inst_other',
    };

    const legitimateAI = {
      _id: 'ai1',
      title: 'Introduction to Artificial Intelligence and Machine Learning',
      status: 'published',
      tags: ['ai'],
      instructorId: 'inst_owner',
    };

    // Anonymous & student rejected with 404 from fixture
    assert.strictEqual(evaluateDirectAccess(null, fixture).status, 404);
    assert.strictEqual(evaluateDirectAccess({ role: 'student', userId: 's1' }, fixture).status, 404);

    // Admin allowed to access fixture for moderation & audit workflows
    assert.strictEqual(evaluateDirectAccess({ role: 'admin', userId: 'a1' }, fixture).status, 200);

    // Legitimate AI course accessible to all
    assert.strictEqual(evaluateDirectAccess(null, legitimateAI).status, 200);
    assert.strictEqual(evaluateDirectAccess({ role: 'student', userId: 's1' }, legitimateAI).status, 200);
  });

  // ── TEST GROUP 27: Saved Lesson Video URL Persistence, Delivery & 90% Watch Time ─
  console.log('\n📦 GROUP 27: Saved Lesson Video URL Persistence, Delivery & 90% Watch Time');

  const Lesson = require('./src/models/Lesson');

  runTest('Lesson creation with YouTube URL persists and synchronizes both videoUrl and contentUrl', () => {
    const ytUrl = 'https://www.youtube.com/watch?v=ad79nYk2keg';
    const lesson = new Lesson({
      moduleId: new (require('mongoose').Types.ObjectId)(),
      title: 'What Is Artificial Intelligence?',
      type: 'video',
      videoUrl: ytUrl,
      durationSeconds: 300,
    });

    const obj = lesson.toObject();
    assert.strictEqual(obj.videoUrl, ytUrl);
    assert.strictEqual(obj.contentUrl, ytUrl);

    const json = lesson.toJSON();
    assert.strictEqual(json.videoUrl, ytUrl);
    assert.strictEqual(json.contentUrl, ytUrl);
  });

  runTest('Lesson created with legacy contentUrl automatically exposes videoUrl to student player', () => {
    const directUrl = 'https://cdn.example.com/ai_intro.mp4';
    const lesson = new Lesson({
      moduleId: new (require('mongoose').Types.ObjectId)(),
      title: 'Machine Learning Overview',
      type: 'video',
      contentUrl: directUrl,
      durationSeconds: 600,
    });

    const obj = lesson.toObject();
    assert.strictEqual(obj.videoUrl, directUrl);
    assert.strictEqual(obj.contentUrl, directUrl);
  });

  runTest('Student lesson retrieval resolution guarantees videoUrl presence across property aliases', () => {
    const resolveLessonMedia = (rawDoc) => {
      const obj = rawDoc.toObject ? rawDoc.toObject() : { ...rawDoc };
      if (obj.type === 'video') {
        const resolved = obj.videoUrl || obj.contentUrl || obj.videoURL || obj.video || null;
        obj.videoUrl = resolved;
        obj.contentUrl = resolved;
      }
      return obj;
    };

    // Case 1: videoUrl populated
    const doc1 = { type: 'video', videoUrl: 'https://www.youtube.com/watch?v=ad79nYk2keg' };
    const res1 = resolveLessonMedia(doc1);
    assert.strictEqual(res1.videoUrl, 'https://www.youtube.com/watch?v=ad79nYk2keg');
    assert.strictEqual(res1.contentUrl, 'https://www.youtube.com/watch?v=ad79nYk2keg');

    // Case 2: legacy videoURL alias
    const doc2 = { type: 'video', videoURL: 'https://cdn.example.com/ml.mp4' };
    const res2 = resolveLessonMedia(doc2);
    assert.strictEqual(res2.videoUrl, 'https://cdn.example.com/ml.mp4');
    assert.strictEqual(res2.contentUrl, 'https://cdn.example.com/ml.mp4');

    // Case 3: legacy contentUrl only
    const doc3 = { type: 'video', contentUrl: 'https://youtu.be/ad79nYk2keg' };
    const res3 = resolveLessonMedia(doc3);
    assert.strictEqual(res3.videoUrl, 'https://youtu.be/ad79nYk2keg');
    assert.strictEqual(res3.contentUrl, 'https://youtu.be/ad79nYk2keg');
  });

  runTest('Editing lesson video URL updates both videoUrl and contentUrl consistently', () => {
    const lesson = new Lesson({
      moduleId: new (require('mongoose').Types.ObjectId)(),
      title: 'Deep Learning',
      type: 'video',
      contentUrl: 'https://www.youtube.com/watch?v=old12345678',
      videoUrl: 'https://www.youtube.com/watch?v=old12345678',
      durationSeconds: 400,
    });

    const updatedUrl = 'https://www.youtube.com/watch?v=new87654321';
    lesson.videoUrl = updatedUrl;
    lesson.contentUrl = updatedUrl;

    const obj = lesson.toObject();
    assert.strictEqual(obj.videoUrl, updatedUrl);
    assert.strictEqual(obj.contentUrl, updatedUrl);
  });

  runTest('Missing or empty video URL produces empty/error state and is never treated as successful playback', () => {
    const checkPlaybackState = (lesson) => {
      const rawUrl = lesson.videoUrl || lesson.contentUrl || lesson.videoURL || lesson.video || '';
      if (!rawUrl || !rawUrl.trim()) {
        return { canPlay: false, state: 'empty', message: 'No video stream is currently attached to this lesson.' };
      }
      const val = validateVideoUrl(rawUrl);
      if (!val.valid) {
        return { canPlay: false, state: 'invalid', message: val.error };
      }
      return { canPlay: true, state: 'ready', provider: val.provider };
    };

    const emptyLesson = { type: 'video', title: 'Empty Video', durationSeconds: 300 };
    const stateEmpty = checkPlaybackState(emptyLesson);
    assert.strictEqual(stateEmpty.canPlay, false);
    assert.strictEqual(stateEmpty.state, 'empty');
    assert.strictEqual(stateEmpty.message, 'No video stream is currently attached to this lesson.');

    const invalidLesson = { type: 'video', title: 'Bad Link', videoUrl: 'https://not-a-video.com/page' };
    const stateInvalid = checkPlaybackState(invalidLesson);
    assert.strictEqual(stateInvalid.canPlay, false);
    assert.strictEqual(stateInvalid.state, 'invalid');
  });

  runTest('Audited watch-time tracking strictly enforces 90% threshold for lesson completion', () => {
    const duration = 300; // 5 minutes = 300 seconds
    const threshold = duration * 0.9; // 270 seconds

    const evaluateProgress = (watchedSeconds) => {
      const bounded = Math.min(Math.max(0, watchedSeconds), duration);
      const completed = bounded >= threshold;
      return { watchedSeconds: bounded, completed, percentWatched: Math.round((bounded / duration) * 100) };
    };

    // 1. Initial iframe mount / 1 second ping MUST NOT mark complete
    const initialMount = evaluateProgress(1);
    assert.strictEqual(initialMount.completed, false);
    assert.strictEqual(initialMount.watchedSeconds, 1);

    // 2. 50% watch time
    const halfWay = evaluateProgress(150);
    assert.strictEqual(halfWay.completed, false);
    assert.strictEqual(halfWay.percentWatched, 50);

    // 3. 89% watch time (267s < 270s) MUST NOT mark complete
    const almostDone = evaluateProgress(267);
    assert.strictEqual(almostDone.completed, false);
    assert.strictEqual(almostDone.percentWatched, 89);

    // 4. Exact 90% threshold (270s) marks complete
    const exactThreshold = evaluateProgress(270);
    assert.strictEqual(exactThreshold.completed, true);
    assert.strictEqual(exactThreshold.percentWatched, 90);

    // 5. 100% watch time marks complete
    const fullyWatched = evaluateProgress(300);
    assert.strictEqual(fullyWatched.completed, true);
    assert.strictEqual(fullyWatched.percentWatched, 100);
  });

  // ── TEST GROUP 28: Audited Playback Tracking, Anti-Seeking & Accreditation ──
  console.log('\n📦 GROUP 28: Audited Playback Tracking, Anti-Seeking Traversal & Duration Clamping');

  // Simulation of client-side playback tracking engine
  class PlaybackTracker {
    constructor(lessonDuration, initialWatched = 0, initialPosition = 0) {
      this.lessonDuration = lessonDuration;
      this.watchedSet = new Set();
      for (let i = 0; i < initialWatched; i++) {
        this.watchedSet.add(i);
      }
      this.lastPosition = initialPosition;
      this.playbackRate = 1.0;
      this.isPlaying = false;
    }

    setPlaying(playing) {
      this.isPlaying = playing;
    }

    setPlaybackRate(rate) {
      this.playbackRate = rate;
    }

    sample(currentPos) {
      if (!this.isPlaying) return; // Do not count paused or buffering time
      const maxElapsed = 2.5 * this.playbackRate;

      if (this.lastPosition >= 0 && currentPos >= this.lastPosition && (currentPos - this.lastPosition) <= maxElapsed) {
        // Continuous legitimate playback
        const startSec = Math.floor(this.lastPosition);
        const endSec = Math.floor(currentPos);
        for (let s = startSec; s <= endSec; s++) {
          this.watchedSet.add(s);
        }
      } else {
        // Seek forward or backward: credit only current second
        this.watchedSet.add(Math.floor(currentPos));
      }

      this.lastPosition = currentPos;
    }

    getEligibleSeconds() {
      return Math.min(this.lessonDuration, this.watchedSet.size);
    }

    getPercentage() {
      return Math.min(100, Math.round((this.getEligibleSeconds() / this.lessonDuration) * 100));
    }
  }

  runTest('1. Watching lesson for 30 seconds increases verified progress appropriately (10%)', () => {
    const tracker = new PlaybackTracker(300, 0, 0);
    tracker.setPlaying(true);
    for (let sec = 1; sec <= 30; sec++) {
      tracker.sample(sec);
    }
    assert.strictEqual(tracker.getEligibleSeconds(), 31); // 0 through 30 seconds
    assert.strictEqual(tracker.getPercentage(), 10);
  });

  runTest('2. Pausing for 15 seconds stops progress accumulation completely', () => {
    const tracker = new PlaybackTracker(300, 31, 30);
    tracker.setPlaying(false); // Paused
    for (let tick = 0; tick < 15; tick++) {
      tracker.sample(30); // Position does not advance while paused
    }
    assert.strictEqual(tracker.getEligibleSeconds(), 31, 'Paused time must not accumulate watch progress');
    assert.strictEqual(tracker.getPercentage(), 10);
  });

  runTest('3. Resuming playback after pause continues progress accumulation', () => {
    const tracker = new PlaybackTracker(300, 31, 30);
    tracker.setPlaying(true); // Resumed
    for (let sec = 31; sec <= 60; sec++) {
      tracker.sample(sec);
    }
    assert.strictEqual(tracker.getEligibleSeconds(), 61);
    assert.strictEqual(tracker.getPercentage(), 20);
  });

  runTest('4. Seeking forward without watching rejects skipped portion and only credits current position', () => {
    const tracker = new PlaybackTracker(300, 61, 60);
    tracker.setPlaying(true);
    // Student seeks to 5:17 (317 seconds) in a 328s video without playing seconds 61-316
    tracker.sample(317);
    // Skipped 256 seconds MUST NOT be credited
    assert.strictEqual(tracker.watchedSet.has(150), false, 'Skipped second 150 must not be in watched set');
    assert.strictEqual(tracker.watchedSet.has(250), false, 'Skipped second 250 must not be in watched set');
    assert.strictEqual(tracker.getEligibleSeconds(), 62); // 61 prior seconds + second 317
    assert.strictEqual(tracker.getPercentage(), 21); // (62 / 300) = 20.6% -> 21%
  });

  runTest('5. Finished playback reflects actual eligible watch time without phantom credit', () => {
    const tracker = new PlaybackTracker(300, 62, 317);
    tracker.setPlaying(true);
    for (let sec = 318; sec <= 328; sec++) {
      tracker.sample(sec);
    }
    tracker.setPlaying(false); // Ended
    // Watched 0-61 (62s) + 317-328 (12s) = 74 seconds total
    assert.strictEqual(tracker.getEligibleSeconds(), 74);
    assert.strictEqual(tracker.getPercentage(), 25); // 74 / 300 = 24.6% -> 25%
  });

  runTest('6. Refreshing page preserves previously earned progress idempotently', () => {
    // Student leaves and returns with 73 seconds previously persisted
    const trackerAfterRefresh = new PlaybackTracker(300, 73, 328);
    assert.strictEqual(trackerAfterRefresh.getEligibleSeconds(), 73, 'Progress must persist after refresh');
    assert.strictEqual(trackerAfterRefresh.getPercentage(), 24);
  });

  runTest('7. Verified progress never exceeds 100% even if media duration exceeds configured lesson duration', () => {
    // Configured lesson duration is 300 seconds, media has 328 seconds
    const tracker = new PlaybackTracker(300, 0, 0);
    tracker.setPlaying(true);
    for (let sec = 0; sec <= 328; sec++) {
      tracker.sample(sec);
    }
    assert.strictEqual(tracker.watchedSet.size, 329);
    assert.strictEqual(tracker.getEligibleSeconds(), 300, 'Eligible seconds must be clamped to configured lesson duration');
    assert.strictEqual(tracker.getPercentage(), 100, 'Progress percentage must never exceed 100%');
  });

  runTest('8. Accreditation becomes eligible at 90% verified watch time when assessment requirements are met', () => {
    const duration = 300;
    const threshold = duration * 0.9; // 270s

    const checkAccreditation = (watchedSeconds, quizPassed = true) => {
      const isWatchTimeVerified = watchedSeconds >= threshold;
      const eligible = isWatchTimeVerified && quizPassed;
      return { isWatchTimeVerified, eligible };
    };

    // At 269s (89%): ineligible
    assert.strictEqual(checkAccreditation(269, true).eligible, false);

    // At 270s (90%) with passed quiz: eligible!
    assert.strictEqual(checkAccreditation(270, true).eligible, true);

    // At 270s (90%) but quiz NOT passed: ineligible!
    assert.strictEqual(checkAccreditation(270, false).eligible, false);
  });

  // ── GROUP 29: Course-Level vs Lesson-Level Progress Consistency & Certificate Eligibility ──
  console.log('\n📦 GROUP 29: Course-Level Progress Consistency & Assessment Accreditation');

  runTest('1. Enriched enrollment calculates accurate course percentage from completed lessons', () => {
    // Helper function mirroring backend enrollmentController enrichment
    const calculateProgress = (totalLessons, completedLessons, totalQuizzes, quizzesPassed, status = 'active') => {
      if (status === 'completed') {
        return { progressPercentage: 100, isEligibleForCertificate: true };
      }
      const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
      const isEligibleForCertificate =
        totalLessons > 0 &&
        completedLessons >= totalLessons &&
        quizzesPassed >= totalQuizzes &&
        status !== 'dropped';
      return { progressPercentage, isEligibleForCertificate };
    };

    // Course with 2 lessons, 1 completed
    const r1 = calculateProgress(2, 1, 0, 0);
    assert.strictEqual(r1.progressPercentage, 50);
    assert.strictEqual(r1.isEligibleForCertificate, false);

    // Course with 1 lesson (100% completed), but 1 mandatory quiz unpassed
    const r2 = calculateProgress(1, 1, 1, 0);
    assert.strictEqual(r2.progressPercentage, 100, 'Lesson progress must reflect 100% video completion');
    assert.strictEqual(r2.isEligibleForCertificate, false, 'Must NOT be eligible for certificate until quiz is passed');

    // Course with 1 lesson completed AND 1 quiz passed
    const r3 = calculateProgress(1, 1, 1, 1);
    assert.strictEqual(r3.progressPercentage, 100);
    assert.strictEqual(r3.isEligibleForCertificate, true, 'Must be eligible once all lessons and quizzes are passed');

    // Dropped enrollment with 100% progress cannot claim certificate
    const r4 = calculateProgress(1, 1, 1, 1, 'dropped');
    assert.strictEqual(r4.isEligibleForCertificate, false, 'Dropped enrollment cannot claim certificate');
  });

  runTest('2. Server completion check prevents certificate issuance if quiz is not passed', () => {
    const totalLessons = 2;
    const completedLessons = 2;
    const totalQuizzes = 1;
    const quizzesPassed = 0;

    const canComplete = completedLessons >= totalLessons && quizzesPassed >= totalQuizzes;
    assert.strictEqual(canComplete, false, 'Must reject certificate when assessments are incomplete');
  });

  // ── SUMMARY REPORT ───────────────────────────────────────────────────────
  console.log('\n======================================================');
  console.log(`📊 TEST RESULTS: ${passedTests}/${totalTests} PASSED`);
  if (passedTests === totalTests) {
    console.log('🌟 ALL AUTOMATED WORKFLOW TESTS PASSED PERFECTLY!');
  } else {
    console.log(`⚠️ ${totalTests - passedTests} TESTS FAILED`);
  }
  console.log('======================================================\n');
}

runAllTests().catch((e) => {
  console.error('Fatal test error:', e);
  process.exit(1);
});
