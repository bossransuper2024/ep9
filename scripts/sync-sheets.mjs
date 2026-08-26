/* ============================================================================
 * sync-sheets.mjs — pulls the published Google Sheets into SAME-ORIGIN JSON.
 *
 * WHY THIS EXISTS
 * --------------
 * Most published-CSV endpoints (docs.google.com/.../pub?output=csv) answer with a
 * `307` redirect to `doc-0s-84-sheets.googleusercontent.com` (a DIFFERENT origin)
 * and send NO `Access-Control-Allow-Origin` header on that redirect. A browser
 * `fetch()` therefore fails its CORS check on the redirect and the request is
 * silently blocked — so a client-side fetch of THOSE sheets can NEVER work on a
 * static host. (curl/Node follow the redirect server-side, which is why CLI
 * tests "see" the data but the browser never does.)
 *
 * BOTH the NEWS and SERVICES published CSVs are published with
 * `access-control-allow-origin: *`, so the BROWSER fetches them LIVE at runtime
 * (see assets/js/news-data.js for News via C.news.sheetUrl, and main.js
 * renderServices()/fetchLiveServices() for Services via C.services.sheets). No
 * rebuild is needed when staff add/edit/delete rows — a page reload shows the
 * latest data. This script ALSO bakes public/data/*.json as an OFFLINE FALLBACK
 * used only if the live fetch is blocked or the host is offline; it is NOT the
 * primary source and a build does NOT gate live updates.
 *
 * Output:
 *   public/data/news.json          { generated, items:[ {id,cat,...} ] }  (NEWS FALLBACK)
 *   public/data/services*.json     per-section service rows
 *   public/data/services.json      { generated, sections:{ Streamer:[...], ... } }
 * If a fetch fails the previous file is kept (non-fatal) so a flaky network
 * never wipes the site's content.
 * ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readIni } from './generate-config.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const dataDir = path.join(root, 'public', 'data');

/* RFC4180-ish CSV (quoted fields, commas, escaped quotes). Mirrors main.js. */
function parseCsv(text) {
  const rows = [];
  let row = [], field = '';
  let i = 0, inQ = false;
  const n = text.length;
  while (i < n) {
    const c = text[i];
    if (inQ) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 2; continue; }
        inQ = false; i++; continue;
      }
      field += c; i++; continue;
    }
    if (c === '"') { inQ = true; i++; continue; }
    if (c === ',') { row.push(field); field = ''; i++; continue; }
    if (c === '\r') { i++; continue; }
    if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; i++; continue; }
    field += c; i++;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

function esc(s) { return String(s == null ? '' : s).trim(); }

async function fetchCsv(url, timeoutMs = 25000) {
  const ctrl = (globalThis.AbortController && new AbortController()) || null;
  const t = setTimeout(() => { if (ctrl && ctrl.abort) ctrl.abort(); }, timeoutMs);
  try {
    const res = await fetch(url, ctrl ? { signal: ctrl.signal } : undefined);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}

function toRows(csv) {
  const raw = parseCsv(csv).filter((r) => r.some((c) => c.trim() !== ''));
  if (raw.length < 2) return [];
  const header = raw[0].map((h) => h.trim().toLowerCase());
  const out = [];
  for (let r = 1; r < raw.length; r++) {
    const cells = raw[r];
    const row = {};
    for (let c = 0; c < header.length; c++) row[header[c]] = (cells[c] || '').trim();
    out.push(row);
  }
  return out;
}

/* NEWS columns: id,category,Title,date,desc,content. `category` is 1/2. */
function mapNewsRows(rows) {
  const catMap = { '1': 'NEWS', '2': 'ANNOUNCEMENT', '3': 'GUIDE', news: 'NEWS', announcement: 'ANNOUNCEMENT', guide: 'GUIDE', tutorial: 'GUIDE', event: 'NEWS' };
  const items = [];
  for (const row of rows) {
    const id = esc(row.id);
    const title = esc(row.title || row.Title);
    if (!id || !title) continue;
    const cat = (catMap[String(row.category || '').toLowerCase()] || 'NEWS').toUpperCase();
    items.push({
      id,
      slug: esc(row.slug) || String(id),
      cat,
      type: cat,
      title,
      date: esc(row.date),
      eventDate: esc(row.eventdate || row.eventDate),
      author: esc(row.author) || 'Admin',
      image: esc(row.image || row.img),
      description: esc(row.desc || row.description),
      content: esc(row.content || row.text),
      text: esc(row.content || row.text),
      hide: String(row.hide || '').toUpperCase() === 'TRUE'
    });
  }
  return items.filter((it) => !it.hide);
}

function mapServiceRows(rows, section) {
  return rows.map((row) => ({ section, ...row })).filter((row) => esc(row.name));
}

/* DOWNLOAD columns: provider,group,link,linkname (lowercased in toRows). */
function mapDownloadRows(rows) {
  return rows.map((row) => ({
    label: esc(row.linkname) || esc(row.provider) || 'Download',
    url: esc(row.link),
    note: esc(row.provider)
  })).filter((row) => row.url);
}

function writeJson(name, obj) {
  fs.mkdirSync(dataDir, { recursive: true });
  const p = path.join(dataDir, name);
  fs.writeFileSync(p, JSON.stringify(obj, null, 2), 'utf8');
  console.log('[sync-sheets] wrote', path.relative(root, p), '(' + (obj.items || []).length + ' rows)');
}

async function pullOne(name, url, mapper) {
  if (!url) return false;
  try {
    const csv = await fetchCsv(url);
    const rows = toRows(csv);
    if (!rows.length) { console.warn('[sync-sheets] ' + name + ': empty sheet, keeping previous file'); return false; }
    const items = mapper(rows);
    if (!items.length) { console.warn('[sync-sheets] ' + name + ': no valid rows, keeping previous file'); return false; }
    writeJson(name, { generated: new Date().toISOString(), items });
    return true;
  } catch (err) {
    console.warn('[sync-sheets] ' + name + ' fetch failed (' + (err && err.message ? err.message : err) + '); keeping previous file');
    return false;
  }
}


export async function sync() {
  const ini = (() => { try { return readIni(path.join(root, 'config.ini')); } catch (e) { return {}; } })();
  const get = (sec, k, d) => (ini[sec] && ini[sec][k] != null && ini[sec][k] !== '') ? ini[sec][k] : d;

  await pullOne('news.json', get('NEWS_CONFIG', 'SheetNews', ''), mapNewsRows);

  // DOWNLOAD live Google Sheet (offline fallback)
  await pullOne('download.json', get('DOWNLOAD', 'SheetDownload', ''), mapDownloadRows);

  const svc = [
    ['services-streamer.json', get('SERVICES', 'SheetStreamer', ''), 'Streamer'],
    ['services-middleman.json', get('SERVICES', 'SheetMiddleman', ''), 'Middleman'],
    ['services-pilot.json', get('SERVICES', 'SheetPilot', ''), 'Pilots']
  ];
  const sections = {};
  for (const [file, url, section] of svc) {
    const ok = await pullOne(file, url, (rows) => mapServiceRows(rows, section));
    if (ok) {
      try { sections[section] = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8')).items; } catch (e) { /* ignore */ }
    }
  }
  if (Object.keys(sections).length) {
    writeJson('services.json', { generated: new Date().toISOString(), sections });
  }
  console.log('[sync-sheets] done.');
}

sync().catch((e) => { console.error('[sync-sheets] fatal:', e); process.exit(1); });

