import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CheckCircle, Play, FileText, AlignLeft, BookOpen } from 'lucide-react';
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
    <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-card">
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
    // Mark as complete on first view (server enforces this too)
    api.post(`/lessons/${lesson._id}/progress`, { watchedSeconds: 0, lastPosition: 0 })
      .then(({ data }) => onProgress(data.progress)).catch(() => {});
  }, [lesson._id]);

  return (
    <div className="w-full h-[70vh] rounded-2xl overflow-hidden shadow-card border border-white/5">
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
    <div className="card p-8 prose prose-invert max-w-none">
      <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">{lesson.textContent}</div>
    </div>
  );
}

export default function LessonViewerPage() {
  const { id } = useParams();
  const [lesson, setLesson] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [siblings, setSiblings] = useState({ prev: null, next: null });

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/lessons/${id}`);
        setLesson(data.lesson);
        setProgress(data.progress);

        // Load siblings for prev/next nav
        const modData = await api.get(`/courses/` + data.lesson.moduleId);
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
    <div className="page-container">
      <div className="card aspect-video w-full animate-pulse mb-4" />
      <div className="card h-24 animate-pulse" />
    </div>
  );
  if (!lesson) return null;

  return (
    <div className="page-container max-w-5xl animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <Link to={-1} className="text-slate-400 hover:text-white transition-colors">
          <ChevronLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">{lesson.title}</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-slate-400 capitalize flex items-center gap-1">
              {lesson.type === 'video' && <Play size={11} />}
              {lesson.type === 'pdf' && <FileText size={11} />}
              {lesson.type === 'text' && <AlignLeft size={11} />}
              {lesson.type}
            </span>
            {progress?.completed && (
              <span className="flex items-center gap-1 text-xs text-emerald-400">
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
        <div className="card p-4 mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-400">Watch progress</span>
            <span className="text-brand-400 font-medium">
              {progress ? Math.min(100, Math.round((progress.watchedSeconds / lesson.durationSeconds) * 100)) : 0}%
            </span>
          </div>
          <div className="w-full bg-dark-800 rounded-full h-1.5">
            <div className="bg-brand-gradient h-1.5 rounded-full transition-all"
              style={{ width: `${progress ? Math.min(100, Math.round((progress.watchedSeconds / lesson.durationSeconds) * 100)) : 0}%` }} />
          </div>
          <p className="text-slate-500 text-xs mt-1.5">Complete 90% to mark as done</p>
        </div>
      )}
    </div>
  );
}
