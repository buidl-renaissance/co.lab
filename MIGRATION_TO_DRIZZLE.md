# Migration to Drizzle ORM + Turso

This document outlines the migration from Knex to Drizzle ORM with Turso (distributed SQLite).

## Setup Complete

1. ✅ Installed `drizzle-orm` and `@libsql/client`
2. ✅ Installed `drizzle-kit` (dev dependency)
3. ✅ Created Drizzle schema in `src/db/schema.ts`
4. ✅ Created Drizzle client in `src/db/drizzle.ts`
5. ✅ Created `drizzle.config.ts` configuration file
6. ✅ Updated `package.json` scripts

## Environment Variables Needed

Add these to your `.env.local` (and production environment):

```bash
# Turso Database
TURSO_DATABASE_URL=libsql://your-database-url.turso.io
TURSO_AUTH_TOKEN=your-auth-token-here

# For local development, you can use:
# TURSO_DATABASE_URL=file:./dev.sqlite3
# (no auth token needed for local file)
```

## Next Steps

### 1. Set up Turso Database

1. Sign up at [Turso](https://turso.tech)
2. Create a new database
3. Get your database URL and auth token
4. Add them to your environment variables

### 2. Generate and Run Migrations

```bash
# Generate migration from schema
yarn db:generate

# Push schema to database (for development)
yarn db:push

# Or run migrations (for production)
yarn db:migrate
```

### 3. Convert Database Access Code

The existing code in `src/db/collaboration.ts` and `src/db/github.ts` still uses Knex-style queries. These need to be converted to Drizzle syntax.

**Current (Knex):**
```typescript
await client('collaborations').insert(newCollaboration);
const result = await client('collaborations').where({ id }).first();
```

**New (Drizzle):**
```typescript
import { db } from './drizzle';
import { collaborations } from './schema';

await db.insert(collaborations).values(newCollaboration);
const result = await db.select().from(collaborations).where(eq(collaborations.id, id)).limit(1)[0];
```

### 4. Remove Knex Dependencies (After Migration)

Once all code is converted:
- Remove `knex` from `package.json`
- Remove `sqlite3`, `mysql`, `mysql2` if not needed
- Remove `knexfile.js` and `migrations/` folder (or keep for reference)

## Drizzle Studio

You can use Drizzle Studio to inspect your database:

```bash
yarn db:studio
```

This opens a web UI at `http://localhost:4983` to browse your database.

## Key Differences from Knex

1. **Type Safety**: Drizzle provides better TypeScript inference
2. **Query Builder**: Different syntax, more SQL-like
3. **Migrations**: Managed by `drizzle-kit` instead of Knex migrations
4. **JSON Columns**: Drizzle handles JSON serialization automatically with `mode: 'json'`

## Schema Notes

- Timestamps are stored as Unix epoch integers (seconds since 1970-01-01)
- JSON fields use `text` with `{ mode: 'json' }` for automatic serialization
- Boolean fields use `integer` with `{ mode: 'boolean' }`

