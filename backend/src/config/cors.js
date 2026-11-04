/**
 * CORS Configuration for Veyro LMS
 * 
 * Explicitly whitelists the production Vercel frontend, approved fallback
 * domains, and local development origins. Never permits arbitrary origins
 * or unrestricted wildcards with credentials.
 */

const explicitAllowedOrigins = [
  'https://veyroofficial.vercel.app',
  'https://veyro.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
];

const envOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((u) => u.trim().replace(/\/+$/, ''))
  .filter(Boolean);

// Combine explicit origins with any valid environment-configured origins
const allowedOrigins = Array.from(new Set([...explicitAllowedOrigins, ...envOrigins]));

/**
 * Check if a given origin string is authorized to access the API.
 * Server-to-server, curl, and native non-browser clients (where origin is undefined) are permitted.
 */
function isOriginAllowed(origin) {
  if (!origin) return true;
  const normalized = origin.trim().replace(/\/+$/, '');
  return allowedOrigins.includes(normalized);
}

const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }
    // Deny origin safely without throwing an unhandled Error (which causes HTTP 500)
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  optionsSuccessStatus: 204,
  maxAge: 86400, // 24-hour preflight cache
};

module.exports = {
  allowedOrigins,
  isOriginAllowed,
  corsOptions,
};

