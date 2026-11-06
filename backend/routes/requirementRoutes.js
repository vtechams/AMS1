const express = require('express');
const router = express.Router();
const requirementController = require('../controllers/requirementController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, requirementController.getAllRequirements);
router.get('/:id', authMiddleware, requirementController.getRequirementById);
router.post('/', authMiddleware, requirementController.createRequirement);
router.put('/:id', authMiddleware, requirementController.updateRequirement);

module.exports = router;

