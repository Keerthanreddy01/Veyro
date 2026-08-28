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

  // Multer file size limit
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File too large. Maximum size is 500MB.' });
  }

  // Generic error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error.';
  res.status(statusCode).json({ error: message });
};

/**
 * 404 handler — catches requests that didn't match any route.
 */
const notFound = (req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
};

module.exports = { errorHandler, notFound };
