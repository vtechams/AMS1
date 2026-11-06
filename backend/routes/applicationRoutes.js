const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, applicationController.getAllApplications);
router.get('/:id', authMiddleware, applicationController.getApplicationById);
router.post('/', authMiddleware, applicationController.createApplication);
router.put('/:id', authMiddleware, applicationController.updateApplication);
router.delete('/:id', authMiddleware, applicationController.deleteApplication);

module.exports = router;

