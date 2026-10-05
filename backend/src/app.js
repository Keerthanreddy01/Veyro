require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const moduleRoutes = require('./routes/modules');
const lessonRoutes = require('./routes/lessons');
const quizRoutes = require('./routes/quizzes');
const enrollmentRoutes = require('./routes/enrollments');
const adminRoutes = require('./routes/admin');
const notificationRoutes = require('./routes/notifications');
const { verifyCertificate } = require('./controllers/enrollmentController');
const { getAllUsers, toggleUserStatus, reviewCourse } = require('./controllers/courseController');
const { authenticate, authorize } = require('./middleware/auth');
const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();

// ─── Database ────────────────────────────────────────────────────────────────
connectDB();

// ─── Security Headers (Helmet) ───────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allows cross-origin media embedding (videos, PDFs, images)
}));

// ─── CORS Lockdown ───────────────────────────────────────────────────────────
const rawClientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
const allowedOrigins = rawClientUrl
  .split(',')
  .map((u) => u.trim().replace(/\/+$/, ''))
  .filter(Boolean);

// Always ensure default local dev origin is allowed when not in strict production
if (process.env.NODE_ENV !== 'production' && !allowedOrigins.includes('http://localhost:5173')) {
  allowedOrigins.push('http://localhost:5173');
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server, curl, mobile apps, or matching origins
      if (!origin) return callback(null, true);
      const normalized = origin.replace(/\/+$/, '');
      if (allowedOrigins.includes(normalized) || allowedOrigins.includes('*')) {
        return callback(null, true);
      }
      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Apply general rate limiter to all API endpoints
app.use('/api', apiLimiter);

// Serve uploaded files statically
// Files are accessed as: /static/videos/abc.mp4, /static/pdfs/abc.pdf, etc.
app.use('/static', express.static(path.join(__dirname, '../uploads')));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Public certificate verification (no auth required)
app.get('/api/verify/:code', verifyCertificate);

// Admin routes
app.get('/api/admin/users', authenticate, authorize('admin'), getAllUsers);
app.patch('/api/admin/users/:id/toggle', authenticate, authorize('admin'), toggleUserStatus);
app.put('/api/admin/courses/:id/status', authenticate, authorize('admin'), reviewCourse);
app.patch('/api/admin/courses/:id/status', authenticate, authorize('admin'), reviewCourse);

// Health check
app.get('/api/health', (req, res) => {
  const diag = typeof connectDB.getDiagnostics === 'function' ? connectDB.getDiagnostics() : {
    state: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    hasUriConfigured: Boolean(process.env.MONGODB_URI || process.env.MONGO_URI),
  };
  const isDbConnected = diag.state === 'connected';

  res.json({
    status: isDbConnected ? 'ok' : 'degraded',
    service: 'veyro-api',
    database: diag.state,
    clusterHost: diag.configuredHost || undefined,
    uriConfigured: diag.hasUriConfigured,
    ...(diag.lastError ? { diagnostics: diag.lastError } : {}),
    timestamp: new Date().toISOString(),
  });
});

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
