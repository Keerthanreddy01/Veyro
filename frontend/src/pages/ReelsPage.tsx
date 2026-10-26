import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  ChevronUp,
  ChevronDown,
  CheckCircle,
  XCircle,
  HelpCircle,
  BookOpen,
  ArrowRight,
  Sparkles,
  Layers,
  Award,
  Clock,
  RotateCcw,
  Check,
  Eye,
  Loader2,
  Compass,
  FileText,
  User,
} from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import type { Reel } from '../types/course';
import { formatCourseTitle } from '../utils/courseFormatters';

export default function ReelsPage() {
  const navigate = useNavigate();
  const [reels, setReels] = useState<Reel[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isNarrating, setIsNarrating] = useState(false);
  const [showTakeaways, setShowTakeaways] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState<{ correct: boolean; explanation: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'unwatched' | 'quizzes'>('all');

  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [progressSeconds, setProgressSeconds] = useState(0);

  // Fetch reel feed
  const fetchFeed = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/reels/feed');
      setReels(data.feed || []);
      setCurrentIndex(0);
    } catch (err: any) {
      toast.error('Could not load learning reels feed.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const currentReel = reels[currentIndex] || null;

  // Reset reel state when currentReel changes
  useEffect(() => {
    if (!currentReel) return;

    // Reset interaction state
    setProgressSeconds(0);
    setIsPlaying(true);
    setShowTakeaways(false);

    if (currentReel.progress?.quizAnswered && currentReel.quickQuestion) {
      setSelectedAnswer(currentReel.progress.selectedOptionIndex ?? null);
      setQuizSubmitted(true);
      setQuizResult({
        correct: currentReel.progress.quizCorrect,
        explanation: currentReel.quickQuestion.explanation || '',
      });
    } else {
      setSelectedAnswer(null);
      setQuizSubmitted(false);
      setQuizResult(null);
    }

    // Stop previous narration if any
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsNarrating(false);
    }

    // Automatically record view
    api.post(`/reels/${currentReel._id}/progress`, { watchedSeconds: 1 }).catch(() => {});
  }, [currentIndex, currentReel]);

  // Video playback / simulated seconds ticker
  useEffect(() => {
    if (!isPlaying || !currentReel) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setProgressSeconds((prev) => {
        const next = prev + 1;
        const totalDuration = currentReel.durationSeconds || 60;

        // Auto mark complete when reaching full duration
        if (next >= totalDuration) {
          api.post(`/reels/${currentReel._id}/progress`, {
            watchedSeconds: totalDuration,
            completed: true,
          }).catch(() => {});
          return totalDuration;
        }
        return next;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentReel]);

  // Web Speech API Narration
  const toggleNarration = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      toast.error('Speech narration is not supported on this browser.');
      return;
    }

    if (isNarrating) {
      window.speechSynthesis.cancel();
      setIsNarrating(false);
    } else if (currentReel) {
      window.speechSynthesis.cancel();
      const textToRead = `${currentReel.script.hook}. ${currentReel.script.sections
        .map((s) => s.body)
        .join(' ')}. ${currentReel.script.summary}`;

      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;

      utterance.onend = () => setIsNarrating(false);
      utterance.onerror = () => setIsNarrating(false);

      speechSynthRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setIsNarrating(true);
      toast.success('Voice narration started');
    }
  };

  const handleNext = () => {
    if (currentIndex < reels.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      toast('You caught up with all available reels!');
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'j') {
        handleNext();
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        handlePrev();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, reels.length]);

  // Quick knowledge-check answer selection
  const handleSelectAnswer = async (optIdx: number) => {
    if (quizSubmitted || !currentReel || !currentReel.quickQuestion) return;

    setSelectedAnswer(optIdx);
    setQuizSubmitted(true);

    try {
      const { data } = await api.post(`/reels/${currentReel._id}/progress`, {
        watchedSeconds: progressSeconds,
        selectedOptionIndex: optIdx,
      });

      if (data.quizResult) {
        setQuizResult(data.quizResult);
        if (data.quizResult.correct) {
          toast.success('Correct answer! Knowledge check passed.');
        } else {
          toast.error('Incorrect. Review the explanation below.');
        }
      }
    } catch {
      toast.error('Failed to submit response.');
    }
  };

  // Filter reels based on user tab
  const filteredReels = reels.filter((r) => {
    if (activeTab === 'unwatched') return !r.progress?.completed;
    if (activeTab === 'quizzes') return r.quickQuestion && !r.progress?.quizCorrect;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center p-6 text-white font-sans">
        <Loader2 size={32} className="animate-spin text-[#A99B8A] mb-3" />
        <p className="text-sm text-zinc-400 font-medium">Assembling personalized concept reels...</p>
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAF8F4] flex flex-col items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[#E7E2DA] p-8 text-center space-y-4 shadow-subtle">
          <div className="w-14 h-14 rounded-2xl bg-[#F6F2EC] border border-[#E7E2DA] flex items-center justify-center mx-auto text-[#171717]">
            <Sparkles size={26} className="text-[#6F8FA8]" />
          </div>
          <h2 className="font-serif text-2xl text-[#171717]">No Learning Reels Available</h2>
          <p className="text-xs sm:text-sm text-[#77736D] leading-relaxed">
            Instructors generate AI Learning Reels from their course lessons. Enroll in courses to receive tailored concept reels in your feed.
          </p>
          <div className="pt-2">
            <Link to="/courses">
              <Button variant="primary" leftIcon={<Compass size={14} />}>
                Explore Curricula
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const duration = currentReel?.durationSeconds || 60;
  const progressPercent = Math.min(100, Math.round((progressSeconds / duration) * 100));
  const course = currentReel ? (currentReel.courseId as any) : null;
  const lesson = currentReel ? (currentReel.lessonId as any) : null;

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white flex flex-col items-center justify-center py-4 px-2 sm:px-4 font-sans select-none overflow-hidden">
      
      {/* ── Top Header Controls ────────────────────────────────────────── */}
      <div className="w-full max-w-md flex items-center justify-between px-3 py-2 mb-2 text-xs text-zinc-400">
        <Link
          to="/dashboard"
          className="hover:text-white transition-colors flex items-center gap-1.5 font-medium"
        >
          <BookOpen size={14} />
          <span>Dashboard</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="font-mono text-zinc-500 text-[11px]">
            {currentIndex + 1} / {reels.length}
          </span>
          <Badge variant="verified" className="text-[10px] bg-zinc-800 text-zinc-300 border-zinc-700">
            LearnVerse Reel
          </Badge>
        </div>
      </div>

      {/* ── Main Reel Viewport Card (Mobile Vertical Ratio) ────────────── */}
      <div className="relative w-full max-w-md h-[78vh] sm:h-[82vh] max-h-[820px] rounded-3xl overflow-hidden bg-gradient-to-b from-zinc-900 via-black to-zinc-950 border border-zinc-800 shadow-2xl flex flex-col justify-between">
        
        {/* Top Progress Bar */}
        <div className="w-full bg-zinc-800 h-1.5 overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-300 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Top Floating Overlay (Course & Lesson context) */}
        <div className="p-4 sm:p-5 bg-gradient-to-b from-black/80 via-black/30 to-transparent flex items-start justify-between gap-3 z-20">
          <div className="space-y-1 max-w-[80%]">
            <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
              {course?.title ? formatCourseTitle(course.title) : 'Curriculum Concept'}
            </span>
            <h2 className="font-serif text-lg sm:text-xl text-white font-medium leading-snug line-clamp-2">
              {currentReel?.title}
            </h2>
            {lesson?.title && (
              <p className="text-xs text-zinc-400 flex items-center gap-1">
                <FileText size={12} className="text-[#A99B8A]" />
                <span className="truncate">Source Unit: {lesson.title}</span>
              </p>
            )}
          </div>

          {/* Audio Narration Toggle */}
          <button
            onClick={toggleNarration}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              isNarrating
                ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/30'
                : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 border border-zinc-700'
            }`}
            title={isNarrating ? 'Pause Voice Narration' : 'Play Voice Narration (TTS)'}
          >
            {isNarrating ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>

        {/* Center Content Viewport (Script & Interactive Cards) */}
        <div className="flex-1 px-5 py-2 overflow-y-auto z-10 flex flex-col justify-center space-y-4">
          
          {/* Concept Hook Card */}
          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-md space-y-2">
            <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold">
              <Sparkles size={14} />
              <span>Core Takeaway Hook</span>
            </div>
            <p className="text-sm sm:text-base text-zinc-100 font-serif leading-relaxed italic">
              "{currentReel?.script.hook}"
            </p>
          </div>

          {/* Sections Concept Slider / Carousel */}
          <div className="space-y-2.5">
            {currentReel?.script.sections.map((sec, sIdx) => (
              <div
                key={sIdx}
                className="p-3.5 rounded-xl bg-black/40 border border-zinc-800/60 backdrop-blur-sm space-y-1"
              >
                {sec.heading && (
                  <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    {sec.heading}
                  </p>
                )}
                <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-sans">
                  {sec.body}
                </p>
              </div>
            ))}
          </div>

          {/* Interactive Knowledge-Check Question */}
          {currentReel?.quickQuestion && (
            <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-700 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <HelpCircle size={14} /> Quick Knowledge Check
                </span>
                {quizSubmitted && (
                  <Badge variant={quizResult?.correct ? 'published' : 'rejected'} className="text-[10px]">
                    {quizResult?.correct ? 'Passed' : 'Needs Review'}
                  </Badge>
                )}
              </div>

              <p className="text-xs sm:text-sm font-semibold text-white leading-snug">
                {currentReel.quickQuestion.questionText}
              </p>

              {/* Options */}
              <div className="space-y-2">
                {currentReel.quickQuestion.options.map((opt, oIdx) => {
                  const isSelected = selectedAnswer === oIdx;
                  let btnColor = 'bg-zinc-800 text-zinc-200 border-zinc-700 hover:bg-zinc-750';

                  if (quizSubmitted) {
                    if (oIdx === currentReel.quickQuestion?.correctOptionIndex) {
                      btnColor = 'bg-emerald-950/80 text-emerald-200 border-emerald-500 font-medium';
                    } else if (isSelected && !quizResult?.correct) {
                      btnColor = 'bg-rose-950/80 text-rose-200 border-rose-500';
                    }
                  } else if (isSelected) {
                    btnColor = 'bg-white text-black border-white';
                  }

                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelectAnswer(oIdx)}
                      disabled={quizSubmitted}
                      className={`w-full p-2.5 rounded-xl text-left text-xs transition-all border flex items-center justify-between cursor-pointer ${btnColor}`}
                    >
                      <span>{opt}</span>
                      {quizSubmitted && oIdx === currentReel.quickQuestion?.correctOptionIndex && (
                        <Check size={14} className="text-emerald-400 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Instant Explanation */}
              {quizSubmitted && quizResult && (
                <div className="p-3 rounded-xl bg-black/60 border border-zinc-700/60 text-xs text-zinc-300 space-y-1">
                  <p className="font-semibold text-white">Why this matters:</p>
                  <p className="text-[11px] leading-relaxed text-zinc-300">
                    {quizResult.explanation}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Key Takeaways Drawer */}
          {showTakeaways && currentReel?.takeaways && (
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-700 space-y-2 animate-fade-in text-xs">
              <p className="font-semibold text-white flex items-center gap-1.5">
                <Award size={13} className="text-amber-400" /> Key Concept Takeaways:
              </p>
              <ul className="space-y-1.5 list-disc pl-4 text-zinc-300">
                {currentReel.takeaways.map((point, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Bottom Bar Actions */}
        <div className="p-4 bg-gradient-to-t from-black via-black/80 to-transparent flex items-center justify-between gap-3 z-20">
          <div className="flex items-center gap-2">
            {/* Play/Pause Button */}
            <button
              onClick={() => setIsPlaying((p) => !p)}
              className="w-9 h-9 rounded-full bg-zinc-800 text-white flex items-center justify-center border border-zinc-700 hover:bg-zinc-700 transition-colors cursor-pointer"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            </button>

            {/* Takeaways Toggle */}
            <button
              onClick={() => setShowTakeaways((s) => !s)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                showTakeaways
                  ? 'bg-white text-black border-white'
                  : 'bg-zinc-800/80 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
              }`}
            >
              Takeaways
            </button>
          </div>

          {/* Jump to Full Lesson Button */}
          {lesson?._id && (
            <Link to={`/lessons/${lesson._id}`}>
              <Button
                variant="secondary"
                size="sm"
                className="bg-white text-black hover:bg-zinc-200 border-0 text-xs py-1.5"
                rightIcon={<ArrowRight size={13} />}
              >
                Study Lesson
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* ── Outside Navigation Controls (Next / Prev buttons) ───────────── */}
      <div className="flex items-center gap-3 mt-3">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all cursor-pointer"
          title="Previous Reel (Up Arrow)"
        >
          <ChevronUp size={20} />
        </button>

        <span className="text-xs text-zinc-400 font-mono">
          Reel {currentIndex + 1} of {reels.length}
        </span>

        <button
          onClick={handleNext}
          disabled={currentIndex === reels.length - 1}
          className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all cursor-pointer"
          title="Next Reel (Down Arrow)"
        >
          <ChevronDown size={20} />
        </button>
      </div>

    </div>
  );
}
