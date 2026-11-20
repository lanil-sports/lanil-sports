"use strict";

/**
 * LANILSPORTS — LHSAA Network D1 Tracker Ingestion
 *
 * Primary source for Louisiana high-school alumni currently playing Division I.
 *
 * Source: LHSAA Network D1 Tracker (https://lhsaanetwork.com/d1-tracker/)
 *   - "Find Louisiana high school alumni on current Division I college rosters."
 *   - Data is public via the WordPress script
 *       https://lhsaanetwork.com/wp-content/themes/lhsaa-network/site/athlete-data.js
 *   - fetchTextFromJS() parses window.LHSAA_ATHLETE_DATA = { athletes: [...] }
 *   - Record fields: id, name, sport, sport_key, team, college,
 *     college_official, college_logo, college_logo_url, college_id, state
 *     (college state), highschool, highschool_id, position, season, bio_url,
 *     roster_url, verified_at.
 *
 * Coverage (as of inspection, Nov 2026): 1,547 athlete records across 16 sports
 * (football, baseball, basketball, softball, volleyball, cross country,
 * track & field, golf, wrestling, swimming & diving, tennis, soccer) and 238
 * Louisiana high schools — a substantially deeper catalog than our DB.
 *
 * Images: the tracker exposes only ESPN CDN college logos (a.espncdn.com —
 * ESPN copyright, not rehosted). Athlete headshots: the tracker provides
 * none, so existing images are preserved (see PROTECTED_FIELDS below).
 */

const lib = require("./ingest_lib");

const D1_TRACKER_URL = "https://lhsaanetwork.com/d1-tracker/";
const D1_DATA_URL = "https://lhsaanetwork.com/wp-content/themes/lhsaa-network/site/athlete-data.js";
const D1_SUMMARY_URL = "https://lhsaanetwork.com/wp-content/themes/lhsaa-network/site/athlete-summary.js";

const SOURCE = "LHSAA Network D1 Tracker";

// Fields never overwritten by merges: identity + verified data.
const PROTECTED_FIELDS = [
  "player_id", "slug", "full_name", "school_name", "verified", "claimed",
  "claimed_by_user_id", "tier", "parent_consent_verified", "headshot_url",
  "photo_gallery", "season_stats_summary", "total_followers", "est_nil_value",
  "potential_colleges", "social_handles", "newspaper_mentions", "gpa",
  "hudl_url", "youtube_url",
];

/**
 * Map LHSAA D1 Tracker sport strings → canonical LANIL sport names.
 */
