const db = require('./config/database');

async function checkSchema() {
    try {
        const [rows] = await db.query('DESCRIBE kk_members');
        console.log('Schema of kk_members:');
        rows.forEach(row => {
            console.log(`${row.Field} (${row.Type})`);
        });
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

checkSchema();
