"use strict";

/**
 * LANILSPORTS — Unit tests for scripts/ingest_lib.js + source parsers (offline).
 * Run: node scripts/test_ingest_lib.js
 */

const lib = require("./ingest_lib");
const d1 = require("./ingest_lhsaanetwork_d1");
const mp = require("./ingest_maxpreps_all");

let pass = 0;
let fail = 0;
function check(name, cond) {
  if (cond) {
    pass++;
    console.log("PASS:", name);
  } else {
    fail++;
    console.log("FAIL:", name);
  }
}

// ── slugify / normalization ──────────────────────────────────────────────

check("slugify basics", lib.slugify("DeShawn Broussard-2027") === "deshawn-broussard-2027");
check("slugify empty", lib.slugify("") === "");
check("slugify weird", lib.slugify("A/B & C!") === "a-b-c");
check("slugify maxlen", lib.slugify("verylongname", 5).length <= 5);

check("normalizeWhitespace", lib.normalizeWhitespace("  A   B\tC  ") === "A B C");
check("normalizeName trims", lib.normalizeName(" Talented  49er\u0007 ") === "Talented 49er");

check(
  "normalizeSport maps 'Men’s Basketball'",
  d1.canonicalSport("Men’s Basketball") === "Basketball"
);
check("normalizeSport Maps 'Men's Football' -> Football", d1.canonicalSport("Men's Football") === "Football");
check("normalizeSport Titles case", d1.canonicalSport("cross country") === "Cross Country");
check("normalizeSport keeps empty", d1.canonicalSport("") === "");

check("normalizeParish last segment", lib.normalizeParish("Ouachita Parish / Monroe") === "monroe");
check("normalizeParish city only", lib.normalizeParish("Monroe") === "monroe");
check("normalizeParish empty", lib.normalizeParish("") === "");

// ── dedupeKey ────────────────────────────────────────────────────────────

const keyA = lib.dedupeKey({
  full_name: "Deshawn Broussard",
  school_name: "Edna Karr High School",
  parish_city: "Orleans Parish / New Orleans",
  primary_sport: "Football",
  grad_year: "2027",
});
const keyB = lib.dedupeKey({
  full_name: "Deshawn Broussard ",
  school_name: "Edna Karr",
  parish_city: "New Orleans",
  primary_sport: "football",
  grad_year: 2027,
});
check("dedupeKey same key across sources", keyA === keyB);
check("dedupeKey distinct by sport", lib.dedupeKey({ ...keyA ? {} : {}, full_name: "Deshawn Broussard", school_name: "Edna Karr High School", parish_city: "Orleans Parish / New Orleans", primary_sport: "Basketball", grad_year: "2027" }) !== keyA);

// ── mergeAthlete protected semantics ─────────────────────────────────────

const existing = {
  player_id: "X",
  full_name: "Alex Example",
  verified: true,
  headshot_url: "http://img/head.jpg",
  school_name: "Some School",
  slug: "a-b",
  est_nil_value: 0,
  potential_colleges: ["LSU"],
};
const merged = lib.mergeAthlete(existing, {
  player_id: "Y",
  full_name: "",
  headshot_url: "",
  verified: false,
  est_nil_value: 999,
  potential_colleges: ["Texas"],
  season_stats_summary: "2026: 1 thing",
});
check("merge keeps existing verified (no downgrade)", merged.verified === true);
check("merge does not overwrite non-empty name", merged.full_name === "Alex Example");
check("merge fills empty est_nil_value", merged.est_nil_value === 999);
check("merge fills empty headshot only when existing empty", merged.headshot_url === "http://img/head.jpg");
check("merge unions potential_colleges", lib.arraysEqual(merged.potential_colleges, ["LSU", "Texas"]));
check("merge sets missing season_stats_summary", merged.season_stats_summary === "2026: 1 thing");

const mergedChanged = lib.mergeAthlete(existing, { est_nil_value: 0, verified: false });
const changedFields = [];
lib.mergeAthlete(existing, { source_url: "http://src", bio_url: "http://bio" }, { changedFields });
check("merge reports changed fields", changedFields.includes("source_url") && changedFields.includes("bio_url"));

// ── getParishId ──────────────────────────────────────────────────────────

check("getParishId('Haughton') -> bossier", lib.getParishId("Haughton") === "bossier");
check("getParishId('Monroe') -> ouachita", lib.getParishId("Monroe") === "ouachita");
check("getParishId default ouachita", lib.getParishId("Nowhere Special") === "ouachita");
check("getParishId empty", lib.getParishId("") === "ouachita");

// ── extractLhsaanetworkSchools (synthetic options HTML) ──────────────────

const fakeOptions = `<html><body><script>window.LHSAA_HOME_TRACKER_OPTIONS = [["Football","LA","Southern Lab"],["Basketball","LA","West Monroe"],["Battery","AL","A","x"]];</script></body></html>`;
const schools = d1.extractLhsaanetworkSchools(fakeOptions);
check("extractLhsaanetworkSchools parses LA schools", schools.size === 2);
check(
  "extractLhsaanetworkSchools key for 'Southern Lab'",
  schools.has("southernlab")
);

// ── parseRosterHtml (synthetic MaxPreps page) ────────────────────────────

