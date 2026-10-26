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
} from 'lucide-react';
import api from '../api/axios';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { getMediaUrl } from '../utils/media';
import { getVideoInfo } from '../utils/videoUrl';
import type { Lesson, LessonProgress } from '../types/course';

interface VideoLessonProps {
  lesson: Lesson;
  progress: LessonProgress | null;
  onProgress: (prog: LessonProgress) => void;
}

function YouTubePlayer({
  lesson,
  videoId,
  embedUrl,
  progress,
  onProgress,
}: {
  lesson: Lesson;
  videoId?: string;
  embedUrl: string;
  progress: LessonProgress | null;
  onProgress: (p: LessonProgress) => void;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerError, setPlayerError] = useState<string | null>(null);

  // Set of verified uniquely traversed seconds
  const watchedSecondsSet = useRef<Set<number>>(new Set());
  const lastPositionRef = useRef<number>(-1);
  const playbackRateRef = useRef<number>(1);
  const samplingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const syncCounterRef = useRef<number>(0);
  const initialPositionRef = useRef<number>(
    progress?.completed ? 0 : progress?.lastPosition || 0
  );
  const hasSeekedInitialRef = useRef<boolean>(false);

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

  // Initialize previously verified progress so refreshes never lose progress
  useEffect(() => {
    const prev = progress?.watchedSeconds || 0;
    for (let i = 0; i < prev; i++) {
      watchedSecondsSet.current.add(i);
    }
    if (progress && progress.lastPosition > 0) {
      lastPositionRef.current = progress.lastPosition;
    }
  }, []);

  // Stable ref for onProgress to prevent player teardowns on progress updates
  const onProgressRef = useRef(onProgress);
  onProgressRef.current = onProgress;

  // Server synchronization helper
  const syncProgress = useCallback(
    async (lastPos?: number) => {
      try {
        const requiredDuration = lesson.durationSeconds || 1;
        // Clamp verified seconds so it never exceeds configured required lesson duration
        const eligibleSeconds = Math.min(requiredDuration, watchedSecondsSet.current.size);
        const pos = typeof lastPos === 'number' ? lastPos : Math.max(0, lastPositionRef.current);

        const { data } = await api.post(`/lessons/${lesson._id}/progress`, {
          watchedSeconds: eligibleSeconds,
          lastPosition: Math.round(pos * 10) / 10,
        });
        onProgressRef.current(data.progress);
      } catch {}
    },
    [lesson._id, lesson.durationSeconds]
  );

  // Traversal sampling: only award seconds continuously played through (prevents seeking skips)
  const samplePlayback = useCallback((currentPos: number) => {
    if (typeof currentPos !== 'number' || isNaN(currentPos) || currentPos < 0) return;

    const lastPos = lastPositionRef.current;
    const rate = playbackRateRef.current || 1;
    const maxElapsed = 2.5 * rate; // Allow normal playback jitter, but block forward seeks

    if (lastPos >= 0 && currentPos >= lastPos && currentPos - lastPos <= maxElapsed) {
      // Legitimate playback: credit all traversed seconds
      const startSec = Math.floor(lastPos);
      const endSec = Math.floor(currentPos);
      for (let s = startSec; s <= endSec; s++) {
        watchedSecondsSet.current.add(s);
      }
    } else {
      // User seeked forward or backward: credit only the single current second
      watchedSecondsSet.current.add(Math.floor(currentPos));
    }

    lastPositionRef.current = currentPos;
  }, []);

  const startSampling = useCallback(() => {
    if (samplingIntervalRef.current) clearInterval(samplingIntervalRef.current);

    samplingIntervalRef.current = setInterval(() => {
      try {
        if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
          const state = playerRef.current.getPlayerState?.();
          // YT.PlayerState.PLAYING = 1
          if (state === 1) {
            const curr = playerRef.current.getCurrentTime();
            samplePlayback(curr);

            // Periodically sync every 10 seconds of active playback
            syncCounterRef.current += 1;
            if (syncCounterRef.current >= 10) {
              syncCounterRef.current = 0;
              syncProgress(curr);
            }
          }
        }
      } catch {}
    }, 1000);
  }, [samplePlayback, syncProgress]);

  const stopSampling = useCallback(() => {
    if (samplingIntervalRef.current) {
      clearInterval(samplingIntervalRef.current);
      samplingIntervalRef.current = null;
    }
  }, []);

  // 1. YouTube IFrame API Initialization — attaches cleanly to the existing iframe
  useEffect(() => {
    let isMounted = true;

    const attachYTPlayer = () => {
      if (!isMounted || !iframeRef.current || playerRef.current) return;
      try {
        if ((window as any).YT && (window as any).YT.Player) {
          playerRef.current = new (window as any).YT.Player(iframeRef.current, {
            events: {
              onReady: () => {
                // Do not seek unstarted video on ready to avoid blanking the poster thumbnail
              },
              onStateChange: (event: any) => {
                if (!isMounted) return;
                const state = event.data;
                // 1: PLAYING, 2: PAUSED, 3: BUFFERING, 0: ENDED
                if (state === 1) {
                  setIsPlaying(true);
                  if (!hasSeekedInitialRef.current && initialPositionRef.current > 0) {
                    hasSeekedInitialRef.current = true;
                    const seekPos = initialPositionRef.current;
                    const duration = lesson.durationSeconds || 300;
                    if (seekPos < duration - 3) {
                      try {
                        event.target.seekTo(seekPos, true);
                      } catch {}
                    }
                  }
                  try {
                    const curr = event.target.getCurrentTime();
                    samplePlayback(curr);
                  } catch {}
                  startSampling();
                } else if (state === 2) {
                  setIsPlaying(false);
                  stopSampling();
                  try {
                    const curr = event.target.getCurrentTime();
                    samplePlayback(curr);
                    syncProgress(curr);
                  } catch {
                    syncProgress();
                  }
                } else if (state === 3) {
                  // Buffering time is NOT counted as watched
                  setIsPlaying(false);
                  stopSampling();
                } else if (state === 0) {
                  setIsPlaying(false);
                  stopSampling();
                  try {
                    const curr = event.target.getCurrentTime();
                    samplePlayback(curr);
                    syncProgress(curr);
                  } catch {
                    syncProgress();
                  }
                }
              },
              onPlaybackRateChange: (event: any) => {
                playbackRateRef.current = Number(event.data) || 1;
              },
              onError: (event: any) => {
                if (!isMounted) return;
                const code = event?.data;
                let msg = 'YouTube video playback encountered an issue.';
                if (code === 101 || code === 150) {
                  msg = 'The video owner restricts playback in embedded players.';
                } else if (code === 100) {
                  msg = 'This YouTube video is unavailable or has been removed.';
                } else if (code === 5) {
                  msg = 'HTML5 player error. Please try opening directly on YouTube.';
                } else if (code === 2) {
                  msg = 'Invalid YouTube video ID or parameter.';
                }
                setPlayerError(msg);
              },
            },
          });
        }
      } catch {}
    };

    if ((window as any).YT && (window as any).YT.Player) {
      attachYTPlayer();
    } else {
      if (!document.getElementById('youtube-iframe-api')) {
        const tag = document.createElement('script');
        tag.id = 'youtube-iframe-api';
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
      }
      const prevOnReady = (window as any).onYouTubeIframeAPIReady;
      (window as any).onYouTubeIframeAPIReady = () => {
        if (typeof prevOnReady === 'function') prevOnReady();
        attachYTPlayer();
      };
    }

    return () => {
      isMounted = false;
      stopSampling();
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {}
        playerRef.current = null;
      }
    };
  }, [lesson._id, samplePlayback, startSampling, stopSampling, syncProgress]);

  // 2. PostMessage Fallback Listener (works concurrently with or without YT.Player)
  useEffect(() => {
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

        if (msg.event === 'infoDelivery' && msg.info) {
          if (typeof msg.info.currentTime === 'number') {
            samplePlayback(msg.info.currentTime);
          }
          if (msg.info.playerState === 1) {
            setIsPlaying(true);
            startSampling();
          } else if (msg.info.playerState === 2 || msg.info.playerState === 0) {
            setIsPlaying(false);
            stopSampling();
            syncProgress(lastPositionRef.current);
          } else if (msg.info.playerState === 3) {
            setIsPlaying(false);
            stopSampling();
          }
        }

        if (msg.event === 'onStateChange') {
          if (msg.info === 1) {
            setIsPlaying(true);
            startSampling();
          } else if (msg.info === 2 || msg.info === 0) {
            setIsPlaying(false);
            stopSampling();
            syncProgress(lastPositionRef.current);
          } else if (msg.info === 3) {
            setIsPlaying(false);
            stopSampling();
          }
        }
      } catch {}
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [samplePlayback, startSampling, stopSampling, syncProgress]);

  // Sync on page unload / component unmount
  useEffect(() => {
    const handleBeforeUnload = () => {
      syncProgress(lastPositionRef.current);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      syncProgress(lastPositionRef.current);
    };
  }, [syncProgress]);

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

