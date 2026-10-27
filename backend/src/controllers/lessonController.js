const fs = require('fs');
const Lesson = require('../models/Lesson');
const Module = require('../models/Module');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const Enrollment = require('../models/Enrollment');
const { getRelativePath, validateFileHeader } = require('../utils/fileUpload');
const { validateVideoUrl } = require('../utils/videoUrlValidator');
const { fetchYouTubeDuration } = require('../utils/youtubeDuration');
const { mergeRanges, countUniqueSeconds } = require('../utils/playbackTracker');

/** POST /api/modules/:moduleId/lessons */
const createLesson = async (req, res, next) => {
  try {
    const mod = await Module.findById(req.params.moduleId);
    if (!mod) {
      if (req.file && fs.existsSync(req.file.path)) {
        try { fs.unlinkSync(req.file.path); } catch {}
      }
      return res.status(404).json({ error: 'Module not found.' });
    }

    const course = await Course.findById(mod.courseId);
    if (!course || (course.instructorId.toString() !== req.user.userId && req.user.role !== 'admin')) {
      if (req.file && fs.existsSync(req.file.path)) {
        try { fs.unlinkSync(req.file.path); } catch {}
      }
      return res.status(403).json({ error: 'Access denied. You can only add lessons to your own courses.' });
    }

    const { title, type, textContent, durationSeconds, isPreview } = req.body;
    const rawIncomingUrl = (req.body.videoUrl || req.body.videoURL || req.body.video || req.body.contentUrl || '').trim();
    if (!title || !title.trim()) {
      if (req.file && fs.existsSync(req.file.path)) {
        try { fs.unlinkSync(req.file.path); } catch {}
      }
      return res.status(400).json({ error: 'Lesson title is required.' });
    }

    const validTypes = ['video', 'pdf', 'text'];
    const lessonType = type || 'video';
    if (!validTypes.includes(lessonType)) {
      if (req.file && fs.existsSync(req.file.path)) {
        try { fs.unlinkSync(req.file.path); } catch {}
      }
      return res.status(400).json({ error: `Invalid lesson type. Must be one of: ${validTypes.join(', ')}` });
    }

    let contentUrl = null;

    if (lessonType === 'video') {
      if (rawIncomingUrl) {
        const val = validateVideoUrl(rawIncomingUrl);
        if (!val.valid) {
          if (req.file && fs.existsSync(req.file.path)) {
            try { fs.unlinkSync(req.file.path); } catch {}
          }
          return res.status(400).json({ error: val.error });
        }
        contentUrl = val.normalizedUrl || rawIncomingUrl;
      } else if (req.file) {
        // Backward compatibility for legacy video file uploads
        const isValid = validateFileHeader(req.file.path, req.file.mimetype, req.file.originalname);
        if (!isValid) {
          if (fs.existsSync(req.file.path)) {
            try { fs.unlinkSync(req.file.path); } catch {}
          }
          return res.status(400).json({
            error: 'Uploaded file content does not match its declared video/document format. File may be corrupted or unsupported.',
          });
        }
        contentUrl = getRelativePath(req.file);
      } else {
        return res.status(400).json({
          error: 'Video URL is required for video lessons (supported: YouTube or direct HTTPS MP4/WebM URL).',
        });
      }
    } else if (lessonType === 'pdf') {
      if (!req.file) {
        return res.status(400).json({ error: 'PDF file is required for PDF lessons.' });
      }
      const isValid = validateFileHeader(req.file.path, req.file.mimetype, req.file.originalname);
      if (!isValid) {
        if (fs.existsSync(req.file.path)) {
          try { fs.unlinkSync(req.file.path); } catch {}
        }
        return res.status(400).json({
          error: 'Uploaded document is corrupted or not a valid PDF.',
        });
      }
      contentUrl = getRelativePath(req.file);
    } else if (lessonType === 'text') {
      if (!textContent || !textContent.trim()) {
        return res.status(400).json({ error: 'Text content is required for text lessons.' });
      }
    }

    const count = await Lesson.countDocuments({ moduleId: mod._id });

    let finalDuration = durationSeconds ? Math.max(0, Number(durationSeconds)) : 0;
    if (lessonType === 'video' && contentUrl && finalDuration === 0) {
      const val = validateVideoUrl(contentUrl);
      if (val.valid && val.provider === 'youtube' && val.videoId) {
        try {
          const ytDur = await fetchYouTubeDuration(val.videoId);
          if (ytDur && ytDur > 0) finalDuration = ytDur;
        } catch {}
      }
    }

    const lesson = await Lesson.create({
      moduleId: mod._id,
      title: title.trim(),
      type: lessonType,
      contentUrl,
      videoUrl: lessonType === 'video' ? contentUrl : null,
      textContent: lessonType === 'text' ? textContent.trim() : null,
      durationSeconds: finalDuration,
      isPreview: isPreview === 'true' || isPreview === true,
      order: req.body.order !== undefined ? Number(req.body.order) : count,
    });

    res.status(201).json({ message: 'Lesson created successfully.', lesson });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch {}
    }
    next(err);
  }
};

