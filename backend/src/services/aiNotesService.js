/**
 * aiNotesService.js
 * 
 * Generates factual summaries, revision notes, key concepts, and glossaries
 * grounded strictly in actual course curriculum materials.
 */

const { generateCompletion } = require('./aiProvider');
const { getCourseKnowledgeBase } = require('./courseRagService');

async function summarizeContent({ courseId, moduleId, lessonId, format = 'comprehensive' }) {
  const kb = await getCourseKnowledgeBase(courseId);
  if (!kb || !kb.course) {
    throw new Error('Course curriculum not found');
  }

  let targetTitle = kb.course.title;
  let sourceMaterial = `Course Title: "${kb.course.title}".\nOverview: ${kb.course.description}\n`;

  if (moduleId) {
    const mod = (kb.modules || []).find((m) => String(m._id) === String(moduleId));
    if (mod) {
      targetTitle = `${kb.course.title} — Module: ${mod.title}`;
      sourceMaterial += `\nTarget Module: "${mod.title}"\nDescription: ${mod.description || 'N/A'}\n`;
    }
  }

  if (lessonId) {
    const lesson = (kb.lessons || []).find((l) => String(l._id) === String(lessonId));
    if (lesson) {
      targetTitle = `${kb.course.title} — Lesson: ${lesson.title}`;
      sourceMaterial += `\nTarget Lesson: "${lesson.title}" (${lesson.type})\n`;
      if (lesson.textContent) {
        sourceMaterial += `Text Content:\n${lesson.textContent}\n`;
      }
    }
  } else {
    // Include curriculum outline
    const moduleOutlines = (kb.modules || []).map((m) => {
      const lessonsInMod = (kb.lessons || [])
        .filter((l) => String(l.moduleId) === String(m._id))
        .map((l) => l.title);
      return `- Module "${m.title}": ${lessonsInMod.join(', ') || 'No lessons'}`;
    });
    sourceMaterial += `\nCurriculum Structure:\n${moduleOutlines.join('\n')}\n`;
  }

  const systemPrompt = `You are Veyro AI's Academic Note Synthesis Engine.
Your task is to produce structured, factual revision notes based ONLY on the provided course material.
DO NOT hallucinate or introduce topics not covered in this curriculum.
Format your output cleanly in Markdown with these exact sections:

### 📌 Overview
(2-3 clear summary sentences capturing the essence of the material)

### 💡 Core Concepts
(4-6 key bullet points explaining main mechanisms, methodologies, or theorems)

### 📖 Key Terms & Definitions
(3-5 essential glossary items: **Term**: concise explanation)

### 🎯 Revision Checkpoints
(3 quick self-test prompts to test comprehension)`;

  const aiRes = await generateCompletion(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Please summarize the following learning materials for: ${targetTitle}\n\n${sourceMaterial}` },
    ],
    { temperature: 0.3, maxTokens: 1400 }
  );

  return {
    targetTitle,
    courseId,
    provider: aiRes.provider,
    notes: aiRes.content,
  };
}

module.exports = {
  summarizeContent,
};

