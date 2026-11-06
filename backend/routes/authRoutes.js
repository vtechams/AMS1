const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

router.post('/login', authController.login);
router.get('/me', authMiddleware, authController.getProfile);
router.put('/update-password', authMiddleware, authController.updatePassword);

module.exports = router;

