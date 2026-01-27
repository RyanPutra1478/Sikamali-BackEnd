const pool = require('../config/database');

async function up() {
    try {
        // Check if column exists first
        const [columns] = await pool.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'kk_members' 
            AND COLUMN_NAME = 'status_domisili' 
            AND TABLE_SCHEMA = DATABASE()
        `);

        if (columns.length === 0) {
            console.log('Adding status_domisili to kk_members...');
            await pool.query(`
                ALTER TABLE kk_members 
                ADD COLUMN status_domisili varchar(50) DEFAULT NULL AFTER nama
            `);
            console.log('Column status_domisili added to kk_members successfully.');
        } else {
            console.log('Column status_domisili already exists in kk_members.');
        }
    } catch (err) {
        console.error('Error in migration 09_add_missing_columns:', err);
        throw err;
    }
}

module.exports = { up };
