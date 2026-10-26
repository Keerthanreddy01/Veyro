const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const Lesson = require('../models/Lesson');
const Module = require('../models/Module');
const { v4: uuidv4 } = require('uuid');
const { generateCertificate } = require('../utils/certificate');
const { logAudit, AUDIT_ACTIONS } = require('../utils/auditLogger');
const { createNotification } = require('../utils/notificationService');

/** POST /api/courses/:courseId/enroll — Student enrolls or re-enrolls */
const enrollInCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ error: 'Course not found.' });
    if (course.status !== 'published')
      return res.status(400).json({ error: 'This course is not available for enrollment.' });

    const existing = await Enrollment.findOne({ studentId: req.user.userId, courseId: course._id });
    if (existing) {
      if (existing.status === 'active') {
        return res.status(409).json({ error: 'You are already enrolled in this course.' });
      }
      if (existing.status === 'completed') {
        return res.status(409).json({ error: 'You have already completed this course.' });
      }
      if (existing.status === 'dropped') {
        // Re-enrollment flow: Reactivate dropped enrollment and preserve historical progress
        existing.status = 'active';
        existing.enrolledAt = new Date();
        await existing.save();

        await logAudit({
          req,
          actorId: req.user.userId,
          actorRole: req.user.role,
          action: AUDIT_ACTIONS.COURSE_ENROLLED,
          entityType: 'enrollment',
          entityId: existing._id,
          metadata: { courseId: course._id, courseTitle: course.title, reEnrollment: true },
        });

        await createNotification({
          recipientId: req.user.userId,
          type: 'COURSE_ENROLLED',
          title: 'Course Enrollment Confirmed',
          message: `You have re-enrolled in "${course.title}". Welcome back!`,
          entityType: 'Course',
          entityId: course._id,
          metadata: { courseTitle: course.title, courseId: course._id, reEnrollment: true },
        });

        return res.status(200).json({ message: 'Re-enrolled in course successfully.', enrollment: existing });
      }
    }

    const enrollment = await Enrollment.create({
      studentId: req.user.userId,
      courseId: course._id,
      status: 'active',
      enrolledAt: new Date(),
    });

    await logAudit({
      req,
      actorId: req.user.userId,
      actorRole: req.user.role,
      action: AUDIT_ACTIONS.COURSE_ENROLLED,
      entityType: 'enrollment',
      entityId: enrollment._id,
      metadata: { courseId: course._id, courseTitle: course.title, reEnrollment: false },
    });

    await createNotification({
      recipientId: req.user.userId,
      type: 'COURSE_ENROLLED',
      title: 'Course Enrollment Confirmed',
      message: `You have successfully enrolled in "${course.title}". Start learning today!`,
      entityType: 'Course',
      entityId: course._id,
      metadata: { courseTitle: course.title, courseId: course._id, reEnrollment: false },
    });

    res.status(201).json({ message: 'Enrolled successfully.', enrollment });
  } catch (err) { next(err); }
};

/** DELETE /api/courses/:courseId/enroll or DELETE /api/enrollments/:courseId — Student drops course */
const dropCourse = async (req, res, next) => {
  try {
    const courseId = req.params.courseId || req.params.id;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: 'Course not found.' });

    const enrollment = await Enrollment.findOne({
      studentId: req.user.userId,
      courseId: course._id,
    });

    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment record not found.' });
    }

    if (enrollment.status === 'dropped') {
      return res.status(400).json({ error: 'Course is already dropped.' });
    }

    if (enrollment.status === 'completed') {
      return res.status(400).json({ error: 'Cannot drop a completed course with an issued certificate.' });
    }

    // Soft-drop: status set to 'dropped' while preserving historical progress
    enrollment.status = 'dropped';
    await enrollment.save();

    await logAudit({
      req,
      actorId: req.user.userId,
      actorRole: req.user.role,
      action: AUDIT_ACTIONS.COURSE_DROPPED,
      entityType: 'enrollment',
      entityId: enrollment._id,
      metadata: { courseId: course._id, courseTitle: course.title },
    });

    res.json({ message: 'Successfully dropped the course.', enrollment });
  } catch (err) {
    next(err);
  }
};

const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');

