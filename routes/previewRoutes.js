const express = require('express');
const router = express.Router();
const kkController = require('../controllers/kkController');
const { authMiddleware, adminOnly } = require('../middleware/auth');

// Preview KK Routes
router.get('/kk', authMiddleware, adminOnly, kkController.getKKPreview);

// Preview Member Routes
router.get('/member', authMiddleware, adminOnly, kkController.getMemberPreview);

module.exports = router;
