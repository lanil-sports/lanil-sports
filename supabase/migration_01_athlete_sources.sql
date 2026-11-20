-- ============================================================================
-- LANILSPORTS — MIGRATION 01: Athlete ingestion expansion
-- Adds source attribution, import metadata, and roster fields for the new
-- athlete sources (LHSAA Network D1 Tracker, expanded MaxPreps ingestion).
-- Run against the Supabase project: choose Database > SQL Editor, then Execute.
-- ============================================================================

ALTER TABLE athletes ADD COLUMN IF NOT EXISTS source_url TEXT;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS import_date DATE;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS division TEXT;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS weight_lbs INTEGER;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS height_in INTEGER;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS bio_url TEXT;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS headshot_permission TEXT;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS parish_id TEXT REFERENCES parishes(id) ON DELETE SET NULL;

-- Indexes for dedupe + lookups during ingestion.
CREATE INDEX IF NOT EXISTS idx_athletes_slug ON athletes (slug);
CREATE INDEX IF NOT EXISTS idx_athletes_player_id ON athletes (player_id);
CREATE INDEX IF NOT EXISTS idx_athletes_name_school_sport ON athletes ((lower(full_name)), (lower(school_name)), (lower(primary_sport)));
CREATE INDEX IF NOT EXISTS idx_athletes_parish_city ON athletes ((lower(parish_city)));

-- Notes:
--  - Do not delete existing athlete rows; preserve existing player_ids, slugs
--    and all existing columns.
--  - source_url: the original roster URL of the athlete, e.g.
--    https://www.maxpreps.com/la/monroe/neville-tigers/athletes/desi-byrd/ (official rosters).
--  - import_date: the date the row was first ingested from source_url.
--  - division: e.g. MaxPreps classification ("4A", "5A"); "Division I" for LHSAA D1 Tracker.
--  - state: for LHSAA D1 Tracker rows, the college's state (e.g. "MS").
--  - weight_lbs / height_in: exact roster values from MaxPreps rosters.
--  - bio_url: the athlete's official college bio page (LHSAA Network D1 Tracker).
--  - headshot_permission: "" or source name when a linked image is allowed
--    for display (e.g. "maxpreps" for official MaxPreps headshots).
