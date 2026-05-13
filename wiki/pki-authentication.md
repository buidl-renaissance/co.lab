# PKI Authentication

This document describes the Ed25519 keypair-based authentication system for Co.Lab's MCP endpoint.

## Overview

Co.Lab supports PKI (Public Key Infrastructure) authentication using Ed25519 keypairs. This allows secure, passwordless authentication where:

1. Users register their Ed25519 public key
2. Users sign challenges with their private key to prove identity
3. JWTs and refresh tokens are issued upon successful verification
4. Named, scoped API keys can be created for programmatic access

## Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     Registration                             │
├─────────────────────────────────────────────────────────────┤
│  1. Generate Ed25519 keypair locally                         │
│  2. POST /api/auth/register-key with public key              │
│  3. Receive keyId for future authentication                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Challenge/Response                          │
├─────────────────────────────────────────────────────────────┤
│  1. POST /api/auth/challenge with keyId                      │
│  2. Receive single-use nonce (60s TTL)                       │
│  3. Sign nonce with private key                              │
│  4. POST /api/auth/pki-verify with keyId, nonce, signature   │
│  5. Receive accessToken (15min) + refreshToken (30d)         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Token Refresh                             │
├─────────────────────────────────────────────────────────────┤
│  1. POST /api/auth/refresh with refreshToken                 │
│  2. Old refresh token is revoked                             │
│  3. Receive new accessToken + new refreshToken               │
└─────────────────────────────────────────────────────────────┘
```

## API Endpoints

### Register Public Key

**POST** `/api/auth/register-key`

Registers an Ed25519 public key for authentication.

**Request Body:**
```json
{
  "publicKey": "base64url-encoded-32-byte-ed25519-public-key",
  "userId": "optional-user-id",
  "label": "optional-label-for-key"
}
```

**Response:**
```json
{
  "keyId": "uuid",
  "publicKey": "...",
  "label": "My Key",
  "createdAt": "ISO date"
}
```

---

### Request Challenge

**POST** `/api/auth/challenge`

Generates a single-use nonce for signature verification.

**Request Body:**
```json
{
  "keyId": "uuid from registration"
}
```

**Response:**
```json
{
  "nonce": "base64url-encoded-random-nonce",
  "expiresAt": "ISO date (60 seconds from now)"
}
```

---

### Verify Signature

**POST** `/api/auth/pki-verify`

Verifies the Ed25519 signature and issues tokens.

**Request Body:**
```json
{
  "keyId": "uuid",
  "nonce": "nonce from challenge",
  "signature": "base64url-encoded-ed25519-signature"
}
```

**Response:**
```json
{
  "accessToken": "JWT",
  "refreshToken": "clbrt_...",
  "expiresIn": 900,
  "tokenType": "Bearer"
}
```

---

### Refresh Token

**POST** `/api/auth/refresh`

Rotates refresh token and issues new access token.

**Request Body:**
```json
{
  "refreshToken": "clbrt_..."
}
```

**Response:**
```json
{
  "accessToken": "new JWT",
  "refreshToken": "new clbrt_...",
  "expiresIn": 900,
  "tokenType": "Bearer"
}
```

---

## API Keys

Named, scoped API keys provide long-lived credentials for programmatic MCP access.

### Create API Key

**POST** `/api/auth/api-keys`

**Headers:** `Authorization: Bearer <accessToken>`

**Request Body:**
```json
{
  "name": "My MCP Client",
  "scopes": ["*"]
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "My MCP Client",
  "key": "clb_abc123...",
  "scopes": ["*"],
  "createdAt": "ISO date"
}
```

**Important:** The raw key is only shown once at creation time.

---

### List API Keys

**GET** `/api/auth/api-keys`

**Headers:** `Authorization: Bearer <accessToken>`

**Response:**
```json
{
  "apiKeys": [
    {
      "id": "uuid",
      "name": "My MCP Client",
      "scopes": ["*"],
      "lastUsedAt": "ISO date or null",
      "createdAt": "ISO date"
    }
  ]
}
```

---

### Revoke API Key

**DELETE** `/api/auth/api-keys/[keyId]`

**Headers:** `Authorization: Bearer <accessToken>`

**Response:**
```json
{
  "success": true,
  "message": "API key revoked successfully"
}
```

---

## Using Authentication with MCP

### Enable PKI Auth

Set the environment variable:
```bash
MCP_USE_PKI_AUTH=true
```

### Authenticate MCP Requests

**Option 1: JWT Bearer Token**
```bash
curl -X POST https://co.lab.builddetroit.xyz/api/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

