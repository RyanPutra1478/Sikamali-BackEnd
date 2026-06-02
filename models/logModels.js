const db = require('../config/database');

const ActivityLogModel = {
    create: async (logData) => {
        const { user_id, action, entity, entity_id, details, ip_address } = logData;
        const [result] = await db.query(
            'INSERT INTO activity_logs (user_id, action, entity, entity_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)',
            [user_id, action, entity, entity_id, JSON.stringify(details), ip_address]
        );
        return result.insertId;
    },

    getAll: async () => {
        const [rows] = await db.query('SELECT l.*, u.username FROM activity_logs l LEFT JOIN users u ON l.user_id = u.id ORDER BY created_at DESC LIMIT 100');
        return rows;
    }
};

module.exports = { ActivityLogModel };
