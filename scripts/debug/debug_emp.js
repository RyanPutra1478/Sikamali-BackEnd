const db = require('./config/database');

async function debug() {
    try {
        console.log('--- DEBUG EMPLOYMENT DATA ---');
        const nik = '1234567890123457';

        const [rows] = await db.query(`
      SELECT 
        m.nik, m.nama, m.desa, m.kecamatan, m.zona
      FROM kk_members m
      WHERE m.nik = ?
    `, [nik]);

        console.log('Employment Data for NIK ' + nik + ':', rows[0]);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debug();
