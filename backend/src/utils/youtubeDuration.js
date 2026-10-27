const https = require('https');

const durationCache = new Map();

/**
 * Parses an ISO-8601 duration string (e.g. "PT1M49S", "PT2H15M") into total seconds.
 * @param {string} iso
 * @returns {number|null}
 */
function parseIsoDuration(iso) {
  if (!iso || typeof iso !== 'string') return null;
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return null;
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  const total = hours * 3600 + minutes * 60 + seconds;
  return total > 0 ? total : null;
}

/**
 * Fetches video metadata and duration using multiple reliable tiers:
 * 1. YouTube Data API v3 (if YOUTUBE_API_KEY is configured in env)
 * 2. YouTube InnerTube Player API (lightweight JSON, ~200ms, no consent wall)
 * 3. YouTube Watch Page scraper (with consent cookies & redirect handling)
 * 4. oEmbed check for precise availability/restriction diagnostics
 *
 * @param {string} videoId - 11-character YouTube video ID
 * @returns {Promise<{ duration: number|null, title?: string, error?: string, source?: string }>}
 */
async function fetchYouTubeMetadata(videoId) {
  if (!videoId || typeof videoId !== 'string' || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    return { duration: null, error: 'Invalid YouTube video ID.' };
  }

  if (durationCache.has(videoId)) {
    return { duration: durationCache.get(videoId), source: 'cache' };
  }

  // ── Tier 1: YouTube Data API v3 (if configured) ───────────────────────────
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (apiKey) {
    try {
      const dataApiRes = await new Promise((resolve) => {
        const url = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${videoId}&key=${apiKey}`;
        https
          .get(url, { timeout: 4000 }, (res) => {
            let data = '';
            res.on('data', (c) => (data += c));
            res.on('end', () => {
              try {
                const json = JSON.parse(data);
                const item = json.items?.[0];
                if (!item) {
                  return resolve({
                    duration: null,
                    error: 'Video is unavailable, private, or not found on YouTube.',
                    source: 'data_api_not_found',
                  });
                }
                const iso = item.contentDetails?.duration;
                const sec = parseIsoDuration(iso);
                if (sec && sec > 0) {
                  return resolve({ duration: sec, title: item.snippet?.title, source: 'data_api' });
                }
              } catch {}
              resolve(null);
            });
          })
          .on('error', () => resolve(null));
      });

      if (dataApiRes?.duration && dataApiRes.duration > 0) {
        durationCache.set(videoId, dataApiRes.duration);
        return dataApiRes;
      }
      if (dataApiRes?.error) {
        return dataApiRes;
      }
    } catch {}
  }

  // ── Tier 2: YouTube InnerTube Player API ──────────────────────────────────
  try {
    const innertubeRes = await new Promise((resolve) => {
      const postData = JSON.stringify({
        videoId: videoId,
        context: {
          client: {
            clientName: 'WEB',
            clientVersion: '2.20240101.00.00',
            hl: 'en',
            gl: 'US',
          },
        },
      });

      const req = https.request(
        'https://www.youtube.com/youtubei/v1/player?prettyPrint=false',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Content-Length': Buffer.byteLength(postData),
          },
          timeout: 6000,
        },
        (res) => {
          let data = '';
          res.on('data', (c) => (data += c));
          res.on('end', () => {
            try {
              const json = JSON.parse(data);
              const status = json.playabilityStatus?.status;
              const reason = json.playabilityStatus?.reason;
              const lenSec = Number(json.videoDetails?.lengthSeconds);

              if (lenSec && lenSec > 0) {
                return resolve({
                  duration: lenSec,
                  title: json.videoDetails?.title,
                  source: 'innertube',
                });
              }

              // Explicit restriction check
              if (status === 'ERROR' || status === 'LOGIN_REQUIRED') {
                console.warn(`[YouTube Duration] Video ${videoId} restricted: ${status} - ${reason || 'Unavailable'}`);
                return resolve({
                  duration: null,
                  error: reason || 'Video is unavailable, private, or region-locked on YouTube.',
                  source: 'innertube_restricted',
                });
              }
            } catch {}
            resolve(null);
          });
        }
      );

      req.on('error', (err) => resolve({ error: err.message, networkError: true }));
      req.on('timeout', () => {
        req.destroy();
        resolve({ error: 'timeout', networkError: true });
      });
      req.write(postData);
      req.end();
    });

    if (innertubeRes?.duration && innertubeRes.duration > 0) {
      durationCache.set(videoId, innertubeRes.duration);
      return innertubeRes;
    }

    if (innertubeRes?.error && !innertubeRes.networkError) {
      return innertubeRes;
    }
  } catch (err) {
    console.warn(`[YouTube Duration] InnerTube error for ${videoId}:`, err.message);
  }

  // ── Tier 3: YouTube Watch Page HTML with Consent Cookies & Redirect Handling ─
  try {
    const watchRes = await new Promise((resolve) => {
      const makeRequest = (targetUrl, redirectsLeft = 2) => {
        const req = https.get(
          targetUrl,
          {
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept-Language': 'en-US,en;q=0.9',
              Cookie: 'SOCS=CAESEwgDEgk0ODE3Nzk3MjQaAmVuIAEaBgiA_LyaBg; CONSENT=YES+',
            },
            timeout: 7000,
          },
          (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && redirectsLeft > 0) {
              res.resume();
              const nextUrl = res.headers.location.startsWith('http')
                ? res.headers.location
                : `https://www.youtube.com${res.headers.location}`;
              // Abort if redirected to a consent wall or captcha challenge
              if (nextUrl.includes('consent.youtube.com') || nextUrl.includes('/sorry/')) {
                return resolve(null);
              }
              return makeRequest(nextUrl, redirectsLeft - 1);
            }

            if (res.statusCode !== 200) {
              res.resume();
              return resolve(null);
            }

            let html = '';
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
              html += chunk;
            });

            res.on('end', () => {
              // Reject error, bot check, or consent walls
              if (html.includes('consent.youtube.com') || html.includes('before you continue to YouTube')) {
                return resolve(null);
              }

              const lenMatch = html.match(/"lengthSeconds":"(\d+)"/);
              if (lenMatch && Number(lenMatch[1]) > 0) {
                return resolve({ duration: Number(lenMatch[1]), source: 'watch_html' });
              }

              const approxMatch = html.match(/"approxDurationMs":"(\d+)"/);
              if (approxMatch && Number(approxMatch[1]) > 0) {
                return resolve({ duration: Math.round(Number(approxMatch[1]) / 1000), source: 'watch_html' });
              }

              const isoMatch = html.match(/itemprop="duration"\s+content="([^"]+)"/i);
              if (isoMatch) {
                const sec = parseIsoDuration(isoMatch[1]);
                if (sec && sec > 0) return resolve({ duration: sec, source: 'watch_html' });
              }

              resolve(null);
            });
          }
        );

        req.on('error', () => resolve(null));
        req.on('timeout', () => {
          req.destroy();
          resolve(null);
        });
      };

      makeRequest(`https://www.youtube.com/watch?v=${videoId}`);
    });

    if (watchRes?.duration && watchRes.duration > 0) {
      durationCache.set(videoId, watchRes.duration);
      return watchRes;
    }
  } catch (err) {
    console.warn(`[YouTube Duration] Watch page error for ${videoId}:`, err.message);
  }

  // ── Tier 4: Availability check via oEmbed ──────────────────────────────────
  try {
    const oembedStatus = await new Promise((resolve) => {
      https
        .get(
          `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
          { timeout: 3500 },
          (res) => {
            res.resume();
            resolve(res.statusCode);
          }
        )
        .on('error', () => resolve(null));
    });

    if (oembedStatus === 404 || oembedStatus === 401 || oembedStatus === 403) {
      console.warn(`[YouTube Duration] oEmbed status ${oembedStatus} for video ${videoId}`);
      return {
        duration: null,
        error: 'Video is unavailable, private, or region-locked on YouTube.',
      };
    }
  } catch {}

  return {
    duration: null,
    error: 'Unable to detect duration. Video may be private, unlisted, region-locked, or unavailable on YouTube.',
  };
}

/**
 * Fetches the server-authoritative duration in seconds for a YouTube video.
 * @param {string} videoId 11-character YouTube video ID
 * @returns {Promise<number|null>} Duration in seconds, or null if unreachable
 */
async function fetchYouTubeDuration(videoId) {
  const meta = await fetchYouTubeMetadata(videoId);
  return meta?.duration || null;
}

module.exports = {
  fetchYouTubeDuration,
  fetchYouTubeMetadata,
  durationCache,
};

