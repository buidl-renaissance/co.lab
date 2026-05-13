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

Lists all collaborations or filters by username.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `username` | string | Filter by participant username |

**Response:**
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

### Verify Auth (Farcaster)

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

## PKI Authentication APIs

See [PKI Authentication](./pki-authentication.md) for complete documentation.

### Register Public Key

**POST** `/api/auth/register-key`

Registers an Ed25519 public key for PKI authentication.

**Request Body:**
```json
{
  "publicKey": "base64url-encoded-32-byte-ed25519-public-key",
  "userId": "optional-user-id",
  "label": "optional-key-label"
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

Generates a single-use nonce (60s TTL) for signature verification.

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
  "expiresAt": "ISO date"
}
```

---

### Verify PKI Signature

**POST** `/api/auth/pki-verify`

Verifies Ed25519 signature and issues tokens.

**Request Body:**
```json
{
  "keyId": "uuid",
  "nonce": "nonce from challenge",
  "signature": "base64url-encoded-signature"
}
```

**Response:**
```json
{
  "accessToken": "JWT (15min)",
  "refreshToken": "clbrt_... (30d)",
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

### Create API Key

**POST** `/api/auth/api-keys`

Creates a named, scoped API key. Requires JWT authentication.

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

**Note:** The raw key is only returned once at creation.

---

### List API Keys

**GET** `/api/auth/api-keys`

Lists all active API keys for the authenticated user.

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

Revokes an API key.

**Headers:** `Authorization: Bearer <accessToken>`

**Response:**
```json
{
  "success": true,
  "message": "API key revoked successfully"
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
