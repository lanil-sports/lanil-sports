"use strict";

/**
 * LANILSPORTS — Expanded MaxPreps Roster Ingestion
 *
 * Coverage (expanded from scripts/ingest_maxpreps.js, which targeted only 25
 * schools (slice 35–75, no pagination) and football):
 *   - ALL Louisiana MaxPreps schools from the /la/schools/ directory (200 LA).
 *   - ALL football/other available varsity sports per school: basketball,
 *     baseball, softball, volleyball, soccer, wrestling, golf, tennis,
 *     swimming & diving, cross-country, track & field (missing sports 404).
 *   - Full-roster parsing via #__NEXT_DATA__ athleteData[] (verified varsity
 *     rosters — used by UHSAA for tournament programs).
 *
 * Uses the shared library (scripts/ingest_lib.js): protected merge, dedupe by
 * (name, school, sport, parish, grad_year), dry-run, and totals reporting.
 *
 * Auth: no API key needed — rosters are public on maxpreps.com/la/...
 */

const fetch = globalThis.fetch;
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");
const lib = require("./ingest_lib");

const MAXPREPS_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// Surface unexpected failures instead of dying silently (long unattended runs).
process.on("uncaughtException", (e) => {
  console.error("UNCAUGHT:", e && (e.stack || e.message) || e);
  process.exitCode = 1;
});
process.on("unhandledRejection", (e) => {
  console.error("UNHANDLED:", e && (e.stack || e.message) || e);
  process.exitCode = 1;
});

const MAXPREPS_LA_INDEX = "https://www.maxpreps.com/la/schools/";
const SOURCE = "MaxPreps";
const LOG_LIMIT = 4000;

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

const ROSTER_SPORTS = [
  "football", "basketball", "baseball", "softball", "volleyball",
  "soccer", "wrestling", "golf", "tennis", "swimming-diving",
  "cross-country", "track-and-field",
];

const SPORT_DISPLAY = {
  football: "Football", basketball: "Basketball", baseball: "Baseball",
  softball: "Softball", volleyball: "Volleyball", soccer: "Soccer",
  wrestling: "Wrestling", golf: "Golf", tennis: "Tennis",
  "swimming-diving": "Swimming & Diving", "cross-country": "Cross Country",
  "track-and-field": "Track & Field",
};

/**
 * Shape a MaxPreps roster row (arr from athleteData) into a LANIL athlete row.
 */
function mapMaxPrepsRosterRow(arr, school, sportSlug, totals) {
  const arrLen = arr.length;
  const firstName = (arr[5] || "").toString();
  const lastName = (arr[6] || "").toString();
  let fullName = (arr[34] && String(arr[34]).trim()) || `${firstName} ${lastName}`.trim();
  // Reject placeholder rows (e.g., "null Player #26").
  if (/^null\s/.test(fullName) || fullName.toLowerCase().startsWith("player #")) {
    fullName = "";
  }
  fullName = lib.normalizeName(fullName);
  if (!fullName || fullName.length < 3) return null;

  const gradeNum = arr[7];
  const gradeText = arr[37] || "Jr.";
  const gradeNumN = Number(gradeNum);
  const gradYear = getGradYear(gradeNumN, gradeText);
  const weight = arr[11] ? parseInt(arr[11], 10) || 0 : 0;
  const primaryPos = (arr[12] || "").toString();
  const secondaryPos = (arr[13] || "").toString();
  const headshotUrl = arr[18] || "";
  const profileUrl = arr[32] || "";
  const posString = arr[33] || primaryPos;
  const heightStr = arr[35] || "";
  const heightInches = arr[36] || 0;

  const sport = SPORT_DISPLAY[sportSlug] || (sportSlug ? sportSlug.charAt(0).toUpperCase() + sportSlug.slice(1).replace(/-/g, " ") : "");

  const parcel = {
    full_name: fullName,
    grad_year: gradYear,
    current_grade: gradeFromYear(gradYear),
    school_id: school.id,
    school_name: school.name,
    parish_id: school.parish_id || null,
    parish_city: school.city || "",
    primary_sport: sport,
    secondary_sports: lib.normalizePositions(secondaryPos),
    position: lib.normalizePositions(posString).join(" / "),
    season_stats_summary: "",
    newspaper_mentions: [],
    social_handles: {},
    total_followers: 0,
    // MaxPreps rosters have no offers yet; offers bump NIL value via offersMultiplier
    // on recalc paths (e.g. batch_upsert) once potential_colleges is populated.
    est_nil_value: calculateNil(primaryPos, gradeText, weight, heightInches, []),
    potential_colleges: [],
    headshot_url: headshotUrl || "",
    headshot_permission: headshotUrl ? "maxpreps" : "", // official rosters → authorized for display
    photo_gallery: headshotUrl ? [headshotUrl] : [],
    bio: [`Class ${gradYear}`, primaryPos ? primaryPos : "", heightStr ? heightStr : "", weight ? `${weight} lbs` : ""].filter(Boolean).join(" | ") + `. Varsity ${sportSlug} at ${school.name}.`,
    hudl_url: profileUrl || "",
    youtube_url: "",
    gpa: null,
    claimed: false,
    tier: "free",
    verified: true,
    parent_consent_verified: false,
    // Migration-01 fields
    source_url: profileUrl || `${school.canonicalUrl}${sportSlug}/roster/`,
    import_date: null,
    division: school.classification || "5A",
    weight_lbs: weight || null,
    height_in: Number(heightInches) || null,
  };
  return parcel;
}

