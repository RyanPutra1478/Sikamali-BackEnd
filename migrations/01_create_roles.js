const pool = require('../config/database');

async function up() {
    const sql = `
    CREATE TABLE IF NOT EXISTS roles (
      id int NOT NULL AUTO_INCREMENT,
      name varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      display_name varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
      description text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
      created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY name (name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `;
    await pool.query(sql);
    console.log('Table roles created or already exists.');
}

module.exports = { up };
