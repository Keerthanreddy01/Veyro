require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('./src/app');
const Course = require('./src/models/Course');
const Enrollment = require('./src/models/Enrollment');
const User = require('./src/models/User');
const Lesson = require('./src/models/Lesson');
const Module = require('./src/models/Module');
const { setSimulationConfig } = require('./src/services/aiProvider');

const JWT_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'test_jwt_secret';

function createMockToken(user) {
  return jwt.sign(
    { userId: user._id.toString(), role: user.role || 'student' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

// Simple HTTP-like mock request runner using supertest-like approach
const http = require('http');

let server;
let baseUrl;

async function startTestServer() {
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
}

async function request(method, path, body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const status = res.status;
  const data = await res.json().catch(() => null);
  return { status, data, res };
}

let passedCount = 0;
let failedCount = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passedCount++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    failedCount++;
  }
}

async function runAiTests() {
  console.log('\n======================================================');
  console.log('🤖 RUNNING VEYRO AI E2E INTEGRATION TEST SUITE');
  console.log('======================================================\n');

  await startTestServer();

  // Create test mock student
  const mockStudent = {
    _id: new mongoose.Types.ObjectId(),
    name: 'Ada Lovelace',
    email: `ada.${Date.now()}@veyro-test.org`,
    role: 'student',
    grade: 'Grade 12',
    hobbies: ['Computer Science', 'Mathematics'],
  };
  const studentToken = createMockToken(mockStudent);

  try {
    // 1. Health check
    console.log('📦 GROUP 1: AI Health & Provider Discovery');
    const health = await request('GET', '/api/ai/health');
    assert(health.status === 200, 'Health endpoint responds with 200 OK');
    assert(health.data?.service === 'veyro-ai-engine', 'Correct service identifier reported');
    assert(health.data?.providers?.primary?.name === 'NVIDIA NIM', 'Primary provider identified as NVIDIA NIM');
    assert(health.data?.providers?.fallback?.name === 'Groq', 'Fallback provider identified as Groq');
    assert(health.data?.providers?.primary?.configured === true, 'NVIDIA API key configured');
    assert(health.data?.providers?.fallback?.configured === true, 'Groq API key configured');

    // 2. Auth Protection
    console.log('\n📦 GROUP 2: Authentication & Security Guard');
    const unauthChat = await request('POST', '/api/ai/chat', { message: 'Hello' });
    assert(unauthChat.status === 401, 'Reject unauthenticated AI chat request with 401');

    const emptyChat = await request('POST', '/api/ai/chat', { message: '' }, studentToken);
    assert(emptyChat.status === 400, 'Reject empty message with 400 Bad Request');

    // 3. Conversational Tutor
    console.log('\n📦 GROUP 3: AI Conversational Tutor');
    setSimulationConfig({ forceNvidiaFail: false, forceAllFail: false });
    const chat1 = await request(
      'POST',
      '/api/ai/chat',
      { message: 'In 1 sentence, explain recursion to a beginner student.', difficulty: 'beginner' },
      studentToken
    );
    assert(chat1.status === 200, 'Conversational tutor responds 200 OK');
    assert(typeof chat1.data?.message === 'string' && chat1.data.message.length > 10, 'Tutor returns valid explanation');
    assert(chat1.data?.provider === 'nvidia' || chat1.data?.provider === 'groq', 'Provider reported in metadata');
    console.log(`     ℹ️ Tutor answer via ${chat1.data?.provider}: "${chat1.data?.message.substring(0, 80)}..."`);

    // 4. Conversation History Management
    console.log('\n📦 GROUP 4: Multi-Turn Conversation History');
    const histRes = await request('GET', '/api/ai/chat/history', null, studentToken);
    assert(histRes.status === 200, 'Retrieve conversation history responds 200 OK');
    assert(Array.isArray(histRes.data?.messages) && histRes.data.messages.length >= 2, 'History contains stored user and assistant messages');

    const clearRes = await request('DELETE', '/api/ai/chat/history', null, studentToken);
    assert(clearRes.status === 200, 'Clear conversation history responds 200 OK');
    const histAfter = await request('GET', '/api/ai/chat/history', null, studentToken);
    assert(histAfter.data?.messages?.length === 0, 'History is empty after clearance');

    // 5. Course-Aware RAG Grounding
    console.log('\n📦 GROUP 5: Course-Aware RAG Grounding');
    // Find or pick a published course in the DB
    const legitimateCourse = await Course.findOne({
      status: 'published',
      title: { $not: /^(?:\[Live|Audit)/i },
    }).lean();

    if (legitimateCourse) {
      const ragChat = await request(
        'POST',
        '/api/ai/chat',
        {
          courseId: legitimateCourse._id.toString(),
          message: 'What are the main topics and objectives covered in this course?',
        },
        studentToken
      );
      assert(ragChat.status === 200, 'Course-aware query succeeds with 200 OK');
      assert(Array.isArray(ragChat.data?.sources) && ragChat.data.sources.length > 0, 'RAG response includes source citations');
      assert(
        ragChat.data.sources[0]?.courseTitle === legitimateCourse.title,
        `Citation matches real course "${legitimateCourse.title}"`
      );
      console.log(`     ℹ️ RAG cited source: ${ragChat.data?.sources[0]?.courseTitle} > ${ragChat.data?.sources[0]?.moduleTitle}`);
    } else {
      console.log('     ℹ️ (Skipped RAG course check: no published course found in DB)');
    }

    // 6. Real Course Recommendations
    console.log('\n📦 GROUP 6: Real Course Recommendations');
    const recsRes = await request(
      'POST',
      '/api/ai/recommendations',
      { prompt: 'I want to study artificial intelligence and engineering.' },
      studentToken
    );
    assert(recsRes.status === 200, 'Recommendations endpoint responds 200 OK');
    assert(Array.isArray(recsRes.data?.recommendations), 'Returns recommendations array');
    if (recsRes.data?.recommendations?.length > 0) {
      const firstRec = recsRes.data.recommendations[0];
      assert(!!firstRec.courseId, 'Recommendation contains valid courseId');
      assert(!!firstRec.title, 'Recommendation contains valid course title');
      assert(firstRec.url.startsWith('/courses/'), 'Recommendation link points to Veyro course page');
      console.log(`     ℹ️ Recommended: "${firstRec.title}" (${firstRec.category})`);
    }

    // 7. Practice Quiz Generator & Evaluator
    console.log('\n📦 GROUP 7: Practice Quiz Generator & Evaluator');
    const quizRes = await request(
      'POST',
      '/api/ai/quiz/generate',
      { topic: 'Computer Networks and Protocols', difficulty: 'intermediate', questionCount: 3 },
      studentToken
    );
    assert(quizRes.status === 200, 'Quiz generator responds 200 OK');
    assert(Array.isArray(quizRes.data?.questions) && quizRes.data.questions.length >= 2, 'Generates multiple choice questions');
    assert(quizRes.data.questions[0].options?.length === 4, 'Question has 4 distinct options');
    assert(typeof quizRes.data.questions[0].correctIndex === 'number', 'Question includes correctIndex');

    // Test Evaluator
    const evalQuestions = quizRes.data.questions;
    const userAnswers = evalQuestions.map((q, idx) => ({
      questionId: q.id,
      selectedIndex: idx === 0 ? q.correctIndex : (q.correctIndex + 1) % 4, // 1 correct, rest incorrect
    }));

    const evalRes = await request('POST', '/api/ai/quiz/evaluate', { questions: evalQuestions, userAnswers }, studentToken);
    assert(evalRes.status === 200, 'Quiz evaluation responds 200 OK');
    assert(evalRes.data?.totalQuestions === evalQuestions.length, 'Scores all questions accurately');
    assert(evalRes.data?.correctCount === 1, 'Accurately computes correct answers count');
    assert(Array.isArray(evalRes.data?.feedback) && evalRes.data.feedback[0].explanation, 'Feedback includes educational explanations');

    // 8. Notes & Summarization
    console.log('\n📦 GROUP 8: Notes & Summarization Engine');
    if (legitimateCourse) {
      const notesRes = await request(
        'POST',
        '/api/ai/summarize',
        { courseId: legitimateCourse._id.toString() },
        studentToken
      );
      assert(notesRes.status === 200, 'Course summarization responds 200 OK');
      assert(typeof notesRes.data?.notes === 'string' && notesRes.data.notes.includes('Overview'), 'Generated notes contain structured Overview');
    }

    // 9. Revision Flashcards
    console.log('\n📦 GROUP 9: Revision Flashcards Synthesis');
    if (legitimateCourse) {
      const cardsRes = await request(
        'POST',
        '/api/ai/flashcards',
        { courseId: legitimateCourse._id.toString(), count: 4 },
        studentToken
      );
      assert(cardsRes.status === 200, 'Flashcards generation responds 200 OK');
      assert(Array.isArray(cardsRes.data?.flashcards) && cardsRes.data.flashcards.length >= 2, 'Generates flashcard array');
      assert(!!cardsRes.data.flashcards[0].front && !!cardsRes.data.flashcards[0].back, 'Flashcard contains front and back content');
    }

    // 10. Personalized Study Planner
    console.log('\n📦 GROUP 10: Personalized Study Planner');
    const planRes = await request(
      'POST',
      '/api/ai/study-plan',
      { targetGoal: 'Prepare for exams', dailyHours: 2, daysPerWeek: 5 },
      studentToken
    );
    assert(planRes.status === 200, 'Study planner responds 200 OK');
    assert(planRes.data?.dailyHours === 2, 'Schedule reflects requested daily study hours');

    // 11. Student Learning Insights
    console.log('\n📦 GROUP 11: Learning Insights & Diagnostics');
    const insightsRes = await request('GET', '/api/ai/insights', null, studentToken);
    assert(insightsRes.status === 200, 'Insights endpoint responds 200 OK');
    assert(typeof insightsRes.data?.metrics?.totalEnrolled === 'number', 'Reports authentic student metrics');
    assert(typeof insightsRes.data?.narrative === 'string', 'Synthesizes qualitative diagnostic narrative');

    // 12. Failover & Resilience
    console.log('\n📦 GROUP 12: Automatic Failover & Resilience Verification');
    setSimulationConfig({ forceNvidiaFail: true, forceAllFail: false });
    const failoverChat = await request(
      'POST',
      '/api/ai/chat',
      { message: 'What is an operating system kernel in 10 words?' },
      studentToken
    );
    assert(failoverChat.status === 200, 'Failover request succeeds with 200 OK despite primary outage');
    assert(failoverChat.data?.provider === 'groq', 'Successfully fell back to secondary provider (Groq)');
    console.log(`     ℹ️ Automatic failover verified: responded via ${failoverChat.data?.provider}`);

    // Test both providers down
    setSimulationConfig({ forceNvidiaFail: false, forceAllFail: true });
    const bothDown = await request('POST', '/api/ai/chat', { message: 'Hello' }, studentToken);
    assert(bothDown.status === 503, 'Returns 503 Service Unavailable when all providers fail');

    // Reset simulation
    setSimulationConfig({ forceNvidiaFail: false, forceAllFail: false });
  } finally {
    if (server) server.close();
  }

  console.log('\n======================================================');
  console.log(`📊 AI TEST RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('======================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runAiTests().catch((err) => {
  console.error('Fatal AI test error:', err);
  process.exit(1);
});

