// tools/.. actually scripts/db.js — PostgREST helpers for the LANIL Sports pipeline.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

function readEnvFile(file) {
  const env = {};
  const p = path.join(ROOT, file);
  if (fs.existsSync(p)) {
    for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (m) env[m[1]] = m[2];
    }
  }
  return env;
}

const ENV = readEnvFile('.env');
const BASE = process.env.SUPABASE_URL || ENV.SUPABASE_URL || 'https://uwnslkzyvmrrycdxvudg.supabase.co';
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ENV.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || ENV.SUPABASE_ANON_KEY;

function restUrl(table) { return `${BASE}/rest/v1/${table}`; }

async function rest(table, opts = {}) {
  const method = opts.method || 'GET';
  const params = new URLSearchParams();
  if (opts.select) params.set('select', opts.select);
  if (opts.where) for (const [k, v] of Object.entries(opts.where)) params.set(k, `eq.${v}`);
  if (opts.limit) params.set('limit', String(opts.limit));
  if (opts.offset) params.set('offset', String(opts.offset));
  const url = restUrl(table) + (params.size ? `?${params}` : '');
  const res = await fetch(url, {
    method,
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      'Content-Type': 'application/json',
      ...(opts.prefer ? { Prefer: opts.prefer } : {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    signal: opts.signal,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase ${method} /rest/v1/${table} -> ${res.status}: ${text.slice(0, 500)}`);
  }
  if (res.status === 204) return [];
  const text = await res.text();
  if (!text || text.trim() === '') return [];
  return JSON.parse(text);
}

async function fetchAll(table, select = '*', limit = 1000) {
  const out = [];
  let offset = 0;
  for (;;) {
    const rows = await rest(table, { select, limit, offset, prefer: 'count=exact' });
    if (!rows || rows.length === 0) break;
    out.push(...rows);
    if (rows.length < limit) break;
    offset += rows.length;
    if (out.length > 200000) break;
  }
  return out;
}

module.exports = { rest, restUrl, BASE, KEY, fetchAll };
