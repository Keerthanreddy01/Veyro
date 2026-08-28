const Lesson = require('../models/Lesson');
const Module = require('../models/Module');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const Enrollment = require('../models/Enrollment');
const { getRelativePath } = require('../utils/fileUpload');

/** POST /api/modules/:moduleId/lessons */
const createLesson = async (req, res, next) => {
  try {
    const mod = await Module.findById(req.params.moduleId);
    if (!mod) return res.status(404).json({ error: 'Module not found.' });

    const course = await Course.findById(mod.courseId);
    if (course.instructorId.toString() !== req.user.userId)
      return res.status(403).json({ error: 'Access denied.' });

    const { title, type, textContent, durationSeconds, isPreview } = req.body;
    const count = await Lesson.countDocuments({ moduleId: mod._id });

    let contentUrl = null;
    if (req.file) contentUrl = getRelativePath(req.file);

    const lesson = await Lesson.create({
      moduleId: mod._id,
      title,
      type,
      contentUrl,
      textContent: type === 'text' ? textContent : null,
      durationSeconds: durationSeconds ? Number(durationSeconds) : 0,
      isPreview: isPreview === 'true' || isPreview === true,
      order: req.body.order ?? count,
    });
    res.status(201).json({ message: 'Lesson created.', lesson });
  } catch (err) { next(err); }
};

/** PUT /api/lessons/:id */
const updateLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ error: 'Lesson not found.' });

    const mod = await Module.findById(lesson.moduleId);
    const course = await Course.findById(mod.courseId);
    if (course.instructorId.toString() !== req.user.userId)
      return res.status(403).json({ error: 'Access denied.' });

    const { title, textContent, durationSeconds, isPreview, order } = req.body;
    if (title !== undefined) lesson.title = title;
    if (textContent !== undefined) lesson.textContent = textContent;
    if (durationSeconds !== undefined) lesson.durationSeconds = Number(durationSeconds);
    if (isPreview !== undefined) lesson.isPreview = isPreview === 'true' || isPreview === true;
    if (order !== undefined) lesson.order = order;
    if (req.file) lesson.contentUrl = getRelativePath(req.file);

    await lesson.save();
    res.json({ message: 'Lesson updated.', lesson });
  } catch (err) { next(err); }
};

/** DELETE /api/lessons/:id */
const deleteLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ error: 'Lesson not found.' });

    const mod = await Module.findById(lesson.moduleId);
    const course = await Course.findById(mod.courseId);
    if (course.instructorId.toString() !== req.user.userId && req.user.role !== 'admin')
      return res.status(403).json({ error: 'Access denied.' });

    await Lesson.findByIdAndDelete(lesson._id);
    res.json({ message: 'Lesson deleted.' });
  } catch (err) { next(err); }
};

/** GET /api/lessons/:id  — returns lesson content; requires enrollment for non-preview */
const getLessonById = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ error: 'Lesson not found.' });

    const mod = await Module.findById(lesson.moduleId);
    const course = await Course.findById(mod.courseId);

    // Instructors/admins always have access
    if (['instructor', 'admin'].includes(req.user.role)) {
      return res.json({ lesson });
    }

    // For students: check enrollment unless it's a preview lesson
    if (!lesson.isPreview) {
      const enrolled = await Enrollment.findOne({
        studentId: req.user.userId,
        courseId: course._id,
        status: 'active',
      });
      if (!enrolled) return res.status(403).json({ error: 'You must enroll in this course to access this lesson.' });
    }

    // Attach progress for the student
    const progress = await Progress.findOne({ studentId: req.user.userId, lessonId: lesson._id });
    res.json({ lesson, progress: progress || null });
  } catch (err) { next(err); }
};

/**
 * POST /api/lessons/:id/progress
 * Student updates their progress for a video lesson.
 *
 * Design Decision: The client sends { watchedSeconds, lastPosition } periodically
 * (e.g. every 10s via timeupdate). The server COMPUTES completion status by checking
 * if watchedSeconds >= 90% of lesson.durationSeconds — we never trust a client-sent
 * 'completed' flag. This prevents students from marking lessons complete without watching.
 */
const updateProgress = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ error: 'Lesson not found.' });

    const mod = await Module.findById(lesson.moduleId);

    let { watchedSeconds, lastPosition } = req.body;
    watchedSeconds = Math.max(0, Number(watchedSeconds) || 0);
    lastPosition = Math.max(0, Number(lastPosition) || 0);

    // Find or create progress record
    let progress = await Progress.findOne({ studentId: req.user.userId, lessonId: lesson._id });
    if (!progress) {
      progress = new Progress({
        studentId: req.user.userId,
        lessonId: lesson._id,
        courseId: mod.courseId,
      });
    }

    // Only update watched seconds if higher (can't go backwards)
    if (watchedSeconds > progress.watchedSeconds) {
      progress.watchedSeconds = watchedSeconds;
    }
    progress.lastPosition = lastPosition;

    // Server-side completion check: >= 90% of duration
    const threshold = lesson.durationSeconds * 0.9;
    if (!progress.completed && lesson.durationSeconds > 0 && progress.watchedSeconds >= threshold) {
      progress.completed = true;
      progress.completedAt = new Date();
    }
    // PDF / text lessons: completed on first view (no duration check)
    if (!progress.completed && lesson.type !== 'video') {
      progress.completed = true;
      progress.completedAt = new Date();
    }

    await progress.save();
    res.json({ progress });
  } catch (err) { next(err); }
};

module.exports = { createLesson, updateLesson, deleteLesson, getLessonById, updateProgress };
