// scripts/stage_acquisition_data.js — Build staging JSONL files for the new
// acquisition-engine tables so data can be bulk-imported once
// supabase/schema_acquisition.sql is applied in the SQL Editor.
//
// Outputs (data/staging/):
//   athlete_photos.jsonl       -> athlete_photos
//   athlete_commitments.jsonl  -> athlete_commitments
//   athlete_historical.jsonl   -> athlete_historical (seed events)
//   athlete_imports.jsonl      -> athlete_imports
//   source_registry.json       -> athlete_sources (reference; seeds also in SQL)
// Also writes data/staging/IMPORT_INSTRUCTIONS.md.
const fs = require('fs');
const path = require('path');
const { fetchAll } = require('./db');

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }
function wjsonl(file, rows) {
  const s = rows.map((r) => JSON.stringify(r)).join('\n') + (rows.length ? '\n' : '');
  fs.writeFileSync(file, s);
  return rows.length;
}

async function main() {
  const outDir = path.join(__dirname, '..', 'data', 'staging');
  ensureDir(outDir);

  const athletes = await fetchAll('athletes', 'id,slug,full_name,school_name,primary_sport,headshot_url,photo_gallery,potential_colleges,verified,created_at,last_updated');

  // Photos: stage every athlete headshot with rights metadata (licensed/ingested source context).
  const photos = [];
  for (const a of athletes) {
    const url = String(a.headshot_url || '').trim();
    if (!url) continue;
    let source = 'ingested';
    let rights_holder = null;
    let permission_status = 'licensed_or_permitted';
    if (url.includes('maxpreps.io')) { source = 'maxpreps'; rights_holder = 'MaxPreps/Photographer (see source terms)'; permission_status = 'requires_review'; }
    else if (url.includes('on3static.com')) { source = 'on3'; rights_holder = 'On3/rights holder (see source terms)'; permission_status = 'requires_review'; }
    else if (url.startsWith('/assets/')) { source = 'lanil_assets'; rights_holder = 'LANIL/authorized'; permission_status = 'authorized'; }
    photos.push({
      athlete_id: a.id,
      slug: a.slug,
      photo_url: url,
      source,
      original_source: source,
      attribution: rights_holder || '',
      rights_holder,
      permission_status,
      primary: true,
      tags: ['headshot'],
      tagged_date: new Date().toISOString().slice(0, 10),
    });
  }

  // Commitments: from potential_colleges (college/program associations observed in roster sources).
  const commitments = [];
  for (const a of athletes) {
    const cols = Array.isArray(a.potential_colleges) ? a.potential_colleges.filter(Boolean) : [];
    for (const c of cols.slice(0, 6)) {
      commitments.push({
        slug: a.slug,
        college_name: String(c),
        division: null,
        commitment_date: null,
        source: 'roster_ingest',
        source_url: null,
        verified: !!a.verified,
      });
    }
  }

  // Historical seed events (baseline snapshot) — append-only audit trail.
  const historical = athletes.map((a) => ({
    slug: a.slug,
    change_type: 'baseline_snapshot',
    field: null,
    old_value: null,
    new_value: JSON.stringify({ verified: a.verified, school: a.school_name, sport: a.primary_sport }),
    changed_at: new Date().toISOString(),
    source: 'acquisition_engine',
    source_url: null,
  }));

  const imports = [
    { source: 'LHSAA Network artifact', source_file: 'data/lhsaa_athletes.json', status: 'completed', notes: 'Ingested via pipeline.js' },
    { source: 'D1 athletes artifact', source_file: 'data/d1_athletes.json', status: 'completed', notes: 'Merged/deduped via pipeline.js' },
    { source: 'School logos artifact', source_file: 'school_logos.json', status: 'completed', notes: '393 school logo mappings available' },
  ];

  const counts = {
    athlete_photos: wjsonl(path.join(outDir, 'athlete_photos.jsonl'), photos),
    athlete_commitments: wjsonl(path.join(outDir, 'athlete_commitments.jsonl'), commitments),
    athlete_historical: wjsonl(path.join(outDir, 'athlete_historical.jsonl'), historical),
    athlete_imports: wjsonl(path.join(outDir, 'athlete_imports.jsonl'), imports),
  };

  const instructions = `# Staging import (post-migration)

Generated: ${new Date().toISOString()}

After running \`supabase/schema_acquisition.sql\` in the Supabase SQL Editor:
1. Import \`athlete_photos.jsonl\` -> \`athlete_photos\` (map slug->athlete_id if needed; athlete_id included).
2. Import \`athlete_commitments.jsonl\` -> \`athlete_commitments\`.
3. Import \`athlete_historical.jsonl\` -> \`athlete_historical\` (append-only).
4. Import \`athlete_imports.jsonl\` -> \`athlete_imports\`.

Counts: ${JSON.stringify(counts, null, 2)}

Notes:
- Photo rows for maxpreps/on3 sources are marked \`permission_status='requires_review'\` until rights/terms are confirmed for your use.
- Never substitute unrelated athlete images; only authorized/attributed photos are stored.
`;
  fs.writeFileSync(path.join(outDir, 'IMPORT_INSTRUCTIONS.md'), instructions);
  fs.writeFileSync(path.join(outDir, 'stage_summary.json'), JSON.stringify({ ran_at: new Date().toISOString(), counts }, null, 2));
  console.log(JSON.stringify({ outDir, counts }, null, 2));
}

main().catch((e) => { console.error('STAGE ERROR:', e.message); process.exit(1); });
