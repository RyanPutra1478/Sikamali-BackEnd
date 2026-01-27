const db = require('./config/database');

async function checkRoles() {
  try {
    console.log('--- Checking Users Table Schema ---');
    const [columns] = await db.query("SHOW COLUMNS FROM users LIKE 'role'");
    console.log('Role Column Type:', columns[0].Type);

    console.log('\n--- Checking User Roles ---');
    const [users] = await db.query("SELECT id, username, role, status FROM users");
    console.table(users);

    process.exit(0);
  } catch (error) {
    console.error('Check failed:', error);
    process.exit(1);
  }
}

checkRoles();
