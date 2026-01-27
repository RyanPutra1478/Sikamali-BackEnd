const express = require('express');
const router = express.Router();
const {
  createLandPlot,
  getLandPlots,
  getKKByNomor,
  updateLandPlot,
  deleteLandPlot,
  getLandPhoto,
  searchKK
} = require('../controllers/landController');
const upload = require('../middleware/upload');
const { authMiddleware, authorizeRoles } = require('../middleware/auth');

router.get('/foto/:filename', getLandPhoto);
router.use(authMiddleware);

router.get('/search', authorizeRoles('superadmin', 'admin', 'user'), searchKK);
router.get('/kk/:nomor_kk', authorizeRoles('superadmin', 'admin', 'user'), getKKByNomor);

router.post(
  '/',
  authorizeRoles('superadmin', 'admin', 'user'),
  upload.single('foto_rumah'),
  createLandPlot
);
router.get('/', authorizeRoles('superadmin', 'admin', 'user'), getLandPlots);
router.put(
  '/:id',
  authorizeRoles('superadmin', 'admin'),
  upload.single('foto_rumah'),
  updateLandPlot
);
router.delete('/:id', authorizeRoles('superadmin', 'admin'), deleteLandPlot);

module.exports = router;