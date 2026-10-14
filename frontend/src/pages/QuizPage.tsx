import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  History,
  Award,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import type { Quiz, QuizQuestion } from '../types/course';

const fmt = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

interface AttemptQuestion {
  questionText: string;
  options: string[];
}

interface AttemptData {
  _id: string;
  questionOrder: AttemptQuestion[];
  answers: number[];
}

interface QuizResult {
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  passingScore: number;
}

export default function QuizPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempt, setAttempt] = useState<AttemptData | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [phase, setPhase] = useState<'loading' | 'ready' | 'taking' | 'submitted' | 'result'>('loading');
  const [result, setResult] = useState<QuizResult | null>(null);
  const [violations, setViolations] = useState(0);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [pastAttempts, setPastAttempts] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const attemptRef = useRef<AttemptData | null>(null);

  const fetchAttempts = async () => {
    setHistoryLoading(true);
    try {
      const { data } = await api.get(`/quizzes/${quizId}/attempts`);
      setPastAttempts(data.attempts || []);
    } catch {
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchResult = async (attemptId: string) => {
    try {
      const { data } = await api.get(`/quizzes/${quizId}/results/${attemptId}`);
      setResult(data);
      setPhase('result');
    } catch {
      toast.error('Could not load quiz results');
    }
  };

  const handleAutoSubmit = useCallback(async () => {
    sessionStorage.removeItem(`active_quiz_${quizId}`);
    toast.error('Time expired. Submitting answers…');
    if (attemptRef.current) {
      try {
        await api.post(`/quizzes/attempts/${attemptRef.current._id}/submit`);
      } catch {}
      setPhase('submitted');
      fetchResult(attemptRef.current._id);
    }
  }, [quizId]);

  const reportViolation = useCallback(async () => {
    if (!attemptRef.current || phase !== 'taking') return;
    try {
      const { data } = await api.post(`/quizzes/attempts/${attemptRef.current._id}/violation`);
      setViolations(data.tabViolations || 0);
      if (data.autoSubmitted) {
        sessionStorage.removeItem(`active_quiz_${quizId}`);
        toast.error('Assessment auto-submitted due to tab switching!');
        setPhase('submitted');
        fetchResult(attemptRef.current._id);
      } else {
        toast.error(`⚠ Tab switch detected! ${data.violationsRemaining} warning(s) left.`, {
          duration: 4000,
        });
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

  useEffect(() => {
    if (phase !== 'taking' || secondsLeft <= 0) return;
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, secondsLeft, handleAutoSubmit]);

  useEffect(() => {
    api.get(`/quizzes/${quizId}`)
      .then(async ({ data }) => {
        setQuiz(data.quiz);
        api.get(`/quizzes/${quizId}/attempts`)
          .then((attRes) => setPastAttempts(attRes.data.attempts || []))
          .catch(() => {});

        if (sessionStorage.getItem(`active_quiz_${quizId}`) === 'true') {
          try {
            const startRes = await api.post(`/quizzes/${quizId}/start`);
            setAttempt(startRes.data.attempt);
            attemptRef.current = startRes.data.attempt;
            setAnswers(
              startRes.data.attempt.answers ||
                new Array(startRes.data.attempt.questionOrder.length).fill(-1)
            );
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

  const startQuiz = async () => {
    try {
      const { data } = await api.post(`/quizzes/${quizId}/start`);
      sessionStorage.setItem(`active_quiz_${quizId}`, 'true');
      setAttempt(data.attempt);
      attemptRef.current = data.attempt;
      setAnswers(data.attempt.answers || new Array(data.attempt.questionOrder.length).fill(-1));
      setSecondsLeft(data.secondsRemaining);
      setPhase('taking');
    } catch (err: any) {
      sessionStorage.removeItem(`active_quiz_${quizId}`);
      toast.error(err.response?.data?.error || 'Could not start quiz');
    }
  };

  const selectAnswer = async (qIdx: number, optIdx: number) => {
    const updated = [...answers];
    updated[qIdx] = optIdx;
    setAnswers(updated);
    if (attempt) {
      try {
        await api.patch(`/quizzes/attempts/${attempt._id}/answer`, {
          questionIndex: qIdx,
          answerIndex: optIdx,
        });
      } catch {}
    }
  };

  const handleSubmit = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    sessionStorage.removeItem(`active_quiz_${quizId}`);
    if (attempt) {
      try {
        await api.post(`/quizzes/attempts/${attempt._id}/submit`);
        setPhase('submitted');
        fetchResult(attempt._id);
      } catch (err: any) {
        toast.error(err.response?.data?.error || 'Submission failed');
      }
    }
  };

  if (phase === 'loading') {
    return (
      <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center p-6">
        <Loader2 size={28} className="animate-spin text-[#A99B8A]" />
      </div>
    );
  }

  const questions = attempt?.questionOrder || [];
  const currentQuestion = questions[currentQ];

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#202020] py-8 sm:py-12 font-sans">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6 animate-fade-in">
        
        {/* Ready Phase */}
        {phase === 'ready' && (
          <Card className="text-center p-8 sm:p-12 space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-[#F6F2EC] border border-[#E7E2DA] flex items-center justify-center mx-auto text-[#171717]">
              <ShieldCheck size={28} className="text-[#6F8FA8]" />
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <h1 className="font-serif text-3xl sm:text-4xl text-[#171717]">
                {quiz?.title || 'Module Assessment'}
              </h1>
              <p className="text-sm text-[#77736D]">
                Passing score: <strong className="text-[#171717]">{quiz?.passingScore || 80}%</strong>.
                This assessment is proctored with server-authoritative timer enforcement and tab monitoring.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF8F4] border border-[#E7E2DA] text-left text-xs text-[#77736D] max-w-md mx-auto space-y-2">
              <p className="font-semibold text-[#171717]">Anti-Cheat Guidelines:</p>
              <ul className="space-y-1 list-disc pl-4">
                <li>Do not leave this tab or minimize the browser window.</li>
                <li>Exceeding allowable tab switches triggers immediate auto-submission.</li>
                <li>Your answers auto-save on selection.</li>
              </ul>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button variant="secondary" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={startQuiz} rightIcon={<ArrowRight size={14} />}>
                Start assessment
              </Button>
              {pastAttempts.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setHistoryOpen(true);
                    fetchAttempts();
                  }}
                  leftIcon={<History size={14} />}
                >
                  Past attempts ({pastAttempts.length})
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* Taking Phase */}
        {phase === 'taking' && currentQuestion && (
          <div className="space-y-6">
            {/* Top Timer Bar */}
            <div className="flex items-center justify-between bg-white rounded-2xl p-4 border border-[#E7E2DA] shadow-subtle">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#77736D]">
                  Question {currentQ + 1} of {questions.length}
                </span>
                {violations > 0 && (
                  <Badge variant="rejected" icon={<AlertTriangle size={11} />}>
                    {violations} tab switch warning
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm font-mono font-bold text-[#171717] bg-[#F6F2EC] px-3 py-1.5 rounded-lg border border-[#E7E2DA]">
                <Clock size={15} className="text-[#6F8FA8]" />
                <span>{fmt(secondsLeft)}</span>
              </div>
            </div>

            {/* Question Card */}
            <Card className="p-6 sm:p-8 space-y-6">
              <h2 className="font-sans font-semibold text-lg sm:text-xl text-[#171717] leading-relaxed">
                {currentQuestion.questionText}
              </h2>

              <div className="space-y-2.5">
                {currentQuestion.options.map((opt, oIdx) => {
                  const isSelected = answers[currentQ] === oIdx;
                  return (
                    <button
                      key={oIdx}
                      onClick={() => selectAnswer(currentQ, oIdx)}
                      className={`w-full p-4 rounded-xl text-left text-sm transition-all border flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-[#171717] text-white border-[#171717] shadow-sm'
                          : 'bg-white text-[#202020] border-[#E7E2DA] hover:bg-[#FAF8F4] hover:border-[#A99B8A]'
                      }`}
                    >
                      <span>{opt}</span>
                      <span
                        className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                          isSelected ? 'border-white text-white' : 'border-[#E7E2DA]'
                        }`}
                      >
                        {isSelected && '✓'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Navigation Actions */}
              <div className="pt-4 border-t border-[#E7E2DA]/60 flex items-center justify-between">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentQ((q) => Math.max(0, q - 1))}
                  disabled={currentQ === 0}
                >
                  Previous
                </Button>

                {currentQ < questions.length - 1 ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setCurrentQ((q) => Math.min(questions.length - 1, q + 1))}
                  >
                    Next question
                  </Button>
                ) : (
                  <Button variant="primary" size="sm" onClick={handleSubmit}>
                    Submit assessment
                  </Button>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Results Phase */}
        {phase === 'result' && result && (
          <Card className="text-center p-8 sm:p-12 space-y-6">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto border ${
                result.passed
                  ? 'bg-[#F6F8F3] text-[#556943] border-[#E2E8DC]'
                  : 'bg-[#FFF1F0] text-[#9F2A2A] border-[#F8D7D7]'
              }`}
            >
              {result.passed ? <CheckCircle size={32} /> : <XCircle size={32} />}
            </div>

            <div className="space-y-2">
              <h1 className="font-serif text-3xl sm:text-4xl text-[#171717]">
                {result.passed ? 'Assessment Mastered!' : 'Passing Threshold Not Met'}
              </h1>
              <p className="text-sm text-[#77736D]">
                Score: <strong className="text-[#171717]">{result.percentage}%</strong> (
                {result.score} of {result.totalQuestions} correct). Required: {result.passingScore}%.
              </p>
            </div>

            <div className="pt-4 flex items-center justify-center gap-3">
              <Button variant="secondary" onClick={() => navigate(-1)}>
                Back to course
              </Button>
              <Button variant="primary" onClick={startQuiz} leftIcon={<RotateCcw size={14} />}>
                Retake assessment
              </Button>
            </div>
          </Card>
        )}

        {/* Attempt History Modal */}
        <Modal
          isOpen={historyOpen}
          onClose={() => setHistoryOpen(false)}
          title="Past Attempts"
          description="Your verified record of historical assessment sessions."
        >
          {historyLoading ? (
            <div className="py-8 flex justify-center">
              <Loader2 size={20} className="animate-spin text-[#A99B8A]" />
            </div>
          ) : pastAttempts.length === 0 ? (
            <p className="text-xs text-[#77736D] py-4 text-center">No past attempts found.</p>
          ) : (
            <div className="divide-y divide-[#E7E2DA]/60">
              {pastAttempts.map((att) => (
                <div key={att._id} className="py-3 flex items-center justify-between text-xs font-sans">
                  <div>
                    <p className="font-semibold text-[#171717]">
                      {att.percentage}% Score ({att.passed ? 'Passed' : 'Failed'})
                    </p>
                    <p className="text-[#77736D]">
                      {new Date(att.completedAt || att.startedAt).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant={att.passed ? 'published' : 'rejected'}>
                    {att.passed ? 'Passed' : 'Failed'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Modal>

      </div>
    </div>
  );
}
