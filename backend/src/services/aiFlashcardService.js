/**
 * aiFlashcardService.js
 * 
 * Generates structured revision flashcards from actual course content.
 * Each card contains front (concept/prompt), back (explanation), and source reference.
 */

const { generateCompletion } = require('./aiProvider');
const { getCourseKnowledgeBase } = require('./courseRagService');

async function generateFlashcards({ courseId, count = 5 }) {
  const kb = await getCourseKnowledgeBase(courseId);
  if (!kb || !kb.course) {
    throw new Error('Course curriculum not found');
  }

  const lessonSummaries = (kb.lessons || []).map((l) => {
    return `Lesson: "${l.title}" (${l.type}). ${l.textContent ? l.textContent.substring(0, 150) : ''}`;
  }).join('\n');

  const systemPrompt = `You are Veyro AI's Flashcard Generator.
Generate exactly ${count} educational flashcards based strictly on the provided course curriculum.
Return STRICT JSON array only. Format:
[
  {
    "id": "card-1",
    "front": "Concise concept, term, or question on front of card",
    "back": "Clear, informative explanation or answer on back of card",
    "source": "Name of module or lesson reference"
  }
]`;

  const userPrompt = `Course: "${kb.course.title}"
Description: ${kb.course.description}
Lessons:
${lessonSummaries}

Generate ${count} revision flashcards in JSON format.`;

  const aiRes = await generateCompletion(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    { temperature: 0.3, maxTokens: 1200 }
  );

  let flashcards = [];
  const jsonMatch = aiRes.content.match(/\[[\s\S]*\]/);
  if (jsonMatch) {
    try {
      flashcards = JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.warn('[Flashcard Service] JSON parse warning:', e.message);
    }
  }

  // Safe fallback if parsing failed
  if (!flashcards || flashcards.length === 0) {
    flashcards = [
      {
        id: 'card-1',
        front: `What is the primary objective of ${kb.course.title}?`,
        back: kb.course.description || 'Mastering foundational concepts and applications in this discipline.',
        source: 'Course Overview',
      },
      {
        id: 'card-2',
        front: 'How is student proficiency accredited on Veyro?',
        back: 'Through audited video watch verification (minimum 90%) and passing proctored module assessments.',
        source: 'System Guidelines',
      },
    ];
  }

  return {
    courseTitle: kb.course.title,
    courseId,
    totalCards: flashcards.length,
    provider: aiRes.provider,
    flashcards,
  };
}

module.exports = {
  generateFlashcards,
};

