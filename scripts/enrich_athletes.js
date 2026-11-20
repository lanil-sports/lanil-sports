// scripts/enrich_athletes.js — Link every athlete to a school row, and create
// missing schools so the Directory / school pages and school-logo lookups work.
//
// Rules:
//  - NEVER deletes athletes or schools.
//  - Only inserts missing schools and patches NULL school_id values.
const { rest, fetchAll } = require('./db');

function slugify(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
}

function norm(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
}

async function main() {
  const [athletes, schools, parishes] = await Promise.all([
    fetchAll('athletes', 'id,slug,full_name,school_name,school_id,parish_city,primary_sport'),
    fetchAll('schools', 'id,name,city,classification,parish_id'),
    fetchAll('parishes', 'id,name'),
  ]);

  const parishIds = new Set(parishes.map((p) => p.id));

  // Index existing schools by normalized name and normalized id.
  const byName = new Map();
  const byId = new Map();
  for (const s of schools) {
    byName.set(norm(s.name), s);
    byId.set(String(s.id).toLowerCase(), s);
  }

  // Distinct athlete school names that have no matching school row.
  const needed = new Map(); // key -> { name, count, city }
  for (const a of athletes) {
    const name = (a.school_name || '').trim();
    if (!name) continue;
    const key = norm(name);
    if (byName.has(key)) continue;
    if (!needed.has(key)) {
      const city = String(a.parish_city || '').split('/')[0].trim();
      needed.set(key, { name, count: 0, city });
    }
    needed.get(key).count += 1;
  }

  console.log(`athletes=${athletes.length} schools=${schools.length} missing_school_names=${needed.size}`);

  // Insert missing schools (classification is NOT NULL in the existing schema).
  const inserted = [];
  for (const [, info] of needed) {
    let id = slugify(info.name) || 'school';
    let n = 2;
    while (byId.has(id)) id = `${slugify(info.name)}-${n++}`;
    const row = {
      id,
      name: info.name,
      city: info.city || null,
      parish_id: parishIds.has(slugify(info.city)) ? slugify(info.city) : null,
      classification: 'Unclassified',
      lhsaa_member: true,
    };
    try {
      await rest('schools', { method: 'POST', body: row, prefer: 'return=minimal' });
      byId.set(id, row);
      byName.set(norm(info.name), row);
      inserted.push({ id, name: info.name, athletes: info.count });
    } catch (e) {
      console.warn(`  school insert failed: ${info.name} -> ${e.message.slice(0, 140)}`);
    }
  }
  console.log(`schools inserted: ${inserted.length}`);

  // Link athletes that have no school_id.
  let linked = 0;
  let failed = 0;
  for (const a of athletes) {
    if (a.school_id) continue;
    const s = byName.get(norm(a.school_name)) || byId.get(String(a.school_name || '').toLowerCase());
    if (!s) continue;
    try {
      await rest('athletes', { method: 'PATCH', where: { id: a.id }, body: { school_id: s.id }, prefer: 'return=minimal' });
      linked += 1;
    } catch {
      failed += 1;
    }
  }
  console.log(`athletes linked to school_id: ${linked} (failed ${failed})`);

  const summary = {
    ran_at: new Date().toISOString(),
    athletes: athletes.length,
    schools_before: schools.length,
    schools_inserted: inserted.length,
    athletes_linked: linked,
    link_failures: failed,
    inserted_schools: inserted.slice(0, 40),
  };
  require('fs').writeFileSync(
    require('path').join(__dirname, '..', 'data', 'enrich_summary.json'),
    JSON.stringify(summary, null, 2)
  );
  console.log('done:', JSON.stringify({ schools_inserted: inserted.length, athletes_linked: linked }));
}

main().catch((e) => {
  console.error('ENRICH ERROR:', e.message);
  process.exit(1);
});
