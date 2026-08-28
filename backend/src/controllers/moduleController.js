const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Course = require('../models/Course');

/** POST /api/courses/:courseId/modules — Instructor creates a module */
const createModule = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ error: 'Course not found.' });
    if (course.instructorId.toString() !== req.user.userId)
      return res.status(403).json({ error: 'Access denied.' });

    const count = await Module.countDocuments({ courseId: course._id });
    const mod = await Module.create({
      courseId: course._id,
      title: req.body.title,
      description: req.body.description || '',
      order: req.body.order ?? count,
    });
    res.status(201).json({ message: 'Module created.', module: mod });
  } catch (err) { next(err); }
};

/** PUT /api/modules/:id */
const updateModule = async (req, res, next) => {
  try {
    const mod = await Module.findById(req.params.id);
    if (!mod) return res.status(404).json({ error: 'Module not found.' });

    const course = await Course.findById(mod.courseId);
    if (course.instructorId.toString() !== req.user.userId)
      return res.status(403).json({ error: 'Access denied.' });

    const { title, description, order } = req.body;
    if (title !== undefined) mod.title = title;
    if (description !== undefined) mod.description = description;
    if (order !== undefined) mod.order = order;
    await mod.save();
    res.json({ message: 'Module updated.', module: mod });
  } catch (err) { next(err); }
};

/** DELETE /api/modules/:id */
const deleteModule = async (req, res, next) => {
  try {
    const mod = await Module.findById(req.params.id);
    if (!mod) return res.status(404).json({ error: 'Module not found.' });

    const course = await Course.findById(mod.courseId);
    if (course.instructorId.toString() !== req.user.userId && req.user.role !== 'admin')
      return res.status(403).json({ error: 'Access denied.' });

    await Lesson.deleteMany({ moduleId: mod._id });
    await Module.findByIdAndDelete(mod._id);
    res.json({ message: 'Module and its lessons deleted.' });
  } catch (err) { next(err); }
};

/** GET /api/courses/:courseId/modules */
const getModules = async (req, res, next) => {
  try {
    const modules = await Module.find({ courseId: req.params.courseId }).sort('order');
    res.json({ modules });
  } catch (err) { next(err); }
};

module.exports = { createModule, updateModule, deleteModule, getModules };
