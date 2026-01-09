-- Add collaboratorIds column for efficient user-based queries
ALTER TABLE collaborations ADD COLUMN collaboratorIds TEXT DEFAULT '';

-- Backfill existing collaborations: extract user IDs from participants JSON
-- This updates collaboratorIds based on existing createdByUserId values
UPDATE collaborations 
SET collaboratorIds = CASE 
  WHEN createdByUserId IS NOT NULL AND createdByUserId != '' 
  THEN ',' || createdByUserId || ','
  ELSE ''
END;