function canonicalSport(s) {
  const v = lib.normalizeWhitespace(s).replace(/[’']/g, "'").toLowerCase().trim();
  const map = {
    "football": "Football",
    "track & field": "Track & Field",
    "cross country": "Cross Country",
    "baseball": "Baseball",
    "softball": "Softball",
    "volleyball": "Volleyball",
    "soccer": "Soccer",
    "wrestling": "Wrestling",
    "golf": "Golf",
    "swimming & diving": "Swimming & Diving",
    "tennis": "Tennis",
    "men's basketball": "Basketball",
    "men's football": "Football",
    "women's football": "Football",
    "women's basketball": "Basketball",
    "men's soccer": "Soccer",
    "women's soccer": "Soccer",
    "men's golf": "Golf",
    "women's golf": "Golf",
    "men's tennis": "Tennis",
    "women's tennis": "Tennis",
  };
  return map[v] || (v ? v.charAt(0).toUpperCase() + v.slice(1) : "");
}

function gradYearFromSeason(season) {
  const n = Number(season);
  return Number.isFinite(n) && n > 0 && n < 2100 ? n : 2028;
}

function gradeFromYear(year) {
  if (year === 2027) return "Senior";
  if (year === 2028) return "Junior";
  if (year === 2029) return "Sophomore";
  if (year === 2030) return "Freshman";
  return "";
}

function normSchoolKey(name) {
  return lib.normalizeWhitespace(name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function mapPosition(pos) {
  // Normalize "Defensive Line DL" → "Defensive Line".
  const v = lib.normalizeWhitespace(pos).replace(/\s+[A-Z]{2,3}$/, "").trim();
  return v;
}

/**
 * Parse LHSAA_HOME_TRACKER_OPTIONS (the site's [sport, state, highschool]
 * catalog, on the home page inline script) into a LA-state school name map.
 */
function extractLhsaanetworkSchools(html) {
  const schools = new Map(); // normName -> {name, city, state}
  const marker = "window.LHSAA_HOME_TRACKER_OPTIONS = ";
  const startIdx = html.indexOf(marker);
  if (startIdx === -1) return schools;
  const rest = html.slice(startIdx + marker.length);
  const arrStart = rest.indexOf("[");
  const arrEnd = rest.lastIndexOf("]");
  if (arrStart === -1 || arrEnd === -1 || arrEnd <= arrStart) return schools;
  try {
    const parsed = JSON.parse(rest.slice(arrStart, arrEnd + 1));
    for (const triple of parsed) {
      const [, state, name] = triple;
      if (state !== "LA" || !name) continue;
      const norm = normSchoolKey(name);
      if (norm && !schools.has(norm)) {
        schools.set(norm, { name, city: name, state: "LA" });
      }
    }
  } catch (e) { /* ignore malformed option lists */ }
  return schools;
}

/**
 * Build the DB school index: schools by normalized name.
 */
async function buildSchoolIndex() {
  const byNorm = new Map();
  const schools = await lib.supabaseGetRows("/schools?select=id,name,parish_id,city,lhsaa_member&limit=400");
  for (const s of schools) {
    const norm = normSchoolKey(s.name);
    if (norm && !byNorm.has(norm)) byNorm.set(norm, { ...s, nameKey: s.name });
  }
  return { byNorm };
}

/**
 * Load the parishes table (id → name) for composing parish_city strings.
 */
async function loadParishNames() {
  const byId = new Map();
  const parishes = await lib.supabaseGetRows("/parishes?select=id,name&limit=100");
  for (const p of parishes) byId.set(p.id, p.name);
  return byId;
}

function mapAthlete(a, ctx) {
  const gradYear = gradYearFromSeason(a.season);
  const schoolName = lib.normalizeWhitespace(a.highschool);
  const schoolNorm = normSchoolKey(schoolName);
  const school = ctx.byNorm.get(schoolNorm) || null;

  const name = lib.normalizeName(a.name);
  if (!name || name.length < 3) return null; // reject: no usable name
  const sport = canonicalSport(a.sport);
  if (!sport) return null; // reject: no usable sport

  const pid = "LANIL-D1-" + lib.slugify(`${a.name} ${schoolName} ${a.sport}`).slice(0, 60);
  const slug = `${lib.slugify(name).slice(0, 40)}-${lib.slugify(schoolName, 40) || "ls"}-${gradYear}-${pid.toLowerCase()}`;

  const parishName = school ? (ctx.parishNames.get(school.parish_id) || "") : "";
  const parishCity = school
    ? (parishName ? `${parishName} / ${school.city}` : (school.city || ""))
    : `${lib.getParishId(schoolName)} / ${schoolName}`;

  const rec = {
    player_id: pid,
    full_name: name,
    slug: slug,
    grad_year: gradYear,
    current_grade: gradeFromYear(gradYear),
    school_id: school ? school.id : lib.slugify(schoolName, 40),
    school_name: schoolName,
    parish_id: school ? school.parish_id : lib.getParishId(parishName || schoolName),
    parish_city: parishCity,
    primary_sport: sport,
    secondary_sports: [],
    position: mapPosition(a.position) || "",
    season_stats_summary: `LHSAA D1 Roster Entry — season ${a.season}. Bio: ${a.bio_url || ""}`.trim(),
    newspaper_mentions: [],
    social_handles: {},
    total_followers: 0,
    est_nil_value: 0,
    potential_colleges: [a.college_official || a.college].filter(Boolean),
    headshot_url: "",
    photo_gallery: [],
    bio: "",
    hudl_url: "",
    youtube_url: "",
    gpa: null,
    claimed: false,
    tier: "free",
    verified: true,
    parent_consent_verified: false,
    // Migration-01 fields
    source_url: a.roster_url || D1_TRACKER_URL,
    import_date: null, // set on insert; refreshed on update when new bio_url appears
    division: "Division I", // LHSAA Network D1 Tracker = D1-classified rosters
    state: lib.normalizeWhitespace(a.state) || "",
    bio_url: a.bio_url || "",
    headshot_permission: "", // tracker exposes no athlete images
    _protectedFields: PROTECTED_FIELDS,
  };
  return rec;
}

async function getD1Summary() {
  const js = await lib.fetchText(D1_SUMMARY_URL);
  const m = js.match(/"athletes"\s*:\s*(\d+)/);
  return { athletes: Number(m && m[1]) || 0 };
}

async function upsertNewSchools(newSchools) {
  let ok = 0;
  for (const s of newSchools) {
    const payload = {
      id: s.id,
      name: s.name,
      parish_id: s.parish_id || lib.getParishId(s.city),
      city: s.city,
      classification: "5A",
      lhsaa_member: true,
    };
    const resp = await lib.supabasePost("/schools?on_conflict=id", [payload]);
    if (resp.ok || resp.status === 422) ok++;
  }
  return ok;
}

function today() {
  return new Date().toISOString().split("T")[0];
}

async function run(opts) {
  opts = opts || {};
  const totals = lib.createTotals();
  const ctx = { byNorm: new Map(), parishNames: new Map(), newSchools: new Map() };

  const summary = await getD1Summary().catch(() => ({ athletes: 0 }));
  lib.logLine(`LHSAA Network D1 Tracker summary: ${summary.athletes} athlete records`);

  const tracks = await lib.fetchTextFromJS(D1_DATA_URL);
  const records = tracks.athletes || [];
  lib.logLine(`Fetched ${records.length} athlete records from ${D1_DATA_URL}`);

  // Snapshot existing athletes from DB for dedupe + protected merge.
  const existing = await lib.fetchExistingAthletes();
  const snap = lib.pickExistingRows(existing);

  // LHSAA home page school catalog + DB schools + parish names for mapping.
  const homeHtml = await lib.fetchText(D1_TRACKER_URL).catch(() => "");
  const optionSchools = extractLhsaanetworkSchools(homeHtml);
  const dbIndex = await buildSchoolIndex();
  for (const [norm, s] of dbIndex.byNorm) ctx.byNorm.set(norm, s);
  ctx.parishNames = await loadParishNames();

  const toInsert = [];
  const toPatch = [];
  const rejected = [];
  const skipped = [];
  const sportCounts = {};
  const seenInRun = new Set();

  for (const a of records) {
    const incoming = mapAthlete(a, ctx);
    if (!incoming) {
      rejected.push({ name: a && a.name, sport: a && a.sport });
      continue;
    }
    const key = lib.dedupeKey(incoming);
    if (seenInRun.has(key)) continue;
    seenInRun.add(key);

    const matched = snap.byKey.get(key);
    if (matched) {
      const changedFields = [];
      const merged = lib.mergeAthlete(matched, incoming, { changedFields });
      const sport = merged.primary_sport;
      if (changedFields.length > 0) {
        toPatch.push({ row: merged, id: matched.id });
        totals.add(SOURCE, "updated", sport);
      } else {
        skipped.push({ name: merged.full_name, sport });
        totals.add(SOURCE, "skipped", sport);
      }
      sportCounts[sport] = (sportCounts[sport] || 0) + 1;
      continue;
    }

    // Ensure the school exists somewhere for this athlete.
    const schoolNorm = normSchoolKey(incoming.school_name);
    if (!ctx.byNorm.has(schoolNorm) && !ctx.newSchools.has(schoolNorm)) {
      let school = null;
      const o = optionSchools.get(schoolNorm);
      if (o) {
        const payload = {
          id: lib.slugify(o.name, 40),
          name: o.name,
          city: o.city || o.name,
          state: o.state || "",
          parish_id: lib.getParishId(o.city || o.name),
          lhsaa_member: true,
        };
        school = { id: payload.id, name: payload.name, city: payload.city, parish_id: payload.parish_id };
        ctx.newSchools.set(schoolNorm, payload);
      }
      if (!school) {
        const payload = {
          id: lib.slugify(incoming.school_name, 40),
          name: incoming.school_name,
          city: incoming.school_name,
          state: lib.normalizeWhitespace(incoming.state) || "",
          parish_id: lib.getParishId(incoming.school_name),
          lhsaa_member: true,
        };
        school = { id: payload.id, name: payload.name, city: payload.city, parish_id: payload.parish_id };
        ctx.newSchools.set(schoolNorm, payload);
      }
    }
    if (!ctx.byNorm.has(schoolNorm) && ctx.newSchools.has(schoolNorm)) {
      ctx.byNorm.set(schoolNorm, { id: ctx.newSchools.get(schoolNorm).id, name: ctx.newSchools.get(schoolNorm).name, city: ctx.newSchools.get(schoolNorm).city, parish_id: ctx.newSchools.get(schoolNorm).parish_id });
    }

    toInsert.push(incoming);
    totals.add(SOURCE, "new", incoming.primary_sport);
    sportCounts[incoming.primary_sport] = (sportCounts[incoming.primary_sport] || 0) + 1;
  }

  lib.logLine(`Per sport: ${JSON.stringify(sportCounts)}`);

  // Upsert new schools first ( athletes reference school_id).
  if (ctx.newSchools.size > 0) {
    const schoolNames = [...ctx.newSchools.values()].map((s) => s.name);
    const n = await upsertNewSchools([...ctx.newSchools.values()]);
    lib.logLine(`Schools: ${n}/${ctx.newSchools.size} inserted/confirmed (${schoolNames.join(", ")})`);
  }

  // Write phase.
  let inserted = 0, patched = 0, insertFailed = 0, patchFailed = 0;
  const dryRun = opts.dryRun || lib.DRY_RUN;
  if (!dryRun) {
    for (const row of toInsert) {
      const insRow = Object.assign({ import_date: today() }, row);
      delete insRow._protectedFields;
      const resp = await lib.supabasePost("/athletes", [insRow], "player_id");
      if (resp.ok) inserted++;
      else { insertFailed++; lib.logLine(`  [rejected-insert] ${row.full_name}: HTTP ${resp.status} ${(resp.body || "").substring(0, 120)}`); }
      if (inserted + patched > 0 && (inserted + patched) % 50 === 0) await new Promise((r) => setTimeout(r, 250));
    }
    for (const { row, id } of toPatch) {
      const patchRow = {};
      if (row.source_url) patchRow.source_url = row.source_url;
      if (row.state) patchRow.state = row.state;
      if (row.bio_url) patchRow.bio_url = row.bio_url;
      if (row.parish_city) patchRow.parish_city = row.parish_city;
      if (row.current_grade) patchRow.current_grade = row.current_grade;
      if (row.position) patchRow.position = row.position;
      if (row.season_stats_summary) patchRow.season_stats_summary = row.season_stats_summary;
      if (row.potential_colleges && row.potential_colleges.length) patchRow.potential_colleges = row.potential_colleges;
      if (patchRow.source_url || patchRow.bio_url) patchRow.import_date = today();
      const resp = await lib.supabasePatch(`/athletes?id=eq.${id}`, [patchRow]);
      if (resp.ok) patched++;
      else { patchFailed++; lib.logLine(`  [rejected-update] id=${id} ${row.full_name}: HTTP ${resp.status} ${(resp.body || "").substring(0, 120)}`); }
      if (inserted + patched > 0 && (inserted + patched) % 50 === 0) await new Promise((r) => setTimeout(r, 250));
    }
  } else {
    lib.logLine(`[dry-run] would insert ${toInsert.length}, patch ${toPatch.length} athletes`);
    inserted = toInsert.length;
    patched = toPatch.length;
  }

  // Recount totals from actual write results.
  const b = totals.bySource(SOURCE);
  b.new = inserted;
  b.updated = patched;
  b.skipped = skipped.length;
  b.rejected = rejected.length + insertFailed + patchFailed;

  lib.logLine(`LHSAA Network D1 Tracker write results: new=${inserted} updated=${patched} skipped=${b.skipped} rejected=${b.rejected}`);

  return {
    totals,
    result: {
      source: SOURCE,
      new: inserted, updated: patched,
      skipped: b.skipped, rejected: b.rejected,
      recordsProcessed: records.length,
    },
  };
}

module.exports = {
  run,
  SOURCE,
  mapAthlete,
  canonicalSport,
  D1_DATA_URL,
  D1_TRACKER_URL,
  D1_SUMMARY_URL,
  extractLhsaanetworkSchools,
};

if (require.main === module) {
  run()
    .then((r) => console.log("D1 tracker result:", JSON.stringify(r.result)))
    .catch((e) => { console.error("D1 ingestion error:", e.message); process.exit(1); });
}
