const db = require('./config/database');

async function verifyMigration() {
    console.log('Starting verification of land_plots migration...');

    try {
        // 1. Check columns in land_plots
        console.log('Checking land_plots columns...');
        const [columns] = await db.query('SHOW COLUMNS FROM land_plots');
        const columnNames = columns.map(c => c.Field);

        const hasKkId = columnNames.includes('kk_id');
        const hasNomorKk = columnNames.includes('nomor_kk');

        if (hasKkId && !hasNomorKk) {
            console.log('Success: land_plots has kk_id and NOT nomor_kk.');
        } else {
            console.error('Failure: land_plots columns are incorrect.', { hasKkId, hasNomorKk });
        }

        // 2. Check if data is linked correctly
        console.log('Checking data integrity...');
        const [links] = await db.query(`
            SELECT lp.id, lp.kk_id, kk.nomor_kk 
            FROM land_plots lp 
            JOIN kk ON lp.kk_id = kk.id 
            LIMIT 5
        `);

        if (links.length > 0 || (await db.query('SELECT COUNT(*) as count FROM land_plots'))[0][0].count === 0) {
            console.log('Success: Data correctly linked to KK table.');
            if (links.length > 0) {
                console.log('Sample links:', links);
            }
        } else {
            console.error('Failure: Data not linked to KK table.');
        }

        console.log('Verification finished.');
        process.exit(0);
    } catch (err) {
        console.error('Verification failed:', err.message);
        process.exit(1);
    }
}

verifyMigration();
