// Script to apply Drizzle migration directly to Turso
// Usage: node scripts/apply-migration.js [migration-file]
// Example: node scripts/apply-migration.js 0002_add_event_details.sql
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

  // Get migration file from command line arg or default to latest
  const migrationArg = process.argv[2];
  let migrationFile;
  
  if (migrationArg) {
    // Use specified migration file
    migrationFile = path.join(__dirname, '../drizzle', migrationArg);
  } else {
    // Find and apply all migrations in order
    const drizzleDir = path.join(__dirname, '../drizzle');
    const files = fs.readdirSync(drizzleDir)
      .filter(f => f.endsWith('.sql'))
      .sort();
    
    if (files.length === 0) {
      console.error('❌ No migration files found');
      process.exit(1);
    }
    
    console.log('📋 Available migrations:');
    files.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
    console.log('\nTo apply a specific migration: node scripts/apply-migration.js <filename>');
    console.log('Example: node scripts/apply-migration.js 0002_add_event_details.sql\n');
    
    // Default to last migration
    migrationFile = path.join(drizzleDir, files[files.length - 1]);
    console.log(`Applying latest migration: ${files[files.length - 1]}\n`);
  }

  if (!fs.existsSync(migrationFile)) {
    console.error(`❌ Migration file not found: ${migrationFile}`);
    process.exit(1);
  }

  // For local SQLite, don't need auth token
  const client = url.startsWith('file:') 
    ? createClient({ url })
    : createClient({ url, authToken });

  try {
    const sql = fs.readFileSync(migrationFile, 'utf8');
    
    // Split by statement-breakpoint and execute each statement
    const statements = sql
      .split('--> statement-breakpoint')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    // If no statement-breakpoint markers, treat each semicolon as a statement
    const finalStatements = statements.length === 1 && !sql.includes('--> statement-breakpoint')
      ? sql.split(';').map(s => s.trim()).filter(s => s.length > 0)
      : statements;

    console.log(`📦 Applying migration: ${path.basename(migrationFile)}`);
    console.log(`📝 Found ${finalStatements.length} statement(s) to execute\n`);

    for (const statement of finalStatements) {
      if (statement.trim()) {
        const preview = statement.substring(0, 100).replace(/\n/g, ' ');
        console.log(`Executing: ${preview}...`);
        await client.execute(statement);
        console.log('  ✓ Done');
      }
    }

    console.log('\n✅ Migration applied successfully!');
    if (!url.startsWith('file:')) {
      client.close();
    }
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (error.message.includes('already exists') || error.message.includes('duplicate')) {
      console.log('✓ Note: Tables/columns may already exist. This is OK.');
    } else {
      if (!url.startsWith('file:')) {
        client.close();
      }
      process.exit(1);
    }
  }
}

applyMigration();

