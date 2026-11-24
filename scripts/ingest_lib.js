"use strict";

/**
 * LANILSPORTS — Shared Athlete Ingestion Library
 *
 * Shared helpers for the athlete ingestion pipeline:
 *  - Fetching: fetchText, fetchTextFromJS (LHSAA Network athlete-data.js)
 *  - Normalization: slugify, normalizeName, normalizeSport, normalizePosition
 *  - Duplicate detection: dedupeKey, dedupeKeyFromFile, pickExistingRows
 *  - Protected merging: mergeAthlete (never overwrites verified/non-empty fields)
 *  - Supabase: fetchExistingAthletes, upsertAthletes (batched, dry-run aware)
 *  - Reporting: Totals — counts of new/updated/skipped/rejected per source & sport
 *
 * Dry-run: any `supabasePost`/`supabasePatch` is a no-op unless live, even when
 * SUPABASE_* credentials are present. Enable with `node ... --dry-run` or the
 * DRY_RUN=true environment variable. When neither credentials nor dry-run are
 * set, nothing is ever written.
 */

const https = require("https");
const fs = require("fs");
const path = require("path");

const HOST = "uwnslkzyvmrrycdxvudg.supabase.co";
const REPO_ROOT = path.join(__dirname, "..");
const SUPABASE_URL = process.env.SUPABASE_URL || `https://${HOST}`;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const DRY_RUN =
  Boolean(process.env.DRY_RUN) ||
  (typeof process.argv !== "undefined" && process.argv.slice(2).includes("--dry-run"));

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const LOG_PREFIX = "[ingest_lib]";
const TIMEOUT_MS = 30000;

// ────────────────────────────────────────────────────────────────────────────
// Normalization helpers
// ────────────────────────────────────────────────────────────────────────────

/**
 * slugify("DeShawn Broussard-2027") → "deshawn-broussard-2027"
 */
function slugify(value, maxLen = 70) {
  const slug = String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, maxLen);
  return slug;
}

