const { verifyAccessToken } = require('../utils/jwt');

/**
 * authenticate — validates the JWT access token from the Authorization header.
 * Attaches decoded user info (userId, role) to req.user.
 *
 * We use Bearer tokens in headers (not cookies) to keep the API stateless
 * and easy to test with tools like Postman/Thunder Client.
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided. Please log in.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = { userId: decoded.userId, role: decoded.role };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please refresh your session.' });
    }
    return res.status(401).json({ error: 'Invalid token.' });
  }
};

/**
 * authorize — role-based access control middleware factory.
 * Usage: router.get('/admin-only', authenticate, authorize('admin'), handler)
 * Usage: router.get('/multi-role', authenticate, authorize('admin', 'instructor'), handler)
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Required role(s): ${roles.join(', ')}.`,
      });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
