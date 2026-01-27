const express = require('express');
const router = express.Router();
const { getZones, createZone, updateZone, deleteZone } = require('../controllers/zoneController');
const { authMiddleware, authorizeRoles } = require('../middleware/auth');

router.use(authMiddleware);

// Get all zones (Accessible by Admin, Super Admin)
// Maybe User needs it too for selection? Let's allow User too if needed, but for now Admin/SuperAdmin as per request "Data Zona" in "Location & Domicile" for Admin.
// User request: "Admin: FULL ACCESS ... LOKASI & DOMISILI"
// "User: ACCESS TERBATAS..."
// "Guest: Read only ke Data Preview"
// So Zones management is likely Admin/SuperAdmin.
router.get('/', authorizeRoles('superadmin', 'admin'), getZones);
router.post('/', authorizeRoles('superadmin', 'admin'), createZone);
router.put('/:id', authorizeRoles('superadmin', 'admin'), updateZone);
router.delete('/:id', authorizeRoles('superadmin', 'admin'), deleteZone);

module.exports = router;
