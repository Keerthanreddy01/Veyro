/**
 * aiController.js
 * 
 * Central controller handling all Veyro AI intelligent capabilities:
 * - Conversational tutoring (NVIDIA NIM primary + Groq fallback)
 * - Course-aware RAG retrieval and citation
 * - Practice quiz generation & scoring
 * - Flashcard synthesis
 * - Course summarization & notes
 * - Personalized study scheduling
 * - Student knowledge gap insights
 * - Real MongoDB course recommendations
 */

const { generateCompletion, streamCompletion, NVIDIA_DEFAULT_MODEL, GROQ_DEFAULT_MODEL } = require('../services/aiProvider');
const { verifyStudentAccess, retrieveCoursePassages } = require('../services/courseRagService');
const { getCourseRecommendations } = require('../services/courseRecommendationService');
const { generatePracticeQuiz, evaluatePracticeQuiz } = require('../services/aiQuizService');
const { summarizeContent } = require('../services/aiNotesService');
const { generateFlashcards } = require('../services/aiFlashcardService');
const { generateStudyPlan } = require('../services/aiStudyPlannerService');
const { getStudentInsights } = require('../services/aiInsightsService');
const AiConversation = require('../models/AiConversation');
const { sanitizePrompt } = require('../middleware/aiRateLimiter');

/**
 * POST /api/ai/chat
 * Multi-turn chat completion with course-aware RAG and streaming support.
 */
