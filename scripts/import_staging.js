// scripts/import_staging.js — Import staged acquisition-engine data after
// supabase/schema_acquisition.sql has been applied in the Supabase SQL Editor.
// Safe to re-run (best-effort; skips rows the API rejects as duplicates).
const fs = require('fs');
const path = require('path');
const { rest } = require('./db');

function readJsonl(file) {
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean).map((l) => JSON.parse(l));
}

async function postMany(table, rows, batchSize = 200) {
  let ok = 0, fail = 0;
  for (let i = 0; i < rows.length; i += batchSize) {
    const chunk = rows.slice(i, i + batchSize);
    try {
      await rest(table, { method: 'POST', body: chunk, prefer: 'resolution=ignore-duplicates,return=minimal' });
      ok += chunk.length;
    } catch (e) {
      // fallback row-by-row
      for (const row of chunk) {
        try { await rest(table, { method: 'POST', body: row, prefer: 'return=minimal' }); ok++; }
        catch { fail++; }
      }
    }
  }
  return { ok, fail, total: rows.length };
}

async function main() {
  const dir = path.join(__dirname, '..', 'data', 'staging');
  const files = {
    athlete_photos: readJsonl(path.join(dir, 'athlete_photos.jsonl')).map(({ slug, ...r }) => r),
    athlete_commitments: readJsonl(path.join(dir, 'athlete_commitments.jsonl')),
    athlete_historical: readJsonl(path.join(dir, 'athlete_historical.jsonl')),
    athlete_imports: readJsonl(path.join(dir, 'athlete_imports.jsonl')),
  };

  // Quick probe: do tables exist?
  try {
    await rest('athlete_photos', { select: 'id', limit: 1 });
  } catch (e) {
    console.error('Tables not available yet. Run supabase/schema_acquisition.sql in Supabase SQL Editor first.');
    console.error('Probe error:', e.message.slice(0, 160));
    process.exit(2);
  }

  const results = {};
  for (const [table, rows] of Object.entries(files)) {
    results[table] = await postMany(table, rows);
    console.log(table, results[table]);
  }
  fs.writeFileSync(path.join(dir, 'import_results.json'), JSON.stringify({ ran_at: new Date().toISOString(), results }, null, 2));
  console.log('done', JSON.stringify(results));
}

main().catch((e) => { console.error('IMPORT ERROR:', e.message); process.exit(1); });
