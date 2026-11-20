// scripts/fetch_public_sources.js — Investigate and integrate permitted public sources.
// Fetches NAIA (robots: Allow) and NJCAA (robots: Allow) roots + spot-checks NCAA (403 = restricted).
// Saves artifacts to data/ for later ingestion.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

function get(url, timeout = 8000) {
  const ac = AbortSignal.timeout(timeout);
  return fetch(url, { signal: ac, redirect: 'follow' }).then(async (res) => ({
    url,
    status: res.status,
    ok: res.ok,
    text: await res.text().catch(() => ''),
    headers: Object.fromEntries(res.headers.entries()),
  })).catch((e) => ({ url, status: 0, ok: false, text: '', headers: {}, error: e.cause?.code || e.message }));
}

function saveArtifact(name, obj) {
  const dir = path.join(ROOT, 'data');
  fs.mkdirSync(dir, { recursive: true });
  const f = path.join(dir, name);
  fs.writeFileSync(f, JSON.stringify(obj, null, 2));
  return f;
}

async function main() {
  const results = { fetched_at: new Date().toISOString(), sources: {} };

  const naia = await get('https://naia.com/');
  results.sources.naia = { url: naia.url, status: naia.status, ok: naia.ok, size: naia.text.length, error: naia.error, title: (naia.text.match(/<title[^>]*>(.*?)<\/title>/is) || [])[1]?.trim().slice(0, 80) || null };
  if (naia.ok && naia.text) saveArtifact('naia_home.html', { source: 'naia.com', url: naia.url, fetched_at: new Date().toISOString(), status: naia.status, body: naia.text });

  const njcaa = await get('https://njcaa.org/');
  results.sources.njcaa = { url: njcaa.url, status: njcaa.status, ok: njcaa.ok, size: njcaa.text.length, error: njcaa.error, title: (njcaa.text.match(/<title[^>]*>(.*?)<\/title>/is) || [])[1]?.trim().slice(0, 80) || null };
  if (njcaa.ok && njcaa.text) saveArtifact('njcaa_home.html', { source: 'njcaa.org', url: njcaa.url, fetched_at: new Date().toISOString(), status: njcaa.status, body: njcaa.text });

  const ncaaStats = await get('https://stats.ncaa.org/');
  results.sources.ncaa_stats = { url: ncaaStats.url, status: ncaaStats.status, ok: ncaaStats.ok, size: ncaaStats.text.length, error: ncaaStats.error };

  const lhsaaNet = await get('https://louisianahighschoolsports.com/');
  results.sources.lhsaa_network = { url: lhsaaNet.url, status: lhsaaNet.status, ok: lhsaaNet.ok, size: lhsaaNet.text.length, error: lhsaaNet.error, blocked_by_sandbox_dns: !!lhsaaNet.error };

  const resultsFile = saveArtifact('source_investigation.json', results);
  console.log('investigation results:');
  console.log(JSON.stringify(results, null, 2));
  console.log('artifacts saved under data/; results:', resultsFile);
}

main().catch((e) => { console.error('INVESTIGATION ERROR:', e.message); process.exit(1); });