/** GET /api/enrollments/my — student's enrolled courses with progress enrichment */
const getMyEnrollments = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ studentId: req.user.userId })
      .populate({ path: 'courseId', populate: { path: 'instructorId', select: 'name' } })
      .sort({ enrolledAt: -1 });

    if (!enrollments.length) {
      return res.json({ enrollments: [] });
    }

    const courseIds = enrollments.map((e) => e.courseId?._id || e.courseId).filter(Boolean);
    const modules = await Module.find({ courseId: { $in: courseIds } }, '_id courseId');
    const moduleToCourse = {};
    const allModuleIds = [];
    for (const m of modules) {
      if (m.courseId) {
        moduleToCourse[m._id.toString()] = m.courseId.toString();
        allModuleIds.push(m._id);
      }
    }

    const lessons = await Lesson.find({ moduleId: { $in: allModuleIds } }, '_id moduleId');
    const courseLessonMap = {};
    const allLessonIds = [];
    for (const l of lessons) {
      const cId = moduleToCourse[l.moduleId.toString()];
      if (cId) {
        if (!courseLessonMap[cId]) courseLessonMap[cId] = [];
        courseLessonMap[cId].push(l._id);
        allLessonIds.push(l._id);
      }
    }

    const quizzes = await Quiz.find({ moduleId: { $in: allModuleIds } }, '_id moduleId');
    const courseQuizMap = {};
    const allQuizIds = [];
    for (const q of quizzes) {
      const cId = moduleToCourse[q.moduleId.toString()];
      if (cId) {
        if (!courseQuizMap[cId]) courseQuizMap[cId] = [];
        courseQuizMap[cId].push(q._id);
        allQuizIds.push(q._id);
      }
    }

    const completedProgress = await Progress.find({
      studentId: req.user.userId,
      lessonId: { $in: allLessonIds },
      completed: true,
    }, 'lessonId');
    const completedLessonIdSet = new Set(completedProgress.map((p) => p.lessonId.toString()));

    const passedAttempts = await QuizAttempt.find({
      studentId: req.user.userId,
      quizId: { $in: allQuizIds },
      passed: true,
    }, 'quizId');
    const passedQuizIdSet = new Set(passedAttempts.map((a) => a.quizId.toString()));

    const enrichedEnrollments = enrollments.map((en) => {
      const enObj = en.toObject();
      const cId = (en.courseId?._id || en.courseId)?.toString();
      const cLessons = courseLessonMap[cId] || [];
      const cQuizzes = courseQuizMap[cId] || [];
      const totalLessons = cLessons.length;
      const completedLessons = cLessons.filter((id) => completedLessonIdSet.has(id.toString())).length;
      const totalQuizzes = cQuizzes.length;
      const quizzesPassed = cQuizzes.filter((id) => passedQuizIdSet.has(id.toString())).length;

      if (en.status === 'completed') {
        enObj.progressPercentage = 100;
        enObj.isEligibleForCertificate = true;
      } else {
        enObj.progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
        enObj.isEligibleForCertificate =
          totalLessons > 0 &&
          completedLessons >= totalLessons &&
          quizzesPassed >= totalQuizzes &&
          en.status !== 'dropped';
      }
      enObj.totalLessons = totalLessons;
      enObj.completedLessons = completedLessons;
      enObj.totalQuizzes = totalQuizzes;
      enObj.quizzesPassed = quizzesPassed;
      return enObj;
    });

    res.json({ enrollments: enrichedEnrollments });
  } catch (err) { next(err); }
};

/** GET /api/courses/:courseId/progress — overall course progress for a student */
const getCourseProgress = async (req, res, next) => {
  try {
    const modules = await Module.find({ courseId: req.params.courseId });
    const moduleIds = modules.map((m) => m._id);
    const lessonIds = [];
    for (const mod of modules) {
      const lessons = await Lesson.find({ moduleId: mod._id }, '_id');
      lessonIds.push(...lessons.map((l) => l._id));
    }
    const total = lessonIds.length;
    const completed = await Progress.countDocuments({
      studentId: req.user.userId,
      lessonId: { $in: lessonIds },
      completed: true,
    });

    const quizzes = await Quiz.find({ moduleId: { $in: moduleIds } }, '_id title passingScore');
    let quizzesPassed = 0;
    for (const q of quizzes) {
      const passedAtt = await QuizAttempt.findOne({ studentId: req.user.userId, quizId: q._id, passed: true });
      if (passedAtt) quizzesPassed++;
    }

    const enrollment = await Enrollment.findOne({ studentId: req.user.userId, courseId: req.params.courseId });
    const percentage = enrollment?.status === 'completed'
      ? 100
      : (total > 0 ? Math.round((completed / total) * 100) : 0);
    const isEligibleForCertificate =
      total > 0 && completed >= total && quizzesPassed >= quizzes.length && enrollment?.status !== 'dropped';

    res.json({
      total,
      completed,
      percentage,
      totalQuizzes: quizzes.length,
      quizzesPassed,
      isEligibleForCertificate,
      enrollmentStatus: enrollment?.status || 'none',
      certificateCode: enrollment?.certificateCode || null,
      completedAt: enrollment?.completedAt || null,
    });
  } catch (err) { next(err); }
};

/**
 * POST /api/courses/:courseId/complete
 * Called when student finishes all lessons + quizzes.
 * Generates a certificate if not already issued. Idempotent.
 */
