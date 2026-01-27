const express = require('express');
const router = express.Router();
const kkController = require('../controllers/kkController');
const { authMiddleware, authenticatedOnly } = require('../middleware/auth');

// Preview KK Routes
router.get('/kk', authMiddleware, authenticatedOnly, kkController.getKKPreview);

// Preview Member Routes
router.get('/member', authMiddleware, authenticatedOnly, kkController.getMemberPreview);

module.exports = router;
