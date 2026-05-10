# MCP Integration

This document describes the Model Context Protocol (MCP) endpoint for AI agent integration with Co.Lab.

## Overview

Co.Lab exposes a lightweight MCP-style endpoint that allows AI agents to discover and invoke tools backed by the collaboration APIs. This enables programmatic interaction with collaborations through a standardized protocol.

## Endpoint

**URL:** `POST /api/mcp`  
**Protocol:** JSON-RPC 2.0 with MCP-style methods

## Authentication

Co.Lab MCP supports three authentication methods:

### 1. PKI Key-Based Authentication (Recommended)

The most secure method using Ed25519 public/private key pairs with short-lived JWTs.

**Flow:**
1. Generate an Ed25519 keypair locally (private key never leaves your device)
2. Register your public key: `POST /api/auth/pki/register-key`
3. Request a challenge: `POST /api/auth/pki/challenge`
4. Sign the challenge nonce with your private key
5. Verify and get tokens: `POST /api/auth/pki/verify`
6. Use the access token: `Authorization: Bearer <access_token>`

**Token Lifecycle:**
- Access tokens expire in 15 minutes
- Refresh tokens expire in 7 days
- Use `POST /api/auth/pki/refresh` to rotate tokens

See [PKI Authentication](#pki-authentication) section below for details.

### 2. Named API Keys

For programmatic access without managing JWTs. Create via the settings UI or API.

```bash
Authorization: Bearer clb_xxxxxxxxxxxx...
```

API keys can have scoped permissions (e.g., only `listCollaborations` and `getCollaboration`).

### 3. Legacy API Key (Deprecated)

When the `MCP_API_KEY` environment variable is set, requests can use:

- `Authorization: Bearer <MCP_API_KEY>` header
- `x-mcp-api-key: <MCP_API_KEY>` header

This method is deprecated and will be removed in a future version. Migrate to PKI or named API keys.

### Authentication Priority

The endpoint checks authentication in this order:
1. Legacy `x-mcp-api-key` header (if `MCP_API_KEY` env var is set)
2. Bearer token starting with `clb_` → API key validation
3. Other Bearer tokens → JWT validation
4. If no `MCP_API_KEY` env var is set and no auth header → anonymous access (for development)

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

Co.Lab exposes 11 MCP tools organized into three categories:

### Tool Summary

| Category | Tool | Description |
|----------|------|-------------|
| Collaboration | `listCollaborations` | List all collaborations |
| Collaboration | `getCollaboration` | Get by ID |
| Collaboration | `createCollaborationFromTranscript` | Create from transcript |
| Collaboration | `createCollaboration` | Create with full control |
| Collaboration | `updateCollaboration` | Update by ID |
| Collaboration | `deleteCollaboration` | Delete by ID |
| Collaboration | `listCollaborationsByUsername` | List by username |
| User | `getUserByFid` | Look up user by Farcaster ID |
| User | `getUserByUsername` | Look up user by username |
| GitHub | `listGithubRepos` | List linked repos |
| GitHub | `getGithubIssueLinks` | Get issue links for collaboration |

---

## Collaboration Tools

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

Creates a new collaboration from a transcript and template (simplified form).

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

---

### createCollaboration

Creates a new collaboration with full control over all fields.

**Arguments:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `title` | string | Yes | Collaboration title |
| `templateId` | string | Yes | Template identifier |
| `templateName` | string | Yes | Template display name |
| `description` | string | No | Description |
| `participants` | string[] | No | Array of usernames |
| `answers` | object | No | Key-value answers |
| `status` | string | No | `active`, `completed`, or `archived` |
| `summary` | string | No | Summary text |
| `createdByUsername` | string | No | Creator username |

**Request Example:**
```json
{
  "jsonrpc": "2.0",
  "id": 5,
  "method": "tools/call",
  "params": {
    "name": "createCollaboration",
    "arguments": {
      "title": "Community Art Show",
      "templateId": "event",
      "templateName": "Event Planning",
      "description": "Planning a local art exhibition",
      "participants": ["alice", "bob"],
      "status": "active",
      "createdByUsername": "alice"
    }
  }
}
```

---

### updateCollaboration

Updates an existing collaboration by ID.

**Arguments:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Collaboration UUID |
| `title` | string | No | Updated title |
| `description` | string | No | Updated description |
| `status` | string | No | `active`, `completed`, or `archived` |
| `summary` | string | No | Updated summary |
| `participants` | string[] | No | Updated participants |
| `answers` | object | No | Updated answers |
| `analysis` | object | No | Updated analysis |
| `transcripts` | string[] | No | Updated transcripts |
| `eventDetails` | object | No | Updated event details |

**Request Example:**
```json
{
  "jsonrpc": "2.0",
  "id": 6,
  "method": "tools/call",
  "params": {
    "name": "updateCollaboration",
    "arguments": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "status": "completed",
      "summary": "Event successfully planned and executed"
    }
  }
}
```

**Response:**
```json
{
  "content": {
    "success": true,
    "data": { /* updated collaboration */ }
  }
}
```

---

### deleteCollaboration

Deletes a collaboration by ID.

**Arguments:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Collaboration UUID |

**Request Example:**
```json
{
  "jsonrpc": "2.0",
  "id": 7,
  "method": "tools/call",
  "params": {
    "name": "deleteCollaboration",
    "arguments": {
      "id": "123e4567-e89b-12d3-a456-426614174000"
    }
  }
}
```

**Response:**
```json
{
  "content": {
    "success": true,
    "deleted": true
  }
}
```

---

### listCollaborationsByUsername

Lists all collaborations for a specific user.

**Arguments:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `username` | string | Yes | Username to filter by |

**Request Example:**
```json
{
  "jsonrpc": "2.0",
  "id": 8,
  "method": "tools/call",
  "params": {
    "name": "listCollaborationsByUsername",
    "arguments": {
      "username": "alice"
    }
  }
}
```

**Response:**
```json
{
  "content": {
    "success": true,
    "data": [ /* collaborations where alice is a participant */ ]
  }
}
```

---

## User Tools

### getUserByFid

Looks up a user by their Farcaster ID.

**Arguments:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `fid` | string | Yes | Farcaster ID |

**Request Example:**
```json
{
  "jsonrpc": "2.0",
  "id": 9,
  "method": "tools/call",
  "params": {
    "name": "getUserByFid",
    "arguments": {
      "fid": "12345"
    }
  }
}
```

**Response:**
```json
{
  "content": {
    "success": true,
    "data": {
      "id": "uuid",
      "fid": "12345",
      "username": "alice",
      "displayName": "Alice",
      "pfpUrl": "https://...",
      "createdAt": "ISO date",
      "updatedAt": "ISO date"
    }
  }
}
```

---

### getUserByUsername

Looks up a user by their username.

**Arguments:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `username` | string | Yes | Username |

**Request Example:**
```json
{
  "jsonrpc": "2.0",
  "id": 10,
  "method": "tools/call",
  "params": {
    "name": "getUserByUsername",
    "arguments": {
      "username": "alice"
    }
  }
}
```

**Response:** Same format as `getUserByFid`

---

## GitHub Tools

### listGithubRepos

Lists all linked GitHub repositories.

**Arguments:** None

**Request Example:**
```json
{
  "jsonrpc": "2.0",
  "id": 11,
  "method": "tools/call",
  "params": {
    "name": "listGithubRepos",
    "arguments": {}
  }
}
```

**Response:**
```json
{
  "content": {
    "success": true,
    "data": [
      {
        "id": "uuid",
        "owner": "org-name",
        "name": "repo-name",
        "displayName": "My Repository",
        "projectId": "project-uuid",
        "isDefault": false,
        "createdAt": "ISO date",
        "updatedAt": "ISO date"
      }
    ]
  }
}
```

---

### getGithubIssueLinks

Gets all GitHub issue links for a specific collaboration.

**Arguments:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `collaborationId` | string | Yes | Collaboration UUID |

**Request Example:**
```json
{
  "jsonrpc": "2.0",
  "id": 12,
  "method": "tools/call",
  "params": {
    "name": "getGithubIssueLinks",
    "arguments": {
      "collaborationId": "123e4567-e89b-12d3-a456-426614174000"
    }
  }
}
```

**Response:**
```json
{
  "content": {
    "success": true,
    "data": [
      {
        "id": "uuid",
        "collaborationId": "123e4567-e89b-12d3-a456-426614174000",
        "githubRepoId": "repo-uuid",
        "issueNumber": 42,
        "issueUrl": "https://github.com/org/repo/issues/42",
        "issueState": "open",
        "lastSyncedAt": "ISO date",
        "createdAt": "ISO date",
        "updatedAt": "ISO date"
      }
    ]
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
  "userId": "user-uuid-or-anonymous",
  "authMethod": "jwt | api_key | legacy",
  "durationMs": 45
}
```

---

## PKI Authentication

Co.Lab uses Ed25519 public key cryptography for secure, user-controlled authentication. Private keys never leave the client device.

### Overview

| Component | Description |
|-----------|-------------|
| Private Key | 32 bytes, stored securely on client (never transmitted) |
| Public Key | 32 bytes (64-char hex), registered with Co.Lab |
| Nonce | Challenge token, valid for 2 minutes |
| Access Token | JWT, valid for 15 minutes |
| Refresh Token | Opaque token, valid for 7 days |

### Step 1: Generate Keypair (Client-Side)

Generate an Ed25519 keypair. Example using `@noble/ed25519`:

```typescript
import * as ed from '@noble/ed25519';

const privateKey = ed.utils.randomPrivateKey();
const publicKey = await ed.getPublicKeyAsync(privateKey);
const publicKeyHex = Array.from(publicKey)
  .map(b => b.toString(16).padStart(2, '0'))
  .join('');

// Store privateKey securely (e.g., device keychain)
// publicKeyHex is what you register with Co.Lab
```

### Step 2: Register Public Key

**POST** `/api/auth/pki/register-key`

```json
{
  "userId": "existing-user-uuid",
  "publicKey": "64-char-hex-public-key",
  "label": "My Mobile Device"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "key-uuid",
    "publicKey": "...",
    "label": "My Mobile Device",
    "createdAt": "ISO date"
  }
}
```

### Step 3: Request Challenge

**POST** `/api/auth/pki/challenge`

```json
{
  "publicKey": "64-char-hex-public-key"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "nonce": "random-32-char-string",
    "expiresIn": 120
  }
}
```

**Rate Limit:** 10 requests per minute per IP.

### Step 4: Sign and Verify

Sign the nonce with your private key and submit for verification.

**Client-side signing:**
```typescript
import * as ed from '@noble/ed25519';

const message = new TextEncoder().encode(nonce);
const signature = await ed.signAsync(message, privateKey);
const signatureHex = Array.from(signature)
  .map(b => b.toString(16).padStart(2, '0'))
  .join('');
```

**POST** `/api/auth/pki/verify`

```json
{
  "publicKey": "64-char-hex-public-key",
  "signature": "128-char-hex-signature",
  "nonce": "nonce-from-challenge"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "random-64-char-token",
    "expiresIn": 900,
    "tokenType": "Bearer"
  }
}
```

### Step 5: Use Access Token

Include the access token in MCP requests:

```bash
curl -X POST https://co.lab.builddetroit.xyz/api/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJ..." \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

### Step 6: Refresh Token

Before the access token expires, use the refresh token to get new tokens:

**POST** `/api/auth/pki/refresh`

```json
{
  "refreshToken": "your-refresh-token"
}
```

**Response:** Same format as verify endpoint.

**Note:** Each refresh token can only be used once. A new refresh token is returned with each refresh.

### Managing API Keys

For long-lived programmatic access, create named API keys instead of constantly refreshing JWTs.

**Create API Key (requires valid access token):**

**POST** `/api/auth/api-keys`

```json
{
  "label": "Production Server",
  "scopes": ["listCollaborations", "getCollaboration"]
}
```

Or use `["*"]` for full access.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "key-uuid",
    "rawKey": "clb_AbCdEf123...",
    "keyPrefix": "clb_AbCdEf12",
    "label": "Production Server",
    "scopes": ["listCollaborations", "getCollaboration"],
    "expiresAt": null,
    "createdAt": "ISO date"
  }
}
```

**Important:** The `rawKey` is only shown once. Store it securely.

**List API Keys:**

**GET** `/api/auth/api-keys`

Returns all active API keys (without raw values).

**Revoke API Key:**

**DELETE** `/api/auth/api-keys/[id]`

### Scope Enforcement

API keys and JWTs can have scoped permissions. Each MCP tool can specify a `requiredScope`.

| Scope | Description |
|-------|-------------|
| `*` | Full access to all tools |
| `listCollaborations` | Access to list collaborations |
| `getCollaboration` | Access to get single collaboration |
| `createCollaboration` | Access to create collaborations |
| ... | Tool-specific scopes |

If a tool has `requiredScope` set and the caller's scopes don't include it (or `*`), the request returns 403 Forbidden.

### Settings UI

Users can manage their API keys and public keys at `/settings/api-keys`:

- View all registered public keys
- Create new named API keys with custom scopes
- Revoke keys instantly
- See last-used timestamps

### Security Best Practices

1. **Never expose private keys** - Generate and store on-device only
2. **Use scoped API keys** - Grant minimum necessary permissions
3. **Rotate regularly** - Revoke old keys, create new ones periodically
4. **Monitor usage** - Check last-used timestamps for unusual activity
5. **Use HTTPS** - All API calls should use TLS in production
