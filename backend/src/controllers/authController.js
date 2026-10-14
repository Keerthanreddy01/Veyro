const { validationResult } = require('express-validator');
const User = require('../models/User');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { logAudit, AUDIT_ACTIONS } = require('../utils/auditLogger');

/**
 * POST /api/auth/register
 * Creates a new user account backed directly by MongoDB.
 * Role defaults to 'student'; self-assigning 'admin' is prohibited.
 */
const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { name, email, password, role } = req.body;

    // Prevent self-assigning admin role via public registration
    const allowedRoles = ['student', 'instructor'];
    const assignedRole = allowedRoles.includes(role) ? role : 'student';

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const user = await User.create({
      name,
      email,
      passwordHash: password, // Pre-save hook in User model hashes this with bcrypt
      role: assignedRole,
    });

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id, user.role);

    // Save refresh token to user record
    await User.findByIdAndUpdate(user._id, { $push: { refreshTokens: refreshToken } });

    res.status(201).json({
      message: 'Account created successfully.',
      accessToken,
      refreshToken,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/login
 * Verifies credentials against MongoDB and issues JWT pair.
 */
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { email, password } = req.body;

    // Explicitly select passwordHash and refreshTokens since they are hidden by default
    const user = await User.findOne({ email }).select('+passwordHash +refreshTokens');
    if (!user || !user.isActive) {
      await logAudit({
        req,
        action: AUDIT_ACTIONS.LOGIN_FAILURE,
        entityType: 'auth',
        metadata: { email, reason: !user ? 'User not found' : 'Account deactivated' },
      });
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await logAudit({
        req,
        actorId: user._id,
        actorRole: user.role,
        action: AUDIT_ACTIONS.LOGIN_FAILURE,
        entityType: 'auth',
        metadata: { email, reason: 'Invalid password' },
      });
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id, user.role);

    await User.findByIdAndUpdate(user._id, { $push: { refreshTokens: refreshToken } });

    await logAudit({
      req,
      actorId: user._id,
      actorRole: user.role,
      action: AUDIT_ACTIONS.LOGIN_SUCCESS,
      entityType: 'auth',
      entityId: user._id,
      metadata: { email: user.email },
    });

    res.json({
      message: 'Logged in successfully.',
      accessToken,
      refreshToken,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/refresh
 * Issues a new access token using a valid database-stored refresh token.
 * Rotates the refresh token.
 */
const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required.' });
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      await logAudit({
        req,
        action: AUDIT_ACTIONS.SESSION_REVOKED,
        entityType: 'auth',
        metadata: { reason: 'Malformed or expired token' },
      });
      return res.status(401).json({ error: 'Invalid or expired refresh token.' });
    }

    // Verify token is still present in the user's refreshTokens array
    const user = await User.findById(decoded.userId).select('+refreshTokens');
    if (!user || !user.refreshTokens.includes(refreshToken)) {
      await logAudit({
        req,
        actorId: decoded.userId,
        actorRole: decoded.role,
        action: AUDIT_ACTIONS.SESSION_REVOKED,
        entityType: 'auth',
        metadata: { reason: 'Token already revoked or reused' },
      });
      return res.status(401).json({ error: 'Refresh token has been revoked.' });
    }

    // Rotate: remove old refresh token, append new refresh token
    const newAccessToken = generateAccessToken(user._id, user.role);
    const newRefreshToken = generateRefreshToken(user._id, user.role);

    const updatedTokens = (user.refreshTokens || [])
      .filter((t) => t !== refreshToken)
      .concat(newRefreshToken);

    await User.findByIdAndUpdate(user._id, {
      $set: { refreshTokens: updatedTokens },
    });

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/logout
 * Invalidates the provided refresh token in the database.
 */
const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await User.findByIdAndUpdate(req.user.userId, {
        $pull: { refreshTokens: refreshToken },
      });
    }

    await logAudit({
      req,
      actorId: req.user.userId,
      actorRole: req.user.role,
      action: AUDIT_ACTIONS.LOGOUT,
      entityType: 'auth',
      entityId: req.user.userId,
    });

    res.json({ message: 'Logged out successfully.' });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/me
 * Returns the current authenticated user's profile from MongoDB.
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, refresh, logout, getMe };
