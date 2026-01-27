const db = require('../config/database');

const StatService = {
    getDashboardStats: async () => {
        const [totalKK] = await db.query('SELECT COUNT(*) as count FROM kk');
        const [totalMembers] = await db.query('SELECT COUNT(*) as count FROM kk_members');
        const [totalUsers] = await db.query('SELECT COUNT(*) as count FROM users');
        const [totalDocuments] = await db.query('SELECT COUNT(*) as count FROM documents');

        // Employment Stats
        const [angkatanKerja] = await db.query('SELECT COUNT(*) as count FROM employment_data');
        const [sudahBekerja] = await db.query("SELECT COUNT(*) as count FROM employment_data WHERE LOWER(status_kerja) LIKE '%bekerja%' AND LOWER(status_kerja) NOT LIKE '%belum%'");
        const [belumBekerja] = await db.query("SELECT COUNT(*) as count FROM employment_data WHERE LOWER(status_kerja) LIKE '%belum bekerja%'");

        return {
            totalKK: totalKK[0].count,
            totalMembers: totalMembers[0].count,
            totalUsers: totalUsers[0].count,
            totalDocuments: totalDocuments[0].count,
            angkatanKerja: angkatanKerja[0].count,
            sudahBekerja: sudahBekerja[0].count,
            belumBekerja: belumBekerja[0].count
        };
    }
};

module.exports = StatService;
