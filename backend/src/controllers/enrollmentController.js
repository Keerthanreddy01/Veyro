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

/** GET /api/enrollments/my — student's enrolled courses */
const getMyEnrollments = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ studentId: req.user.userId })
      .populate({ path: 'courseId', populate: { path: 'instructorId', select: 'name' } })
      .sort({ enrolledAt: -1 });
    res.json({ enrollments });
  } catch (err) { next(err); }
};

/** GET /api/courses/:courseId/progress — overall course progress for a student */
const getCourseProgress = async (req, res, next) => {
  try {
    const modules = await Module.find({ courseId: req.params.courseId });
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

    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    res.json({ total, completed, percentage });
  } catch (err) { next(err); }
};

/**
 * POST /api/courses/:courseId/complete
 * Called when student finishes all lessons + quizzes.
 * Generates a certificate if not already issued.
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
    if (enrollment.status === 'completed')
      return res.json({ message: 'Already completed.', enrollment });

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
    const enrollment = await Enrollment.findOne({ certificateCode: req.params.code })
      .populate('studentId', 'name email')
      .populate('courseId', 'title');
    if (!enrollment) return res.status(404).json({ error: 'Invalid verification code.' });
    res.json({
      valid: true,
      student: enrollment.studentId,
      course: enrollment.courseId,
      completedAt: enrollment.completedAt,
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
