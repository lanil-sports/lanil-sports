// scripts/fix_athlete_data.js — Data quality fixes against existing `athletes` table.
// - Correct current_grade to match grad_year (2026-2032 mapping)
// - Backfill missing season_stats_summary with a derived, labeled summary (no invented game stats)
// - Normalize state-only parish_city values where they are just a 2-letter code
// Never deletes rows.
const { rest, fetchAll } = require('./db');

const GRADE_FOR_YEAR = {
  2026: 'Senior', 2027: 'Senior', 2028: 'Junior', 2029: 'Sophomore', 2030: 'Freshman', 2031: '8th Grade', 2032: '7th Grade',
};

function derivedSummary(a) {
  const parts = [];
  if (a.position) parts.push(a.position);
  if (a.primary_sport) parts.push(a.primary_sport);
  if (a.school_name) parts.push(`@ ${a.school_name}`);
  if (a.grad_year) parts.push(`Class of ${a.grad_year}`);
  const colleges = Array.isArray(a.potential_colleges) ? a.potential_colleges.filter(Boolean) : [];
  if (colleges.length) parts.push(`College/Program: ${colleges[0]}`);
  if (!parts.length) return '';
  return parts.join(' • ');
}

async function main() {
  const athletes = await fetchAll('athletes', 'id,slug,full_name,school_name,parish_city,grad_year,current_grade,primary_sport,position,season_stats_summary,potential_colleges,verified,headshot_url');
  let gradeFixed = 0, summaryFilled = 0, parishNorm = 0, failed = 0;

  for (const a of athletes) {
    const patch = {};
    const expected = GRADE_FOR_YEAR[a.grad_year];
    if (expected && a.current_grade !== expected) {
      patch.current_grade = expected;
    }
    const summary = String(a.season_stats_summary || '').trim();
    if (!summary) {
      const d = derivedSummary(a);
      if (d) patch.season_stats_summary = d;
    }
    const pc = String(a.parish_city || '').trim();
    if (/^[A-Z]{2}$/.test(pc)) {
      // State-only placeholder from roster artifacts; clear so UI doesn't show a bare state code as parish/city.
      patch.parish_city = '';
    }

    if (Object.keys(patch).length === 0) continue;
    try {
      await rest('athletes', { method: 'PATCH', where: { id: a.id }, body: patch, prefer: 'return=minimal' });
      if (patch.current_grade) gradeFixed += 1;
      if (patch.season_stats_summary) summaryFilled += 1;
      if (Object.prototype.hasOwnProperty.call(patch, 'parish_city')) parishNorm += 1;
    } catch (e) {
      failed += 1;
      if (failed <= 3) console.warn('patch failed', a.slug, e.message.slice(0, 120));
    }
  }

  const out = { ran_at: new Date().toISOString(), total: athletes.length, gradeFixed, summaryFilled, parishNorm, failed };
  require('fs').writeFileSync(require('path').join(__dirname, '..', 'data', 'fix_athlete_data_summary.json'), JSON.stringify(out, null, 2));
  console.log(JSON.stringify(out, null, 2));
}

main().catch((e) => { console.error('FIX ERROR:', e.message); process.exit(1); });
