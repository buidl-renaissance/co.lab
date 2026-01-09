import { sqliteTable, integer, numeric, text } from "drizzle-orm/sqlite-core"
  import { sql } from "drizzle-orm"

export const collaborations = sqliteTable("collaborations", {
	id: text({ length: 255 }).primaryKey(),
	title: text({ length: 255 }).notNull(),
	description: text(),
	template: numeric().notNull(),
	createdAt: numeric().default(sql`(CURRENT_TIMESTAMP)`),
	updatedAt: numeric().default(sql`(CURRENT_TIMESTAMP)`),
	answers: numeric().notNull(),
	participants: text().notNull(),
	status: text().default("active"),
	analysis: numeric().notNull(),
	transcripts: text().notNull(),
	summary: text().notNull(),
	eventDetails: text(),
	createdByUserId: text(),
});

export const githubAccounts = sqliteTable("github_accounts", {
	id: text({ length: 255 }).primaryKey(),
	userId: text({ length: 255 }).notNull(),
	githubLogin: text({ length: 255 }).notNull(),
	githubUserId: text({ length: 255 }).notNull(),
	accessToken: text({ length: 255 }).notNull(),
	tokenType: text({ length: 255 }).notNull(),
	createdAt: numeric().default(sql`(CURRENT_TIMESTAMP)`),
	updatedAt: numeric().default(sql`(CURRENT_TIMESTAMP)`),
});

export const githubRepos = sqliteTable("github_repos", {
	id: text({ length: 255 }).primaryKey(),
	owner: text({ length: 255 }).notNull(),
	name: text({ length: 255 }).notNull(),
	displayName: text({ length: 255 }).notNull(),
	projectId: text({ length: 255 }),
	isDefault: numeric().default(0),
	createdAt: numeric().default(sql`(CURRENT_TIMESTAMP)`),
	updatedAt: numeric().default(sql`(CURRENT_TIMESTAMP)`),
});

export const githubIssueLinks = sqliteTable("github_issue_links", {
	id: text({ length: 255 }).primaryKey(),
	collaborationId: text({ length: 255 }).notNull(),
	githubRepoId: text({ length: 255 }).notNull(),
	issueNumber: integer().notNull(),
	issueUrl: text({ length: 255 }).notNull(),
	issueState: text({ length: 255 }).notNull(),
	lastSyncedAt: numeric().default(sql`(CURRENT_TIMESTAMP)`),
	createdAt: numeric().default(sql`(CURRENT_TIMESTAMP)`),
	updatedAt: numeric().default(sql`(CURRENT_TIMESTAMP)`),
});

export const githubPullRequestLinks = sqliteTable("github_pull_request_links", {
	id: text({ length: 255 }).primaryKey(),
	githubRepoId: text({ length: 255 }).notNull(),
	pullNumber: integer().notNull(),
	headSha: text({ length: 255 }).notNull(),
	status: text({ length: 255 }).notNull(),
	deploymentStatus: text({ length: 255 }),
	lastSyncedAt: numeric().default(sql`(CURRENT_TIMESTAMP)`),
	createdAt: numeric().default(sql`(CURRENT_TIMESTAMP)`),
	updatedAt: numeric().default(sql`(CURRENT_TIMESTAMP)`),
});
