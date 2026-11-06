const express = require('express');
const router = express.Router();
const backupController = require('../controllers/backupController');
const { authMiddleware } = require('../middleware/auth');

router.get('/health', authMiddleware, backupController.checkWorkbookHealth);
router.get('/', authMiddleware, backupController.listBackups);
router.post('/create', authMiddleware, backupController.createBackup);
router.post('/restore', authMiddleware, backupController.restoreBackup);

module.exports = router;

