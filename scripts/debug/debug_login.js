const db = require('./config/database');
const bcrypt = require('bcryptjs');

async function debugLogin() {
  const username = 'admin'; // Assuming 'admin' is the username being tested
  console.log(`Attempting to debug login for username: ${username}`);

  try {
    // 1. Test DB Connection
    console.log('Testing DB connection...');
    await db.query('SELECT 1');
    console.log('DB Connection OK.');

    // 2. Fetch User
    console.log(`Fetching user ${username}...`);
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    
    if (rows.length === 0) {
      console.log('User not found.');
      process.exit(0);
    }

    const user = rows[0];
    console.log('User found:', { 
      id: user.id, 
      username: user.username, 
      role: user.role, 
      status: user.status 
    });

    // 3. Check Status
    if (user.status !== 'active') {
      console.log('Status check failed: User is not active.');
    } else {
      console.log('Status check passed.');
    }

    // 4. Test Password (we won't check against real password input, just verify bcrypt works)
    console.log('Testing bcrypt...');
    const hash = user.password;
    if (!hash) {
      console.log('Error: User has no password hash.');
    } else {
      console.log('Password hash exists. Length:', hash.length);
      // Try comparing with a dummy password to see if bcrypt throws
      try {
        await bcrypt.compare('dummy', hash);
        console.log('bcrypt.compare executed without error.');
      } catch (bcryptError) {
        console.error('bcrypt error:', bcryptError);
      }
    }

    console.log('Debug sequence completed. If this script runs without error, the issue might be in Token Generation or Request Handling.');
    process.exit(0);

  } catch (error) {
    console.error('CRITICAL ERROR:', error);
    process.exit(1);
  }
}

debugLogin();
