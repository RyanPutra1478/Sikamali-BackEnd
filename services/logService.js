const { ActivityLogModel } = require('../models/logModels');
const db = require('../config/database');

const LogService = {
    getLogs: async (filters) => {
        const { limit = 100, offset = 0, search = '' } = filters;

        let query = `
            SELECT l.*, u.username as user_name 
            FROM activity_logs l
            LEFT JOIN users u ON l.user_id = u.id
        `;
        const params = [];

        if (search) {
            query += ` WHERE u.username LIKE ? OR l.action LIKE ? OR l.entity LIKE ?`;
            const searchParam = `%${search}%`;
            params.push(searchParam, searchParam, searchParam);
        }

        query += ` ORDER BY l.created_at DESC LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));

        const [logs] = await db.query(query, params);

        let countQuery = 'SELECT COUNT(*) as total FROM activity_logs l LEFT JOIN users u ON l.user_id = u.id';
        const countParams = [];
        if (search) {
            countQuery += ` WHERE u.username LIKE ? OR l.action LIKE ? OR l.entity LIKE ?`;
            const searchParam = `%${search}%`;
            countParams.push(searchParam, searchParam, searchParam);
        }

        const [[{ total }]] = await db.query(countQuery, countParams);

        return {
            data: logs,
            pagination: {
                total,
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        };
    },

    createLog: async (userId, action, entity, entityId, details, ip) => {
        return await ActivityLogModel.create({
            user_id: userId,
            action,
            entity,
            entity_id: entityId,
            details: JSON.stringify(details),
            ip_address: ip
        });
    }
};

module.exports = LogService;

