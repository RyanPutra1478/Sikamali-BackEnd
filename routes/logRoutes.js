const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');
const { authMiddleware, superAdminOnly } = require('../middleware/auth');

// Only Super Admin can view logs
router.get('/', authMiddleware, superAdminOnly, logController.getLogs);

module.exports = router;
