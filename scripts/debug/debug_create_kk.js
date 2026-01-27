const db = require('./config/database');

async function debug() {
    try {
        console.log('--- DEBUG CREATE KK ---');

        // 1. Get Valid User
        console.log('Fetching valid user...');
        const [users] = await db.query("SELECT id FROM users LIMIT 1");
        if (users.length === 0) {
            console.log('ERROR: No users found in database. Cannot create KK without user.');
            process.exit(1);
        }
        const userId = users[0].id;
        console.log('Using User ID:', userId);

        // Mock Data
        const nomor_kk = '1234567890123456';
        const kepala_keluarga = 'TEST_HEAD';
        const alamat = 'TEST_ADDRESS';
        const members = JSON.stringify([{
            nama: 'TEST_MEMBER',
            nik: '1234567890123457',
            jenis_kelamin: 'Laki-laki',
            hubungan_keluarga: 'Kepala Keluarga'
        }]);

        console.log('Inserting into documents...');
        const [docRes] = await db.query(
            `INSERT INTO documents (user_id, type, file_path, verified, nomor_kk, kepala_keluarga, alamat_kk, anggota_json) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, 'KK', 'MANUAL_INPUT', 0, nomor_kk, kepala_keluarga, alamat, members]
        );
        const docId = docRes.insertId;
        console.log('Document Created ID:', docId);

        console.log('Inserting into kk...');
        const [kkRes] = await db.query(
            `INSERT INTO kk (
         document_id, user_id, nomor_kk, kepala_keluarga, alamat, 
         desa, kecamatan, kabupaten, provinsi, 
         zona_lingkar_tambang, status_domisili, 
         anggota_json, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                docId, userId, nomor_kk, kepala_keluarga, alamat,
                'Desa Test', 'Kec Test', 'Kab Test', 'Prov Test',
                'Ring 1', 'Penduduk Asli',
                members, userId
            ]
        );
        console.log('KK Created ID:', kkRes.insertId);

        console.log('Inserting into kk_members...');
        await db.query(
            `INSERT INTO kk_members (document_id, user_id, nomor_kk, kepala_keluarga, nama, nik, jenis_kelamin, hubungan_keluarga)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [docId, userId, nomor_kk, kepala_keluarga, 'TEST_MEMBER', '1234567890123457', 'Laki-laki', 'Kepala Keluarga']
        );
        console.log('KK Member Created.');

        console.log('SUCCESS: Data inserted manually.');
        process.exit(0);
    } catch (err) {
        console.error('DEBUG ERROR:', err);
        process.exit(1);
    }
}

debug();
