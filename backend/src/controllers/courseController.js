const Course = require('../models/Course');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');
const Enrollment = require('../models/Enrollment');
const { getRelativePath } = require('../utils/fileUpload');
const { logAudit, AUDIT_ACTIONS } = require('../utils/auditLogger');
const { createNotification, notifyAdmins, notifyUsers } = require('../utils/notificationService');

/**
 * Dispatches notifications to enrolled students when a new revision of their course is published.
 * Does NOT alter student enrollment or historical progress.
 */
async function notifyRevisionPublished(course) {
  if (!course.parentCourseId) return;
  try {
    const previousCourseIds = [course.parentCourseId];
    const parent = await Course.findById(course.parentCourseId).lean();
    if (parent && parent.parentCourseId) {
      previousCourseIds.push(parent.parentCourseId);
    }

    const enrollments = await Enrollment.find(
      {
        courseId: { $in: previousCourseIds },
        status: { $in: ['active', 'completed'] },
      },
      'studentId'
    ).lean();

    const studentIds = enrollments.map((e) => e.studentId);
    if (studentIds.length > 0) {
      await notifyUsers(studentIds, {
        type: 'COURSE_REVISION_AVAILABLE',
        title: 'New Course Revision Available',
        message: `A new version (v${course.version || 2}) of "${course.title}" is now available. Your current enrollment and progress remain intact.`,
        entityType: 'Course',
        entityId: course._id,
        metadata: {
          previousCourseId: course.parentCourseId,
          newCourseId: course._id,
          newVersion: course.version || 2,
          courseTitle: course.title,
        },
      });
    }
  } catch (err) {
    console.error('Error dispatching revision notifications:', err.message);
  }
}

/**
 * GET /api/courses
 * Public: returns only 'published' courses (student catalog).
 * Instructor: returns their own courses (any status).
 * Admin: returns all courses or filtered by status.
 */
