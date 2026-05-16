# API Routes

This document provides complete documentation for all REST API endpoints in Co.Lab.

## Base URL

Development: `http://localhost:3000`  
Production: `https://co.lab.builddetroit.xyz`

---

## Collaboration APIs

### Create Collaboration

**POST** `/api/create`

Creates a new collaboration from a transcript.

**Request Body:**
```json
{
  "transcript": "string (required)",
  "templateId": "string (required)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Generated Title",
    "description": "Generated description",
    "template": { "id": "event", "name": "Host an Event", ... },
    "participants": ["user1", "user2"],
    "answers": {},
    "status": "active",
    "analysis": { ... },
    "transcripts": ["..."],
    "summary": "...",
    "createdAt": "ISO date",
    "updatedAt": "ISO date"
  }
}
```

**Template IDs:** `event`, `artwork`, `contest`, `fundraise`, `workshop`, `webproduct`

---

### List Collaborations

**GET** `/api/collaborations`

Lists all collaborations with support for pagination and filtering.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `username` | string | Filter by participant username (legacy mode) |
| `q` | string | Search in title and description |
| `template` | string | Filter by template ID (e.g., `event`, `artwork`) |
| `status` | string | Filter by status (`active`, `completed`, `archived`) |
| `tag` | string | Filter by tag |
| `limit` | number | Page size (default: 20) |
| `offset` | number | Pagination offset (default: 0) |

**Response (with pagination params):**
```json
{
  "success": true,
  "data": {
    "collaborations": [
      { "id": "...", "title": "...", ... }
    ],
    "total": 42,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

**Response (legacy mode - username only):**
```json
{
  "success": true,
  "data": [
    { "id": "...", "title": "...", ... }
  ]
}
```

---

### Get Collaboration

**GET** `/api/collaborations/[id]`

Retrieves a single collaboration by ID. No authentication required.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "...",
    "shareToken": "uuid (if shared)",
    "shareMode": "private | link | public",
    "tags": ["tag1", "tag2"],
    ...
  }
}
```

---

### Get Collaboration (Legacy)

**GET** `/api/collaboration/[id]`

Retrieves a single collaboration by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "...",
    ...
  }
}
```

---

### Update Collaboration

**PUT** `/api/collaboration/[id]`

Updates an existing collaboration.

**Request Body:** Partial `Collaboration` object with fields to update.

**Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

---

### Add Transcript

**POST** `/api/collaboration/[id]/add`

Adds a new transcript to an existing collaboration and re-analyzes.

**Request Body:**
```json
{
  "transcript": "string (required)"
}
```

**Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

---

### Update Transcript

**POST** `/api/collaboration/[id]/update`

Updates an existing transcript at a specific index.

**Request Body:**
```json
{
  "transcript": "string (required)",
  "transcriptIndex": "number (required)"
}
```

---

## Sharing APIs

### Generate Share Link

**POST** `/api/collaboration/[id]/share`

Generates a share token and sets shareMode to `link`.

**Response:**
```json
{
  "success": true,
  "data": {
    "shareToken": "uuid",
    "shareUrl": "https://co.lab.builddetroit.xyz/share/uuid"
  }
}
```

---

### Revoke Share Link

**DELETE** `/api/collaboration/[id]/share`

Revokes the share token and sets shareMode back to `private`.

**Response:**
```json
{
  "success": true
}
```

---

### Get Collaboration by Share Token

**GET** `/api/collaborations/public/[shareToken]`

Retrieves a collaboration by its share token. No authentication required.
Only works for collaborations with shareMode `link` or `public`.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "...",
    ...
  }
}
```

**Error Responses:**
- `404` - Collaboration not found or not shared

---

## Event APIs

### Update Event Details

**POST/PUT** `/api/collaboration/[id]/event-details`

Updates event details for an event-type collaboration.

**Request Body:**
```json
{
  "eventDetails": {
    "eventTitle": "string (required)",
    "date": "YYYY-MM-DD (required)",
    "time": "HH:MM AM/PM (required)",
    "location": "string (required)",
    "endTime": "string (optional)",
    "timezone": "string (optional)",
    "tags": ["tag1", "tag2"],
    "eventType": "standard | renaissance"
  }
}
```

---

### Generate Flyer

**POST** `/api/collaboration/[id]/generate-flyer`

Generates an AI promotional flyer using DALL-E 3.

**Request Body:**
```json
{
  "style": "optional style hint"
}
```

**Response:**
```json
{
  "success": true,
  "data": { ... },
  "flyerUrl": "https://..."
}
```

**Requirements:**
- Collaboration must be of type `event`
- Event details must include `eventTitle`

---

### Publish Event

**POST** `/api/collaboration/[id]/publish-event`

Publishes an event to the external events platform.

**Response:**
```json
{
  "success": true,
  "data": { ... },
  "externalEventId": 12345
}
```

**Requirements:**
- Event must have title, date, and location
- Requires `EVENTS_API_URL` and `EVENTS_API_KEY` environment variables

---

## Audio/Media APIs

### Transcribe Audio

**POST** `/api/transcribe`

Transcribes audio to text using OpenAI Whisper.

**Request Body:**
```json
{
  "audio": "data:audio/wav;base64,..."
}
```

**Response:**
```json
{
  "success": true,
  "transcript": "Transcribed text..."
}
```

**Config:** Max body size: 10MB

---

### Upload File

**POST** `/api/upload`

Uploads an image file to DigitalOcean Spaces.

