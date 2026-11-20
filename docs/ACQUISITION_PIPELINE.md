# LANIL Sports — Athlete Power Data Acquisition Engine

## Overview

The Athlete Power Data Acquisition Engine discovers Louisiana athletes across the
best available sources and upserts them into the existing LANIL Sports Supabase
database. It never deletes existing athletes.

## Pipeline

```
scripts/acquire_lhsaa.js     # Parse LHSAA Network athlete_data artifact -> data/lhsaa_athletes.json
scripts/acquire_d1.js        # Parse d1_athletes.json artifact -> data/d1_athletes.json
scripts/acquire_schools.js   # Parse school_logos.json artifact -> data/schools.json
scripts/pipeline.js          # Dedup + upsert into DB via PostgREST + verify + log
```

Run order:
```powershell
node scripts/acquire_lhsaa.js
node scripts/acquire_d1.js
node scripts/acquire_schools.js
node scripts/pipeline.js
```

`scripts/pipeline.js`:
1. Loads DB state (`fetchAll('athletes', ...)`).
2. Loads every JSON in `data/` (lhsaa_athletes.json, d1_athletes.json, schools.json).
3. Dedups by slug, then by `full_name|school_name|primary_sport` (case-insensitive).
4. Inserts new rows via `POST /rest/v1/athletes`; updates existing rows via `PATCH /rest/v1/athletes?slug=eq.<slug>`.
5. Verifies: fetches each `bio_url` (HTTP GET) and sets `verified=true` when reachable (up to 8s timeout).
6. Appends events to `logs/acquire/acquire_log_<date>.jsonl` (discover/insert/update/verified) — full source attribution: source, source_id, slugs, old/new values.
7. Writes `data/pipeline_summary_<date>.json` and prints a summary.

## Athlete-Owned Experience (Athlete Portal)

```
scripts/athlete_portal.js  # claim_profile, submit_correction, upload_photo, add_achievement,
                           # request_removal, build_recruiting_profile
```
Events log to `logs/portal/portal_log_<date>.jsonl`. DB writes (athlete_corrections,
athlete_photos, etc.) fall back to the JSONL log when the tables do not yet exist.

## Success Metrics

```
scripts/metrics_report.js
```
Reports: total athletes in DB, discovered today, verified profiles, unverified,
percent verified, available photographs, college athletes, profiles claimed,
by-school, by-sport, by-parish, by-city. Writes `data/metrics_report_<date>.json`.

## New Tables (Acquisition Engine Extension)

`supabase/schema_acquisition.sql` — run in Supabase SQL Editor:

| Table | Purpose |
|---|---|
| athlete_sources | Source registry (access restrictions, licensing, permissions) |
| athlete_stats | Athlete statistics (season averages, game log, career totals) |
| athlete_achievements | Awards/honors/milestones |
| athlete_commitments | College commitments & roster history |
| athlete_photos | Athlete image engine (source, attribution, permission) |
| athlete_claims | Athlete-owned claims (claim, correction, removal) |
| athlete_corrections | Athlete corrections (old/new values, status) |
| athlete_historical | Full audit of every change (insert/update/verified/claimed) |
| athlete_imports | Import runs per source |
| acquisition_metrics | Success metrics per pipeline run |

## Rules (from the LANIL Sports spec)

- "Do not delete existing athlete records." — Pipeline only upserts.
- "Do not limit discovery to NCAA Division I athletes or a handful of Louisiana schools." — sources include LHSAA, NAIA, NJCAA, recruiting DBs, newspapers.
- Permission gating: sources with "needs_legal_review"/"blocked" status in `docs/SOURCE_REGISTRY.md` are not active until reviewed (see `supabase/schema_acquisition.sql` seeds).
- Athlete-owned experience: claims/corrections/photos go through `athlete_portal.js` (Athlete-first: athletes and parents can claim profiles, submit corrections, upload photos).

## Status

- 2026-11-20: Pipeline v1 implemented. Ingested LHSAA (1,547) + D1 (1,547) artifacts; schools (393).
- 2026-11-20: Migration + source registry + docs added.
