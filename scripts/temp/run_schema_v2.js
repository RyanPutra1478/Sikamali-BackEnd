const db = require('./config/database');
const fs = require('fs');
const path = require('path');

async function runSchemaUpdate() {
    try {
        console.log('Running schema update v2...');

        // 1. Create activity_logs table
        const sqlFile = path.join(__dirname, 'schema_update_v2.sql');
        const sqlContent = fs.readFileSync(sqlFile, 'utf8');

        // Split by semicolon to get individual queries, but be careful with semicolons in text.
        // For this simple file, splitting by ';' is okay-ish, but better to run specific queries.

        // Let's just run the CREATE TABLE first.
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS \`activity_logs\` (
              \`id\` int NOT NULL AUTO_INCREMENT,
              \`user_id\` int DEFAULT NULL,
              \`action\` varchar(50) NOT NULL,
              \`entity\` varchar(50) NOT NULL,
              \`entity_id\` int DEFAULT NULL,
              \`details\` text,
              \`ip_address\` varchar(50) DEFAULT NULL,
              \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
              PRIMARY KEY (\`id\`),
              KEY \`user_id\` (\`user_id\`),
              CONSTRAINT \`activity_logs_ibfk_1\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `;

        await db.query(createTableQuery);
        console.log('activity_logs table created or already exists.');

        // 2. Check and Add status_domisili to kk_members
        console.log('Checking kk_members columns...');
        const [rows] = await db.query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'sikamali' AND TABLE_NAME = 'kk_members' AND COLUMN_NAME = 'status_domisili'");

        if (rows.length === 0) {
            console.log('Adding status_domisili column to kk_members...');
            await db.query("ALTER TABLE `kk_members` ADD COLUMN `status_domisili` ENUM('Penduduk Asli', 'Pendatang', 'Meninggal', 'Pindah') DEFAULT 'Penduduk Asli'");
            console.log('Column added.');
        } else {
            console.log('status_domisili column already exists.');
        }

        console.log('Schema update completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Schema update failed:', err);
        process.exit(1);
    }
}

runSchemaUpdate();
