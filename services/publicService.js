const db = require('../config/database');

const PublicService = {
    getLandingStats: async (desa = null) => {
        let condition = '';
        const params = [];

        if (desa) {
            condition = ' WHERE desa = ?';
            params.push(desa);
        }

        const [kkRes] = await db.query(`SELECT COUNT(*) as count FROM kk${condition}`, params);

        const [memberRes] = await db.query(`
            SELECT COUNT(*) as count 
            FROM kk_members m
            JOIN kk k ON m.kk_id = k.id
            ${desa ? 'WHERE k.desa = ?' : ''}
        `, params);

        const [praRes] = await db.query(`
            SELECT COUNT(*) as count 
            FROM kesejahteraan p
            JOIN kk k ON p.kk_id = k.id
            WHERE p.status_kesejahteraan = 'prasejahtera'
            ${desa ? 'AND k.desa = ?' : ''}
        `, params);

        const [sejRes] = await db.query(`
            SELECT COUNT(*) as count 
            FROM kk k
            LEFT JOIN kesejahteraan p ON k.id = p.kk_id
            WHERE (p.status_kesejahteraan IS NULL OR p.status_kesejahteraan != 'prasejahtera')
            ${desa ? 'AND k.desa = ?' : ''}
        `, params);

        const [empRes] = await db.query(`
            SELECT 
                COUNT(*) as total_angkatan,
                SUM(CASE WHEN LOWER(status_kerja) LIKE '%bekerja%' AND LOWER(status_kerja) NOT LIKE '%belum%' THEN 1 ELSE 0 END) as sudah_bekerja,
                SUM(CASE WHEN LOWER(status_kerja) LIKE '%belum bekerja%' THEN 1 ELSE 0 END) as belum_bekerja
            FROM employment_data ed
            JOIN kk k ON ed.kk_id = k.id
            ${desa ? 'WHERE k.desa = ?' : ''}
        `, params);

        return {
            totalKK: kkRes[0].count,
            totalPenduduk: memberRes[0].count,
            keluargaPrasejahtera: praRes[0].count,
            keluargaSejahtera: sejRes[0].count,
            angkatanKerja: empRes[0].total_angkatan || 0,
            sudahBekerja: empRes[0].sudah_bekerja || 0,
            belumBekerja: empRes[0].belum_bekerja || 0
        };
    },

    getAvailableVillages: async () => {
        const [rows] = await db.query('SELECT DISTINCT desa FROM kk WHERE desa IS NOT NULL AND desa != "" ORDER BY desa ASC');
        return rows.map(r => r.desa);
    },

    getActiveAnnouncements: async () => {
        const [rows] = await db.query('SELECT title, content, created_at FROM announcements WHERE is_active = 1 ORDER BY created_at DESC');
        return rows;
    },

    getVillageComparison: async () => {
        const [villages] = await db.query('SELECT DISTINCT desa FROM kk WHERE desa IS NOT NULL AND desa != "" ORDER BY desa ASC');
        const results = [];

        for (const v of villages) {
            const desa = v.desa;
            const params = [desa];

            const [kkRes] = await db.query('SELECT COUNT(*) as count FROM kk WHERE desa = ?', params);
            const [memberRes] = await db.query('SELECT COUNT(*) as count FROM kk_members m JOIN kk k ON m.kk_id = k.id WHERE k.desa = ?', params);
            const [praRes] = await db.query("SELECT COUNT(*) as count FROM kesejahteraan p JOIN kk k ON p.kk_id = k.id WHERE p.status_kesejahteraan = 'prasejahtera' AND k.desa = ?", params);
            const [sejRes] = await db.query("SELECT COUNT(*) as count FROM kk k LEFT JOIN kesejahteraan p ON k.id = p.kk_id WHERE (p.status_kesejahteraan IS NULL OR p.status_kesejahteraan != 'prasejahtera') AND k.desa = ?", params);
            const [empRes] = await db.query(`
                SELECT 
                    COUNT(*) as total_angkatan,
                    SUM(CASE WHEN LOWER(status_kerja) LIKE '%bekerja%' AND LOWER(status_kerja) NOT LIKE '%belum%' THEN 1 ELSE 0 END) as sudah_bekerja,
                    SUM(CASE WHEN LOWER(status_kerja) LIKE '%belum bekerja%' THEN 1 ELSE 0 END) as belum_bekerja
                FROM employment_data ed
                JOIN kk k ON ed.kk_id = k.id
                WHERE k.desa = ?
            `, params);

            results.push({
                desa,
                totalKK: kkRes[0].count,
                totalPenduduk: memberRes[0].count,
                keluargaPrasejahtera: praRes[0].count,
                keluargaSejahtera: sejRes[0].count,
                angkatanKerja: empRes[0].total_angkatan || 0,
                sudahBekerja: empRes[0].sudah_bekerja || 0,
                belumBekerja: empRes[0].belum_bekerja || 0
            });
        }

        return results;
    }
};

module.exports = PublicService;
