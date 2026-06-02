const db = require('../config/database');

async function up() {

    // Tabel Activity Log
    await db.query(`
        CREATE TABLE IF NOT EXISTS activity_logs (
            id INT NOT NULL AUTO_INCREMENT,
            user_id INT DEFAULT NULL,
            action VARCHAR(50) NOT NULL,
            entity VARCHAR(50) NOT NULL,
            entity_id INT DEFAULT NULL,
            details TEXT,
            ip_address VARCHAR(50) DEFAULT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            CONSTRAINT activity_logs_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('Table activity_logs created.');
}

module.exports = { up };
