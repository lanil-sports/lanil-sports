-- ============================================================================
-- LANIL SPORTS — ATHLETE POWER DATA ACQUISITION ENGINE — MIGRATION
-- ============================================================================
-- Run in the Supabase SQL Editor (Tools > SQL Editor > run script).
-- Adds the Athlete Power Acquisition Engine tables. Existing athletes/schools/
-- parishes are NOT modified or deleted.
-- ============================================================================

-- 1. ATHLETE SOURCES — Source Registry (access restrictions, licensing, etc.)
CREATE TABLE IF NOT EXISTS athlete_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_name TEXT NOT NULL UNIQUE,
    source_type TEXT NOT NULL,                 -- lhsaa, lhsaa_network, maxpreps, NCAA, NAIA, NJCAA, recruiting, newspapers, public_profiles, submissions
    source_url TEXT,
    api_base_url TEXT,
    robots_txt TEXT,
    terms_url TEXT,
    licensing TEXT,
    permitted_use TEXT,
    access_restriction TEXT,                   -- allowed / restricted / requires_permission / prohibited_without_review
    access_status TEXT,                        -- permitted / needs_legal_review / blocked
    scrape_permission TEXT,                    -- public / licensed_api / user_submitted / requires_permission
    documentation_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ATHLETE STATS — Season averages, game logs, career totals
CREATE TABLE IF NOT EXISTS athlete_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL REFERENCES athletes(slug) ON DELETE CASCADE,
    season TEXT NOT NULL,
    stat_category TEXT,                        -- season_averages / game_log / career_totals
    stat_type TEXT NOT NULL,
    value NUMERIC,
    value_text TEXT,
    source TEXT,
    source_url TEXT,
    verified BOOLEAN DEFAULT FALSE,
    last_verified DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ATHLETE ACHIEVEMENTS — Awards, honors, milestones
CREATE TABLE IF NOT EXISTS athlete_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL REFERENCES athletes(slug) ON DELETE CASCADE,
    achievement_type TEXT NOT NULL,            -- all_star / award / honor / milestone
    title TEXT NOT NULL,
    description TEXT,
    date DATE,
    source TEXT,
    source_url TEXT,
    added_by TEXT,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    verified BOOLEAN DEFAULT FALSE
);

-- 4. ATHLETE COMMITMENTS — College commitments/roster history
CREATE TABLE IF NOT EXISTS athlete_commitments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL REFERENCES athletes(slug) ON DELETE CASCADE,
    college_name TEXT NOT NULL,
    division TEXT,
    commitment_date DATE,
    source TEXT,
    source_url TEXT,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ATHLETE PHOTOS — Athlete Image Engine
CREATE TABLE IF NOT EXISTS athlete_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    source TEXT NOT NULL,
    original_source TEXT,
    attribution TEXT,
    rights_holder TEXT,
    permission_status TEXT DEFAULT 'licensed',
    primary BOOLEAN DEFAULT FALSE,
    tags TEXT[] DEFAULT '{}',
    tagged_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (athlete_id, photo_url)
);

-- 6. ATHLETE CLAIMS — Athlete-owned experience (claims, corrections, removals)
CREATE TABLE IF NOT EXISTS athlete_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL REFERENCES athletes(slug) ON DELETE CASCADE,
    claim_type TEXT NOT NULL,                  -- claim_profile / request_removal / submit_correction
    status TEXT NOT NULL,                      -- submitted / approved / denied
    note TEXT,
    reason_for TEXT,
    submitted_at DATE DEFAULT CURRENT_DATE,
    approved_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ATHLETE CORRECTIONS
CREATE TABLE IF NOT EXISTS athlete_corrections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL REFERENCES athletes(slug) ON DELETE CASCADE,
    field TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    reason TEXT,
    status TEXT NOT NULL DEFAULT 'submitted', -- submitted / verified / denied
    submitted_by TEXT,
    submitted_at DATE DEFAULT CURRENT_DATE,
    reviewed_by TEXT,
    reviewed_at DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ATHLETE HISTORICAL — Full audit of every insert/update/verify/claim
CREATE TABLE IF NOT EXISTS athlete_historical (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL REFERENCES athletes(slug) ON DELETE CASCADE,
    change_type TEXT NOT NULL,                 -- insert / update / verified / claimed / removal
    field TEXT,
    old_value TEXT,
    new_value TEXT,
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    source TEXT,
    source_url TEXT
);

-- 9. ATHLETE IMPORTS — Import runs from each source
CREATE TABLE IF NOT EXISTS athlete_imports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source TEXT NOT NULL,
    source_file TEXT,
    source_url TEXT,
    imported_at TIMESTAMPTZ DEFAULT NOW(),
    athlete_count INT DEFAULT 0,
    verified_count INT DEFAULT 0,
    status TEXT DEFAULT 'completed',            -- running / completed / failed
    notes TEXT
);

-- 10. ACQUISITION METRICS — Success metrics per run
CREATE TABLE IF NOT EXISTS acquisition_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id TEXT,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    total_discovered INT DEFAULT 0,
    inserted INT DEFAULT 0,
    updated INT DEFAULT 0,
    verified INT DEFAULT 0,
    verification_failed INT DEFAULT 0,
    insert_failed INT DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. RLS — Public read; service role/admins write
