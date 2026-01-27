const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

// Landing Page Stats
router.get('/stats', publicController.getLandingStats);
router.get('/comparison', publicController.getComparisonData);
router.get('/villages', publicController.getVillages);
router.get('/announcements', publicController.getAnnouncements);

module.exports = router;

