// Script to apply Drizzle migration directly to Turso
const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env', override: true });
require('dotenv').config({ path: '.env.local', override: true });
const fs = require('fs');
const path = require('path');

async function applyMigration() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    console.error('❌ TURSO_DATABASE_URL is not set');
    process.exit(1);
  }

  // For local SQLite, don't need auth token
  const client = url.startsWith('file:') 
    ? createClient({ url })
    : createClient({ url, authToken });

  try {
    // Get the latest migration file (0001_flaky_captain_flint.sql)
    const migrationFile = path.join(__dirname, '../drizzle/0001_flaky_captain_flint.sql');
    
    if (!fs.existsSync(migrationFile)) {
      console.error(`❌ Migration file not found: ${migrationFile}`);
      process.exit(1);
    }

    const sql = fs.readFileSync(migrationFile, 'utf8');
    
    // Split by statement-breakpoint and execute each statement
    const statements = sql
      .split('--> statement-breakpoint')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📦 Applying migration: 0001_flaky_captain_flint.sql`);
    console.log(`📝 Found ${statements.length} statements to execute\n`);

    for (const statement of statements) {
      if (statement.trim()) {
        const preview = statement.substring(0, 80).replace(/\n/g, ' ');
        console.log(`Executing: ${preview}...`);
        await client.execute(statement);
      }
    }

    console.log('\n✅ Migration applied successfully!');
    if (!url.startsWith('file:')) {
      client.close();
    }
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (error.message.includes('already exists') || error.message.includes('duplicate')) {
      console.log('Note: Tables/columns may already exist. This is OK.');
    } else {
      if (!url.startsWith('file:')) {
        client.close();
      }
      process.exit(1);
    }
  }
}

applyMigration();

