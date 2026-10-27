/**
 * YouTube duration utility stub for Veyro LMS.
 * Outbound scraping and bot-blocked player API dependencies have been removed.
 */

const durationCache = new Map();

async function fetchYouTubeMetadata() {
  return { duration: null };
}

async function fetchYouTubeDuration() {
  return null;
}

module.exports = {
  fetchYouTubeDuration,
  fetchYouTubeMetadata,
  durationCache,
};
