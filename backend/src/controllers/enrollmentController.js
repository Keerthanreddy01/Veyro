const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const Lesson = require('../models/Lesson');
const Module = require('../models/Module');
const { v4: uuidv4 } = require('uuid');
const { generateCertificate } = require('../utils/certificate');

/** POST /api/courses/:courseId/enroll */
const enrollInCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ error: 'Course not found.' });
    if (course.status !== 'published')
      return res.status(400).json({ error: 'This course is not available for enrollment.' });

    const existing = await Enrollment.findOne({ studentId: req.user.userId, courseId: course._id });
    if (existing) return res.status(409).json({ error: 'You are already enrolled in this course.' });

    const enrollment = await Enrollment.create({ studentId: req.user.userId, courseId: course._id });
    res.status(201).json({ message: 'Enrolled successfully.', enrollment });
  } catch (err) { next(err); }
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
    if (enrollment.status === 'completed')
      return res.json({ message: 'Already completed.', enrollment });

    // Verify all lessons are actually completed (server-side check)
    const modules = await Module.find({ courseId: req.params.courseId });
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
    if (completedCount < lessonIds.length)
      return res.status(400).json({ error: 'Complete all lessons before claiming certificate.' });

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

module.exports = { enrollInCourse, getMyEnrollments, getCourseProgress, completeCourse, verifyCertificate, getCourseStudents };
