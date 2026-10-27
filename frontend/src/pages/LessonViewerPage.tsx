import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  CheckCircle,
  Play,
  FileText,
  AlignLeft,
  Clock,
  ShieldCheck,
  Loader2,
  AlertCircle,
  ExternalLink,
  Award,
} from 'lucide-react';
import api from '../api/axios';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { CourseCompletionModal } from '../components/common/CourseCompletionModal';
import { getMediaUrl } from '../utils/media';
import { getVideoInfo } from '../utils/videoUrl';
import type { Lesson, LessonProgress } from '../types/course';

interface VideoLessonProps {
  lesson: Lesson;
  progress: LessonProgress | null;
  onProgress: (prog: LessonProgress) => void;
  onComplete: () => void;
}

function YouTubePlayer({
  lesson,
  videoId,
  embedUrl,
  onCompleted,
}: {
  lesson: Lesson;
  videoId?: string;
  embedUrl: string;
  onCompleted: () => void;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [playerError, setPlayerError] = useState<string | null>(null);

  // Resolve video ID from prop or embedUrl
  const resolvedVideoId =
    videoId ||
    (embedUrl.match(/embed\/([a-zA-Z0-9_-]{11})/) || [])[1] ||
    (embedUrl.match(/[?&]v=([a-zA-Z0-9_-]{11})/) || [])[1] ||
    '';

  // Construct standard YouTube embed URL with origin and enablejsapi=1
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const originParam = origin ? `&origin=${encodeURIComponent(origin)}` : '';
  const iframeSrc = resolvedVideoId
    ? `https://www.youtube.com/embed/${resolvedVideoId}?enablejsapi=1${originParam}&rel=0`
    : embedUrl;

  const onCompletedRef = useRef(onCompleted);
  onCompletedRef.current = onCompleted;

  useEffect(() => {
    let isMounted = true;

    // Attach message listener for YouTube postMessage API to detect when video finishes
    const handleMessage = (event: MessageEvent) => {
      try {
        let msg = event.data;
        if (typeof msg === 'string') {
          try {
            msg = JSON.parse(msg);
          } catch {
            return;
          }
        }
        if (!msg || typeof msg !== 'object') return;

        // Player state 0 indicates playback has ended
        if (msg.event === 'infoDelivery' && msg.info && msg.info.playerState === 0) {
          if (isMounted) onCompletedRef.current();
        }
        if (msg.event === 'onStateChange' && (msg.info === 0 || msg.data === 0)) {
          if (isMounted) onCompletedRef.current();
        }
      } catch {}
    };

    window.addEventListener('message', handleMessage);
    return () => {
      isMounted = false;
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full">
      <iframe
        id={`yt-player-${lesson._id}`}
        ref={iframeRef}
        src={iframeSrc}
        title={lesson.title}
        className="w-full h-full border-0 rounded-2xl"
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          border: 'none',
        }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        onLoad={() => {
          try {
            iframeRef.current?.contentWindow?.postMessage(
              JSON.stringify({ event: 'listening', id: lesson._id }),
              '*'
            );
          } catch {}
        }}
      />

      {playerError && (
        <div className="absolute inset-0 bg-zinc-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20 space-y-3 rounded-2xl">
          <AlertCircle size={36} className="text-amber-400" />
          <p className="text-sm font-semibold text-white">{playerError}</p>
          <p className="text-xs text-zinc-400 max-w-md">
            You can still complete this lesson by watching the official video directly on YouTube.
          </p>
          {resolvedVideoId && (
            <a
              href={`https://www.youtube.com/watch?v=${resolvedVideoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
            >
              <ExternalLink size={14} />
              <span>Watch on YouTube</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function VideoLesson({ lesson, progress, onProgress, onComplete }: VideoLessonProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playbackError, setPlaybackError] = useState(false);

  const rawVideoUrl =
    lesson.videoUrl ||
    lesson.contentUrl ||
    (lesson as any).videoURL ||
    (lesson as any).video ||
    '';

  const videoInfo = getVideoInfo(rawVideoUrl);

  return (
    <div
      className="bg-black rounded-2xl overflow-hidden aspect-video relative flex items-center justify-center border border-[#E7E2DA] shadow-subtle isolate"
      style={{
        transform: 'translateZ(0)',
        WebkitTransform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
      }}
    >
      {videoInfo.provider === 'youtube' && videoInfo.embedUrl && (
        <YouTubePlayer
          lesson={lesson}
          videoId={videoInfo.videoId}
          embedUrl={videoInfo.embedUrl}
          onCompleted={onComplete}
        />
      )}

      {(videoInfo.provider === 'direct' || videoInfo.provider === 'local') &&
        (playbackError ? (
          <div className="text-center text-zinc-300 p-8 space-y-2 max-w-md mx-auto">
            <AlertCircle size={32} className="mx-auto text-amber-500" />
            <p className="text-sm font-semibold text-white">Video Stream Unavailable</p>
            <p className="text-xs text-zinc-400 leading-relaxed">
              The direct video stream could not be loaded. Please ensure the link is publicly accessible via HTTPS or contact your instructor.
            </p>
          </div>
        ) : (
          <video
            ref={videoRef}
            controls
            src={videoInfo.embedUrl}
            onError={() => setPlaybackError(true)}
            onEnded={onComplete}
            className="w-full h-full object-contain"
          />
        ))}

      {videoInfo.provider === 'invalid' && (
        <div className="text-center text-zinc-300 p-8 space-y-2 max-w-md mx-auto">
          <AlertCircle size={32} className="mx-auto text-rose-500" />
          <p className="text-sm font-semibold text-white">Invalid Video Link</p>
          <p className="text-xs text-zinc-400 leading-relaxed">
            {videoInfo.error || 'The video link provided for this lesson is invalid or unsupported.'}
          </p>
        </div>
      )}

      {videoInfo.provider === 'empty' && (
        <div className="text-center text-zinc-400 p-8 space-y-2">
          <Play size={32} className="mx-auto text-zinc-600" />
          <p className="text-xs">No video stream is currently attached to this lesson.</p>
        </div>
      )}
    </div>
  );
}

function PdfLesson({ lesson, onProgress }: { lesson: Lesson; onProgress: (p: any) => void }) {
  useEffect(() => {
    api.post(`/lessons/${lesson._id}/progress`, { completed: true })
      .then(({ data }) => onProgress(data.progress))
      .catch(() => {});
  }, [lesson._id, onProgress]);

  return (
    <div className="bg-white rounded-2xl border border-[#E7E2DA] p-6 shadow-subtle min-h-[480px] flex flex-col justify-between">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs text-[#77736D]">
          <FileText size={16} className="text-[#6F8FA8]" />
          <span>Curriculum PDF Reference</span>
        </div>
        <h2 className="font-serif text-2xl text-[#171717]">{lesson.title}</h2>
        {lesson.contentUrl ? (
          <iframe
            src={getMediaUrl(lesson.contentUrl)}
            title={lesson.title}
            className="w-full h-[600px] border border-[#E7E2DA] rounded-xl"
          />
        ) : (
          <p className="text-xs text-[#77736D]">
            Document reference will be available upon verification.
          </p>
        )}
      </div>
    </div>
  );
}

function TextLesson({ lesson, onProgress }: { lesson: Lesson; onProgress: (p: any) => void }) {
  useEffect(() => {
    api.post(`/lessons/${lesson._id}/progress`, { completed: true })
      .then(({ data }) => onProgress(data.progress))
      .catch(() => {});
  }, [lesson._id, onProgress]);

  return (
    <div className="bg-white rounded-2xl border border-[#E7E2DA] p-6 sm:p-10 shadow-subtle space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 text-xs text-[#77736D]">
        <AlignLeft size={16} className="text-[#777B61]" />
        <span>Reading Assignment</span>
      </div>
      <h1 className="font-serif text-3xl text-[#171717]">{lesson.title}</h1>
      <div className="prose prose-zinc text-sm leading-relaxed text-[#202020] whitespace-pre-wrap">
        {lesson.textContent || 'No written lesson content available for this unit.'}
      </div>
    </div>
  );
}

export default function LessonViewerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [progress, setProgress] = useState<LessonProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [markingComplete, setMarkingComplete] = useState(false);

  // Completion popup state
  const [completionModalOpen, setCompletionModalOpen] = useState(false);
  const [courseProgress, setCourseProgress] = useState<any>(null);

  const checkCourseCompletion = useCallback(async (courseId: string) => {
    if (!courseId) return;
    try {
      const { data } = await api.get(`/courses/${courseId}/progress`);
      setCourseProgress(data);
      const isDismissed = localStorage.getItem(`veyro_completion_dismissed_${courseId}`);
      if ((data.isEligibleForCertificate || data.percentage === 100) && !isDismissed) {
        setCompletionModalOpen(true);
      }
    } catch {}
  }, []);

  useEffect(() => {
    api.get(`/lessons/${id}`)
      .then(({ data }) => {
        setLesson(data.lesson);
        setProgress(data.progress || null);

        const courseId =
          (typeof data.lesson?.courseId === 'string'
            ? data.lesson.courseId
            : data.lesson?.courseId?._id) || data.lesson?.course?._id;
        if (courseId) {
          checkCourseCompletion(courseId);
        }
      })
      .catch(() => navigate('/courses'))
      .finally(() => setLoading(false));
  }, [id, navigate, checkCourseCompletion]);

  const handleProgress = useCallback((newProg: LessonProgress) => {
    setProgress((prev) => ({
      ...(prev || {}),
      ...newProg,
      completed: (prev?.completed || newProg.completed),
    }));
  }, []);

  const handleCompleteLesson = useCallback(async () => {
    if (!lesson) return;
    setMarkingComplete(true);
    try {
      const { data } = await api.post(`/lessons/${lesson._id}/progress`, {
        completed: true,
      });
      if (data.progress) {
        setProgress(data.progress);
      }
      toast.success('Lesson marked as completed!');

      const courseId =
        (typeof lesson.courseId === 'string'
          ? lesson.courseId
          : lesson.courseId?._id) || lesson.course?._id;
      if (courseId) {
        await checkCourseCompletion(courseId);
      }
    } catch {
      toast.error('Failed to update lesson progress.');
    } finally {
      setMarkingComplete(false);
    }
  }, [lesson, checkCourseCompletion]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center p-6">
        <Loader2 size={28} className="animate-spin text-[#A99B8A]" />
      </div>
    );
  }

  if (!lesson) return null;

  const rawVideoUrl =
    lesson.videoUrl ||
    lesson.contentUrl ||
    (lesson as any).videoURL ||
    (lesson as any).video ||
    '';
  const videoInfo = getVideoInfo(rawVideoUrl);
  const isDirectVideo = videoInfo.provider === 'direct' || videoInfo.provider === 'local';

  const courseId =
    (typeof lesson.courseId === 'string'
      ? lesson.courseId
      : lesson.courseId?._id) || lesson.course?._id || '';
  const courseTitle = lesson.course?.title || 'Curriculum';

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#202020] py-6 sm:py-10 font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6 animate-fade-in">
        
        {/* Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-4 sm:p-5 border border-[#E7E2DA] shadow-subtle">
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(-1)}
              leftIcon={<ChevronLeft size={16} />}
            >
              Back
            </Button>

            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <Badge variant="neutral">{lesson.type} unit</Badge>
                {progress?.completed ? (
                  <Badge variant="published" icon={<CheckCircle size={11} />}>
                    Completed
                  </Badge>
                ) : (
                  <Badge variant="draft">In progress</Badge>
                )}
              </div>
              <h1 className="font-serif text-lg sm:text-xl text-[#171717] leading-tight">
                {lesson.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            {progress?.completed ? (
              <Button
                variant="secondary"
                size="sm"
                disabled
                leftIcon={<CheckCircle size={14} className="text-emerald-600" />}
              >
                Lesson Completed
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={handleCompleteLesson}
                isLoading={markingComplete}
                leftIcon={<CheckCircle size={14} />}
              >
                Mark as Complete
              </Button>
            )}
          </div>
        </div>

        {/* Media Player */}
        {lesson.type === 'video' && (
          <VideoLesson
            lesson={lesson}
            progress={progress}
            onProgress={handleProgress}
            onComplete={handleCompleteLesson}
          />
        )}
        {lesson.type === 'pdf' && (
          <PdfLesson lesson={lesson} onProgress={handleProgress} />
        )}
        {lesson.type === 'text' && (
          <TextLesson lesson={lesson} onProgress={handleProgress} />
        )}

        {/* Direct Video Progress Tracker (Only for Direct HTTPS MP4/WebM with duration) */}
        {lesson.type === 'video' && isDirectVideo && (lesson.durationSeconds || 0) > 0 && (
          <Card>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#77736D] flex items-center gap-1.5 font-medium">
                  <Clock size={13} className="text-[#6F8FA8]" />
                  <span>Playback Status</span>
                </span>
                <span className="font-mono font-bold text-sm text-[#171717]">
                  {progress?.completed ? '100%' : 'In Progress'}
                </span>
              </div>

              <div className="w-full bg-[#E7E2DA] rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#171717] h-2 rounded-full transition-all duration-300"
                  style={{ width: progress?.completed ? '100%' : '50%' }}
                />
              </div>
            </div>
          </Card>
        )}

        {/* Course Completion & Certificate Modal */}
        {courseId && (
          <CourseCompletionModal
            isOpen={completionModalOpen}
            onClose={() => setCompletionModalOpen(false)}
            courseId={courseId}
            courseTitle={courseTitle}
            studentName={user?.name || 'Scholar'}
            existingCertificateCode={courseProgress?.certificateCode}
          />
        )}

      </div>
    </div>
  );
}