const getCourses = async (req, res, next) => {
  try {
    const { role, userId } = req.user || {};
    let query = {};

    if (!role || role === 'student') {
      // Students and unauthenticated visitors can ONLY view published courses
      query.status = 'published';
    } else if (role === 'instructor') {
      query.instructorId = userId;
      if (req.query.status) {
        if (['pending', 'under_review'].includes(req.query.status)) {
          query.status = { $in: ['pending', 'under_review'] };
        } else {
          query.status = req.query.status;
        }
      }
    } else if (role === 'admin') {
      if (req.query.status) {
        if (['pending', 'under_review'].includes(req.query.status)) {
          query.status = { $in: ['pending', 'under_review'] };
        } else {
          query.status = req.query.status;
        }
      }
    }

    // Category filter
    if (req.query.category && req.query.category !== 'All') {
      query.category = req.query.category;
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Text search support
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    const [courses, total] = await Promise.all([
      Course.find(query)
        .populate('instructorId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Course.countDocuments(query),
    ]);

    res.json({ courses, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/courses/:id
 * Returns course with its modules, lessons, and quizzes (nested).
 * Students only see published courses.
 * Instructors can view their own courses or any published course.
 * Admins can view any course.
 */
const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id).populate('instructorId', 'name email');
    if (!course) return res.status(404).json({ error: 'Course not found.' });

    const { role, userId } = req.user || {};
    // Check if user is an actively or previously enrolled student in this course
    let isEnrolledUser = false;
    if (userId) {
      const en = await Enrollment.findOne({ studentId: userId, courseId: course._id });
      if (en) isEnrolledUser = true;
    }

    // Students and unauthenticated visitors can view published courses or courses they are already enrolled in
    if ((!role || role === 'student') && course.status !== 'published' && !isEnrolledUser) {
      return res.status(403).json({ error: 'This course is not yet published.' });
    }
    // Instructors can only view their own unpublished courses (unless published or admin)
    const instructorOwnerId = course.instructorId?._id?.toString() || course.instructorId?.toString();
    if (role === 'instructor' && instructorOwnerId !== userId && course.status !== 'published') {
      return res.status(403).json({ error: 'Access denied.' });
    }

    // Check if a newer published revision of this course exists
    const latestRevision = await Course.findOne({
      parentCourseId: course._id,
      status: 'published',
    })
      .select('_id title version')
      .lean();

    // Attach modules + lessons + quizzes
    const modules = await Module.find({ courseId: course._id }).sort('order');
    const modulesWithLessons = await Promise.all(
      modules.map(async (mod) => {
        const [lessons, quizzes] = await Promise.all([
          Lesson.find({ moduleId: mod._id }).sort('order').select('-textContent'),
          Quiz.find({ moduleId: mod._id }).sort('createdAt'),
        ]);

        const safeQuizzes = quizzes.map((q) => ({
          _id: q._id,
          moduleId: q.moduleId,
          title: q.title,
          timeLimitSeconds: q.timeLimitSeconds,
          passingScore: q.passingScore,
          maxAttempts: q.maxAttempts,
          questionCount: q.questions ? q.questions.length : 0,
        }));

        return { ...mod.toObject(), lessons, quizzes: safeQuizzes };
      })
    );

    res.json({ course, modules: modulesWithLessons, latestRevision: latestRevision || null });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/courses
 * Instructor creates a new course in 'draft' status.
 */
const createCourse = async (req, res, next) => {
  try {
    const { title, description, category, tags } = req.body;
    const thumbnailPath = req.file ? getRelativePath(req.file) : null;

    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = Array.isArray(tags) ? tags : JSON.parse(tags);
      } catch {
        parsedTags = String(tags).split(',').map((t) => t.trim()).filter(Boolean);
      }
    }

    const course = await Course.create({
      title,
      description,
      category,
      tags: parsedTags,
      instructorId: req.user.userId,
      thumbnail: thumbnailPath,
      status: 'draft',
      submittedAt: null,
      reviewedAt: null,
      publishedAt: null,
    });

    await logAudit({
      req,
      actorId: req.user.userId,
      actorRole: req.user.role,
      action: AUDIT_ACTIONS.COURSE_CREATED,
      entityType: 'course',
      entityId: course._id,
      metadata: { title: course.title, category: course.category, version: course.version },
    });

    res.status(201).json({ message: 'Course created as draft.', course });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/courses/:id
 * Instructor updates their own draft/rejected course.
 */
const updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found.' });

    if (course.instructorId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You can only edit your own courses.' });
    }
    if (['under_review', 'pending', 'published'].includes(course.status)) {
      return res.status(400).json({ error: 'Cannot directly edit a course while under review or published. Retract the submission or create a new draft revision.' });
    }

    const { title, description, category, tags } = req.body;
    if (title) course.title = title;
    if (description) course.description = description;
    if (category) course.category = category;
    if (tags) {
      try {
        course.tags = Array.isArray(tags) ? tags : JSON.parse(tags);
      } catch {
        course.tags = String(tags).split(',').map((t) => t.trim()).filter(Boolean);
      }
    }
    if (req.file) course.thumbnail = getRelativePath(req.file);

    await course.save();

    await logAudit({
      req,
      actorId: req.user.userId,
      actorRole: req.user.role,
      action: AUDIT_ACTIONS.COURSE_UPDATED,
      entityType: 'course',
      entityId: course._id,
      metadata: { title: course.title, category: course.category },
    });

    res.json({ message: 'Course updated.', course });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/courses/:id
 * Instructor deletes their own draft/rejected course.
 */
const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found.' });

    if (course.instructorId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied.' });
    }
    if (['under_review', 'pending', 'published'].includes(course.status) && req.user.role !== 'admin') {
      return res.status(400).json({ error: 'Cannot delete an active, published, or under-review course.' });
    }

    await Course.findByIdAndDelete(req.params.id);
    // Cascade delete modules + lessons
    const modules = await Module.find({ courseId: req.params.id });
    for (const mod of modules) {
      await Lesson.deleteMany({ moduleId: mod._id });
    }
    await Module.deleteMany({ courseId: req.params.id });

    await logAudit({
      req,
      actorId: req.user.userId,
      actorRole: req.user.role,
      action: AUDIT_ACTIONS.COURSE_UPDATED,
      entityType: 'course',
      entityId: course._id,
      metadata: { operation: 'deleted', title: course.title },
    });

    res.json({ message: 'Course deleted.' });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/courses/:id/submit or PATCH /api/courses/:id/submit
 * Instructor submits course for admin review (draft / rejected → under_review).
 */
const submitForReview = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found.' });
    if (course.instructorId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. You can only submit your own courses.' });
    }
    if (course.status !== 'draft' && course.status !== 'rejected') {
      return res.status(400).json({ error: `Cannot submit a course with status '${course.status}'. Must be in draft or rejected status.` });
    }

    // Require at least 1 module and 1 lesson before submission
    const modules = await Module.find({ courseId: course._id });
    if (modules.length === 0) {
      return res.status(400).json({ error: 'Cannot submit a course without any modules. Please add at least one module.' });
    }
    const moduleIds = modules.map((m) => m._id);
    const lessonCount = await Lesson.countDocuments({ moduleId: { $in: moduleIds } });
    if (lessonCount === 0) {
      return res.status(400).json({ error: 'Cannot submit a course without any lessons. Please add at least one lesson.' });
    }

    course.status = 'under_review';
    course.submittedAt = new Date();
    course.rejectionReason = null;
    await course.save();

    await logAudit({
      req,
      actorId: req.user.userId,
      actorRole: req.user.role,
      action: AUDIT_ACTIONS.COURSE_SUBMITTED,
      entityType: 'course',
      entityId: course._id,
      metadata: { title: course.title, version: course.version, parentCourseId: course.parentCourseId },
    });

    await notifyAdmins({
      type: 'COURSE_SUBMITTED',
      title: 'Course Submitted for Review',
      message: `"${course.title}" was submitted for administrative review.`,
      entityType: 'Course',
      entityId: course._id,
      metadata: { title: course.title, version: course.version, instructorId: course.instructorId },
    });

    res.json({ message: 'Course submitted for administrative review.', course });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/courses/:id/publish or PATCH /api/courses/:id/publish
 * Instructor or Admin publishes an approved course (approved → published).
 */
const publishCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found.' });

    if (course.instructorId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied.' });
    }
    if (course.status !== 'approved') {
      return res.status(400).json({ error: 'Course must be approved by an administrator before it can be published.' });
    }

    course.status = 'published';
    course.publishedAt = new Date();
    await course.save();

    // If this was a revision of a parent course, archive the superseded parent course
    if (course.parentCourseId) {
      const parent = await Course.findById(course.parentCourseId);
      if (parent && parent.status === 'published') {
        parent.status = 'archived';
        await parent.save();
      }
    }

    await logAudit({
      req,
      actorId: req.user.userId,
      actorRole: req.user.role,
      action: AUDIT_ACTIONS.COURSE_PUBLISHED,
      entityType: 'course',
      entityId: course._id,
      metadata: {
        title: course.title,
        version: course.version,
        parentCourseId: course.parentCourseId,
      },
    });

    await notifyRevisionPublished(course);

    res.json({ message: 'Course successfully published to the public catalog.', course });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/admin/courses/:id/status or PATCH /api/courses/:id/review
 * Admin approves, rejects, or publishes a course.
 * Body: { action: 'approve' | 'reject' | 'publish', reason?: string } OR { status: 'approved' | 'rejected' | 'published', reason?: string }
 */
const reviewCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found.' });

    const targetAction = (req.body.status || req.body.action || '').toLowerCase();
    if (!['approve', 'approved', 'reject', 'rejected', 'publish', 'published'].includes(targetAction)) {
      return res.status(400).json({ error: "Action must be 'approve', 'reject', or 'publish'." });
    }

    let auditAction = null;
    let auditMetadata = { title: course.title, version: course.version };

    if (['reject', 'rejected'].includes(targetAction)) {
      const reasonText = (req.body.reason || req.body.rejectionReason || '').trim();
      if (!reasonText) {
        return res.status(400).json({ error: 'Rejection reason is required.' });
      }
      course.status = 'rejected';
      course.rejectionReason = reasonText;
      course.reviewedAt = new Date();
      auditAction = AUDIT_ACTIONS.COURSE_REJECTED;
      auditMetadata.rejectionReason = reasonText;
    } else if (['approve', 'approved'].includes(targetAction)) {
      course.status = 'approved';
      course.rejectionReason = null;
      course.reviewedAt = new Date();
      auditAction = AUDIT_ACTIONS.COURSE_APPROVED;
    } else if (['publish', 'published'].includes(targetAction)) {
      course.status = 'published';
      course.rejectionReason = null;
      course.reviewedAt = new Date();
      course.publishedAt = new Date();
      auditAction = AUDIT_ACTIONS.COURSE_PUBLISHED;

      if (course.parentCourseId) {
        const parent = await Course.findById(course.parentCourseId);
        if (parent && parent.status === 'published') {
          parent.status = 'archived';
          await parent.save();
        }
      }
    }

    await course.save();

    if (auditAction) {
      await logAudit({
        req,
        actorId: req.user.userId,
        actorRole: req.user.role,
        action: auditAction,
        entityType: 'course',
        entityId: course._id,
        metadata: auditMetadata,
      });
    }

    // Send notifications based on review outcome
    if (['approve', 'approved'].includes(targetAction)) {
      await createNotification({
        recipientId: course.instructorId,
        type: 'COURSE_APPROVED',
        title: 'Course Approved',
        message: `Congratulations! Your course "${course.title}" (v${course.version || 1}) has been approved by administration.`,
        entityType: 'Course',
        entityId: course._id,
        metadata: { courseTitle: course.title, version: course.version },
      });
    } else if (['reject', 'rejected'].includes(targetAction)) {
      await createNotification({
        recipientId: course.instructorId,
        type: 'COURSE_REJECTED',
        title: 'Course Revision Requested',
        message: `Your course "${course.title}" was rejected. Reason: ${course.rejectionReason}`,
        entityType: 'Course',
        entityId: course._id,
        metadata: { courseTitle: course.title, rejectionReason: course.rejectionReason },
      });
    } else if (['publish', 'published'].includes(targetAction)) {
      await notifyRevisionPublished(course);
    }

    res.json({ message: `Course ${course.status}.`, course });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/courses/:id/analytics
 * Instructor / Admin: Course performance, module completion, and student roster.
 */
const getCourseAnalytics = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id || req.params.courseId);
    if (!course) return res.status(404).json({ error: 'Course not found.' });

    if (course.instructorId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. You can only view analytics for your own courses.' });
    }

    const Progress = require('../models/Progress');
    const QuizAttempt = require('../models/QuizAttempt');

    const modules = await Module.find({ courseId: course._id }).sort('order');
    const moduleIds = modules.map((m) => m._id);
    const lessons = await Lesson.find({ moduleId: { $in: moduleIds } }).sort('order');
    const totalLessons = lessons.length;
    const quizzes = await Quiz.find({ moduleId: { $in: moduleIds } });
    const quizIds = quizzes.map((q) => q._id);

    const enrollments = await Enrollment.find({ courseId: course._id })
      .populate('studentId', 'name email createdAt');
    const totalEnrolled = enrollments.length;
    const activeLearners = enrollments.filter((e) => e.status === 'active').length;
    const completedStudents = enrollments.filter((e) => e.status === 'completed').length;
    const completionRate = totalEnrolled > 0 ? Math.round((completedStudents / totalEnrolled) * 100) : 0;

    // Progress aggregation per student
    const progressByStudent = await Progress.aggregate([
      { $match: { courseId: course._id } },
      {
        $group: {
          _id: '$studentId',
          completedCount: { $sum: { $cond: ['$completed', 1, 0] } },
          lastActivity: { $max: '$updatedAt' },
        },
      },
    ]);
    const progressMap = {};
    progressByStudent.forEach((p) => {
      if (p._id) progressMap[p._id.toString()] = p;
    });

    // Quiz attempts aggregation per student
    let quizMap = {};
    if (quizIds.length > 0) {
      const quizAttempts = await QuizAttempt.aggregate([
        { $match: { quizId: { $in: quizIds }, submittedAt: { $ne: null } } },
        {
          $group: {
            _id: '$studentId',
            attemptCount: { $sum: 1 },
            avgScore: { $avg: '$score' },
            lastQuizActivity: { $max: '$submittedAt' },
          },
        },
      ]);
      quizAttempts.forEach((qa) => {
        if (qa._id) quizMap[qa._id.toString()] = qa;
      });
    }

    // Module-level progress calculation
    const moduleProgress = await Promise.all(
      modules.map(async (mod) => {
        const modLessons = lessons.filter((l) => l.moduleId.toString() === mod._id.toString());
        if (modLessons.length === 0) {
          return { moduleId: mod._id, title: mod.title, progressPercent: 100, lessonCount: 0 };
        }
        if (totalEnrolled === 0) {
          return { moduleId: mod._id, title: mod.title, progressPercent: 0, lessonCount: modLessons.length };
        }
        const modLessonIds = modLessons.map((l) => l._id);
        const completedAgg = await Progress.aggregate([
          { $match: { lessonId: { $in: modLessonIds }, completed: true } },
          { $group: { _id: null, totalCompleted: { $sum: 1 } } },
        ]);
        const totalCompleted = completedAgg[0]?.totalCompleted || 0;
        const expectedCompletions = totalEnrolled * modLessons.length;
        const progressPercent = Math.min(100, Math.round((totalCompleted / expectedCompletions) * 100));
        return {
          moduleId: mod._id,
          title: mod.title,
          progressPercent,
          lessonCount: modLessons.length,
        };
      })
    );

    let totalProgressSum = 0;
    let totalQuizScoreSum = 0;
    let scoredQuizCount = 0;

    const students = enrollments.map((enr) => {
      const sId = enr.studentId?._id?.toString() || enr.studentId?.toString();
      const prog = progressMap[sId] || { completedCount: 0, lastActivity: null };
      const qData = quizMap[sId] || { attemptCount: 0, avgScore: 0, lastQuizActivity: null };

      const completedCount = prog.completedCount || 0;
      const progressPercent = totalLessons > 0
        ? Math.min(100, Math.round((completedCount / totalLessons) * 100))
        : (enr.status === 'completed' ? 100 : 0);

      totalProgressSum += progressPercent;

      const quizAvg = Math.round(qData.avgScore || 0);
      if (qData.attemptCount > 0) {
        totalQuizScoreSum += quizAvg;
        scoredQuizCount++;
      }

      let lastActivity = prog.lastActivity || enr.enrolledAt;
      if (qData.lastQuizActivity && (!lastActivity || new Date(qData.lastQuizActivity) > new Date(lastActivity))) {
        lastActivity = qData.lastQuizActivity;
      }

      return {
        _id: sId,
        name: enr.studentId?.name || 'Student',
        email: enr.studentId?.email || '',
        enrolledAt: enr.enrolledAt,
        status: enr.status, // 'active' | 'completed' | 'dropped'
        progressPercent,
        lessonsCompleted: completedCount,
        quizzesAttempted: qData.attemptCount || 0,
        quizAverage: quizAvg,
        lastActivity,
      };
    });

    const avgCourseProgress = totalEnrolled > 0 ? Math.round(totalProgressSum / totalEnrolled) : 0;
    const avgQuizScore = scoredQuizCount > 0 ? Math.round(totalQuizScoreSum / scoredQuizCount) : 0;

    res.json({
      analytics: {
        course: {
          _id: course._id,
          title: course.title,
          status: course.status,
          totalLessons,
          totalQuizzes: quizzes.length,
        },
        metrics: {
          totalEnrolled,
          activeLearners,
          completedStudents,
          completionRate,
          avgCourseProgress,
          avgQuizScore,
        },
        moduleProgress,
        students,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/admin/users — Admin: list all users
 */
const getAllUsers = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/courses/:id/retract or PATCH /api/courses/:id/retract
 * Instructor retracts course from review back to draft (under_review → draft).
 * Safety rule: Published or approved courses cannot be casually retracted by an instructor.
 */
const retractCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found.' });

    if (course.instructorId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. You can only retract your own course submissions.' });
    }

    if (course.status === 'published' || course.status === 'approved') {
      return res.status(400).json({
        error: 'Approved or published courses cannot be retracted. Published courses must remain stable for active learners. Create a draft revision instead.',
      });
    }

    if (course.status === 'draft') {
      return res.status(400).json({ error: 'Course is already in draft status.' });
    }

    course.status = 'draft';
    course.submittedAt = null;
    await course.save();

    await logAudit({
      req,
      actorId: req.user.userId,
      actorRole: req.user.role,
      action: AUDIT_ACTIONS.COURSE_RETRACTED,
      entityType: 'course',
      entityId: course._id,
      metadata: { title: course.title, version: course.version },
    });

    res.json({ message: 'Course submission retracted back to draft.', course });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/courses/:id/revision
 * Instructor creates a new draft revision for an existing published course.
 * Learners continue accessing the published version uninterrupted while this revision is drafted and reviewed.
 */
const createCourseRevision = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found.' });

    if (course.instructorId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. You can only create revisions for your own courses.' });
    }

    if (course.status !== 'published') {
      return res.status(400).json({
        error: 'Revisions can only be created from published courses. Edit the current draft directly.',
      });
    }

    // Check if an active revision is already in progress
    const activeRevision = await Course.findOne({
      parentCourseId: course._id,
      status: { $in: ['draft', 'under_review', 'pending', 'approved'] },
    });
    if (activeRevision) {
      return res.status(409).json({
        error: 'A revision is already in progress for this course.',
        revision: activeRevision,
      });
    }

    // Clone Course into a new draft revision
    const revision = await Course.create({
      title: course.title,
      description: course.description,
      category: course.category,
      tags: course.tags,
      thumbnail: course.thumbnail,
      instructorId: course.instructorId,
      status: 'draft',
      version: (course.version || 1) + 1,
      parentCourseId: course._id,
      submittedAt: null,
      reviewedAt: null,
      publishedAt: null,
      rejectionReason: null,
    });

    // Deep-clone existing modules, lessons, and quizzes into the revision
    const existingModules = await Module.find({ courseId: course._id }).sort('order');
    for (const mod of existingModules) {
      const newMod = await Module.create({
        courseId: revision._id,
        title: mod.title,
        order: mod.order,
      });

      const lessons = await Lesson.find({ moduleId: mod._id }).sort('order');
      for (const l of lessons) {
        await Lesson.create({
          moduleId: newMod._id,
          title: l.title,
          type: l.type,
          contentUrl: l.contentUrl,
          textContent: l.textContent,
          durationSeconds: l.durationSeconds,
          isPreview: l.isPreview,
          order: l.order,
        });
      }

      const quizzes = await Quiz.find({ moduleId: mod._id });
      for (const q of quizzes) {
        await Quiz.create({
          moduleId: newMod._id,
          title: q.title,
          timeLimitSeconds: q.timeLimitSeconds,
          passingScore: q.passingScore,
          maxAttempts: q.maxAttempts,
          questions: q.questions,
        });
      }
    }

    await logAudit({
      req,
      actorId: req.user.userId,
      actorRole: req.user.role,
      action: AUDIT_ACTIONS.COURSE_CREATED,
      entityType: 'course',
      entityId: revision._id,
      metadata: {
        isRevision: true,
        parentCourseId: course._id,
        version: revision.version,
        title: revision.title,
      },
    });

    res.status(201).json({
      message: `Draft revision (Version ${revision.version}) created. Active learners will continue viewing Version ${course.version || 1} until this revision is reviewed and published.`,
      revision,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/admin/users/:id/toggle — Admin: activate/deactivate a user
 */
const toggleUserStatus = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    user.isActive = !user.isActive;
    await user.save();

    await logAudit({
      req,
      actorId: req.user.userId,
      actorRole: req.user.role,
      action: AUDIT_ACTIONS.USER_STATUS_CHANGED,
      entityType: 'user',
      entityId: user._id,
      metadata: { targetEmail: user.email, isActive: user.isActive },
    });

    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}.`, user });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  submitForReview,
  publishCourse,
  reviewCourse,
  retractCourse,
  createCourseRevision,
  getCourseAnalytics,
  getAllUsers,
  toggleUserStatus,
};
