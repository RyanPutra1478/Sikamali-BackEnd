const fs = require('fs');
const path = require('path');
const pool = require('./config/database');

async function runMigrations() {
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir).sort();

    console.log('Starting migrations...');

    try {
        // Optional: Disable foreign key checks during migration if needed
        // await pool.query('SET FOREIGN_KEY_CHECKS = 0');

        for (const file of files) {
            if (file.endsWith('.js')) {
                console.log(`Running migration: ${file}`);
                const migration = require(path.join(migrationsDir, file));
                await migration.up();
            }
        }

        // await pool.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('All migrations completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

runMigrations();
