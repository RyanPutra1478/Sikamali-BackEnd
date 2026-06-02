const express = require('express');
const router = express.Router();
const kkController = require('../controllers/kkController');
const { authMiddleware, authorizeRoles } = require('../middleware/auth');
const upload = require('../middleware/upload');
const uploadExcel = require('../middleware/uploadExcel');
const importController = require('../controllers/importController');

// Semua route KK butuh role Admin/Superadmin/User
router.use(authMiddleware);
router.use(authorizeRoles('superadmin', 'admin', 'user'));

// Member Routes
router.get('/members', kkController.getAllMembers);
router.post('/members', kkController.addKKMember);
router.put('/members/:id', kkController.updateKKMember);
router.delete('/members/:id', kkController.deleteKKMember);

// Import Route
router.post('/import/excel', uploadExcel.array('file', 10), importController.importExcelKK);

// KK Routes
router.post('/header', upload.single('foto_rumah'), kkController.createKKHeader);
router.put('/header/:id', upload.single('foto_rumah'), kkController.updateKKHeader);
router.delete('/header/:id', kkController.deleteKKHeader);
router.get('/:id', kkController.getKKDetail);

module.exports = router;
