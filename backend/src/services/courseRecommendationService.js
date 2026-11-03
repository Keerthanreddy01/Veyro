/**
 * courseRecommendationService.js
 * 
 * Generates verified course recommendations grounded strictly in
 * actual published MongoDB Atlas course records.
 */

const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');
const { generateCompletion } = require('./aiProvider');

const FIXTURE_TITLE_REGEX = /^(?:\[Live (?:Audit )?Test\]|Audit Curriculum)/i;

/**
 * Filter out test fixtures and unpublished courses to protect student catalog.
 */
function isLegitimatePublishedCourse(course) {
  if (!course || course.status !== 'published') return false;
  if (FIXTURE_TITLE_REGEX.test(course.title)) return false;
  return true;
}

/**
 * Recommend published courses based on student profile, interests, and past enrollments.
 */
async function getCourseRecommendations(studentId, userPrompt = '') {
  // 1. Fetch legitimate published courses from MongoDB
  const allPublished = await Course.find({ status: 'published' }).lean();
  const legitimateCourses = allPublished.filter(isLegitimatePublishedCourse);

  if (legitimateCourses.length === 0) {
    return {
      message: 'No published courses are currently available in the catalog.',
      recommendations: [],
      provider: 'database',
    };
  }

  // 2. Fetch student details and current enrollments
  let student = null;
  let enrolledCourseIds = new Set();
  if (studentId) {
    student = await User.findById(studentId).lean();
    const enrollments = await Enrollment.find({
      studentId,
      status: { $in: ['active', 'completed'] },
    }).lean();
    enrolledCourseIds = new Set(enrollments.map((e) => String(e.courseId)));
  }

  // 3. Prepare candidate course summaries for the LLM
  const courseCandidates = legitimateCourses.map((c) => ({
    id: String(c._id),
    title: c.title,
    description: c.description.substring(0, 300),
    category: c.category || 'General',
    level: c.level || 'Beginner',
    objectives: Array.isArray(c.learningObjectives) ? c.learningObjectives.slice(0, 3) : [],
    prerequisites: Array.isArray(c.prerequisites) ? c.prerequisites.slice(0, 2) : [],
    isEnrolled: enrolledCourseIds.has(String(c._id)),
  }));

  // 4. Construct prompt with actual DB courses
  const studentContext = student
    ? `Student Grade: ${student.grade || 'Not specified'}. Student Hobbies/Interests: ${(student.hobbies || []).join(', ') || 'Not specified'}.`
    : 'New student.';

  const systemPrompt = `You are Veyro AI, an educational course advisor.
Your job is to recommend the best courses from the following VERIFIED LMS CATALOG.
CRITICAL RULES:
1. ONLY recommend courses from the provided list. NEVER invent or hallucinate course names or IDs.
2. If the student asks for something not in the catalog, state that clearly and suggest the closest available real course.
3. For each recommended course, explain specifically WHY it fits the student's goals.
4. Output valid JSON array with up to 3 recommendations formatted as:
[
  {
    "courseId": "EXACT_ID_FROM_LIST",
    "title": "EXACT_TITLE_FROM_LIST",
    "category": "CATEGORY",
    "level": "LEVEL",
    "matchReason": "Clear, friendly explanation of why this course is ideal."
  }
]`;

  const userMessage = `${studentContext}
Student Query: "${userPrompt || 'Which course should I learn based on my interests?'}"

Available Published Courses:
${JSON.stringify(courseCandidates, null, 2)}

Provide top course recommendations strictly in JSON format.`;

  let recommendations = [];
  let providerUsed = 'database';

  try {
    const aiRes = await generateCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      { temperature: 0.2, maxTokens: 1024 }
    );

    providerUsed = aiRes.provider;
    const rawText = aiRes.content;
    const jsonMatch = rawText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      // Verify every recommendation actually exists in our verified list
      const candidateMap = new Map(courseCandidates.map((c) => [c.id, c]));
      recommendations = parsed
        .filter((rec) => candidateMap.has(rec.courseId))
        .map((rec) => {
          const actual = candidateMap.get(rec.courseId);
          return {
            courseId: rec.courseId,
            title: actual.title,
            description: actual.description,
            category: actual.category,
            level: actual.level,
            matchReason: rec.matchReason,
            isEnrolled: actual.isEnrolled,
            url: `/courses/${rec.courseId}`,
          };
        });
    }
  } catch (err) {
    console.warn('[Course Recommendation] LLM ranking failed, using fallback heuristic:', err.message);
  }

  // Fallback: If LLM failed or parsed empty, return heuristic recommendations from DB
  if (recommendations.length === 0) {
    recommendations = legitimateCourses.slice(0, 3).map((c) => ({
      courseId: String(c._id),
      title: c.title,
      description: c.description,
      category: c.category || 'General',
      level: c.level || 'Beginner',
      matchReason: 'Foundational course in the Veyro curriculum recommended for continuous skill growth.',
      isEnrolled: enrolledCourseIds.has(String(c._id)),
      url: `/courses/${c._id}`,
    }));
  }

  return {
    studentProfile: student ? { name: student.name, grade: student.grade, hobbies: student.hobbies } : null,
    totalPublishedAvailable: legitimateCourses.length,
    recommendations,
    provider: providerUsed,
  };
}

module.exports = {
  getCourseRecommendations,
  isLegitimatePublishedCourse,
};

