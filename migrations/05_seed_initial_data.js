const db = require('../config/database');
const bcrypt = require('bcryptjs');

async function up() {
    // Seed admin user jika belum ada
    const [existing] = await db.query('SELECT id FROM users WHERE username = ?', ['admin']);
    if (existing.length === 0) {
        const [roles] = await db.query('SELECT id FROM roles WHERE name = ?', ['superadmin']);
        if (roles.length > 0) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await db.query(
                'INSERT INTO users (username, password, nama, role_id, must_change_password) VALUES (?, ?, ?, ?, ?)',
                ['admin', hashedPassword, 'Administrator', roles[0].id, 1]
            );
            console.log('Admin user seeded (username: admin, password: admin123)');
        }
    } else {
        console.log('Admin user already exists, skipping seed.');
    }

    // Seed viewer user
    const [existingViewer] = await db.query('SELECT id FROM users WHERE username = ?', ['viewer']);
    if (existingViewer.length === 0) {
        const [viewerRoles] = await db.query('SELECT id FROM roles WHERE name = ?', ['viewer']);
        if (viewerRoles.length > 0) {
            const hashedPassword = await bcrypt.hash('viewer123', 10);
            await db.query(
                'INSERT INTO users (username, password, nama, role_id, must_change_password) VALUES (?, ?, ?, ?, ?)',
                ['viewer', hashedPassword, 'Viewer Sikamali', viewerRoles[0].id, 0]
            );
            console.log('Viewer user seeded (username: viewer, password: viewer123)');
        }
    } else {
        console.log('Viewer user already exists, skipping seed.');
    }
}

module.exports = { up };
