const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, companyController.getAllCompanies);
router.get('/:id', authMiddleware, companyController.getCompanyById);
router.post('/', authMiddleware, companyController.createCompany);
router.put('/:id', authMiddleware, companyController.updateCompany);
router.put('/:id/archive', authMiddleware, companyController.archiveCompany);
router.put('/:id/restore', authMiddleware, companyController.restoreCompany);

module.exports = router;

