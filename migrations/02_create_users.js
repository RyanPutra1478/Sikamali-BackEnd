const pool = require('../config/database');

async function up() {
    const sql = `
    CREATE TABLE IF NOT EXISTS users (
      id int NOT NULL AUTO_INCREMENT,
      username varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      email varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
      password varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      nama varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
      role_id int DEFAULT NULL,
      telepon varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
      status varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'active',
      must_change_password tinyint(1) DEFAULT '0',
      created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY username (username),
      UNIQUE KEY email (email),
      KEY role_id (role_id),
      CONSTRAINT users_ibfk_1 FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `;
    await pool.query(sql);
    console.log('Table users created or already exists.');
}

module.exports = { up };
