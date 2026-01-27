const db = require('../config/database');

const DocumentModel = {
    getAll: async () => {
        const [rows] = await db.query('SELECT * FROM documents ORDER BY created_at DESC');
        return rows;
    },

    getById: async (id) => {
        const [rows] = await db.query('SELECT * FROM documents WHERE id = ?', [id]);
        return rows[0];
    },

    create: async (docData) => {
        const { user_id, type, file_path, original_name, status } = docData;
        const [result] = await db.query(
            'INSERT INTO documents (user_id, type, file_path, original_name, status) VALUES (?, ?, ?, ?, ?)',
            [user_id, type, file_path, original_name, status || 'pending']
        );
        return result.insertId;
    },

    updateStatus: async (id, status) => {
        const [result] = await db.query('UPDATE documents SET status = ? WHERE id = ?', [status, id]);
        return result.affectedRows;
    },

    delete: async (id) => {
        const [result] = await db.query('DELETE FROM documents WHERE id = ?', [id]);
        return result.affectedRows;
    }
};

module.exports = DocumentModel;
