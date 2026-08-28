const Course = require('../models/Course');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Enrollment = require('../models/Enrollment');
const { getRelativePath } = require('../utils/fileUpload');

/**
 * GET /api/courses
 * Public: returns only 'published' courses (student catalog).
 * Instructor: returns their own courses (any status).
 * Admin: returns all courses.
 */
const getCourses = async (req, res, next) => {
  try {
    const { role, userId } = req.user || {};
    let query = {};

    if (!role || role === 'student') {
      query.status = 'published';
    } else if (role === 'instructor') {
      query.instructorId = userId;
    }
    // Admin sees everything

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
 * Returns course with its modules and lessons (nested).
 * Students only see published courses.
 */
const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id).populate('instructorId', 'name email');
    if (!course) return res.status(404).json({ error: 'Course not found.' });

    const { role, userId } = req.user || {};
    // Students can only view published courses
    if (role === 'student' && course.status !== 'published') {
      return res.status(403).json({ error: 'This course is not yet published.' });
    }
    // Instructors can only view their own courses
    if (role === 'instructor' && course.instructorId._id.toString() !== userId) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    // Attach modules + lessons
    const modules = await Module.find({ courseId: course._id }).sort('order');
    const modulesWithLessons = await Promise.all(
      modules.map(async (mod) => {
        const lessons = await Lesson.find({ moduleId: mod._id }).sort('order').select('-textContent');
        return { ...mod.toObject(), lessons };
      })
    );

    res.json({ course, modules: modulesWithLessons });
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

    const course = await Course.create({
      title,
      description,
      category,
      tags: tags ? JSON.parse(tags) : [],
      instructorId: req.user.userId,
      thumbnail: thumbnailPath,
      status: 'draft',
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

    if (course.instructorId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'You can only edit your own courses.' });
    }
    if (['pending', 'published'].includes(course.status)) {
      return res.status(400).json({ error: 'Cannot edit a course that is pending review or published. Retract it first.' });
    }

    const { title, description, category, tags } = req.body;
    if (title) course.title = title;
    if (description) course.description = description;
    if (category) course.category = category;
    if (tags) course.tags = JSON.parse(tags);
    if (req.file) course.thumbnail = getRelativePath(req.file);

    await course.save();
    res.json({ message: 'Course updated.', course });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/courses/:id
 * Instructor deletes their own draft course.
 */
const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found.' });

    if (course.instructorId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied.' });
    }

    await Course.findByIdAndDelete(req.params.id);
    // Cascade delete modules + lessons
    const modules = await Module.find({ courseId: req.params.id });
    for (const mod of modules) {
      await Lesson.deleteMany({ moduleId: mod._id });
    }
    await Module.deleteMany({ courseId: req.params.id });

    res.json({ message: 'Course deleted.' });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/courses/:id/submit
 * Instructor submits course for admin review (draft → pending).
 */
const submitForReview = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found.' });
    if (course.instructorId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied.' });
    }
    if (course.status !== 'draft' && course.status !== 'rejected') {
      return res.status(400).json({ error: `Cannot submit a course with status '${course.status}'.` });
    }

    course.status = 'pending';
    course.rejectionReason = null;
    await course.save();
    res.json({ message: 'Course submitted for review.', course });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/courses/:id/review
 * Admin approves or rejects a pending course.
 * Body: { action: 'approve' | 'reject', reason?: string }
 */
const reviewCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found.' });
    if (course.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending courses can be reviewed.' });
    }

    const { action, reason } = req.body;
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: "Action must be 'approve' or 'reject'." });
    }

    if (action === 'approve') {
      course.status = 'published';
      course.rejectionReason = null;
    } else {
      course.status = 'rejected';
      course.rejectionReason = reason || 'No reason provided.';
    }

    await course.save();
    res.json({ message: `Course ${action}d.`, course });
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
 * PATCH /api/admin/users/:id/toggle — Admin: activate/deactivate a user
 */
const toggleUserStatus = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}.`, user });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCourses, getCourseById, createCourse, updateCourse,
  deleteCourse, submitForReview, reviewCourse, getAllUsers, toggleUserStatus,
};
