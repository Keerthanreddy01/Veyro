import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, CheckCircle, Play, FileText, AlignLeft, BookOpen, Clock } from 'lucide-react';
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
      // Debounce saves — only POST every 10 seconds
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
    <div className="w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-md">
      <video ref={videoRef} controls className="w-full h-full" key={lesson._id}>
        <source src={`/static/${lesson.contentUrl}`} />
        Your browser does not support HTML5 video.
      </video>
    </div>
  );
}

/** PDF lesson */
function PdfLesson({ lesson, onProgress }) {
  useEffect(() => {
    api.post(`/lessons/${lesson._id}/progress`, { watchedSeconds: 0, lastPosition: 0 })
      .then(({ data }) => onProgress(data.progress)).catch(() => {});
  }, [lesson._id]);

  return (
    <div className="w-full h-[70vh] rounded-3xl overflow-hidden shadow-sm border border-slate-200 bg-white">
      <iframe src={`/static/${lesson.contentUrl}`} className="w-full h-full" title={lesson.title} />
    </div>
  );
}

/** Text lesson */
function TextLesson({ lesson, onProgress }) {
  useEffect(() => {
    api.post(`/lessons/${lesson._id}/progress`, { watchedSeconds: 0, lastPosition: 0 })
      .then(({ data }) => onProgress(data.progress)).catch(() => {});
  }, [lesson._id]);

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200/80">
      <div className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap font-sans">{lesson.textContent}</div>
    </div>
  );
}

export default function LessonViewerPage() {
  const { id } = useParams();
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
      } finally { setLoading(false); }
    };
    load();
  }, [id]);

  const handleProgress = (prog) => {
    setProgress(prog);
    if (prog.completed) toast.success('Lesson completed! ✓', { id: 'lesson-complete' });
  };

  if (loading) return (
    <div className="max-w-5xl mx-auto p-8 space-y-4">
      <div className="bg-white rounded-3xl aspect-video w-full animate-pulse shadow-sm" />
      <div className="bg-white rounded-3xl h-24 animate-pulse shadow-sm" />
    </div>
  );
  if (!lesson) return null;

  return (
    <div className="min-h-screen bg-[#f0f4fa] text-slate-800 p-4 sm:p-6 lg:p-8 animate-fade-in">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-3 bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-slate-200/80">
          <Link
            to={-1}
            className="w-9 h-9 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors"
          >
            <ChevronLeft size={18} />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900">{lesson.title}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-slate-500 capitalize flex items-center gap-1 font-semibold">
                {lesson.type === 'video' && <Play size={12} className="text-indigo-600" />}
                {lesson.type === 'pdf' && <FileText size={12} className="text-amber-600" />}
                {lesson.type === 'text' && <AlignLeft size={12} className="text-emerald-600" />}
                {lesson.type} Lesson
              </span>
              {progress?.completed && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-[#d4f4dd] px-2.5 py-0.5 rounded-full">
                  <CheckCircle size={12} /> Completed
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        {lesson.type === 'video' && <VideoLesson lesson={lesson} progress={progress} onProgress={handleProgress} />}
        {lesson.type === 'pdf'   && <PdfLesson lesson={lesson} onProgress={handleProgress} />}
        {lesson.type === 'text'  && <TextLesson lesson={lesson} onProgress={handleProgress} />}

        {/* Progress indicator */}
        {lesson.type === 'video' && lesson.durationSeconds > 0 && (
          <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/80 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-500">Watch Completion Progress</span>
              <span className="text-slate-900">
                {progress ? Math.min(100, Math.round((progress.watchedSeconds / lesson.durationSeconds) * 100)) : 0}%
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress ? Math.min(100, Math.round((progress.watchedSeconds / lesson.durationSeconds) * 100)) : 0}%` }}
              />
            </div>
            <p className="text-slate-400 text-[11px]">Reach 90% watch time to mark module as verified completed</p>
          </div>
        )}

      </div>
    </div>
  );
}
