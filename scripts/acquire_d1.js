// scripts/acquire_d1.js — Parse the LHSAA Network athlete data artifact (d1_athletes.json)
// into normalized LANIL athlete records.
const fs = require('fs');
const path = require('path');
const { fetchAll } = require('./db');

const ARTIFACT = 'C:\\Users\\User\\AppData\\Local\\Temp\\opencode\\d1_athletes.json';

function slugify(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

async function main() {
  const d1 = JSON.parse(fs.readFileSync(ARTIFACT, 'utf8'));
  const out = [];
  const seen = new Set();
  for (const a of d1) {
    const key = `${slugify(a.name)}|${slugify(a.highschool || '')}|${slugify(a.sport || '')}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const season = parseInt(a.season, 10) || 2026;
    out.push({
      full_name: a.name,
      sport: a.sport,
      primary_sport: a.sport,
      sport_key: a.sport_key,
      position: a.position || '',
      school_name: a.highschool || '',
      school_id: a.highschool_id ? a.highschool_id : null,
      parish_city: a.state ? `${a.state}` : '',
      grad_year: season + 2,
      current_grade: 'Senior',
      state: a.state,
      bio_url: a.bio_url || '',
      roster_url: a.roster_url || '',
      slug: `${slugify(a.name)}-${slugify(a.highschool || '')}-${slugify(a.sport)}-${season}`,
      player_id: `LNIL-${slugify(a.name)}-${slugify(a.highschool || '')}`,
      verified_at: a.verified_at || null,
      potential_colleges: a.college_official ? [a.college_official] : (a.college ? [a.college] : []),
      season,
      source: 'LHSAA Network (d1_athletes artifact)',
      source_type: 'lhsaa_network_roster',
      source_id: a.id,
    });
  }
  const dataDir = path.join(__dirname, '..', 'data');
  fs.mkdirSync(dataDir, { recursive: true });
  const outFile = path.join(dataDir, 'd1_athletes.json');
  fs.writeFileSync(outFile, JSON.stringify({ source: 'd1_athletes.json artifact', acquired_at: new Date().toISOString(), count: out.length, athletes: out }, null, 2));
  console.log(`d1: parsed ${d1.length} raw -> ${out.length} unique; wrote ${outFile}`);
}

main().catch((e) => { console.error('ACQUIRE D1 ERROR:', e.message); process.exit(1); });
