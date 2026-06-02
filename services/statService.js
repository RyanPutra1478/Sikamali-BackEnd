const db = require('../config/database');

const StatService = {
    getDashboardStats: async () => {
        const [totalKK] = await db.query('SELECT COUNT(*) as count FROM kk');
        const [totalMembers] = await db.query('SELECT COUNT(*) as count FROM kk_members');
        const [totalUsers] = await db.query('SELECT COUNT(*) as count FROM users');

        // Employment Stats
        const [angkatanKerja] = await db.query('SELECT COUNT(*) as count FROM employment_data');
        const [sudahBekerja] = await db.query("SELECT COUNT(*) as count FROM employment_data WHERE LOWER(status_kerja) LIKE '%bekerja%' AND LOWER(status_kerja) NOT LIKE '%belum%'");
        const [belumBekerja] = await db.query("SELECT COUNT(*) as count FROM employment_data WHERE LOWER(status_kerja) LIKE '%belum bekerja%'");

        return {
            totalKK: totalKK[0].count,
            totalMembers: totalMembers[0].count,
            totalUsers: totalUsers[0].count,
            angkatanKerja: angkatanKerja[0].count,
            sudahBekerja: sudahBekerja[0].count,
            belumBekerja: belumBekerja[0].count
        };
    },

    getDetailedStats: async () => {
        const query = `
            SELECT 
                k.desa,
                COUNT(k.id) as totalKK,
                SUM(CASE WHEN LOWER(p.kategori_sosial) LIKE '%pra sejahtera%' OR LOWER(p.kategori_sosial) LIKE '%prasejahtera%' THEN 1 ELSE 0 END) as keluargaPrasejahtera,
                SUM(CASE WHEN LOWER(p.kategori_sosial) LIKE '%mandiri%' OR LOWER(p.kategori_sosial) LIKE '%sejahtera mandiri%' THEN 1 ELSE 0 END) as keluargaSejahteraMandiri,
                SUM(CASE WHEN (LOWER(p.kategori_sosial) NOT LIKE '%pra sejahtera%' AND LOWER(p.kategori_sosial) NOT LIKE '%prasejahtera%' AND LOWER(p.kategori_sosial) NOT LIKE '%mandiri%') OR p.kategori_sosial IS NULL THEN 1 ELSE 0 END) as keluargaSejahtera,
                SUM(COALESCE(members_cnt.totalPenduduk, 0)) as totalPenduduk,
                SUM(COALESCE(emp_cnt.angkatanKerja, 0)) as angkatanKerja,
                SUM(COALESCE(emp_cnt.sudahBekerja, 0)) as sudahBekerja,
                SUM(COALESCE(emp_cnt.belumBekerja, 0)) as belumBekerja
            FROM kk k
            LEFT JOIN kesejahteraan p ON k.id = p.kk_id
            LEFT JOIN (
                SELECT m.kk_id, COUNT(*) as totalPenduduk 
                FROM kk_members m 
                GROUP BY m.kk_id
            ) members_cnt ON k.id = members_cnt.kk_id
            LEFT JOIN (
                SELECT 
                    ed.kk_id,
                    COUNT(*) as angkatanKerja,
                    SUM(CASE WHEN LOWER(status_kerja) LIKE '%bekerja%' AND LOWER(status_kerja) NOT LIKE '%belum%' THEN 1 ELSE 0 END) as sudahBekerja,
                    SUM(CASE WHEN LOWER(status_kerja) LIKE '%belum bekerja%' THEN 1 ELSE 0 END) as belumBekerja
                FROM employment_data ed
                GROUP BY ed.kk_id
            ) emp_cnt ON k.id = emp_cnt.kk_id
            WHERE k.desa IS NOT NULL AND k.desa != ''
            GROUP BY k.desa
            ORDER BY k.desa ASC
        `;
        const [rows] = await db.query(query);
        return rows;
    }
};

module.exports = StatService;
