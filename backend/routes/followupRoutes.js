const express = require('express');
const router = express.Router();
const followupController = require('../controllers/followupController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, followupController.getAllFollowups);
router.post('/', authMiddleware, followupController.createFollowup);
router.put('/:id', authMiddleware, followupController.updateFollowup);

module.exports = router;

