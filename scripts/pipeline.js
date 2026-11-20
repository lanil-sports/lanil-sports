// scripts/pipeline.js — Athlete Power Data Acquisition Engine (LANIL Sports).
// Merges discovered sources, dedups against the existing DB, upserts via PostgREST,
// verifies, and writes an acquisition history log + summary.
// Does NOT delete existing athletes.
const fs = require('fs');
const path = require('path');
const { rest, fetchAll } = require('./db');

function slugify(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }

function logDirFallback() {
  const d = path.join(__dirname, '..', 'logs', 'acquire');
  return d;
}

function loadSources() {
  const srcs = [];
  const dataDir = path.join(__dirname, '..', 'data');
  for (const f of fs.readdirSync(dataDir).filter((f) => f.endsWith('.json')).sort()) {
    const raw = JSON.parse(fs.readFileSync(path.join(dataDir, f), 'utf8'));
    if (Array.isArray(raw.athletes)) srcs.push({ file: f, source: raw.source || f, athletes: raw.athletes });
  }
  return srcs;
}

function uniqSlug(dbSlugs, slug) {
  let s = slug; let n = 2;
  while (dbSlugs.has(s)) { s = `${slug}-${n}`; n += 1; }
  return s;
}

async function verifyBio(url, timeoutMs = 4000) {
  if (!url) return { verified: false, note: 'no url' };
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs), redirect: 'follow' });
    if (res.status >= 200 && res.status < 400) {
      const txt = await res.text().catch(() => '');
      const looksLikeBio = !txt || txt.length > 20 || /name|class|grade|season/i.test(txt.slice(0, 400));
      return { verified: true, note: looksLikeBio ? `HTTP ${res.status}, content ${txt.length}b` : `HTTP ${res.status}, thin content` };
    }
    return { verified: false, note: `HTTP ${res.status}` };
  } catch (e) {
    return { verified: false, note: 'fetch failed: ' + (e.cause?.code || e.message) };
  }
}

