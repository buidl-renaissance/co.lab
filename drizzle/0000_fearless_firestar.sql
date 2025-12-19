CREATE TABLE `collaborations` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`template` text NOT NULL,
	`createdAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updatedAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`answers` text NOT NULL,
	`participants` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`analysis` text,
	`transcripts` text,
	`summary` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `github_accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`githubLogin` text NOT NULL,
	`githubUserId` text NOT NULL,
	`accessToken` text NOT NULL,
	`tokenType` text NOT NULL,
	`createdAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updatedAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `github_issue_links` (
	`id` text PRIMARY KEY NOT NULL,
	`collaborationId` text NOT NULL,
	`githubRepoId` text NOT NULL,
	`issueNumber` integer NOT NULL,
	`issueUrl` text NOT NULL,
	`issueState` text NOT NULL,
	`lastSyncedAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`createdAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updatedAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `github_pull_request_links` (
	`id` text PRIMARY KEY NOT NULL,
	`githubRepoId` text NOT NULL,
	`pullNumber` integer NOT NULL,
	`headSha` text NOT NULL,
	`status` text NOT NULL,
	`deploymentStatus` text,
	`lastSyncedAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`createdAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updatedAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `github_repos` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`name` text NOT NULL,
	`displayName` text NOT NULL,
	`projectId` text,
	`isDefault` integer DEFAULT false NOT NULL,
	`createdAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updatedAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
