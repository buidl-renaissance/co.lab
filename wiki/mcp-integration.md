# MCP Integration

This document describes the Model Context Protocol (MCP) endpoint for AI agent integration with Co.Lab.

## Overview

Co.Lab exposes a lightweight MCP-style endpoint that allows AI agents to discover and invoke tools backed by the collaboration APIs. This enables programmatic interaction with collaborations through a standardized protocol.

## Endpoint

**URL:** `POST /api/mcp`  
**Protocol:** JSON-RPC 2.0 with MCP-style methods

## Authentication

When the `MCP_API_KEY` environment variable is set, requests must include one of:

- `Authorization: Bearer <MCP_API_KEY>` header
- `x-mcp-api-key: <MCP_API_KEY>` header

Without the environment variable, the endpoint is open (for development).

## Rate Limiting

- **Window:** 60 seconds
- **Max Requests:** 60 per IP per window
- **Response:** HTTP 429 with JSON-RPC error when exceeded

## JSON-RPC Format

### Request

```json
{
  "jsonrpc": "2.0",
  "id": "unique-request-id",
  "method": "tools/list | tools/call",
  "params": { ... }
}
```

### Success Response

```json
{
  "jsonrpc": "2.0",
  "id": "unique-request-id",
  "result": { ... }
}
```

### Error Response

```json
{
  "jsonrpc": "2.0",
  "id": "unique-request-id",
  "error": {
    "code": -32600,
    "message": "Error description",
    "data": { ... }
  }
}
```

## Methods

### tools/list

Lists all available tools with their schemas.

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list"
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "tools": [
      {
        "name": "listCollaborations",
        "description": "List all collaborations.",
        "inputSchema": { "type": "object", "properties": {} },
        "outputSchema": { ... }
      },
      ...
    ]
  }
}
```

### tools/call

Invokes a tool by name with arguments.

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "toolName",
    "arguments": { ... }
  }
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "content": { ... }
  }
}
```

## Available Tools

### listCollaborations

Lists all collaborations in the system.

**Arguments:** None

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "...",
      "description": "...",
      "template": { ... },
      "participants": ["user1", "user2"],
      "status": "active",
      "createdAt": "ISO date",
      "updatedAt": "ISO date"
    }
  ]
}
```

---

### getCollaboration

Retrieves a specific collaboration by ID.

**Arguments:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Collaboration UUID |

**Request Example:**
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "getCollaboration",
    "arguments": {
      "id": "123e4567-e89b-12d3-a456-426614174000"
    }
  }
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "content": {
      "success": true,
      "data": {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "title": "Summer Music Festival Planning",
        "description": "...",
        "template": { "id": "event", ... },
        "participants": ["alice", "bob"],
        "answers": { ... },
        "status": "active",
        "analysis": { ... },
        "transcripts": ["..."],
        "summary": "...",
        "eventDetails": { ... }
      }
    }
  }
}
```

**Error (Not Found):**
```json
{
  "content": {
    "success": false,
    "error": "Collaboration not found"
  }
}
```

---

### createCollaborationFromTranscript

Creates a new collaboration from a transcript and template.

**Arguments:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `transcript` | string | Yes | Raw conversation text |
| `templateId` | string | Yes | Template identifier |

**Valid Template IDs:** `event`, `artwork`, `contest`, `fundraise`, `workshop`, `webproduct`

**Request Example:**
```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "tools/call",
  "params": {
    "name": "createCollaborationFromTranscript",
    "arguments": {
      "transcript": "Let's plan a community art show for next month. We need to book the gallery, invite artists, and set up catering.",
      "templateId": "event"
    }
  }
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "result": {
    "content": {
      "success": true,
      "data": {
        "id": "new-uuid",
        "title": "New collaboration",
        "template": { "id": "event", "name": "event", "tag": "EVENT", ... },
        "transcripts": ["Let's plan a community art show..."],
        "status": "active",
        ...
      }
    }
  }
}
```

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| -32600 | Invalid Request | Malformed JSON-RPC request |
| -32601 | Method not found | Unknown method |
| -32602 | Invalid params | Missing or invalid parameters |
| -32603 | Internal error | Server-side error |
| 401 | Unauthorized | Invalid or missing API key |
| 429 | Rate limit exceeded | Too many requests |

## Usage Examples

### cURL

```bash
# List tools
curl -X POST https://co.lab.builddetroit.xyz/api/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'

# Get collaboration
curl -X POST https://co.lab.builddetroit.xyz/api/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "jsonrpc":"2.0",
    "id":2,
    "method":"tools/call",
    "params":{
      "name":"getCollaboration",
      "arguments":{"id":"your-collab-id"}
    }
  }'
```

### JavaScript/TypeScript

```typescript
async function callMcpTool(name: string, args?: object) {
  const response = await fetch('/api/mcp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.MCP_API_KEY}`,
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'tools/call',
      params: { name, arguments: args },
    }),
  });
  
  const result = await response.json();
  if (result.error) throw new Error(result.error.message);
  return result.result.content;
}

// Usage
const collaborations = await callMcpTool('listCollaborations');
const collab = await callMcpTool('getCollaboration', { id: 'uuid' });
```

## Self-Test Harness

For testing, use the built-in test harness:

```typescript
import { runMcpSelfTest } from '@/lib/mcp/testHarness';

const results = await runMcpSelfTest();
console.log(results);
```

## Logging

Each MCP call is logged as structured JSON to stdout:

```json
{
  "type": "mcp_call",
  "method": "tools/call",
  "id": 1,
  "ip": "192.168.1.1",
  "durationMs": 45
}
```
