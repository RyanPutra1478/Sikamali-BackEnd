const db = require('../config/database');

const KKModel = {
    getAll: async (userId = null) => {
        let sql = 'SELECT * FROM kk';
        const params = [];
        if (userId) {
            sql += ' WHERE created_by = ?';
            params.push(userId);
        }
        sql += ' ORDER BY created_at DESC';
        const [rows] = await db.query(sql, params);
        return rows;
    },

    getAllEnriched: async (userId = null) => {
        let sql = `
            SELECT 
                k.*, 
                u.nama as creator_name,
                lp.lat as lp_lat, lp.lng as lp_lng, lp.foto_rumah as lp_foto_rumah,
                (SELECT COUNT(*) FROM kk_members WHERE kk_id = k.id) as total_members,
                (SELECT COUNT(*) FROM employment_data WHERE kk_id = k.id) as total_employment,
                (SELECT COUNT(*) FROM employment_data WHERE kk_id = k.id AND LOWER(status_kerja) LIKE '%bekerja%' AND LOWER(status_kerja) NOT LIKE '%belum%') as sudah_bekerja,
                (SELECT COUNT(*) FROM employment_data WHERE kk_id = k.id AND LOWER(status_kerja) LIKE '%belum bekerja%') as belum_bekerja,
                (SELECT status_kesejahteraan FROM kesejahteraan WHERE kk_id = k.id LIMIT 1) as status_kesejahteraan,
                (SELECT income_per_month FROM kesejahteraan WHERE kk_id = k.id LIMIT 1) as income_per_month
            FROM kk k
            LEFT JOIN users u ON k.created_by = u.id
            LEFT JOIN (
                SELECT kk_id, lat, lng, foto_rumah 
                FROM land_plots 
                WHERE id IN (SELECT MAX(id) FROM land_plots GROUP BY kk_id)
            ) lp ON k.id = lp.kk_id
        `;
        const params = [];
        if (userId) {
            sql += ' WHERE k.created_by = ?';
            params.push(userId);
        }
        sql += ' ORDER BY k.created_at DESC';
        const [rows] = await db.query(sql, params);
        return rows;
    },

    getById: async (id) => {
        const [rows] = await db.query(`
            SELECT k.*, lp.lat as lp_lat, lp.lng as lp_lng, lp.foto_rumah as lp_foto_rumah
            FROM kk k
            LEFT JOIN (
                SELECT kk_id, lat, lng, foto_rumah 
                FROM land_plots 
                WHERE id IN (SELECT MAX(id) FROM land_plots GROUP BY kk_id)
            ) lp ON k.id = lp.kk_id
            WHERE k.id = ?
        `, [id]);
        return rows[0];
    },

    getByNomor: async (nomor_kk) => {
        const [rows] = await db.query('SELECT * FROM kk WHERE nomor_kk = ?', [nomor_kk]);
        return rows[0];
    },

    create: async (kkData) => {
        const { nomor_kk, kepala_keluarga, alamat, desa, kecamatan, kabupaten, provinsi, zona_lingkar_tambang, tanggal_diterbitkan, status_hard_copy, keterangan, created_by } = kkData;
        const [result] = await db.query(
            `INSERT INTO kk (nomor_kk, kepala_keluarga, alamat, desa, kecamatan, kabupaten, provinsi, zona_lingkar_tambang, tanggal_diterbitkan, status_hard_copy, keterangan, created_by) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [nomor_kk, kepala_keluarga, alamat, desa, kecamatan, kabupaten, provinsi, zona_lingkar_tambang, tanggal_diterbitkan, status_hard_copy, keterangan, created_by]
        );
        return result.insertId;
    },

    update: async (id, kkData) => {
        const fields = [];
        const values = [];
        for (const [key, value] of Object.entries(kkData)) {
            fields.push(`${key} = ?`);
            values.push(value);
        }
        values.push(id);
        const [result] = await db.query(
            `UPDATE kk SET ${fields.join(', ')} WHERE id = ?`,
            values
        );
        return result.affectedRows;
    },

    delete: async (id) => {
        const [result] = await db.query('DELETE FROM kk WHERE id = ?', [id]);
        return result.affectedRows;
    },

    deleteByDocId: async (docId) => {
        // Method kept for compatibility but does nothing as documents are removed
        return 0;
    },

    search: async (q) => {
        if (!q || q.length < 3) return [];
        const [rows] = await db.query(
            'SELECT nomor_kk, kepala_keluarga, alamat FROM kk WHERE nomor_kk LIKE ? OR kepala_keluarga LIKE ? LIMIT 10',
            [`%${q}%`, `%${q}%`]
        );
        return rows;
    }
};

module.exports = KKModel;

