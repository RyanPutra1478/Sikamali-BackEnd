const express = require('express');
const router = express.Router();
const { getAnnouncements, createAnnouncement, deleteAnnouncement, toggleStatus } = require('../controllers/announcementController');
const { authMiddleware, authorizeRoles } = require('../middleware/auth');

router.use(authMiddleware);

// Semua user login boleh lihat
router.get('/', getAnnouncements);

// Hanya Admin & Eksekutif yang boleh kelola
router.post('/', authorizeRoles('superadmin', 'admin', 'executive_guest'), createAnnouncement);
router.delete('/:id', authorizeRoles('superadmin', 'admin', 'executive_guest'), deleteAnnouncement);
router.put('/:id/toggle', authorizeRoles('superadmin', 'admin', 'executive_guest'), toggleStatus);

module.exports = router;