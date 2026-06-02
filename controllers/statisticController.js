const StatService = require('../services/statService');

async function getDashboardStats(req, res) {
  try {
    const stats = await StatService.getDashboardStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getDetailedStats(req, res) {
  try {
    const detailedStats = await StatService.getDetailedStats();
    res.json(detailedStats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getDashboardStats,
  getDetailedStats
};
