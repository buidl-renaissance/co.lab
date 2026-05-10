# Project Structure

This document describes the directory layout and code organization of Co.Lab.

## Root Directory

```
co.lab/
├── drizzle/              # Database migrations and schema
├── public/               # Static assets
├── scripts/              # Utility scripts
├── src/                  # Application source code
├── wiki/                 # Documentation
├── drizzle.config.ts     # Drizzle ORM configuration
├── eslint.config.mjs     # ESLint configuration
├── next.config.ts        # Next.js configuration
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── yarn.lock             # Yarn lockfile
```

## Source Directory (`src/`)

### Pages (`src/pages/`)

Next.js Pages Router structure:

```
src/pages/
├── _app.tsx              # App wrapper with providers
├── _document.tsx         # Custom document
├── index.tsx             # Home page
├── about.tsx             # About page
├── collabs.tsx           # Collaborations list
├── contact.tsx           # Contact form
├── dashboard.tsx         # User dashboard
├── frames.tsx            # Farcaster frames page
├── license.tsx           # License information
├── onboarding.tsx        # User onboarding
├── privacy.tsx           # Privacy policy
├── terms.tsx             # Terms of service
├── collab/
│   └── [id].tsx          # Single collaboration view
├── create/
│   ├── index.tsx         # Template selection
│   └── [template].tsx    # Create with specific template
├── settings/
│   └── integrations/
│       └── github.tsx    # GitHub integration settings
└── api/                  # API routes (see api-routes.md)
```

### API Routes (`src/pages/api/`)

See [API Routes Documentation](./api-routes.md) for complete details.

```
src/pages/api/
├── mcp.ts                # MCP JSON-RPC endpoint
├── create.ts             # Create collaboration
├── collaborations.ts     # List collaborations
├── contact.ts            # Contact form submission
├── transcribe.ts         # Audio transcription
├── upload.ts             # File upload
├── auth/
│   ├── verify.ts         # Farcaster auth verification
│   ├── miniapp.ts        # Mini app authentication
│   └── dev-login.ts      # Development login
├── collaboration/
│   ├── [id].ts           # Get/update collaboration
│   └── [id]/
│       ├── add.ts        # Add transcript
│       ├── update.ts     # Update transcript
│       ├── event-details.ts    # Update event details
│       ├── generate-flyer.ts   # Generate AI flyer
│       └── publish-event.ts    # Publish to external API
├── debug/
│   └── sdk.ts            # SDK debugging endpoint
├── frames/
│   └── start.ts          # Farcaster frame handler
├── github/
│   └── oauth/
│       ├── start.ts      # GitHub OAuth initiation
│       └── callback.ts   # GitHub OAuth callback
├── user/
│   └── me.ts             # Current user info
└── well-known/
    └── farcaster.json.ts # Farcaster manifest
```

### Components (`src/components/`)

Reusable React components:

```
src/components/
├── AddTranscript.tsx     # Add transcript form
├── Buttons.tsx           # Button components
├── CoLab.tsx             # Main collaboration component
├── DesktopSidebar.tsx    # Desktop navigation
├── EditTranscript.tsx    # Edit transcript form
├── EnhancedNav.tsx       # Enhanced navigation
├── EventCard.tsx         # Event display card
├── Footer.tsx            # Page footer
├── Form.tsx              # Form components
├── Layout.tsx            # Page layout wrapper
├── Loading.tsx           # Loading indicators
├── MobileNav.tsx         # Mobile navigation
├── Modal.tsx             # Modal dialogs
├── NextSteps.tsx         # Next steps display
├── Onboarding.tsx        # Onboarding flow
├── SectionHeader.tsx     # Section headers
├── Splash.tsx            # Splash screen
├── Templates.tsx         # Template selection
└── Transcriber.tsx       # Voice transcription UI
```

### Database (`src/db/`)

Database client and operations:

```
src/db/
├── client.ts             # Database client utilities
├── collaboration.ts      # Collaboration CRUD operations
├── drizzle.ts            # Drizzle ORM setup
├── github.ts             # GitHub-related DB operations
├── schema.ts             # Drizzle table definitions
└── user.ts               # User CRUD operations
```

### Data Models (`src/data/`)

TypeScript interfaces and mock data:

```
src/data/
├── collaboration.ts      # Collaboration types & mocks
└── template.ts           # Template definitions
```

### Library (`src/lib/`)

Shared utilities and services:

```
src/lib/
├── analyze.ts            # Transcript analysis (OpenAI)
├── eventsApi.ts          # External events API client
├── farcasterAuth.ts      # Farcaster authentication
├── framesConfig.ts       # Farcaster frames configuration
├── githubConfig.ts       # GitHub OAuth configuration
├── spaces.ts             # DigitalOcean Spaces uploads
├── middleware/
│   └── farcasterUser.ts  # User extraction middleware
└── mcp/
    ├── config.ts         # MCP tool definitions
    ├── registry.ts       # Tool registry
    ├── testHarness.ts    # MCP self-test utilities
    └── types.ts          # MCP type definitions
```

### Contexts (`src/contexts/`)

React context providers:

```
src/contexts/
├── ThemeContext.tsx      # Theme management
└── UserContext.tsx       # User state management
```

### Styles (`src/styles/`)

Global styles and theme:

```
src/styles/
├── globals.css           # Global CSS
├── globalStyles.ts       # Styled-components global styles
└── theme.ts              # Theme configuration
```

### Hooks (`src/hooks/`)

Custom React hooks:

```
src/hooks/
└── useCollaborations.ts  # Collaboration data fetching
```

## Database Directory (`drizzle/`)

Drizzle ORM migrations and schema:

```
drizzle/
├── schema.ts             # Table definitions for migrations
├── relations.ts          # Table relationships
├── 0000_fearless_firestar.sql  # Initial migration
├── 0001_flaky_captain_flint.sql
├── 0002_add_event_details.sql
├── 0003_add_collaborator_ids.sql
└── meta/
    ├── _journal.json     # Migration journal
    └── 0000_snapshot.json (etc.)
```

## Public Assets (`public/`)

Static files served at root:

```
public/
├── images/
│   ├── voice-wave.svg    # Voice recording animation
│   └── reference-flyer.jpg  # Flyer style reference
├── globe.svg
├── file.svg
├── next.svg
├── vercel.svg
└── window.svg
```
