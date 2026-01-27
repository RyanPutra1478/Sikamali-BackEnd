const db = require('./config/database');

async function debug() {
    try {
        console.log('Checking KK table columns...');
        const [rows] = await db.query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'sikamali' AND TABLE_NAME = 'kk'");
        const columns = rows.map(r => r.COLUMN_NAME);
        console.log('KK Table Columns:', columns);

        const required = ['desa', 'kecamatan', 'kabupaten', 'provinsi', 'zona_lingkar_tambang', 'status_domisili', 'tanggal_diterbitkan'];
        const missing = required.filter(c => !columns.includes(c));

        if (missing.length > 0) {
            console.log('MISSING COLUMNS:', missing);
        } else {
            console.log('All required columns exist.');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debug();
