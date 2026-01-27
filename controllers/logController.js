const LogService = require('../services/logService');

exports.getLogs = async (req, res) => {
    try {
        const result = await LogService.getLogs(req.query);
        res.json(result);
    } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.createLog = async (userId, action, entity, entityId, details, ip) => {
    try {
        await LogService.createLog(userId, action, entity, entityId, details, ip);
    } catch (error) {
        console.error('Error creating log:', error);
    }
};

