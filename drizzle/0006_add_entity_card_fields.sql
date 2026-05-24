-- Add entity card fields to collaborations table
-- coverImageUrl: URL for cover image on entity cards
ALTER TABLE collaborations ADD COLUMN coverImageUrl TEXT;
--> statement-breakpoint
-- category: Collaboration category for filtering
ALTER TABLE collaborations ADD COLUMN category TEXT;
--> statement-breakpoint
-- capacity: Maximum number of participants/attendees
ALTER TABLE collaborations ADD COLUMN capacity INTEGER;
--> statement-breakpoint
-- rsvpCount: Current RSVP count (default 0)
ALTER TABLE collaborations ADD COLUMN rsvpCount INTEGER DEFAULT 0;
