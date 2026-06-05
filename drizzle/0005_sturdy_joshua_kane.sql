CREATE TABLE `schema_collaborations` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`description` text,
	`templateId` text,
	`chatThreadId` text,
	`createdByUserId` text,
	`createdAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updatedAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
--> statement-breakpoint
ALTER TABLE `collaborations` ADD `shareToken` text;--> statement-breakpoint
ALTER TABLE `collaborations` ADD `shareMode` text DEFAULT 'private';--> statement-breakpoint
ALTER TABLE `collaborations` ADD `tags` text;--> statement-breakpoint
ALTER TABLE `collaborations` ADD `coverImageUrl` text;--> statement-breakpoint
ALTER TABLE `collaborations` ADD `category` text;--> statement-breakpoint
ALTER TABLE `collaborations` ADD `capacity` integer;--> statement-breakpoint
ALTER TABLE `collaborations` ADD `rsvpCount` integer DEFAULT 0;--> statement-breakpoint
CREATE UNIQUE INDEX `collaborations_shareToken_unique` ON `collaborations` (`shareToken`);