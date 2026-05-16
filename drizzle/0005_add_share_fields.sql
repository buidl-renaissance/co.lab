-- Add sharing fields to collaborations table
-- shareToken: UUID v4 for link sharing
ALTER TABLE collaborations ADD COLUMN shareToken TEXT;
--> statement-breakpoint
CREATE UNIQUE INDEX collaborations_shareToken_unique ON collaborations (shareToken);
--> statement-breakpoint
-- shareMode: visibility mode (private, link, public) - defaults to private
ALTER TABLE collaborations ADD COLUMN shareMode TEXT DEFAULT 'private';
--> statement-breakpoint
-- tags: JSON array for filtering collaborations by tag
ALTER TABLE collaborations ADD COLUMN tags TEXT;
