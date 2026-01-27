const db = require('./config/database');

async function debug() {
    try {
        console.log('--- DEBUG DOCUMENTS ---');

        // 1. Count Documents with type 'KK'
        const [docs] = await db.query("SELECT COUNT(*) as count FROM documents WHERE type = 'KK'");
        console.log("Documents with type 'KK':", docs[0].count);

        // 2. Count KK table
        const [kks] = await db.query("SELECT COUNT(*) as count FROM kk");
        console.log("Rows in KK table:", kks[0].count);

        // 3. Check if we can migrate
        if (docs[0].count > 0 && kks[0].count === 0) {
            console.log("MIGRATION NEEDED: Documents exist but KK table is empty.");
        }

        process.exit(0);
    } catch (err) {
        console.error('DEBUG ERROR:', err);
        process.exit(1);
    }
}

debug();
