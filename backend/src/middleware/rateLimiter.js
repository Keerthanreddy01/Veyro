const rateLimit = require('express-rate-limit');

/**
 * Safe Loopback Detection:
 * Strictly inspects low-level TCP socket.remoteAddress to completely prevent
 * spoofing via X-Forwarded-For or proxy headers. Deployed platforms (Render, etc.)
 * are never skipped under any circumstances.
 */
const isSafeLoopback = (req) => {
  if (process.env.RENDER || process.env.VERCEL || process.env.RAILWAY_ENVIRONMENT) {
    return false;
  }
  const socketAddress = req.socket && req.socket.remoteAddress;
  return socketAddress === '127.0.0.1' || socketAddress === '::1' || socketAddress === '::ffff:127.0.0.1';
};

/**
 * Strict Rate Limiter for Authentication endpoints (/api/auth/login, /api/auth/register).
 * Protects against brute-force and credential stuffing attacks.
 * Limit: 100 requests per 15 minutes per IP.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  skip: isSafeLoopback,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many login attempts from this IP, please try again in a few minutes.',
    error: 'Too many login attempts from this IP, please try again in a few minutes.',
  },
  statusCode: 429,
});

/**
 * General API Rate Limiter for all other /api endpoints.
 * Protects against DoS and abusive scraping.
 * Limit: 1500 requests per 15 minutes per IP.
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1500,
  skip: (req) => isSafeLoopback(req) || req.path === '/health' || req.path.startsWith('/verify'),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many requests from this IP, please try again later.',
    error: 'Too many requests from this IP, please try again later.',
  },
  statusCode: 429,
});

module.exports = { authLimiter, apiLimiter };
