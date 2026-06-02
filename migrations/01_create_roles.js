const db = require('../config/database');

async function up() {
    await db.query(`
        CREATE TABLE IF NOT EXISTS roles (
            id INT NOT NULL AUTO_INCREMENT,
            name VARCHAR(50) NOT NULL,
            display_name VARCHAR(100) NOT NULL,
            description TEXT,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY name (name)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);
    console.log('Table roles created.');

    // Seed default roles
    const roles = [
        { name: 'superadmin', display_name: 'Super Administrator', description: 'Akses penuh ke semua fitur' },
        { name: 'admin', display_name: 'Administrator', description: 'Akses pengelolaan data' },
        { name: 'user', display_name: 'User', description: 'Akses input data' },
        { name: 'viewer', display_name: 'Viewer', description: 'Akses lihat data preview' },
        { name: 'guest', display_name: 'Tamu', description: 'Akses baca saja' }
    ];

    for (const role of roles) {
        const [existing] = await db.query('SELECT id FROM roles WHERE name = ?', [role.name]);
        if (existing.length === 0) {
            await db.query('INSERT INTO roles (name, display_name, description) VALUES (?, ?, ?)',
                [role.name, role.display_name, role.description]);
            console.log(`  Seeded role: ${role.name}`);
        }
    }
}

module.exports = { up };
