const db = require('../config/database');

async function up() {
    // Tabel KK (Kartu Keluarga)
    await db.query(`
        CREATE TABLE IF NOT EXISTS kk (
            id INT NOT NULL AUTO_INCREMENT,
            kepala_keluarga VARCHAR(100) DEFAULT NULL,
            alamat TEXT,
            nomor_kk VARCHAR(100) DEFAULT NULL,
            desa VARCHAR(100) DEFAULT NULL,
            kecamatan VARCHAR(100) DEFAULT NULL,
            kabupaten VARCHAR(100) DEFAULT NULL,
            provinsi VARCHAR(100) DEFAULT NULL,
            zona_lingkar_tambang VARCHAR(100) DEFAULT NULL,
            tanggal_diterbitkan DATE DEFAULT NULL,
            status_hard_copy VARCHAR(100) DEFAULT NULL,
            keterangan TEXT,
            created_by INT DEFAULT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY kk_ibfk_2 (created_by),
            CONSTRAINT kk_ibfk_2 FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);
    console.log('Table kk created.');

    // Tabel Anggota Keluarga
    await db.query(`
        CREATE TABLE IF NOT EXISTS kk_members (
            id INT NOT NULL AUTO_INCREMENT,
            kk_id INT NOT NULL,
            nama VARCHAR(100) DEFAULT NULL,
            status_domisili ENUM('PENDUDUK TETAP','WARGA PENDATANG','LAINNYA') DEFAULT 'LAINNYA',
            nik VARCHAR(30) DEFAULT NULL,
            jenis_kelamin VARCHAR(20) DEFAULT NULL,
            tempat_lahir VARCHAR(100) DEFAULT NULL,
            tanggal_lahir DATE DEFAULT NULL,
            agama VARCHAR(50) DEFAULT NULL,
            status_perkawinan ENUM('BELUM KAWIN','CERAI','CERAI HIDUP','CERAI HIDUP BELUM TERCATAT','CERAI HIDUP TERCATAT','CERAI MATI','CERAI MATI BELUM TERCATAT','CERAI MATI TERCATAT','CERAI TERCATAT','CERAI BELUM TERCATAT','KAWIN','KAWIN BELUM TERCATAT','KAWIN TERCATAT','LAINNYA') DEFAULT 'LAINNYA',
            tanggal_perkawinan DATE DEFAULT NULL,
            pendidikan ENUM('AKADEMI/ DIPLOMA III/ SARJANA MUDA','BELUM TAMAT SD/ SEDERAJAT','DIPLOMA I/II','DIPLOMA IV/ STRATA 1','DOKTORAL/ STRATA 3','MAGISTER/ STRATA 2','SLTA/ SEDERAJAT','SLTP/ SEDERAJAT','TAMAT SD/ SEDERAJAT','TIDAK/ BELUM SEKOLAH','LAINNYA') DEFAULT 'LAINNYA',
            pekerjaan ENUM('APARAT DESA/ KECAMATAN','APOTEKER','BELUM/ TIDAK BEKERJA','BURUH HARIAN LEPAS','BURUH NELAYAN/ PERIKANAN','BURUH TANI/ PERKEBUNAN','DOSEN SWASTA','DOKTER','GURU','GURU HONORER','GURU PPPK','IMAM MESJID','KARYAWAN HONORER','KARYAWAN SWASTA','KEPOLISIAN RI (POLRI)','LANJUT USIA (LANSIA)','MENGURUS RUMAH TANGGA','NELAYAN/ PERIKANAN','PA CNI','PARAMEDIK/ BIDAN/ PERAWAT','PEDAGANG','PEGAWAI BUMN/PERSERO','PEGAWAI HONORER','PEGAWAI NEGERI SIPIL (PNS)','PEGAWAI PPPK','PEKERJAAN LAINNYA','PELAJAR/ MAHASISWA','PELAYARAN','PENSIUNAN PNS','PERDAGANGAN','PETANI/ PEKEBUN','PURNAWIRAWAN TNI/ POLRI','SECURITY','SOPIR','TENTARA NASIONAL INDONESIA (TNI)','TUKANG BATU','TUKANG JAHIT','TUKANG KAYU','TUKANG LAS/ PANDAI BESI','VETERAN','WARTAWAN/ JURNALIS','WIRASWASTA','ARTIS','ANGGOTA DEWAN','GURU TPQ','MEKANIK','LAINNYA') DEFAULT 'BELUM/ TIDAK BEKERJA',
            golongan_darah VARCHAR(100) DEFAULT NULL,
            hubungan_keluarga ENUM('ANAK','CUCU','FAMILI LAIN','ISTRI','KEPALA KELUARGA','MERTUA','ORANG TUA','SAUDARA KANDUNG','LAINNYA') DEFAULT 'LAINNYA',
            nomor_paspor VARCHAR(50) DEFAULT NULL,
            kewarganegaraan VARCHAR(100) DEFAULT NULL,
            nama_ayah VARCHAR(100) DEFAULT NULL,
            nama_ibu VARCHAR(100) DEFAULT NULL,
            no_kitap VARCHAR(100) DEFAULT NULL,
            keterangan TEXT,
            status_kependudukan ENUM('AKTIF','TIDAK AKTIF','PINDAH','LAINNYA') DEFAULT 'LAINNYA',
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY kk_members_ibfk_3 (kk_id),
            CONSTRAINT kk_members_ibfk_3 FOREIGN KEY (kk_id) REFERENCES kk (id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);
    console.log('Table kk_members created.');

    // Tabel Data Ketenagakerjaan
    await db.query(`
        CREATE TABLE IF NOT EXISTS employment_data (
            id INT NOT NULL AUTO_INCREMENT,
            kk_id INT DEFAULT NULL,
            member_id INT DEFAULT NULL,
            status_kerja VARCHAR(100) DEFAULT NULL,
            skill_tags TEXT,
            tempat_bekerja VARCHAR(255) DEFAULT NULL,
            pendidikan_terakhir VARCHAR(255) DEFAULT NULL,
            no_hp_wa VARCHAR(50) DEFAULT NULL,
            email VARCHAR(255) DEFAULT NULL,
            keterangan TEXT,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY employment_kk (kk_id),
            KEY employment_member (member_id),
            CONSTRAINT employment_kk FOREIGN KEY (kk_id) REFERENCES kk (id) ON DELETE CASCADE,
            CONSTRAINT employment_member FOREIGN KEY (member_id) REFERENCES kk_members (id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);
    console.log('Table employment_data created.');

    // Tabel Kesejahteraan
    await db.query(`
        CREATE TABLE IF NOT EXISTS kesejahteraan (
            id INT NOT NULL AUTO_INCREMENT,
            member_id INT DEFAULT NULL,
            kk_id INT DEFAULT NULL,
            income_per_month DOUBLE DEFAULT NULL,
            house_condition VARCHAR(100) DEFAULT NULL,
            access_listrik_air TINYINT(1) DEFAULT NULL,
            kategori_sosial VARCHAR(255) DEFAULT NULL,
            kriteria VARCHAR(255) DEFAULT NULL,
            tingkat_sosial VARCHAR(255) DEFAULT NULL,
            assessment_notes TEXT,
            keterangan TEXT,
            assessed_by INT DEFAULT NULL,
            assessed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY kesejahteraan_ibfk_1 (member_id),
            KEY kesejahteraan_ibfk_2 (kk_id),
            CONSTRAINT kesejahteraan_ibfk_1 FOREIGN KEY (member_id) REFERENCES kk_members (id) ON DELETE CASCADE,
            CONSTRAINT kesejahteraan_ibfk_2 FOREIGN KEY (kk_id) REFERENCES kk (id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);
    console.log('Table kesejahteraan created.');

    // Tabel Land Plots (Koordinat & Foto Rumah)
    await db.query(`
        CREATE TABLE IF NOT EXISTS land_plots (
            id INT NOT NULL AUTO_INCREMENT,
            user_id INT NOT NULL,
            kk_id INT DEFAULT NULL,
            title VARCHAR(100) DEFAULT NULL,
            lat DOUBLE DEFAULT NULL,
            lng DOUBLE DEFAULT NULL,
            cert_number VARCHAR(100) DEFAULT NULL,
            area_m2 DOUBLE DEFAULT NULL,
            foto_rumah VARCHAR(255) DEFAULT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY fk_land_plots_kk (kk_id),
            KEY land_plots_ibfk_1 (user_id),
            CONSTRAINT fk_land_plots_kk FOREIGN KEY (kk_id) REFERENCES kk (id) ON DELETE CASCADE,
            CONSTRAINT land_plots_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);
    console.log('Table land_plots created.');
}

module.exports = { up };
