const path = require('path');

// Ensure module lookup resolves from both root and backend/node_modules
const backendNodeModules = path.join(__dirname, '../backend/node_modules');
if (!module.paths.includes(backendNodeModules)) {
  module.paths.push(backendNodeModules);
}

const mongoose = require('mongoose');
const app = require('../backend/server');
const config = require('../backend/config/config');

let cachedConnection = null;

async function connectToMongo() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  if (!cachedConnection) {
    cachedConnection = mongoose.connect(config.MONGODB_URI, {
      serverSelectionTimeoutMS: 4000,
    }).catch(err => {
      cachedConnection = null;
      console.warn('[MONGODB VERCEL WARNING] Atlas connection:', err.message);
    });
  }
  return cachedConnection;
}

module.exports = async (req, res) => {
  // Normalize request URLs so Express routes match correctly regardless of Vercel rewrite structure
  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }
  if (req.originalUrl && !req.originalUrl.startsWith('/api')) {
    req.originalUrl = req.url;
  }

  // Attempt connection without hanging the request if IP whitelist is pending
  try {
    await connectToMongo();
  } catch (err) {
    // Non-blocking: will operate seamlessly on writable /tmp Excel DB
  }

  return app(req, res);
};
