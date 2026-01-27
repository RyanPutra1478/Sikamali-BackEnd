const db = require('./config/database');

async function debug() {
    try {
        console.log('--- DEBUG KK DATA ---');

        // 1. Run getKKTable Query
        console.log('\n[1] Running getKKTable Query (Limit 3):');
        const [rows] = await db.query(`
      SELECT 
        kk.id, kk.nomor_kk, kk.kepala_keluarga, kk.alamat, 
        kk.desa, kk.kecamatan, kk.kabupaten, kk.provinsi,
        kk.zona_lingkar_tambang,
        kk.created_at, kk.document_id,
        lp.lat as latitude, lp.lng as longitude
      FROM kk
      LEFT JOIN land_plots lp ON kk.nomor_kk = lp.nomor_kk
      ORDER BY kk.created_at DESC
      LIMIT 3
    `);
        console.log('Rows found:', rows.length);
        if (rows.length > 0) {
            console.log('Sample Row 1:', JSON.stringify(rows[0], null, 2));
        }

        // 2. Check KK Members for the first doc
        if (rows.length > 0) {
            const docId = rows[0].document_id;
            console.log(`\n[2] Checking KK Members for Document ID ${docId}:`);
            const [members] = await db.query("SELECT id, nama, desa, kecamatan, zona FROM kk_members WHERE document_id = ?", [docId]);
            console.log('Members found:', members.length);
            if (members.length > 0) {
                console.log('Sample Member 1:', JSON.stringify(members[0], null, 2));
            }
        }

        process.exit(0);
    } catch (err) {
        console.error('DEBUG ERROR:', err);
        process.exit(1);
    }
}

debug();