async function handleChat(req, res, next) {
  try {
    const studentId = req.user?.userId;
    const { message, courseId, difficulty = 'intermediate', stream = false } = req.body;

    const cleanMessage = sanitizePrompt(message);
    if (!cleanMessage) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    // 1. If courseId is provided, verify access and retrieve RAG passages
    let courseContextText = '';
    let sources = [];

    if (courseId) {
      const access = await verifyStudentAccess(studentId, courseId);
      if (!access.allowed) {
        return res.status(403).json({ error: access.reason || 'Access denied to this course material.' });
      }

      const rag = await retrieveCoursePassages(courseId, cleanMessage, 4);
      if (rag && rag.passages && rag.passages.length > 0) {
        sources = rag.passages.map((p) => ({
          sourceType: p.sourceType,
          courseTitle: p.courseTitle,
          moduleTitle: p.moduleTitle,
          lessonTitle: p.lessonTitle,
        }));

        const passageText = rag.passages
          .map(
            (p, idx) =>
              `[Passage ${idx + 1}] Source: ${p.courseTitle} > ${p.moduleTitle} > ${p.lessonTitle}\n${p.content}`
          )
          .join('\n\n');

        courseContextText = `\n\nCOURSE CURRICULUM GROUND TRUTH (Ground your answer strictly in these materials):\n${passageText}\n\nINSTRUCTION: Cite the relevant module or lesson when using information from the course curriculum. If the information is not in the course materials, state: "This topic is not covered in the current course materials for ${rag.course?.title || 'this course'}."`;
      }
    }

    // 2. Fetch or initialize conversation history (prune to last 8 messages)
    let conversation = await AiConversation.findOne({
      studentId,
      courseId: courseId || null,
    });

    if (!conversation) {
      conversation = new AiConversation({
        studentId,
        courseId: courseId || null,
        title: cleanMessage.substring(0, 50),
        messages: [],
      });
    }

    const historyMessages = (conversation.messages || []).slice(-8).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // 3. Assemble system prompt
    const systemPrompt = `You are Veyro AI, the intelligent, friendly, and empowering AI learning companion for the Veyro LMS platform.
Your goals:
- Help students master difficult engineering, programming, science, and academic concepts with clear, encouraging explanations.
- Adapt explanations to the student's selected difficulty: ${difficulty} (beginner: simple metaphors; intermediate: solid technical depth; advanced: mathematical rigor and low-level mechanics).
- If the student asks in another language (e.g., Telugu, Hindi, Spanish, French, German), reply in their language while preserving standardized technical and programming terms.
- For code questions, provide clean, idiomatic snippets with brief inline comments.
- Always be encouraging, polite, and academically rigorous.${courseContextText}`;

    const promptMessages = [
      { role: 'system', content: systemPrompt },
      ...historyMessages,
      { role: 'user', content: cleanMessage },
    ];

    // 4. Stream or regular completion
    if (stream) {
      // Record user message in DB first
      conversation.messages.push({
        role: 'user',
        content: cleanMessage,
        timestamp: new Date(),
      });
      await conversation.save();

      return await streamCompletion(promptMessages, res, { maxTokens: 1024 });
    }

    // Standard completion
    const aiResult = await generateCompletion(promptMessages, { maxTokens: 1024 });

    // Save messages to history
    conversation.messages.push({
      role: 'user',
      content: cleanMessage,
      timestamp: new Date(),
    });

    conversation.messages.push({
      role: 'assistant',
      content: aiResult.content,
      provider: aiResult.provider,
      model: aiResult.model,
      sources,
      timestamp: new Date(),
    });

    await conversation.save();

    res.json({
      message: aiResult.content,
      provider: aiResult.provider,
      model: aiResult.model,
      sources,
      conversationId: conversation._id,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/ai/chat/history
 */
async function getChatHistory(req, res, next) {
  try {
    const studentId = req.user?.userId;
    const courseId = req.query.courseId || null;

    const conversation = await AiConversation.findOne({
      studentId,
      courseId,
    }).lean();

    res.json({
      conversationId: conversation?._id || null,
      messages: conversation?.messages || [],
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/ai/chat/history
 */
async function clearChatHistory(req, res, next) {
  try {
    const studentId = req.user?.userId;
    const courseId = req.query.courseId || null;

    await AiConversation.deleteOne({
      studentId,
      courseId,
    });

    res.json({ success: true, message: 'Chat history cleared successfully.' });
  } catch (err) {
    next(err);
  }
}

/**
 * GET & POST /api/ai/recommendations
 */
async function handleRecommendations(req, res, next) {
  try {
    const studentId = req.user?.userId;
    const prompt = (req.body?.prompt || req.query?.prompt || '').trim();

    const result = await getCourseRecommendations(studentId, prompt);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/ai/quiz/generate
 */
async function handleGenerateQuiz(req, res, next) {
  try {
    const { topic, courseId, difficulty, questionCount } = req.body;
    const result = await generatePracticeQuiz({
      topic: sanitizePrompt(topic),
      courseId,
      difficulty,
      questionCount: Math.min(Math.max(Number(questionCount) || 4, 2), 8),
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/ai/quiz/evaluate
 */
function handleEvaluateQuiz(req, res, next) {
  try {
    const { questions, userAnswers } = req.body;
    const evaluation = evaluatePracticeQuiz(questions, userAnswers);
    res.json(evaluation);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/ai/summarize
 */
async function handleSummarize(req, res, next) {
  try {
    const { courseId, moduleId, lessonId } = req.body;
    if (!courseId) {
      return res.status(400).json({ error: 'courseId is required for summarization.' });
    }
    const result = await summarizeContent({ courseId, moduleId, lessonId });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/ai/flashcards
 */
async function handleFlashcards(req, res, next) {
  try {
    const { courseId, count } = req.body;
    if (!courseId) {
      return res.status(400).json({ error: 'courseId is required for flashcards.' });
    }
    const result = await generateFlashcards({
      courseId,
      count: Math.min(Math.max(Number(count) || 5, 3), 12),
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/ai/study-plan
 */
async function handleStudyPlan(req, res, next) {
  try {
    const studentId = req.user?.userId;
    const { targetGoal, dailyHours, daysPerWeek, preferredCourseId } = req.body;
    const result = await generateStudyPlan(studentId, {
      targetGoal: sanitizePrompt(targetGoal),
      dailyHours: Number(dailyHours) || 1.5,
      daysPerWeek: Number(daysPerWeek) || 5,
      preferredCourseId,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/ai/insights
 */
async function handleInsights(req, res, next) {
  try {
    const studentId = req.user?.userId;
    const result = await getStudentInsights(studentId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/ai/health
 */
function handleHealth(req, res) {
  res.json({
    status: 'ok',
    service: 'veyro-ai-engine',
    providers: {
      primary: {
        name: 'NVIDIA NIM',
        model: NVIDIA_DEFAULT_MODEL,
        configured: Boolean(process.env.NVIDIA_API_KEY),
      },
      fallback: {
        name: 'Groq',
        model: GROQ_DEFAULT_MODEL,
        configured: Boolean(process.env.GROQ_API_KEY),
      },
    },
    capabilities: [
      'conversational_tutoring',
      'course_aware_rag',
      'course_recommendations',
      'practice_quiz_generator',
      'flashcards_generator',
      'notes_summarization',
      'study_planner',
      'learning_insights',
      'multilingual_tutoring',
    ],
    timestamp: new Date().toISOString(),
  });
}

module.exports = {
  handleChat,
  getChatHistory,
  clearChatHistory,
  handleRecommendations,
  handleGenerateQuiz,
  handleEvaluateQuiz,
  handleSummarize,
  handleFlashcards,
  handleStudyPlan,
  handleInsights,
  handleHealth,
};

