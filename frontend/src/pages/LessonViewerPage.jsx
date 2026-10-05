import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  CheckCircle,
  Play,
  FileText,
  AlignLeft,
  BookOpen,
  Clock,
  ShieldCheck,
  Award,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

/** Video lesson — tracks real watch time via timeupdate events */
function VideoLesson({ lesson, progress, onProgress }) {
  const videoRef = useRef(null);
  const watchedRef = useRef(new Set()); // tracks unique integer seconds watched
  const saveTimerRef = useRef(null);

  const save = useCallback(async (lastPos) => {
    try {
      const { data } = await api.post(`/lessons/${lesson._id}/progress`, {
        watchedSeconds: watchedRef.current.size,
        lastPosition: lastPos,
      });
      onProgress(data.progress);
    } catch {}
  }, [lesson._id]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    // Resume from last position
    if (progress?.lastPosition > 0) video.currentTime = progress.lastPosition;

    const onTimeUpdate = () => {
      const sec = Math.floor(video.currentTime);
      watchedRef.current.add(sec);
      // Debounce saves — POST periodically
      clearTimeout(saveTimerRef.current);
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
      clearTimeout(saveTimerRef.current);
    };
  }, [lesson, save]);

  return (
    <div className="w-full aspect-video bg-black rounded-[2rem] overflow-hidden shadow-lg border border-black/20">
      <video ref={videoRef} controls className="w-full h-full object-contain" key={lesson._id}>
        <source src={`/static/${lesson.contentUrl}`} />
        Your browser does not support HTML5 video streaming.
      </video>
    </div>
  );
}

/** PDF lesson */
function PdfLesson({ lesson, onProgress }) {
  useEffect(() => {
    api.post(`/lessons/${lesson._id}/progress`, { watchedSeconds: 0, lastPosition: 0 })
      .then(({ data }) => onProgress(data.progress))
      .catch(() => {});
  }, [lesson._id]);

  return (
    <div className="w-full h-[75vh] rounded-[2rem] overflow-hidden shadow-sm border border-[#111111]/15 bg-white">
      <iframe src={`/static/${lesson.contentUrl}`} className="w-full h-full" title={lesson.title} />
    </div>
  );
}

/** Text lesson */
function TextLesson({ lesson, onProgress }) {
  useEffect(() => {
    api.post(`/lessons/${lesson._id}/progress`, { watchedSeconds: 0, lastPosition: 0 })
      .then(({ data }) => onProgress(data.progress))
      .catch(() => {});
  }, [lesson._id]);

  return (
    <div className="bg-white rounded-[2rem] p-8 sm:p-10 shadow-xs border border-[#111111]/15">
      <div className="text-slate-800 text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-body">
        {lesson.textContent}
      </div>
    </div>
  );
}

export default function LessonViewerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/lessons/${id}`);
        setLesson(data.lesson);
        setProgress(data.progress);
      } catch (err) {
        toast.error(err.response?.data?.error || 'Cannot load lesson');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleProgress = (prog) => {
    setProgress(prog);
    if (prog.completed) {
      toast.success('Module lesson completed! ✓', { id: 'lesson-complete' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7EE] p-6 lg:p-12 flex justify-center">
        <div className="w-full max-w-5xl space-y-4">
          <div className="bg-white rounded-[2rem] aspect-video w-full animate-pulse border border-[#111111]/10" />
          <div className="bg-white rounded-3xl h-24 animate-pulse border border-[#111111]/10" />
        </div>
      </div>
    );
  }

  if (!lesson) return null;

  const watchPercentage = lesson.durationSeconds > 0 && progress
    ? Math.min(100, Math.round((progress.watchedSeconds / lesson.durationSeconds) * 100))
    : progress?.completed ? 100 : 0;

  return (
    <div className="min-h-screen bg-[#FAF7EE] text-slate-900 animate-fade-in selection:bg-[#FFF490] selection:text-[#111111] p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between bg-white rounded-[2rem] p-4 sm:p-6 border border-[#111111]/15 shadow-xs">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-2xl bg-[#FAF7EE] border border-[#111111]/15 flex items-center justify-center text-slate-800 hover:bg-black hover:text-white transition-all shadow-2xs"
              title="Go back"
            >
              <ChevronLeft size={18} />
            </button>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  {lesson.type === 'video' && <Play size={11} className="text-[#60C5F1]" />}
                  {lesson.type === 'pdf' && <FileText size={11} className="text-amber-600" />}
                  {lesson.type === 'text' && <AlignLeft size={11} className="text-emerald-600" />}
                  <span>{lesson.type} Module</span>
                </span>
                {progress?.completed && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-[#d4f4dd] border border-emerald-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle size={11} />
                    <span>Completed</span>
                  </span>
                )}
              </div>
              <h1 className="font-syne font-bold text-lg sm:text-2xl text-slate-900 leading-tight">
                {lesson.title}
              </h1>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-[#d4f4dd] px-3 py-1 rounded-full flex items-center gap-1">
              <ShieldCheck size={13} />
              <span>Audited Session</span>
            </span>
          </div>
        </div>

        {/* Lesson Media / Document Viewer */}
        {lesson.type === 'video' && <VideoLesson lesson={lesson} progress={progress} onProgress={handleProgress} />}
        {lesson.type === 'pdf' && <PdfLesson lesson={lesson} onProgress={handleProgress} />}
        {lesson.type === 'text' && <TextLesson lesson={lesson} onProgress={handleProgress} />}

        {/* Watch Progress Card */}
        {lesson.type === 'video' && lesson.durationSeconds > 0 && (
          <div className="bg-white rounded-[2rem] p-6 border border-[#111111]/15 shadow-xs space-y-3">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-700 flex items-center gap-1.5">
                <Clock size={14} className="text-[#60C5F1]" />
                <span>Audited Watch Progress</span>
              </span>
              <span className="font-mono text-sm font-extrabold text-slate-900">{watchPercentage}%</span>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-[#111111] h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${watchPercentage}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-[11px] text-slate-500">
              <span>90% required for automatic verified module accreditation.</span>
              {watchPercentage >= 90 && (
                <span className="font-bold text-emerald-700">✓ Requirement Met</span>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
