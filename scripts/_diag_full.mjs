import fs from 'node:fs';
import vm from 'node:vm';

const t = fs.readFileSync('public/assets/js/generated.js', 'utf8');
const sb = { console };
sb.window = sb;
vm.createContext(sb);
vm.runInContext(t, sb, { filename: 'g.js' });
const C = sb.window.SITE_CONFIG;

function parseCsv(text) {
  var rows = [], row = [], field = "", i = 0, inQ = false, n = text.length;
  while (i < n) {
    var ch = text[i];
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
function esc(s) { return s == null ? "" : String(s); }
function toAbs(l) { return l; }

const s = C.services || {};
let items = (s.items || []).slice();

function serviceCardHTML(it) {
  const link = it.social || it.url || "";
  const verified = String(it.ykc || "").trim() === "1";
  let sub = "", note = "", feeHTML = "", cta = "";
  if (it.section === "Pilots") {
    sub = it.ign || it.role || "Pilot";
    note = it.saying || "Pilot service available.";
    feeHTML = '<div class="svc-fee">Fee: ' + esc(it.fee || "-") + esc(it.rateperh || "") + '</div>';
    cta = link ? '<a class="act" href="' + toAbs(link) + '">' + esc(it.cta || "SOCIAL") + '</a>' : "";
  } else if (it.section === "Middleman") {
    sub = it.ign || "Middleman";
    note = it.saying || "Middleman service available.";
    feeHTML = '<div class="svc-fee">Fee: ' + esc(it.fee || "-") + '</div>';
    cta = link ? '<a class="act" href="' + toAbs(link) + '">' + esc(it.cta || "SOCIAL") + '</a>' : "";
  } else if (it.section === "Streamer") {
    sub = it.socialtype || it.code || "Stream";
    feeHTML = it.streamkey ? '<div class="svc-code">Code <b>' + esc(it.streamkey) + '</b></div>' : "";
    cta = link ? '<a class="act" href="' + toAbs(link) + '">VISIT</a>' : "";
  } else {
    sub = it.ign || it.role || it.code || "";
    note = it.saying || "";
    feeHTML = it.fee ? '<div class="svc-fee">Fee: ' + esc(it.fee) + esc(it.rateperh || "") + '</div>' : "";
    cta = link ? '<a class="act" href="' + toAbs(link) + '">' + esc(it.cta || "CONTACT") + '</a>' : "";
  }
  return '<div class="svc-card"><div class="nm">' + esc(it.name || "") + (verified ? '✓' : "") + '</div>' +
    '<div class="meta">' + (sub ? '<div class="svc-sub">' + esc(sub) + '</div>' : "") +
    (note ? '<div class="svc-note">' + esc(note) + '</div>' : "") + feeHTML + '</div>' + cta + '</div>';
}

function paint(sec) {
  return items.filter(it => it.section === sec).map(serviceCardHTML).join("");
}

console.log('=== BAKED Streamer HTML ===');
console.log(paint('Streamer'));

// simulate live fetch
for (const sh of (s.sheets || []).filter(x => x.section === 'Streamer')) {
  const res = await fetch(sh.url);
  const csv = await res.text();
  const rows = parseCsv(csv).filter(r => r.some(c => c.trim() !== ""));
  const header = rows[0].map(h => h.trim().toLowerCase());
  const live = [];
  for (let r = 1; r < rows.length; r++) {
    const cells = rows[r]; const row = { section: sh.section }; let name = "";
    for (let c = 0; c < header.length; c++) { const k = header[c]; const v = (cells[c] || "").trim(); if (k === "name") name = v; else row[k] = v; }
    if (!name) { console.log('SKIP empty name row', cells); continue; }
    row.name = name;
    if (row.streamer != null && row.socialtype == null) row.socialtype = row.streamer;
    if (row.social != null && row.url == null) row.url = row.social;
    live.push(row);
  }
  items = items.filter(it => it.section !== sh.section).concat(live);
  console.log('\n=== LIVE Streamer HTML (' + live.length + ' rows) ===');
  console.log(paint('Streamer'));
}
