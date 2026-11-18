-- ============================================================================
-- LANILSPORTS.COM (Louisiana NIL & High School Athlete Directory)
-- Complete Supabase PostgreSQL Database Schema ($0 Free Tier Ready)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PARISHES DIRECTORY
CREATE TABLE IF NOT EXISTS parishes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    region TEXT NOT NULL
);

-- 2. SCHOOLS DIRECTORY (LHSAA)
CREATE TABLE IF NOT EXISTS schools (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    parish_id TEXT REFERENCES parishes(id) ON DELETE SET NULL,
    city TEXT NOT NULL,
    classification TEXT NOT NULL,
    lhsaa_member BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ATHLETES TABLE (Master Directory)
CREATE TABLE IF NOT EXISTS athletes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id TEXT UNIQUE NOT NULL, -- Format: LA-[GradYear]-[Sequence]
    full_name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    grad_year INT NOT NULL CHECK (grad_year BETWEEN 2026 AND 2032),
    current_grade TEXT NOT NULL,
    school_id TEXT REFERENCES schools(id) ON DELETE SET NULL,
    school_name TEXT NOT NULL,
    parish_city TEXT NOT NULL,
    primary_sport TEXT NOT NULL,
    secondary_sports TEXT[] DEFAULT '{}',
    position TEXT,
    season_stats_summary TEXT,
    newspaper_mentions JSONB DEFAULT '[]'::jsonb,
    social_handles JSONB DEFAULT '{}'::jsonb,
    total_followers INT DEFAULT 0,
    est_nil_value NUMERIC(10, 2) DEFAULT 0.00,
    potential_colleges TEXT[] DEFAULT '{}',
    headshot_url TEXT,
    photo_gallery TEXT[] DEFAULT '{}',
    bio TEXT,
    hudl_url TEXT,
    youtube_url TEXT,
    gpa NUMERIC(3, 2),
    claimed BOOLEAN DEFAULT FALSE,
    claimed_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    claimed_at TIMESTAMPTZ,
    tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'plus', 'pro')),
    verified BOOLEAN DEFAULT FALSE,
    parent_consent_verified BOOLEAN DEFAULT FALSE,
    last_updated DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. RECRUITING OFFERS & MILESTONES
CREATE TABLE IF NOT EXISTS athlete_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
    college_name TEXT NOT NULL,
    division TEXT DEFAULT 'FBS',
    status TEXT NOT NULL,
    date_reported DATE DEFAULT CURRENT_DATE,
    source_url TEXT,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. FAN VOTES & VIRAL TRAFFIC
CREATE TABLE IF NOT EXISTS fan_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id TEXT NOT NULL,
    athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
    voter_fingerprint TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS POLICIES
ALTER TABLE parishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE fan_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read parishes" ON parishes FOR SELECT USING (true);
CREATE POLICY "Public read schools" ON schools FOR SELECT USING (true);
CREATE POLICY "Public read athletes" ON athletes FOR SELECT USING (true);
CREATE POLICY "Public read offers" ON athlete_offers FOR SELECT USING (true);
CREATE POLICY "Public read fan votes" ON fan_votes FOR SELECT USING (true);
CREATE POLICY "Public insert fan votes" ON fan_votes FOR INSERT WITH CHECK (true);

CREATE POLICY "Athletes update own profile" ON athletes FOR UPDATE
USING (auth.uid() = claimed_by_user_id)
WITH CHECK (auth.uid() = claimed_by_user_id);

-- SEED DATA
INSERT INTO parishes (id, name, region) VALUES
('ouachita', 'Ouachita Parish', 'North Louisiana'),
('caddo', 'Caddo Parish', 'North Louisiana'),
('orleans', 'Orleans Parish', 'Greater New Orleans'),
('jefferson', 'Jefferson Parish', 'Greater New Orleans'),
('east-baton-rouge', 'East Baton Rouge Parish', 'Capital Area'),
('lafayette', 'Lafayette Parish', 'Acadiana'),
('calcasieu', 'Calcasieu Parish', 'Southwest Louisiana'),
('iberia', 'Iberia Parish', 'Acadiana')
ON CONFLICT (id) DO NOTHING;

INSERT INTO schools (id, name, parish_id, city, classification) VALUES
('neville', 'Neville High School', 'ouachita', 'Monroe', '4A'),
('ouachita-high', 'Ouachita Parish High School', 'ouachita', 'Monroe', '5A'),
('edna-karr', 'Edna Karr High School', 'orleans', 'New Orleans', '5A'),
('catholic-br', 'Catholic High School', 'east-baton-rouge', 'Baton Rouge', 'Select Div I'),
('university-lab', 'University Lab High School', 'east-baton-rouge', 'Baton Rouge', 'Select Div II'),
('byrd', 'C.E. Byrd High School', 'caddo', 'Shreveport', '5A'),
('westgate', 'Westgate High School', 'iberia', 'New Iberia', '4A'),
('lafayette-high', 'Lafayette High School', 'lafayette', 'Lafayette', '5A')
ON CONFLICT (id) DO NOTHING;

