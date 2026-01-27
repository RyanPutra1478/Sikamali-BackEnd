const db = require('../config/database');

const EmploymentModel = {
    getAll: async () => {
        const [rows] = await db.query(`
            SELECT ed.*, m.nama, m.nik, k.nomor_kk 
            FROM employment_data ed
            JOIN kk_members m ON ed.member_id = m.id
            JOIN kk k ON ed.kk_id = k.id
        `);
        return rows;
    },

    getAllEnriched: async (userId = null) => {
        let sql = `
            SELECT 
                ed.*, 
                m.nama, m.nik, m.jenis_kelamin, m.pendidikan,
                k.nomor_kk, k.kepala_keluarga, k.alamat, k.desa, k.zona_lingkar_tambang as zona
            FROM employment_data ed
            JOIN kk_members m ON ed.member_id = m.id
            JOIN kk k ON ed.kk_id = k.id
        `;
        const params = [];
        if (userId) {
            sql += ' WHERE k.created_by = ?';
            params.push(userId);
        }
        const [rows] = await db.query(sql, params);
        return rows;
    },

    getByMemberId: async (memberId) => {
        const [rows] = await db.query('SELECT * FROM employment_data WHERE member_id = ?', [memberId]);
        return rows[0];
    },

    create: async (empData) => {
        const { kk_id, member_id, status_kerja, skill_tags, tempat_bekerja, experience_years, availability, preferred_roles, pendidikan_terakhir, no_hp_wa, email, keterangan } = empData;
        const [result] = await db.query(
            `INSERT INTO employment_data (kk_id, member_id, status_kerja, skill_tags, tempat_bekerja, experience_years, availability, preferred_roles, pendidikan_terakhir, no_hp_wa, email, keterangan) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [kk_id, member_id, status_kerja, skill_tags, tempat_bekerja, experience_years, availability, preferred_roles, pendidikan_terakhir, no_hp_wa, email, keterangan]
        );
        return result.insertId;
    },

    update: async (memberId, empData) => {
        const fields = [];
        const values = [];
        for (const [key, value] of Object.entries(empData)) {
            fields.push(`${key} = ?`);
            values.push(value);
        }
        values.push(memberId);
        const [result] = await db.query(
            `UPDATE employment_data SET ${fields.join(', ')} WHERE member_id = ?`,
            values
        );
        return result.affectedRows;
    },

    delete: async (id) => {
        const [result] = await db.query('DELETE FROM employment_data WHERE id = ?', [id]);
        return result.affectedRows;
    }
};

module.exports = EmploymentModel;

