const db = require('../config/database');

const KesejahteraanModel = {
    getById: async (id) => {
        const [rows] = await db.query('SELECT * FROM kesejahteraan WHERE id = ?', [id]);
        return rows[0];
    },

    getByKKId: async (kkId) => {
        const [rows] = await db.query('SELECT * FROM kesejahteraan WHERE kk_id = ?', [kkId]);
        return rows[0];
    },

    getAllEnriched: async (userId = null, isPrasejahteraOnly = false) => {
        let sql = `
            SELECT 
                p.*, 
                m.nama as nama_penerima, m.nik as nik_penerima,
                k.nomor_kk, k.kepala_keluarga, k.alamat, k.desa, k.kecamatan,
                u.nama as assessor_name
            FROM kesejahteraan p
            JOIN kk k ON p.kk_id = k.id
            JOIN kk_members m ON p.member_id = m.id
            LEFT JOIN users u ON p.assessed_by = u.id
        `;

        const conditions = [];
        const params = [];

        if (userId) {
            conditions.push('(k.created_by = ?)');
            params.push(userId);
        }

        if (isPrasejahteraOnly) {
            conditions.push("p.status_kesejahteraan = 'prasejahtera'");
        }

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }

        const [rows] = await db.query(sql, params);
        return rows;
    },

    create: async (data) => {
        const { member_id, kk_id, income_per_month, house_condition, access_listrik_air, status_kesejahteraan, tingkat_sosial, assessment_notes, keterangan, assessed_by } = data;
        const [res] = await db.query(
            `INSERT INTO kesejahteraan (member_id, kk_id, income_per_month, house_condition, access_listrik_air, status_kesejahteraan, tingkat_sosial, assessment_notes, keterangan, assessed_by) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [member_id, kk_id, income_per_month, house_condition, access_listrik_air, status_kesejahteraan, tingkat_sosial, assessment_notes, keterangan, assessed_by]
        );
        return res.insertId;
    },

    update: async (id, data) => {
        const fields = [];
        const values = [];
        for (const [key, value] of Object.entries(data)) {
            fields.push(`${key} = ?`);
            values.push(value);
        }
        values.push(id);
        const [result] = await db.query(`UPDATE kesejahteraan SET ${fields.join(', ')} WHERE id = ?`, values);
        return result.affectedRows;
    },

    delete: async (id) => {
        const [result] = await db.query('DELETE FROM kesejahteraan WHERE id = ?', [id]);
        return result.affectedRows;
    }
};

const LandPlotModel = {
    getById: async (id) => {
        const [rows] = await db.query('SELECT * FROM land_plots WHERE id = ?', [id]);
        return rows[0];
    },

    getAll: async () => {
        const [rows] = await db.query('SELECT l.*, k.nomor_kk, k.kepala_keluarga FROM land_plots l LEFT JOIN kk k ON l.kk_id = k.id');
        return rows;
    },

    getAllEnriched: async (userId = null) => {
        let sql = `
            SELECT 
                lp.*,
                k.id as kk_id, k.nomor_kk, k.kepala_keluarga, k.alamat as alamat_kk, k.provinsi, k.kabupaten, k.kecamatan, k.desa
            FROM land_plots lp
            LEFT JOIN kk k ON lp.kk_id = k.id
        `;
        const params = [];
        if (userId) {
            sql += ' WHERE (k.created_by = ? OR lp.user_id = ?)';
            params.push(userId, userId);
        }
        sql += ' ORDER BY lp.created_at DESC';
        const [rows] = await db.query(sql, params);
        return rows;
    },

    create: async (data) => {
        const { user_id, kk_id, title, lat, lng, cert_number, area_m2, foto_rumah } = data;
        const [result] = await db.query(
            `INSERT INTO land_plots (user_id, kk_id, title, lat, lng, cert_number, area_m2, foto_rumah) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [user_id, kk_id, title, lat, lng, cert_number, area_m2, foto_rumah]
        );
        return result.insertId;
    },

    update: async (id, data) => {
        const fields = [];
        const values = [];
        for (const [key, value] of Object.entries(data)) {
            fields.push(`${key} = ?`);
            values.push(value);
        }
        values.push(id);
        const [result] = await db.query(`UPDATE land_plots SET ${fields.join(', ')} WHERE id = ?`, values);
        return result.affectedRows;
    },

    delete: async (id, userId = null) => {
        let sql = 'DELETE FROM land_plots WHERE id = ?';
        const params = [id];
        if (userId) {
            // To implement a fallback for user_id, we need to join with the kk table
            // and check both land_plots.user_id and kk.created_by.
            // This requires a multi-table DELETE syntax or a subquery.
            // For simplicity and to match the spirit of the provided snippet's conditions,
            // we'll assume the intent is to allow deletion if the land_plot's user_id matches
            // OR if the associated KK's created_by matches.
            // MySQL supports multi-table DELETE: DELETE lp FROM land_plots lp JOIN kk k ON lp.kk_id = k.id WHERE lp.id = ? AND (lp.user_id = ? OR k.created_by = ?);
            // However, the provided snippet's `conditions.push` was syntactically incorrect for a DELETE.
            // The most direct interpretation of "fallback for user_id" in a delete context,
            // given the `getAllEnriched` pattern, would be to check both the plot's user_id
            // and the associated KK's creator.
            // Let's use a subquery approach for broader compatibility if multi-table DELETE is not desired,
            // or a JOIN if it is. Given the `Code Edit` structure, it implies adding conditions to the WHERE clause.

            // The original `Code Edit` snippet was:
            // conditions.push('(k.created_by = ? OR p.user_id = ?)');
            // params.push(userId, userId);
            // This is not directly applicable to a simple DELETE FROM land_plots.
            // Assuming the intent is to restrict deletion to the owner of the plot OR the creator of the associated KK.
            // This requires a JOIN in the DELETE statement.

            sql = `DELETE lp FROM land_plots lp
                   LEFT JOIN kk k ON lp.kk_id = k.id
                   WHERE lp.id = ? AND (lp.user_id = ? OR k.created_by = ?)`;
            params.push(userId, userId);
        }
        const [result] = await db.query(sql, params);
        return result.affectedRows;
    }
};

module.exports = { KesejahteraanModel, LandPlotModel };

