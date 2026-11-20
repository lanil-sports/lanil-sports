// scripts/metrics_report.js — Success metrics for the LANIL Sports Athlete Power
// Data Acquisition Engine. Reads the DB and acquisition logs, prints a report.
const path = require('path');
const fs = require('fs');
const { fetchAll } = require('./db');

function slugify(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }

function groupBy(rows, keyFn) {
  const m = new Map();
  for (const r of rows) { const k = keyFn(r); m.set(k, (m.get(k) || 0) + 1); }
  return m;
}

async function main() {
  const athletes = await fetchAll('athletes', 'id,full_name,school_name,parish_city,primary_sport,verified,headshot_url,claimed,potential_colleges,season_stats_summary,hudl_url,created_at,last_updated');

  const total = athletes.length;
  const verified = athletes.filter((a) => a.verified).length;
  const withPhoto = athletes.filter((a) => a.headshot_url && String(a.headshot_url).length > 0).length;
  const withCollege = athletes.filter((a) => Array.isArray(a.potential_colleges) && a.potential_colleges.length).length;
  const claimed = athletes.filter((a) => a.claimed).length;
  const withStats = athletes.filter((a) => a.season_stats_summary && String(a.season_stats_summary).trim()).length;

  const schools = groupBy(athletes, (a) => a.school_name || 'Unknown');
  const sports = groupBy(athletes, (a) => a.primary_sport || 'Unknown');
  const parishes = groupBy(athletes, (a) => {
    const pc = a.parish_city || '';
    return pc.split(' / ')[0] || 'Unknown';
  });
  const cities = groupBy(athletes, (a) => { const pc = a.parish_city || ''; return pc.split(' / ')[1] || 'Unknown'; });

  // college athletes = athletes with college commitments (potential_colleges or FBS+ college data)
  const collegeAthletes = athletes.filter((a) => Array.isArray(a.potential_colleges) && a.potential_colleges.length >= 1).length;

  // acquisition runs since session start (today)
  const today = new Date().toISOString().slice(0, 10);
  const sumFiles = fs.existsSync(path.join(__dirname, '..', 'data')) ? fs.readdirSync(path.join(__dirname, '..', 'data')).filter((f) => f.startsWith('pipeline_summary_')) : [];
  let newThisWeek = 0;
  for (const f of sumFiles) {
    try {
      const s = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', f), 'utf8'));
      if (s.inserted) newThisWeek += s.inserted;
    } catch { /* skip */ }
  }

  const report = {
    generated_at: new Date().toISOString(),
    metrics: {
      total_athletes_in_db: total,
      total_discovered_today: newThisWeek,
      verified_profiles: verified,
      unverified_profiles: total - verified,
      verified_percent: total ? Math.round((verified / total) * 10000) / 100 : 0,
      available_athlete_photographs: withPhoto,
      college_athletes: collegeAthletes,
      profiles_claimed: claimed,
      with_stats_summary: withStats,
    },
    by_school: Object.fromEntries([...schools.entries()].sort((a, b) => b[1] - a[1])),
    by_sport: Object.fromEntries([...sports.entries()].sort((a, b) => b[1] - a[1])),
    by_parish: Object.fromEntries([...parishes.entries()].sort((a, b) => b[1] - a[1])),
    by_city: Object.fromEntries([...cities.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20)),
    sample_verified_athletes: athletes.filter((a) => a.verified).slice(0, 5).map((a) => ({ full_name: a.full_name, school_name: a.school_name, primary_sport: a.primary_sport })),
  };

  const outFile = path.join(__dirname, '..', 'data', `metrics_report_${today}.json`);
  fs.writeFileSync(outFile, JSON.stringify(report, null, 2));
  console.log('=== LANIL Sports — Success Metrics (' + today + ') ===');
  console.log(JSON.stringify(report.metrics, null, 2));
  console.log('by_school:', Object.keys(report.by_school).length, 'schools');
  console.log('top sports:', Object.entries(report.by_sport).sort((a, b) => b[1] - a[1]).slice(0, 10).map((e) => e.join(':')).join(' '));
  console.log('report:', outFile);
}

main().catch((e) => { console.error('METRICS ERROR:', e.message); process.exit(1); });
