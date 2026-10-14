const BASE_URL = 'http://localhost:5000/api';

async function req(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(url, { ...options, headers });
  let body;
  try {
    body = await res.json();
  } catch (e) {
    body = null;
  }
  return { status: res.status, ok: res.ok, body };
}

async function runAudit() {
  console.log('====================================================');
  console.log('🔍 STARTING VEYRO LMS END-TO-END COMPREHENSIVE AUDIT');
  console.log('====================================================\n');

  const results = [];
  function record(name, pass, details = '') {
    results.push({ name, pass, details });
    console.log(`${pass ? '✅ PASS' : '❌ FAIL'}: ${name} ${details ? '(' + details + ')' : ''}`);
  }

  // 1. Log in admin and instructor
  const adminLogin = await req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@veyro.com', password: 'Admin@123456' }),
  });
  if (!adminLogin.ok) {
    console.error('Failed to log in as admin:', adminLogin.body);
    process.exit(1);
  }
  const adminToken = adminLogin.body.accessToken;
  record('Admin authentication', true, 'admin@veyro.com');

  const instructorLogin = await req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'instructor@veyro.com', password: 'Instructor@123456' }),
  });
  if (!instructorLogin.ok) {
    console.error('Failed to log in as instructor:', instructorLogin.body);
    process.exit(1);
  }
  const instructorToken = instructorLogin.body.accessToken;
  const instructorId = instructorLogin.body.user._id;
  record('Instructor 1 authentication', true, 'instructor@veyro.com');

  // Register or login a dedicated test student
  const studentEmail = `audit_student_${Date.now()}@veyro.com`;
  const studentReg = await req('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Audit Test Student',
      email: studentEmail,
      password: 'Password@123',
      role: 'student',
    }),
  });
  let studentToken;
  let studentId;
  if (studentReg.ok) {
    studentToken = studentReg.body.accessToken;
    studentId = studentReg.body.user._id;
    record('Dedicated student registered', true, studentEmail);
  } else {
    const sLogin = await req('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: studentEmail, password: 'Password@123' }),
    });
    studentToken = sLogin.body.accessToken;
    studentId = sLogin.body.user._id;
    record('Dedicated student logged in', true, studentEmail);
  }

  // Register dedicated second instructor for cross-tenant IDOR checks
  const inst2Email = `audit_inst2_${Date.now()}@veyro.com`;
  const inst2Reg = await req('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Second Instructor',
      email: inst2Email,
      password: 'Password@123',
      role: 'instructor',
    }),
  });
  const inst2Token = inst2Reg.body.accessToken;
  const inst2Id = inst2Reg.body.user._id;
  record('Dedicated Instructor 2 registered', true, inst2Email);

  // -------------------------------------------------------------------------
  // WORKFLOW 1: Instructor creates course, adds module, lessons, quiz, submits
  // -------------------------------------------------------------------------
  console.log('\n--- WORKFLOW 1: Instructor Course Creation & Curriculum Builder ---');
  const coursePayload = {
    title: `Audit Curriculum ${Date.now()}`,
    description: 'Comprehensive end-to-end audit curriculum covering TypeScript, security, and verification.',
    category: 'Engineering',
    level: 'advanced',
    price: 99.99,
    learningObjectives: ['Master system security', 'Execute zero-defect workflows'],
    prerequisites: ['Basic JavaScript knowledge'],
  };

  const createCourseRes = await req('/courses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${instructorToken}` },
    body: JSON.stringify(coursePayload),
  });
  const courseId = createCourseRes.body?.course?._id;
  record('Instructor creates course', createCourseRes.ok && !!courseId, `ID: ${courseId}`);

  // Add module
  const createModuleRes = await req(`/courses/${courseId}/modules`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${instructorToken}` },
    body: JSON.stringify({ title: 'Module 1: Architecture & Security', order: 1 }),
  });
  const moduleId = createModuleRes.body?.module?._id;
  record('Instructor adds module milestone', createModuleRes.ok && !!moduleId, `ID: ${moduleId}`);

  // Add video lesson under module
  const createLesson1Res = await req(`/modules/${moduleId}/lessons`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${instructorToken}` },
    body: JSON.stringify({
      title: 'Lesson 1.1: Core Architecture Walkthrough',
      type: 'video',
      durationSeconds: 120,
      order: 1,
      summary: 'Architectural overview of system design.',
    }),
  });
  const lesson1Id = createLesson1Res.body?.lesson?._id;
  record('Instructor adds video lesson', createLesson1Res.ok && !!lesson1Id, `Lesson 1 ID: ${lesson1Id}`);

  // Add PDF lesson under module
  const createLesson2Res = await req(`/modules/${moduleId}/lessons`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${instructorToken}` },
    body: JSON.stringify({
      title: 'Lesson 1.2: Specification Document',
      type: 'pdf',
      order: 2,
      summary: 'Reading material for compliance.',
    }),
  });
  const lesson2Id = createLesson2Res.body?.lesson?._id;
  record('Instructor adds PDF lesson', createLesson2Res.ok && !!lesson2Id, `Lesson 2 ID: ${lesson2Id}`);

  // Create Quiz in Module
  const createQuizRes = await req(`/modules/${moduleId}/quizzes`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${instructorToken}` },
    body: JSON.stringify({
      title: 'Module 1 Benchmark Assessment',
      passingScore: 70,
      timeLimitSeconds: 300,
      questions: [
        {
          questionText: 'Which HTTP status code signifies Forbidden access in RBAC?',
          options: ['200 OK', '401 Unauthorized', '403 Forbidden', '500 Server Error'],
          correctOptionIndex: 2,
        },
        {
          questionText: 'What is the minimum video attendance required for certificate eligibility?',
          options: ['50%', '75%', '90%', '100%'],
          correctOptionIndex: 2,
        },
      ],
    }),
  });
  const quizId = createQuizRes.body?.quiz?._id;
  record('Instructor attaches assessment quiz', createQuizRes.ok && !!quizId, `Quiz ID: ${quizId}`);

  // Submit course for review
  const submitRes = await req(`/courses/${courseId}/submit`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${instructorToken}` },
  });
  record('Instructor submits course for administrative review', submitRes.ok && submitRes.body?.course?.status === 'under_review');

  // -------------------------------------------------------------------------
  // WORKFLOW 2: Admin Moderation, Rejection with Feedback, and Approval
  // -------------------------------------------------------------------------
  console.log('\n--- WORKFLOW 2: Admin Moderation & Review Cycle ---');

  // Admin rejects course with clear feedback
  const rejectionReason = 'Please verify that video duration metadata matches source media.';
  const rejectRes = await req(`/admin/courses/${courseId}/status`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ action: 'reject', reason: rejectionReason }),
  });
  record('Admin rejects course with required feedback', rejectRes.ok && rejectRes.body?.course?.status === 'rejected');

  // Instructor checks notifications and course status
  const notifRes1 = await req('/notifications', {
    headers: { Authorization: `Bearer ${instructorToken}` },
  });
  const rejectNotif = (notifRes1.body?.notifications || []).find(
    (n) => n.type === 'COURSE_REJECTED' && n.entityId === courseId
  );
  record(
    'Instructor receives rejection notification with reason',
    !!rejectNotif && rejectNotif.metadata?.rejectionReason === rejectionReason,
    rejectNotif?.metadata?.rejectionReason
  );

  // Instructor resubmits
  const resubmitRes = await req(`/courses/${courseId}/submit`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${instructorToken}` },
  });
  record('Instructor resubmits corrected course', resubmitRes.ok && resubmitRes.body?.course?.status === 'under_review');

  // Admin approves and publishes course
  const approveRes = await req(`/admin/courses/${courseId}/status`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ action: 'publish' }),
  });
  record('Admin approves and publishes course to public catalog', approveRes.ok && approveRes.body?.course?.status === 'published');

  // Instructor checks approval notification
  const notifRes2 = await req('/notifications', {
    headers: { Authorization: `Bearer ${instructorToken}` },
  });
  const approveNotif = (notifRes2.body?.notifications || []).find(
    (n) => n.type === 'COURSE_APPROVED' && n.entityId === courseId
  );
  record('Instructor receives course approval notification', !!approveNotif);

  // -------------------------------------------------------------------------
  // WORKFLOW 3: Student Catalog Discovery, Enrollment, Lessons, Quiz Attempt
  // -------------------------------------------------------------------------
  console.log('\n--- WORKFLOW 3: Student Enrollment, Lessons, and Quiz Taking ---');

  // Student checks public catalog
  const catalogRes = await req('/courses');
  const inCatalog = (catalogRes.body?.courses || []).some((c) => c._id === courseId);
  record('Published course is visible in public catalog', inCatalog);

  // Student enrolls
  const enrollRes = await req(`/courses/${courseId}/enroll`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  record('Student enrolls in course', enrollRes.ok && enrollRes.body?.enrollment?.status === 'active');

  // Student completes video lesson with 95% watch time (above 90% threshold)
  const videoProgRes = await req(`/lessons/${lesson1Id}/progress`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` },
    body: JSON.stringify({ watchedSeconds: 115, lastPosition: 115 }),
  });
  record('Student watches video lesson >= 90% and marks completed', videoProgRes.ok && videoProgRes.body?.progress?.completed === true);

  // Student accesses PDF lesson
  const pdfProgRes = await req(`/lessons/${lesson2Id}/progress`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` },
    body: JSON.stringify({ watchedSeconds: 0, lastPosition: 0 }),
  });
  record('Student completes PDF reading lesson upon access', pdfProgRes.ok && pdfProgRes.body?.progress?.completed === true);

  // Student fetches quiz info (verifying correctOptionIndex is redacted)
  const getQuizRes = await req(`/quizzes/${quizId}`, {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  const questions = getQuizRes.body?.quiz?.questions || [];
  const hasNoCorrectIndex = questions.every((q) => q.correctOptionIndex === undefined);
  record('Quiz questions redact correctOptionIndex for student', getQuizRes.ok && hasNoCorrectIndex);

  // Student starts quiz attempt
  const startQuizRes = await req(`/quizzes/${quizId}/start`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  const attempt = startQuizRes.body?.attempt;
  const attemptId = attempt?._id;
  record('Student initiates anti-cheat randomized quiz attempt', startQuizRes.ok && !!attemptId);

  // Student saves answers
  // Q1 original index 0 (RBAC 403: index 2 of original options)
  // Q2 original index 1 (90%: index 2 of original options)
  // We locate where the original correct option was placed in each question's optionOrder
  for (let qIdx = 0; qIdx < attempt.questionOrder.length; qIdx++) {
    const origQIndex = attempt.questionOrder[qIdx];
    const optionOrder = attempt.optionOrders[qIdx];
    // In our quiz, original correctOptionIndex is 2 for both questions
    const targetOriginalOption = 2;
    const shuffledAnswerIndex = optionOrder.indexOf(targetOriginalOption);
    await req(`/quizzes/attempts/${attemptId}/answer`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({ questionIndex: qIdx, answerIndex: shuffledAnswerIndex }),
    });
  }

  // Submit quiz
  const submitQuizRes = await req(`/quizzes/attempts/${attemptId}/submit`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  const finalAttempt = submitQuizRes.body?.attempt;
  const score = finalAttempt?.score;
  const passed = finalAttempt?.passed;
  record('Student submits quiz with server-evaluated score and passes', submitQuizRes.ok && score === 100 && passed === true, `Score: ${score}%`);

  // Student completes course and requests cryptographic certificate
  const completeCourseRes = await req(`/courses/${courseId}/complete`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  const certCode = completeCourseRes.body?.enrollment?.certificateCode;
  record(
    'Course status marked completed and accredited certificate code generated',
    completeCourseRes.ok && completeCourseRes.body?.enrollment?.status === 'completed' && !!certCode,
    `Certificate Code: ${certCode}`
  );

  // -------------------------------------------------------------------------
  // WORKFLOW 4: Instructor Portal Roster, Analytics & Quiz Submissions
  // -------------------------------------------------------------------------
  console.log('\n--- WORKFLOW 4: Instructor Roster, Analytics & Quiz Submissions ---');

  // Instructor fetches course analytics
  const analyticsRes = await req(`/courses/${courseId}/analytics`, {
    headers: { Authorization: `Bearer ${instructorToken}` },
  });
  const metrics = analyticsRes.body?.analytics?.metrics;
  const studentList = analyticsRes.body?.analytics?.students || [];
  const foundStudentInRoster = studentList.find((s) => s.email === studentEmail);

  record(
    'Instructor analytics reflects accurate metrics and learner roster',
    analyticsRes.ok && metrics?.totalEnrolled >= 1 && metrics?.completionRate === 100 && !!foundStudentInRoster,
    `Enrolled: ${metrics?.totalEnrolled}, Completion: ${metrics?.completionRate}%, Roster students: ${studentList.length}`
  );

  // Instructor fetches quiz submissions
  const submissionsRes = await req(`/quizzes/${quizId}/submissions`, {
    headers: { Authorization: `Bearer ${instructorToken}` },
  });
  const subs = submissionsRes.body?.submissions || [];
  const studentSub = subs.find((s) => s.student?.email === studentEmail);
  record(
    'Instructor reviews quiz submissions telemetry (score, pass/fail, tab violations)',
    submissionsRes.ok && !!studentSub && studentSub.score === 100 && studentSub.passed === true && studentSub.tabViolations === 0,
    `Student: ${studentSub?.student?.name}, Score: ${studentSub?.score}%, Violations: ${studentSub?.tabViolations}`
  );

  // -------------------------------------------------------------------------
  // WORKFLOW 5: Admin Management, Certificates, Testimonials, Audit Logs
  // -------------------------------------------------------------------------
  console.log('\n--- WORKFLOW 5: Administrator Portal System Audit ---');

  // Admin queries all users
  const usersRes = await req('/admin/users', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  record('Admin User Management retrieves registered user roster', usersRes.ok && (usersRes.body?.users || []).length > 0);

  // Public/Admin verifies cryptographic certificate
  if (certCode) {
    const certVerifyRes = await req(`/verify/${certCode}`);
    record('Public/Admin Certificate Verification validates authentic credential', certVerifyRes.ok && certVerifyRes.body?.valid === true);
  }

  // Admin queries audit logs
  const auditRes = await req('/admin/audit-logs', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const logs = auditRes.body?.logs || [];
  const hasCourseSubmitLog = logs.some((l) => l.action === 'COURSE_SUBMITTED' && String(l.entityId) === String(courseId));
  const hasCourseApproveLog = logs.some((l) => (l.action === 'COURSE_APPROVED' || l.action === 'COURSE_PUBLISHED') && String(l.entityId) === String(courseId));
  const hasEnrollLog = logs.some((l) => l.action === 'COURSE_ENROLLED');
  record(
    'Audit Log contains immutable records for submission, approval, and enrollment',
    auditRes.ok && hasCourseSubmitLog && hasCourseApproveLog && hasEnrollLog,
    `Total audit logs: ${logs.length}`
  );

  // Testimonial submission and listing
  const testimonialSubmit = await req('/testimonials', {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` },
    body: JSON.stringify({
      name: 'Audit Student',
      occupation: 'Software Engineer',
      testimonial: 'Veyro LMS provided the most comprehensive and clean learning experience with tamper-evident auditing.',
      rating: 5,
    }),
  });
  record('Student submits testimonial for admin moderation', testimonialSubmit.ok || testimonialSubmit.status === 201);

  // -------------------------------------------------------------------------
  // WORKFLOW 6: Security, RBAC & Cross-Tenant IDOR Protection
  // -------------------------------------------------------------------------
  console.log('\n--- WORKFLOW 6: Server-Side Security & RBAC Enforcement ---');

  // Student tries to access admin audit logs -> 403
  const studentAuditAttempt = await req('/admin/audit-logs', {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  record('Student denied access to admin audit logs (RBAC 403)', studentAuditAttempt.status === 403);

  // Student tries to access instructor course analytics -> 403
  const studentAnalyticsAttempt = await req(`/courses/${courseId}/analytics`, {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  record('Student denied access to instructor course analytics (RBAC 403)', studentAnalyticsAttempt.status === 403);

  // Student tries to access quiz submissions -> 403
  const studentSubmissionsAttempt = await req(`/quizzes/${quizId}/submissions`, {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  record('Student denied access to quiz submissions (RBAC 403)', studentSubmissionsAttempt.status === 403);

  // Cross-Instructor IDOR: Instructor 2 tries to access Instructor 1's course analytics -> 403
  const inst2AnalyticsAttempt = await req(`/courses/${courseId}/analytics`, {
    headers: { Authorization: `Bearer ${inst2Token}` },
  });
  record('Non-owner Instructor denied access to course analytics (IDOR 403)', inst2AnalyticsAttempt.status === 403);

  // Cross-Instructor IDOR: Instructor 2 tries to access Instructor 1's quiz submissions -> 403
  const inst2SubmissionsAttempt = await req(`/quizzes/${quizId}/submissions`, {
    headers: { Authorization: `Bearer ${inst2Token}` },
  });
  record('Non-owner Instructor denied access to quiz submissions (IDOR 403)', inst2SubmissionsAttempt.status === 403);

  // Cross-Instructor IDOR: Instructor 2 tries to update Instructor 1's course -> 403
  const inst2UpdateAttempt = await req(`/courses/${courseId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${inst2Token}` },
    body: JSON.stringify({ title: 'Hacked Title' }),
  });
  record('Non-owner Instructor denied mutating another instructor course (IDOR 403)', inst2UpdateAttempt.status === 403);

  // Instructor attempts to self-approve / publish course without admin -> 403
  const selfApproveAttempt = await req(`/admin/courses/${courseId}/status`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${instructorToken}` },
    body: JSON.stringify({ action: 'approve' }),
  });
  record('Instructor cannot self-approve or publish course (Admin RBAC 403)', selfApproveAttempt.status === 403);

  // Unauthenticated request to protected endpoint -> 401
  const unauthAttempt = await req('/notifications');
  record('Unauthenticated request rejected with 401', unauthAttempt.status === 401);

  // -------------------------------------------------------------------------
  // WORKFLOW 7: Data Integrity, Revision Branches, & Cascade Deletions
  // -------------------------------------------------------------------------
  console.log('\n--- WORKFLOW 7: Data Integrity, Revision Branches, & Cascades ---');

  // Instructor creates a draft revision branch of published course (v2)
  const revisionRes = await req(`/courses/${courseId}/revision`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${instructorToken}` },
  });
  const rev = revisionRes.body?.revisionCourse || revisionRes.body?.revision;
  const revCourseId = rev?._id;
  const revVersion = rev?.version;
  const revStatus = rev?.status;

  record(
    'Instructor creates isolated v(N+1) draft revision while v1 remains published',
    revisionRes.ok && revVersion === 2 && revStatus === 'draft',
    `Revision ID: ${revCourseId}, Version: ${revVersion}, Status: ${revStatus}`
  );

  // Verify published course remains published and student enrollment is preserved
  const originalCheck = await req(`/courses/${courseId}`);
  record(
    'Original published course remains active and undisturbed for learners',
    originalCheck.ok && originalCheck.body?.course?.status === 'published'
  );

  // Duplicate enrollment prevention
  const dupEnrollRes = await req(`/courses/${courseId}/enroll`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  record('Duplicate active enrollment prevented with 409 Conflict', dupEnrollRes.status === 409);

  // Cascade deletion test: Create a temporary course, module, quiz, then delete module
  const tempCourse = await req('/courses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${instructorToken}` },
    body: JSON.stringify({
      title: 'Temp Course for Cascade Audit',
      description: 'Testing cascade deletions of modules and quizzes.',
      category: 'General',
    }),
  });
  const tempCourseId = tempCourse.body?.course?._id;
  const tempModule = await req(`/courses/${tempCourseId}/modules`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${instructorToken}` },
    body: JSON.stringify({ title: 'Module to be deleted', order: 1 }),
  });
  const tempModuleId = tempModule.body?.module?._id;
  const tempQuiz = await req(`/modules/${tempModuleId}/quizzes`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${instructorToken}` },
    body: JSON.stringify({
      title: 'Quiz to be cascade deleted',
      passingScore: 70,
      timeLimitSeconds: 300,
      questions: [
        {
          questionText: 'Test cascade question?',
          options: ['Yes', 'No'],
          correctOptionIndex: 0,
        },
      ],
    }),
  });
  const tempQuizId = tempQuiz.body?.quiz?._id;

  // Delete the module
  const delModuleRes = await req(`/modules/${tempModuleId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${instructorToken}` },
  });
  // Check if quiz still exists
  const checkQuizRes = await req(`/quizzes/${tempQuizId}`, {
    headers: { Authorization: `Bearer ${instructorToken}` },
  });
  record(
    'Module deletion successfully cascades to remove attached quiz',
    delModuleRes.ok && checkQuizRes.status === 404,
    `Module deleted: ${delModuleRes.ok}, Quiz 404: ${checkQuizRes.status === 404}`
  );

  // Clean up temp course
  await req(`/courses/${tempCourseId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${instructorToken}` },
  });

  // Summary
  console.log('\n====================================================');
  const allPassed = results.every((r) => r.pass);
  const total = results.length;
  const passedCount = results.filter((r) => r.pass).length;
  console.log(`📊 AUDIT SUMMARY: ${passedCount}/${total} CHECKS PASSED`);
  console.log(`STATUS: ${allPassed ? 'ALL WORKFLOWS PASSED' : 'SOME WORKFLOWS FAILED'}`);
  console.log('====================================================');
}

runAudit().catch(console.error);
