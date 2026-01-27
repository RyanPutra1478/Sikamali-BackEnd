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

const AnnouncementModel = {
    getAll: async () => {
        const [rows] = await db.query('SELECT * FROM announcements WHERE is_active = 1 ORDER BY created_at DESC');
        return rows;
    },

    create: async (data) => {
        const { title, content, created_by } = data;
        const [result] = await db.query(
            'INSERT INTO announcements (title, content, created_by) VALUES (?, ?, ?)',
            [title, content, created_by]
        );
        return result.insertId;
    }
};

module.exports = { ActivityLogModel, AnnouncementModel };
