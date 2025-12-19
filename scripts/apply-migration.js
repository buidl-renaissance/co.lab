// Script to apply Drizzle migration directly to Turso
const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env', override: true });
const fs = require('fs');
const path = require('path');

async function applyMigration() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  try {
    const migrationFile = path.join(__dirname, '../drizzle/0000_fearless_firestar.sql');
    const sql = fs.readFileSync(migrationFile, 'utf8');
    
    // Split by statement-breakpoint and execute each statement
    const statements = sql
      .split('--> statement-breakpoint')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.substring(0, 50) + '...');
        await client.execute(statement);
      }
    }

    console.log('✅ Migration applied successfully!');
    client.close();
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (error.message.includes('already exists')) {
      console.log('Note: Tables may already exist. This is OK.');
    }
    client.close();
    process.exit(1);
  }
}

applyMigration();

