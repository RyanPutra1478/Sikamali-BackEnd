const KKService = require('../services/kkService');
const KKModel = require('../models/kkModel');
const MemberModel = require('../models/memberModel');

const isValidNIK = (nik) => /^[0-9]{16}$/.test(nik);

// 1. Create KK Header
exports.createKKHeader = async (req, res) => {
    const { nomor_kk, kepala_keluarga } = req.body;
    if (!nomor_kk || !isValidNIK(nomor_kk)) return res.status(400).json({ error: 'Nomor KK wajib diisi dan harus 16 digit.' });
    if (!kepala_keluarga) return res.status(400).json({ error: 'Nama Kepala Keluarga wajib diisi.' });

    try {
        const existing = await KKModel.getByNomor(nomor_kk);
        if (existing) return res.status(400).json({ error: 'Nomor KK sudah terdaftar.' });

        // Add file name to body if present
        if (req.file) {
            req.body.foto_rumah = req.file.filename;
        }

        const { kkId } = await KKService.createKK(req.user.id, req.body, req.ip);
        res.json({ message: 'KK Header berhasil dibuat', kk_id: kkId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 2. Add Member to KK
exports.addKKMember = async (req, res) => {
    const { kk_id, nik, nama } = req.body;
    if (!kk_id) return res.status(400).json({ error: 'KK ID wajib diisi.' });
    if (!nik || !isValidNIK(nik)) return res.status(400).json({ error: 'NIK wajib 16 digit.' });
    if (!nama) return res.status(400).json({ error: 'Nama wajib diisi.' });

    try {
        const id = await KKService.addMember(req.user.id, req.body, req.ip);
        res.json({ message: 'Anggota keluarga berhasil ditambahkan', id });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// 3. Update Member
exports.updateKKMember = async (req, res) => {
    try {
        await KKService.updateMember(req.user.id, req.user.role, req.params.id, req.body, req.ip);
        res.json({ message: 'Data anggota berhasil diupdate' });
    } catch (err) {
        res.status(err.message.includes('Akses') ? 403 : 400).json({ error: err.message });
    }
};

// 4. Delete Member
exports.deleteKKMember = async (req, res) => {
    try {
        await KKService.deleteMember(req.user.id, req.user.role, req.params.id, req.ip);
        res.json({ message: 'Anggota berhasil dihapus' });
    } catch (err) {
        res.status(err.message.includes('Akses') ? 403 : 400).json({ error: err.message });
    }
};

// 5. Get All Members
exports.getAllMembers = async (req, res) => {
    try {
        const { role, id } = req.user;
        // Allow superadmin, admin, and user (staff) to see all data
        const userIdFilter = (role === 'superadmin' || role === 'admin' || role === 'user') ? null : id;
        const rows = await MemberModel.getAll(userIdFilter);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 6. Get KK Detail
exports.getKKDetail = async (req, res) => {
    try {
        const data = await KKService.getKKDetail(req.params.id);
        res.json(data);
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
};

// 7. Update KK Header
exports.updateKKHeader = async (req, res) => {
    try {
        if (req.file) {
            req.body.foto_rumah = req.file.filename;
        }
        await KKService.updateKK(req.user.id, req.user.role, req.params.id, req.body, req.ip);
        res.json({ message: 'KK Header berhasil diupdate' });
    } catch (err) {
        res.status(err.message.includes('Akses') ? 403 : 400).json({ error: err.message });
    }
};

// 8. Delete KK Header
exports.deleteKKHeader = async (req, res) => {
    try {
        await KKService.deleteKK(req.user.id, req.user.role, req.params.id, req.ip);
        res.json({ message: 'KK berhasil dihapus' });
    } catch (err) {
        res.status(err.message.includes('Akses') ? 403 : 400).json({ error: err.message });
    }
};

// 9. Get KK Preview (for Admin/Superadmin/User)
exports.getKKPreview = async (req, res) => {
    try {
        const { role, id } = req.user;
        const userIdFilter = (role === 'superadmin' || role === 'admin' || role === 'user') ? null : id;

        let sql = `
            SELECT 
                k.nomor_kk, 
                k.kepala_keluarga, 
                k.alamat, 
                k.desa as desa_kelurahan, 
                k.kecamatan, 
                k.zona_lingkar_tambang as zona_lingkar,
                lp.lat as koordinat_latitude, 
                lp.lng as koordinat_longitude,
                (SELECT COUNT(*) FROM kk_members WHERE kk_id = k.id) as anggota_keluarga,
                (SELECT COUNT(*) FROM employment_data WHERE kk_id = k.id) as angkatan_kerja,
                (SELECT COUNT(*) FROM employment_data WHERE kk_id = k.id AND LOWER(status_kerja) LIKE '%bekerja%' AND LOWER(status_kerja) NOT LIKE '%belum%') as sudah_bekerja,
                (SELECT COUNT(*) FROM employment_data WHERE kk_id = k.id AND LOWER(status_kerja) LIKE '%belum bekerja%') as belum_bekerja,
                ks.status_kesejahteraan as kategori_sosial,
                ks.tingkat_sosial
            FROM kk k
            LEFT JOIN (
                SELECT kk_id, lat, lng 
                FROM land_plots 
                WHERE id IN (SELECT MAX(id) FROM land_plots GROUP BY kk_id)
            ) lp ON k.id = lp.kk_id
            LEFT JOIN kesejahteraan ks ON k.id = ks.kk_id
        `;

        const params = [];
        if (userIdFilter) {
            sql += ' WHERE k.created_by = ?';
            params.push(userIdFilter);
        }
        sql += ' ORDER BY k.created_at DESC';

        const db = require('../config/database');
        const [rows] = await db.query(sql, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 10. Get Member Preview (for Admin/Superadmin/User)
exports.getMemberPreview = async (req, res) => {
    try {
        const { role, id } = req.user;
        const userIdFilter = (role === 'superadmin' || role === 'admin' || role === 'user') ? null : id;

        let sql = `
            SELECT 
                k.nomor_kk as no_kartu_keluarga,
                k.kepala_keluarga,
                k.alamat,
                k.desa as desa_kelurahan,
                k.kecamatan,
                k.zona_lingkar_tambang as zona_lingkar_tambang,
                m.nama as nama_lengkap,
                m.nik,
                m.jenis_kelamin,
                TIMESTAMPDIFF(YEAR, m.tanggal_lahir, CURDATE()) as umur,
                m.pendidikan,
                m.pekerjaan,
                m.hubungan_keluarga,
                ed.pendidikan_terakhir,
                ed.skill_tags as skill,
                ed.status_kerja,
                ed.tempat_bekerja,
                ed.no_hp_wa,
                ed.email
            FROM kk_members m 
            JOIN kk k ON m.kk_id = k.id
            LEFT JOIN employment_data ed ON m.id = ed.member_id
        `;

        const params = [];
        if (userIdFilter) {
            sql += ' WHERE k.created_by = ?';
            params.push(userIdFilter);
        }
        sql += ' ORDER BY k.id ASC, m.id ASC';

        const db = require('../config/database');
        const [rows] = await db.query(sql, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

