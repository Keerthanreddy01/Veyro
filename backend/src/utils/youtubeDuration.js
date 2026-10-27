const https = require('https');

const durationCache = new Map();

/**
 * Fetches the server-authoritative duration in seconds for a YouTube video.
 * Uses lightweight metadata extraction with a fast timeout and in-memory caching.
 * @param {string} videoId 11-character YouTube video ID
 * @returns {Promise<number|null>} Duration in seconds, or null if unreachable
 */
async function fetchYouTubeDuration(videoId) {
  if (!videoId || typeof videoId !== 'string' || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    return null;
  }

  if (durationCache.has(videoId)) {
    return durationCache.get(videoId);
  }

  return new Promise((resolve) => {
    let resolved = false;
    const finish = (val) => {
      if (!resolved) {
        resolved = true;
        if (val && val > 0) {
          durationCache.set(videoId, val);
        }
        resolve(val || null);
      }
    };

    const makeRequest = (targetUrl, redirectsLeft = 2) => {
      const req = https.get(
        targetUrl,
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
          },
          timeout: 4500,
        },
        (res) => {
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && redirectsLeft > 0) {
            res.resume();
            const nextUrl = res.headers.location.startsWith('http')
              ? res.headers.location
              : `https://www.youtube.com${res.headers.location}`;
            return makeRequest(nextUrl, redirectsLeft - 1);
          }

          if (res.statusCode !== 200) {
            res.resume();
            return finish(null);
          }

          let html = '';
          res.setEncoding('utf8');
          res.on('data', (chunk) => {
            html += chunk;
            const match = html.match(/"lengthSeconds":"(\d+)"/);
            if (match && Number(match[1]) > 0) {
              req.destroy();
              return finish(Number(match[1]));
            }
          });

          res.on('end', () => {
            const match = html.match(/"lengthSeconds":"(\d+)"/);
            if (match && Number(match[1]) > 0) {
              return finish(Number(match[1]));
            }
            const msMatch = html.match(/"approxDurationMs":"(\d+)"/);
            if (msMatch && Number(msMatch[1]) > 0) {
              return finish(Math.round(Number(msMatch[1]) / 1000));
            }
            finish(null);
          });
        }
      );

      req.on('timeout', () => {
        req.destroy();
        finish(null);
      });

      req.on('error', () => {
        finish(null);
      });
    };

    makeRequest(`https://www.youtube.com/watch?v=${videoId}`);
  });
}

module.exports = {
  fetchYouTubeDuration,
  durationCache,
};