ALTER TABLE athlete_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_historical ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE acquisition_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read athlete_sources" ON athlete_sources FOR SELECT USING (true);
CREATE POLICY "Public read athlete_stats" ON athlete_stats FOR SELECT USING (true);
CREATE POLICY "Public read athlete_achievements" ON athlete_achievements FOR SELECT USING (true);
CREATE POLICY "Public read athlete_commitments" ON athlete_commitments FOR SELECT USING (true);
CREATE POLICY "Public read athlete_photos" ON athlete_photos FOR SELECT USING (true);
CREATE POLICY "Public read athlete_claims" ON athlete_claims FOR SELECT USING (true);
CREATE POLICY "Public read athlete_corrections" ON athlete_corrections FOR SELECT USING (true);
CREATE POLICY "Public read athlete_historical" ON athlete_historical FOR SELECT USING (true);
CREATE POLICY "Public read athlete_imports" ON athlete_imports FOR SELECT USING (true);
CREATE POLICY "Public read acquisition_metrics" ON acquisition_metrics FOR SELECT USING (true);

-- 12. Source Registry seeds (the full source inventory)
INSERT INTO athlete_sources (source_name, source_type, source_url, robots_txt, access_restriction, access_status, scrape_permission, notes) VALUES
('LHSAA', 'lhsaa', 'https://lanhsaa.com/', NULL, 'requires_permission', 'blocked_in_sandbox (lanhsaa.com DNS not resolvable)', NULL, 'Official Louisiana High School Athletic Association website. Primary LHSAA source.'),
('LHSAA Network (MaxPreps LA)', 'lhsaa_network', 'https://louisianahighschoolsports.com/', 'https://www.maxpreps.com/robots.txt', 'requires_permission', 'blocked_in_sandbox', NULL, 'MaxPreps network of Louisiana school sports sites. MaxPreps robots disallow /school/, /team/ — most sites need written permission.'),
('LHSAA athlete_data artifact', 'lhsaa_network', 'internal artifact', NULL, 'allowed', 'permitted', 'user_submitted', 'window.LHSAA_ATHLETE_DATA crawl artifact (1,547 athletes, including Alcorn State/LSU college rosters). Already ingested.'),
('LHSAA d1_athletes artifact', 'lhsaa_network', 'internal artifact', NULL, 'allowed', 'permitted', 'user_submitted', 'd1_athletes.json crawl artifact (1,547 athletes, mostly LA high schools). Already ingested.'),
('NCAA Statistics', 'NCAA', 'https://stats.ncaa.org/', 'https://stats.ncaa.org/robots.txt', 'restricted', 'needs_legal_review', 'requires_permission', 'Stats database (stats.ncaa.org) — HTTP 403 (forbidden); automated collection prohibited without permission.'),
('NAIA', 'NAIA', 'https://naia.com/', 'https://naia.com/robots.txt', 'allowed', 'permitted', 'licensed', 'NAIA website — robots allow all. Slow human-paced crawling; athlete rosters available via recaps and schedules.'),
('NJCAA', 'NJCAA', 'https://njcaa.org/', 'https://njcaa.org/robots.txt', 'allowed', 'permitted', 'licensed', 'NJCAA website — robots allow all. Stats pages and rosters are public.'),
('247Sports', 'recruiting', 'https://247sports.com/', 'https://247sports.com/robots.txt', 'restricted', 'needs_legal_review', 'requires_permission', '247Sports recruiting rankings — robots block many paths; permission needed for automated collection.'),
('The Advocate', 'newspapers', 'https://www.theadvocate.com/', 'https://www.theadvocate.com/robots.txt', 'restricted', 'needs_legal_review', 'requires_permission', 'Primary Louisiana newspaper (PrepScores acadiana paths are robots-blocked — prep scores need permission).'),
('Athlete/Parent Submissions', 'submissions', NULL, NULL, 'allowed', 'permitted', 'user_submitted', 'Athlete and parent submissions via athlete_claims / athlete_corrections tables.'),
('Public Athlete Profiles', 'public_profiles', NULL, NULL, 'allowed', 'permitted', 'public', 'Generic public athlete profiles, social handles, and PDF archives.')
ON CONFLICT (source_name) DO NOTHING;

-- 13. Existing tables get unique constraint on athlete_historical (audit log, no updates)
-- NOTE: athlete_historical is append-only by design; never delete.

-- 13. Athlete Facts columns (jersey, height/weight, source attribution, verification)
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS jersey_number TEXT;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS height_in NUMERIC;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS weight_lb NUMERIC;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS source_name TEXT;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS source_url TEXT;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS verified_at DATE;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS last_verified DATE;

-- Indexes for acquisition engine queries
CREATE INDEX IF NOT EXISTS idx_athletes_slug ON athletes(slug);
CREATE INDEX IF NOT EXISTS idx_athletes_verified ON athletes(verified);
CREATE INDEX IF NOT EXISTS idx_athletes_parish_city ON athletes(parish_city);
