import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, AlertTriangle, CheckCircle, XCircle, ChevronRight } from 'lucide-react';
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

  if (phase === 'loading') return <div className="page-container"><div className="card h-64 animate-pulse" /></div>;

  if (phase === 'ready') return (
    <div className="page-container max-w-2xl animate-fade-in">
      <div className="card p-8 text-center">
        <div className="p-4 rounded-2xl bg-brand-gradient/20 w-fit mx-auto mb-5">
          <Clock size={36} className="text-brand-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">{quiz?.title}</h1>
        <div className="flex justify-center gap-6 text-sm text-slate-400 mb-6">
          <span>{quiz?.questions?.length} questions</span>
          <span>Time limit: {fmt(quiz?.timeLimitSeconds || 0)}</span>
          <span>Pass: {quiz?.passingScore}%</span>
        </div>
        <div className="bg-amber-900/20 border border-amber-700/30 rounded-xl p-4 mb-6 text-left">
          <p className="text-amber-300 font-medium text-sm mb-1">⚠ Anti-cheat rules</p>
          <ul className="text-amber-200/70 text-xs space-y-1 list-disc list-inside">
            <li>Timer is server-controlled — pausing the page won't stop it</li>
            <li>Switching tabs is monitored; too many violations = auto-submit</li>
            <li>Quiz auto-submits when time expires</li>
          </ul>
        </div>
        <button onClick={startQuiz} className="btn-primary px-10 py-3 text-base">Start Quiz</button>
      </div>
    </div>
  );

  if (phase === 'taking' && attempt) {
    const qi = attempt.questionOrder[currentQ];
    const question = quiz.questions[qi];
    const optOrder = attempt.optionOrders[currentQ];
    const timerColor = secondsLeft < 60 ? 'text-red-400' : secondsLeft < 120 ? 'text-amber-400' : 'text-emerald-400';

    return (
      <div className="page-container max-w-3xl animate-fade-in">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-slate-400 text-sm">Question {currentQ + 1} / {attempt.questionOrder.length}</span>
          <div className={`flex items-center gap-2 font-mono text-lg font-bold ${timerColor}`}>
            <Clock size={18} /> {fmt(secondsLeft)}
          </div>
          {violations > 0 && (
            <span className="flex items-center gap-1.5 text-amber-400 text-sm">
              <AlertTriangle size={15} /> {violations} violation{violations > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-dark-800 rounded-full h-1.5 mb-6">
          <div className="bg-brand-gradient h-1.5 rounded-full transition-all"
            style={{ width: `${((currentQ + 1) / attempt.questionOrder.length) * 100}%` }} />
        </div>

        {/* Question card */}
        <div className="card p-6 mb-5">
          <p className="text-white text-lg font-medium mb-5">{question?.questionText}</p>
          <div className="space-y-3">
            {optOrder?.map((oi, displayIdx) => (
              <button key={displayIdx} onClick={() => selectAnswer(currentQ, displayIdx)}
                className={`w-full text-left px-5 py-3.5 rounded-xl border-2 text-sm font-medium transition-all
                  ${answers[currentQ] === displayIdx
                    ? 'border-brand-500 bg-brand-600/20 text-white'
                    : 'border-white/10 text-slate-300 hover:border-white/25 hover:bg-white/5'}`}>
                <span className="inline-block w-6 h-6 rounded-full border border-current mr-3 text-center text-xs leading-6 flex-shrink-0 inline-flex items-center justify-center">
                  {String.fromCharCode(65 + displayIdx)}
                </span>
                {question?.options[oi]}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button disabled={currentQ === 0} onClick={() => setCurrentQ((q) => q - 1)} className="btn-secondary disabled:opacity-30">← Prev</button>
          {currentQ < attempt.questionOrder.length - 1 ? (
            <button onClick={() => setCurrentQ((q) => q + 1)} className="btn-primary flex items-center gap-2">Next <ChevronRight size={16} /></button>
          ) : (
            <button onClick={handleSubmit} className="btn-primary bg-emerald-600 hover:bg-emerald-700">Submit Quiz</button>
          )}
        </div>
      </div>
    );
  }

  if (phase === 'result' && result) {
    const passed = result.attempt.passed;
    return (
      <div className="page-container max-w-2xl animate-slide-up">
        <div className="card p-8 text-center mb-6">
          <div className={`p-4 rounded-full w-fit mx-auto mb-4 ${passed ? 'bg-emerald-900/40' : 'bg-red-900/40'}`}>
            {passed ? <CheckCircle size={40} className="text-emerald-400" /> : <XCircle size={40} className="text-red-400" />}
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">{result.attempt.score}%</h1>
          <p className={`text-lg font-semibold mb-2 ${passed ? 'text-emerald-400' : 'text-red-400'}`}>
            {passed ? '🎉 Passed!' : 'Not Passed'}
          </p>
          {result.attempt.autoSubmitted && (
            <p className="text-amber-400 text-sm">Auto-submitted ({result.attempt.autoSubmitReason})</p>
          )}
        </div>

        <h2 className="text-lg font-semibold text-white mb-3">Question Review</h2>
        <div className="space-y-3">
          {result.review?.map((r, i) => (
            <div key={i} className={`card p-4 border-l-4 ${r.correct ? 'border-l-emerald-500' : 'border-l-red-500'}`}>
              <p className="text-white font-medium mb-3 text-sm">{i + 1}. {r.questionText}</p>
              <div className="space-y-1.5">
                {r.options?.map((opt, oi) => (
                  <div key={oi} className={`px-3 py-2 rounded-lg text-xs
                    ${oi === r.correctOption ? 'bg-emerald-900/40 text-emerald-300 font-medium' :
                      oi === r.studentAnswer && !r.correct ? 'bg-red-900/40 text-red-300' : 'text-slate-400'}`}>
                    {String.fromCharCode(65 + oi)}. {opt}
                    {oi === r.correctOption && ' ✓'}
                    {oi === r.studentAnswer && !r.correct && ' ✗'}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={() => navigate(-1)} className="btn-secondary flex-1">← Back to Course</button>
          <button onClick={() => { setPhase('ready'); setResult(null); setAttempt(null); }} className="btn-primary flex-1">Try Again</button>
        </div>
      </div>
    );
  }

  return <div className="page-container"><div className="card h-64 animate-pulse" /></div>;
}
