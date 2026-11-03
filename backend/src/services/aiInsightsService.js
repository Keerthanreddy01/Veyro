/**
 * aiInsightsService.js
 * 
 * Computes personalized learning insights and identifies knowledge gaps
 * based strictly on the authenticated student's historical progress and quiz attempts.
 * AI-generated insights never mutate official LMS records.
 */

const Enrollment = require('../models/Enrollment');
const Progress = require('../models/Progress');
const QuizAttempt = require('../models/QuizAttempt');
const { generateCompletion } = require('./aiProvider');

async function getStudentInsights(studentId) {
  if (!studentId) {
    throw new Error('Student ID is required to calculate insights');
  }

  // 1. Fetch student enrollments
  const enrollments = await Enrollment.find({ studentId })
    .populate('courseId', 'title category level')
    .lean();

  // 2. Fetch lesson progress
  const progressRecords = await Progress.find({ studentId })
    .populate('lessonId', 'title type durationSeconds')
    .lean();

  // 3. Fetch quiz attempts
  const quizAttempts = await QuizAttempt.find({ studentId })
    .populate('quizId', 'title passingScore')
    .sort({ startedAt: -1 })
    .lean();

  // Compute metrics
  const totalEnrolled = enrollments.length;
  const completedCourses = enrollments.filter((e) => e.status === 'completed').length;
  const activeCourses = enrollments.filter((e) => e.status === 'active').length;

  const completedLessons = progressRecords.filter((p) => p.completed).length;
  const inProgressLessons = progressRecords.filter((p) => !p.completed && p.watchedSeconds > 0).length;

  let totalQuizScore = 0;
  let passedQuizAttempts = 0;
  const quizDetails = quizAttempts.slice(0, 5).map((qa) => {
    totalQuizScore += qa.score || 0;
    if (qa.passed) passedQuizAttempts++;
    return {
      quizTitle: qa.quizId?.title || 'Assessment',
      score: qa.score,
      passed: qa.passed,
      tabViolations: qa.tabViolations || 0,
      autoSubmitted: qa.autoSubmitted || false,
    };
  });

  const avgQuizScore = quizAttempts.length > 0 ? Math.round(totalQuizScore / quizAttempts.length) : null;

  // Identify specific lessons that are partially watched (<90%) needing revision
  const needsRevisionLessons = progressRecords
    .filter((p) => !p.completed && p.watchedSeconds > 0)
    .slice(0, 5)
    .map((p) => ({
      title: p.lessonId?.title || 'Lesson',
      type: p.lessonId?.type || 'video',
      watchedSeconds: p.watchedSeconds,
      durationSeconds: p.lessonId?.durationSeconds || 0,
    }));

  const metrics = {
    totalEnrolled,
    completedCourses,
    activeCourses,
    completedLessons,
    inProgressLessons,
    totalQuizAttempts: quizAttempts.length,
    passedQuizAttempts,
    averageQuizScore: avgQuizScore,
    needsRevisionCount: needsRevisionLessons.length,
  };

  const systemPrompt = `You are Veyro AI's Academic Insights Specialist.
Analyze the student's authentic learning data below and provide a concise, empowering diagnostic assessment.
Format your output cleanly in Markdown with these exact sections:
1. 🌟 **Mastery Strengths**: What the student has mastered or demonstrated competence in.
2. ⚠️ **Knowledge Gaps & Revision Targets**: Specific lessons or assessments requiring review.
3. 📈 **Assessment Trends**: Analysis of quiz scores, timing, and consistency.
4. 🚀 **Next Recommended Actions**: 3 concrete, prioritized learning steps to achieve course completion.`;

  const userPrompt = `Student Performance Summary:
- Active Courses: ${activeCourses}, Completed: ${completedCourses}
- Completed Lessons: ${completedLessons}, In Progress: ${inProgressLessons}
- Quiz Statistics: ${quizAttempts.length} attempts, ${passedQuizAttempts} passed, Average Score: ${avgQuizScore ?? 'N/A'}%
- Recent Assessments:
${JSON.stringify(quizDetails, null, 2)}
- Lessons Requiring Attention / Revision:
${JSON.stringify(needsRevisionLessons, null, 2)}

Provide the personalized diagnostic report.`;

  let aiNarrative = '';
  let providerUsed = 'database';

  try {
    const aiRes = await generateCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      { temperature: 0.3, maxTokens: 1200 }
    );
    aiNarrative = aiRes.content;
    providerUsed = aiRes.provider;
  } catch (err) {
    aiNarrative = `### 🌟 Mastery Strengths\nYou have completed ${completedLessons} learning units across ${activeCourses} active curricula.\n\n### ⚠️ Knowledge Gaps & Revision Targets\nYou have ${needsRevisionLessons.length} lessons in progress. Focus on reaching 90% watch time on pending video lectures to qualify for certificates.`;
  }

  return {
    metrics,
    needsRevisionLessons,
    recentQuizzes: quizDetails,
    provider: providerUsed,
    narrative: aiNarrative,
  };
}

module.exports = {
  getStudentInsights,
};

