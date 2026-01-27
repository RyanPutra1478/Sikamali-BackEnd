const PublicService = require('../services/publicService');

exports.getLandingStats = async (req, res) => {
    try {
        const { desa } = req.query;
        const stats = await PublicService.getLandingStats(desa);
        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getVillages = async (req, res) => {
    try {
        const villages = await PublicService.getAvailableVillages();
        res.json(villages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAnnouncements = async (req, res) => {
    try {
        const announcements = await PublicService.getActiveAnnouncements();
        res.json(announcements);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getComparisonData = async (req, res) => {
    try {
        const data = await PublicService.getVillageComparison();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
