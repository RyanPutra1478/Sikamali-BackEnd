const db = require('../config/database');

async function up() {
    await db.query(`
        CREATE TABLE IF NOT EXISTS users (
            id INT NOT NULL AUTO_INCREMENT,
            username VARCHAR(50) NOT NULL,
            email VARCHAR(100) DEFAULT NULL,
            password VARCHAR(255) NOT NULL,
            nama VARCHAR(100) DEFAULT NULL,
            role_id INT DEFAULT NULL,
            telepon VARCHAR(20) DEFAULT NULL,
            status VARCHAR(50) NOT NULL DEFAULT 'active',
            must_change_password TINYINT(1) DEFAULT 0,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY username (username),
            UNIQUE KEY email (email),
            KEY role_id (role_id),
            CONSTRAINT users_ibfk_1 FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);
    console.log('Table users created.');

    await db.query(`
        CREATE TABLE IF NOT EXISTS refresh_tokens (
            id INT NOT NULL AUTO_INCREMENT,
            user_id INT NOT NULL,
            token VARCHAR(255) NOT NULL,
            expires_at DATETIME NOT NULL,
            created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY token (token),
            KEY refresh_tokens_ibfk_1 (user_id),
            CONSTRAINT refresh_tokens_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);
    console.log('Table refresh_tokens created.');
}

module.exports = { up };
