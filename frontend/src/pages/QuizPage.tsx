import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ShieldCheck,
  RotateCcw,
  History,
  Loader2,
  ArrowRight,
  Camera,
  Video,
  VideoOff,
  Eye,
  UserCheck,
  Check,
  Sparkles,
  Info,
} from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { ProctoringMonitor, IntegrityEventPayload } from '../utils/proctoringMonitor';
import type { Quiz } from '../types/course';

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
  tabViolations?: number;
  cameraViolations?: number;
  maxViolationsAllowed?: number;
  isProctored?: boolean;
  requireCamera?: boolean;
}

interface QuizResult {
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  passingScore: number;
  attempt?: any;
}

export default function QuizPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempt, setAttempt] = useState<AttemptData | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [phase, setPhase] = useState<'loading' | 'preflight' | 'ready' | 'taking' | 'submitted' | 'result'>('loading');
  const [result, setResult] = useState<QuizResult | null>(null);
  const [violations, setViolations] = useState(0);
  const [cameraViolationsCount, setCameraViolationsCount] = useState(0);
  const [maxViolations, setMaxViolations] = useState(3);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [pastAttempts, setPastAttempts] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Preflight & Camera state
  const [cameraStatus, setCameraStatus] = useState<'prompt' | 'granted' | 'denied' | 'checking'>('checking');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [preflightAgreed, setPreflightAgreed] = useState(false);
  const [faceDetected, setFaceDetected] = useState(true);
  const [multipleFacesDetected, setMultipleFacesDetected] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const attemptRef = useRef<AttemptData | null>(null);
  const cameraVideoRef = useRef<HTMLVideoElement | null>(null);
  const takingCameraVideoRef = useRef<HTMLVideoElement | null>(null);
  const proctorMonitorRef = useRef<ProctoringMonitor | null>(null);

  // Stop camera tracks cleanly
  const stopCameraStreams = useCallback(() => {
    if (proctorMonitorRef.current) {
      proctorMonitorRef.current.stop();
      proctorMonitorRef.current = null;
    }
  }, []);

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
      stopCameraStreams();
    } catch {
      toast.error('Could not load quiz results');
    }
  };

  const handleAutoSubmit = useCallback(async () => {
    sessionStorage.removeItem(`active_quiz_${quizId}`);
    toast.error('Time expired. Submitting answers…');
    stopCameraStreams();
    if (attemptRef.current) {
      try {
        await api.post(`/quizzes/attempts/${attemptRef.current._id}/submit`);
      } catch {}
      setPhase('submitted');
      fetchResult(attemptRef.current._id);
    }
  }, [quizId, stopCameraStreams]);

  // Dispatch debounced integrity event to server
  const sendIntegrityEvent = useCallback(
    async (event: IntegrityEventPayload) => {
      if (!attemptRef.current || phase !== 'taking') return;
      try {
        const { data } = await api.post(
          `/quizzes/attempts/${attemptRef.current._id}/integrity-event`,
          event
        );
        if (data.tabViolations !== undefined) setViolations(data.tabViolations);
        if (data.cameraViolations !== undefined) setCameraViolationsCount(data.cameraViolations);

        if (data.autoSubmitted) {
          sessionStorage.removeItem(`active_quiz_${quizId}`);
          stopCameraStreams();
          toast.error(data.message || 'Assessment auto-submitted due to policy violations!');
          setPhase('submitted');
          fetchResult(attemptRef.current._id);
        } else if (event.eventType === 'tab_hidden' || event.eventType === 'tab_blur') {
          toast.error(`⚠ Tab switch detected! ${data.violationsRemaining} warning(s) remaining.`, {
            duration: 4000,
          });
        }
      } catch {}
    },
    [phase, quizId, stopCameraStreams]
  );

  // Tab & browser focus listeners
  useEffect(() => {
    if (phase !== 'taking') return;

    const onVisChange = () => {
      if (document.hidden) {
        sendIntegrityEvent({
          eventType: 'tab_hidden',
          severity: 'warning',
          description: 'Document visibility changed to hidden (student navigated away or minimized).',
        });
      }
    };

    const onBlur = () => {
      sendIntegrityEvent({
        eventType: 'tab_blur',
        severity: 'warning',
        description: 'Browser window lost focus.',
      });
    };

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Assessment in progress! Navigating away may cause your exam to be automatically submitted.';
      return e.returnValue;
    };

    document.addEventListener('visibilitychange', onVisChange);
    window.addEventListener('blur', onBlur);
    window.addEventListener('beforeunload', onBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', onVisChange);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [phase, sendIntegrityEvent]);

  // Countdown timer
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCameraStreams();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stopCameraStreams]);

  // Initial load
  useEffect(() => {
    api.get(`/quizzes/${quizId}`)
      .then(async ({ data }) => {
        const q = data.quiz;
        setQuiz(q);
        setMaxViolations(q.maxTabViolations || 3);

        api.get(`/quizzes/${quizId}/attempts`)
          .then((attRes) => setPastAttempts(attRes.data.attempts || []))
          .catch(() => {});

        // Check if there is an in-progress session stored in session
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
            setViolations(startRes.data.attempt.tabViolations || 0);

            if (q.requireCamera || q.isProctored) {
              setPhase('preflight');
              initPreflightCamera();
            } else {
              setPhase('taking');
            }
            return;
          } catch {
            sessionStorage.removeItem(`active_quiz_${quizId}`);
          }
        }

        // Fresh start: if proctored/requires camera, send to preflight
        if (q.isProctored || q.requireCamera) {
          setPhase('preflight');
          initPreflightCamera();
        } else {
          setPhase('ready');
        }
      })
      .catch(() => {
        toast.error('Quiz not found');
        navigate(-1);
      });
  }, [quizId, navigate]);

  // Preflight camera initialization
  const initPreflightCamera = async () => {
    setCameraStatus('checking');
    setCameraError(null);

    const monitor = new ProctoringMonitor({
      onEvent: (event) => {
        sendIntegrityEvent(event);
      },
      onFaceStatusChange: (status) => {
        setFaceDetected(status.present);
        setMultipleFacesDetected(status.multiple);
        if (status.error) setCameraError(status.error);
      },
    });

    proctorMonitorRef.current = monitor;
    const res = await monitor.requestCamera();

    if (res.success && res.stream) {
      setCameraStatus('granted');
      if (cameraVideoRef.current) {
        monitor.attachVideo(cameraVideoRef.current);
      }
      monitor.startDetection();
    } else {
      setCameraStatus('denied');
      setCameraError(res.error || 'Camera permission denied or device not found.');
    }
  };

  // Start exam from preflight or ready phase
  const handleStartExam = async () => {
    try {
      const { data } = await api.post(`/quizzes/${quizId}/start`);
      sessionStorage.setItem(`active_quiz_${quizId}`, 'true');
      setAttempt(data.attempt);
      attemptRef.current = data.attempt;
      setAnswers(data.attempt.answers || new Array(data.attempt.questionOrder.length).fill(-1));
      setSecondsLeft(data.secondsRemaining);
      setViolations(data.attempt.tabViolations || 0);
      setPhase('taking');

      // Attach video stream to taking floating widget if camera active
      setTimeout(() => {
        if (takingCameraVideoRef.current && proctorMonitorRef.current) {
          proctorMonitorRef.current.attachVideo(takingCameraVideoRef.current);
        }
      }, 100);
    } catch (err: any) {
      sessionStorage.removeItem(`active_quiz_${quizId}`);
      toast.error(err.response?.data?.error || 'Could not start assessment session');
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
    stopCameraStreams();

    if (attempt) {
      try {
        const { data } = await api.post(`/quizzes/attempts/${attempt._id}/submit`);
        setPhase('submitted');
        fetchResult(attempt._id);
        toast.success('Assessment successfully submitted for verification!');
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

        {/* ── PREFLIGHT SCREEN (PROCTORED EXAMS) ─────────────────────────── */}
        {phase === 'preflight' && (
          <Card className="p-6 sm:p-10 space-y-8 shadow-subtle border-[#E7E2DA]">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#F6F2EC] border border-[#E7E2DA] flex items-center justify-center mx-auto text-[#171717]">
                <ShieldCheck size={26} className="text-[#6F8FA8]" />
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl text-[#171717]">
                Examination Preflight & Integrity Verification
              </h1>
              <p className="text-xs sm:text-sm text-[#77736D] max-w-lg mx-auto">
                {quiz?.title || 'Accredited Assessment'} — Proctored Session
              </p>
            </div>

            {/* Active Monitoring Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-[#FAF8F4] border border-[#E7E2DA] flex items-center gap-3">
                <Camera size={18} className="text-[#6F8FA8] flex-shrink-0" />
                <div className="text-xs">
                  <p className="font-semibold text-[#171717]">Webcam Monitoring</p>
                  <p className="text-[#77736D] text-[11px]">Local stream detection</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF8F4] border border-[#E7E2DA] flex items-center gap-3">
                <AlertTriangle size={18} className="text-[#A99B8A] flex-shrink-0" />
                <div className="text-xs">
                  <p className="font-semibold text-[#171717]">Tab Lock & Focus</p>
                  <p className="text-[#77736D] text-[11px]">{maxViolations} warnings allowed</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF8F4] border border-[#E7E2DA] flex items-center gap-3">
                <Clock size={18} className="text-[#777B61] flex-shrink-0" />
                <div className="text-xs">
                  <p className="font-semibold text-[#171717]">Server-Enforced Timer</p>
                  <p className="text-[#77736D] text-[11px]">{Math.round((quiz?.timeLimitSeconds || 300) / 60)} minutes limit</p>
                </div>
              </div>
            </div>

            {/* Live Camera Preview Box */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#171717] flex items-center gap-1.5">
                  <Video size={14} className="text-[#6F8FA8]" /> Camera Calibration & Position
                </span>
                {cameraStatus === 'granted' ? (
                  <Badge variant="published" icon={<Check size={11} />}>
                    Camera Verified
                  </Badge>
                ) : cameraStatus === 'checking' ? (
                  <Badge variant="neutral" icon={<Loader2 size={11} className="animate-spin" />}>
                    Connecting...
                  </Badge>
                ) : (
                  <Badge variant="rejected" icon={<VideoOff size={11} />}>
                    Access Denied
                  </Badge>
                )}
              </div>

              <div className="relative aspect-video max-w-md mx-auto rounded-2xl overflow-hidden bg-black border border-[#E7E2DA] flex items-center justify-center">
                <video
                  ref={cameraVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${cameraStatus !== 'granted' ? 'hidden' : ''}`}
                />

                {cameraStatus === 'granted' && (
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-mono text-white flex items-center gap-1.5 border border-white/10">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        faceDetected && !multipleFacesDetected ? 'bg-emerald-400' : 'bg-amber-400'
                      } animate-pulse`}
                    />
                    <span>
                      {multipleFacesDetected
                        ? 'Multiple Faces Detected'
                        : faceDetected
                        ? 'Face Centered & Aligned'
                        : 'Face Not Detected'}
                    </span>
                  </div>
                )}

                {cameraStatus === 'denied' && (
                  <div className="p-6 text-center space-y-3 text-white">
                    <VideoOff size={32} className="mx-auto text-red-400" />
                    <p className="text-xs font-semibold text-red-200">Camera Access Blocked</p>
                    <p className="text-[11px] text-zinc-300 max-w-xs mx-auto leading-relaxed">
                      {cameraError || 'Camera permissions are required for this proctored examination.'}
                    </p>
                    <Button variant="secondary" size="sm" onClick={initPreflightCamera}>
                      Retry Camera Permission
                    </Button>
                  </div>
                )}

                {cameraStatus === 'checking' && (
                  <div className="text-center text-zinc-400 space-y-2">
                    <Loader2 size={24} className="animate-spin mx-auto text-[#6F8FA8]" />
                    <p className="text-xs">Requesting camera permissions…</p>
                  </div>
                )}
              </div>
            </div>

            {/* Integrity Guidelines & Rules */}
            <div className="p-4 rounded-xl bg-[#FAF8F4] border border-[#E7E2DA] text-xs text-[#77736D] space-y-2">
              <p className="font-semibold text-[#171717] flex items-center gap-1.5">
                <Info size={14} className="text-[#6F8FA8]" />
                Examination Environment Standards:
              </p>
              <ul className="space-y-1 list-disc pl-5">
                <li>Ensure your face is well-lit and stays within the camera frame throughout the session.</li>
                <li>Do not navigate away, open new browser tabs, or minimize this window.</li>
                <li>Exceeding {maxViolations} tab-switch warnings will trigger immediate automated submission.</li>
                <li>Answers are automatically saved to the server in real time upon selection.</li>
                <li>All camera processing occurs locally; no video recordings are uploaded to the cloud.</li>
              </ul>
            </div>

            {/* Acknowledgment Checkbox */}
            <label className="flex items-start gap-3 p-3 rounded-xl border border-[#E7E2DA] hover:bg-[#FAF8F4] transition-colors cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={preflightAgreed}
                onChange={(e) => setPreflightAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-[#171717] focus:ring-0 cursor-pointer"
              />
              <span className="text-[#202020] leading-relaxed">
                I understand the examination integrity rules, confirm my webcam preview is functional, and agree to start the proctored assessment.
              </span>
            </label>

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#E7E2DA]/60">
              <Button variant="secondary" onClick={() => { stopCameraStreams(); navigate(-1); }}>
                Cancel & Exit
              </Button>

              <Button
                variant="primary"
                onClick={handleStartExam}
                disabled={(!preflightAgreed || (quiz?.requireCamera && cameraStatus !== 'granted'))}
                rightIcon={<ArrowRight size={14} />}
              >
                Begin Proctored Assessment
              </Button>
            </div>
          </Card>
        )}

        {/* ── STANDARD READY PHASE (NON-PROCTORED) ───────────────────────── */}
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
                Passing score: <strong className="text-[#171717]">{quiz?.passingScore || 50}%</strong>.
                Server-authoritative timer enforcement active.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF8F4] border border-[#E7E2DA] text-left text-xs text-[#77736D] max-w-md mx-auto space-y-2">
              <p className="font-semibold text-[#171717]">Assessment Guidelines:</p>
              <ul className="space-y-1 list-disc pl-4">
                <li>Time limit: {Math.round((quiz?.timeLimitSeconds || 300) / 60)} minutes.</li>
                <li>Your answers auto-save on selection.</li>
                <li>Tab switching is recorded. Exceeding {maxViolations} warnings triggers auto-submit.</li>
              </ul>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button variant="secondary" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleStartExam} rightIcon={<ArrowRight size={14} />}>
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

        {/* ── TAKING PHASE ──────────────────────────────────────────────── */}
        {phase === 'taking' && currentQuestion && (
          <div className="space-y-6">
            {/* Top Bar with Timer and Warning Badges */}
            <div className="flex items-center justify-between bg-white rounded-2xl p-4 border border-[#E7E2DA] shadow-subtle">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-[#77736D]">
                  Question {currentQ + 1} of {questions.length}
                </span>

                {violations > 0 && (
                  <Badge variant="rejected" icon={<AlertTriangle size={11} />}>
                    {violations} of {maxViolations} tab warnings
                  </Badge>
                )}

                {cameraViolationsCount > 0 && (
                  <Badge variant="draft" icon={<Camera size={11} />}>
                    {cameraViolationsCount} camera notice(s)
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm font-mono font-bold text-[#171717] bg-[#F6F2EC] px-3 py-1.5 rounded-lg border border-[#E7E2DA]">
                <Clock size={15} className="text-[#6F8FA8]" />
                <span>{fmt(secondsLeft)}</span>
              </div>
            </div>

            {/* Warning Banner if Violations Occur */}
            {violations > 0 && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={15} className="text-amber-600 flex-shrink-0" />
                  <span>
                    Warning: Focus lost or tab switch detected ({violations}/{maxViolations}). Repeated violations will result in automatic submission.
                  </span>
                </div>
                <span className="font-semibold whitespace-nowrap ml-2">
                  {Math.max(0, maxViolations - violations)} warnings left
                </span>
              </div>
            )}

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

            {/* Floating Proctoring Camera Box */}
            {(quiz?.isProctored || quiz?.requireCamera) && (
              <div className="fixed bottom-5 right-5 z-40 bg-white/90 backdrop-blur-md border border-[#E7E2DA] rounded-2xl shadow-xl overflow-hidden p-2.5 space-y-1.5 w-48 sm:w-56">
                <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-[#E7E2DA]">
                  <video
                    ref={takingCameraVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-black/60 px-1.5 py-0.5 rounded text-[9px] text-white font-mono">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        faceDetected ? 'bg-emerald-400' : 'bg-red-400'
                      } animate-pulse`}
                    />
                    <span>{faceDetected ? 'Face OK' : 'Absent'}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[10px] text-[#77736D] px-1">
                  <span className="flex items-center gap-1">
                    <ShieldCheck size={11} className="text-[#6F8FA8]" /> Proctored Session
                  </span>
                  <span>{fmt(secondsLeft)}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── RESULTS PHASE ─────────────────────────────────────────────── */}
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
                {result.score} of {result.totalQuestions} correct). Required:{' '}
                {result.passingScore}%.
              </p>
            </div>

            {/* Integrity Summary Notice */}
            <div className="p-3.5 rounded-xl bg-[#FAF8F4] border border-[#E7E2DA] text-xs text-[#77736D] max-w-sm mx-auto">
              <p className="font-semibold text-[#171717] mb-0.5">Session Integrity Record</p>
              <p>
                Recorded {result.attempt?.tabViolations || violations} tab switch events. Status:{' '}
                <strong className="text-[#171717] capitalize">
                  {result.attempt?.reviewStatus || 'Cleared'}
                </strong>
              </p>
            </div>

            <div className="pt-4 flex items-center justify-center gap-3">
              <Button variant="secondary" onClick={() => navigate(-1)}>
                Back to course
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  if (quiz?.isProctored || quiz?.requireCamera) {
                    setPhase('preflight');
                    initPreflightCamera();
                  } else {
                    setPhase('ready');
                  }
                }}
                leftIcon={<RotateCcw size={14} />}
              >
                Retake assessment
              </Button>
            </div>
          </Card>
        )}

        {/* ── ATTEMPT HISTORY MODAL ─────────────────────────────────────── */}
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
                      {att.score}% Score ({att.passed ? 'Passed' : 'Failed'})
                    </p>
                    <p className="text-[#77736D]">
                      {new Date(att.completedAt || att.startedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {att.tabViolations > 0 && (
                      <span className="text-[11px] text-[#A99B8A]">
                        {att.tabViolations} warnings
                      </span>
                    )}
                    <Badge variant={att.passed ? 'published' : 'rejected'}>
                      {att.passed ? 'Passed' : 'Failed'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal>

      </div>
    </div>
  );
}
