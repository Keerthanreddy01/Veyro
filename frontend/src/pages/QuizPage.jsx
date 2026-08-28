import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, AlertTriangle, CheckCircle, XCircle, ChevronRight, Award } from 'lucide-react';
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

  // Load quiz info
  useEffect(() => {
    api.get(`/quizzes/${quizId}`)
      .then(({ data }) => { setQuiz(data.quiz); setPhase('ready'); })
      .catch(() => { toast.error('Quiz not found'); navigate(-1); });
  }, [quizId]);

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
        toast.error('Quiz auto-submitted due to tab switching!');
        setPhase('submitted');
        fetchResult(attemptRef.current._id);
      } else {
        toast.error(`⚠ Tab switch detected! ${data.violationsRemaining} warning(s) left.`, { duration: 4000 });
      }
    } catch {}
  }, [phase]);

  useEffect(() => {
    const onVisChange = () => { if (document.hidden) reportViolation(); };
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
      setAttempt(data.attempt);
      attemptRef.current = data.attempt;
      setAnswers(data.attempt.answers || new Array(data.attempt.questionOrder.length).fill(-1));
      setSecondsLeft(data.secondsRemaining);
      setPhase('taking');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not start quiz');
    }
  };

  const selectAnswer = async (qIdx, optIdx) => {
    const updated = [...answers];
    updated[qIdx] = optIdx;
    setAnswers(updated);
    // Auto-save to server
    try {
      await api.patch(`/quizzes/attempts/${attempt._id}/answer`, { questionIndex: qIdx, answerIndex: optIdx });
    } catch {}
  };

  const handleSubmit = async () => {
    clearInterval(timerRef.current);
    try {
      const { data } = await api.post(`/quizzes/attempts/${attempt._id}/submit`);
      setPhase('submitted');
      fetchResult(attempt._id);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Submission failed');
    }
  };

  const handleAutoSubmit = async () => {
    toast.error('Time is up! Submitting…');
    try {
      const { data } = await api.post(`/quizzes/attempts/${attempt._id}/submit`);
    } catch {}
    setPhase('submitted');
    fetchResult(attempt._id);
  };

  const fetchResult = async (attemptId) => {
    try {
      const { data } = await api.get(`/quizzes/${quizId}/results/${attemptId}`);
      setResult(data);
      setPhase('result');
    } catch {}
  };

  // ── Render phases ──────────────────────────────────────────────────────────

  if (phase === 'loading') return <div className="max-w-2xl mx-auto p-8"><div className="bg-white rounded-3xl h-64 animate-pulse shadow-sm" /></div>;

  if (phase === 'ready') return (
    <div className="min-h-screen bg-[#f0f4fa] text-slate-800 p-4 sm:p-6 lg:p-8 animate-fade-in flex items-center justify-center">
      <div className="bg-white rounded-[2.5rem] p-8 sm:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-slate-200/80 max-w-xl w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-[#fff3c4] text-amber-700 flex items-center justify-center mx-auto shadow-2xs">
          <Clock size={32} />
        </div>
        
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{quiz?.title}</h1>
          <div className="flex justify-center gap-4 text-xs font-semibold text-slate-500 mt-2">
            <span>{quiz?.questions?.length} Questions</span>
            <span>•</span>
            <span>Time Limit: {fmt(quiz?.timeLimitSeconds || 0)}</span>
            <span>•</span>
            <span>Passing Score: {quiz?.passingScore}%</span>
          </div>
        </div>

        <div className="bg-[#fffdf5] border border-amber-200/80 rounded-2xl p-4 text-left space-y-1.5 text-xs text-amber-950">
          <p className="font-extrabold flex items-center gap-1.5 text-amber-900">
            <AlertTriangle size={14} /> Server-Authoritative Anti-Cheat Rules
          </p>
          <ul className="text-amber-800 space-y-1 list-disc list-inside">
            <li>The timer runs on the server — closing or pausing the tab will not freeze it</li>
            <li>Switching browser tabs or windows is logged; excess violations trigger auto-submit</li>
            <li>Upon timer expiration, your recorded responses are submitted automatically</li>
          </ul>
        </div>

        <button
          onClick={startQuiz}
          className="w-full py-4 rounded-full bg-slate-900 hover:bg-black text-white text-sm font-extrabold shadow-md transition-all active:scale-95"
        >
          Begin Timed Assessment
        </button>
      </div>
    </div>
  );

  if (phase === 'taking' && attempt) {
    const qi = attempt.questionOrder[currentQ];
    const question = quiz.questions[qi];
    const optOrder = attempt.optionOrders[currentQ];
    const timerColor = secondsLeft < 60 ? 'text-rose-600' : secondsLeft < 120 ? 'text-amber-600' : 'text-emerald-700';

    return (
      <div className="min-h-screen bg-[#f0f4fa] text-slate-800 p-4 sm:p-6 lg:p-8 animate-fade-in">
        <div className="max-w-3xl mx-auto space-y-6">
          
          {/* Top Bar */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-slate-200/80 flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              Question {currentQ + 1} of {attempt.questionOrder.length}
            </span>
            
            <div className={`flex items-center gap-1.5 font-mono text-base font-extrabold bg-slate-100 px-3.5 py-1 rounded-full ${timerColor}`}>
              <Clock size={16} /> {fmt(secondsLeft)}
            </div>

            {violations > 0 && (
              <span className="flex items-center gap-1 text-xs font-bold text-amber-800 bg-[#fff3c4] px-3 py-1 rounded-full">
                <AlertTriangle size={13} /> {violations} warning{violations > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQ + 1) / attempt.questionOrder.length) * 100}%` }}
            />
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-slate-200/80 space-y-6">
            <h2 className="text-slate-900 text-lg sm:text-xl font-bold leading-snug">
              {question?.questionText}
            </h2>

            <div className="space-y-3">
              {optOrder?.map((oi, displayIdx) => {
                const isSelected = answers[currentQ] === displayIdx;
                return (
                  <button
                    key={displayIdx}
                    onClick={() => selectAnswer(currentQ, displayIdx)}
                    className={`w-full text-left px-5 py-4 rounded-2xl border-2 text-sm font-semibold transition-all flex items-center gap-3.5 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 shadow-xs'
                        : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold flex-shrink-0 ${
                      isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {String.fromCharCode(65 + displayIdx)}
                    </span>
                    <span>{question?.options[oi]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center gap-4">
            <button
              disabled={currentQ === 0}
              onClick={() => setCurrentQ((q) => q - 1)}
              className="px-5 py-2.5 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-bold shadow-xs hover:bg-slate-100 transition-all disabled:opacity-40 disabled:pointer-events-none"
            >
              ← Previous
            </button>

            {currentQ < attempt.questionOrder.length - 1 ? (
              <button
                onClick={() => setCurrentQ((q) => q + 1)}
                className="px-6 py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold shadow-md hover:bg-black transition-all flex items-center gap-1.5"
              >
                Next <ChevronRight size={14} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-6 py-2.5 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-md hover:bg-emerald-700 transition-all"
              >
                Submit Assessment
              </button>
            )}
          </div>

        </div>
      </div>
    );
  }

  if (phase === 'result' && result) {
    const passed = result.attempt.passed;
    return (
      <div className="min-h-screen bg-[#f0f4fa] text-slate-800 p-4 sm:p-6 lg:p-8 animate-slide-up">
        <div className="max-w-2xl mx-auto space-y-6">
          
          {/* Result Card */}
          <div className="bg-white rounded-[2.5rem] p-8 sm:p-10 text-center shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-slate-200/80 space-y-3">
            <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${passed ? 'bg-[#d4f4dd] text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
              {passed ? <CheckCircle size={36} /> : <XCircle size={36} />}
            </div>

            <h1 className="text-4xl font-extrabold text-slate-900">{result.attempt.score}%</h1>
            <p className={`text-base font-extrabold ${passed ? 'text-emerald-700' : 'text-rose-600'}`}>
              {passed ? '🎉 Congratulations! You Passed the Assessment' : 'Assessment Not Passed'}
            </p>
            {result.attempt.autoSubmitted && (
              <p className="text-amber-700 text-xs font-semibold bg-[#fff3c4] px-3 py-1 rounded-full w-fit mx-auto">
                Auto-submitted ({result.attempt.autoSubmitReason})
              </p>
            )}
          </div>

          {/* Question Review Breakdown */}
          <div className="space-y-4">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Question Review</h2>
            
            <div className="space-y-3">
              {result.review?.map((r, i) => (
                <div key={i} className={`bg-white rounded-3xl p-5 shadow-xs border-2 ${r.correct ? 'border-emerald-300' : 'border-rose-300'}`}>
                  <p className="text-slate-900 font-bold text-sm mb-3">{i + 1}. {r.questionText}</p>
                  <div className="space-y-2">
                    {r.options?.map((opt, oi) => (
                      <div
                        key={oi}
                        className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between ${
                          oi === r.correctOption ? 'bg-[#d4f4dd] text-emerald-950' :
                          oi === r.studentAnswer && !r.correct ? 'bg-rose-100 text-rose-950' : 'bg-slate-50 text-slate-600'
                        }`}
                      >
                        <span>{String.fromCharCode(65 + oi)}. {opt}</span>
                        {oi === r.correctOption && <span className="font-bold text-emerald-800">✓ Correct</span>}
                        {oi === r.studentAnswer && !r.correct && <span className="font-bold text-rose-700">✗ Your Choice</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => navigate(-1)}
              className="flex-1 py-3 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all shadow-xs"
            >
              ← Back to Course
            </button>
            <button
              onClick={() => { setPhase('ready'); setResult(null); setAttempt(null); }}
              className="flex-1 py-3 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-black transition-all shadow-md"
            >
              Try Again
            </button>
          </div>

        </div>
      </div>
    );
  }

  return <div className="max-w-2xl mx-auto p-8"><div className="bg-white rounded-3xl h-64 animate-pulse shadow-sm" /></div>;
}
