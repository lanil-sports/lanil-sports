"use strict";

/**
 * LANILSPORTS.COM Athlete Ingestion Engine (master orchestrator)
 *
 * Primary sources (all official / public):
 *   1. LHSAA Network D1 Tracker (Louisiana high-school alumni currently
 *      playing Division I) — scripts/ingest_lhsaanetwork_d1.js
 *   2. MaxPreps official varsity rosters — scripts/ingest_maxpreps_all.js
 *
 * Totals logged per source & sport (new / updated / skipped / rejected).
 *
 * Supabase schema changes for source attribution live in:
 *   supabase/migration_01_athlete_sources.sql
 *
 * Usage:
 *   node scripts/ingest_sports.js
 *   node scripts/ingest_sports.js --dry-run   # parse + simulate, no writes
 */

const lib = require("./ingest_lib");
const d1 = require("./ingest_lhsaanetwork_d1");
const mp = require("./ingest_maxpreps_all");

async function main() {
  lib.logLine(`${new Date().toISOString()} — LANILSports Athlete Ingestion (master run)`);

  const haveKeys = Boolean(lib.SERVICE_KEY && lib.SUPABASE_URL);
  const dryRun = lib.DRY_RUN || !haveKeys;
  if (!haveKeys && !lib.DRY_RUN) {
    lib.logLine("Notice: No SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY set — running in DRY-RUN mode (nothing will be written). Add the secrets to GitHub to enable live sync.");
  }

  for (const [label, mod] of [["LHSAA Network D1 Tracker", d1], ["MaxPreps", mp]]) {
    lib.logLine(`\n=== Source: ${label} ===`);
    try {
      const r = await mod.run({ dryRun });
      r.totals.print(label);
      if (r.result) lib.logLine("Result:", JSON.stringify(r.result));
    } catch (e) {
      lib.logLine(`${label} ingestion failed: ${e.message}`);
    }
  }

  lib.logLine("\nAll sources processed.");
}

main().catch((e) => {
  console.error("Ingestion engine error:", e.message);
  process.exit(1);
});
