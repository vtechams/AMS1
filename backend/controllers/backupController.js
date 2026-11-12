const excelService = require('../services/excelService');
const fs = require('fs');
const path = require('path');
const config = require('../config/config');

exports.listBackups = async (req, res) => {
  try {
    const backups = await excelService.listBackups();
    return res.json({ success: true, count: backups.length, backups });
  } catch (error) {
    console.error('[BACKUP LIST ERROR]', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve backups' });
  }
};

exports.createBackup = async (req, res) => {
  try {
    const backupName = await excelService.createBackup('manual');
    return res.json({
      success: true,
      message: 'Workbook backup created successfully',
      filename: backupName
    });
  } catch (error) {
    console.error('[BACKUP CREATE ERROR]', error);
    return res.status(500).json({ success: false, message: 'Failed to create backup' });
  }
};

exports.restoreBackup = async (req, res) => {
  try {
    const { filename } = req.body;
    if (!filename) {
      return res.status(400).json({ success: false, message: 'Backup filename is required' });
    }

    const result = await excelService.restoreBackup(filename);
    return res.json({ success: true, message: result.message });
  } catch (error) {
    console.error('[BACKUP RESTORE ERROR]', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to restore backup' });
  }
};

exports.checkWorkbookHealth = async (req, res) => {
  try {
    const exists = fs.existsSync(config.DB_PATH);
    if (!exists) {
      return res.status(404).json({ success: false, message: 'Database file not found on disk' });
    }

    const stats = await fs.promises.stat(config.DB_PATH);
    const workbook = await excelService.loadWorkbook();
    const sheets = workbook.worksheets.map((s) => ({
      name: s.name,
      rowCount: s.rowCount,
      columnCount: s.columnCount
    }));

    return res.json({
      success: true,
      health: 'Optimal',
      filePath: config.DB_PATH,
      fileSizeKb: Math.round(stats.size / 1024),
      lastModified: stats.mtime,
      worksheets: sheets
    });
  } catch (error) {
    console.error('[CHECK HEALTH ERROR]', error);
    return res.status(500).json({ success: false, message: 'Workbook verification failed: ' + error.message });
  }
};

exports.wipeAllData = async (req, res) => {
  try {
    const result = await excelService.wipeAllData();
    return res.json(result);
  } catch (error) {
    console.error('[WIPE ALL DATA ERROR]', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to wipe database' });
  }
};

exports.seed100 = async (req, res) => {
  try {
    const result = await excelService.seed100Data();
    return res.json(result);
  } catch (error) {
    console.error('[SEED 100 ERROR]', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to populate 100 records' });
  }
};



