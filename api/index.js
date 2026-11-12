const path = require('path');

// Ensure module lookup resolves from both root and backend/node_modules
const backendNodeModules = path.join(__dirname, '../backend/node_modules');
if (!module.paths.includes(backendNodeModules)) {
  module.paths.push(backendNodeModules);
}

const mongoose = require('mongoose');
const app = require('../backend/server');
const config = require('../backend/config/config');

let isConnected = false;

module.exports = async (req, res) => {
  // Normalize request URLs so Express routes match correctly regardless of Vercel rewrite structure
  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }
  if (req.originalUrl && !req.originalUrl.startsWith('/api')) {
    req.originalUrl = req.url;
  }

  // Ensure MongoDB Atlas connection in serverless environment
  if (!isConnected && mongoose.connection.readyState !== 1) {
    try {
      await mongoose.connect(config.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      isConnected = true;
    } catch (err) {
      console.error('[MONGODB VERCEL CONNECTION ERROR]', err.message);
    }
  }

  return app(req, res);
};
