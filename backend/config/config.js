const path = require('path');
const fs = require('fs');
const os = require('os');
const dotenv = require('dotenv');

dotenv.config();

const isVercel = !!process.env.VERCEL;
const ROOT_DIR = path.resolve(__dirname, '../..');
const TEMPLATE_DB_PATH = path.join(ROOT_DIR, 'database', process.env.EXCEL_DB_FILE || 'Academy_Database.xlsx');

// In Vercel serverless environment, only os.tmpdir() is writable. /var/task is read-only.
const DB_DIR = isVercel ? path.join(os.tmpdir(), 'database') : path.join(ROOT_DIR, 'database');
const DB_FILE = process.env.EXCEL_DB_FILE || 'Academy_Database.xlsx';
const DB_PATH = path.join(DB_DIR, DB_FILE);
const BACKUP_DIR = isVercel ? path.join(os.tmpdir(), 'backups') : path.join(ROOT_DIR, 'backups');

// Seed writable temp storage with the bundled database template on Vercel cold start
if (isVercel) {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_PATH) && fs.existsSync(TEMPLATE_DB_PATH)) {
      fs.copyFileSync(TEMPLATE_DB_PATH, DB_PATH);
      console.log('[VERCEL INIT] Initialized writable Excel database at:', DB_PATH);
    }
  } catch (err) {
    console.error('[VERCEL INIT ERROR]', err.message);
  }
}

module.exports = {
  PORT: process.env.PORT || 5050,
  JWT_SECRET: process.env.JWT_SECRET || 'ams_super_secret_jwt_key_2026_excel_secured',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://vtechdon2026_db_user:uD8sEhPq9tZnH67y@cluster0.0g4i3fd.mongodb.net/ams?retryWrites=true&w=majority&appName=Cluster0',
  ROOT_DIR,
  DB_DIR,
  DB_PATH,
  BACKUP_DIR,
  TEMPLATE_DB_PATH,
  isVercel,
};
