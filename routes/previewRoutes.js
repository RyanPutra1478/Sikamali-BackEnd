const express = require('express');
const router = express.Router();
const kkController = require('../controllers/kkController');
const { authMiddleware, authorizeRoles } = require('../middleware/auth');

// Preview KK Routes
router.get('/kk', authMiddleware, authorizeRoles('superadmin', 'admin', 'user', 'viewer'), kkController.getKKPreview);

// Preview Member Routes
router.get('/member', authMiddleware, authorizeRoles('superadmin', 'admin', 'user', 'viewer'), kkController.getMemberPreview);

module.exports = router;
