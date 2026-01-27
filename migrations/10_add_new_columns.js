const db = require('../config/database');

const migration = async () => {
    try {
        console.log('Starting migration: Add new columns...');

        // Add column to kesejahteraan (formerly prasejahtera)
        await db.query(`
            ALTER TABLE kesejahteraan 
            ADD COLUMN tingkat_sosial VARCHAR(255) DEFAULT NULL;
        `);
        console.log('Added tingkat_sosial to kesejahteraan');

        // Add columns to employment_data
        await db.query(`
            ALTER TABLE employment_data 
            ADD COLUMN pendidikan_terakhir VARCHAR(255) DEFAULT NULL,
            ADD COLUMN no_hp_wa VARCHAR(50) DEFAULT NULL,
            ADD COLUMN email VARCHAR(255) DEFAULT NULL;
        `);
        console.log('Added pendidikan_terakhir, no_hp_wa, email to employment_data');

        // Add column to kk_members (anggota)
        await db.query(`
            ALTER TABLE kk_members 
            ADD COLUMN no_kitap VARCHAR(100) DEFAULT NULL;
        `);
        console.log('Added no_kitap to kk_members');

        // Add column to kk
        await db.query(`
            ALTER TABLE kk 
            ADD COLUMN status_hard_copy VARCHAR(100) DEFAULT NULL;
        `);
        console.log('Added status_hard_copy to kk');

        console.log('Migration completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
        throw error;
    }
};

migration();
