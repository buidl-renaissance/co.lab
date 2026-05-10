# Architecture

This document describes the system architecture of Co.Lab.

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js (Pages Router) |
| **Language** | TypeScript |
| **Styling** | Styled Components, CSS |
| **Database** | SQLite via Turso (LibSQL) |
| **ORM** | Drizzle ORM |
| **AI/ML** | OpenAI (Whisper, GPT-4, DALL-E 3) |
| **File Storage** | DigitalOcean Spaces |
| **Authentication** | Farcaster (via Neynar API) |

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   Next.js    │  │  Farcaster   │  │   AI Agents      │  │
│  │   Frontend   │  │  Mini App    │  │   (MCP Clients)  │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (Next.js)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  REST APIs   │  │  MCP API     │  │   Frame APIs     │  │
│  │  /api/*      │  │  /api/mcp    │  │  /api/frames/*   │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Service Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Transcript  │  │   Flyer      │  │   External       │  │
│  │  Analysis    │  │ Generation   │  │   Events API     │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   Turso      │  │  DigitalOcean│  │   OpenAI         │  │
│  │  (SQLite)    │  │   Spaces     │  │   APIs           │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Core Flows

### 1. Collaboration Creation Flow

```
User Records Audio
        │
        ▼
POST /api/transcribe (Whisper)
        │
        ▼
POST /api/create
        │
        ├── Analyze transcript (GPT-4)
        ├── Extract participants, tasks, timeline
        ├── Create collaboration in DB
        │
        ▼
Return Collaboration
```

### 2. MCP Tool Invocation Flow

```
AI Agent Request
        │
        ▼
POST /api/mcp (JSON-RPC 2.0)
        │
        ├── Validate API key
        ├── Rate limit check
        ├── Route to tool handler
        │
        ▼
Tool Registry → DB Operations
        │
        ▼
JSON-RPC Response
```

### 3. Event Flyer Generation Flow

```
POST /api/collaboration/[id]/generate-flyer
        │
        ├── Get collaboration & event details
        ├── Analyze reference image (GPT-4 Vision)
        ├── Generate flyer (DALL-E 3)
        ├── Upload to DigitalOcean Spaces
        ├── Update collaboration with flyer URL
        │
        ▼
Return updated collaboration
```

## Design Decisions

### Pages Router vs App Router
The project uses Next.js Pages Router for API routes and pages. This provides stable, well-documented patterns for server-side operations.

### Turso/LibSQL for Database
Turso provides edge-compatible SQLite with:
- Low latency reads
- Easy local development (file-based SQLite)
- Drizzle ORM integration for type safety

### MCP Protocol Adoption
The `/api/mcp` endpoint implements a lightweight Model Context Protocol to enable AI agent integration:
- JSON-RPC 2.0 transport
- Tool listing and invocation
- API key authentication
- Rate limiting per IP

### Farcaster-First Authentication
Primary authentication is via Farcaster Mini App SDK:
- Quick Auth JWT tokens
- Sign-In With Farcaster (SIWF)
- Frame context extraction

## Security Considerations

1. **API Authentication**: MCP endpoint supports optional API key via `MCP_API_KEY`
2. **Rate Limiting**: In-memory rate limiting (60 requests/minute per IP)
3. **Input Validation**: Request body validation on all endpoints
4. **CORS**: Configured for cross-origin requests where needed
