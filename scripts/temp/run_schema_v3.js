const db = require('./config/database');

async function runSchemaUpdate() {
    const columns = [
        "ADD COLUMN no_paspor VARCHAR(50)",
        "ADD COLUMN no_kitap VARCHAR(50)",
        "ADD COLUMN nama_ayah VARCHAR(100)",
        "ADD COLUMN nama_ibu VARCHAR(100)",
        "ADD COLUMN kewarganegaraan VARCHAR(50) DEFAULT 'WNI'",
        "ADD COLUMN email VARCHAR(100)",
        "ADD COLUMN no_hp VARCHAR(20)",
        "ADD COLUMN golongan_darah VARCHAR(5)",
        "ADD COLUMN tanggal_perkawinan DATE",
        "ADD COLUMN status_perkawinan VARCHAR(50)",
        "ADD COLUMN pendidikan_terakhir VARCHAR(50)",
        "ADD COLUMN tempat_bekerja VARCHAR(100)",
        "ADD COLUMN status_kerja VARCHAR(50)",
        "ADD COLUMN skill TEXT"
    ];

    console.log('Running schema update v3...');

    for (const colDef of columns) {
        try {
            await db.query(`ALTER TABLE kk_members ${colDef}`);
            console.log(`Success: ${colDef}`);
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log(`Skipped (exists): ${colDef}`);
            } else {
                console.error(`Failed: ${colDef}`, err.message);
            }
        }
    }

    console.log('Schema update v3 completed.');
    process.exit(0);
}

runSchemaUpdate();
