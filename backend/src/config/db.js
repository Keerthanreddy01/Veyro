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

/**
 * Connects to MongoDB using environment variables (MONGODB_URI or MONGO_URI).
 * Provides actionable diagnostics for DNS, IP whitelisting, and authentication errors.
 * Implements non-crashing background retries to prevent Render CrashLoopBackOff.
 */
const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
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
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    return conn;
  } catch (error) {
    isConnecting = false;
    console.error(`❌ MongoDB connection error on target [${sanitizedHost}]:`);

    if (
      error.code === 'ENOTFOUND' ||
      error.message?.includes('ENOTFOUND') ||
      error.message?.includes('querySrv')
    ) {
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
      console.error('   ⚠️  Authentication Failed: Invalid username or password in connection string.');
      console.error('   Troubleshooting: Check database user credentials in Atlas -> Database Access.');
    } else if (
      error.name === 'MongooseServerSelectionError' ||
      error.message?.includes('ETIMEDOUT') ||
      error.message?.includes('ECONNREFUSED')
    ) {
      console.error(`   ⚠️  Cluster Reachability Timeout: Unable to connect to [${sanitizedHost}].`);
      console.error('   Troubleshooting: In MongoDB Atlas -> Network Access, ensure IP "0.0.0.0/0" is whitelisted.');
    } else {
      console.error(`   ⚠️  ${error.name || 'Error'}: ${error.message}`);
    }

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

module.exports = connectDB;
