/**
 * courseRagService.js
 * 
 * Retrieval-Augmented Generation (RAG) engine for Veyro LMS courses.
 * Grounding questions in verified MongoDB course curricula, modules, lessons,
 * and uploaded materials.
 */

const fs = require('fs');
const path = require('path');
const Course = require('../models/Course');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Enrollment = require('../models/Enrollment');

// In-memory cache for compiled course chunks (15 minute TTL)
const _courseCache = new Map();
const CACHE_TTL_MS = 15 * 60 * 1000;

/**
 * Tokenize and normalize text for term overlap matching.
 */
function tokenize(text) {
  if (!text || typeof text !== 'string') return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

/**
 * Safely extract text lines from an uploaded PDF file if present.
 */
function extractPdfTextSync(relativePath) {
  if (!relativePath) return '';
  const fullPath = path.isAbsolute(relativePath)
    ? relativePath
    : path.join(__dirname, '../../uploads', relativePath);

  if (!fs.existsSync(fullPath)) return '';

  try {
    const buffer = fs.readFileSync(fullPath);
    // Basic text extraction from PDF stream objects
    const raw = buffer.toString('latin1');
    const matches = [];
    const textRegex = /\(([^)]+)\)\s*Tj/g;
    let match;
    while ((match = textRegex.exec(raw)) !== null) {
      matches.push(match[1]);
    }
    return matches.join(' ').trim();
  } catch (err) {
    console.warn(`[Course RAG] Error reading PDF at ${fullPath}:`, err.message);
    return '';
  }
}

/**
 * Check whether a student has authorized access to a course.
 */
async function verifyStudentAccess(studentId, courseId) {
  const course = await Course.findById(courseId).lean();
  if (!course) return { allowed: false, reason: 'Course not found' };

  // Published courses are accessible to platform students
  if (course.status === 'published') {
    return { allowed: true, course };
  }

  // If unpublished, require active or completed enrollment
  if (studentId) {
    const enrollment = await Enrollment.findOne({
      studentId,
      courseId,
      status: { $in: ['active', 'completed'] },
    }).lean();

    if (enrollment) {
      return { allowed: true, course };
    }
  }

  return { allowed: false, reason: 'Course is not published and student is not enrolled' };
}

/**
 * Compile and chunk all learning content for a given course.
 */
async function getCourseKnowledgeBase(courseId) {
  const cached = _courseCache.get(String(courseId));
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached;
  }

  const course = await Course.findById(courseId).lean();
  if (!course) return null;

  const modules = await Module.find({ courseId }).sort({ order: 1 }).lean();
  const moduleIds = modules.map((m) => m._id);
  const lessons = await Lesson.find({ moduleId: { $in: moduleIds } })
    .sort({ moduleId: 1, order: 1 })
    .lean();

  const moduleMap = new Map();
  modules.forEach((m) => moduleMap.set(String(m._id), m));

  const chunks = [];

  // 1. Course overview chunk
  const objectives = Array.isArray(course.learningObjectives) ? course.learningObjectives.join(', ') : '';
  const prerequisites = Array.isArray(course.prerequisites) ? course.prerequisites.join(', ') : '';
  chunks.push({
    sourceType: 'course_overview',
    courseId: String(course._id),
    courseTitle: course.title,
    moduleTitle: 'Course Overview',
    lessonTitle: 'Introduction & Objectives',
    content: `Course: ${course.title}. Description: ${course.description}. Category: ${course.category || 'General'}. Level: ${course.level || 'Beginner'}. Learning Objectives: ${objectives || 'Comprehensive mastery'}. Prerequisites: ${prerequisites || 'None specified'}.`,
    tokens: tokenize(`${course.title} ${course.description} ${objectives} ${prerequisites}`),
  });

  // 2. Module chunks
  for (const mod of modules) {
    if (mod.description || mod.title) {
      chunks.push({
        sourceType: 'module_overview',
        courseId: String(course._id),
        courseTitle: course.title,
        moduleTitle: mod.title,
        lessonTitle: 'Module Summary',
        content: `Module: "${mod.title}". Summary: ${mod.description || 'Module covering core curriculum units.'}`,
        tokens: tokenize(`${mod.title} ${mod.description}`),
      });
    }
  }

  // 3. Lesson chunks
  for (const lesson of lessons) {
    const parentModule = moduleMap.get(String(lesson.moduleId));
    const moduleTitle = parentModule ? parentModule.title : 'Curriculum';

    let lessonDetails = `Lesson: "${lesson.title}" (${lesson.type}).`;
    if (lesson.textContent) {
      lessonDetails += ` Content: ${lesson.textContent}`;
    }
    if (lesson.type === 'video' && lesson.videoUrl) {
      lessonDetails += ` Video Reference: ${lesson.videoUrl}. Duration: ${lesson.durationSeconds || 0} seconds.`;
    }
    if (lesson.type === 'pdf' && lesson.contentUrl) {
      const pdfText = extractPdfTextSync(lesson.contentUrl);
      if (pdfText) {
        lessonDetails += ` PDF Notes: ${pdfText.substring(0, 1500)}`;
      }
    }

    chunks.push({
      sourceType: 'lesson',
      courseId: String(course._id),
      courseTitle: course.title,
      moduleTitle,
      lessonTitle: lesson.title,
      content: lessonDetails,
      tokens: tokenize(`${lesson.title} ${lessonDetails}`),
    });
  }

  const result = {
    timestamp: Date.now(),
    course,
    modules,
    lessons,
    chunks,
  };

  _courseCache.set(String(courseId), result);
  return result;
}

/**
 * Retrieve the most relevant passages for a user query.
 */
async function retrieveCoursePassages(courseId, query, maxResults = 4) {
  const kb = await getCourseKnowledgeBase(courseId);
  if (!kb || !kb.chunks || kb.chunks.length === 0) {
    return { course: null, passages: [] };
  }

  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) {
    return {
      course: kb.course,
      passages: kb.chunks.slice(0, maxResults),
    };
  }

  // Score chunks by token match frequency
  const scored = kb.chunks.map((chunk) => {
    let score = 0;
    const chunkTokenSet = new Set(chunk.tokens);

    queryTokens.forEach((token) => {
      if (chunkTokenSet.has(token)) {
        score += 3;
      } else {
        // Partial match
        for (const ct of chunkTokenSet) {
          if (ct.includes(token) || token.includes(ct)) {
            score += 1;
            break;
          }
        }
      }
    });

    // Bias toward specific lessons over generic overview if matching
    if (chunk.sourceType === 'lesson' && score > 0) {
      score += 1;
    }

    return { chunk, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const topPassages = scored
    .filter((s) => s.score > 0)
    .slice(0, maxResults)
    .map((s) => ({
      ...s.chunk,
      relevanceScore: s.score,
    }));

  // If no specific match, provide top foundational chunks
  const finalPassages =
    topPassages.length > 0
      ? topPassages
      : kb.chunks.slice(0, 2).map((c) => ({ ...c, relevanceScore: 0 }));

  return {
    course: kb.course,
    modules: kb.modules,
    lessons: kb.lessons,
    passages: finalPassages,
  };
}

module.exports = {
  verifyStudentAccess,
  getCourseKnowledgeBase,
  retrieveCoursePassages,
};

