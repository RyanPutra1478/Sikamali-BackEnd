const db = require('../config/database');

const MemberModel = {
    getAll: async (userId = null) => {
        let sql = `
            SELECT m.*, k.nomor_kk, k.kepala_keluarga 
            FROM kk_members m 
            JOIN kk k ON m.kk_id = k.id
        `;
        const params = [];
        if (userId) {
            sql += ' WHERE k.created_by = ?';
            params.push(userId);
        }
        const [rows] = await db.query(sql, params);
        return rows;
    },

    getByKKId: async (kkId) => {
        const [rows] = await db.query('SELECT * FROM kk_members WHERE kk_id = ? ORDER BY id ASC', [kkId]);
        return rows;
    },

    getByNIK: async (nik) => {
        const [rows] = await db.query('SELECT * FROM kk_members WHERE nik = ?', [nik]);
        return rows[0];
    },

    create: async (memberData) => {
        const {
            kk_id, nama, nik, jenis_kelamin, tempat_lahir, tanggal_lahir, agama,
            status_perkawinan, tanggal_perkawinan, pendidikan, pekerjaan,
            golongan_darah, hubungan_keluarga, nomor_paspor, kewarganegaraan,
            nama_ayah, nama_ibu, status_domisili, no_kitap, keterangan
        } = memberData;

        const [result] = await db.query(
            `INSERT INTO kk_members (
                kk_id, nama, nik, jenis_kelamin, tempat_lahir, tanggal_lahir, agama, 
                status_perkawinan, tanggal_perkawinan, pendidikan, pekerjaan, 
                golongan_darah, hubungan_keluarga, nomor_paspor, kewarganegaraan, 
                nama_ayah, nama_ibu, status_domisili, no_kitap, keterangan
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                kk_id, nama, nik, jenis_kelamin, tempat_lahir, tanggal_lahir, agama,
                status_perkawinan, tanggal_perkawinan, pendidikan, pekerjaan,
                golongan_darah, hubungan_keluarga, nomor_paspor, kewarganegaraan,
                nama_ayah, nama_ibu, status_domisili, no_kitap, keterangan
            ]
        );
        return result.insertId;
    },

    update: async (id, memberData) => {
        const fields = [];
        const values = [];
        for (const [key, value] of Object.entries(memberData)) {
            fields.push(`${key} = ?`);
            values.push(value);
        }
        values.push(id);
        const [result] = await db.query(
            `UPDATE kk_members SET ${fields.join(', ')} WHERE id = ?`,
            values
        );
        return result.affectedRows;
    },

    deleteByKKId: async (kkId) => {
        const [result] = await db.query('DELETE FROM kk_members WHERE kk_id = ?', [kkId]);
        return result.affectedRows;
    },

    deleteByDocId: async (docId) => {
        // Method kept for compatibility but does nothing as documents are removed
        return 0;
    },

    delete: async (id) => {
        const [result] = await db.query('DELETE FROM kk_members WHERE id = ?', [id]);
        return result.affectedRows;
    }
};

module.exports = MemberModel;