INSERT INTO athletes (
    player_id, full_name, slug, grad_year, current_grade, school_id, school_name,
    parish_city, primary_sport, secondary_sports, position, season_stats_summary,
    newspaper_mentions, social_handles, total_followers, est_nil_value,
    potential_colleges, headshot_url, bio, claimed, verified, tier
) VALUES
(
    'LA-2027-0001',
    'Marcus Thibodaux',
    'marcus-thibodaux-2027',
    2027,
    'Senior',
    'neville',
    'Neville High School',
    'Ouachita Parish / Monroe',
    'Football',
    ARRAY['Track & Field'],
    'QB',
    '2026: 2,450 pass yds, 28 TD, 4 INT; 410 rush yds, 6 TD',
    '[{"source": "The News-Star", "title": "Thibodaux leads Neville to district championship", "date": "2026-10-18"}]'::jsonb,
    '{"instagram": "@mthibodaux_12", "twitter": "@MarcusThib12"}'::jsonb,
    4850,
    1450.00,
    ARRAY['LSU', 'Louisiana Tech', 'Tulane', 'ULM'],
    'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&auto=format&fit=crop&q=80',
    'Dual-threat quarterback with 4.52 40-yard dash. Team captain, 3.8 GPA, 2x All-District selection.',
    true,
    true,
    'plus'
),
(
    'LA-2027-0002',
    'DeShawn Broussard',
    'deshawn-broussard-2027',
    2027,
    'Senior',
    'edna-karr',
    'Edna Karr High School',
    'Orleans Parish / New Orleans',
    'Football',
    ARRAY['Basketball'],
    'WR / CB',
    '2026: 62 rec, 1,120 yds, 14 TD; 4 INT on defense',
    '[{"source": "NOLA.com", "title": "Broussard flashes 5-star speed in Edna Karr playoff run", "date": "2026-11-02"}]'::jsonb,
    '{"instagram": "@shawn_broussard", "twitter": "@DBroussard9"}'::jsonb,
    8920,
    2200.00,
    ARRAY['LSU', 'Texas A&M', 'Ole Miss', 'Florida State'],
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    'Explosive playmaker with 4.41 speed. 2026 Class 5A Offensive MVP candidate.',
    false,
    true,
    'free'
),
(
    'LA-2028-0001',
    'Jaylen Landry',
    'jaylen-landry-2028',
    2028,
    'Junior',
    'catholic-br',
    'Catholic High School',
    'East Baton Rouge Parish / Baton Rouge',
    'Baseball',
    ARRAY['Football'],
    'SS / RHP',
    '2026: .412 AVG, 8 HR, 34 RBI; 92 mph fastball on mound',
    '[{"source": "The Advocate", "title": "Landry commits to two-sport dominance at Catholic High", "date": "2026-05-14"}]'::jsonb,
    '{"instagram": "@jaylen.landry.9", "twitter": "@JLandryBaseball"}'::jsonb,
    3100,
    950.00,
    ARRAY['LSU', 'Vanderbilt', 'Louisiana Ragin Cajuns'],
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    'Premier middle infielder and closer. 2026 Underclass All-American selection.',
    true,
    true,
    'plus'
),
(
    'LA-2028-0002',
    'Aaliyah Washington',
    'aaliyah-washington-2028',
    2028,
    'Junior',
    'ouachita-high',
    'Ouachita Parish High School',
    'Ouachita Parish / Monroe',
    'Basketball',
    ARRAY['Track & Field'],
    'PG',
    '2025-26: 22.4 PPG, 6.8 APG, 4.2 SPG; State Champion in 100m hurdles',
    '[{"source": "The News-Star", "title": "Washington puts Ouachita on the map with 38-point night", "date": "2026-01-20"}]'::jsonb,
    '{"instagram": "@aaliyahhoops_3", "tiktok": "@aaliyah.wash"}'::jsonb,
    14200,
    2850.00,
    ARRAY['LSU', 'South Carolina', 'UConn', 'Baylor'],
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&auto=format&fit=crop&q=80',
    'Top-ranked point guard in Louisiana Class of 2028. State track champion, honors student.',
    true,
    true,
    'plus'
)
ON CONFLICT (player_id) DO NOTHING;
