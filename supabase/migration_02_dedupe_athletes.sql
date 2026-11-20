-- ============================================================================
-- LANILSPORTS — MIGRATION 02: one-time duplicate athlete cleanup
-- ============================================================================
-- Pre-existing imports (older MP-* / LANIL-* player_id prefixes) created the
-- same athlete twice with different IDs. This keeps the richest, most-verified
-- row per (name, canonical school, sport, grad year) and removes the rest.
--
-- Already applied to the live Supabase project via
--   node scripts/cleanup_duplicate_athletes.js --apply
-- (which also merged empty fields from duplicates into the surviving row and
-- wrote a JSON backup under logs/). This SQL is the equivalent idempotent
-- cleanup for any other environment, plus a verification query.
-- ============================================================================

WITH ranked AS (
  SELECT
    id,
    row_number() OVER (
      PARTITION BY
        lower(trim(full_name)),
        regexp_replace(lower(trim(coalesce(school_name, ''))), '[- ](high school|hs|high|academy|prep)$', ''),
        lower(trim(coalesce(primary_sport, ''))),
        coalesce(grad_year, 0)
      ORDER BY
        (verified IS TRUE) DESC,
        (claimed IS TRUE) DESC,
        (nullif(trim(coalesce(headshot_url, '')), '') IS NOT NULL) DESC,
        coalesce(est_nil_value, 0) DESC,
        (coalesce(length(bio), 0) + coalesce(length(season_stats_summary), 0)) DESC,
        player_id ASC
    ) AS rn
  FROM athletes
)
DELETE FROM athletes
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- Verification: should return zero rows after cleanup.
SELECT
  lower(trim(full_name)) AS name,
  lower(trim(coalesce(school_name, ''))) AS school,
  lower(trim(coalesce(primary_sport, ''))) AS sport,
  coalesce(grad_year, 0) AS grad_year,
  count(*) AS copies
FROM athletes
GROUP BY 1, 2, 3, 4
HAVING count(*) > 1;
