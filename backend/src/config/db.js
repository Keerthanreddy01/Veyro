const mongoose = require('mongoose');

/**
 * Extracts a sanitized host string from a MongoDB connection string.
 * Ensures passwords and credentials are never printed in logs or terminal outputs.
 */
function getSanitizedHost(connectionUri) {
  if (!connectionUri) return 'undefined';
  try {
    const match = connectionUri.match(/@([^/?:]+)/);
    if (match) return match[1];
    const plainMatch = connectionUri.match(/\/\/([^/?:]+)/);
    if (plainMatch) return plainMatch[1];
    return 'hidden-host';
  } catch {
    return 'unknown-host';
  }
}

let isConnecting = false;
let reconnectTimer = null;
let lastConnectionError = null;

/**
 * Returns safe connection diagnostics without exposing any credentials or secrets.
 */
function getDiagnostics() {
  const isConnected = mongoose.connection.readyState === 1;
  const rawUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  return {
    state: isConnected ? 'connected' : 'disconnected',
    readyState: mongoose.connection.readyState,
    configuredHost: getSanitizedHost(rawUri),
    hasUriConfigured: Boolean(rawUri),
    lastError: isConnected ? null : lastConnectionError,
  };
}

/**
 * Connects to MongoDB using environment variables (MONGODB_URI or MONGO_URI).
 * Provides actionable diagnostics for DNS, IP whitelisting, and authentication errors.
 * Implements non-crashing background retries to prevent Render CrashLoopBackOff.
 */
const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    lastConnectionError = null;
    return mongoose.connection;
  }
  if (isConnecting) {
    return;
  }

  isConnecting = true;
  const rawUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  const uri = rawUri ? rawUri.trim().replace(/^["']|["']$/g, '') : null;
  const sanitizedHost = getSanitizedHost(uri);

  if (!uri) {
    console.error('❌ MongoDB Configuration Error: Neither MONGODB_URI nor MONGO_URI is defined.');
    console.error('   Action required: Add MONGODB_URI in your Render environment variables.');
    lastConnectionError = {
      category: 'MISSING_MONGODB_URI',
      host: 'none',
      suggestion: 'Add MONGODB_URI to Render environment variables.',
      timestamp: new Date().toISOString(),
    };
    isConnecting = false;
    return;
  }

  const options = {
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of hanging 30s
    socketTimeoutMS: 45000,
  };

  try {
    const conn = await mongoose.connect(uri, options);
    console.log(`✅ MongoDB connected successfully to host: ${conn.connection.host}`);
    isConnecting = false;
    lastConnectionError = null;
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    return conn;
  } catch (error) {
    isConnecting = false;
    console.error(`❌ MongoDB connection error on target [${sanitizedHost}]:`);

    let failureCategory = 'UNKNOWN';
    let suggestion = '';

    if (
      error.code === 'ENOTFOUND' ||
      error.message?.includes('ENOTFOUND') ||
      error.message?.includes('querySrv')
    ) {
      failureCategory = 'DNS_RESOLUTION_FAILURE';
      suggestion = 'Cluster hostname cannot be resolved. Verify cluster address in MONGODB_URI.';
      console.error(`   ⚠️  DNS/SRV Resolution Failure: Domain "${sanitizedHost}" could not be resolved.`);
      console.error('   Troubleshooting:');
      console.error('   1. The MongoDB Atlas cluster hostname may be outdated, deleted, or mistyped.');
      console.error('   2. Verify in Atlas (Database -> Connect -> Drivers) that the hostname matches.');
      console.error('   3. Update the MONGODB_URI variable in the Render Environment settings.');
    } else if (
      error.message?.includes('Authentication failed') ||
      error.message?.includes('bad auth') ||
      error.code === 8000
    ) {
      failureCategory = 'AUTHENTICATION_FAILED';
      suggestion = 'Invalid username or password in MONGODB_URI. Update Render environment with the new Atlas password.';
      console.error('   ⚠️  Authentication Failed: Invalid username or password in connection string.');
      console.error('   Troubleshooting: Check database user credentials in Atlas -> Database Access.');
    } else if (
      error.name === 'MongooseServerSelectionError' ||
      error.message?.includes('ETIMEDOUT') ||
      error.message?.includes('ECONNREFUSED')
    ) {
      failureCategory = 'NETWORK_OR_TIMEOUT';
      suggestion = 'Cluster unreachable. In MongoDB Atlas -> Network Access, ensure 0.0.0.0/0 is whitelisted.';
      console.error(`   ⚠️  Cluster Reachability Timeout: Unable to connect to [${sanitizedHost}].`);
      console.error('   Troubleshooting: In MongoDB Atlas -> Network Access, ensure IP "0.0.0.0/0" is whitelisted.');
    } else {
      failureCategory = error.name || 'CONNECTION_ERROR';
      suggestion = 'Check MongoDB Atlas cluster status and network settings.';
      console.error(`   ⚠️  ${error.name || 'Error'}: ${error.message}`);
    }

    lastConnectionError = {
      category: failureCategory,
      host: sanitizedHost,
      suggestion,
      timestamp: new Date().toISOString(),
    };

    // Schedule automatic reconnection attempt in 10s without crashing the web service
    if (!reconnectTimer) {
      console.log('🔄 Will retry MongoDB connection in 10 seconds...');
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        connectDB();
      }, 10000);
    }
  }
};

connectDB.getSanitizedHost = getSanitizedHost;
connectDB.getDiagnostics = getDiagnostics;

module.exports = connectDB;
