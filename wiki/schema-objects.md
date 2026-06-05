# Schema.org Collaborative Document Storage

This document describes the schema.org collaborative document storage feature, which provides a cloud-hosted structured data layer for storing, searching, and sharing schema.org-typed objects.

## Overview

The schema.org document storage system enables:
- **Structured Data Storage**: Store schema.org-typed objects (Person, Event, Project, Organization, Place)
- **Semantic Search**: Vector-based search using OpenAI embeddings
- **Collaboration Groups**: Group related objects into collaborations
- **Relationship Linking**: Create edges between related objects
- **JSON-LD Export**: Export collaborations as valid schema.org JSON-LD for SEO/sharing

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     REST API / MCP Tools                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────┐    ┌──────────────────────────┐   │
│  │   Turso/SQLite      │    │       LanceDB            │   │
│  │   (Metadata)        │    │   (Vectors + Data)       │   │
│  │                     │    │                          │   │
│  │  schema_            │    │  schema_objects table    │   │
│  │  collaborations     │    │  - embeddings            │   │
│  │  table              │    │  - full object data      │   │
│  │                     │    │  - semantic search       │   │
│  └─────────────────────┘    └──────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Supported Schema Types

| Type | Description | Key Fields |
|------|-------------|------------|
| **Person** | Individual people | givenName, familyName, email, jobTitle, worksFor |
| **Event** | Events and gatherings | startDate, endDate, location, organizer, attendee |
| **Project** | Projects and initiatives | creator, contributor, keywords, status |
| **Organization** | Companies and groups | legalName, address, member, foundingDate |
| **Place** | Locations and venues | address, geo (lat/lng), maximumAttendeeCapacity |

## REST API Endpoints

### Schema Objects

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/schema-objects` | Create or upsert a schema object |
| GET | `/api/schema-objects` | List objects (with optional filters) |
| GET | `/api/schema-objects/:id` | Fetch object by ID |
| PATCH | `/api/schema-objects/:id` | Update object fields |
| DELETE | `/api/schema-objects/:id` | Soft delete object |
| POST | `/api/schema-objects/search` | Semantic search |
| POST | `/api/schema-objects/link` | Create relationship edge |

### Schema Collaborations

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/schema-collaborations` | Create collaboration |
| GET | `/api/schema-collaborations` | List collaborations |
| GET | `/api/schema-collaborations/:id` | Get collaboration |
| PATCH | `/api/schema-collaborations/:id` | Update collaboration |
| DELETE | `/api/schema-collaborations/:id` | Delete collaboration |
| GET | `/api/schema-collaborations/:id/objects` | List collaboration objects |
| GET | `/api/schema-collaborations/:id/export` | Export as JSON-LD |

## MCP Tools

Six new MCP tools are available for AI agents:

### upsert_schema_object

Create or update a schema.org-typed object.

```json
{
  "method": "tools/call",
  "params": {
    "name": "upsert_schema_object",
    "arguments": {
      "@type": "Person",
      "name": "John Doe",
      "email": "john@example.com",
      "jobTitle": "Software Engineer",
      "collaborationId": "collab-123",
      "source": "agent"
    }
  }
}
```

### get_schema_object

Fetch an object by ID.

```json
{
  "method": "tools/call",
  "params": {
    "name": "get_schema_object",
    "arguments": {
      "id": "object-uuid"
    }
  }
}
```

### search_schema_objects

Semantic and filtered search.

```json
{
  "method": "tools/call",
  "params": {
    "name": "search_schema_objects",
    "arguments": {
      "query": "software engineers in Detroit",
      "types": ["Person"],
      "collaborationId": "collab-123",
      "limit": 10
    }
  }
}
```

### list_collaboration_objects

List all objects in a collaboration.

```json
{
  "method": "tools/call",
  "params": {
    "name": "list_collaboration_objects",
    "arguments": {
      "collaborationId": "collab-123"
    }
  }
}
```

### link_objects

Create a relationship between objects.

```json
{
  "method": "tools/call",
  "params": {
    "name": "link_objects",
    "arguments": {
      "sourceId": "person-uuid",
      "targetId": "event-uuid",
      "relationshipType": "organizer",
      "collaborationId": "collab-123"
    }
  }
}
```

### export_jsonld

Export collaboration as JSON-LD.

```json
{
  "method": "tools/call",
  "params": {
    "name": "export_jsonld",
    "arguments": {
      "collaborationId": "collab-123"
    }
  }
}
```

## Data Model

### Schema Object Base

All schema objects share these fields:

```typescript
interface SchemaObjectBase {
  '@type': 'Person' | 'Event' | 'Project' | 'Organization' | 'Place';
  '@id': string;           // UUID
  name: string;            // Required
  description?: string;
  source: 'voice_session' | 'manual' | 'agent' | 'import';
  collaborationId: string;
  createdAt: string;       // ISO8601
  updatedAt: string;       // ISO8601
  deletedAt?: string;      // Soft delete
}
```

### Object Relationship

```typescript
interface ObjectRelationship {
  id: string;
  sourceId: string;
  sourceType: SchemaOrgType;
  targetId: string;
  targetType: SchemaOrgType;
  relationshipType: string;  // e.g., 'organizer', 'attendee', 'member'
  collaborationId: string;
  createdAt: string;
}
```

## JSON-LD Export

The export endpoint produces valid schema.org JSON-LD:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Event",
      "@id": "event-uuid",
      "name": "Tech Meetup",
      "startDate": "2024-03-15T18:00:00Z",
      "location": "Detroit Tech Hub"
    },
    {
      "@type": "Person",
      "@id": "person-uuid",
      "name": "John Doe",
      "jobTitle": "Organizer"
    }
  ]
}
```

## Usage Examples

### Create a Person from Voice Session

```bash
curl -X POST http://localhost:3000/api/schema-objects \
  -H "Content-Type: application/json" \
  -d '{
    "@type": "Person",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "jobTitle": "Event Coordinator",
    "source": "voice_session",
    "collaborationId": "collab-123"
  }'
```

### Semantic Search

```bash
curl -X POST http://localhost:3000/api/schema-objects/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "conference speakers from tech companies",
    "types": ["Person"],
    "limit": 5
  }'
```

### Export for SEO

```bash
curl http://localhost:3000/api/schema-collaborations/collab-123/export \
  -H "Accept: application/ld+json"
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | For embedding generation | Yes |
| `LANCEDB_URI` | LanceDB connection (default: `./data/lancedb`) | No |

## Database Migration

The feature adds one new table to the Turso database:

```sql
CREATE TABLE schema_collaborations (
  id TEXT PRIMARY KEY,
  name TEXT,
  description TEXT,
  templateId TEXT,
  chatThreadId TEXT,
  createdByUserId TEXT,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL
);
```

Run migration:
```bash
yarn db:generate
node scripts/apply-migration.js
```

## File Locations

| File | Purpose |
|------|---------|
| `src/data/schemaObject.ts` | Type definitions |
| `src/lib/lancedb/` | LanceDB service layer |
| `src/db/schemaCollaboration.ts` | Turso CRUD operations |
| `src/pages/api/schema-objects/` | REST API endpoints |
| `src/lib/mcp/schemaObjectTools.ts` | MCP tool definitions |

## Related Documentation

- [MCP Integration](./mcp-integration.md) - AI agent API
- [Architecture](./architecture.md) - System design
- [API Routes](./api-routes.md) - Endpoint documentation
