import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronRight,
  Award,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  History,
  X,
  Calendar,
  RefreshCw,
  Trophy,
} from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

/** Formats seconds as MM:SS */
const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

export default function QuizPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [phase, setPhase] = useState('loading'); // loading | ready | taking | submitted | result
  const [result, setResult] = useState(null);
  const [violations, setViolations] = useState(0);
  const timerRef = useRef(null);
  const attemptRef = useRef(null);

  // Attempt history state
  const [historyOpen, setHistoryOpen] = useState(false);
  const [pastAttempts, setPastAttempts] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);

  // Fetch past attempts for the current student
  const fetchAttempts = async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const { data } = await api.get(`/quizzes/${quizId}/attempts`);
      setPastAttempts(data.attempts || []);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setHistoryError('Unauthorized. Only enrolled students can view their attempt history.');
      } else {
        setHistoryError(err.response?.data?.error || 'Failed to load attempt history.');
      }
    } finally {
      setHistoryLoading(false);
    }
  };

  const openHistory = () => {
    setHistoryOpen(true);
    fetchAttempts();
  };

  // Load quiz info & reconnect to active attempt if one was in progress
  useEffect(() => {
    api.get(`/quizzes/${quizId}`)
      .then(async ({ data }) => {
        setQuiz(data.quiz);

        // Fetch past attempts in the background for quick stats display
        api.get(`/quizzes/${quizId}/attempts`)
          .then((attRes) => setPastAttempts(attRes.data.attempts || []))
          .catch(() => {});

        // If the user had an active attempt flag in this browser tab/session,
        // reconnect to it on the server instead of starting anew.
        if (sessionStorage.getItem(`active_quiz_${quizId}`) === 'true') {
          try {
            const startRes = await api.post(`/quizzes/${quizId}/start`);
            setAttempt(startRes.data.attempt);
            attemptRef.current = startRes.data.attempt;
            setAnswers(startRes.data.attempt.answers || new Array(startRes.data.attempt.questionOrder.length).fill(-1));
            setSecondsLeft(startRes.data.secondsRemaining);
            setPhase('taking');
            return;
          } catch {
            sessionStorage.removeItem(`active_quiz_${quizId}`);
          }
        }
        setPhase('ready');
      })
      .catch(() => {
        toast.error('Quiz not found');
        navigate(-1);
      });
  }, [quizId, navigate]);

  /**
   * Tab-switch anti-cheat:
   * Report visibilitychange to server. Server increments violation count
   * and auto-submits if threshold exceeded.
   */
  const reportViolation = useCallback(async () => {
    if (!attemptRef.current || phase !== 'taking') return;
    try {
      const { data } = await api.post(`/quizzes/attempts/${attemptRef.current._id}/violation`);
      setViolations(data.tabViolations || 0);
      if (data.autoSubmitted) {
        sessionStorage.removeItem(`active_quiz_${quizId}`);
        toast.error('Quiz auto-submitted due to tab switching!');
        setPhase('submitted');
        fetchResult(attemptRef.current._id);
      } else {
        toast.error(`⚠ Tab switch detected! ${data.violationsRemaining} warning(s) left.`, { duration: 4000 });
      }
    } catch {}
  }, [phase, quizId]);

  useEffect(() => {
    const onVisChange = () => {
      if (document.hidden) reportViolation();
    };
    document.addEventListener('visibilitychange', onVisChange);
    return () => document.removeEventListener('visibilitychange', onVisChange);
  }, [reportViolation]);

  // Countdown timer
  useEffect(() => {
    if (phase !== 'taking' || secondsLeft <= 0) return;
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const startQuiz = async () => {
    try {
      const { data } = await api.post(`/quizzes/${quizId}/start`);
      sessionStorage.setItem(`active_quiz_${quizId}`, 'true');
      setAttempt(data.attempt);
      attemptRef.current = data.attempt;
      setAnswers(data.attempt.answers || new Array(data.attempt.questionOrder.length).fill(-1));
      setSecondsLeft(data.secondsRemaining);
      setPhase('taking');
    } catch (err) {
      sessionStorage.removeItem(`active_quiz_${quizId}`);
      toast.error(err.response?.data?.error || 'Could not start quiz');
    }
  };

  const selectAnswer = async (qIdx, optIdx) => {
    const updated = [...answers];
    updated[qIdx] = optIdx;
    setAnswers(updated);
    try {
      await api.patch(`/quizzes/attempts/${attempt._id}/answer`, {
        questionIndex: qIdx,
        answerIndex: optIdx,
      });
    } catch {}
  };

  const handleSubmit = async () => {
    clearInterval(timerRef.current);
    sessionStorage.removeItem(`active_quiz_${quizId}`);
    try {
      await api.post(`/quizzes/attempts/${attempt._id}/submit`);
      setPhase('submitted');
      fetchResult(attempt._id);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Submission failed');
    }
  };

  const handleAutoSubmit = async () => {
    sessionStorage.removeItem(`active_quiz_${quizId}`);
    toast.error('Time is up! Submitting answers…');
    try {
      await api.post(`/quizzes/attempts/${attempt._id}/submit`);
    } catch {}
    setPhase('submitted');
    fetchResult(attempt._id);
  };

  const fetchResult = async (attemptId) => {
    try {
      const { data } = await api.get(`/quizzes/${quizId}/results/${attemptId}`);
      setResult(data);
      setPhase('result');
      // Refresh attempts list
      fetchAttempts();
    } catch {}
  };

  // ── Render: Loading ──
  if (phase === 'loading') {
    return (
      <div className="min-h-screen bg-[#FAF7EE] flex items-center justify-center p-6">
        <div className="bg-white rounded-[2.5rem] p-12 max-w-md w-full animate-pulse border border-[#111111]/10 h-72" />
      </div>
    );
  }

  // ── Render: Ready Screen ──
  if (phase === 'ready') {
    const bestScore = pastAttempts.length > 0 ? Math.max(...pastAttempts.map((a) => a.score || 0)) : null;
    const hasPassed = pastAttempts.some((a) => a.passed);

    return (
      <div className="min-h-screen bg-[#FAF7EE] text-slate-900 p-4 sm:p-6 lg:p-8 flex items-center justify-center animate-fade-in selection:bg-[#FFF490] selection:text-[#111111]">
        <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 shadow-xl border border-[#111111]/15 max-w-xl w-full text-center space-y-6">
          
          <div className="w-16 h-16 rounded-3xl bg-[#FFF490] border border-[#111111]/20 text-[#111111] flex items-center justify-center mx-auto shadow-xs">
            <Clock size={32} />
          </div>
          
          <div>
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider mb-3">
              <ShieldCheck size={13} />
              <span>Proctored Assessment</span>
            </div>
            <h1 className="font-syne font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight leading-tight">
              {quiz?.title}
            </h1>
            <div className="flex flex-wrap justify-center gap-2.5 text-xs font-bold text-slate-500 mt-3">
              <span className="bg-[#FAF7EE] border border-[#111111]/10 px-3 py-1 rounded-full">{quiz?.questions?.length || 0} Questions</span>
              <span className="bg-[#FAF7EE] border border-[#111111]/10 px-3 py-1 rounded-full">Time: {fmt(quiz?.timeLimitSeconds || 0)}</span>
              <span className="bg-[#FAF7EE] border border-[#111111]/10 px-3 py-1 rounded-full">Passing: {quiz?.passingScore || 70}%</span>
              {quiz?.maxAttempts && (
                <span className="bg-[#FAF7EE] border border-[#111111]/10 px-3 py-1 rounded-full">Max: {quiz.maxAttempts} Attempts</span>
              )}
            </div>
          </div>

          {/* Past Performance Snapshot */}
          {pastAttempts.length > 0 && (
            <div className="bg-[#FAF7EE] border border-[#111111]/15 rounded-2xl p-4 flex items-center justify-between text-left">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white border border-[#111111]/10 flex items-center justify-center text-slate-800">
                  <Trophy size={18} className={hasPassed ? 'text-emerald-600' : 'text-amber-600'} />
                </div>
                <div>
                  <p className="text-xs font-syne font-bold text-slate-900">
                    {pastAttempts.length} Previous Attempt{pastAttempts.length > 1 ? 's' : ''}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Best Score: <span className="font-bold text-slate-900">{bestScore}%</span> • {hasPassed ? 'Passed' : 'Not yet passed'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={openHistory}
                className="text-xs font-bold underline text-slate-700 hover:text-black flex items-center gap-1"
              >
                <span>View Records</span>
                <ChevronRight size={12} />
              </button>
            </div>
          )}

          {/* Anti-Cheat Proctor Guidelines */}
          <div className="bg-[#FAF7EE] border border-[#111111]/15 rounded-2xl p-5 text-left space-y-2 text-xs text-slate-800">
            <p className="font-syne font-bold flex items-center gap-1.5 text-slate-900 text-sm">
              <AlertTriangle size={15} className="text-amber-600" />
              <span>Anti-Cheat Proctor Guidelines</span>
            </p>
            <ul className="space-y-1.5 list-disc list-inside text-slate-600">
              <li>The timer runs on the server and cannot be paused or manipulated.</li>
              <li>Switching browser tabs or windows triggers warnings and eventual auto-submission.</li>
              <li>Questions and options are randomized for each student attempt.</li>
              <li>Refreshing the page will safely reconnect to your active attempt without starting over.</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5">
            <div className="flex gap-3">
              <button
                onClick={() => navigate(-1)}
                className="flex-1 py-3.5 rounded-full bg-white border border-[#111111]/20 text-slate-800 text-xs font-bold hover:bg-[#FAF7EE] transition-all"
              >
                Back
              </button>
              <button
                onClick={startQuiz}
                className="btn-dark-pill flex-1 py-3.5 text-xs shadow-md"
              >
                <span>Begin Assessment</span>
                <ChevronRight size={14} />
              </button>
            </div>

            <button
              type="button"
              onClick={openHistory}
              className="w-full py-2.5 rounded-full bg-[#FAF7EE] border border-[#111111]/15 text-slate-700 text-xs font-bold hover:bg-slate-100 flex items-center justify-center gap-2 transition-all"
            >
              <History size={14} />
              <span>View Attempt History ({pastAttempts.length})</span>
            </button>
          </div>
        </div>

        {/* History Modal */}
        <AttemptHistoryModal
          isOpen={historyOpen}
          onClose={() => setHistoryOpen(false)}
          attempts={pastAttempts}
          isLoading={historyLoading}
          error={historyError}
          onRetry={fetchAttempts}
          passingScore={quiz?.passingScore || 70}
          quizTitle={quiz?.title}
        />
      </div>
    );
  }

  // ── Render: Taking Assessment ──
  if (phase === 'taking' && attempt) {
    const qi = attempt.questionOrder[currentQ];
    const question = quiz?.questions?.[qi];
    const optOrder = attempt.optionOrders[currentQ];
    const timerColor = secondsLeft < 60 ? 'text-rose-600 bg-rose-50 border-rose-200' : 'text-slate-900 bg-[#FAF7EE] border-[#111111]/15';

    return (
      <div className="min-h-screen bg-[#FAF7EE] text-slate-900 p-4 sm:p-6 lg:p-8 animate-fade-in selection:bg-[#FFF490] selection:text-[#111111]">
        <div className="max-w-3xl mx-auto space-y-6">
          
          {/* Top Proctor Bar */}
          <div className="bg-white rounded-[2rem] p-4 sm:p-5 shadow-xs border border-[#111111]/15 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-syne">
              Question {currentQ + 1} of {attempt.questionOrder.length}
            </span>
            
            <div className={`flex items-center gap-1.5 font-mono text-base font-extrabold px-4 py-1.5 rounded-full border ${timerColor}`}>
              <Clock size={16} />
              <span>{fmt(secondsLeft)}</span>
            </div>

            {violations > 0 && (
              <span className="flex items-center gap-1 text-xs font-bold text-amber-900 bg-[#FFF490] border border-[#111111]/20 px-3 py-1 rounded-full">
                <AlertTriangle size={13} />
                <span>{violations} warning{violations > 1 ? 's' : ''}</span>
              </span>
            )}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
            <div
              className="bg-[#111111] h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQ + 1) / attempt.questionOrder.length) * 100}%` }}
            />
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 shadow-xs border border-[#111111]/15 space-y-6">
            <h2 className="font-syne font-bold text-slate-900 text-lg sm:text-xl leading-snug">
              {question?.questionText}
            </h2>

            <div className="space-y-3">
              {optOrder?.map((oi, displayIdx) => {
                const isSelected = answers[currentQ] === displayIdx;
                return (
                  <button
                    key={displayIdx}
                    onClick={() => selectAnswer(currentQ, displayIdx)}
                    className={`w-full text-left px-5 py-4 rounded-2xl border text-sm font-semibold transition-all flex items-center gap-3.5 ${
                      isSelected
                        ? 'border-[#111111] bg-[#FAF7EE] text-slate-950 shadow-xs'
                        : 'border-[#111111]/15 text-slate-700 hover:bg-[#FAF7EE] hover:border-[#111111]/30'
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-extrabold font-syne flex-shrink-0 ${
                      isSelected ? 'bg-[#111111] text-white' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {String.fromCharCode(65 + displayIdx)}
                    </span>
                    <span className="leading-snug">{question?.options[oi]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-between items-center gap-4">
            <button
              disabled={currentQ === 0}
              onClick={() => setCurrentQ((q) => q - 1)}
              className="px-5 py-2.5 rounded-full bg-white border border-[#111111]/20 text-slate-700 text-xs font-bold hover:bg-[#FAF7EE] transition-all disabled:opacity-30 disabled:pointer-events-none shadow-2xs"
            >
              ← Previous Question
            </button>

            {currentQ < attempt.questionOrder.length - 1 ? (
              <button
                onClick={() => setCurrentQ((q) => q + 1)}
                className="btn-dark-pill px-6 py-2.5 text-xs shadow-md"
              >
                <span>Next Question</span>
                <ChevronRight size={14} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 active:scale-95"
              >
                <span>Submit Final Assessment</span>
                <CheckCircle size={14} />
              </button>
            )}
          </div>

        </div>
      </div>
    );
  }

  // ── Render: Assessment Results ──
  if (phase === 'result' && result) {
    const passed = result.attempt.passed;
    return (
      <div className="min-h-screen bg-[#FAF7EE] text-slate-900 p-4 sm:p-6 lg:p-8 animate-slide-up selection:bg-[#FFF490] selection:text-[#111111]">
        <div className="max-w-2xl mx-auto space-y-6">
          
          {/* Result Score Card */}
          <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 text-center shadow-xl border border-[#111111]/15 space-y-4">
            <div className={`w-16 h-16 rounded-3xl mx-auto flex items-center justify-center border shadow-xs ${
              passed
                ? 'bg-[#d4f4dd] border-emerald-300 text-emerald-800'
                : 'bg-rose-100 border-rose-300 text-rose-800'
            }`}>
              {passed ? <CheckCircle size={36} /> : <XCircle size={36} />}
            </div>

            <h1 className="font-syne font-extrabold text-5xl text-slate-900">{result.attempt.score}%</h1>
            
            <div>
              <p className={`text-base font-extrabold ${passed ? 'text-emerald-800' : 'text-rose-700'}`}>
                {passed ? '🎉 Congratulations! Assessment Passed' : 'Assessment Score Below Passing Standard'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Passing standard required: {quiz?.passingScore || 70}%
              </p>
            </div>

            {result.attempt.autoSubmitted && (
              <p className="text-amber-900 text-xs font-bold bg-[#FFF490] border border-[#111111]/20 px-3 py-1 rounded-full w-fit mx-auto">
                Auto-submitted ({result.attempt.autoSubmitReason})
              </p>
            )}
          </div>

          {/* Question Breakdown */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-syne">
              Question Review & Answers
            </h2>
            
            <div className="space-y-3">
              {result.review?.map((r, i) => (
                <div
                  key={i}
                  className={`bg-white rounded-3xl p-5 sm:p-6 border shadow-2xs space-y-3 ${
                    r.correct ? 'border-emerald-300' : 'border-rose-300'
                  }`}
                >
                  <p className="font-syne font-bold text-slate-900 text-sm">{i + 1}. {r.questionText}</p>
                  <div className="space-y-2">
                    {r.options?.map((opt, oi) => (
                      <div
                        key={oi}
                        className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between ${
                          oi === r.correctOption ? 'bg-[#d4f4dd] text-emerald-950 font-bold border border-emerald-200' :
                          oi === r.studentAnswer && !r.correct ? 'bg-rose-100 text-rose-950 border border-rose-200' : 'bg-slate-50 text-slate-600'
                        }`}
                      >
                        <span>{String.fromCharCode(65 + oi)}. {opt}</span>
                        {oi === r.correctOption && <span className="font-bold text-emerald-800">✓ Correct Answer</span>}
                        {oi === r.studentAnswer && !r.correct && <span className="font-bold text-rose-700">✗ Your Choice</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Links */}
          <div className="space-y-3 pt-2">
            <div className="flex gap-3">
              <button
                onClick={() => navigate(-1)}
                className="flex-1 py-3.5 rounded-full bg-white border border-[#111111]/20 text-slate-800 text-xs font-bold hover:bg-[#FAF7EE] transition-all shadow-xs"
              >
                ← Return to Curriculum
              </button>
              <button
                onClick={() => {
                  setPhase('ready');
                  setResult(null);
                  setAttempt(null);
                }}
                className="btn-dark-pill flex-1 py-3.5 text-xs shadow-md"
              >
                <RotateCcw size={14} />
                <span>Retake Assessment</span>
              </button>
            </div>

            <button
              type="button"
              onClick={openHistory}
              className="w-full py-3 rounded-full bg-white border border-[#111111]/20 text-slate-800 text-xs font-bold hover:bg-[#FAF7EE] transition-all flex items-center justify-center gap-2 shadow-2xs"
            >
              <History size={14} />
              <span>View All Past Attempt Records</span>
            </button>
          </div>

        </div>

        {/* History Modal */}
        <AttemptHistoryModal
          isOpen={historyOpen}
          onClose={() => setHistoryOpen(false)}
          attempts={pastAttempts}
          isLoading={historyLoading}
          error={historyError}
          onRetry={fetchAttempts}
          passingScore={quiz?.passingScore || 70}
          quizTitle={quiz?.title}
        />
      </div>
    );
  }

  return null;
}

/**
 * Polished Attempt History Drawer / Modal Component
 */
function AttemptHistoryModal({
  isOpen,
  onClose,
  attempts,
  isLoading,
  error,
  onRetry,
  passingScore,
  quizTitle,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-white rounded-[2.5rem] border border-[#111111]/15 shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#111111]/10 flex items-center justify-between bg-[#FAF7EE]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF490] border border-[#111111]/15 flex items-center justify-center text-[#111111] shadow-2xs">
              <History size={18} />
            </div>
            <div>
              <h2 className="font-syne font-bold text-base text-slate-900">
                Attempt History
              </h2>
              <p className="text-[11px] text-slate-500 line-clamp-1">
                {quizTitle || 'Assessment Records'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-[#111111]/15 flex items-center justify-center text-slate-500 hover:text-black hover:bg-slate-100 transition-colors"
            title="Close"
          >
            <X size={15} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {isLoading ? (
            <div className="py-12 text-center space-y-3">
              <RefreshCw size={24} className="animate-spin text-slate-400 mx-auto" />
              <p className="text-xs text-slate-500 font-medium">Loading your attempt records…</p>
            </div>
          ) : error ? (
            <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-3">
              <AlertTriangle size={24} className="text-rose-600 mx-auto" />
              <p className="text-xs font-semibold text-rose-800">{error}</p>
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="px-4 py-1.5 rounded-full bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-all inline-flex items-center gap-1.5"
                >
                  <RefreshCw size={12} />
                  <span>Retry</span>
                </button>
              )}
            </div>
          ) : attempts.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF7EE] border border-[#111111]/10 flex items-center justify-center text-slate-400 mx-auto">
                <Sparkles size={20} />
              </div>
              <p className="font-syne font-bold text-sm text-slate-800">No Attempts Recorded</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                You haven&apos;t taken this assessment yet. Begin the assessment to record your verified test results.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Summary Stats Pill */}
              <div className="grid grid-cols-3 gap-2 pb-2">
                <div className="bg-[#FAF7EE] border border-[#111111]/10 rounded-2xl p-2.5 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Total</span>
                  <span className="font-syne font-bold text-base text-slate-900">{attempts.length}</span>
                </div>
                <div className="bg-[#FAF7EE] border border-[#111111]/10 rounded-2xl p-2.5 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Best</span>
                  <span className="font-syne font-bold text-base text-emerald-800">
                    {Math.max(...attempts.map((a) => a.score || 0))}%
                  </span>
                </div>
                <div className="bg-[#FAF7EE] border border-[#111111]/10 rounded-2xl p-2.5 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Required</span>
                  <span className="font-syne font-bold text-base text-slate-900">{passingScore}%</span>
                </div>
              </div>

              {/* Attempts List */}
              {attempts.map((att, idx) => {
                const attemptNum = attempts.length - idx;
                const isPassed = att.passed;
                const dateStr = att.submittedAt
                  ? new Date(att.submittedAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'In Progress';

                return (
                  <div
                    key={att._id || idx}
                    className="p-4 rounded-2xl border border-[#111111]/10 bg-[#FAF7EE]/50 hover:bg-[#FAF7EE] transition-all space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-syne font-bold text-xs uppercase tracking-wider text-slate-900">
                          Attempt #{attemptNum}
                        </span>
                        {att.autoSubmitted && (
                          <span className="text-[10px] font-bold bg-[#FFF490] text-amber-900 border border-[#111111]/15 px-2 py-0.5 rounded-full">
                            Auto-submitted
                          </span>
                        )}
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                          isPassed
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : 'bg-rose-100 text-rose-900 border-rose-300'
                        }`}
                      >
                        {isPassed ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        <span>{isPassed ? 'Passed' : 'Failed'}</span>
                      </span>
                    </div>

                    <div className="flex items-end justify-between pt-1">
                      <div className="space-y-0.5">
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                          <Calendar size={12} />
                          <span>{dateStr}</span>
                        </p>
                        {att.tabViolations > 0 && (
                          <p className="text-[10px] text-amber-800 font-semibold">
                            {att.tabViolations} tab warning{att.tabViolations > 1 ? 's' : ''} detected
                          </p>
                        )}
                      </div>

                      <div className="text-right">
                        <span className="text-2xl font-syne font-black text-slate-900">
                          {att.score ?? 0}%
                        </span>
                        <span className="text-[10px] text-slate-500 block font-medium">
                          Score achieved
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#111111]/10 bg-[#FAF7EE]/60 flex justify-end">
          <button
            onClick={onClose}
            className="btn-dark-pill text-xs px-5 py-2.5"
          >
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
}