async function main() {
  const runId = `run-${Date.now()}`;
  const ts = () => new Date().toISOString();
  const logLines = [];
  const summary = { run_id: runId, started_at: ts(), sources: [], discovered: 0, inserted: 0, updated: 0, verified: 0, verification_failed: 0, insert_failed: 0, update_failed: 0 };
  const newlyInserted = [];
  let processed = 0;

  // New fact columns only exist once supabase/schema_acquisition.sql is applied.
  let haveNewCols = true;
  try { await rest('athletes', { select: 'source_name', limit: 1 }); } catch { haveNewCols = false; }
  const stripNewCols = (obj) => { if (!haveNewCols) { for (const k of ['source_name','source_url','jersey_number','height_in','weight_lb','verified_at']) delete obj[k]; } return obj; };

  // --- Load DB state ---
  const athleteSelect = ['id','player_id','full_name','slug','grad_year','current_grade','school_name','parish_city','primary_sport','position','bio','hudl_url','claimed','verified','tier','last_updated', ...(haveNewCols ? ['source_name','source_url','jersey_number','height_in','weight_lb'] : [])].join(',');
  const dbAthletes = await fetchAll('athletes', athleteSelect);
  const dbBySlug = new Map();
  const dbByKey = new Map();
  for (const a of dbAthletes) {
    if (a.slug) dbBySlug.set(a.slug.toLowerCase(), a);
    dbByKey.set(`${slugify(a.full_name)}|${slugify(a.school_name)}|${slugify(a.primary_sport)}`, a);
  }
  const usedSlugs = new Set([...dbBySlug.keys()]);

  // --- Load sources ---
  const sources = loadSources();
  for (const s of sources) {
    summary.sources.push({ file: s.file, source: s.source, count: s.athletes.length });
  }

  // --- Merge + dedup ---
  const seenKeys = new Set();
  const merged = [];
  for (const s of sources) {
    for (const a of s.athletes) {
      const key = `${slugify(a.full_name)}|${slugify(a.school_name)}|${slugify(a.primary_sport)}`;
      if (seenKeys.has(key)) continue;
      seenKeys.add(key);
      merged.push({ ...a, __source: s.source });
    }
  }
  summary.discovered = merged.length;

  // Incremental progress log (synchronous — survives crashes).
  const progFile = path.join(logDirFallback(), 'progress.jsonl');
  fs.mkdirSync(path.dirname(progFile), { recursive: true });
  const prog = (o) => fs.appendFileSync(progFile, JSON.stringify({ ts: ts(), run_id: runId, ...o }) + '\n');
  process.on('exit', (code) => { try { prog({ event: 'exit', code }); } catch {} });
  process.on('uncaughtException', (e) => { try { prog({ event: 'uncaught', error: e.message }); } catch {} });

  // --- Upsert each ---
  for (const a of merged) {
    const source = a.__source || a.source || 'unknown';
    try {
    const key = `${slugify(a.full_name)}|${slugify(a.school_name)}|${slugify(a.primary_sport)}`;
    const dbMatch = dbBySlug.get(slugify(a.slug)) || dbByKey.get(key);
    const newSlug = dbMatch ? (dbMatch.slug || slugify(a.slug)) : uniqSlug(usedSlugs, a.slug || `${slugify(a.full_name)}-${slugify(a.school_name)}-${slugify(a.sport || a.primary_sport)}`);
    const newPlayerId = a.player_id || `LNIL-${newSlug}`;

    const updatePayload = stripNewCols({});
    if (a.position) updatePayload.position = a.position;
    if (a.bio) updatePayload.bio = a.bio;
    if (a.bio_url) updatePayload.hudl_url = a.bio_url;
    if (source) updatePayload.source_name = source;
    if (a.jersey_number) updatePayload.jersey_number = a.jersey_number;
    if (a.height_in) updatePayload.height_in = a.height_in;
    if (a.weight_lb) updatePayload.weight_lb = a.weight_lb;
    if (a.verified_at) { updatePayload.verified_at = a.verified_at; updatePayload.verified = true; }
    if (a.potential_colleges && a.potential_colleges.length) updatePayload.potential_colleges = a.potential_colleges;
    if (a.grad_year) updatePayload.grad_year = a.grad_year;
    if (a.verified_at) updatePayload.verified = true;
    updatePayload.last_updated = new Date().toISOString().slice(0, 10);
    stripNewCols(updatePayload);

    if (dbMatch) {
      const oldValues = { position: dbMatch.position, bio: dbMatch.bio, grad_year: dbMatch.grad_year, verified: dbMatch.verified };
      const resp = await rest('athletes', { method: 'PATCH', where: { slug: dbMatch.slug }, body: updatePayload, prefer: 'return=minimal' });
      summary.updated += 1;
      logLines.push({ run_id: runId, ts: ts(), event: 'update', source, slug: newSlug, athlete_key: `${slugify(a.full_name)}|${slugify(a.school_name)}|${slugify(a.primary_sport)}`, old_values: oldValues, new_values: updatePayload });
      // refresh index
      dbBySlug.set(newSlug.toLowerCase(), { ...dbMatch, ...updatePayload, slug: newSlug });
      usedSlugs.add(newSlug.toLowerCase());
    } else {
      const insertRow = stripNewCols({
        player_id: newPlayerId,
        full_name: a.full_name,
        slug: newSlug,
        grad_year: a.grad_year || 2027,
        current_grade: a.current_grade || 'Senior',
        school_name: a.school_name,
        parish_city: a.parish_city || '',
        primary_sport: a.primary_sport || a.sport,
        position: a.position || '',
        bio: a.bio || '',
        hudl_url: a.bio_url || null,
        source_name: source,
        source_url: a.bio_url || a.roster_url || null,
        jersey_number: a.jersey_number || null,
        height_in: a.height_in || null,
        weight_lb: a.weight_lb || null,
        claimed: false,
        verified: false,
        tier: 'free',
        last_updated: new Date().toISOString().slice(0, 10),
        created_at: new Date().toISOString(),
      });
      try {
        await rest('athletes', { method: 'POST', body: insertRow });
        summary.inserted += 1;
        logLines.push({ run_id: runId, ts: ts(), event: 'insert', source, slug: newSlug, athlete_key: `${slugify(a.full_name)}|${slugify(a.school_name)}|${slugify(a.primary_sport)}`, new_values: insertRow });
        usedSlugs.add(newSlug.toLowerCase());
        dbBySlug.set(newSlug.toLowerCase(), insertRow);
        if (a.bio_url) newlyInserted.push({ slug: newSlug, bio_url: a.bio_url, athlete_key: `${slugify(a.full_name)}|${slugify(a.school_name)}|${slugify(a.primary_sport)}` });
      } catch (e) {
        // Fallback: athlete may already exist under a different slug but the same player_id.
        let recovered = false;
        if (a.player_id && /already exists/.test(e.message)) {
          try {
            const existing = await rest('athletes', { select: 'id,slug', where: { player_id: a.player_id }, limit: 1 });
            if (existing.length) {
              await rest('athletes', { method: 'PATCH', where: { slug: existing[0].slug }, body: updatePayload, prefer: 'return=minimal' });
              summary.updated += 1;
              logLines.push({ run_id: runId, ts: ts(), event: 'update_via_player_id', source, slug: existing[0].slug, athlete_key: `${slugify(a.full_name)}|${slugify(a.school_name)}|${slugify(a.primary_sport)}`, new_values: updatePayload });
              usedSlugs.add(existing[0].slug.toLowerCase());
              recovered = true;
            }
          } catch { /* ignore — fall through to error path */ }
        }
        if (!recovered) {
          summary.insert_failed += 1;
          logLines.push({ run_id: runId, ts: ts(), event: 'insert_failed', source, slug: newSlug, athlete_key: `${slugify(a.full_name)}|${slugify(a.school_name)}|${slugify(a.primary_sport)}`, error: e.message.slice(0, 300) });
        }
      }
    }

      processed += 1;
      if (processed % 100 === 0) console.log(`  progress: ${processed}/${summary.discovered}`);
      prog({ event: 'record', processed, total: merged.length, slug: newSlug });
    } catch (e) {
      summary.insert_failed += 1;
      prog({ event: 'record_error', slug: a.slug, error: e.message });
      logLines.push({ run_id: runId, ts: ts(), event: 'error', slug: a.slug, error: e.message.slice(0, 300) });
      processed += 1;
      if (processed % 100 === 0) console.log(`  progress: ${processed}/${summary.discovered}`);
    }
  }

  // --- Verification (newly inserted only, to keep runs fast) ---
  for (const ins of newlyInserted) {
    const v = await verifyBio(ins.bio_url);
    summary.verified += v.verified ? 1 : 0;
    summary.verification_failed += v.verified ? 0 : 1;
    logLines.push({ run_id: runId, ts: ts(), event: 'verification', source: 'insert_verify', slug: ins.slug, athlete_key: ins.athlete_key, bio_url: ins.bio_url, verified: v.verified, note: v.note });
    if (v.verified) {
      await rest('athletes', { method: 'PATCH', where: { slug: ins.slug }, body: { verified: true, last_updated: new Date().toISOString().slice(0, 10) }, prefer: 'return=minimal' }).catch(() => {});
    }
  }

  // --- Write logs ---
  const logDir = path.join(__dirname, '..', 'logs', 'acquire');
  fs.mkdirSync(logDir, { recursive: true });
  const logFile = path.join(logDir, `acquire_log_${new Date().toISOString().slice(0, 10)}.jsonl`);
  fs.appendFileSync(logFile, logLines.map((l) => JSON.stringify(l)).join('\n') + '\n');
  summary.ended_at = ts();
  summary.events = logLines.length;
  const sumFile = path.join(__dirname, '..', 'data', `pipeline_summary_${new Date().toISOString().slice(0, 10)}.json`);
  fs.writeFileSync(sumFile, JSON.stringify(summary, null, 2));

  console.log('pipeline summary:');
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((e) => { console.error('PIPELINE ERROR:', e.message); process.exit(1); });
