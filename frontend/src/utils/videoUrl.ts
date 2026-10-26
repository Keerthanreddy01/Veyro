import { getMediaUrl } from './media';

const YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtu.be',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
]);

const YOUTUBE_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;
const DIRECT_VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov', '.m4v'];

export interface VideoValidationResult {
  valid: boolean;
  provider?: 'youtube' | 'direct';
  videoId?: string;
  embedUrl?: string;
  normalizedUrl?: string;
  error?: string;
}

export interface VideoDisplayInfo {
  provider: 'youtube' | 'direct' | 'local' | 'empty' | 'invalid';
  videoId?: string;
  embedUrl?: string;
  error?: string;
}

/**
 * Validates and sanitizes a user-supplied video URL (YouTube or Direct MP4).
 */
export function validateVideoUrl(rawUrl: string): VideoValidationResult {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { valid: false, error: 'Video URL is required.' };
  }

  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return { valid: false, error: 'Video URL cannot be empty.' };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { valid: false, error: 'Invalid URL format. Please provide a valid web link.' };
  }

  if (parsed.protocol === 'http:') {
    return { valid: false, error: 'Insecure HTTP URLs are not allowed. Please use an HTTPS link.' };
  }

  if (parsed.protocol !== 'https:') {
    return { valid: false, error: 'Only HTTPS URLs are allowed.' };
  }

  if (parsed.username || parsed.password) {
    return { valid: false, error: 'URLs containing embedded credentials are not allowed.' };
  }

  const hostname = parsed.hostname.toLowerCase();

  // 1. YouTube
  if (YOUTUBE_HOSTS.has(hostname)) {
    let videoId: string | null = null;

    if (hostname === 'youtu.be') {
      const parts = parsed.pathname.replace(/^\/+/, '').split('/');
      videoId = parts[0] || null;
    } else {
      const path = parsed.pathname.toLowerCase();
      if (path === '/watch' || path.startsWith('/watch/')) {
        videoId = parsed.searchParams.get('v');
      } else if (path.startsWith('/embed/')) {
        videoId = parsed.pathname.split('/')[2] || null;
      } else if (path.startsWith('/shorts/')) {
        videoId = parsed.pathname.split('/')[2] || null;
      } else if (path.startsWith('/v/')) {
        videoId = parsed.pathname.split('/')[2] || null;
      }
    }

    if (!videoId || !YOUTUBE_ID_REGEX.test(videoId)) {
      return {
        valid: false,
        error: 'Invalid YouTube URL. Must include a valid 11-character video ID.',
      };
    }

    return {
      valid: true,
      provider: 'youtube',
      videoId,
      embedUrl: `https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0`,
      normalizedUrl: `https://www.youtube.com/watch?v=${videoId}`,
    };
  }

  // 2. Direct Video
  const lowerPath = parsed.pathname.toLowerCase();
  const isDirectVideo = DIRECT_VIDEO_EXTENSIONS.some((ext) => lowerPath.endsWith(ext));

  if (isDirectVideo) {
    if (!hostname || hostname.includes(' ') || !hostname.includes('.')) {
      return { valid: false, error: 'Invalid host in video URL.' };
    }

    return {
      valid: true,
      provider: 'direct',
      embedUrl: parsed.toString(),
      normalizedUrl: parsed.toString(),
    };
  }

  return {
    valid: false,
    error: 'Unsupported video format. Please provide a YouTube link or direct HTTPS MP4/WebM URL.',
  };
}

/**
 * Resolves video playback source info for the lesson player,
 * preserving backward compatibility with legacy uploaded files.
 */
export function getVideoInfo(rawUrl?: string | null): VideoDisplayInfo {
  if (!rawUrl || !rawUrl.trim()) {
    return { provider: 'empty' };
  }

  const trimmed = rawUrl.trim();

  // If it's a web URL (http / https)
  if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
    const val = validateVideoUrl(trimmed);
    if (val.valid && val.provider === 'youtube') {
      return {
        provider: 'youtube',
        videoId: val.videoId,
        embedUrl: val.embedUrl,
      };
    }
    if (val.valid && val.provider === 'direct') {
      return {
        provider: 'direct',
        embedUrl: val.embedUrl || val.normalizedUrl,
      };
    }
    return {
      provider: 'invalid',
      error: val.error || 'Invalid video link',
    };
  }

  // Legacy local uploaded file path (e.g. "videos/12345.mp4")
  return {
    provider: 'local',
    embedUrl: getMediaUrl(trimmed),
  };
}
