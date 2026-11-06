const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const ROOT_DIR = path.resolve(__dirname, '../..');
const DB_DIR = path.join(ROOT_DIR, 'database');
const DB_FILE = process.env.EXCEL_DB_FILE || 'Academy_Database.xlsx';
const DB_PATH = path.join(DB_DIR, DB_FILE);
const BACKUP_DIR = path.join(ROOT_DIR, 'backups');

module.exports = {
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET || 'ams_super_secret_jwt_key_2026_excel_secured',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://vtechdon2026_db_user:uD8sEhPq9tZnH67y@cluster0.0g4i3fd.mongodb.net/ams?retryWrites=true&w=majority&appName=Cluster0',
  ROOT_DIR,
  DB_DIR,
  DB_PATH,
  BACKUP_DIR,
};