/** PUT /api/lessons/:id */
const updateLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      if (req.file && fs.existsSync(req.file.path)) {
        try { fs.unlinkSync(req.file.path); } catch {}
      }
      return res.status(404).json({ error: 'Lesson not found.' });
    }

    const mod = await Module.findById(lesson.moduleId);
    const course = await Course.findById(mod.courseId);
    if (!course || (course.instructorId.toString() !== req.user.userId && req.user.role !== 'admin')) {
      if (req.file && fs.existsSync(req.file.path)) {
        try { fs.unlinkSync(req.file.path); } catch {}
      }
      return res.status(403).json({ error: 'Access denied.' });
    }

    // Verify binary magic header if a file was uploaded (e.g. updating PDF)
    if (req.file) {
      const isValid = validateFileHeader(req.file.path, req.file.mimetype, req.file.originalname);
      if (!isValid) {
        if (fs.existsSync(req.file.path)) {
          try { fs.unlinkSync(req.file.path); } catch {}
        }
        return res.status(400).json({
          error: 'Uploaded file content does not match its declared video/document format. File may be corrupted or unsupported.',
        });
      }
    }

    const { title, textContent, durationSeconds, isPreview, order } = req.body;
    if (title !== undefined) lesson.title = title.trim();
    if (textContent !== undefined) lesson.textContent = textContent;
    if (durationSeconds !== undefined) lesson.durationSeconds = Math.max(0, Number(durationSeconds));
    if (isPreview !== undefined) lesson.isPreview = isPreview === 'true' || isPreview === true;
    if (order !== undefined) lesson.order = Number(order);

    // If updating a video lesson with a new video URL (support videoUrl, videoURL, video, contentUrl)
    const rawIncomingVideoUrl = (req.body.videoUrl || req.body.videoURL || req.body.video || (lesson.type === 'video' ? req.body.contentUrl : null) || '').trim();
    if (rawIncomingVideoUrl) {
      const val = validateVideoUrl(rawIncomingVideoUrl);
      if (!val.valid) {
        if (req.file && fs.existsSync(req.file.path)) {
          try { fs.unlinkSync(req.file.path); } catch {}
        }
        return res.status(400).json({ error: val.error });
      }
      const normalized = val.normalizedUrl || rawIncomingVideoUrl;
      lesson.contentUrl = normalized;
      lesson.videoUrl = normalized;
    } else if (req.file) {
      const path = getRelativePath(req.file);
      lesson.contentUrl = path;
      lesson.videoUrl = path;
    }

    await lesson.save();

    const lessonObj = lesson.toObject ? lesson.toObject() : { ...lesson };
    if (lessonObj.type === 'video') {
      const resolved = lessonObj.videoUrl || lessonObj.contentUrl || null;
      lessonObj.videoUrl = resolved;
      lessonObj.contentUrl = resolved;
    }
    res.json({ message: 'Lesson updated.', lesson: lessonObj });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch {}
    }
    next(err);
  }
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

    // Resolve videoUrl and contentUrl so both are present for players
    const lessonObj = lesson.toObject ? lesson.toObject() : { ...lesson };
    if (lessonObj.type === 'video') {
      const resolvedUrl = lessonObj.videoUrl || lessonObj.contentUrl || lessonObj.videoURL || lessonObj.video || null;
      lessonObj.videoUrl = resolvedUrl;
      lessonObj.contentUrl = resolvedUrl;

      // Auto-reconcile video duration if missing or at placeholder 360
      const val = validateVideoUrl(resolvedUrl || '');
      if (val.valid && val.provider === 'youtube' && val.videoId) {
        if (!lesson.durationSeconds || lesson.durationSeconds === 360) {
          try {
            const ytDur = await fetchYouTubeDuration(val.videoId);
            if (ytDur && ytDur > 0 && lesson.durationSeconds !== ytDur) {
              lesson.durationSeconds = ytDur;
              await lesson.save();
              lessonObj.durationSeconds = ytDur;
            }
          } catch {}
        }
      }
    }

    // Instructors/admins always have access
    if (['instructor', 'admin'].includes(req.user.role)) {
      return res.json({ lesson: lessonObj });
    }

    // For students: check enrollment unless it's a preview lesson
    if (!lesson.isPreview) {
      const enrolled = await Enrollment.findOne({
        studentId: req.user.userId,
        courseId: course._id,
        status: { $in: ['active', 'completed'] },
      });
      if (!enrolled) return res.status(403).json({ error: 'You must enroll in this course to access this lesson.' });
    }

    // Attach progress for the student
    let progress = await Progress.findOne({ studentId: req.user.userId, lessonId: lesson._id });

    // Auto-complete if existing progress already meets 90% threshold for reconciled duration
    if (progress && !progress.completed && lesson.durationSeconds > 0 && progress.watchedSeconds >= lesson.durationSeconds * 0.9) {
      progress.completed = true;
      progress.completedAt = progress.completedAt || new Date();
      await progress.save();
    }

    res.json({ lesson: lessonObj, progress: progress || null });
  } catch (err) { next(err); }
};