// ────────────────────────────────────────────────────────────────────────────
// Shared mappings (same formulas as scripts/ingest_maxpreps.js)
// ────────────────────────────────────────────────────────────────────────────

function getGradYear(gradeNum, gradeText) {
  if (gradeNum === 12 || gradeText === "Sr.") return 2027;
  if (gradeNum === 11 || gradeText === "Jr.") return 2028;
  if (gradeNum === 10 || gradeText === "So.") return 2029;
  if (gradeNum === 9 || gradeText === "Fr.") return 2030;
  return 2028;
}

function gradeFromYear(year) {
  if (year === 2027) return "Senior";
  if (year === 2028) return "Junior";
  if (year === 2029) return "Sophomore";
  if (year === 2030) return "Freshman";
  return "";
}

function calculateNil(pos, grade, weight, heightInches, offers) {
  const base = 250;
  let posMult = 1.0;
  const p = (pos || "").toUpperCase();
  if (p.includes("QB") || p.includes("PG")) posMult = 1.35;
  else if (p.includes("WR") || p.includes("DE") || p.includes("SS") || p.includes("RHP")) posMult = 1.15;
  else if (p.includes("RB") || p.includes("SF")) posMult = 1.05;
  else if (p.includes("OL") || p.includes("DL") || p.includes("OT")) posMult = 0.95;
  let sizeBonus = 0;
  if (weight >= 220 || heightInches >= 75) sizeBonus = 250;
  let gradeMult = 1.0;
  if (grade === "Sr." || grade === "Senior") gradeMult = 1.25;
  else if (grade === "Jr." || grade === "Junior") gradeMult = 1.15;
  else if (grade === "So." || grade === "Sophomore") gradeMult = 1.05;
  // College offers bump the value: 3+ offers → 1.30x, 1–2 offers → 1.15x (see offersMultiplier).
  const offerMult = offersMultiplier(offers);
  return Math.round(((base * posMult * gradeMult) + sizeBonus) * offerMult);
}

// Offers are stored in athlete.potential_colleges. Players with offers get a
// bump on their NIL value: 3+ offers = 1.30x, 1–2 offers = 1.15x, none = 1.0x.
function offersMultiplier(colleges) {
  const offers = Array.isArray(colleges) ? colleges.filter(Boolean) : [];
  if (offers.length === 0) return 1;
  if (offers.length >= 3) return 1.30;
  return 1.15;
}

// ────────────────────────────────────────────────────────────────────────────
// Parsing
// ────────────────────────────────────────────────────────────────────────────

