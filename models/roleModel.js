const db = require('../config/database');

const RoleModel = {
    getAll: async () => {
        const [rows] = await db.query('SELECT * FROM roles');
        return rows;
    },

    getByName: async (name) => {
        const [rows] = await db.query('SELECT * FROM roles WHERE name = ?', [name]);
        return rows[0];
    },

    getById: async (id) => {
        const [rows] = await db.query('SELECT * FROM roles WHERE id = ?', [id]);
        return rows[0];
    }
};

module.exports = RoleModel;
