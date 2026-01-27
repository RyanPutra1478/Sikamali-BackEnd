const express = require('express');
const router = express.Router();
const kkController = require('../controllers/kkController');
const { authMiddleware } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Member Routes
router.get('/members', authMiddleware, kkController.getAllMembers);
router.post('/members', authMiddleware, kkController.addKKMember);
router.put('/members/:id', authMiddleware, kkController.updateKKMember);
router.delete('/members/:id', authMiddleware, kkController.deleteKKMember);

// KK Routes
router.post('/header', authMiddleware, upload.single('foto_rumah'), kkController.createKKHeader);
router.put('/header/:id', authMiddleware, upload.single('foto_rumah'), kkController.updateKKHeader);
router.delete('/header/:id', authMiddleware, kkController.deleteKKHeader);
router.get('/:id', authMiddleware, kkController.getKKDetail);

module.exports = router;
