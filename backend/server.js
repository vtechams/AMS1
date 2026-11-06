const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const config = require('./config/config');
const { initializeDatabase } = require('./scripts/initDatabase');

const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const studentRoutes = require('./routes/studentRoutes');
const courseRoutes = require('./routes/courseRoutes');
const batchRoutes = require('./routes/batchRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const companyRoutes = require('./routes/companyRoutes');
const requirementRoutes = require('./routes/requirementRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const followupRoutes = require('./routes/followupRoutes');
const reportRoutes = require('./routes/reportRoutes');
const backupRoutes = require('./routes/backupRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/requirements', requirementRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/followups', followupRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/backups', backupRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    app: 'Academy Management System (AMS)',
    version: '1.0.0',
    excelDatabase: config.DB_PATH,
    timestamp: new Date()
  });
});

// Serve static frontend in production if built
const frontendDist = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.originalUrl.startsWith('/api')) {
      return res.sendFile(path.join(frontendDist, 'index.html'));
    }
    next();
  });
}

// 404 handler for unmatched API routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[UNHANDLED SERVER ERROR]', err);
  res.status(500).json({
    success: false,
    message: err.message || 'An unexpected internal server error occurred.'
  });
});

const mongoose = require('mongoose');
const excelSyncService = require('./services/excelSyncService');

// Start Server after connecting to MongoDB Atlas & syncing Excel database
async function startServer() {
  try {
    console.log('[INIT] Connecting to MongoDB Atlas cloud database...');
    await mongoose.connect(config.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas successfully!');

    // Initialize / Sync local Excel format from MongoDB Atlas
    await excelSyncService.syncToDisk();

    app.listen(config.PORT, () => {
      console.log(`====================================================`);
      console.log(`🚀 AMS Backend Server running on http://localhost:${config.PORT}`);
      console.log(`☁️ Cloud Database: MongoDB Atlas (Cluster0 / ams)`);
      console.log(`📊 Auto-Synced Local Excel: ${config.DB_PATH}`);
      console.log(`💾 Automated Backups Directory: ${config.BACKUP_DIR}`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error('Failed to initialize server:', err);
    process.exit(1);
  }
}

if (!process.env.VERCEL) {
  startServer();
}

module.exports = app;

