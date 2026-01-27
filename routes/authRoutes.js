const express = require('express');
const router = express.Router();
const { login, changePassword } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

// Route POST /login
router.post('/login', login);

// Route POST /change-password
router.post('/change-password', authMiddleware, changePassword);

module.exports = router;