import type { Config } from 'drizzle-kit';

// Load environment variables - use override to ensure .env values are used
// drizzle-kit may run this as CommonJS, so use require
try {
  require('dotenv').config({ path: '.env.local', override: true });
} catch (e) {
  // Ignore if dotenv not available or file doesn't exist
}
try {
  require('dotenv').config({ path: '.env', override: true });
} catch (e) {
  // Ignore if dotenv not available or file doesn't exist
}

// Construct dbCredentials - for SQLite dialect, drizzle-kit only accepts { url: string }
// For Turso, the authToken must be included in the URL or passed via environment
// Since drizzle-kit doesn't support authToken in dbCredentials for SQLite,
// we need to use the URL format that includes credentials or handle it differently
const dbUrl = process.env.TURSO_DATABASE_URL || 'file:./dev.sqlite3';

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: dbUrl,
    // Note: authToken is passed via TURSO_AUTH_TOKEN env var
    // and used by the libSQL client, not drizzle-kit config
  },
} satisfies Config;
