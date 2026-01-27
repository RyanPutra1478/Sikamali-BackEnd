const pool = require('../config/database');
const bcrypt = require('bcryptjs');

async function up() {
    // 1. Seed Roles
    const roles = [
        { name: 'superadmin', display_name: 'Super Administrator', description: 'Highest level access' },
        { name: 'admin', display_name: 'Administrator', description: 'Full access to manage records' },
        { name: 'user', display_name: 'User', description: 'Internal company staff' },
        { name: 'guest', display_name: 'Guest', description: 'Read only access' }
    ];

    for (const role of roles) {
        await pool.query(
            'INSERT IGNORE INTO roles (name, display_name, description) VALUES (?, ?, ?)',
            [role.name, role.display_name, role.description]
        );
    }
    console.log('Roles seeded.');

    // Get Role IDs
    const [roleRows] = await pool.query('SELECT id, name FROM roles');
    const roleMap = roleRows.reduce((acc, row) => {
        acc[row.name] = row.id;
        return acc;
    }, {});

    // 2. Seed Users
    const users = [
        {
            username: 'admin',
            password: 'admin123',
            nama: 'Super Admin',
            role_id: roleMap['superadmin'],
            email: 'admin@sikamali.com'
        },
        {
            username: 'anugrah',
            password: 'anugrah123',
            nama: 'Anugrah (Admin)',
            role_id: roleMap['admin'],
            email: 'anugrah@sikamali.com'
        },
        {
            username: 'user',
            password: 'user123',
            nama: 'Regular User',
            role_id: roleMap['user'],
            email: 'user@sikamali.com'
        },
        {
            username: 'guest',
            password: 'guest123',
            nama: 'Guest User',
            role_id: roleMap['guest'],
            email: 'guest@sikamali.com'
        }
    ];

    for (const user of users) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        await pool.query(
            'INSERT IGNORE INTO users (username, password, nama, role_id, email) VALUES (?, ?, ?, ?, ?)',
            [user.username, hashedPassword, user.nama, user.role_id, user.email]
        );
    }
    console.log('Default users seeded.');
}

module.exports = { up };
