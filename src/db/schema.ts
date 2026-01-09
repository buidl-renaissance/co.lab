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

