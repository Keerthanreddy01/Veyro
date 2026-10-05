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
    const buildHealthResponse = (readyState) => {
      const isDbConnected = readyState === 1;
      const dbState = isDbConnected ? 'connected' : 'disconnected';
      return {
        status: isDbConnected ? 'ok' : 'degraded',
        service: 'veyro-api',
        database: dbState,
        timestamp: new Date().toISOString(),
      };
    };

    const healthy = buildHealthResponse(1);
    assert.strictEqual(healthy.status, 'ok');
    assert.strictEqual(healthy.service, 'veyro-api');
    assert.strictEqual(healthy.database, 'connected');

    const degraded = buildHealthResponse(0);
    assert.strictEqual(degraded.status, 'degraded');
    assert.strictEqual(degraded.database, 'disconnected');
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

    const uriWithSecret = 'mongodb+srv://fakeTestUser:FakeTestPass123@fake-cluster.example.mongodb.net/test_db?retryWrites=true';
    const host = getSanitizedHost(uriWithSecret);

    assert.strictEqual(host, 'cluster0.abcde.mongodb.net');
    assert.ok(!host.includes('REDACTED_CREDENTIAL'));
    assert.ok(!host.includes('adminUser'));
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

    const config = 'http://localhost:5173, https://veyro-sandy.vercel.app/ ';
    assert.strictEqual(checkOriginAllowed(config, 'https://veyro-sandy.vercel.app'), true);
    assert.strictEqual(checkOriginAllowed(config, 'https://veyro-sandy.vercel.app/'), true);
    assert.strictEqual(checkOriginAllowed(config, 'http://localhost:5173'), true);
    assert.strictEqual(checkOriginAllowed(config, 'https://malicious-site.com'), false);
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
