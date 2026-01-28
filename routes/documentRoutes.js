const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 1. IMPORT SEMUA FUNGSI DARI CONTROLLER (SUDAH GABUNG)
const {
  uploadDocument,
  updateDocument,
  deleteDocument,
  getDocuments,
  getDocumentFile,
  adminListDocuments,
  copyDocument,
  createKKManual,
  searchKKByNomor,
  createOrUpdateKesejahteraan,
  listUserKesejahteraan,
  searchEmploymentByNIK,
  updateEmploymentData,
  listUserEmployment,
  deleteUserEmployment,
} = require('../controllers/documentController');
const { importExcelKK } = require('../controllers/importController');

// 2. IMPORT MIDDLEWARE
const { authMiddleware, authorizeRoles } = require('../middleware/auth');

// 3. SETUP MULTER (UPLOAD FILE)
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + '-' + file.originalname),
});

const upload = multer({ storage });

// Semua route di sini wajib login
router.use(authMiddleware);

/* ==============================
   A. ROUTES DOKUMEN & KK
   (yang lama dari documentRoutes.js)
================================ */

// Import Excel
router.post(
  '/import/excel',
  authorizeRoles('superadmin'),
  upload.single('file'),
  importExcelKK
);

// Modifikasi Dokumen (Edit, Hapus, Copy)
router.put('/:id', authorizeRoles('superadmin', 'admin'), updateDocument);
router.delete('/:id', authorizeRoles('superadmin', 'admin'), deleteDocument);
router.post('/:id/copy', authorizeRoles('superadmin', 'admin'), copyDocument);

// View Dokumen (Admin / Exec)
router.get(
  '/',
  authorizeRoles('superadmin', 'admin'),
  getDocuments
);

// View Semua Dokumen (Admin / Exec)
router.get(
  '/all',
  authorizeRoles('superadmin', 'admin'),
  adminListDocuments
);

/* ==============================
   B. ROUTES USER DATA & SOSIAL
   (pindahan dari userDataRoutes.js)
================================ */

/**
 * 1) KESEJAHTERAAN
 */
router.get(
  '/kesejahteraan/search',
  authorizeRoles('superadmin', 'admin'),
  searchKKByNomor
);

router.post(
  '/kesejahteraan',
  authorizeRoles('superadmin', 'admin'),
  createOrUpdateKesejahteraan
);

router.get(
  '/kesejahteraan/list',
  authorizeRoles('superadmin', 'admin'),
  listUserKesejahteraan
);

/**
 * 2) EMPLOYMENT
 */
router.get(
  '/employment/search',
  authorizeRoles('superadmin', 'admin'),
  searchEmploymentByNIK
);

router.put(
  '/employment',
  authorizeRoles('superadmin', 'admin'),
  updateEmploymentData
);

router.get(
  '/employment/list',
  authorizeRoles('superadmin', 'admin'),
  listUserEmployment
);

router.delete(
  '/employment/:id',
  authorizeRoles('superadmin', 'admin'),
  deleteUserEmployment
);

module.exports = router;
