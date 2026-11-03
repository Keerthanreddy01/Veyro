/**
 * aiStudyPlannerService.js
 * 
 * Generates personalized daily and weekly study schedules based on actual
 * student enrollments, progress, and study availability.
 */

const Enrollment = require('../models/Enrollment');
const Progress = require('../models/Progress');
const Course = require('../models/Course');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const { generateCompletion } = require('./aiProvider');

async function generateStudyPlan(studentId, { targetGoal, dailyHours = 1.5, daysPerWeek = 5, preferredCourseId }) {
  // Fetch active enrollments
  const query = { studentId, status: 'active' };
  if (preferredCourseId) query.courseId = preferredCourseId;

  const enrollments = await Enrollment.find(query).populate('courseId').lean();

  if (enrollments.length === 0) {
    return {
      message: 'You have no active course enrollments yet. Please enroll in a course to generate a custom schedule.',
      dailyHours,
      daysPerWeek,
      activeCoursesCount: 0,
      plan: null,
      provider: 'heuristic',
      scheduleText: `### 🎯 Getting Started\nTo generate a tailored daily schedule, enroll in any of Veyro's published courses.\n\n### 📅 Recommended Routine\nDedicate ${dailyHours} hours/day across ${daysPerWeek} days/week to build consistent study habits.`,
    };
  }

  // Fetch student progress
  const courseIds = enrollments.map((e) => e.courseId?._id).filter(Boolean);
  const progressRecords = await Progress.find({
    studentId,
    courseId: { $in: courseIds },
  }).lean();

  const progressByCourse = new Map();
  progressRecords.forEach((p) => {
    const cid = String(p.courseId);
    if (!progressByCourse.has(cid)) progressByCourse.set(cid, []);
    progressByCourse.get(cid).push(p);
  });

  const enrolledSummary = enrollments.map((e) => {
    const course = e.courseId;
    const records = progressByCourse.get(String(course?._id)) || [];
    const completedCount = records.filter((r) => r.completed).length;
    return {
      title: course?.title || 'Course',
      level: course?.level || 'Beginner',
      completedLessons: completedCount,
    };
  });

  const systemPrompt = `You are Veyro AI's Master Study Planner.
Generate a realistic, balanced, highly actionable study schedule for a student.
Format your output cleanly in Markdown with these structured sections:
1. 🎯 **Executive Strategy**: High-level focus and goal pacing.
2. 📅 **Weekly Schedule (Day-by-Day)**: Breakdown for ${daysPerWeek} days/week at ${dailyHours} hours/day.
3. ⏱️ **Focus Blocks**: Pomodoro or module recommendation (Theory vs Practice).
4. 🚀 **Milestone Targets**: End-of-week tangible deliverables.`;

  const userPrompt = `Student Study Parameters:
- Target Learning Goal: "${targetGoal || 'Complete active courses and earn verified certificates'}"
- Daily Study Time: ${dailyHours} hours/day
- Frequency: ${daysPerWeek} days per week
- Active Curricula:
${JSON.stringify(enrolledSummary, null, 2)}

Please generate a personalized study plan.`;

  const aiRes = await generateCompletion(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    { temperature: 0.3, maxTokens: 1400 }
  );

  return {
    dailyHours,
    daysPerWeek,
    activeCoursesCount: enrollments.length,
    provider: aiRes.provider,
    scheduleText: aiRes.content,
  };
}

module.exports = {
  generateStudyPlan,
};