const completeCourse = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findOne({
      studentId: req.user.userId,
      courseId: req.params.courseId,
    });
    if (!enrollment) return res.status(404).json({ error: 'Enrollment not found.' });
    if (enrollment.status === 'dropped')
      return res.status(400).json({ error: 'Cannot complete a dropped course. Please re-enroll first.' });
    if (enrollment.status === 'completed') {
      const certPath = `/static/certificates/certificate-${enrollment.certificateCode}.pdf`;
      return res.json({ message: 'Already completed.', enrollment, certificatePath: certPath });
    }

    // Verify all lessons are actually completed (server-side check)
    const modules = await Module.find({ courseId: req.params.courseId });
    const moduleIds = modules.map((m) => m._id);

    const lessonIds = [];
    for (const mod of modules) {
      const lessons = await Lesson.find({ moduleId: mod._id }, '_id');
      lessonIds.push(...lessons.map((l) => l._id));
    }
    const completedCount = await Progress.countDocuments({
      studentId: req.user.userId,
      lessonId: { $in: lessonIds },
      completed: true,
    });
    if (completedCount < lessonIds.length) {
      return res.status(400).json({ error: 'Complete all lessons before claiming certificate.' });
    }

    // Verify all module quizzes are passed (server-side check)
    const Quiz = require('../models/Quiz');
    const QuizAttempt = require('../models/QuizAttempt');
    const quizzes = await Quiz.find({ moduleId: { $in: moduleIds } }, '_id title');
    for (const quiz of quizzes) {
      const hasPassed = await QuizAttempt.findOne({
        studentId: req.user.userId,
        quizId: quiz._id,
        passed: true,
      });
      if (!hasPassed) {
        return res.status(400).json({
          error: `Assessment required: You must pass the quiz "${quiz.title}" before claiming your certificate.`,
        });
      }
    }

    const User = require('../models/User');
    const student = await User.findById(req.user.userId);
    const course = await Course.findById(req.params.courseId);
    const code = uuidv4();
    const now = new Date();

    const certPath = await generateCertificate({
      studentName: student.name,
      courseTitle: course.title,
      completedAt: now,
      verificationCode: code,
    });

    enrollment.status = 'completed';
    enrollment.completedAt = now;
    enrollment.certificateCode = code;
    await enrollment.save();

    await logAudit({
      req,
      actorId: req.user.userId,
      actorRole: req.user.role,
      action: AUDIT_ACTIONS.COURSE_COMPLETED,
      entityType: 'enrollment',
      entityId: enrollment._id,
      metadata: { courseId: course._id, courseTitle: course.title },
    });

    await logAudit({
      req,
      actorId: req.user.userId,
      actorRole: req.user.role,
      action: AUDIT_ACTIONS.CERTIFICATE_ISSUED,
      entityType: 'certificate',
      entityId: code,
      metadata: { courseId: course._id, courseTitle: course.title, verificationCode: code },
    });

    await createNotification({
      recipientId: req.user.userId,
      type: 'COURSE_COMPLETED',
      title: 'Course Completed!',
      message: `Congratulations! You have completed all lessons and requirements for "${course.title}".`,
      entityType: 'Course',
      entityId: course._id,
      metadata: { courseTitle: course.title, courseId: course._id },
    });

    await createNotification({
      recipientId: req.user.userId,
      type: 'CERTIFICATE_ISSUED',
      title: 'Certificate Issued',
      message: `Your verified certificate for "${course.title}" is ready. Verification Code: ${code}`,
      entityType: 'Certificate',
      entityId: code,
      metadata: { courseTitle: course.title, courseId: course._id, verificationCode: code },
    });

    res.json({ message: 'Course completed! Certificate generated.', enrollment, certificatePath: certPath });
  } catch (err) { next(err); }
};

/** GET /api/verify/:code — public certificate verification */
const verifyCertificate = async (req, res, next) => {
  try {
    const code = (req.params.code || '').trim();
    const enrollment = await Enrollment.findOne({ certificateCode: code })
      .populate('studentId', 'name email')
      .populate({
        path: 'courseId',
        select: 'title category level description instructorId',
        populate: { path: 'instructorId', select: 'name email' },
      });
    if (!enrollment) return res.status(404).json({ error: 'Invalid verification code.' });
    res.json({
      valid: true,
      verificationCode: code,
      student: enrollment.studentId,
      course: enrollment.courseId,
      completedAt: enrollment.completedAt,
      certificateUrl: `/static/certificates/certificate-${code}.pdf`,
    });
  } catch (err) { next(err); }
};

/** GET /api/courses/:courseId/students — Instructor: who enrolled */
const getCourseStudents = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ error: 'Course not found.' });
    if (course.instructorId.toString() !== req.user.userId && req.user.role !== 'admin')
      return res.status(403).json({ error: 'Access denied.' });

    const enrollments = await Enrollment.find({ courseId: req.params.courseId })
      .populate('studentId', 'name email createdAt');
    res.json({ enrollments });
  } catch (err) { next(err); }
};

module.exports = {
  enrollInCourse,
  dropCourse,
  getMyEnrollments,
  getCourseProgress,
  completeCourse,
  verifyCertificate,
  getCourseStudents,
};