**Option 2: API Key**
```bash
curl -X POST https://co.lab.builddetroit.xyz/api/mcp \
  -H "Content-Type: application/json" \
  -H "X-API-Key: clb_abc123..." \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

**Option 3: API Key as Bearer Token**
```bash
curl -X POST https://co.lab.builddetroit.xyz/api/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer clb_abc123..." \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"listCollaborations"}}'
```

---

## Scopes

API keys and JWTs can be scoped to limit access:

| Scope | Description |
|-------|-------------|
| `*` | Full access to all tools |
| `read` | Read-only tools (list, get) |
| `write` | Write tools (create, update, delete) |
| `tool:<name>` | Specific tool access |
| `category:collaboration` | All collaboration tools |
| `category:user` | All user tools |
| `category:github` | All GitHub tools |

---

## Security Considerations

1. **Private Key Security**: Never transmit private keys. Keep them secure locally.
2. **Nonce Expiration**: Nonces expire after 60 seconds and can only be used once.
3. **Token Rotation**: Refresh tokens are single-use; using one invalidates it.
4. **API Key Storage**: Store API keys securely; they cannot be recovered if lost.
5. **JWT Expiration**: Access tokens expire after 15 minutes for security.

---

## Database Schema

The PKI auth system uses four tables:

```sql
-- Registered public keys
CREATE TABLE user_public_keys (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  public_key TEXT NOT NULL UNIQUE,
  label TEXT,
  created_at INTEGER NOT NULL
);

-- Single-use authentication nonces
CREATE TABLE nonces (
  id TEXT PRIMARY KEY,
  key_id TEXT NOT NULL,
  nonce TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  used INTEGER DEFAULT 0
);

-- Rotating refresh tokens
CREATE TABLE refresh_tokens (
  id TEXT PRIMARY KEY,
  key_id TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  revoked INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL
);

-- Named API keys
CREATE TABLE api_keys (
  id TEXT PRIMARY KEY,
  key_id TEXT NOT NULL,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  scopes TEXT NOT NULL DEFAULT '[]',
  last_used_at INTEGER,
  created_at INTEGER NOT NULL,
  revoked INTEGER DEFAULT 0
);
```

---

## Example: Full Authentication Flow (Node.js)

```typescript
import { webcrypto } from 'crypto';

// Generate Ed25519 keypair
const keypair = await webcrypto.subtle.generateKey(
  'Ed25519',
  true,
  ['sign', 'verify']
);

// Export public key
const publicKeyRaw = await webcrypto.subtle.exportKey('raw', keypair.publicKey);
const publicKeyB64 = Buffer.from(publicKeyRaw)
  .toString('base64')
  .replace(/\+/g, '-')
  .replace(/\//g, '_')
  .replace(/=+$/, '');

// 1. Register public key
const registerRes = await fetch('/api/auth/register-key', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ publicKey: publicKeyB64 }),
});
const { keyId } = await registerRes.json();

// 2. Request challenge
const challengeRes = await fetch('/api/auth/challenge', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ keyId }),
});
const { nonce } = await challengeRes.json();

// 3. Sign nonce
const nonceBytes = new TextEncoder().encode(nonce);
const signatureBytes = await webcrypto.subtle.sign('Ed25519', keypair.privateKey, nonceBytes);
const signatureB64 = Buffer.from(signatureBytes)
  .toString('base64')
  .replace(/\+/g, '-')
  .replace(/\//g, '_')
  .replace(/=+$/, '');

// 4. Verify and get tokens
const verifyRes = await fetch('/api/auth/pki-verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ keyId, nonce, signature: signatureB64 }),
});
const { accessToken, refreshToken } = await verifyRes.json();

// 5. Use token with MCP
const mcpRes = await fetch('/api/mcp', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
  },
  body: JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list',
  }),
});
```

---

## Settings UI

Users can manage their API keys at `/settings/api-keys`:

- View active API keys (name, scopes, last used)
- Generate new API keys (raw key shown once in modal)
- Revoke existing API keys

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `MCP_USE_PKI_AUTH` | Set to `true` to enable PKI auth for MCP |
| `JWT_SECRET` | Secret for signing JWTs (required in production) |