function normalizeWhitespace(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function normalizeName(value) {
  // Strip control characters (they cannot appear in real names) as well.
  return normalizeWhitespace(value).replace(/[\u0000-\u001F\u007F]+/g, "");
}

/**
 * Normalize a sport name to LANIL canonical values.
 * Maps unicode quotes, trims suffixes like " - Men's", " (-GUARD)", etc.
 */
function normalizeSport(value) {
  if (!value) return "";
  let s = normalizeWhitespace(value).replace(/[’']/g, "'");
  s = s.replace(/\s+-.*$/, "");
  s = s.replace(/\(.*$/, "").trim();
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Normalize a position to canonical fragments (e.g. "QB - CB" → ["QB","CB"]).
 */
function normalizePositions(value) {
  if (!value) return [];
  return String(value)
    .split(/[\/,]/)
    .map((p) => normalizeWhitespace(p).replace(/\s+$/, "").trim())
    .filter(Boolean);
}

/**
 * Normalize a parish_city string ("Ouachita Parish / Monroe" → "monroe") so
 * different sources with different formats (or missing the parish name)
 * produce the same dedupe key. Uses the last "/" segment (city/parish name).
 */
function normalizeParish(value) {
  return normalizeWhitespace(value)
    .split("/")
    .pop()
    .trim()
    .toLowerCase();
}

// ────────────────────────────────────────────────────────────────────────────
// Dedupe key (used for both live DB and source-local dedupe)
// ────────────────────────────────────────────────────────────────────────────

/**
 * Stable dedupe key for an athlete row:
 * name | school | sport | parish | grad_year
 */
/**
 * Canonical school key for dedupe: strip common "high school"/suffix noise so
 * "Edna Karr High School" and "Edna Karr" match across sources.
 */
function canonicalSchoolKey(school) {
  let s = slugify(school).toLowerCase();
  s = s.replace(/-high-school$/, "").replace(/-hs$/, "").replace(/-high$/, "").replace(/-academy$/, "").replace(/-prep$/, "");
  return s;
}

function dedupeKey(a) {
  const name = slugify(a.full_name || "").toLowerCase();
  const school = canonicalSchoolKey(a.school_name || a.school_id || "");
  const sport = slugify(a.primary_sport || "").toLowerCase();
  const parish = normalizeParish(a.parish_city || a.parish_id || "");
  const grad = Number(a.grad_year) || 0;
  return [name, school, sport, parish, grad].join("|");
}

// ────────────────────────────────────────────────────────────────────────────
// Protected merge
// ────────────────────────────────────────────────────────────────────────────

function isEmpty(v) {
  if (v === null || v === undefined) return true;
  if (typeof v === "number") return Number.isNaN(v) || v === 0;
  if (typeof v === "string") return v.trim() === "";
  if (Array.isArray(v)) return v.length === 0;
  return false;
}

/**
 * Merge incoming record into existing record, never overwriting existing
 * non-empty values. Returns [merged, changed].
 *
 * Merge rules (protection of verified data):
 *  - For every incoming field: if existing already has a non-empty value,
 *    keep the existing value (even if new value is also non-empty).
 *  - If existing value is empty/null and incoming is non-empty, take incoming.
 *  - Arrays (secondary_sports, potential_colleges, newspaper_mentions):
 *    union with existing items first, new items appended (deduped, sorted).
 */
function mergeAthlete(existing, incoming, opts) {
  const merged = Object.assign({}, existing);
  const changedFields = [];

  for (const key of Object.keys(incoming)) {
    const inc = incoming[key];
    if (inc === undefined) continue;
    const ext = merged[key];
    if (Array.isArray(inc)) {
      const mergedArr = normalizeUnique(ext || []).concat(
        normalizeUnique(inc).filter((v) => !normalizeUnique(ext || []).includes(v))
      );
      if (!arraysEqual(mergedArr, normalizeUnique(ext || []))) {
        merged[key] = mergedArr;
        changedFields.push(key);
      }
    } else {
      if (!isEmpty(ext)) {
        // Never overwrite existing verified data with empty values or
        // override different-but-present values.
        continue;
      }
      if (isEmpty(inc)) continue;
      if (String(ext) !== String(inc)) {
        merged[key] = inc;
        changedFields.push(key);
      }
    }
  }

  if (opts && opts.changedFields) opts.changedFields.push(...changedFields);
  return merged;
}

function normalizeUnique(arr) {
  const seen = new Set();
  const out = [];
  for (const v of arr || []) {
    const key = JSON.stringify(v);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(v);
  }
  return out;
}

function arraysEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

// ────────────────────────────────────────────────────────────────────────────
// Fetching
// ────────────────────────────────────────────────────────────────────────────

const { execSync } = require("child_process");

/**
 * Fetch a URL as text.
 *
 * Tries node https first, then falls back to the system curl (present on
 * Windows 10+, Linux, macOS). lhsaanetwork.com is behind a Cloudflare managed
 * challenge that fingerprint-filters node's https client (403 with the
 * "Checking your browser..." page), while curl passes; the fallback keeps the
 * pipeline working everywhere curl exists.
 */
function fetchText(url, opts) {
  return new Promise((resolve, reject) => {
    // No default browser User-Agent: several sites (e.g. lhsaanetwork.com)
    // fingerprint-block Chrome UAs with 403 challenges, so requests go out
    // with neutral or no User-Agent unless the caller asks for one.
    const headers = Object.assign({}, (opts && opts.headers) || {});
    https
      .get(url, { headers, timeout: TIMEOUT_MS }, (res) => {
        if (res.statusCode !== 200) {
          fetchTextWithCurl(url, headers).then(resolve, reject);
          return;
        }
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(data));
      })
      .on("error", () => fetchTextWithCurl(url, headers).then(resolve, reject))
      .on("timeout", () => fetchTextWithCurl(url, headers).then(resolve, reject));
  });
}

function fetchTextWithCurl(url, headers) {
  return new Promise((resolve, reject) => {
    try {
      let cmd = `curl -sS -m ${Math.floor(TIMEOUT_MS / 1000)} "${url}"`;
      const ua = headers["User-Agent"] || headers["user-agent"];
      if (ua) cmd += ` -A "${String(ua).replace(/"/g, "'")}"`;
      const out = execSync(cmd, { maxBuffer: 64 * 1024 * 1024, encoding: "utf8" });
      if (!out || out.length < 5) {
        reject(new Error(`curl returned empty body for ${url}`));
        return;
      }
      resolve(out);
    } catch (e) {
      reject(e && e.message ? e : new Error(`curl failed for ${url}`));
    }
  });
}

/**
 * Fetch https://lhsaanetwork.com/.../site/athlete-data.js — a public WordPress
 * script that sets `window.LHSAA_ATHLETE_DATA = { athletes: [...] }`.
 * LHSAA_ASSET_BASE is a bare expression in the file; replace it with the
 * absolute URL so the file parses as plain JSON.
 */
async function fetchTextFromJS(url) {
  const raw = await fetchText(url);
  let cleaned = raw;
  // Turn `(window.LHSAA_ASSET_BASE+"path")` (and bare forms) into absolute strings.
  cleaned = cleaned.replace(
    /\(\s*window\.LHSAA_ASSET_BASE\s*\+\s*"([^"]*)"\s*\)/g,
    `"https://lhsaanetwork.com/$1"`
  );
  cleaned = cleaned.replace(
    /window\.LHSAA_ASSET_BASE\s*\+\s*"([^"]*)"/g,
    `"https://lhsaanetwork.com/$1"`
  );
  cleaned = cleaned.replace(/window\.LHSAA_ASSET_BASE\s*\+\s*/g, "");
  const prefix = "window.LHSAA_ATHLETE_DATA = ";
  const prefixIndex = cleaned.indexOf(prefix);
  if (prefixIndex !== -1) {
    cleaned = cleaned.slice(prefixIndex + prefix.length);
  }
  cleaned = cleaned.replace(/;\s*$/, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    throw new Error(`Could not parse JS file as JSON: ${e.message}`);
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Supabase REST helpers
// ────────────────────────────────────────────────────────────────────────────

function supabaseRequest(method, path, body, headers) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const reqHeaders = Object.assign(
      {
        "Content-Type": "application/json",
        "apikey": SERVICE_KEY,
        "Authorization": `Bearer ${SERVICE_KEY}`,
      },
      headers || {}
    );
    if (payload) reqHeaders["Content-Length"] = Buffer.byteLength(payload);
    const req = https.request(
      `${SUPABASE_URL}/rest/v1${path}`,
      { method, headers: reqHeaders, timeout: TIMEOUT_MS },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => resolve({ status: res.statusCode, body: data }));
      }
    );
    req.on("error", reject);
    req.on("timeout", () => req.destroy(new Error(`timeout ${method} ${path}`)));
    if (payload) req.write(payload);
    req.end();
  });
}

