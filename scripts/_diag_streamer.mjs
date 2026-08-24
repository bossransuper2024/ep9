import fs from 'node:fs';
import vm from 'node:vm';

const t = fs.readFileSync('public/assets/js/generated.js', 'utf8');
const sb = { console };
sb.window = sb;
vm.createContext(sb);
vm.runInContext(t, sb, { filename: 'g.js' });
const sheets = sb.window.SITE_CONFIG.services.sheets;
const svc = sb.window.SITE_CONFIG.services;

function parseCsv(text) {
  const rows = []; let row = [], field = "";
  let i = 0, inQ = false; const n = text.length;
  while (i < n) {
    const ch = text[i];
    if (inQ) {
      if (ch === '"') { if (text[i + 1] === '"') { field += '"'; i += 2; continue; } inQ = false; i++; continue; }
      field += ch; i++; continue;
    }
    if (ch === '"') { inQ = true; i++; continue; }
    if (ch === ',') { row.push(field); field = ""; i++; continue; }
    if (ch === '\r') { i++; continue; }
    if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ""; i++; continue; }
    field += ch; i++;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows;
}
function esc(s){ return s==null?"":String(s); }

// Mirror main.js Streamer branch of serviceCardHTML
function streamerCard(it) {
  const link = it.social || it.url || "";
  const verified = String(it.ykc || "").trim() === "1";
  const sub = it.socialtype || it.code || "Stream";
  const feeHTML = it.streamkey ? '<div class="svc-code">Code <b>' + esc(it.streamkey) + '</b></div>' : "";
  const cta = link ? '<a class="act" href="' + link + '">VISIT</a>' : "";
  return 'NAME=' + esc(it.name) + ' | sub=' + esc(sub) + ' | code=' + JSON.stringify(it.streamkey) + ' | feeHTML=' + feeHTML + ' | cta=' + cta;
}

// 1) baked fallback rows for Streamer
console.log('--- BAKED FALLBACK Streamer items ---');
console.log((svc.items || []).filter(x => x.section === 'Streamer').map(streamerCard).join('\n') || '(none)');

// 2) live sheet
for (const sh of sheets.filter(s => s.section === 'Streamer')) {
  try {
    const res = await fetch(sh.url);
    const csv = await res.text();
    const rows = parseCsv(csv).filter(r => r.some(c => c.trim() !== ''));
    const header = rows[0].map(h => h.trim().toLowerCase());
    console.log('\n--- LIVE Streamer sheet: header=' + header.join(',') + ' ---');
    for (let r = 1; r < rows.length; r++) {
      const cells = rows[r]; const row = { section: 'Streamer' }; let name = '';
      for (let c = 0; c < header.length; c++) { const k = header[c]; const v = (cells[c]||'').trim(); if (k === 'name') name = v; else row[k] = v; }
      if (!name) continue;
      if (row.streamer != null && row.socialtype == null) row.socialtype = row.streamer;
      if (row.social != null && row.url == null) row.url = row.social;
      console.log(streamerCard(row));
    }
  } catch (e) { console.log('ERR', e.message); }
}
