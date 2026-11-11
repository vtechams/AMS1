const mongoose = require('mongoose');
const app = require('../backend/server');
const config = require('../backend/config/config');

let isConnected = false;

module.exports = async (req, res) => {
  if (!isConnected) {
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