function supabaseGet(path, opts) {
  const headers = Object.assign({ Prefer: "return=minimal" }, (opts && opts.headers) || {});
  return supabaseRequest("GET", path, null, headers).then((r) => {
    if (r.status >= 400) {
      throw new Error(`Supabase GET failed (${r.status}): ${r.body.substring(0, 300)}`);
    }
    return r;
  });
}

function supabaseGetRows(path) {
  return supabaseGet(path).then((r) => (r.body ? JSON.parse(r.body) : []));
}

// ────────────────────────────────────────────────────────────────────────────
// Existing-data snapshot for dedupe & protected merge
// ────────────────────────────────────────────────────────────────────────────

const EXISTING_ATHLETE_SELECT = [
  "id", "player_id", "full_name", "slug", "grad_year", "current_grade",
  "school_id", "school_name", "parish_city", "primary_sport",
  "secondary_sports", "position", "season_stats_summary",
  "newspaper_mentions", "social_handles", "total_followers", "est_nil_value",
  "potential_colleges", "headshot_url", "photo_gallery", "bio",
  "hudl_url", "youtube_url", "verified", "tier",
  "source_url", "import_date",
].join(",");

async function fetchExistingAthletes() {
  const select = await existingAthleteSelect();
  const rows = [];
  let offset = 0;
  const pageSize = 500;
  for (;;) {
    const page = await supabaseGetRows(
      `/athletes?select=${encodeURIComponent(select)}&order=player_id&limit=${pageSize}&offset=${offset}`
    );
    if (!Array.isArray(page) || page.length === 0) break;
    rows.push(...page);
    offset += page.length;
    if (offset > 30000) break;
  }
  return rows;
}

// ────────────────────────────────────────────────────────────────────────────
// Adaptive schema introspection (PostgREST OpenAPI)
// ────────────────────────────────────────────────────────────────────────────

