const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');
const { authMiddleware } = require('../middleware/auth');

router.get('/admissions', authMiddleware, reportsController.getAdmissionReports);
router.get('/batches', authMiddleware, reportsController.getBatchReports);
router.get('/placements', authMiddleware, reportsController.getPlacementReports);
router.get('/export-full-database', authMiddleware, reportsController.exportFullDatabase);
router.get('/export/:reportType', authMiddleware, reportsController.exportReportExcel);

module.exports = router;

