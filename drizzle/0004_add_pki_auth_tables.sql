-- Add PKI Auth tables for Ed25519 keypair authentication
-- Migration: 0004_add_pki_auth_tables

-- User Public Keys table: stores registered Ed25519 public keys
CREATE TABLE user_public_keys (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  public_key TEXT NOT NULL,
  label TEXT,
  created_at INTEGER DEFAULT (strftime('%s', 'now')) NOT NULL
);

CREATE INDEX idx_user_public_keys_user_id ON user_public_keys(user_id);
CREATE UNIQUE INDEX idx_user_public_keys_public_key ON user_public_keys(public_key);

--> statement-breakpoint

-- Nonces table: single-use nonces for challenge/response auth
CREATE TABLE nonces (
  id TEXT PRIMARY KEY,
  key_id TEXT NOT NULL,
  nonce TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  used INTEGER DEFAULT 0 NOT NULL
);

CREATE INDEX idx_nonces_key_id ON nonces(key_id);
CREATE INDEX idx_nonces_nonce ON nonces(nonce);

--> statement-breakpoint

-- Refresh Tokens table: rotating refresh tokens
CREATE TABLE refresh_tokens (
  id TEXT PRIMARY KEY,
  key_id TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  revoked INTEGER DEFAULT 0 NOT NULL,
  created_at INTEGER DEFAULT (strftime('%s', 'now')) NOT NULL
);

CREATE INDEX idx_refresh_tokens_key_id ON refresh_tokens(key_id);
CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);

--> statement-breakpoint

-- API Keys table: named, scoped API keys for MCP access
CREATE TABLE api_keys (
  id TEXT PRIMARY KEY,
  key_id TEXT NOT NULL,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  scopes TEXT NOT NULL DEFAULT '[]',
  last_used_at INTEGER,
  created_at INTEGER DEFAULT (strftime('%s', 'now')) NOT NULL,
  revoked INTEGER DEFAULT 0 NOT NULL
);

CREATE INDEX idx_api_keys_key_id ON api_keys(key_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);
