const express = require('express');
const router = express.Router();
const batchController = require('../controllers/batchController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, batchController.getAllBatches);
router.get('/:id', authMiddleware, batchController.getBatchById);
router.post('/', authMiddleware, batchController.createBatch);
router.put('/:id', authMiddleware, batchController.updateBatch);
router.delete('/:id', authMiddleware, batchController.deleteBatch);
router.post('/transfer-student', authMiddleware, batchController.transferStudent);

module.exports = router;

