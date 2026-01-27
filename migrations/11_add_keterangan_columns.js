const db = require('../config/database');

const migration = async () => {
    try {
        console.log('Starting migration: Add keterangan columns...');

        // Add column to kk
        await db.query(`
            ALTER TABLE kk 
            ADD COLUMN keterangan TEXT DEFAULT NULL;
        `);
        console.log('Added keterangan to kk');

        // Add column to kk_members
        await db.query(`
            ALTER TABLE kk_members 
            ADD COLUMN keterangan TEXT DEFAULT NULL;
        `);
        console.log('Added keterangan to kk_members');

        // Add column to employment_data
        await db.query(`
            ALTER TABLE employment_data 
            ADD COLUMN keterangan TEXT DEFAULT NULL;
        `);
        console.log('Added keterangan to employment_data');

        // Add column to kesejahteraan
        await db.query(`
            ALTER TABLE kesejahteraan 
            ADD COLUMN keterangan TEXT DEFAULT NULL;
        `);
        console.log('Added keterangan to kesejahteraan');

        console.log('Migration completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
        throw error;
    }
};

migration();