const rosterRow = [
  "null", null, null, null, "abc",
  "Desi", "Byrd", 11, "0", 10, 5, 165,
  "WR", "RB", "", true, false, false, null, null, null, null,
  false, "", false, "x", "y", "z", null, "w", true, "2026-08-06",
  "https://www.maxpreps.com/la/monroe/neville-tigers/athletes/desi-byrd/",
  "WR, RB", "Desi Byrd", "5' 10\"", 70, "Jr.",
];
const rosterPage = `<html><body><script type="application/json" id="__NEXT_DATA__">{"props":{"pageProps":{"athleteData":[${JSON.stringify(rosterRow)}]}}}</script></body></html>`;
const schoolRow = { id: "neville", name: "Neville", city: "Monroe", parish_id: "ouachita", classification: "4A", lhsaa_member: true };
const parsed = mp.parseRosterHtml(rosterPage, schoolRow, "football");
check("parseRosterHtml returns rows", parsed.rows.length === 1);
if (parsed.rows[0]) {
  const r = parsed.rows[0];
  check("parseRosterHtml name", r.full_name === "Desi Byrd");
  check("parseRosterHtml grade from 11", r.grad_year === 2028);
  check("parseRosterHtml weight", r.weight_lbs === 165);
  check("parseRosterHtml height", r.height_in === 70);
  check("parseRosterHtml verified", r.verified === true);
  check("parseRosterHtml school_name", r.school_name === "Neville");
  check("parseRosterHtml hudl_url", r.hudl_url === "https://www.maxpreps.com/la/monroe/neville-tigers/athletes/desi-byrd/");
  check("parseRosterHtml division", r.division === "4A");
  check("parseRosterHtml sport", r.primary_sport === "Football");
  check("parseRosterHtml stats summary contains 'Class 2028'", String(r.season_stats_summary).includes("Class 2028"));
  check("parseRosterHtml parcel_city = Monroe", r.parish_city === "Monroe");
  check("parseRosterHtml est_nil > 0", r.est_nil_value > 0);
}

// ── mapAthlete (D1 Tracker) ──────────────────────────────────────────────

const mapped = d1.mapAthlete(
  {
    id: "x1",
    name: "Gideon Spottsville",
    sport: "Football",
    highschool: "Southern Lab",
    season: "2026",
    state: "MS",
    bio_url: "https://alcornsports.com/bio/x",
    roster_url: "https://alcornsports.com/roster/x",
  },
  { byNorm: new Map(), parishNames: new Map() }
);
check("mapAthlete player_id prefix", /^LANIL-D1-/.test(mapped.player_id));
check("mapAthlete canonical sport", mapped.primary_sport === "Football");
check("mapAthlete grad year from season", mapped.grad_year === 2026);
check("mapAthlete school_name", mapped.school_name === "Southern Lab");
check("mapAthlete verified", mapped.verified === true);
check("mapAthlete division", mapped.division === "Division I");
check("mapAthlete source_url", mapped.source_url === "https://alcornsports.com/roster/x");
check("mapAthlete bio_url", mapped.bio_url === "https://alcornsports.com/bio/x");
check("mapAthlete state", mapped.state === "MS");
check("mapAthlete dedupeKey non-empty", lib.dedupeKey(mapped).length > 0);

// Reject: name < 3 chars
const rejected = d1.mapAthlete({ id: "x2", name: "Al", sport: "Football", highschool: "Southern Lab", season: "2027" }, { byNorm: new Map(), parishNames: new Map() });
check("mapAthlete rejects short names", rejected === null);

// ── totals ───────────────────────────────────────────────────────────────

const t = lib.createTotals();
t.add("A", "new", "Football");
t.add("A", "new", "Football");
t.add("A", "updated", "Basketball");
const g = t.grandTotal();
check("totals grandTotal", g.new === 2 && g.updated === 1 && g.skipped === 0 && g.rejected === 0);

// ── cross-page dedupe + player_id uniqueness (MaxPreps) ───────────────────

const emptySnap = lib.pickExistingRows([]);
const sharedSeen = new Set();
const sharedSeq = new Map();
function dedupeTestRow(name, grad) {
  return {
    full_name: name,
    school_name: "Neville",
    parish_city: "Monroe",
    primary_sport: "Football",
    grad_year: grad,
  };
}
const phase1 = mp.upsertPhase(
  [dedupeTestRow("Desi Byrd", 2028), dedupeTestRow("John Pearson", 2028)],
  emptySnap, sharedSeq, sharedSeen
);
const phase2 = mp.upsertPhase(
  [dedupeTestRow("Desi Byrd", 2028), dedupeTestRow("Jane Doe", 2028)],
  emptySnap, sharedSeq, sharedSeen
);
check("cross-page duplicate skipped", phase2.toInsert.length === 1 && phase2.toInsert[0].full_name === "Jane Doe");
const allPids = phase1.toInsert.concat(phase2.toInsert).map((r) => r.player_id);
check("player_id unique per school+grad-year", new Set(allPids).size === allPids.length);
check("player_id uses school+year sequence", allPids[0] !== allPids[1] && allPids[1] !== allPids[2]);

// Existing player_id collision must not overwrite a different athlete.
const collideSnap = lib.pickExistingRows([{
  id: "existing-id", player_id: allPids[0], full_name: "Other Athlete",
  school_name: "Neville", parish_city: "Monroe", primary_sport: "Football", grad_year: 2028,
}]);
const collide = mp.upsertPhase(
  [dedupeTestRow("Colliding Name", 2028)],
  collideSnap, new Map(), new Set()
);
check("existing player_id collision avoided", collide.toInsert.length === 1 && collide.toInsert[0].player_id !== allPids[0]);

// ── summary ──────────────────────────────────────────────────────────────

const lines = t.summary();
check("totals summary mentions source", /A/.test(lines));

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
