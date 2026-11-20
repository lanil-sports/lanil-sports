// scripts/athlete_portal.js — Athlete-owned experience APIs (LANIL Sports).
// Functions: claim profile, submit corrections, upload photos, add achievements,
// request removal/visibility changes, build recruiting-ready profile.
// Writes to the DB (athletes, athlete_offers) and appends an event log.
const fs = require('fs');
const path = require('path');
const { rest } = require('./db');

const LOG_FILE = path.join(__dirname, '..', 'logs', 'portal', 'portal_log_' + new Date().toISOString().slice(0, 10) + '.jsonl');

function logEvent(ev) {
  fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
  fs.appendFileSync(LOG_FILE, JSON.stringify({ ts: new Date().toISOString(), ...ev }).slice(0, 4000) + '\n');
  console.log('portal:', ev.event, ev.slug || '', ev.note || '');
}

function today() { return new Date().toISOString().slice(0, 10); }

async function claim_profile({ slug, claimed_by_user_id = null }) {
  const payload = { claimed: true, claimed_at: new Date().toISOString() };
  if (claimed_by_user_id) payload.claimed_by_user_id = claimed_by_user_id;
  await rest('athletes', { method: 'PATCH', where: { slug }, body: payload, prefer: 'return=minimal' });
  logEvent({ event: 'claim_profile', slug, note: 'Athlete/parent claim set; Act 810 consent flow applies to minors' });
}

async function submit_correction({ slug, field, old_value, new_value, submitted_by, reason }) {
  const row = { athlete_id: undefined, field, old_value: old_value === undefined ? null : old_value, new_value: new_value === undefined ? null : new_value, submitted_by: submitted_by || null, reason: reason || '', status: 'submitted', submitted_at: today() };
  await rest('athlete_corrections', { method: 'POST', body: row }).catch((e) => {
    logEvent({ event: 'submit_correction', slug, note: 'athlete_corrections insert failed (table requires migration?): ' + e.message.slice(0, 120) });
  });
  logEvent({ event: 'submit_correction', slug, note: `field=${field} new=${new_value} by=${submitted_by || 'anonymous'}` });
}

async function upload_photo({ slug, url, source, attribution, permission = 'owned_or_licensed', uploaded_by }) {
  if (!url) throw new Error('photo url required');
  const existing = await rest('athletes', { select: 'id,headshot_url,photo_gallery', where: { slug }, limit: 1 });
  if (!existing.length) throw new Error(`athlete not found: ${slug}`);
  const row = existing[0];
  const photo = { url, source: source || 'athlete_upload', attribution: attribution || '', permission, uploaded_by: uploaded_by || null, tagged_date: today() };
  const gallery = Array.isArray(row.photo_gallery) ? row.photo_gallery.slice() : [];
  if (!gallery.includes(url)) gallery.push(url);
  await rest('athletes', { method: 'PATCH', where: { id: row.id }, body: { headshot_url: url, photo_gallery: gallery, last_updated: today() }, prefer: 'return=minimal' });
  await rest('athlete_photos', { method: 'POST', body: { athlete_id: row.id, photo_url: url, source: photo.source, attribution: photo.attribution, permission, uploaded_by: photo.uploaded_by, tags: [] } }).catch(() => {});
  logEvent({ event: 'upload_photo', slug, url, note: `source=${photo.source} permission=${permission}` });
}

async function add_achievement({ slug, achievement_type, title, date, source, details }) {
  await rest('athlete_achievements', { method: 'POST', body: { slug, achievement_type: achievement_type || 'other', title, date: date || null, source: source || null, details: details || null, added_by: null, added_at: new Date().toISOString() } }).catch(() => {});
  logEvent({ event: 'add_achievement', slug, note: `${achievement_type || 'other'}: ${title} (${date || 'n/a'})` });
}

async function request_removal({ slug, reason, reason_for = 'visibility' }) {
  const payload = { verified: false, visibility_visible: false, last_updated: today() };
  await rest('athletes', { method: 'PATCH', where: { slug }, body: payload, prefer: 'return=minimal' });
  await rest('athlete_claims', { method: 'POST', body: { slug, claim_type: 'remove_or_hide', status: 'submitted', note: reason, reason_for, submitted_at: today() } }).catch(() => {});
  logEvent({ event: 'request_removal', slug, note: reason, reason_for });
}

async function build_recruiting_profile({ slug, colleges, offers = [], stats_summary = '', source_url = null, verified_at = null }) {
  const payload = { recruiting_profile_ready: true, potential_colleges: colleges || [], season_stats_summary: stats_summary, last_updated: today() };
  await rest('athletes', { method: 'PATCH', where: { slug }, body: payload, prefer: 'return=minimal' }).catch(() => {});
  for (const c of colleges || []) {
    await rest('athlete_commitments', { method: 'POST', body: { slug, college_name: c, source_url, verified_at } }).catch(() => {});
  }
  for (const o of offers) {
    await rest('athlete_offers', { method: 'POST', body: { slug, ...o } }).catch(() => {});
  }
  logEvent({ event: 'build_recruiting_profile', slug, note: `colleges=${(colleges || []).join(',')} offers=${offers.length}` });
}

module.exports = { claim_profile, submit_correction, upload_photo, add_achievement, request_removal, build_recruiting_profile };
if (require.main === module) { console.log('portal: functions loaded (exports above)'); }
