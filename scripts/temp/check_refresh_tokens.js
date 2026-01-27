const db = require('./config/database');

async function checkRefreshTokensTable() {
  try {
    console.log('Checking refresh_tokens table...');
    
    const [tables] = await db.query("SHOW TABLES LIKE 'refresh_tokens'");
    
    if (tables.length === 0) {
      console.log('refresh_tokens table missing. Creating it...');
      await db.query(`
        CREATE TABLE refresh_tokens (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          token TEXT NOT NULL,
          expires_at DATETIME NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      console.log('refresh_tokens table created.');
    } else {
      console.log('refresh_tokens table exists.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Check failed:', error);
    process.exit(1);
  }
}

checkRefreshTokensTable();
