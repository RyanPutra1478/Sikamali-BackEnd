const db = require('./config/database');
const bcrypt = require('bcryptjs');

async function run() {
    try {
        console.log('Adding viewer role to roles table...');
        const [existingRole] = await db.query('SELECT id FROM roles WHERE name = ?', ['viewer']);
        let roleId;

        if (existingRole.length === 0) {
            const [result] = await db.query(
                'INSERT INTO roles (name, display_name, description) VALUES (?, ?, ?)',
                ['viewer', 'Viewer', 'Akses lihat data preview']
            );
            roleId = result.insertId;
            console.log('Role "viewer" created with ID:', roleId);
        } else {
            roleId = existingRole[0].id;
            console.log('Role "viewer" already exists with ID:', roleId);
        }

        console.log('Adding viewer user...');
        const [existingUser] = await db.query('SELECT id FROM users WHERE username = ?', ['viewer']);
        if (existingUser.length === 0) {
            const hashedPassword = await bcrypt.hash('viewer123', 10);
            await db.query(
                'INSERT INTO users (username, password, nama, role_id, must_change_password) VALUES (?, ?, ?, ?, ?)',
                ['viewer', hashedPassword, 'Viewer Sikamali', roleId, 0]
            );
            console.log('User "viewer" created successfully! (Password: viewer123)');
        } else {
            console.log('User "viewer" already exists.');
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit(0);
    }
}

run();
