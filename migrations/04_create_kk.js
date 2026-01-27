const pool = require('../config/database');

async function up() {
  const sql = `
    CREATE TABLE IF NOT EXISTS kk (
      id int NOT NULL AUTO_INCREMENT,
      kepala_keluarga varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
      alamat text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
      nomor_kk varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
      desa varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
      kecamatan varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
      zona_lingkar_tambang varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
      tanggal_diterbitkan date DEFAULT NULL,
      kabupaten varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
      provinsi varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
      created_by int DEFAULT NULL,
      created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY kk_ibfk_2 (created_by),
      CONSTRAINT kk_ibfk_2 FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
  `;
  await pool.query(sql);
  console.log('Table kk created or already exists.');
}

module.exports = { up };