function VideoLesson({ lesson, progress, onProgress }: VideoLessonProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const watchedRef = useRef<Set<number>>(new Set());
  const lastPosRef = useRef<number>(-1);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [playbackError, setPlaybackError] = useState(false);

  // Initialize previously verified watch seconds
  useEffect(() => {
    const prev = progress?.watchedSeconds || 0;
    for (let i = 0; i < prev; i++) {
      watchedRef.current.add(i);
    }
    if (progress && progress.lastPosition > 0) {
      lastPosRef.current = progress.lastPosition;
    }
  }, []);

  // Check all potential video property keys: videoUrl, contentUrl, videoURL, video
  const rawVideoUrl =
    lesson.videoUrl ||
    lesson.contentUrl ||
    (lesson as any).videoURL ||
    (lesson as any).video ||
    '';

  const videoInfo = getVideoInfo(rawVideoUrl);

  const save = useCallback(
    async (lastPos: number) => {
      try {
        const requiredDuration = lesson.durationSeconds || 1;
        const eligibleSeconds = Math.min(requiredDuration, watchedRef.current.size);
        const { data } = await api.post(`/lessons/${lesson._id}/progress`, {
          watchedSeconds: eligibleSeconds,
          lastPosition: Math.round(lastPos * 10) / 10,
        });
        onProgress(data.progress);
      } catch {}
    },
    [lesson._id, lesson.durationSeconds, onProgress]
  );

  useEffect(() => {
    if (videoInfo.provider !== 'direct' && videoInfo.provider !== 'local') return;

    const video = videoRef.current;
    if (!video) return;

    if (progress && progress.lastPosition > 0) {
      video.currentTime = progress.lastPosition;
      lastPosRef.current = progress.lastPosition;
    }

    const onTimeUpdate = () => {
      const currentPos = video.currentTime;
      const lastPos = lastPosRef.current;
      const rate = video.playbackRate || 1;
      const maxElapsed = 2.5 * rate;

      if (lastPos >= 0 && currentPos >= lastPos && currentPos - lastPos <= maxElapsed) {
        const startSec = Math.floor(lastPos);
        const endSec = Math.floor(currentPos);
        for (let s = startSec; s <= endSec; s++) {
          watchedRef.current.add(s);
        }
      } else {
        watchedRef.current.add(Math.floor(currentPos));
      }

      lastPosRef.current = currentPos;

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
  }, [lesson._id, progress, save, videoInfo.provider]);

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
          progress={progress}
          onProgress={onProgress}
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

  const handleProgress = useCallback((newProg: LessonProgress) => {
    setProgress(newProg);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center p-6">
        <Loader2 size={28} className="animate-spin text-[#A99B8A]" />
      </div>
    );
  }

  if (!lesson) return null;

  const duration = lesson.durationSeconds && lesson.durationSeconds > 0 ? lesson.durationSeconds : 1;
  const watched = Math.min(duration, Math.max(0, progress?.watchedSeconds || 0));
  const watchPercentage = Math.min(100, Math.max(0, Math.round((watched / duration) * 100)));

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
