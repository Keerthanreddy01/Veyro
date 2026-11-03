/**
 * aiRateLimiter.js
 * 
 * Protects AI endpoints from abuse, controls token consumption,
 * and sanitizes student prompts against prompt injection.
 */

const userRequestCounts = new Map();
const userDailyCounts = new Map();

// Minute limit: 20 req/min
const MINUTE_LIMIT = 20;
const MINUTE_MS = 60 * 1000;

// Daily limit: 120 req/day
const DAILY_LIMIT = 120;
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Rate limiter middleware for AI endpoints.
 */
function aiRateLimiter(req, res, next) {
  const userId = req.user?.userId || req.ip;
  const now = Date.now();

  // 1. Check minute sliding window
  let minuteData = userRequestCounts.get(userId);
  if (!minuteData || now - minuteData.startTime > MINUTE_MS) {
    minuteData = { startTime: now, count: 0 };
    userRequestCounts.set(userId, minuteData);
  }

  minuteData.count += 1;
  if (minuteData.count > MINUTE_LIMIT) {
    return res.status(429).json({
      error: 'You are sending messages too quickly. Please pause for a moment before sending another question.',
      retryAfterSeconds: Math.ceil((MINUTE_MS - (now - minuteData.startTime)) / 1000),
    });
  }

  // 2. Check daily sliding window
  let dailyData = userDailyCounts.get(userId);
  if (!dailyData || now - dailyData.startTime > DAY_MS) {
    dailyData = { startTime: now, count: 0 };
    userDailyCounts.set(userId, dailyData);
  }

  dailyData.count += 1;
  if (dailyData.count > DAILY_LIMIT) {
    return res.status(429).json({
      error: 'You have reached your daily Veyro AI study budget (120 questions/day). Please continue reviewing your saved notes or try again tomorrow.',
    });
  }

  next();
}

/**
 * Clean and sanitize user prompt input to prevent prompt injection and token overflows.
 */
function sanitizePrompt(rawPrompt, maxLength = 2500) {
  if (!rawPrompt || typeof rawPrompt !== 'string') return '';
  let sanitized = rawPrompt.trim();

  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  // Neutralize common prompt injection patterns
  sanitized = sanitized.replace(/(?:ignore\s+all\s+previous\s+instructions|system\s+prompt\s+override|reveal\s+internal\s+system\s+instructions)/gi, '[Filtered Query]');

  return sanitized;
}

module.exports = {
  aiRateLimiter,
  sanitizePrompt,
};