// Columns the pipeline reads/writes on `athletes` (core set; new columns in
// migrations: source_url, import_date, division, state, weight_lbs, height_in,
// bio_url, headshot_permission, parish_id).
const ATHLETE_CORE_COLUMNS = [
  "id", "player_id", "full_name", "slug", "grad_year", "current_grade",
  "school_id", "school_name", "parish_city", "primary_sport",
  "secondary_sports", "position", "season_stats_summary",
  "newspaper_mentions", "social_handles", "total_followers", "est_nil_value",
  "potential_colleges", "headshot_url", "photo_gallery", "bio",
  "hudl_url", "youtube_url", "gpa", "claimed", "claimed_by_user_id",
  "claimed_at", "tier", "verified", "parent_consent_verified",
  "last_updated", "created_at",
];

let _tableColumnsCache = null;

async function getTableColumns(table) {
  if (_tableColumnsCache) return _tableColumnsCache.get(table) || null;
  const out = new Map();
  try {
    const r = await supabaseGet("/");
    if (r && r.body) {
      const j = JSON.parse(r.body);
      const defs = j.definitions || j.components?.schemas || {};
      for (const [t, d] of Object.entries(defs)) {
        out.set(t, new Set(d && d.properties ? Object.keys(d.properties) : []));
      }
    }
  } catch (e) {
    logLine(`getTableColumns: could not load schema info: ${e.message}`);
  }
  _tableColumnsCache = out;
  return out.get(table) || null;
}

async function supportsColumn(table, col) {
  const cols = await getTableColumns(table);
  return Boolean(cols && cols.has(col));
}

/**
 * Strip keys that are not columns in the current DB schema (post-migration
 * or pre-migration) — keep DB writes working across both states.
 */
async function sanitizeRow(table, row) {
  const cols = await getTableColumns(table);
  if (!cols) return row;
  const out = {};
  for (const [k, v] of Object.entries(row)) {
    if (cols.has(k)) out[k] = v;
  }
  return out;
}

async function existingAthleteSelect() {
  const cols = await getTableColumns("athletes") || new Set(ATHLETE_CORE_COLUMNS);
  return ATHLETE_CORE_COLUMNS.filter((c) => cols.has(c)).join(",") || "id";
}

// ────────────────────────────────────────────────────────────────────────────
// Schema-aware Supabase helpers
// ────────────────────────────────────────────────────────────────────────────

