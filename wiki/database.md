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
  eventDetails TEXT,             -- JSON
  shareToken TEXT UNIQUE,        -- UUID for link sharing
  shareMode TEXT DEFAULT 'private',  -- private, link, public
  tags TEXT                      -- JSON array
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
| `shareToken` | TEXT | UUID v4 for link-based sharing (unique) |
| `shareMode` | TEXT | `private`, `link`, or `public` |
| `tags` | JSON | Array of tag strings for filtering |
| `coverImageUrl` | TEXT | Cover image URL for entity cards |
| `category` | TEXT | Collaboration category |
| `capacity` | INTEGER | Maximum number of participants/attendees |
| `rsvpCount` | INTEGER | Current RSVP count (default: 0) |

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
  "coverImageUrl": "string (optional)",
  "tags": ["string"],
  "category": "string (optional)",
  "capacity": "number (optional)",
  "rsvpCount": "number (optional)",
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

---

## PKI Authentication Tables

### User Public Keys Table

Stores Ed25519 public keys for PKI authentication.

```sql
CREATE TABLE user_public_keys (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  publicKey TEXT NOT NULL,
  label TEXT NOT NULL,
  createdAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  revokedAt INTEGER
);
```

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT | Primary key (UUID) |
| `userId` | TEXT | User ID this key belongs to |
| `publicKey` | TEXT | Ed25519 public key (64-char hex) |
| `label` | TEXT | User-provided label (e.g., "My Phone") |
| `createdAt` | INTEGER | Unix timestamp |
| `revokedAt` | INTEGER | Unix timestamp when revoked (null if active) |

---

### API Keys Table

Stores hashed API keys for programmatic MCP access.

```sql
CREATE TABLE api_keys (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  keyHash TEXT NOT NULL,
  keyPrefix TEXT NOT NULL,
  label TEXT NOT NULL,
  scopes TEXT NOT NULL,
  lastUsedAt INTEGER,
  expiresAt INTEGER,
  revokedAt INTEGER,
  createdAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);
```

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT | Primary key (UUID) |
| `userId` | TEXT | User ID this key belongs to |
| `keyHash` | TEXT | bcrypt hash of the raw API key |
| `keyPrefix` | TEXT | First 12 chars of key for display/lookup |
| `label` | TEXT | User-provided label |
| `scopes` | JSON | Array of scope strings (e.g., `["*"]` or `["listCollaborations"]`) |
| `lastUsedAt` | INTEGER | Unix timestamp of last use |
| `expiresAt` | INTEGER | Unix timestamp when key expires (null for no expiry) |
| `revokedAt` | INTEGER | Unix timestamp when revoked (null if active) |
| `createdAt` | INTEGER | Unix timestamp |

---

### Refresh Tokens Table

Stores hashed refresh tokens for JWT renewal.

```sql
CREATE TABLE refresh_tokens (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  tokenHash TEXT NOT NULL,
  expiresAt INTEGER NOT NULL,
  revokedAt INTEGER,
  createdAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);
```

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT | Primary key (UUID) |
| `userId` | TEXT | User ID this token belongs to |
| `tokenHash` | TEXT | bcrypt hash of the raw token |
| `expiresAt` | INTEGER | Unix timestamp when token expires |
| `revokedAt` | INTEGER | Unix timestamp when revoked (null if active) |
| `createdAt` | INTEGER | Unix timestamp |

---

### Nonces Table

Stores challenge nonces for PKI authentication.

```sql
CREATE TABLE nonces (
  id TEXT PRIMARY KEY,
  publicKey TEXT NOT NULL,
  nonce TEXT NOT NULL UNIQUE,
  expiresAt INTEGER NOT NULL,
  usedAt INTEGER,
  createdAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);
```

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT | Primary key (UUID) |
| `publicKey` | TEXT | Public key this nonce is for |
| `nonce` | TEXT | Random challenge string (unique) |
| `expiresAt` | INTEGER | Unix timestamp when nonce expires (2 min) |
| `usedAt` | INTEGER | Unix timestamp when used (null if unused) |
| `createdAt` | INTEGER | Unix timestamp |

---

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

// Sharing operations
getCollaborationByShareToken(shareToken: string): Promise<Collaboration | null>
generateShareToken(id: string): Promise<{ shareToken: string; shareUrl: string } | null>
revokeShareToken(id: string): Promise<boolean>

// Paginated list with filters
listCollaborations(params: CollaborationListParams): Promise<CollaborationListResult>

// Get public collaborations only
getPublicCollaborations(params: CollaborationListParams): Promise<CollaborationListResult>
```

**CollaborationListParams:**
```typescript
interface CollaborationListParams {
  q?: string;        // Search query (title, description)
  template?: string; // Filter by template id
  status?: string;   // Filter by status
  tag?: string;      // Filter by tag
  limit?: number;    // Page size (default 20)
  offset?: number;   // Pagination offset (default 0)
}
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

### Auth Operations

Located in `src/db/auth.ts`:

```typescript
// Public Key Operations
registerPublicKey(userId: string, publicKey: string, label: string): Promise<UserPublicKey>
getPublicKeysByUser(userId: string): Promise<UserPublicKey[]>
getPublicKeyByValue(publicKey: string): Promise<UserPublicKey | null>
revokePublicKey(id: string, userId: string): Promise<boolean>

// API Key Operations
createApiKey(userId: string, label: string, scopes: string[], expiresAt?: Date): Promise<{ apiKey: ApiKey; rawKey: string }>
listApiKeys(userId: string): Promise<ApiKey[]>
revokeApiKey(id: string, userId: string): Promise<boolean>
validateApiKey(rawKey: string): Promise<{ userId: string; scopes: string[] } | null>

// Refresh Token Operations
createRefreshToken(userId: string): Promise<string>
rotateRefreshToken(rawToken: string): Promise<{ userId: string; newToken: string } | null>

// Nonce Operations
createNonce(publicKey: string): Promise<string>
verifyAndConsumeNonce(publicKey: string, nonce: string): Promise<boolean>
cleanupExpiredNonces(): Promise<number>
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
| `0004_friendly_lightspeed.sql` | Add PKI auth tables (user_public_keys, api_keys, refresh_tokens, nonces) |
| `0005_add_share_fields.sql` | Add shareToken, shareMode, tags columns for sharing |
| `0006_add_entity_card_fields.sql` | Add coverImageUrl, category, capacity, rsvpCount columns |

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
