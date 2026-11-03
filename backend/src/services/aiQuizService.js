/**
 * aiQuizService.js
 * 
 * Generates interactive practice quizzes for students.
 * Practice quizzes are kept completely separate from official LMS assessments
 * and student certification attempt tracking.
 */

const { generateCompletion } = require('./aiProvider');
const { getCourseKnowledgeBase } = require('./courseRagService');

/**
 * Generate practice multiple choice questions for a topic or course.
 */
async function generatePracticeQuiz({ topic, courseId, difficulty = 'intermediate', questionCount = 4 }) {
  let contextMaterial = '';
  let subjectName = topic || 'General Engineering';

  if (courseId) {
    const kb = await getCourseKnowledgeBase(courseId);
    if (kb && kb.course) {
      subjectName = kb.course.title;
      const lessonTitles = (kb.lessons || []).map((l) => l.title).join(', ');
      contextMaterial = `Course: "${kb.course.title}". Description: ${kb.course.description}. Key Lessons: ${lessonTitles}.`;
    }
  }

  const systemPrompt = `You are Veyro AI's Practice Assessment Engine.
Generate an engaging, educational multiple-choice practice quiz with exactly ${questionCount} questions.
Difficulty level: ${difficulty}.
CRITICAL INSTRUCTIONS:
1. Every question must have exactly 4 distinct options.
2. Clearly mark the 0-based correctIndex (0, 1, 2, or 3).
3. Provide a clear educational explanation for why the answer is correct and why other choices are incorrect.
4. Output STRICT JSON only. Format:
[
  {
    "id": "q1",
    "question": "Clear question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "explanation": "Detailed conceptual explanation."
  }
]`;

  const userPrompt = `Topic: "${subjectName}".
Difficulty: ${difficulty}.
${contextMaterial ? `Source Curriculum Context:\n${contextMaterial}` : ''}
Please generate ${questionCount} questions.`;

  const aiRes = await generateCompletion(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    { temperature: 0.3, maxTokens: 1500 }
  );

  const raw = aiRes.content;
  const jsonMatch = raw.match(/\[[\s\S]*\]/);
  let questions = [];

  if (jsonMatch) {
    try {
      questions = JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.warn('[Quiz Service] JSON parse error:', e.message);
    }
  }

  // Safe fallback if model output failed to parse
  if (!questions || questions.length === 0) {
    questions = [
      {
        id: 'q1',
        question: `Which fundamental principle is central to understanding ${subjectName}?`,
        options: [
          'Decomposition and systematic problem analysis',
          'Arbitrary trial and error without metrics',
          'Bypassing prerequisite foundational axioms',
          'Eliminating documentation and verification',
        ],
        correctIndex: 0,
        explanation:
          'Systematic analysis and decomposition are core foundational methodologies across all technical disciplines.',
      },
      {
        id: 'q2',
        question: `How do practitioners verify correctness in ${subjectName}?`,
        options: [
          'Through automated testing, formal auditing, and empirical benchmarks',
          'By assuming theoretical assumptions always hold true',
          'By skipping edge-case validation',
          'Through subjective estimation without validation',
        ],
        correctIndex: 0,
        explanation:
          'Empirical benchmarks and automated verification guarantee reliability and correctness in real-world systems.',
      },
    ];
  }

  return {
    subject: subjectName,
    difficulty,
    questionCount: questions.length,
    provider: aiRes.provider,
    questions,
  };
}

/**
 * Score a student's practice quiz submission and generate feedback.
 */
function evaluatePracticeQuiz(questions, userAnswers) {
  if (!Array.isArray(questions) || !Array.isArray(userAnswers)) {
    throw new Error('Invalid quiz evaluation payload');
  }

  const answerMap = new Map();
  userAnswers.forEach((ans) => {
    answerMap.set(ans.questionId, Number(ans.selectedIndex));
  });

  let correctCount = 0;
  const feedback = questions.map((q) => {
    const selected = answerMap.has(q.id) ? answerMap.get(q.id) : null;
    const isCorrect = selected === q.correctIndex;
    if (isCorrect) correctCount++;

    return {
      questionId: q.id,
      question: q.question,
      options: q.options,
      selectedIndex: selected,
      selectedOption: selected !== null && q.options[selected] ? q.options[selected] : 'Not answered',
      correctIndex: q.correctIndex,
      correctOption: q.options[q.correctIndex],
      isCorrect,
      explanation: q.explanation,
    };
  });

  const total = questions.length;
  const scorePercent = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const passed = scorePercent >= 60;

  return {
    totalQuestions: total,
    correctCount,
    scorePercent,
    passed,
    summary: passed
      ? `Great job! You scored ${scorePercent}% and demonstrated a strong grasp of the material.`
      : `You scored ${scorePercent}%. Review the explanations below and try another practice quiz to strengthen your skills.`,
    feedback,
  };
}

module.exports = {
  generatePracticeQuiz,
  evaluatePracticeQuiz,
};

