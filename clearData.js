const pool = require('./config/database');

async function clear() {
    try {
        console.log('Memulai proses penghapusan data penduduk...');
        
        // Nonaktifkan sementara pengecekan Foreign Key agar bisa di-truncate
        await pool.query('SET FOREIGN_KEY_CHECKS = 0');
        
        // Kosongkan tabel (TRUNCATE mereset ID kembali ke 1)
        await pool.query('TRUNCATE TABLE employment_data');
        await pool.query('TRUNCATE TABLE kesejahteraan');
        await pool.query('TRUNCATE TABLE land_plots');
        await pool.query('TRUNCATE TABLE kk_members');
        await pool.query('TRUNCATE TABLE kk');
        
        // Aktifkan kembali pengecekan Foreign Key
        await pool.query('SET FOREIGN_KEY_CHECKS = 1');
        
        console.log('Semua data penduduk berhasil dikosongkan!');
        process.exit(0);
    } catch (err) {
        console.error('Gagal menghapus data:', err);
        process.exit(1);
    }
}

clear();
