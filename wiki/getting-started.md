# Getting Started

This guide walks through setting up Co.Lab for local development.

## Prerequisites

- **Node.js**: v14 or higher
- **Yarn**: Package manager (preferred)
- **Git**: Version control

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/buidl-renaissance/co.lab.git
cd co.lab
```

### 2. Install Dependencies

```bash
yarn install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local  # If example exists
# Or create manually
touch .env.local
```

### 4. Environment Variables

#### Required for Basic Operation

| Variable | Description | Example |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key for transcription and analysis | `sk-...` |

#### Database (Optional for local dev)

| Variable | Description | Default |
|----------|-------------|---------|
| `TURSO_DATABASE_URL` | Turso database URL | `file:./dev.sqlite3` |
| `TURSO_AUTH_TOKEN` | Turso auth token | (uses local SQLite) |

#### Farcaster Integration

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_APP_URL` | Canonical app URL | For production |
| `NEYNAR_API_KEY` | Neynar API key for Farcaster auth | For Farcaster features |
| `FARCASTER_SIGNER_UUID` | Farcaster signer UUID | Future use |

#### File Storage

| Variable | Description | Required |
|----------|-------------|----------|
| `DO_SPACES_ENDPOINT` | DigitalOcean Spaces endpoint | For file uploads |
| `DO_SPACES_REGION` | Spaces region | For file uploads |
| `DO_SPACES_BUCKET` | Spaces bucket name | For file uploads |
| `DO_SPACES_KEY` | Spaces access key | For file uploads |
| `DO_SPACES_SECRET` | Spaces secret key | For file uploads |

#### MCP API

| Variable | Description | Required |
|----------|-------------|----------|
| `MCP_API_KEY` | API key for MCP endpoint | Optional (dev: open) |

#### External Events API

| Variable | Description | Required |
|----------|-------------|----------|
| `EVENTS_API_URL` | External events API base URL | For event publishing |
| `EVENTS_API_KEY` | External events API key | For event publishing |

#### GitHub Integration

| Variable | Description | Required |
|----------|-------------|----------|
| `GITHUB_CLIENT_ID` | GitHub OAuth app client ID | For GitHub features |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth app secret | For GitHub features |

### 5. Start the Development Server

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Development Commands

```bash
# Start development server
yarn dev

# Build for production
yarn build

# Start production server
yarn start

# Run linting
yarn lint

# Type checking
yarn type-check
```

## Database Setup

### Local Development (SQLite)

By default, Co.Lab uses a local SQLite file for development:

```bash
# Database file is created automatically at:
./dev.sqlite3
```

### Running Migrations

```bash
# Apply database migrations
node scripts/apply-migration.js
```

### Using Turso (Production)

1. Create a Turso database at [turso.tech](https://turso.tech)
2. Get your database URL and auth token
3. Add to `.env.local`:
   ```
   TURSO_DATABASE_URL=libsql://your-db.turso.io
   TURSO_AUTH_TOKEN=your-token
   ```

## Testing the Setup

### 1. Verify the Home Page

Navigate to `http://localhost:3000` - you should see the Co.Lab landing page.

### 2. Test Transcription (requires OpenAI key)

1. Go to `/create/event`
2. Record a short audio clip
3. Verify transcription works

### 3. Test MCP Endpoint

```bash
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

Expected response: List of available tools.

## Troubleshooting

### OpenAI API Errors

- Verify `OPENAI_API_KEY` is set correctly
- Check API key has sufficient credits
- Ensure key has access to Whisper and GPT-4 models

### Database Connection Issues

- For local dev, ensure `./dev.sqlite3` is writable
- For Turso, verify `TURSO_AUTH_TOKEN` is correct
- Check network connectivity to Turso

### Farcaster Auth Not Working

- Verify `NEYNAR_API_KEY` is set and valid
- For local testing, use the dev login endpoint: `POST /api/auth/dev-login`

### File Uploads Failing

- Verify DigitalOcean Spaces credentials
- Check bucket permissions allow uploads
- Ensure endpoint URL is correct for your region

## Project Scripts

| Script | Description |
|--------|-------------|
| `yarn dev` | Start development server with hot reload |
| `yarn build` | Build production bundle |
| `yarn start` | Run production server |
| `yarn lint` | Run ESLint |
| `node scripts/apply-migration.js` | Apply database migrations |

## Recommended VS Code Extensions

- ESLint
- Prettier
- TypeScript Vue Plugin (Volar)
- Styled Components syntax highlighting

## Next Steps

- Read [Architecture](./architecture.md) to understand the system design
- Review [API Routes](./api-routes.md) for available endpoints
- Check [MCP Integration](./mcp-integration.md) for AI agent setup
- Explore [Features](./features.md) for functionality overview
