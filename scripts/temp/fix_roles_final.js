const db = require('./config/database');

async function fixRolesFinal() {
  try {
    console.log('--- Fixing Roles to Standard: superadmin ---');

    // 1. Modify column to allow both temporarily (VARCHAR) to avoid truncation errors
    console.log('Step 1: Relaxing column constraint...');
    await db.query("ALTER TABLE users MODIFY COLUMN role VARCHAR(50)");

    // 2. Update 'super_admin' to 'superadmin'
    console.log("Step 2: Updating 'super_admin' to 'superadmin'...");
    const [result] = await db.query("UPDATE users SET role = 'superadmin' WHERE role = 'super_admin'");
    console.log(`Updated ${result.affectedRows} users.`);

    // 3. Update 'executive_guest' to 'guest' (just in case)
    console.log("Step 3: Updating legacy guest roles...");
    await db.query("UPDATE users SET role = 'guest' WHERE role = 'executive_guest'");

    // 4. Set ENUM strictly to new standard
    console.log('Step 4: Enforcing strict ENUM...');
    await db.query("ALTER TABLE users MODIFY COLUMN role ENUM('superadmin', 'admin', 'user', 'guest') NOT NULL DEFAULT 'user'");

    console.log('--- Role Standardization Completed ---');
    
    // Verify
    const [users] = await db.query("SELECT id, username, role, status FROM users");
    console.table(users);

    process.exit(0);
  } catch (error) {
    console.error('Fix failed:', error);
    process.exit(1);
  }
}

fixRolesFinal();
