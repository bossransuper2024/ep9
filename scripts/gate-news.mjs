/* ============================================================================
 * gate-news.mjs — CLOSED-LOOP GATE for the STANDALONE News page.
 * Maker (Cline) must NEVER verify its own "done". This script is the mechanical
 * checker: it reads source + data and returns a hard PASS/FAIL (exit 2 on fail).
 * Driven by the /loop-engineering skill. Re-run after every Implement/Fix.
 *
 * Verifies the SETUP TASK contract:
 *   - The standalone news.html page still exists and opens articles as its own
 *     page (nav "News" link → news.html, HOME returns to index.html).
 *   - On the MAIN PAGE News section, clicking a row opens a POPUP MODAL
 *     (#news-modal) to read the article in place (no navigation away).
 *   - news.html contains ONLY News + HOME (no Main Page sections).
 *   - HOME returns to index.html.
 *   - Old news content preserved; pagination + optional images still work.
 * ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PASS = [], FAIL = [];
const ok = (c, m = '') => (c ? PASS : FAIL).push(m || c);

const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const has = (p) => fs.existsSync(path.join(root, p));
const countLines = (s, re) => (s.match(re) || []).length;

// RFC-ish CSV parse: handles quoted fields (incl. commas inside quotes).
function parseCsv(s) {
  const rows = []; let row = [], cur = '', q = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (q) {
      if (ch === '"') { if (s[i + 1] === '"') { cur += '"'; i++; } else q = false; }
      else cur += ch;
    } else {
      if (ch === '"') q = true;
      else if (ch === ',') { row.push(cur.trim()); cur = ''; }
      else if (ch === '\n' || ch === '\r') { if (cur !== '' || row.length) { row.push(cur.trim()); rows.push(row); row = []; cur = ''; } }
      else cur += ch;
    }
  }
  if (cur !== '' || row.length) { row.push(cur.trim()); rows.push(row); }
  return rows.filter((r) => r.length && r.some((c) => c !== ''));
}
function uniqueBy(arr, key) {
  const seen = new Set(), out = [];
  for (const r of arr) { const k = r[key]; if (seen.has(k)) continue; seen.add(k); out.push(r); }
  return out;
}

// =============================================================================
// LOOP 1/2 — OLD NEWS CONTENT PRESERVED (no dup, no missing)
// =============================================================================
const ann = parseCsv(read('announcement.csv')).slice(1).filter((r) => r.some((c) => c));
const evt = parseCsv(read('event.csv')).slice(1).filter((r) => r.some((c) => c));
ok(ann.length === 3, `announcements must be 3 (got ${ann.length})`);
ok(evt.length === 3, `events must be 3 (got ${evt.length})`);

const annU = uniqueBy(ann.map((r) => ({ title: r[2], ctx: r[4] })), 'ctx');
ok(annU.length === ann.length, `announcement duplicates present (unique=${annU.length}/${ann.length})`);
const evtU = uniqueBy(evt.map((r) => ({ title: r[2], ctx: r[4] })), 'ctx');
ok(evtU.length === evt.length, `event duplicates present (unique=${evtU.length}/${evt.length})`);

const ctxs = [...ann, ...evt].map((r) => r[4]).filter(Boolean);
ctxs.forEach((c) => ok(has(path.join('public', 'assets', 'content', c)), `content file referenced: ${c}`));

let gen = {};
try {
  const sandbox = 'var window={SITE_CONFIG:{}};' + read('public/assets/js/generated.js') + '\nreturn window.SITE_CONFIG;';
  gen = new Function(sandbox)();
} catch (e) {}
const gAnn = (gen.news && gen.news.announcement) || [];
const gEvt = (gen.news && gen.news.event) || [];
ok(gAnn.length === 3, `generated announcements = 3 (got ${gAnn.length})`);
ok(gEvt.length === 3, `generated events = 3 (got ${gEvt.length})`);
const gCtxA = gAnn.map((x) => x.context);
const gCtxE = gEvt.map((x) => x.context);
ok(new Set(gCtxA).size === gCtxA.length, `no duplicate contexts within announcements (${new Set(gCtxA).size}/${gCtxA.length})`);
ok(new Set(gCtxE).size === gCtxE.length, `no duplicate contexts within events (${new Set(gCtxE).size}/${gCtxE.length})`);

const main = read('public/assets/js/main.js');
const html = read('public/index.html');
const css = read('public/assets/css/style.css');

// Standalone news.html must exist (root + public) and be served as a real page.
ok(has('news.html'), 'standalone news.html exists at repo root');
ok(has(path.join('public', 'news.html')), 'standalone news.html exists in public/');
const newsHtml = has('public/news.html') ? read(path.join('public', 'news.html')) : '';

// =============================================================================
// MAIN PAGE NEWS → DEEP-LINK to the standalone news.html. Clicking a Main Page
// News row (or the "View all content" footer) navigates to news.html?kind=&i=&page=
// — there is NO on-page #news-modal popup anymore. The standalone news.html page
// renders the article on its own and shows a dynamic "Back to Announcements/
// Events" link whose label matches the clicked type.
// =============================================================================
ok(/href="news\.html"/.test(html), 'Main Page nav "News" links to standalone news.html (not #news anchor)');
ok(!/id="news-modal"/.test(html), 'Main Page no longer carries the News popup modal markup (#news-modal removed)');
ok(!/showNewsModal/.test(main) && !/news-modal/.test(main), 'main.js no longer opens a #news-modal popup (deep-link only)');
ok(/location\.href\s*=\s*"news\.html/.test(main), 'standalone news.html deep-link (kind+i+page) present in main.js');
ok(/news\.html\?kind=/.test(main), 'news row click carries kind+i deep-link to the article');
ok(/news-view-all/.test(html) && /view-all-link/.test(main), 'Main Page shows "View all content" footer linking to the filtered list');

// =============================================================================
// STANDALONE PAGE — news.html opens articles as its own page (NOT a popup/modal).
// =============================================================================
ok(/data-page="news"/.test(newsHtml), 'news.html flagged as standalone news page (data-page=news)');
ok(/id="news-grid"/.test(newsHtml) && /id="news-tabs"/.test(newsHtml), 'news.html has the News list (tabs + grid)');
ok(/href="index\.html"/.test(newsHtml), 'news.html has HOME button returning to index.html');
// Read mode on news.html must show a dynamic Back link whose label reflects the
// clicked type (Announcement vs Event) — handled in the inline article script.
ok(/id="article-back"/.test(newsHtml), 'news.html has a Back link (#article-back) for read mode');
ok(/BACK TO /.test(newsHtml) && /ANNOUNCEMENTS/.test(newsHtml) && /EVENTS/.test(newsHtml), 'news.html Back link label is set per type (Announcements/Events)');
ok(/is-reading/.test(newsHtml) || /is-reading/.test(css), 'read mode locks the list (body.is-reading) so only the article shows');
// news.html must NOT duplicate Main Page sections.
['id="classes"', 'id="download"', 'id="server"', 'id="combat"', 'id="roadmap"', 'id="community"', 'id="services"', 'id="footer"'].forEach((id) => {
  ok(!newsHtml.includes(id), 'news.html excludes Main Page section: ' + id.replace(/id="|"/g, ''));
});
ok(!/news-popup|popup-overlay/.test(newsHtml), 'news.html has no popup/overlay markup');

// =============================================================================
// OPTIONAL ARTICLE IMAGES (rendered inside the article, not a forced hero)
// The article now renders on the standalone news.html page, so the image logic
// may live in either main.js (list context) or news.html (article renderer).
// =============================================================================
const imageHtml = main + newsHtml;
ok(/item\.image/.test(imageHtml) && /<img/.test(imageHtml), 'article image rendered when configured');
ok(/item\.image\s*\?|!item\.image|showImagesInArticle/.test(imageHtml), 'image is optional (text-only fallback exists)');

// =============================================================================
// CONFIGURABLE PAGINATION (single source: itemsPerPage, no hardcode)
// =============================================================================
ok(/itemsPerPage|pageSize/.test(main), 'pagination limit sourced from config token');
ok(countLines(main, /itemsPerPage\s*=\s*\d+\s*;/g) <= 1, 'itemsPerPage NOT hard-coded in multiple places');
ok(/Previous|previousLabel/.test(main + html + newsHtml), 'Previous control present');
ok(/Next|nextLabel/.test(main + html + newsHtml), 'Next control present');
ok(/pagination/.test(html) || /pagination/.test(newsHtml) || /pagination/.test(main), 'pagination container present');
ok(/page\s*\*\s*itemsPerPage|slice\(/.test(main), 'pagination math (slice by page) present');

// =============================================================================
// LOOP 10/11 — HOME NEWS LIST compact (no giant top banner)
// =============================================================================
ok(/news-row/.test(css), 'compact news list rows styled');
ok(!/news-hero|news-banner-large|giant-banner/.test(css), 'no giant top announcement banner class');
ok(/row-date/.test(css) && /row-cat/.test(css) && /row-title/.test(css) && /row-go|READ/.test(css), 'list shows date/cat/title/read');

// =============================================================================
// LOOP 14 — NO BROKEN LINKS / IMAGES
// =============================================================================
const brokenImgs = [...gAnn, ...gEvt].filter((x) => x.image && !/^https?:/.test(x.image) && !has(path.join('public', x.image.replace(/^\//, ''))));
ok(brokenImgs.length === 0, `no broken local images (${brokenImgs.length} broken)`);
ok(has('scripts/verify-site.mjs'), 'verify-site.mjs present');

// =============================================================================
const total = PASS.length + FAIL.length;
console.log(`\n[gate-news] ${PASS.length}/${total} checks passed`);
if (FAIL.length) {
  console.log('FAILURES:');
  FAIL.forEach((f) => console.log('  x ' + f));
  process.exit(2);
}
console.log('[gate-news] ALL GREEN — completion gate passed.');
process.exit(0);

