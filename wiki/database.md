# Database

This document describes the database schema and operations for Co.Lab.

## Overview

Co.Lab uses **SQLite** via **Turso** (LibSQL) for data persistence. The database layer is managed with **Drizzle ORM** for type-safe queries and migrations.

## Connection

### Configuration

Database connection is configured via environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `TURSO_DATABASE_URL` | Turso database URL | `file:./dev.sqlite3` |
| `TURSO_AUTH_TOKEN` | Turso authentication token | (none - uses local file) |

### Local Development

Without a Turso auth token, the database falls back to a local SQLite file (`dev.sqlite3`).

### Client Setup

```typescript
// src/db/drizzle.ts
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:./dev.sqlite3',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
```

## Schema

### Users Table

Stores authenticated user profiles.

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  fid TEXT NOT NULL UNIQUE,
  username TEXT,
  displayName TEXT,
  pfpUrl TEXT,
  createdAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updatedAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);
```

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT | Primary key (UUID) |
| `fid` | TEXT | Farcaster ID (unique) |
| `username` | TEXT | Farcaster username |
| `displayName` | TEXT | Display name |
| `pfpUrl` | TEXT | Profile picture URL |
| `createdAt` | INTEGER | Unix timestamp |
| `updatedAt` | INTEGER | Unix timestamp |

---

### Farcaster Accounts Table

Links Farcaster accounts to users.

```sql
CREATE TABLE farcaster_accounts (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  fid TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL,
  createdAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updatedAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);
```

---

### Collaborations Table

Stores collaboration projects.

```sql
CREATE TABLE collaborations (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  template TEXT NOT NULL,        -- JSON
  createdAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updatedAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  answers TEXT NOT NULL,         -- JSON
  participants TEXT NOT NULL,    -- JSON array
  collaboratorIds TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active',
  analysis TEXT,                 -- JSON
  transcripts TEXT,              -- JSON array
  summary TEXT NOT NULL DEFAULT '',
  createdByUserId TEXT,
  eventDetails TEXT              -- JSON
);
```

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT | Primary key (UUID) |
| `title` | TEXT | Collaboration title |
| `description` | TEXT | Description |
| `template` | JSON | Template object |
| `answers` | JSON | Question/answer pairs |
| `participants` | JSON | Array of participant usernames |
| `collaboratorIds` | TEXT | Comma-separated IDs for queries |
| `status` | TEXT | `active`, `completed`, or `archived` |
| `analysis` | JSON | AI analysis results |
| `transcripts` | JSON | Array of transcript strings |
| `summary` | TEXT | Collaboration summary |
| `createdByUserId` | TEXT | Creator's username |
| `eventDetails` | JSON | Event-specific details |

**Event Details JSON Structure:**
```json
{
  "eventTitle": "string",
  "date": "YYYY-MM-DD",
  "time": "HH:MM AM/PM",
  "endTime": "string (optional)",
  "timezone": "string (optional)",
  "location": "string",
  "flyerUrl": "string (optional)",
  "tags": ["string"],
  "eventType": "standard | renaissance",
  "externalEventId": "number (optional)",
  "publishedAt": "ISO date (optional)",
  "sponsors": [{ "name": "...", "logo": "...", "websiteUrl": "..." }],
  "activities": [{ "name": "...", "description": "...", "startTime": "...", "endTime": "..." }]
}
```

---

### GitHub Accounts Table

Stores linked GitHub accounts.

```sql
CREATE TABLE github_accounts (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  githubLogin TEXT NOT NULL,
  githubUserId TEXT NOT NULL,
  accessToken TEXT NOT NULL,
  tokenType TEXT NOT NULL,
  createdAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updatedAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);
```

---

### GitHub Repos Table

Tracks linked GitHub repositories.

```sql
CREATE TABLE github_repos (
  id TEXT PRIMARY KEY,
  owner TEXT NOT NULL,
  name TEXT NOT NULL,
  displayName TEXT NOT NULL,
  projectId TEXT,
  isDefault INTEGER NOT NULL DEFAULT 0,
  createdAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updatedAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);
```

---

### GitHub Issue Links Table

Links collaborations to GitHub issues.

```sql
CREATE TABLE github_issue_links (
  id TEXT PRIMARY KEY,
  collaborationId TEXT NOT NULL,
  githubRepoId TEXT NOT NULL,
  issueNumber INTEGER NOT NULL,
  issueUrl TEXT NOT NULL,
  issueState TEXT NOT NULL,
  lastSyncedAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  createdAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updatedAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);
```

---

### GitHub Pull Request Links Table

Tracks linked pull requests.

```sql
CREATE TABLE github_pull_request_links (
  id TEXT PRIMARY KEY,
  githubRepoId TEXT NOT NULL,
  pullNumber INTEGER NOT NULL,
  headSha TEXT NOT NULL,
  status TEXT NOT NULL,
  deploymentStatus TEXT,
  lastSyncedAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  createdAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updatedAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);
```

## Database Operations

### Collaboration Operations

Located in `src/db/collaboration.ts`:

```typescript
// Create a new collaboration
createCollaboration(data: CollaborationInput): Promise<Collaboration>

// Get collaboration by ID
getCollaborationById(id: string): Promise<Collaboration | null>

// Update collaboration
updateCollaboration(id: string, updates: Partial<Collaboration>): Promise<Collaboration | null>

// Get all collaborations
getAllCollaborations(): Promise<Collaboration[]>

// Get collaborations by username
getCollaborationsByUsername(username: string): Promise<Collaboration[]>

// Delete collaboration
deleteCollaboration(id: string): Promise<boolean>
```

### User Operations

Located in `src/db/user.ts`:

```typescript
// Get or create user by Farcaster ID
getOrCreateUserByFid(fid: string, userData: UserData): Promise<User>

// Get user by ID
getUserById(id: string): Promise<User | null>

// Upsert Farcaster account
upsertFarcasterAccount(userId: string, data: FarcasterData): Promise<void>
```

## Migrations

Migrations are stored in the `drizzle/` directory and managed via Drizzle Kit.

### Running Migrations

```bash
# Generate migration from schema changes
yarn drizzle-kit generate

# Apply migrations
node scripts/apply-migration.js
```

### Migration History

| Migration | Description |
|-----------|-------------|
| `0000_fearless_firestar.sql` | Initial schema |
| `0001_flaky_captain_flint.sql` | Schema updates |
| `0002_add_event_details.sql` | Add eventDetails column |
| `0003_add_collaborator_ids.sql` | Add collaboratorIds for efficient queries |

## Query Patterns

### Efficient User Queries

The `collaboratorIds` column enables efficient querying:

```typescript
// Query collaborations by username (uses LIKE for comma-delimited search)
const searchPattern = `,${username},`;
const results = await db
  .select()
  .from(collaborations)
  .where(
    sql`${collaborations.collaboratorIds} LIKE ${'%' + searchPattern + '%'}`
  );
```

### JSON Field Handling

Drizzle handles JSON serialization automatically for `mode: 'json'` columns:

```typescript
// Reading
const result = await db.select().from(collaborations).where(eq(collaborations.id, id));
const template = result.template; // Already parsed JSON

// Writing
await db.insert(collaborations).values({
  template: { id: 'event', name: 'Host an Event', ... }, // Auto-stringified
});
```
