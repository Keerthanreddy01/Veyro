/**
 * Server-authoritative video URL validator and parser for Veyro LMS.
 * Validates YouTube links and direct HTTPS MP4/WebM video URLs.
 * Prevents SSRF by never making outbound network requests to validate arbitrary URLs.
 */

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

/**
 * Validates and parses a video URL string.
 * @param {string} rawUrl - User-supplied URL
 * @returns {{ valid: boolean, provider?: string, videoId?: string, embedUrl?: string, normalizedUrl?: string, error?: string }}
 */
function validateVideoUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { valid: false, error: 'Video URL is required.' };
  }

  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return { valid: false, error: 'Video URL cannot be empty.' };
  }

  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { valid: false, error: 'Invalid URL format. Please provide a valid web link.' };
  }

  // Reject insecure or unsafe protocols
  if (parsed.protocol === 'http:') {
    return { valid: false, error: 'Insecure HTTP URLs are not allowed. Please use an HTTPS link.' };
  }

  if (parsed.protocol !== 'https:') {
    return { valid: false, error: 'Only HTTPS URLs are allowed.' };
  }

  // Reject authentication credentials in URL (e.g. https://user:pass@example.com)
  if (parsed.username || parsed.password) {
    return { valid: false, error: 'URLs containing embedded credentials are not allowed.' };
  }

  const hostname = parsed.hostname.toLowerCase();

  // ── 1. YouTube Validation ──────────────────────────────────────────────────
  if (YOUTUBE_HOSTS.has(hostname)) {
    let videoId = null;

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
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
      normalizedUrl: `https://www.youtube.com/watch?v=${videoId}`,
    };
  }

  // ── 2. Direct MP4 / Video URL Validation ───────────────────────────────────
  const lowerPath = parsed.pathname.toLowerCase();
  const isDirectVideo = DIRECT_VIDEO_EXTENSIONS.some((ext) => lowerPath.endsWith(ext));

  if (isDirectVideo) {
    // Ensure hostname is valid and non-empty
    if (!hostname || hostname.includes(' ') || !hostname.includes('.')) {
      return { valid: false, error: 'Invalid host in video URL.' };
    }

    return {
      valid: true,
      provider: 'direct',
      normalizedUrl: parsed.toString(),
    };
  }

  return {
    valid: false,
    error: 'Unsupported video provider or format. Only YouTube and direct HTTPS MP4/WebM/MOV URLs are supported.',
  };
}

module.exports = {
  validateVideoUrl,
  YOUTUBE_HOSTS,
  YOUTUBE_ID_REGEX,
  DIRECT_VIDEO_EXTENSIONS,
};
