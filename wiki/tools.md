# Tools

This document describes the development tools and utilities used in Co.Lab.

## Build Tools

### Next.js

Co.Lab is built with [Next.js](https://nextjs.org/) using the Pages Router.

**Configuration:** `next.config.ts`

```typescript
// Key configurations
{
  reactStrictMode: true,
  // Additional settings...
}
```

### TypeScript

Full TypeScript support with strict type checking.

**Configuration:** `tsconfig.json`

Key path aliases:
- `@/*` → `src/*`

### ESLint

Code linting with ESLint.

**Configuration:** `eslint.config.mjs`

```bash
# Run linting
yarn lint
```

## Database Tools

### Drizzle ORM

Type-safe SQL queries and schema management.

**Configuration:** `drizzle.config.ts`

```typescript
export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  driver: 'turso',
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
};
```

**Commands:**
```bash
# Generate migrations
yarn drizzle-kit generate

# Push schema changes (dev)
yarn drizzle-kit push

# Open Drizzle Studio (GUI)
yarn drizzle-kit studio
```

### Turso/LibSQL

Edge-compatible SQLite database.

- **Local:** File-based SQLite (`./dev.sqlite3`)
- **Production:** Turso cloud database

## Styling Tools

### Styled Components

CSS-in-JS styling solution.

**Configuration:** `src/styles/globalStyles.ts`

Example usage:
```typescript
import styled from 'styled-components';

const Button = styled.button`
  background: ${props => props.theme.primary};
  padding: 8px 16px;
`;
```

### Theme Configuration

Theme values defined in `src/styles/theme.ts`.

## API Tools

### OpenAI SDK

For AI-powered features:
- **Whisper**: Audio transcription
- **GPT-4**: Transcript analysis
- **GPT-4 Vision**: Reference image analysis
- **DALL-E 3**: Flyer generation

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
```

### Neynar API

Farcaster authentication and user data.

```typescript
// Verify Quick Auth token
fetch('https://api.neynar.com/v2/farcaster/quick-auth/verify', {
  method: 'POST',
  headers: {
    'api_key': process.env.NEYNAR_API_KEY,
  },
  body: JSON.stringify({ token }),
});
```

## Testing Tools

### MCP Test Harness

Built-in testing utility for MCP tools.

**Location:** `src/lib/mcp/testHarness.ts`

```typescript
import { runMcpSelfTest } from '@/lib/mcp/testHarness';

// Run self-test
const results = await runMcpSelfTest();
```

### Debug Endpoints

Development debugging endpoint:
- `GET /api/debug/sdk` - SDK debugging information

## Package Management

### Yarn

Preferred package manager.

```bash
# Install dependencies
yarn install

# Add package
yarn add <package>

# Add dev dependency
yarn add -D <package>

# Run script
yarn <script>
```

**Lockfile:** `yarn.lock` (committed to repo)

## Migration Scripts

### Apply Migrations

**Location:** `scripts/apply-migration.js`

```bash
node scripts/apply-migration.js
```

## Environment Management

### .env Files

| File | Purpose |
|------|---------|
| `.env` | Default environment variables |
| `.env.local` | Local overrides (not committed) |
| `.env.development` | Development-specific |
| `.env.production` | Production-specific |

## Deployment Tools

### Vercel

Recommended deployment platform for Next.js.

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment Variables

Configure in Vercel Dashboard or via CLI:
```bash
vercel env add OPENAI_API_KEY
```

## External Service Integrations

| Service | Purpose | Configuration |
|---------|---------|---------------|
| OpenAI | AI features | `OPENAI_API_KEY` |
| Turso | Database | `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` |
| Neynar | Farcaster auth | `NEYNAR_API_KEY` |
| DigitalOcean Spaces | File storage | `DO_SPACES_*` variables |
| GitHub OAuth | GitHub integration | `GITHUB_CLIENT_*` variables |

## Utility Libraries

| Library | Purpose |
|---------|---------|
| `uuid` | Generate UUIDs |
| `drizzle-orm` | Database ORM |
| `@libsql/client` | LibSQL/Turso client |
| `openai` | OpenAI API client |
| `styled-components` | CSS-in-JS |
