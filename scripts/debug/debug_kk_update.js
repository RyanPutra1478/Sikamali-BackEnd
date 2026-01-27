const db = require('./config/database');

async function debug() {
    try {
        console.log('--- DEBUG KK UPDATE ---');

        // 1. Check KK Columns again, explicitly
        console.log('\n[1] Checking KK Table Columns:');
        const [cols] = await db.query("SHOW COLUMNS FROM kk");
        const colNames = cols.map(c => c.Field);
        console.log('Columns:', colNames.join(', '));

        const required = ['desa', 'kecamatan', 'kabupaten', 'provinsi', 'zona_lingkar_tambang', 'status_domisili', 'tanggal_diterbitkan'];
        const missing = required.filter(c => !colNames.includes(c));
        if (missing.length > 0) {
            console.log('CRITICAL: Missing columns in kk table:', missing);
        } else {
            console.log('All required columns exist in kk table.');
        }

        // 2. Check Documents vs KK consistency
        console.log('\n[2] Checking Documents vs KK consistency (Limit 5):');
        const [docs] = await db.query("SELECT id, nomor_kk FROM documents WHERE type = 'KK' ORDER BY id DESC LIMIT 5");

        for (const doc of docs) {
            const [kkRows] = await db.query("SELECT id, document_id, nomor_kk FROM kk WHERE document_id = ?", [doc.id]);
            if (kkRows.length === 0) {
                console.log(`[WARNING] Document ID ${doc.id} (KK ${doc.nomor_kk}) has NO entry in 'kk' table!`);
            } else {
                console.log(`[OK] Document ID ${doc.id} linked to KK ID ${kkRows[0].id}`);
            }
        }

        // 3. Test Update on the most recent KK
        if (docs.length > 0) {
            const targetId = docs[0].id;
            console.log(`\n[3] Testing UPDATE on Document ID ${targetId}...`);

            // Check current value
            const [before] = await db.query("SELECT desa FROM kk WHERE document_id = ?", [targetId]);
            console.log('Current Desa:', before[0]?.desa);

            // Update
            const testValue = 'TEST_UPDATE_' + Date.now();
            const [res] = await db.query("UPDATE kk SET desa = ? WHERE document_id = ?", [testValue, targetId]);
            console.log('Update Result:', { affectedRows: res.affectedRows, changedRows: res.changedRows });

            // Check after
            const [after] = await db.query("SELECT desa FROM kk WHERE document_id = ?", [targetId]);
            console.log('New Desa:', after[0]?.desa);

            if (after[0]?.desa === testValue) {
                console.log('SUCCESS: Update persisted.');
                // Revert
                await db.query("UPDATE kk SET desa = ? WHERE document_id = ?", [before[0]?.desa, targetId]);
                console.log('Reverted change.');
            } else {
                console.log('FAILURE: Update did not persist.');
            }
        }

        process.exit(0);
    } catch (err) {
        console.error('DEBUG ERROR:', err);
        process.exit(1);
    }
}

debug();
