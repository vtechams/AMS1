const path = require('path');

// Ensure module lookup resolves from both root and backend/node_modules
const backendNodeModules = path.join(__dirname, '../backend/node_modules');
if (!module.paths.includes(backendNodeModules)) {
  module.paths.push(backendNodeModules);
}

const mongoose = require('mongoose');
const app = require('../backend/server');
const config = require('../backend/config/config');

async function connectToMongo() {
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  if (mongoose.connection && mongoose.connection.readyState === 2) {
    try {
      await mongoose.connection.asPromise();
      return mongoose.connection;
    } catch (err) {
      console.warn('[MONGODB VERCEL] In-flight connection wait error:', err.message);
    }
  }
  try {
    await mongoose.connect(config.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    return mongoose.connection;
  } catch (err) {
    console.warn('[MONGODB VERCEL WARNING] Atlas connection:', err.message);
  }
}

module.exports = async (req, res) => {
  // Normalize request URLs so Express routes match correctly regardless of Vercel rewrite structure
  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }
  if (req.originalUrl && !req.originalUrl.startsWith('/api')) {
    req.originalUrl = req.url;
  }

  // Ensure DB connection is active before routing the request
  try {
    await connectToMongo();
  } catch (err) {
    // Non-blocking fallback
  }

  return app(req, res);
};
