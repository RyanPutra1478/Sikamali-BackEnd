const pool = require('../config/database');

async function up() {
  const sql = `
    CREATE TABLE IF NOT EXISTS employment_data (
      id int NOT NULL AUTO_INCREMENT,
      skill_tags longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
      experience_years int DEFAULT NULL,
      cv_path varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
      availability tinyint(1) DEFAULT NULL,
      preferred_roles longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
      kk_id int DEFAULT NULL,
      member_id int DEFAULT NULL,
      status_kerja varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
      tempat_bekerja varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
      created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY employment_data_ibfk_3 (kk_id),
      KEY fk_employment_member (member_id),
      CONSTRAINT employment_data_ibfk_3 FOREIGN KEY (kk_id) REFERENCES kk (id) ON DELETE SET NULL,
      CONSTRAINT fk_employment_member FOREIGN KEY (member_id) REFERENCES kk_members (id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
  `;
  await pool.query(sql);
  console.log('Table employment_data created or already exists.');
}

module.exports = { up };
