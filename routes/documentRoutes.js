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

// Input Data (Upload file & manual KK)
router.post(
  '/',
  authorizeRoles('superadmin', 'admin', 'user'),
  upload.single('file'),
  uploadDocument
);

router.post(
  '/manual/kk',
  authorizeRoles('superadmin', 'admin', 'user'),
  createKKManual
);

// Import Excel
router.post(
  '/import/excel',
  // authorizeRoles('superadmin', 'admin'),
  upload.single('file'),
  importExcelKK
);

// Modifikasi Dokumen (Edit, Hapus, Copy)
router.put('/:id', authorizeRoles('superadmin', 'admin', 'user'), updateDocument);
router.delete('/:id', authorizeRoles('superadmin', 'admin', 'user'), deleteDocument);
router.post('/:id/copy', authorizeRoles('superadmin', 'admin'), copyDocument);

// View Dokumen (User Biasa)
router.get(
  '/',
  authorizeRoles('superadmin', 'admin', 'user', 'guest'),
  getDocuments
);

router.get(
  '/file/:filename',
  authorizeRoles('superadmin', 'admin', 'user', 'guest'),
  getDocumentFile
);

// View Semua Dokumen (Admin / Exec)
router.get(
  '/all',
  authorizeRoles('superadmin', 'admin', 'guest'),
  adminListDocuments
);

/* ==============================
   B. ROUTES USER DATA & SOSIAL
   (pindahan dari userDataRoutes.js)
================================ */

/**
 * 1) KESEJAHTERAAN
 * base path contoh:
 *   - GET  /kesejahteraan/search
 *   - POST /kesejahteraan
 *   - GET  /kesejahteraan/list
 */
router.get(
  '/kesejahteraan/search',
  authorizeRoles('superadmin', 'admin', 'user'),
  searchKKByNomor
);

router.post(
  '/kesejahteraan',
  authorizeRoles('superadmin', 'admin', 'user'),
  createOrUpdateKesejahteraan
);

router.get(
  '/kesejahteraan/list',
  authorizeRoles('superadmin', 'admin', 'user'),
  listUserKesejahteraan
);

/**
 * 2) KESEJAHTERAAN / EMPLOYMENT
 * base path contoh:
 *   - GET    /kesejahteraan/search
 *   - PUT    /kesejahteraan
 *   - GET    /kesejahteraan/list
 *   - DELETE /kesejahteraan/:id
 */
router.get(
  '/kesejahteraan/search',
  authorizeRoles('superadmin', 'admin', 'user'),
  searchEmploymentByNIK
);

router.put(
  '/kesejahteraan',
  authorizeRoles('superadmin', 'admin', 'user'),
  updateEmploymentData
);

router.get(
  '/kesejahteraan/list',
  authorizeRoles('superadmin', 'admin', 'user'),
  listUserEmployment
);

router.delete(
  '/kesejahteraan/:id',
  authorizeRoles('superadmin', 'admin', 'user'),
  deleteUserEmployment
);

module.exports = router;
