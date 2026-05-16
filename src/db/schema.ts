import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Users table
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  fid: text('fid').notNull().unique(),
  username: text('username'),
  displayName: text('displayName'),
  pfpUrl: text('pfpUrl'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

// Farcaster Accounts table
export const farcasterAccounts = sqliteTable('farcaster_accounts', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  fid: text('fid').notNull().unique(),
  username: text('username').notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

// Collaborations table
export const collaborations = sqliteTable('collaborations', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  template: text('template', { mode: 'json' }).notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
  answers: text('answers', { mode: 'json' }).notNull(),
  participants: text('participants', { mode: 'json' }).notNull(),
  // Comma-separated list of user IDs for efficient querying
  collaboratorIds: text('collaboratorIds').default(''),
  status: text('status', { enum: ['active', 'completed', 'archived'] }).default('active').notNull(),
  analysis: text('analysis', { mode: 'json' }),
  transcripts: text('transcripts', { mode: 'json' }),
  summary: text('summary').default('').notNull(),
  createdByUserId: text('createdByUserId'),
  eventDetails: text('eventDetails', { mode: 'json' }),
  // Sharing fields
  shareToken: text('shareToken').unique(),
  shareMode: text('shareMode', { enum: ['private', 'link', 'public'] }).default('private'),
  tags: text('tags', { mode: 'json' }),
  // Entity card fields
  coverImageUrl: text('coverImageUrl'),
  category: text('category'),
  capacity: integer('capacity'),
  rsvpCount: integer('rsvpCount').default(0),
});

// GitHub Accounts table
export const githubAccounts = sqliteTable('github_accounts', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  githubLogin: text('githubLogin').notNull(),
  githubUserId: text('githubUserId').notNull(),
  accessToken: text('accessToken').notNull(),
  tokenType: text('tokenType').notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

// GitHub Repos table
export const githubRepos = sqliteTable('github_repos', {
  id: text('id').primaryKey(),
  owner: text('owner').notNull(),
  name: text('name').notNull(),
  displayName: text('displayName').notNull(),
  projectId: text('projectId'),
  isDefault: integer('isDefault', { mode: 'boolean' }).default(false).notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

// GitHub Issue Links table
export const githubIssueLinks = sqliteTable('github_issue_links', {
  id: text('id').primaryKey(),
  collaborationId: text('collaborationId').notNull(),
  githubRepoId: text('githubRepoId').notNull(),
  issueNumber: integer('issueNumber').notNull(),
  issueUrl: text('issueUrl').notNull(),
  issueState: text('issueState').notNull(),
  lastSyncedAt: integer('lastSyncedAt', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

// GitHub Pull Request Links table
export const githubPullRequestLinks = sqliteTable('github_pull_request_links', {
  id: text('id').primaryKey(),
  githubRepoId: text('githubRepoId').notNull(),
  pullNumber: integer('pullNumber').notNull(),
  headSha: text('headSha').notNull(),
  status: text('status').notNull(),
  deploymentStatus: text('deploymentStatus'),
  lastSyncedAt: integer('lastSyncedAt', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

// ===== PKI Authentication Tables =====

// User Public Keys table - stores Ed25519 public keys for PKI authentication
export const userPublicKeys = sqliteTable('user_public_keys', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  publicKey: text('publicKey').notNull(), // Ed25519 public key in hex format
  label: text('label').notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
  revokedAt: integer('revokedAt', { mode: 'timestamp' }),
});

// API Keys table - stores hashed API keys for programmatic MCP access
export const apiKeys = sqliteTable('api_keys', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  keyHash: text('keyHash').notNull(), // bcrypt hash of the raw key
  keyPrefix: text('keyPrefix').notNull(), // first 8 chars for display
  label: text('label').notNull(),
  scopes: text('scopes', { mode: 'json' }).$type<string[]>().notNull(), // array of MCP tool names or '*'
  lastUsedAt: integer('lastUsedAt', { mode: 'timestamp' }),
  expiresAt: integer('expiresAt', { mode: 'timestamp' }),
  revokedAt: integer('revokedAt', { mode: 'timestamp' }),
  createdAt: integer('createdAt', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

// Refresh Tokens table - stores hashed refresh tokens for JWT renewal
export const refreshTokens = sqliteTable('refresh_tokens', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  tokenHash: text('tokenHash').notNull(), // bcrypt hash of the raw token
  expiresAt: integer('expiresAt', { mode: 'timestamp' }).notNull(),
  revokedAt: integer('revokedAt', { mode: 'timestamp' }),
  createdAt: integer('createdAt', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

// Nonces table - stores challenge nonces for PKI authentication
export const nonces = sqliteTable('nonces', {
  id: text('id').primaryKey(),
  publicKey: text('publicKey').notNull(), // the public key this nonce is for
  nonce: text('nonce').notNull().unique(),
  expiresAt: integer('expiresAt', { mode: 'timestamp' }).notNull(),
  usedAt: integer('usedAt', { mode: 'timestamp' }),
  createdAt: integer('createdAt', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

