const express = require('express');
const router = express.Router();
const { getDashboardStats, getDetailedStats } = require('../controllers/statisticController');
const { authMiddleware, authenticatedOnly } = require('../middleware/auth');

// Apply authentication middleware - all logged-in roles can access, except guest
router.use(authMiddleware);
router.use(authenticatedOnly);

// GET /api/statistics/ or GET /api/stats/
router.get('/', getDetailedStats);

// GET /api/statistics/dashboard or GET /api/stats/dashboard
router.get('/dashboard', getDashboardStats);

// GET /api/statistics/detailed or GET /api/stats/detailed
router.get('/detailed', getDetailedStats);

module.exports = router;
