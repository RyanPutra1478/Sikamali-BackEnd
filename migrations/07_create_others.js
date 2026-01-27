const pool = require('../config/database');

async function up() {
  const tables = [
    {
      name: 'activity_logs',
      sql: `CREATE TABLE IF NOT EXISTS activity_logs (
        id int NOT NULL AUTO_INCREMENT,
        user_id int DEFAULT NULL,
        action varchar(50) NOT NULL,
        entity varchar(50) NOT NULL,
        entity_id int DEFAULT NULL,
        details text,
        ip_address varchar(50) DEFAULT NULL,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        CONSTRAINT activity_logs_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
    },
    {
      name: 'announcements',
      sql: `CREATE TABLE IF NOT EXISTS announcements (
        id int NOT NULL AUTO_INCREMENT,
        title varchar(255) NOT NULL,
        content text NOT NULL,
        is_active tinyint(1) DEFAULT '1',
        created_by int NOT NULL,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        CONSTRAINT announcements_ibfk_1 FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
    },
    {
      name: 'complaints',
      sql: `CREATE TABLE IF NOT EXISTS complaints (
        id int NOT NULL AUTO_INCREMENT,
        user_id int NOT NULL,
        title varchar(100) DEFAULT NULL,
        message text,
        status enum('open','in_progress','closed') DEFAULT 'open',
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        CONSTRAINT complaints_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
    },
    // {
    //   name: 'ktp_profiles',
    //   sql: `CREATE TABLE IF NOT EXISTS ktp_profiles (
    //     id int NOT NULL AUTO_INCREMENT,
    //     document_id int NOT NULL,
    //     user_id int NOT NULL,
    //     nik varchar(30) NOT NULL,
    //     nama varchar(100) NOT NULL,
    //     tempat_lahir varchar(100) DEFAULT NULL,
    //     tanggal_lahir date DEFAULT NULL,
    //     jenis_kelamin varchar(20) DEFAULT NULL,
    //     alamat text,
    //     golongan_darah varchar(5) DEFAULT NULL,
    //     agama varchar(50) DEFAULT NULL,
    //     status_perkawinan varchar(50) DEFAULT NULL,
    //     pekerjaan varchar(100) DEFAULT NULL,
    //     kewarganegaraan varchar(50) DEFAULT NULL,
    //     created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    //     updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    //     PRIMARY KEY (id),
    //     CONSTRAINT ktp_profiles_ibfk_1 FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE,
    //     CONSTRAINT ktp_profiles_ibfk_2 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    //   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
    // },
    {
      name: 'land_plots',
      sql: `CREATE TABLE IF NOT EXISTS land_plots (
        id int NOT NULL AUTO_INCREMENT,
        user_id int NOT NULL,
        kk_id int DEFAULT NULL,
        title varchar(100) DEFAULT NULL,
        lat double DEFAULT NULL,
        lng double DEFAULT NULL,
        cert_number varchar(100) DEFAULT NULL,
        area_m2 double DEFAULT NULL,
        foto_rumah varchar(255) DEFAULT NULL,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        CONSTRAINT fk_land_plots_kk FOREIGN KEY (kk_id) REFERENCES kk (id) ON DELETE CASCADE,
        CONSTRAINT land_plots_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
    },
    {
      name: 'kesejahteraan',
      sql: `CREATE TABLE IF NOT EXISTS kesejahteraan (
        id int NOT NULL AUTO_INCREMENT,
        member_id int DEFAULT NULL,
        kk_id int DEFAULT NULL,
        income_per_month double DEFAULT NULL,
        house_condition varchar(100) DEFAULT NULL,
        access_listrik_air tinyint(1) DEFAULT NULL,
        status_kesejahteraan enum('prasejahtera', 'sejahtera', 'sejahtera mandiri') DEFAULT 'prasejahtera',
        assessment_notes text,
        assessed_by int DEFAULT NULL,
        assessed_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        CONSTRAINT kesejahteraan_ibfk_1 FOREIGN KEY (member_id) REFERENCES kk_members (id) ON DELETE CASCADE,
        CONSTRAINT kesejahteraan_ibfk_2 FOREIGN KEY (kk_id) REFERENCES kk (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
    },
    {
      name: 'refresh_tokens',
      sql: `CREATE TABLE IF NOT EXISTS refresh_tokens (
        id int NOT NULL AUTO_INCREMENT,
        user_id int NOT NULL,
        token varchar(255) NOT NULL,
        expires_at datetime NOT NULL,
        created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY token (token),
        CONSTRAINT refresh_tokens_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
    }
  ];

  for (const table of tables) {
    await pool.query(table.sql);
    console.log(`Table ${table.name} created or already exists.`);
  }
}

module.exports = { up };
