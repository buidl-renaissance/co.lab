# AGENTS

Guidelines for AI agents working with the Co.Lab codebase.

## Overview

Co.Lab is a voice-first project planning tool built with Next.js (Pages Router), TypeScript, and styled-components. This document provides context for AI agents to effectively understand and contribute to the codebase.

## Repository Structure

```
co.lab/
├── src/
│   ├── pages/          # Next.js pages and API routes
│   ├── components/     # React components
│   ├── db/             # Database operations
│   ├── lib/            # Shared utilities
│   ├── data/           # Type definitions and mock data
│   ├── contexts/       # React context providers
│   ├── hooks/          # Custom React hooks
│   └── styles/         # Styling (styled-components)
├── drizzle/            # Database migrations
├── public/             # Static assets
└── wiki/               # Documentation
```

## Key Conventions

### Code Style

- **TypeScript**: Strict mode enabled, use explicit types
- **Styling**: Use styled-components (not CSS modules or Tailwind)
- **Package Manager**: Use `yarn` (not npm)
- **Imports**: Use `@/` path alias for `src/` imports

### API Routes

- Located in `src/pages/api/`
- Follow REST conventions
- Return consistent response format:
  ```typescript
  { success: boolean, data?: T, error?: string }
  ```

### Database

- Use Drizzle ORM for all database operations
- Schema defined in `src/db/schema.ts`
- Operations in dedicated files (`src/db/collaboration.ts`, etc.)

### Components

- Functional components with TypeScript
- Props interfaces defined inline or in same file
- Styled-components for all styling

## Important Files

| File | Purpose |
|------|---------|
| `src/pages/api/mcp.ts` | MCP endpoint for AI agent integration |
| `src/lib/mcp/config.ts` | MCP tool definitions |
| `src/db/collaboration.ts` | Core collaboration CRUD |
| `src/lib/analyze.ts` | Transcript analysis logic |
| `src/data/collaboration.ts` | Collaboration type definitions |
| `src/data/template.ts` | Template definitions |

## MCP Integration

The `/api/mcp` endpoint allows AI agents to interact with Co.Lab data through 11 tools:

**Collaboration Tools:**
- `listCollaborations` - List all collaborations
- `getCollaboration` - Get by ID
- `createCollaborationFromTranscript` - Create from transcript
- `createCollaboration` - Create with full control
- `updateCollaboration` - Update by ID
- `deleteCollaboration` - Delete by ID
- `listCollaborationsByUsername` - List by username

**User Tools:**
- `getUserByFid` - Look up user by Farcaster ID
- `getUserByUsername` - Look up user by username

**GitHub Tools:**
- `listGithubRepos` - List linked repos
- `getGithubIssueLinks` - Get issue links for collaboration

See [MCP Integration](./mcp-integration.md) for full documentation.

## Common Tasks

### Adding a New API Endpoint

1. Create file in `src/pages/api/`
2. Export default async handler function
3. Handle request method validation
4. Return consistent response format

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';

type ResponseData = {
  success: boolean;
  data?: any;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Implementation
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Internal error' });
  }
}
```

### Adding a New MCP Tool

1. Add tool definition in `src/lib/mcp/config.ts`:
   ```typescript
   export const toolDefinitions: McpToolDefinition[] = [
     // ... existing tools
     {
       name: 'newTool',
       description: 'Tool description',
       inputSchema: { type: 'object', properties: { ... } },
       outputSchema: { type: 'object', properties: { ... } },
     },
   ];
   ```

2. Register handler in `registerMcpTools()`:
   ```typescript
   globalToolRegistry.registerTool(
     toolDefinitions[n],
     async (args) => {
       // Implementation
       return { success: true, data: result };
     }
   );
   ```

### Modifying Database Schema

1. Update schema in `src/db/schema.ts`
2. Generate migration: `yarn drizzle-kit generate`
3. Apply migration: `node scripts/apply-migration.js`
4. Update corresponding operations file

### Adding a New Component

1. Create file in `src/components/`
2. Use styled-components for styling
3. Export the component

```typescript
import styled from 'styled-components';

const Container = styled.div`
  padding: 16px;
`;

interface MyComponentProps {
  title: string;
}

export const MyComponent = ({ title }: MyComponentProps) => {
  return <Container>{title}</Container>;
};
```

## Environment Variables

See [Getting Started](./getting-started.md) for complete list.

**Critical for testing:**
- `OPENAI_API_KEY` - Required for transcription/analysis
- `TURSO_DATABASE_URL` - Database (defaults to local SQLite)

## Testing Guidance

### Local Testing

```bash
# Start dev server
yarn dev

# Test MCP endpoint
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

### Database Testing

Local development uses `./dev.sqlite3` by default. No Turso credentials needed for basic testing.

## Do's and Don'ts

### Do

- Use TypeScript strict mode types
- Follow existing code patterns
- Use styled-components for styling
- Use `@/` import alias
- Test API changes with curl or similar
- Update wiki documentation when adding features

### Don't

- Use CSS modules or Tailwind (use styled-components)
- Use npm (use yarn)
- Commit `.env.local` or secrets
- Modify schema without migrations
- Skip error handling in API routes

## Related Documentation

- [Architecture](./architecture.md) - System design
- [API Routes](./api-routes.md) - Endpoint documentation
- [MCP Integration](./mcp-integration.md) - AI agent API
- [Database](./database.md) - Schema and operations
- [Getting Started](./getting-started.md) - Setup guide
