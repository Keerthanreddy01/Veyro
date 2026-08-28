require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');

const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const moduleRoutes = require('./routes/modules');
const lessonRoutes = require('./routes/lessons');
const quizRoutes = require('./routes/quizzes');
const enrollmentRoutes = require('./routes/enrollments');
const { verifyCertificate } = require('./controllers/enrollmentController');
const { getAllUsers, toggleUserStatus } = require('./controllers/courseController');
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
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server) or matching allowedOrigin
    if (!origin || origin === allowedOrigin) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
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

// Public certificate verification (no auth required)
app.get('/api/verify/:code', verifyCertificate);

// Admin routes
app.get('/api/admin/users', authenticate, authorize('admin'), getAllUsers);
app.patch('/api/admin/users/:id/toggle', authenticate, authorize('admin'), toggleUserStatus);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
