const db = require('../config/database');

const MemberModel = {
    getAll: async (userId = null, options = {}) => {
        let countSql = `
            SELECT COUNT(*) as total
            FROM kk_members m
            JOIN kk k ON m.kk_id = k.id
        `;
        let sql = `
            SELECT m.*, k.nomor_kk, k.kepala_keluarga, TIMESTAMPDIFF(YEAR, m.tanggal_lahir, CURDATE()) AS umur 
            FROM kk_members m 
            JOIN kk k ON m.kk_id = k.id
        `;
        const params = [];
        if (userId) {
            const whereClause = ' WHERE k.created_by = ?';
            sql += whereClause;
            countSql += whereClause;
            params.push(userId);
        }

        if (options && (options.page || options.limit)) {
            const page = Math.max(1, parseInt(options.page) || 1);
            const limit = Math.max(1, parseInt(options.limit) || 20);
            const offset = (page - 1) * limit;

            const [[{ total }]] = await db.query(countSql, params);

            sql += ' LIMIT ? OFFSET ?';
            const queryParams = [...params, limit, offset];

            const [rows] = await db.query(sql, queryParams);

            return {
                data: rows,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            };
        }

        const [rows] = await db.query(sql, params);
        return rows;
    },

    getByKKId: async (kkId) => {
        const [rows] = await db.query('SELECT *, TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) AS umur FROM kk_members WHERE kk_id = ? ORDER BY id ASC', [kkId]);
        return rows;
    },

    getById: async (id) => {
        const [rows] = await db.query('SELECT *, TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) AS umur FROM kk_members WHERE id = ?', [id]);
        return rows[0];
    },

    getByNIK: async (nik) => {
        const [rows] = await db.query('SELECT *, TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) AS umur FROM kk_members WHERE nik = ?', [nik]);
        return rows[0];
    },

    create: async (memberData) => {
        const {
            kk_id, nama, nik, jenis_kelamin, tempat_lahir, tanggal_lahir, agama,
            status_perkawinan, tanggal_perkawinan, pendidikan, pekerjaan,
            golongan_darah, hubungan_keluarga, nomor_paspor, kewarganegaraan,
            nama_ayah, nama_ibu, status_domisili, status_kependudukan, no_kitap, keterangan
        } = memberData;
        console.log('MemberModel.create payload:', memberData);

        const [result] = await db.query(
            `INSERT INTO kk_members (
                kk_id, nama, nik, jenis_kelamin, tempat_lahir, tanggal_lahir, agama, 
                status_perkawinan, tanggal_perkawinan, pendidikan, pekerjaan, 
                golongan_darah, hubungan_keluarga, nomor_paspor, kewarganegaraan, 
                nama_ayah, nama_ibu, status_domisili, status_kependudukan, no_kitap, keterangan
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                kk_id, nama, nik, jenis_kelamin, tempat_lahir, tanggal_lahir, agama,
                status_perkawinan, tanggal_perkawinan, pendidikan, pekerjaan,
                golongan_darah, hubungan_keluarga, nomor_paspor, kewarganegaraan,
                nama_ayah, nama_ibu, status_domisili, status_kependudukan, no_kitap, keterangan
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

