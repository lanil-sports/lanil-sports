# Staging import (post-migration)

Generated: 2026-11-20T20:53:03.253Z

After running `supabase/schema_acquisition.sql` in the Supabase SQL Editor:
1. Import `athlete_photos.jsonl` -> `athlete_photos` (map slug->athlete_id if needed; athlete_id included).
2. Import `athlete_commitments.jsonl` -> `athlete_commitments`.
3. Import `athlete_historical.jsonl` -> `athlete_historical` (append-only).
4. Import `athlete_imports.jsonl` -> `athlete_imports`.

Counts: {
  "athlete_photos": 60,
  "athlete_commitments": 1628,
  "athlete_historical": 5069,
  "athlete_imports": 3
}

Notes:
- Photo rows for maxpreps/on3 sources are marked `permission_status='requires_review'` until rights/terms are confirmed for your use.
- Never substitute unrelated athlete images; only authorized/attributed photos are stored.
