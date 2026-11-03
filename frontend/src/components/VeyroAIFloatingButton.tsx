import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  X,
  Compass,
  Brain,
  BookOpen,
  Send,
  RotateCcw,
  Layers,
  Calendar,
  Activity,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Maximize2,
  Minimize2,
  ArrowRight,
  HelpCircle,
  Award,
  Zap,
} from 'lucide-react';
import api from '../api/axios';
import { cn } from '../utils/cn';
import toast from 'react-hot-toast';

export const VEYRO_AI_MASCOT_ASSET = '/veyroai-image.png';

interface SourceCitation {
  sourceType?: string;
  courseTitle?: string;
  moduleTitle?: string;
  lessonTitle?: string;
}

interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  provider?: string;
  model?: string;
  sources?: SourceCitation[];
  timestamp?: string;
}

interface PracticeQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface Flashcard {
  id: string;
  front: string;
  back: string;
  source?: string;
}

interface EnrolledCourse {
  _id: string;
  title: string;
  category?: string;
}

type TabMode = 'chat' | 'quiz' | 'flashcards' | 'planner' | 'insights';
type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export default function VeyroAIFloatingButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabMode>('chat');

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hey there! I'm Veyro AI. What would you like to learn today?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('intermediate');
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [lastError, setLastError] = useState<string | null>(null);

  // Practice Quiz State
  const [quizQuestions, setQuizQuestions] = useState<PracticeQuestion[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizResult, setQuizResult] = useState<any | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizTopic, setQuizTopic] = useState('');

  // Flashcards State
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [flashcardsLoading, setFlashcardsLoading] = useState(false);

  // Study Plan State
  const [studyPlanResult, setStudyPlanResult] = useState<string | null>(null);
  const [studyPlanHours, setStudyPlanHours] = useState(1.5);
  const [studyPlanLoading, setStudyPlanLoading] = useState(false);

  // Insights State
  const [insightsData, setInsightsData] = useState<any | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch student enrolled courses when assistant opens
  useEffect(() => {
    if (!isOpen) return;

    api
      .get('/enrollments/my')
      .then(({ data }) => {
        const courses = (data.enrollments || [])
          .map((e: any) => e.courseId)
          .filter(Boolean);
        setEnrolledCourses(courses);
        if (courses.length > 0 && !selectedCourseId) {
          setSelectedCourseId(courses[0]._id);
        }
      })
      .catch(() => {});

    // Fetch existing conversation history
    api
      .get('/ai/chat/history')
      .then(({ data }) => {
        if (Array.isArray(data.messages) && data.messages.length > 0) {
          setMessages([
            {
              role: 'assistant',
              content: "Hey there! I'm Veyro AI. What would you like to learn today?",
              timestamp: new Date().toISOString(),
            },
            ...data.messages,
          ]);
        }
      })
      .catch(() => {});
  }, [isOpen]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isThinking, activeTab]);

  // Close on Escape or click outside
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!mounted) return null;

  // Send Chat Message
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isThinking) return;

    setInputMessage('');
    setLastError(null);

    const userMsg: ChatMessage = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);

    try {
      const { data } = await api.post('/ai/chat', {
        message: text,
        courseId: selectedCourseId || undefined,
        difficulty,
      });

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: data.message,
        provider: data.provider,
        model: data.model,
        sources: data.sources || [],
        timestamp: data.timestamp || new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.error ||
        'Veyro AI is temporarily unavailable. Please try again.';
      setLastError(errorMsg);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ ${errorMsg}`,
          provider: 'system',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  // Clear conversation history
  const handleClearHistory = async () => {
    if (!window.confirm('Clear your conversation history with Veyro AI?')) return;
    try {
      await api.delete('/ai/chat/history');
      setMessages([
        {
          role: 'assistant',
          content: "Hey there! I'm Veyro AI. What would you like to learn today?",
          timestamp: new Date().toISOString(),
        },
      ]);
      setLastError(null);
    } catch {}
  };

  // Quick Action Handler
  const handleQuickAction = (actionText: string) => {
    if (actionText === 'Generate a practice quiz') {
      setActiveTab('quiz');
      return;
    }
    if (actionText === 'Create my study plan') {
      setActiveTab('planner');
      return;
    }
    handleSendMessage(actionText);
  };

  // Generate Practice Quiz
  const handleStartQuiz = async () => {
    setQuizLoading(true);
    setQuizResult(null);
    setQuizAnswers({});

    try {
      const { data } = await api.post('/ai/quiz/generate', {
        topic: quizTopic || undefined,
        courseId: selectedCourseId || undefined,
        difficulty,
        questionCount: 4,
      });
      setQuizQuestions(data.questions || []);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to generate practice quiz.');
    } finally {
      setQuizLoading(false);
    }
  };

  // Submit Practice Quiz
  const handleSubmitQuiz = async () => {
    try {
      const userAnswers = quizQuestions.map((q) => ({
        questionId: q.id,
        selectedIndex: quizAnswers[q.id] ?? -1,
      }));

      const { data } = await api.post('/ai/quiz/evaluate', {
        questions: quizQuestions,
        userAnswers,
      });
      setQuizResult(data);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to evaluate practice quiz.');
    }
  };

  // Generate Flashcards
  const handleFetchFlashcards = async () => {
    const targetCourse = selectedCourseId || (enrolledCourses[0]?._id);
    if (!targetCourse) {
      toast('Please enroll in a course or select one from the dropdown to generate curriculum flashcards.');
      return;
    }

    setFlashcardsLoading(true);
    setCurrentCardIndex(0);
    setIsCardFlipped(false);

    try {
      const { data } = await api.post('/ai/flashcards', {
        courseId: targetCourse,
        count: 5,
      });
      setFlashcards(data.flashcards || []);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to generate flashcards.');
    } finally {
      setFlashcardsLoading(false);
    }
  };

  // Generate Study Plan
  const handleGenerateStudyPlan = async () => {
    setStudyPlanLoading(true);
    try {
      const { data } = await api.post('/ai/study-plan', {
        dailyHours: studyPlanHours,
        daysPerWeek: 5,
        preferredCourseId: selectedCourseId || undefined,
      });
      setStudyPlanResult(data.scheduleText || data.message);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to generate study plan.');
    } finally {
      setStudyPlanLoading(false);
    }
  };

  // Fetch Insights
  const handleLoadInsights = async () => {
    setInsightsLoading(true);
    try {
      const { data } = await api.get('/ai/insights');
      setInsightsData(data);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to fetch learning insights.');
    } finally {
      setInsightsLoading(false);
    }
  };

  return createPortal(
    <div
      className={cn(
        'fixed z-50 flex flex-col items-end pointer-events-none select-none font-sans',
        'bottom-[max(1rem,calc(env(safe-area-inset-bottom,0px)+0.75rem))]',
        'right-[max(1rem,calc(env(safe-area-inset-right,0px)+0.75rem))]',
        'sm:bottom-[max(1.5rem,calc(env(safe-area-inset-bottom,0px)+1rem))]',
        'sm:right-[max(1.5rem,calc(env(safe-area-inset-right,0px)+1rem))]'
      )}
      style={{ maxWidth: 'calc(100vw - 2rem)' }}
    >
      {/* Floating Modal / Panel Window */}
      {isOpen && (
        <div
          id="veyro-ai-panel"
          ref={containerRef}
          role="dialog"
          aria-modal="false"
          aria-label="Veyro AI Assistant Panel"
          className={cn(
            'pointer-events-auto mb-3 flex flex-col overflow-hidden',
            'w-[calc(100vw-2rem)] rounded-2xl bg-white/95 backdrop-blur-md border border-[#E7E2DA]',
            'shadow-[0_16px_50px_-12px_rgba(23,23,23,0.20)] text-[#171717]',
            'transition-all duration-200 ease-out animate-fade-in',
            isExpanded
              ? 'sm:w-[620px] h-[680px] max-h-[90vh]'
              : 'sm:w-[420px] h-[580px] max-h-[85vh]'
          )}
        >
          {/* Assistant Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#E7E2DA] bg-[#FAF8F4]/80 flex-shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#E7E2DA] shadow-xs shrink-0 bg-slate-900 flex items-center justify-center">
                <img
                  src={VEYRO_AI_MASCOT_ASSET}
                  alt="Veyro AI mascot"
                  className="w-full h-full object-cover object-center"
                  loading="eager"
                />
              </div>
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[#171717] tracking-tight">Veyro AI</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-[#369EFF]/10 text-[#0066cc] px-1.5 py-0.2 rounded">
                    Companion
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] text-[#77736D] font-medium">NVIDIA NIM • Groq Active</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleClearHistory}
                title="Clear conversation"
                aria-label="Clear chat history"
                className="p-1.5 text-[#77736D] hover:text-[#171717] hover:bg-white rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw size={15} />
              </button>

              <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                title={isExpanded ? 'Collapse' : 'Expand'}
                aria-label="Toggle assistant size"
                className="hidden sm:inline-flex p-1.5 text-[#77736D] hover:text-[#171717] hover:bg-white rounded-lg transition-colors cursor-pointer"
              >
                {isExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close Veyro AI assistant panel"
                className="p-1.5 text-[#77736D] hover:text-[#171717] hover:bg-white rounded-lg transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Navigation Tab Bar */}
          <div className="flex items-center px-3 py-1.5 border-b border-[#E7E2DA] bg-white gap-1 flex-shrink-0 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab('chat')}
              className={cn(
                'px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors shrink-0 cursor-pointer flex items-center gap-1.5',
                activeTab === 'chat'
                  ? 'bg-[#171717] text-white shadow-xs'
                  : 'text-[#77736D] hover:text-[#171717] hover:bg-[#FAF8F4]'
              )}
            >
              <Brain size={13} /> Tutor
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('quiz')}
              className={cn(
                'px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors shrink-0 cursor-pointer flex items-center gap-1.5',
                activeTab === 'quiz'
                  ? 'bg-[#171717] text-white shadow-xs'
                  : 'text-[#77736D] hover:text-[#171717] hover:bg-[#FAF8F4]'
              )}
            >
              <Award size={13} /> Practice Quiz
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('flashcards');
                if (flashcards.length === 0 && (selectedCourseId || enrolledCourses[0]?._id)) {
                  handleFetchFlashcards();
                }
              }}
              className={cn(
                'px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors shrink-0 cursor-pointer flex items-center gap-1.5',
                activeTab === 'flashcards'
                  ? 'bg-[#171717] text-white shadow-xs'
                  : 'text-[#77736D] hover:text-[#171717] hover:bg-[#FAF8F4]'
              )}
            >
              <Layers size={13} /> Flashcards
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('planner')}
              className={cn(
                'px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors shrink-0 cursor-pointer flex items-center gap-1.5',
                activeTab === 'planner'
                  ? 'bg-[#171717] text-white shadow-xs'
                  : 'text-[#77736D] hover:text-[#171717] hover:bg-[#FAF8F4]'
              )}
            >
              <Calendar size={13} /> Planner
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('insights');
                if (!insightsData) handleLoadInsights();
              }}
              className={cn(
                'px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors shrink-0 cursor-pointer flex items-center gap-1.5',
                activeTab === 'insights'
                  ? 'bg-[#171717] text-white shadow-xs'
                  : 'text-[#77736D] hover:text-[#171717] hover:bg-[#FAF8F4]'
              )}
            >
              <Activity size={13} /> Insights
            </button>
          </div>

          {/* TAB 1: Conversational AI Tutor */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Context Toolbar */}
              <div className="px-3.5 py-2 border-b border-[#E7E2DA]/60 bg-[#FAF8F4]/50 flex items-center justify-between gap-2 flex-shrink-0 text-xs">
                {/* Course Selector for Grounded RAG */}
                <div className="flex items-center gap-1.5 min-w-0">
                  <BookOpen size={13} className="text-[#369EFF] shrink-0" />
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="bg-transparent border-0 text-[#171717] font-medium text-xs focus:ring-0 truncate cursor-pointer max-w-[160px] sm:max-w-[200px]"
                  >
                    <option value="">General Academic Tutor</option>
                    {enrolledCourses.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Difficulty Selector */}
                <div className="flex items-center gap-1 shrink-0">
                  {(['beginner', 'intermediate', 'advanced'] as DifficultyLevel[]).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setDifficulty(level)}
                      className={cn(
                        'text-[10px] px-2 py-0.5 rounded capitalize transition-colors cursor-pointer',
                        difficulty === level
                          ? 'bg-[#171717] text-white font-semibold'
                          : 'text-[#77736D] hover:bg-white'
                      )}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
                {messages.map((msg, index) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div
                      key={index}
                      className={cn(
                        'flex gap-2.5 items-start',
                        isUser ? 'justify-end' : 'justify-start'
                      )}
                    >
                      {!isUser && (
                        <div className="w-6 h-6 rounded-full overflow-hidden border border-[#E7E2DA] shrink-0 bg-slate-900 flex items-center justify-center mt-0.5">
                          <img
                            src={VEYRO_AI_MASCOT_ASSET}
                            alt="AI"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <div
                        className={cn(
                          'max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed text-xs sm:text-[13px] break-words whitespace-pre-wrap',
                          isUser
                            ? 'bg-[#171717] text-white rounded-tr-xs shadow-xs'
                            : 'bg-[#FAF8F4] text-[#171717] border border-[#E7E2DA] rounded-tl-xs shadow-2xs'
                        )}
                      >
                        {msg.content}

                        {/* Grounded RAG Citations */}
                        {!isUser && msg.sources && msg.sources.length > 0 && (
                          <div className="mt-2.5 pt-2 border-t border-[#E7E2DA]/60 space-y-1">
                            <span className="text-[10px] font-semibold text-[#77736D] uppercase tracking-wider block">
                              Verified Course Sources
                            </span>
                            {msg.sources.slice(0, 2).map((src, i) => (
                              <div
                                key={i}
                                className="text-[10px] text-[#0066cc] bg-[#369EFF]/10 px-2 py-0.5 rounded flex items-center gap-1 truncate"
                              >
                                <span>📚 {src.courseTitle}</span>
                                {src.lessonTitle && <span>› {src.lessonTitle}</span>}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Provider tag */}
                        {!isUser && msg.provider && msg.provider !== 'system' && (
                          <div className="mt-1.5 flex items-center justify-between text-[9px] text-[#77736D]">
                            <span className="uppercase tracking-wider font-semibold">
                              {msg.provider === 'nvidia' ? 'NVIDIA Mistral Large 4' : 'Groq Fallback'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Thinking / Streaming Indicator */}
                {isThinking && (
                  <div className="flex gap-2.5 items-center text-xs text-[#77736D] animate-pulse">
                    <div className="w-6 h-6 rounded-full overflow-hidden border border-[#E7E2DA] shrink-0 bg-slate-900 flex items-center justify-center">
                      <img src={VEYRO_AI_MASCOT_ASSET} alt="AI" className="w-full h-full object-cover" />
                    </div>
                    <div className="p-2 rounded-xl bg-[#FAF8F4] border border-[#E7E2DA] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#369EFF] animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ff9447] animate-bounce delay-100" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#25d0ab] animate-bounce delay-200" />
                      <span className="text-[11px] font-medium ml-1">Veyro AI is thinking...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Actions Bar */}
              <div className="px-3 py-1.5 border-t border-[#E7E2DA]/80 bg-white flex gap-1.5 overflow-x-auto scrollbar-none flex-shrink-0">
                {[
                  'Explain my current lesson',
                  'Recommend the best course for me',
                  'Summarize my course',
                  'Generate a practice quiz',
                  'Create my study plan',
                  'Help me understand a difficult topic',
                ].map((action, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickAction(action)}
                    className="text-[11px] font-medium text-[#171717] bg-[#FAF8F4] hover:bg-[#F2ECE1] border border-[#E7E2DA] px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Sparkles size={10} className="text-[#369EFF]" />
                    {action}
                  </button>
                ))}
              </div>

              {/* Chat Input Bar */}
              <div className="p-3 border-t border-[#E7E2DA] bg-[#FAF8F4]/80 flex-shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2 bg-white rounded-xl border border-[#E7E2DA] px-3 py-1.5 shadow-2xs focus-within:border-[#171717]/40 transition-colors"
                >
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask anything about your courses, code, or exams..."
                    className="flex-1 bg-transparent border-0 text-xs text-[#171717] placeholder:text-[#77736D] focus:outline-none"
                    disabled={isThinking}
                  />

                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isThinking}
                    aria-label="Send message to Veyro AI"
                    className="p-1.5 rounded-lg bg-[#171717] text-white hover:bg-[#333] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    <Send size={13} />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 2: Practice Quiz Generator */}
          {activeTab === 'quiz' && (
            <div className="flex-1 flex flex-col min-h-0 p-4 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#E7E2DA]">
                <div>
                  <h4 className="text-sm font-bold text-[#171717]">Practice Quiz Generator</h4>
                  <p className="text-[11px] text-[#77736D]">
                    Ungraded knowledge checks to strengthen your mastery.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleStartQuiz}
                  disabled={quizLoading}
                  className="px-3 py-1 text-xs font-semibold rounded-lg bg-[#171717] text-white hover:bg-[#333] transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {quizLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                  {quizQuestions.length > 0 ? 'Regenerate' : 'Create Quiz'}
                </button>
              </div>

              {quizQuestions.length === 0 ? (
                <div className="p-6 text-center space-y-3 bg-[#FAF8F4] rounded-xl border border-[#E7E2DA]">
                  <Award size={32} className="mx-auto text-[#369EFF]" />
                  <p className="text-xs text-[#171717] font-semibold">Generate an AI Practice Quiz</p>
                  <p className="text-[11px] text-[#77736D] max-w-xs mx-auto">
                    Practice questions are generated from verified course curricula and do not affect your official certification scores.
                  </p>
                  <button
                    type="button"
                    onClick={handleStartQuiz}
                    disabled={quizLoading}
                    className="mt-2 px-4 py-2 text-xs font-bold rounded-lg bg-[#171717] text-white hover:bg-[#333] cursor-pointer inline-flex items-center gap-1.5"
                  >
                    {quizLoading ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                    Generate 4 Questions
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {quizQuestions.map((q, qIndex) => {
                    const isSubmitted = !!quizResult;
                    const selectedIdx = quizAnswers[q.id];

                    return (
                      <div
                        key={q.id}
                        className="p-3.5 rounded-xl bg-[#FAF8F4] border border-[#E7E2DA] space-y-2.5 text-xs"
                      >
                        <p className="font-semibold text-[#171717]">
                          {qIndex + 1}. {q.question}
                        </p>

                        <div className="space-y-1.5">
                          {q.options.map((opt, optIndex) => {
                            const isChosen = selectedIdx === optIndex;
                            const isCorrectOpt = q.correctIndex === optIndex;

                            let optStyle =
                              'bg-white text-[#171717] border-[#E7E2DA] hover:border-[#171717]/40';

                            if (isSubmitted) {
                              if (isCorrectOpt) {
                                optStyle = 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold';
                              } else if (isChosen && !isCorrectOpt) {
                                optStyle = 'bg-rose-50 text-rose-800 border-rose-300 line-through';
                              }
                            } else if (isChosen) {
                              optStyle = 'bg-[#171717] text-white border-[#171717] font-semibold';
                            }

                            return (
                              <button
                                key={optIndex}
                                type="button"
                                disabled={isSubmitted}
                                onClick={() =>
                                  setQuizAnswers((prev) => ({ ...prev, [q.id]: optIndex }))
                                }
                                className={cn(
                                  'w-full text-left p-2 rounded-lg border text-xs transition-colors cursor-pointer flex items-center justify-between',
                                  optStyle
                                )}
                              >
                                <span>{opt}</span>
                                {isSubmitted && isCorrectOpt && (
                                  <CheckCircle2 size={13} className="text-emerald-600" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Explanation after submission */}
                        {isSubmitted && (
                          <div className="mt-2 p-2 rounded-lg bg-white border border-[#E7E2DA] text-[11px] text-[#77736D]">
                            <span className="font-semibold text-[#171717] block mb-0.5">Explanation:</span>
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {!quizResult ? (
                    <button
                      type="button"
                      onClick={handleSubmitQuiz}
                      className="w-full py-2.5 rounded-xl bg-[#171717] text-white font-semibold text-xs hover:bg-[#333] transition-colors cursor-pointer shadow-xs"
                    >
                      Submit Practice Quiz
                    </button>
                  ) : (
                    <div className="p-4 rounded-xl bg-white border border-[#E7E2DA] space-y-2 text-center">
                      <div className="text-lg font-bold text-[#171717]">
                        Score: {quizResult.scorePercent}% ({quizResult.correctCount}/{quizResult.totalQuestions})
                      </div>
                      <p className="text-xs text-[#77736D]">{quizResult.summary}</p>
                      <button
                        type="button"
                        onClick={handleStartQuiz}
                        className="mt-2 px-4 py-1.5 rounded-lg bg-[#FAF8F4] border border-[#E7E2DA] text-xs font-semibold hover:bg-white cursor-pointer"
                      >
                        Try Another Practice Quiz
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Flashcards */}
          {activeTab === 'flashcards' && (
            <div className="flex-1 flex flex-col min-h-0 p-4 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#E7E2DA]">
                <div>
                  <h4 className="text-sm font-bold text-[#171717]">Curriculum Flashcards</h4>
                  <p className="text-[11px] text-[#77736D]">Bite-sized revision memory cards.</p>
                </div>
                <button
                  type="button"
                  onClick={handleFetchFlashcards}
                  disabled={flashcardsLoading}
                  className="px-3 py-1 text-xs font-semibold rounded-lg bg-[#FAF8F4] border border-[#E7E2DA] hover:bg-white transition-colors cursor-pointer"
                >
                  {flashcardsLoading ? <Loader2 size={12} className="animate-spin" /> : 'New Deck'}
                </button>
              </div>

              {flashcardsLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center text-xs text-[#77736D] space-y-2">
                  <Loader2 size={24} className="animate-spin text-[#369EFF]" />
                  <p>Synthesizing flashcards from course material...</p>
                </div>
              ) : flashcards.length === 0 ? (
                <div className="p-6 text-center space-y-3 bg-[#FAF8F4] rounded-xl border border-[#E7E2DA]">
                  <Layers size={32} className="mx-auto text-[#ff9447]" />
                  <p className="text-xs font-semibold text-[#171717]">No active deck loaded</p>
                  <button
                    type="button"
                    onClick={handleFetchFlashcards}
                    className="px-4 py-2 text-xs font-bold rounded-lg bg-[#171717] text-white hover:bg-[#333] cursor-pointer"
                  >
                    Generate Flashcards
                  </button>
                </div>
              ) : (
                <div className="flex-1 flex flex-col justify-between space-y-4">
                  {/* Flip Card Container */}
                  <div
                    onClick={() => setIsCardFlipped((prev) => !prev)}
                    className="flex-1 min-h-[220px] rounded-2xl bg-[#FAF8F4] border border-[#E7E2DA] p-6 shadow-xs flex flex-col justify-between cursor-pointer hover:border-[#171717]/40 transition-all select-none"
                  >
                    <div className="flex items-center justify-between text-[10px] text-[#77736D] uppercase font-semibold">
                      <span>Card {currentCardIndex + 1} of {flashcards.length}</span>
                      <span>{isCardFlipped ? 'Answer (Click to flip)' : 'Question (Click to flip)'}</span>
                    </div>

                    <div className="my-auto text-center py-4">
                      {isCardFlipped ? (
                        <p className="text-xs sm:text-sm font-normal text-[#171717] leading-relaxed">
                          {flashcards[currentCardIndex]?.back}
                        </p>
                      ) : (
                        <h5 className="text-sm sm:text-base font-bold text-[#171717]">
                          {flashcards[currentCardIndex]?.front}
                        </h5>
                      )}
                    </div>

                    <div className="text-center text-[10px] text-[#0066cc]">
                      {flashcards[currentCardIndex]?.source && (
                        <span>Ref: {flashcards[currentCardIndex].source}</span>
                      )}
                    </div>
                  </div>

                  {/* Navigation controls */}
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      disabled={currentCardIndex === 0}
                      onClick={() => {
                        setIsCardFlipped(false);
                        setCurrentCardIndex((i) => Math.max(0, i - 1));
                      }}
                      className="px-3 py-1.5 rounded-lg border border-[#E7E2DA] bg-white text-xs font-semibold disabled:opacity-40 cursor-pointer flex items-center gap-1"
                    >
                      <ChevronLeft size={14} /> Previous
                    </button>

                    <span className="text-xs font-semibold text-[#77736D]">
                      {currentCardIndex + 1} / {flashcards.length}
                    </span>

                    <button
                      type="button"
                      disabled={currentCardIndex === flashcards.length - 1}
                      onClick={() => {
                        setIsCardFlipped(false);
                        setCurrentCardIndex((i) => Math.min(flashcards.length - 1, i + 1));
                      }}
                      className="px-3 py-1.5 rounded-lg border border-[#E7E2DA] bg-white text-xs font-semibold disabled:opacity-40 cursor-pointer flex items-center gap-1"
                    >
                      Next <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Study Planner */}
          {activeTab === 'planner' && (
            <div className="flex-1 flex flex-col min-h-0 p-4 overflow-y-auto space-y-4 text-xs">
              <div className="pb-2 border-b border-[#E7E2DA]">
                <h4 className="text-sm font-bold text-[#171717]">Personalized Study Planner</h4>
                <p className="text-[11px] text-[#77736D]">
                  Custom scheduling based on your active enrollments and daily capacity.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF8F4] border border-[#E7E2DA] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#171717]">Daily Study Availability:</span>
                  <div className="flex items-center gap-1">
                    {[1, 1.5, 2, 3].map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setStudyPlanHours(h)}
                        className={cn(
                          'px-2 py-0.5 rounded text-xs transition-colors cursor-pointer',
                          studyPlanHours === h
                            ? 'bg-[#171717] text-white font-bold'
                            : 'bg-white border border-[#E7E2DA] text-[#77736D]'
                        )}
                      >
                        {h}h
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateStudyPlan}
                  disabled={studyPlanLoading}
                  className="w-full py-2 rounded-lg bg-[#171717] text-white font-bold hover:bg-[#333] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {studyPlanLoading ? <Loader2 size={13} className="animate-spin" /> : <Calendar size={13} />}
                  Generate Study Schedule
                </button>
              </div>

              {studyPlanResult && (
                <div className="p-3.5 rounded-xl bg-white border border-[#E7E2DA] leading-relaxed whitespace-pre-wrap text-[12px] text-[#171717]">
                  {studyPlanResult}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Learning Insights */}
          {activeTab === 'insights' && (
            <div className="flex-1 flex flex-col min-h-0 p-4 overflow-y-auto space-y-4 text-xs">
              <div className="pb-2 border-b border-[#E7E2DA] flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-[#171717]">Learning Insights & Gaps</h4>
                  <p className="text-[11px] text-[#77736D]">
                    Real-time diagnostics from your watch time and quiz scores.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleLoadInsights}
                  disabled={insightsLoading}
                  className="px-2.5 py-1 rounded-lg border border-[#E7E2DA] bg-white hover:bg-[#FAF8F4] text-xs font-semibold cursor-pointer"
                >
                  {insightsLoading ? <Loader2 size={12} className="animate-spin" /> : 'Refresh'}
                </button>
              </div>

              {insightsLoading ? (
                <div className="p-8 text-center space-y-2 text-[#77736D]">
                  <Loader2 size={24} className="animate-spin text-[#369EFF] mx-auto" />
                  <p>Analyzing progress records and assessment performance...</p>
                </div>
              ) : insightsData ? (
                <div className="space-y-3.5">
                  {/* Metric Chips */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2.5 rounded-xl bg-[#FAF8F4] border border-[#E7E2DA] text-center">
                      <span className="text-[10px] text-[#77736D] uppercase block">Active</span>
                      <span className="text-base font-bold text-[#171717]">
                        {insightsData.metrics?.activeCourses ?? 0}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#FAF8F4] border border-[#E7E2DA] text-center">
                      <span className="text-[10px] text-[#77736D] uppercase block">Lessons</span>
                      <span className="text-base font-bold text-emerald-600">
                        {insightsData.metrics?.completedLessons ?? 0}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#FAF8F4] border border-[#E7E2DA] text-center">
                      <span className="text-[10px] text-[#77736D] uppercase block">Avg Quiz</span>
                      <span className="text-base font-bold text-[#0066cc]">
                        {insightsData.metrics?.averageQuizScore !== null
                          ? `${insightsData.metrics.averageQuizScore}%`
                          : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* AI Diagnostic Narrative */}
                  <div className="p-3.5 rounded-xl bg-white border border-[#E7E2DA] leading-relaxed whitespace-pre-wrap text-[12px] text-[#171717]">
                    {insightsData.narrative}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      )}

      {/* Floating Pill Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label="Veyro AI learning companion"
        className={cn(
          'pointer-events-auto group inline-flex items-center gap-2.5',
          'px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full',
          'bg-white/95 backdrop-blur-md border border-[#E7E2DA]',
          'shadow-[0_4px_20px_rgba(23,23,23,0.08)] hover:shadow-[0_8px_28px_rgba(23,23,23,0.14)]',
          'hover:border-[#171717]/25 hover:-translate-y-0.5',
          'active:translate-y-0 active:scale-95',
          'transition-all duration-200 ease-out cursor-pointer',
          isOpen && 'ring-2 ring-[#171717]/10 border-[#171717]/30 bg-white'
        )}
      >
        {/* Mascot Avatar with Preserved Original Aspect Ratio */}
        <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-slate-900 border border-slate-200/80 shadow-xs shrink-0 flex items-center justify-center">
          <img
            src={VEYRO_AI_MASCOT_ASSET}
            alt="Veyro AI 3D mascot"
            className="w-full h-full object-cover object-center select-none"
            loading="eager"
            draggable={false}
          />
        </div>

        {/* Text Label Beside Mascot */}
        <span className="font-sans font-semibold text-xs sm:text-sm text-[#171717] tracking-tight">
          Veyro AI
        </span>

        {/* Subtle Accent Sparkle */}
        <Sparkles
          size={14}
          className="text-[#369EFF] group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300 shrink-0"
        />
      </button>
    </div>,
    document.body
  );
}
