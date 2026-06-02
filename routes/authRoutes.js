const express = require('express');
const router = express.Router();
const { login, changePassword, refreshToken, logout, getMe } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

// Authentication endpoints
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);
router.get('/me', authMiddleware, getMe);
router.post('/change-password', authMiddleware, changePassword);

module.exports = router;