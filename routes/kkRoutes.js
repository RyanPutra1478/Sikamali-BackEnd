const express = require('express');
const router = express.Router();
const kkController = require('../controllers/kkController');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Semua route KK butuh role Admin/Superadmin
router.use(authMiddleware);
router.use(adminOnly);

// Member Routes
router.get('/members', kkController.getAllMembers);
router.post('/members', kkController.addKKMember);
router.put('/members/:id', kkController.updateKKMember);
router.delete('/members/:id', kkController.deleteKKMember);

// KK Routes
router.post('/header', upload.single('foto_rumah'), kkController.createKKHeader);
router.put('/header/:id', upload.single('foto_rumah'), kkController.updateKKHeader);
router.delete('/header/:id', kkController.deleteKKHeader);
router.get('/:id', kkController.getKKDetail);

module.exports = router;
