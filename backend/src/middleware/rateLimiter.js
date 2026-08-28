const rateLimit = require('express-rate-limit');

/**
 * Strict Rate Limiter for Authentication endpoints (/api/auth/login, /api/auth/register).
 * Protects against brute-force and credential stuffing attacks.
 * Limit: 5 requests per 15 minutes per IP.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true, // Return standard RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  message: {
    message: 'Too many attempts, please try again later.',
    error: 'Too many attempts, please try again later.',
  },
  statusCode: 429,
});

/**
 * General API Rate Limiter for all other /api endpoints.
 * Protects against DoS and abusive scraping.
 * Limit: 100 requests per 15 minutes per IP.
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many requests from this IP, please try again later.',
    error: 'Too many requests from this IP, please try again later.',
  },
  statusCode: 429,
});

module.exports = { authLimiter, apiLimiter };