async function supabasePost(path, rows, onConflict) {
  if (DRY_RUN) {
    logLine(`[dry-run] would POST ${path}${onConflict ? "?on_conflict=" + onConflict : ""} (${rows.length} rows)`);
    return { ok: true, status: 0, body: "", dryRun: true };
  }
  const query = onConflict ? `?on_conflict=${onConflict}` : "";
  const table = path.replace(/[?#].*$/, "").split("/").filter(Boolean).pop() || "";
  const cleanRows = table === "athletes" ? await Promise.all(rows.map((r) => sanitizeRow(table, r))) : rows;
  const resp = await supabaseRequest("POST", `${path}${query}`, cleanRows, {
    Prefer: "resolution=merge-duplicates,return=minimal",
  });
  if (resp.status >= 400) {
    return { ok: false, status: resp.status, body: resp.body };
  }
  return { ok: true, status: resp.status, body: resp.body };
}

async function supabasePatch(path, rows) {
  if (DRY_RUN) {
    logLine(`[dry-run] would PATCH ${path} (${rows.length} rows)`);
    return { ok: true, status: 0, body: "", dryRun: true };
  }
  const table = path.replace(/[?#].*$/, "").split("/").filter(Boolean).pop() || "";
  const cleanRows = table === "athletes" ? await Promise.all(rows.map((r) => sanitizeRow(table, r))) : rows;
  const resp = await supabaseRequest("PATCH", path, cleanRows, {
    Prefer: "return=minimal",
  });
  if (resp.status >= 400) {
    return { ok: false, status: resp.status, body: resp.body };
  }
  return { ok: true, status: resp.status, body: resp.body };
}

function pickExistingRows(existing) {
  const byKey = new Map();
  const byPlayerId = new Map();
  const bySlug = new Map();
  for (const a of existing) {
    const key = dedupeKey(a);
    if (a.player_id && !byPlayerId.has(a.player_id)) byPlayerId.set(a.player_id, a);
    if (a.slug && !bySlug.has(a.slug)) bySlug.set(a.slug, a);
    if (!byKey.has(key)) byKey.set(key, a);
  }
  return { byKey, byPlayerId, bySlug, existing };
}

// ────────────────────────────────────────────────────────────────────────────
// Dry-run-aware writes
// ────────────────────────────────────────────────────────────────────────────

async function writeAthletes(records, onConflict) {
  /**
   * Write records to the athletes table via Supabase REST.
   * Returns { inserted, updated, dryRun, skipped, rejected }.
   * - inserted:  rows POSTed where no existing match
   * - updated:   rows PATCHed where an existing match was merged
   * - skipped:   rows already present with no mergeable change
   * - rejected:  rows that failed validation/HTTP
   * With --dry-run/DRY_RUN, nothing is written; `wouldWrite` counts as inserted/updated.
   */
  const inserted = [];
  const updated = [];
  const skipped = [];
  const rejected = [];

  for (let i = 0; i < records.length; i += 50) {
    const batch = records.slice(i, i + 50);
    for (const rec of batch) {
      if (!rec.full_name || !rec.school_name || !rec.primary_sport) {
        rejected.push(rec);
        continue;
      }
      if (DRY_RUN) {
        inserted.push(rec); // dry-run: would insert
        continue;
      }
      const resp = await supabasePost("/athletes", [rec], onConflict);
      if (!resp.ok) {
        rejected.push(rec);
        console.error(`  [rejected] ${rec.full_name} (${rec.primary_sport}): HTTP ${resp.status} ${(resp.body || "").substring(0, 120)}`);
      } else {
        inserted.push(rec);
      }
    }
    // Note: with an upsert on_conflict, distinguishing "new" from "updated" is
    // done later by diffing the existing snapshot; here we record attempts.
  }

  return { inserted, updated, skipped, rejected };
}

// ────────────────────────────────────────────────────────────────────────────
// Totals reporting
// ────────────────────────────────────────────────────────────────────────────

function createTotals() {
  const totals = {
    _bySource: {},
    bySource(source) {
      const bucket = (this._bySource[source] = this._bySource[source] || {
        new: 0, updated: 0, skipped: 0, rejected: 0,
      });
      return bucket;
    },
    add(source, outcome, sport) {
      const b = this.bySource(source);
      b[outcome]++;
      if (sport) {
        const sb = this.bySource(`${source} / ${sport}`);
        sb[outcome]++;
      }
      return b;
    },
    summary() {
      const lines = [];
      for (const [source, b] of Object.entries(this._bySource)) {
        const total = b.new + b.updated + b.skipped + b.rejected;
        if (total === 0 && source.includes(" / ")) continue;
        lines.push(
          `  ${source}: total=${total} new=${b.new} updated=${b.updated} skipped=${b.skipped} rejected=${b.rejected}`
        );
      }
      return lines.join("\n");
    },
    grandTotal() {
      // Only count source-level buckets (per-sport buckets double-count).
      const g = { new: 0, updated: 0, skipped: 0, rejected: 0 };
      for (const [s, b] of Object.entries(this._bySource)) {
        if (s.includes(" / ")) continue;
        g.new += b.new; g.updated += b.updated; g.skipped += b.skipped; g.rejected += b.rejected;
      }
      return g;
    },
    print(label) {
      const g = this.grandTotal();
      console.log(
        `${label}: total=${g.new + g.updated + g.skipped + g.rejected} ` +
        `new=${g.new} updated=${g.updated} skipped=${g.skipped} rejected=${g.rejected}`
      );
      const parts = Object.entries(this._bySource)
        .filter(([s]) => !s.includes(" / "))
        .map(([s, b]) => `${s} new=${b.new} updated=${b.updated} skipped=${b.skipped} rejected=${b.rejected}`);
      if (parts.length) console.log(parts.map((p) => "  " + p).join("\n"));
      return this;
    },
  };
  return totals;
}

// ────────────────────────────────────────────────────────────────────────────
// CITY → PARISH mapping (LHSAA Parish::PrimarySchool list; from ingest_maxpreps)
// ────────────────────────────────────────────────────────────────────────────

const CITY_TO_PARISH = {
  "monroe": "ouachita", "west monroe": "ouachita", "sterlington": "ouachita",
  "shreveport": "caddo", "vivian": "caddo",
  "bossier city": "bossier", "benton": "bossier", "haughton": "bossier",
  "new orleans": "orleans",
  "baton rouge": "east-baton-rouge", "baker": "east-baton-rouge", "zachary": "east-baton-rouge",
  "lafayette": "lafayette", "carencro": "lafayette", "broussard": "lafayette", "youngsville": "lafayette",
  "lake charles": "calcasieu", "sulphur": "calcasieu", "dequincy": "calcasieu", "westlake": "calcasieu",
  "metairie": "jefferson", "kenner": "jefferson", "marrero": "jefferson", "harvey": "jefferson", "gretna": "jefferson",
  "destrehan": "st-charles", "hahnville": "st-charles", "luling": "st-charles",
  "covington": "st-tammany", "mandeville": "st-tammany", "slidell": "st-tammany",
  "alexandria": "rapides", "pineville": "rapides",
  "ruston": "lincoln", "grambling": "lincoln",
  "thibodaux": "lafourche", "raceland": "lafourche",
  "houma": "terrebonne",
  "new iberia": "iberia",
  "hammond": "tangipahoa", "ponchatoula": "tangipahoa", "amite": "tangipahoa",
  "opelousas": "st-landry", "eunice": "st-landry",
  "denham springs": "livingston", "walker": "livingston",
  "gonzales": "ascension", "donaldsonville": "ascension", "prairieville": "ascension",
  "natchitoches": "natchitoches",
  "bastrop": "morehouse",
  "crowley": "acadia", "rayne": "acadia", "church point": "acadia",
  "bogalusa": "washington", "franklinton": "washington",
  "minden": "webster", "springhill": "webster",
  "deridder": "beauregard",
  "leesville": "vernon",
  "ville platte": "evangeline",
  "marksville": "avoyelles", "bunkie": "avoyelles",
  "plaquemine": "iberville",
  "port allen": "west-baton-rouge",
  "new roads": "pointe-coupee",
  "franklin": "st-mary", "morgan city": "st-mary",
  "chalmette": "st-bernard",
  "lutcher": "st-james", "vacherie": "st-james",
  "reserve": "st-john-the-baptist", "laplace": "st-john-the-baptist",
  "belle chasse": "plaquemines",
  "st. martinville": "st-martin", "breaux bridge": "st-martin",
  "abbeville": "vermilion", "kaplan": "vermilion",
  "arnaudville": "st-landry",
};

function getParishId(city) {
  if (!city) return "ouachita";
  const c = String(city).toLowerCase().trim();
  return CITY_TO_PARISH[c] || "ouachita";
}

// ────────────────────────────────────────────────────────────────────────────
// Misc
// ────────────────────────────────────────────────────────────────────────────

function logLine(...args) {
  console.log(LOG_PREFIX, ...args);
}

function saveDebugLog(name, data) {
  const dir = path.join(REPO_ROOT, "logs");
  try {
    fs.mkdirSync(dir, { recursive: true });
    const f = path.join(dir, `${name}_${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
    fs.writeFileSync(f, JSON.stringify(data, null, 2));
    logLine("Debug log:", f);
  } catch (e) {
    logLine("Could not write debug log:", e.message);
  }
}

module.exports = {
  HOST,
  SUPABASE_URL,
  SERVICE_KEY,
  DRY_RUN,
  UA,
  CITY_TO_PARISH,
  getParishId,
  slugify,
  normalizeWhitespace,
  normalizeName,
  normalizeSport,
  normalizePositions,
  normalizeParish,
  dedupeKey,
  mergeAthlete,
  isEmpty,
  normalizeUnique,
  arraysEqual,
  fetchText,
  fetchTextFromJS,
  supabaseRequest,
  supabaseGet,
  supabaseGetRows,
  supabasePost,
  supabasePatch,
  fetchExistingAthletes,
  pickExistingRows,
  writeAthletes,
  createTotals,
  logLine,
  saveDebugLog,
  EXISTING_ATHLETE_SELECT,
};
