"use strict";

/**
 * One-time cleanup of pre-existing duplicate athlete rows.
 *
 * Groups athletes by name + canonical school + sport (grad year is validated,
 * not used for grouping, so rows with a missing year still merge). For every
 * group, the richest / most-verified row is kept, empty fields are filled from
 * its duplicates, and the redundant rows are deleted.
 *
 * Usage:
 *   node scripts/cleanup_duplicate_athletes.js            # dry-run (no writes)
 *   node scripts/cleanup_duplicate_athletes.js --apply     # merge + delete
 */

const fs = require("fs");
const path = require("path");
const lib = require("./ingest_lib");

const APPLY = process.argv.includes("--apply");

function schoolKey(s) {
  return lib.slugify(s || "").replace(/-(high-school|hs|high|academy|prep)$/, "");
}

function groupKey(a) {
  return [lib.slugify(a.full_name || ""), schoolKey(a.school_name || a.school_id), lib.slugify(a.primary_sport || "")].join("|");
}

function score(r) {
  let s = 0;
  if (r.verified === true) s += 100;
  if (r.claimed === true) s += 80;
  if (!lib.isEmpty(r.headshot_url)) s += 40;
  if (r.parent_consent_verified === true) s += 20;
  if (Number(r.est_nil_value) > 0) s += 30;
  if (!lib.isEmpty(r.bio)) s += 12;
  if (!lib.isEmpty(r.season_stats_summary)) s += 8;
  if (Array.isArray(r.potential_colleges) && r.potential_colleges.length) s += 5;
  if (!lib.isEmpty(r.hudl_url)) s += 4;
  if (String(r.player_id || "").startsWith("LANIL-")) s += 10;
  return s;
}

const IMMUTABLE = new Set(["id", "player_id", "slug", "created_at", "last_updated"]);

function mergedPatch(winner, losers) {
  const patch = {};
  for (const loser of losers) {
    for (const [k, v] of Object.entries(loser)) {
      if (IMMUTABLE.has(k) || v === undefined || v === null) continue;
      if (Array.isArray(v)) {
        const cur = Array.isArray(winner[k]) ? winner[k] : [];
        const combined = lib.normalizeUnique(cur.concat(lib.normalizeUnique(v)));
        if (JSON.stringify(combined) !== JSON.stringify(cur)) {
          patch[k] = combined;
          winner[k] = combined;
        }
      } else if (lib.isEmpty(winner[k]) && !lib.isEmpty(v)) {
        patch[k] = v;
        winner[k] = v;
      }
    }
  }
  return patch;
}

async function fetchAll() {
  const out = [];
  let offset = 0;
  for (;;) {
    const page = await lib.supabaseGetRows(`/athletes?select=*&order=id&limit=1000&offset=${offset}`);
    if (!Array.isArray(page) || page.length === 0) break;
    out.push(...page);
    offset += page.length;
    if (offset > 50000) break;
  }
  return out;
}

async function main() {
  lib.logLine(APPLY ? "=== APPLY MODE ===" : "=== DRY RUN (no writes) ===");
  const rows = await fetchAll();
  lib.logLine(`Loaded ${rows.length} athletes.`);

  const groups = new Map();
  for (const r of rows) {
    const k = groupKey(r);
    if (!k || k === "|||") continue;
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(r);
  }

  let dupGroups = 0, deleteCount = 0, patches = 0, ambiguous = 0;
  const operations = [];
  function processGroup(groupKeyName, members) {
    if (members.length < 2) return;
    dupGroups++;
    const ranked = members.slice().sort((a, b) => score(b) - score(a));
    const winner = Object.assign({}, ranked[0]);
    const losers = ranked.slice(1);
    const patch = mergedPatch(winner, losers);
    if (Object.keys(patch).length) patches++;
    deleteCount += losers.length;
    operations.push({ key: groupKeyName, winnerId: winner.id, winnerPid: winner.player_id, patch, losers: losers.map((l) => ({ id: l.id, pid: l.player_id, name: l.full_name })) });
  }
  for (const [key, members] of groups) {
    if (members.length < 2) continue;
    const years = new Set(members.map((m) => Number(m.grad_year) || 0));
    if (years.size > 1) {
      // Different grad years = different people. Split by year and dedupe
      // within each year instead of skipping the whole group.
      const byYear = new Map();
      for (const m of members) {
        const y = Number(m.grad_year) || 0;
        if (!byYear.has(y)) byYear.set(y, []);
        byYear.get(y).push(m);
      }
      lib.logLine(`  [split-by-year] ${key}: ${[...years].join(",")}`);
      for (const [y, sub] of byYear) processGroup(`${key}|grad-${y}`, sub);
      continue;
    }
    processGroup(key, members);
  }

  lib.logLine(`Duplicate groups: ${dupGroups}; rows to delete: ${deleteCount}; winners needing field merge: ${patches}; ambiguous groups skipped: ${ambiguous}`);
  for (const op of operations.slice(0, 12)) {
    lib.logLine(`  ${op.key}: keep ${op.winnerPid}, drop ${op.losers.map((l) => l.pid).join(", ")}${Object.keys(op.patch).length ? " (fills " + Object.keys(op.patch).join(",") + ")" : ""}`);
  }
  if (operations.length > 12) lib.logLine(`  ... ${operations.length - 12} more groups`);

  // Backup the exact rows that will be removed.
  const backupPath = path.join(__dirname, "..", "logs", `dedupe_backup_${Date.now()}.json`);
  try {
    fs.mkdirSync(path.dirname(backupPath), { recursive: true });
    fs.writeFileSync(backupPath, JSON.stringify(operations, null, 2), "utf8");
    lib.logLine(`Backup written: ${backupPath}`);
  } catch (e) {
    lib.logLine(`Backup FAILED (aborting): ${e.message}`);
    process.exit(1);
  }

  if (!APPLY) {
    lib.logLine("Dry run complete — nothing was written. Re-run with --apply to execute.");
    return;
  }

  let ok = 0, failed = 0;
  for (const op of operations) {
    try {
      if (Object.keys(op.patch).length) {
        const r = await lib.supabasePatch(`/athletes?id=eq.${op.winnerId}`, [op.patch]);
        if (!r.ok) throw new Error(`PATCH ${r.status} ${String(r.body).substring(0, 120)}`);
      }
      for (const loser of op.losers) {
        const r = await lib.supabaseRequest("DELETE", `/athletes?id=eq.${loser.id}`, null, {
          Prefer: "return=minimal",
        });
        if (r.status >= 400) throw new Error(`DELETE ${loser.pid}: ${r.status} ${String(r.body).substring(0, 120)}`);
        ok++;
      }
    } catch (e) {
      failed++;
      lib.logLine(`  [failed] ${op.key}: ${e.message}`);
    }
  }
  lib.logLine(`Done. deleted=${ok} failed_groups=${failed}`);
}

main().catch((e) => {
  console.error("Cleanup error:", e.stack || e.message);
  process.exit(1);
});