async function fetchLaSchools() {
  const html = await lib.fetchText(MAXPREPS_LA_INDEX, { headers: { "User-Agent": MAXPREPS_UA } });
  if (!html || !html.includes('id="__NEXT_DATA__"')) throw new Error(`Failed fetching ${MAXPREPS_LA_INDEX}`);
  const $ = cheerio.load(html);
  const data = JSON.parse($("#__NEXT_DATA__").html());
  const groupings = data.props.pageProps.groupings || [];
  const schools = groupings
    .filter((g) => g.state === "LA" || /\/la\//i.test(g.canonicalUrl))
    .map((g) => ({ name: g.name, city: g.city, state: g.state, canonicalUrl: g.canonicalUrl }));
  return schools;
}

/**
 * Parse a roster page into mapped athlete rows using #__NEXT_DATA__.athleteData.
 */
function parseRosterHtml(html, school, sportSlug) {
  const rows = [];
  const $ = cheerio.load(html);
  const jsonScript = $("#__NEXT_DATA__").html();
  if (!jsonScript) return { rows, count: 0 };
  const data = JSON.parse(jsonScript);
  const rawAthletes = data.props && data.props.pageProps && data.props.pageProps.athleteData;
  if (!rawAthletes || !Array.isArray(rawAthletes)) return { rows, count: 0 };
  rawAthletes.forEach((arr) => {
    if (!Array.isArray(arr) || arr.length < 10) return;
    const rec = mapMaxPrepsRosterRow(arr, school, sportSlug);
    if (rec) rows.push(rec);
  });
  return { rows, count: rawAthletes.length };
}

// ────────────────────────────────────────────────────────────────────────────
// Upsert phase (dedupe + protected merge)
// ────────────────────────────────────────────────────────────────────────────

function upsertPhase(rows, snap, sequence, seenKeys) {
  const toInsert = [];
  const toPatch = [];
  const sportCounts = {};
  // Shared across the whole run: an athlete listed on two sport pages must be
  // processed once, not inserted twice.
  const seen = seenKeys || new Set();
  for (const row of rows) {
    const key = lib.dedupeKey(row);
    if (seen.has(key)) { continue; } // duplicate anywhere in this run
    seen.add(key);
    if (snap.byKey.has(key)) {
      const existing = snap.byKey.get(key);
      const changedFields = [];
      const merged = lib.mergeAthlete(existing, row, { changedFields });
      if (changedFields.length > 0) {
        const now = new Date().toISOString().split("T")[0];
        const patchRow = {};
        if (merged.source_url) patchRow.source_url = merged.source_url;
        if (merged.division) patchRow.division = merged.division;
        if (merged.weight_lbs) patchRow.weight_lbs = merged.weight_lbs;
        if (merged.height_in) patchRow.height_in = merged.height_in;
        if (merged.position) patchRow.position = merged.position;
        if (merged.season_stats_summary) patchRow.season_stats_summary = merged.season_stats_summary;
        if (merged.secondary_sports && merged.secondary_sports.length) patchRow.secondary_sports = merged.secondary_sports;
        if (merged.est_nil_value > 0 && existing.est_nil_value <= 0) patchRow.est_nil_value = merged.est_nil_value;
        if (patchRow.source_url) patchRow.import_date = now;
        toPatch.push({ id: existing.id, patchRow, sport: merged.primary_sport });
      }
      // else skip (unchanged)
    } else {
      // Sequence must be unique per school+grad-year across the WHOLE run, not
      // per roster page, otherwise two different athletes can share a player_id.
      const schoolKey = lib.slugify(row.school_name, 40).toUpperCase();
      const seqKey = `${schoolKey}|${row.grad_year}`;
      const idx = (sequence.get(seqKey) || 0) + 1;
      sequence.set(seqKey, idx);
      const now = new Date().toISOString().split("T")[0];
      let pid = `LANIL-MP-${schoolKey}-${row.grad_year}-${String(idx).padStart(3, "0")}`;
      // Never collide with an existing player_id in the live DB.
      let suffix = 1;
      while (snap.byPlayerId.has(pid)) {
        pid = `LANIL-MP-${schoolKey}-${row.grad_year}-${String(idx).padStart(3, "0")}-${suffix++}`;
      }
      snap.byPlayerId.set(pid, row);
      const slug = `${lib.slugify(row.full_name).slice(0, 40)}-${lib.slugify(row.school_name, 40) || "ls"}-${row.grad_year}-${pid.toLowerCase()}`;
      const insRow = Object.assign({ slug: slug, import_date: now }, row);
      insRow.player_id = pid;
      toInsert.push(insRow);
    }
    sportCounts[row.primary_sport] = (sportCounts[row.primary_sport] || 0) + 1;
  }
  return { toInsert, toPatch, sportCounts };
}

async function upsertWrite(totals, phase, opts) {
  let inserted = 0, patched = 0, failed = 0;
  const dryRun = opts.dryRun || lib.DRY_RUN;
  if (!dryRun) {
    for (const rec of phase.toInsert) {
      const resp = await lib.supabasePost("/athletes", [rec], "player_id");
      if (resp.ok) { inserted++; totals.add(SOURCE, "new", rec.primary_sport); }
      else { failed++; totals.add(SOURCE, "rejected", rec.primary_sport); lib.logLine(`  [rejected-insert] ${rec.full_name}: HTTP ${resp.status} ${(resp.body || "").substring(0, 100)}`); }
    }
    for (const { id, patchRow, sport } of phase.toPatch) {
      const resp = await lib.supabasePatch(`/athletes?id=eq.${id}`, [patchRow]);
      if (resp.ok) { patched++; totals.add(SOURCE, "updated", sport); }
      else { failed++; totals.add(SOURCE, "rejected", sport); lib.logLine(`  [rejected-update] id=${id}: HTTP ${resp.status}`); }
    }
  } else {
    inserted = phase.toInsert.length;
    patched = phase.toPatch.length;
    for (const rec of phase.toInsert) totals.add(SOURCE, "new", rec.primary_sport);
    for (const { sport } of phase.toPatch) totals.add(SOURCE, "updated", sport);
  }
  return { inserted, patched, failed };
}

async function run(opts) {
  opts = opts || {};
  const totals = lib.createTotals();

  lib.logLine("Fetching Louisiana MaxPreps schools (official varsity rosters)...");
  const schools = await fetchLaSchools();
  lib.logLine(`Found ${schools.length} Louisiana MaxPreps schools.`);

  // Snapshot existing athletes (dedupe against everything).
  const existing = await lib.fetchExistingAthletes();
  const snap = lib.pickExistingRows(existing);

  // Dev convenience: cap the number of schools processed (env MP_MAX_SCHOOLS,
  // MP_SCHOOL_OFFSET). Useful for staged validation runs.
  let schoolsToProcess = schools;
  const offset = parseInt(process.env.MP_SCHOOL_OFFSET || "0", 10) || 0;
  if (offset > 0) {
    schoolsToProcess = schools.slice(offset);
  }
  if (process.env.MP_MAX_SCHOOLS) {
    const max = parseInt(process.env.MP_MAX_SCHOOLS, 10);
    if (Number.isFinite(max) && max > 0) {
      schoolsToProcess = schools.slice(offset, offset + max);
      lib.logLine(`MP_MAX_SCHOOLS=${max}: processing ${schoolsToProcess.length} schools [${offset}..${offset + max}) (dry-run validation).`);
    }
  }

  // Upsert schools first (athletes reference school_id).
  const schoolRows = schools.map((s) => {
    const slug = lib.slugify(s.name, 40) || lib.slugify(s.city, 40);
    return { id: s.canonicalUrl ? s.canonicalUrl.split("/").filter(Boolean).pop() : slug, name: s.name, parish_id: lib.getParishId(s.city), city: s.city, classification: "5A", lhsaa_member: true };
  });
  const schoolsUpserted = await lib.supabasePost("/schools?on_conflict=id", schoolRows);
  lib.logLine(`Schools upsert: ${schoolsUpserted.ok ? "ok" : "FAILED " + (schoolsUpserted.status || "")}`);

  let fetchedAthletes = 0, fetchFailures = 0;
  // Shared across all schools/pages so duplicates are skipped and IDs stay unique.
  const seenKeys = new Set();
  const sequence = new Map();
  lib.logLine(`Processing ${schoolsToProcess.length} schools...`);
  for (const school of schoolsToProcess) {
    try {
      const schoolKey = lib.slugify(school.name, 40) || lib.slugify(school.city, 40);
      const schoolRow = schoolRows.find((s) => s.id === (school.canonicalUrl ? school.canonicalUrl.split("/").filter(Boolean).pop() : schoolKey));
      for (const sportSlug of ROSTER_SPORTS) {
        const url = `${school.canonicalUrl}${sportSlug}/roster/`;
        let html = null;
        try {
          html = await lib.fetchText(url, { headers: { "User-Agent": MAXPREPS_UA } });
        } catch (e) {
          fetchFailures++;
          lib.logLine(`  [fetch-fail] ${school.name} ${sportSlug}: ${String(e.message).substring(0, 80)}`);
          continue;
        }
        if (!html) { fetchFailures++; continue; }

        const { rows, count } = parseRosterHtml(html, { ...schoolRow, name: school.name, city: school.city }, sportSlug);
        if (count > 0) {
          const phase = upsertPhase(rows, snap, sequence, seenKeys);
          const write = await upsertWrite(totals, phase, opts);
          fetchedAthletes += count;
          lib.logLine(`  ${school.name} — ${SPORT_DISPLAY[sportSlug] || sportSlug}: parsed ${count} rows, wrote ${write.inserted} new, ${write.patched} updated`);
        }
        await sleep(250 + Math.floor(Math.random() * 250));
      }
    } catch (e) {
      lib.logLine(`  [school-error] ${school.name}: ${e.message}`);
    }
  }
  lib.logLine(`School loop complete. fetchedAthletes=${fetchedAthletes} failures=${fetchFailures}`);

  // Aggregate sport totals for reporting.
  const sportBreakdown = {};
  // totals has per-source-per-sport buckets: recompute from bySource summary.
  const entries = Object.entries(totals._bySource).filter(([s]) => s.startsWith(`${SOURCE} / `));
  for (const [source, bucket] of entries) {
    const sportName = source.replace(`${SOURCE} / `, "");
    for (const outcome of ["new", "updated", "skipped", "rejected"]) {
      if (bucket[outcome]) {
        sportBreakdown[sportName] = sportBreakdown[sportName] || {};
        sportBreakdown[sportName][outcome] = (sportBreakdown[sportName][outcome] || 0) + bucket[outcome];
      }
    }
  }
  lib.logLine(`Fetched ${fetchedAthletes} roster entries across ${schoolsToProcess.length} LA schools; roster page failures: ${fetchFailures}`);
  lib.logLine(`Per sport: ${JSON.stringify(sportBreakdown)}`);

  return {
    totals,
    result: {
      source: SOURCE,
      schoolsTotal: schools.length,
      rosterPagesFetched: fetchedAthletes,
      rosterPageFailures: fetchFailures,
      perSport: sportBreakdown,
    },
  };
}

module.exports = {
  run,
  SOURCE,
  fetchLaSchools,
  parseRosterHtml,
  upsertPhase,
  mapMaxPrepsRosterRow,
  getGradYear,
  gradeFromYear,
  calculateNil,
  offersMultiplier,
  ROSTER_SPORTS,
  SPORT_DISPLAY,
};

if (require.main === module) {
  run()
    .then((r) => {
      console.log("MaxPreps per-sport result:", JSON.stringify(r.result.perSport));
      console.log("MaxPreps:", JSON.stringify({ schools: r.result.schoolsTotal, pages: r.result.rosterPagesFetched, failures: r.result.rosterPageFailures }));
    })
    .catch((e) => { console.error("MaxPreps ingestion error:", e.message); process.exit(1); });
}