**Request Body:**
```json
{
  "file": "base64 encoded file",
  "fileName": "image.png",
  "contentType": "image/png"
}
```

**Response:**
```json
{
  "success": true,
  "url": "https://..."
}
```

---

## Authentication APIs

### Verify Auth

**POST** `/api/auth/verify`

Verifies Farcaster authentication (Quick Auth JWT or SIWF).

**Request Body (Quick Auth):**
```json
{
  "token": "JWT token"
}
```

**Request Body (SIWF):**
```json
{
  "message": "hex message",
  "signature": "signature",
  "authMethod": "siwf"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user-id",
    "fid": "12345",
    "username": "alice",
    "displayName": "Alice",
    "pfpUrl": "https://..."
  }
}
```

---

### Get Current User

**GET** `/api/user/me`

Retrieves the currently authenticated user.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `userId` | string | Optional user ID fallback |

**Response:**
```json
{
  "user": {
    "id": "...",
    "fid": "...",
    "username": "...",
    "displayName": "...",
    "pfpUrl": "..."
  }
}
```

**Note:** Checks Authorization header (Bearer token), query param, then cookie.

---

## PKI Authentication APIs

### Register Public Key

**POST** `/api/auth/pki/register-key`

Registers an Ed25519 public key for a user.

**Request Body:**
```json
{
  "userId": "string (required)",
  "publicKey": "string (required, 64-char hex Ed25519 public key)",
  "label": "string (required)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "key-uuid",
    "publicKey": "...",
    "label": "...",
    "createdAt": "ISO date"
  }
}
```

---

### Request Challenge

**POST** `/api/auth/pki/challenge`

Requests a challenge nonce for signature verification.

**Request Body:**
```json
{
  "publicKey": "string (required, 64-char hex)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "nonce": "32-char-random-string",
    "expiresIn": 120
  }
}
```

**Rate Limit:** 10 requests per minute per IP.

---

### Verify Signature

**POST** `/api/auth/pki/verify`

Verifies the Ed25519 signature and issues tokens.

**Request Body:**
```json
{
  "publicKey": "string (required)",
  "signature": "string (required, 128-char hex Ed25519 signature)",
  "nonce": "string (required)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "JWT",
    "refreshToken": "64-char-token",
    "expiresIn": 900,
    "tokenType": "Bearer"
  }
}
```

---

### Refresh Token

**POST** `/api/auth/pki/refresh`

Rotates the refresh token and issues new access token.

**Request Body:**
```json
{
  "refreshToken": "string (required)"
}
```

**Response:** Same as verify endpoint.

---

## API Key Management APIs

All API key management endpoints require a valid access token in the Authorization header.

### List API Keys

**GET** `/api/auth/api-keys`

Lists all active API keys for the authenticated user.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "key-uuid",
      "keyPrefix": "clb_AbCdEf12",
      "label": "...",
      "scopes": ["*"],
      "lastUsedAt": "ISO date or null",
      "expiresAt": "ISO date or null",
      "createdAt": "ISO date"
    }
  ]
}
```

---

### Create API Key

**POST** `/api/auth/api-keys`

Creates a new API key.

**Request Body:**
```json
{
  "label": "string (required)",
  "scopes": ["string array (required)"],
  "expiresAt": "ISO date (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "key-uuid",
    "rawKey": "clb_...",
    "keyPrefix": "clb_AbCdEf12",
    "label": "...",
    "scopes": ["*"],
    "expiresAt": null,
    "createdAt": "ISO date"
  }
}
```

**Note:** `rawKey` is only returned once. Store it securely.

---

### Revoke API Key

**DELETE** `/api/auth/api-keys/[id]`

Revokes an API key.

**Response:**
```json
{
  "success": true
}
```

---

## Public Key Management APIs

### List Public Keys

**GET** `/api/auth/public-keys`

Lists all active public keys for the authenticated user.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "key-uuid",
      "publicKey": "64-char-hex",
      "label": "...",
      "createdAt": "ISO date"
    }
  ]
}
```

---

### Revoke Public Key

**DELETE** `/api/auth/public-keys/[id]`

Revokes a public key.

**Response:**
```json
{
  "success": true
}
```

---

## Frame APIs

### Frame Start

**POST** `/api/frames/start`

Handles Farcaster frame button press to start a collaboration.

**Response:**
```json
{
  "image": "https://.../co.lab-start.jpg",
  "text": "You're ready to start a Collab session from Farcaster.",
  "buttons": [{ "label": "Open Collabs", "action": "post_redirect" }],
  "postUrl": "https://.../collabs"
}
```

---

## MCP API

### MCP Endpoint

**POST** `/api/mcp`

Model Context Protocol endpoint for AI agent integration.

See [MCP Integration Documentation](./mcp-integration.md) for complete details.

---

## Contact API

### Submit Contact Form

**POST** `/api/contact`

Submits a contact form message.

**Request Body:**
```json
{
  "name": "string (required)",
  "email": "string (required)",
  "subject": "string (required)",
  "message": "string (required)"
}
```

---

## GitHub APIs

### Start OAuth

**GET** `/api/github/oauth/start`

Initiates GitHub OAuth flow.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `redirectTo` | string | Post-auth redirect URL |

---

### OAuth Callback

**GET** `/api/github/oauth/callback`

Handles GitHub OAuth callback after user authorization.

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message description"
}
```

**HTTP Status Codes:**
| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Authentication required |
| 404 | Not Found - Resource doesn't exist |
| 405 | Method Not Allowed |
| 429 | Rate Limit Exceeded |
| 500 | Internal Server Error |
