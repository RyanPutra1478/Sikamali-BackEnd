const express = require('express');
const router = express.Router();

// Import upload middleware
const upload = require('../middleware/upload');

// --- IMPOR FUNGSI CONTROLLER ---
const {
  getDashboardStats,
  getKKTable,
  getEmploymentData,
  getKesejahteraanData,
  createKesejahteraan,
  getUsersWithKK,
  listUsers,
  createUser,
  deleteUser,
  updateUserRole,
  getLandData,
  updateLandData,
  deleteEmploymentData,
  deleteKesejahteraanRecord,
  updateEmploymentFull, // Fungsi Update Penuh (BY NIK, BUKAN BY ID)
  updateKesejahteraanRecord,
  updateUserPassword,
} = require('../controllers/adminController');

const { authMiddleware, authorizeRoles } = require('../middleware/auth');

// Semua route admin butuh login
router.use(authMiddleware);

// ======================================================
//  GROUP 1: DASHBOARD & DATA PREVIEW (READ ONLY)
// ======================================================

// Boleh diakses oleh superadmin & admin
router.get(
  '/stats',
  authorizeRoles('superadmin', 'admin'),
  getDashboardStats
);

// Data tabel admin (KK, Employment, Prasejahtera, Land)
// Dibuka hanya untuk superadmin & admin
router.get('/kk', authorizeRoles('superadmin', 'admin'), getKKTable);
router.get('/employment', authorizeRoles('superadmin', 'admin'), getEmploymentData);
router.get('/kesejahteraan', authorizeRoles('superadmin', 'admin'), getKesejahteraanData);
router.get('/land', authorizeRoles('superadmin', 'admin'), getLandData);

// ======================================================
//  GROUP 2: DATA MANAGEMENT (DB Record) → superadmin & admin
// ======================================================

// Kesejahteraan Management
router.post(
  '/kesejahteraan',
  authorizeRoles('superadmin', 'admin'),
  createKesejahteraan
);

router.delete(
  '/kesejahteraan/:id',
  authorizeRoles('superadmin'),
  deleteKesejahteraanRecord
);

// Land Management
router.put(
  '/land/:id',
  authorizeRoles('superadmin', 'admin'),
  upload.single('foto_rumah'),
  updateLandData
);

// Employment Actions
router.delete(
  '/employment/:id',
  authorizeRoles('superadmin'),
  deleteEmploymentData
);

// UPDATE LENGKAP (BY NIK, TANPA :id DI URL)
router.put(
  '/employment/full',
  authorizeRoles('superadmin', 'admin'),
  updateEmploymentFull
);



router.put(
  '/kesejahteraan/:id',
  authorizeRoles('superadmin', 'admin'),
  updateKesejahteraanRecord
);

router.delete(
  '/kesejahteraan/:id',
  authorizeRoles('superadmin'),
  deleteKesejahteraanRecord
);

// ======================================================
//  GROUP 3: USER MANAGEMENT (AKUN & ROLE) → SUPERADMIN ONLY
// ======================================================

router.get(
  '/users-with-kk',
  authorizeRoles('superadmin', 'admin'),
  getUsersWithKK
);

router.get(
  '/users',
  authorizeRoles('superadmin'),
  listUsers
);

router.post(
  '/users',
  authorizeRoles('superadmin'),
  createUser
);

router.delete(
  '/users/:id',
  authorizeRoles('superadmin'),
  deleteUser
);

router.put(
  '/users/:id/role',
  authorizeRoles('superadmin'),
  updateUserRole
);

router.put(
  '/users/:id/password',
  authorizeRoles('superadmin'),
  updateUserPassword
);

module.exports = router;
