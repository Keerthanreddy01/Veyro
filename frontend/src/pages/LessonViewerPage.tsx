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
} from 'lucide-react';
import api from '../api/axios';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import type { Lesson, LessonProgress } from '../types/course';

interface VideoLessonProps {
  lesson: Lesson;
  progress: LessonProgress | null;
  onProgress: (prog: LessonProgress) => void;
}

function VideoLesson({ lesson, progress, onProgress }: VideoLessonProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const watchedRef = useRef<Set<number>>(new Set());
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback(
    async (lastPos: number) => {
      try {
        const { data } = await api.post(`/lessons/${lesson._id}/progress`, {
          watchedSeconds: watchedRef.current.size,
          lastPosition: lastPos,
        });
        onProgress(data.progress);
      } catch {}
    },
    [lesson._id, onProgress]
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (progress && progress.lastPosition > 0) {
      video.currentTime = progress.lastPosition;
    }

    const onTimeUpdate = () => {
      const sec = Math.floor(video.currentTime);
      watchedRef.current.add(sec);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => save(video.currentTime), 10000);
    };

    const onPause = () => save(video.currentTime);
    const onEnded = () => save(video.duration);

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('pause', onPause);
    video.addEventListener('ended', onEnded);

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('ended', onEnded);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [lesson._id, progress, save]);

  return (
    <div className="bg-black rounded-2xl overflow-hidden aspect-video relative flex items-center justify-center border border-[#E7E2DA] shadow-subtle">
      {lesson.contentUrl ? (
        <video
          ref={videoRef}
          controls
          src={lesson.contentUrl}
          className="w-full h-full object-contain"
        />
      ) : (
        <div className="text-center text-zinc-400 p-8 space-y-2">
          <Play size={32} className="mx-auto text-zinc-600" />
          <p className="text-xs">Video content stream is being encoded for this module.</p>
        </div>
      )}
    </div>
  );
}

function PdfLesson({ lesson, onProgress }: { lesson: Lesson; onProgress: (p: any) => void }) {
  useEffect(() => {
    api.post(`/lessons/${lesson._id}/progress`, { watchedSeconds: 1, lastPosition: 0 })
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
            src={lesson.contentUrl}
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
    api.post(`/lessons/${lesson._id}/progress`, { watchedSeconds: 1, lastPosition: 0 })
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

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [progress, setProgress] = useState<LessonProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/lessons/${id}`)
      .then(({ data }) => {
        setLesson(data.lesson);
        setProgress(data.progress || null);
      })
      .catch(() => navigate('/courses'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleProgress = (newProg: LessonProgress) => {
    setProgress(newProg);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center p-6">
        <Loader2 size={28} className="animate-spin text-[#A99B8A]" />
      </div>
    );
  }

  if (!lesson) return null;

  const duration = lesson.durationSeconds || 1;
  const watched = progress?.watchedSeconds || 0;
  const watchPercentage = Math.min(100, Math.round((watched / duration) * 100));

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#202020] py-6 sm:py-10 font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6 animate-fade-in">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between bg-white rounded-2xl p-4 sm:p-5 border border-[#E7E2DA] shadow-subtle">
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
                {progress?.completed && (
                  <Badge variant="published" icon={<CheckCircle size={11} />}>
                    Completed
                  </Badge>
                )}
              </div>
              <h1 className="font-serif text-lg sm:text-xl text-[#171717] leading-tight">
                {lesson.title}
              </h1>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <Badge variant="verified" icon={<ShieldCheck size={12} />}>
              Audited session
            </Badge>
          </div>
        </div>

        {/* Media Player */}
        {lesson.type === 'video' && (
          <VideoLesson lesson={lesson} progress={progress} onProgress={handleProgress} />
        )}
        {lesson.type === 'pdf' && (
          <PdfLesson lesson={lesson} onProgress={handleProgress} />
        )}
        {lesson.type === 'text' && (
          <TextLesson lesson={lesson} onProgress={handleProgress} />
        )}

        {/* Video Watch Progress Tracker */}
        {lesson.type === 'video' && lesson.durationSeconds && lesson.durationSeconds > 0 && (
          <Card>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#77736D] flex items-center gap-1.5 font-medium">
                  <Clock size={13} className="text-[#6F8FA8]" />
                  <span>Audited Watch Time Progress</span>
                </span>
                <span className="font-mono font-bold text-sm text-[#171717]">
                  {watchPercentage}%
                </span>
              </div>

              <div className="w-full bg-[#E7E2DA] rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#171717] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${watchPercentage}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-xs text-[#77736D]">
                <span>90% required for automatic verified module accreditation.</span>
                {watchPercentage >= 90 && (
                  <span className="font-semibold text-[#556943]">✓ Requirement Met</span>
                )}
              </div>
            </div>
          </Card>
        )}

      </div>
    </div>
  );
}
