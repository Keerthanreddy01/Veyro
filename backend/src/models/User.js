const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User schema — supports three roles: admin, instructor, student.
 * Passwords are stored as bcrypt hashes (never plain text).
 * refreshTokens array allows multi-device login + per-device logout.
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    passwordHash: {
      type: String,
      required: true,
      select: false, // never returned in queries by default
    },
    role: {
      type: String,
      enum: ['admin', 'instructor', 'student'],
      default: 'student',
    },
    // Store hashed refresh tokens to allow invalidation per device
    refreshTokens: {
      type: [String],
      select: false,
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

/**
 * Hash password before saving if it was modified.
 * Using bcrypt with salt rounds = 12 (good balance of security vs. speed).
 */
userSchema.pre('save', async function () {
  if (!this.isModified('passwordHash')) return;
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
});

/**
 * Instance method to compare a plain password against the stored hash.
 * Called during login — we don't expose passwordHash in regular queries.
 */
userSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
