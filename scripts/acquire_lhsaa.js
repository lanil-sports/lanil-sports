// scripts/acquire_lhsaa.js — Parse the LHSAA Network athlete data artifact
// (window.LHSAA_ATHLETE_DATA, previously crawled) into normalized LANIL athlete records.
const fs = require('fs');
const path = require('path');
const { fetchAll } = require('./db');

const ARTIFACT = 'C:\\Users\\User\\AppData\\Local\\Temp\\opencode\\athlete_data.js';

function parseLHSAA(file) {
  let raw = fs.readFileSync(file, 'utf8').trim();
  const prefix = 'window.LHSAA_ATHLETE_DATA = ';
  if (!raw.startsWith(prefix)) throw new Error('bad prefix: ' + raw.slice(0, 80));
  raw = raw.slice(prefix.length);
  raw = raw.replace(/\(window\.LHSAA_ASSET_BASE\s*\+\s*"([^"]*)"\)/g, '"$1"');
  raw = raw.replace(/\(window\.LHSAA_ASSET_BASE\s*\+\s*'([^']*)'\s*\)/g, '"$1"');
  raw = raw.replace(/window\.LHSAA_ASSET_BASE\s*\+\s*/g, '');
  raw = raw.replace(/;\s*$/, '');
  return JSON.parse(raw).athletes;
}

function slugify(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

async function main() {
  const dbSchools = await fetchAll('schools', 'id,name,parish_id,city', 500);
  const schoolByName = new Map();
  for (const s of dbSchools) schoolByName.set(slugify(s.name), s);

  const raw = parseLHSAA(ARTIFACT);
  const out = [];
  const seen = new Set();
  for (const a of raw) {
    const schoolName = (a.highschool || '').trim();
    const school = schoolByName.get(slugify(schoolName)) || null;
    const city = (a.state === 'LA' || schoolName.toLowerCase().includes('louisiana')) ? (school ? `${(school.city || '').trim()}` : '') : '';
    const parishCity = school && school.city ? `${(school.city || '').trim()} / ${(school.name || '').replace(/^(St\. )?(Mount )?/, '')}`.trim() : city;
    const season = parseInt(a.season, 10) || 2026;
    const key = `${slugify(a.name)}|${slugify(schoolName)}|${slugify(a.sport)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const slug = `${slugify(a.name)}-${slugify(schoolName)}-${slugify(a.sport)}-${season}`;
    const colleges = [];
    if (a.college_official) colleges.push(a.college_official);
    if (a.college && !colleges.includes(a.college)) colleges.push(a.college);
    out.push({
      full_name: a.name,
      sport: a.sport,
      primary_sport: a.sport,
      sport_key: a.sport_key,
      position: a.position || '',
      school_name: schoolName,
      school_id: school ? school.id : null,
      parish_city: parishCity,
      grad_year: season + 2, // LHSAA "season" rosters: estimate graduation (logged as estimate)
      current_grade: 'Senior',
      state: a.state,
      bio_url: a.bio_url || '',
      roster_url: a.roster_url || '',
      slug,
      player_id: `LNIL-${slug}`,
      verified_at: a.verified_at || null,
      potential_colleges: colleges,
      season: season,
      source: 'LHSAA Network',
      source_type: 'lhsaa_network_roster',
      source_id: a.highschool_id || null,
      note: 'grad_year is an estimate (season + 2); no class year in LHSAA roster data',
    });
  }
  const dataDir = path.join(__dirname, '..', 'data');
  fs.mkdirSync(dataDir, { recursive: true });
  const outFile = path.join(dataDir, 'lhsaa_athletes.json');
  fs.writeFileSync(outFile, JSON.stringify({ source: 'window.LHSAA_ATHLETE_DATA artifact', acquired_at: new Date().toISOString(), count: out.length, schools_mapped: schoolByName.size, athletes: out }, null, 2));
  console.log(`lhsaa: parsed ${raw.length} raw athletes -> ${out.length} unique; schools matched: ${schoolByName.size}; wrote ${outFile}`);
}

main().catch((e) => { console.error('ACQUIRE LHSAA ERROR:', e.message); process.exit(1); });