/**
 * POST /api/lessons/:id/progress
 * Student updates their progress for a video lesson.
 *
 * Design Decision: The client sends { watchedSeconds, lastPosition, mediaDuration, watchedRanges }
 * periodically. The server reconciles media duration against YouTube's authoritative length,
 * merges verified continuous playback ranges, and COMPUTES completion status by checking
 * if watchedSeconds >= 90% of duration — we never trust a client-sent 'completed' flag.
 */
const updateProgress = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ error: 'Lesson not found.' });

    const mod = await Module.findById(lesson.moduleId);
    if (!mod) return res.status(404).json({ error: 'Module not found.' });

    // Verify enrollment
    const enrolled = await Enrollment.findOne({
      studentId: req.user.userId,
      courseId: mod.courseId,
      status: { $in: ['active', 'completed'] },
    });
    if (!enrolled) {
      return res.status(403).json({ error: 'You must be enrolled in this course to record progress.' });
    }

    let { watchedSeconds, lastPosition, mediaDuration, watchedRanges } = req.body;
    watchedSeconds = Math.max(0, Number(watchedSeconds) || 0);
    lastPosition = Math.max(0, Number(lastPosition) || 0);
    const clientReportedDuration = Math.max(0, Number(mediaDuration) || 0);

    // Reconcile video duration
    let authoritativeDuration = lesson.durationSeconds || 0;

    if (lesson.type === 'video') {
      const val = validateVideoUrl(lesson.videoUrl || lesson.contentUrl || '');
      if (val.valid && val.provider === 'youtube' && val.videoId) {
        const needsCheck =
          authoritativeDuration === 0 ||
          authoritativeDuration === 360 ||
          (clientReportedDuration > 0 && Math.abs(authoritativeDuration - clientReportedDuration) > 3);

        if (needsCheck) {
          try {
            const ytDuration = await fetchYouTubeDuration(val.videoId);
            if (ytDuration && ytDuration > 0) {
              authoritativeDuration = ytDuration;
              lesson.durationSeconds = ytDuration;
              await lesson.save();
            } else if (clientReportedDuration > 0 && (authoritativeDuration === 0 || authoritativeDuration > clientReportedDuration)) {
              authoritativeDuration = clientReportedDuration;
              lesson.durationSeconds = clientReportedDuration;
              await lesson.save();
            }
          } catch {}
        }
      } else if (authoritativeDuration === 0 && clientReportedDuration > 0) {
        authoritativeDuration = clientReportedDuration;
        lesson.durationSeconds = clientReportedDuration;
        await lesson.save();
      }
    }

    if (authoritativeDuration === 0 && clientReportedDuration > 0) {
      authoritativeDuration = clientReportedDuration;
    }

    // Clamp watchedSeconds to authoritative duration
    if (authoritativeDuration > 0) {
      watchedSeconds = Math.min(watchedSeconds, authoritativeDuration);
    }

    // Find or create progress record
    let progress = await Progress.findOne({ studentId: req.user.userId, lessonId: lesson._id });
    if (!progress) {
      progress = new Progress({
        studentId: req.user.userId,
        lessonId: lesson._id,
        courseId: mod.courseId,
      });
    }

    // Continuous ranges merging and coverage calculation
    if (Array.isArray(watchedRanges) && watchedRanges.length > 0) {
      progress.watchedRanges = mergeRanges(progress.watchedRanges, watchedRanges);
      const rangeCount = countUniqueSeconds(progress.watchedRanges);
      if (authoritativeDuration > 0) {
        progress.watchedSeconds = Math.min(
          authoritativeDuration,
          Math.max(progress.watchedSeconds || 0, watchedSeconds, rangeCount)
        );
      } else {
        progress.watchedSeconds = Math.max(progress.watchedSeconds || 0, watchedSeconds, rangeCount);
      }
    } else {
      if (watchedSeconds > (progress.watchedSeconds || 0)) {
        progress.watchedSeconds = watchedSeconds;
      }
    }

    // Monotonic guard: position should never jump backwards on stale out-of-order calls
    if (lastPosition > (progress.lastPosition || 0)) {
      progress.lastPosition = lastPosition;
    }

    // Server-side completion check: >= 90% of authoritative duration
    const threshold = authoritativeDuration > 0 ? authoritativeDuration * 0.9 : 0;
    if (!progress.completed && authoritativeDuration > 0 && progress.watchedSeconds >= threshold) {
      progress.completed = true;
      progress.completedAt = new Date();
    }
    // PDF / text lessons OR video lessons with 0 duration: completed on first view
    if (!progress.completed && (lesson.type !== 'video' || authoritativeDuration <= 0)) {
      progress.completed = true;
      progress.completedAt = new Date();
    }

    await progress.save();
    res.json({ progress });
  } catch (err) { next(err); }
};

module.exports = { createLesson, updateLesson, deleteLesson, getLessonById, updateProgress };
