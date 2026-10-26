/**
 * Global error handler — must be registered LAST in Express middleware chain.
 * Ensures all errors return a consistent { error: string } shape.
 */
const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ error: messages.join('. ') });
  }

  // Mongoose duplicate key (unique constraint)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ error: `${field} already exists.` });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({ error: `Invalid ${err.path}: ${err.value}` });
  }

  // Multer errors (file size limit, unexpected field, etc.)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File too large. Maximum size is 500MB.' });
  }
  if (err.name === 'MulterError' || (err.constructor && err.constructor.name === 'MulterError')) {
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }

  // Upload validation errors (unsupported format, corrupted header, etc.)
  if (
    err.statusCode === 400 ||
    err.isUploadError ||
    /not allowed|unsupported|file type/i.test(err.message)
  ) {
    return res.status(400).json({ error: err.message });
  }

  // Generic error — sanitize 500 responses so stack traces/internals are never leaked
  const statusCode =
    typeof err.statusCode === 'number' && err.statusCode >= 400 && err.statusCode < 600
      ? err.statusCode
      : 500;
  const message =
    statusCode === 500 ? 'An unexpected internal server error occurred.' : err.message || 'Request failed.';
  res.status(statusCode).json({ error: message });
};

/**
 * 404 handler — catches requests that didn't match any route.
 */
const notFound = (req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
};

module.exports = { errorHandler, notFound };
