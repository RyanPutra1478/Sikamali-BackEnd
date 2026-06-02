const db = require('../config/database');

async function up() {
    await db.query('DROP TABLE IF EXISTS announcements');
    console.log('Table announcements dropped.');
}

module.exports = { up };
