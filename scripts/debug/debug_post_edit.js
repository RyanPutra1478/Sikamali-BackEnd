const db = require('./config/database');

async function debug() {
    try {
        console.log('--- DEBUG POST-EDIT DATA ---');

        // 1. Check KK Table
        console.log('\n[1] KK Table Data:');
        const [kkRows] = await db.query("SELECT id, document_id, nomor_kk, desa, kecamatan, zona_lingkar_tambang FROM kk");
        console.log(JSON.stringify(kkRows, null, 2));

        // 2. Check KK Members Table
        console.log('\n[2] KK Members Table Data:');
        const [memRows] = await db.query("SELECT id, document_id, nama, desa, kecamatan, zona FROM kk_members");
        console.log(JSON.stringify(memRows, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debug();
