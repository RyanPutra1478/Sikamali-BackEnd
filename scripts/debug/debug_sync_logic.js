const axios = require('axios');
const db = require('./config/database');

async function debug() {
    try {
        console.log('--- DEBUG UPDATE KK SIMULATION ---');

        // 1. Get the Document ID
        const [docs] = await db.query("SELECT id, nomor_kk FROM documents WHERE type = 'KK' LIMIT 1");
        if (docs.length === 0) {
            console.log('No KK found.');
            process.exit(1);
        }
        const docId = docs[0].id;
        const nomorKK = docs[0].nomor_kk;
        console.log(`Target Document ID: ${docId} (${nomorKK})`);

        // 2. Get a valid token (login as superadmin)
        // Assuming we can't easily login via script without credentials, 
        // we will bypass auth middleware or assume we run this locally against a running server 
        // BUT we can't easily bypass auth.
        // Instead, let's just invoke the controller function directly if we mock req/res?
        // No, that's hard.

        // Alternative: We already added logs to the controller.
        // We can use the existing `debug_create_kk.js` logic but adapted to call the update function directly?
        // Or we can just use `db` to call `syncKKMembers` directly to test that function in isolation.

        console.log('Testing syncKKMembers directly...');
        const { syncKKMembers } = require('./controllers/documentController'); // We need to export it or copy it.
        // Since it's not exported, we can't import it.

        // Plan B: We will just inspect the logs from the USER'S action.
        // The user ran `npm start` and got logs.
        // Let's ask the user to run the update again and show us the logs.

        // Wait, I can't ask the user. I have to do it.

        // I will modify `documentController.js` to export `syncKKMembers` temporarily for testing?
        // Or I can just copy the function here to test it.

        // Let's copy `syncKKMembers` and `normalizeMemberInput` here to verify logic.

        const MEMBER_FIELDS = [
            'nama', 'nik', 'jenis_kelamin', 'tempat_lahir', 'tanggal_lahir', 'agama',
            'status_perkawinan', 'tanggal_perkawinan', 'pendidikan', 'pendidikan_terakhir',
            'skill', 'status_kerja', 'tempat_bekerja', 'no_hp', 'email', 'golongan_darah',
            'hubungan_keluarga', 'alamat', 'desa', 'kecamatan', 'zona', 'status_domisili',
            'kewarganegaraan', 'no_passport', 'no_kitap', 'nama_ayah', 'nama_ibu',
        ];

        const parseDate = (val) => {
            if (!val) return null;
            const d = new Date(val);
            return Number.isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
        };

        function normalizeMemberInput(member = {}) {
            const normalized = {};
            MEMBER_FIELDS.forEach((field) => {
                normalized[field] = member[field] ?? member[field.toLowerCase()] ?? null;
            });

            if (!normalized.no_hp && member.telepon) normalized.no_hp = member.telepon;
            if (!normalized.status_kerja && member.pekerjaan) normalized.status_kerja = member.pekerjaan;
            if (!normalized.zona && member.zona_lingkar_tambang) normalized.zona = member.zona_lingkar_tambang;
            if (!normalized.hubungan_keluarga && member.hubungan) normalized.hubungan_keluarga = member.hubungan;
            if (!normalized.status_domisili && member.domisili) normalized.status_domisili = member.domisili;

            normalized.tanggal_lahir = parseDate(normalized.tanggal_lahir);
            normalized.tanggal_perkawinan = parseDate(normalized.tanggal_perkawinan);

            return normalized;
        }

        const testMember = {
            nama: 'TEST_SYNC',
            nik: '9999999999999999',
            desa: 'Desa Sync',
            kecamatan: 'Kec Sync',
            zona_lingkar_tambang: 'Ring Sync'
        };

        const normalized = normalizeMemberInput(testMember);
        console.log('Normalized Member:', normalized);

        if (normalized.desa === 'Desa Sync' && normalized.zona === 'Ring Sync') {
            console.log('SUCCESS: Normalization logic is correct.');
        } else {
            console.log('FAILURE: Normalization logic is wrong.');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debug();
