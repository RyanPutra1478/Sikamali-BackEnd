const db = require('../config/database');

const UserModel = {
    getAll: async () => {
        const [rows] = await db.query(`
            SELECT u.*, r.name as role 
            FROM users u 
            LEFT JOIN roles r ON u.role_id = r.id
        `);
        return rows;
    },

    getById: async (id) => {
        const [rows] = await db.query(`
            SELECT u.*, r.name as role 
            FROM users u 
            LEFT JOIN roles r ON u.role_id = r.id 
            WHERE u.id = ?
        `, [id]);
        return rows[0];
    },

    getByUsername: async (username) => {
        const [rows] = await db.query(`
            SELECT u.*, r.name as role 
            FROM users u 
            LEFT JOIN roles r ON u.role_id = r.id 
            WHERE u.username = ?
        `, [username]);
        return rows[0];
    },

    create: async (userData) => {
        const fields = [];
        const placeholders = [];
        const values = [];

        for (const [key, value] of Object.entries(userData)) {
            fields.push(key);
            placeholders.push('?');
            values.push(value);
        }

        const sql = `INSERT INTO users (${fields.join(', ')}) VALUES (${placeholders.join(', ')})`;
        const [result] = await db.query(sql, values);
        return result.insertId;
    },

    update: async (id, userData) => {
        const fields = [];
        const values = [];
        for (const [key, value] of Object.entries(userData)) {
            fields.push(`${key} = ?`);
            values.push(value);
        }
        values.push(id);
        const [result] = await db.query(
            `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
            values
        );
        return result.affectedRows;
    },

    delete: async (id) => {
        const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
        return result.affectedRows;
    }
};

module.exports = UserModel;
