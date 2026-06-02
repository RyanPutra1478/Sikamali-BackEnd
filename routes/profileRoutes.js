const express = require('express');
const router = express.Router();
// Import controller yang sudah Anda buat
const { updateProfile, getProfile } = require('../controllers/profileController');
const { authMiddleware } = require('../middleware/auth');

// Pasang Auth Middleware (Wajib Login)
router.use(authMiddleware);

// GET /api/profile -> Ambil data
router.get('/', getProfile);

// PUT /api/profile -> Update data (Lengkapi Profil)
router.put('/', updateProfile);

module.exports = router;