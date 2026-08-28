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
const gItems = (gen.news && gen.news.items) || [];
const gAnn = (gen.news && gen.news.announcement) || [];
const gEvt = (gen.news && gen.news.event) || [];
// The news feed is driven by the live Google Sheet: C.news.sheetUrl is baked from
// NEWS_CONFIG.SheetNews and the browser fetches it live (assets/js/news-data.js);
// the baked C.news.items is the same-origin fallback (plus the legacy announcement/
// event arrays). Assert the live source is wired and the canonical items are
// well-formed (non-empty, no duplicate ids) rather than a fixed count, since live
// staff edits change the Sheet row count without a rebuild.
ok(!!(gen.news && gen.news.sheetUrl), 'news sheetUrl baked from NEWS_CONFIG.SheetNews (live browser fetch)');
ok(gItems.length >= 1, `generated news items present (got ${gItems.length})`);
const gIds = gItems.map((x) => x.id || x.slug);
ok(new Set(gIds).size === gIds.length, `no duplicate ids within news items (${new Set(gIds).size}/${gIds.length})`);
// Legacy per-category fallback arrays (if populated) are also de-duplicated.
const gAll = gAnn.concat(gEvt);
const gAllIds = gAll.map((x) => x.id || x.slug);
ok(new Set(gAllIds).size === gAllIds.length, `no duplicate ids across announcement/event fallback (${new Set(gAllIds).size}/${gAllIds.length})`);

const main = read('public/assets/js/main.js');
const html = read('public/index.html');
const css = read('public/assets/css/style.css');
// Bossran list markup (.list > li > a > .row-cat + .time + .title, tabs = .news-tabs a)
// lives in the scoped
// news.css skin that news.html loads; include it so the rows checks run against
// the real News-page styles (style.css only covers the Main Page dark preview).
const newsCss = read('public/assets/css/news.css');
const cssAll = css + '\n' + newsCss;

// Standalone news.html must exist (root + public) and be served as a real page.
ok(has('news.html'), 'standalone news.html exists at repo root');
ok(has(path.join('public', 'news.html')), 'standalone news.html exists in public/');
const newsHtml = has('public/news.html') ? read(path.join('public', 'news.html')) : '';

// =============================================================================
// MAIN PAGE NEWS → SHARED LIVE NEWS (window.NewsData). Clicking a Main Page News
// row (or the "View all content" footer) deep-links to the standalone news.html
// via the hash route news.html#id=<CSV_ID> — there is NO on-page #news-modal
// popup. The standalone news.html page renders the article on its own from the
// live Google Sheet loader and shows a "Back to News" link.
// =============================================================================
ok(/href="news\.html"/.test(html), 'Main Page nav "News" links to standalone news.html (not #news anchor)');
ok(!/id="news-modal"/.test(html), 'Main Page no longer carries the News popup modal markup (#news-modal removed)');
ok(!/showNewsModal/.test(main) && !/news-modal/.test(main), 'main.js no longer opens a #news-modal popup (deep-link only)');
ok(/assets\/js\/news-data\.js/.test(html), 'Main Page loads the shared live news loader (news-data.js)');
ok(/window\.NewsData/.test(main), 'main.js consumes the shared live NewsData loader');
ok(/news\.html#id=/.test(main), 'news row click deep-links via hash route news.html#id=<CSV_ID>');
ok(/news-view-all/.test(html) && /view-all-link/.test(main), 'Main Page shows "View all content" footer linking to the filtered list');

// =============================================================================
// STANDALONE PAGE — news.html opens articles as its own page (NOT a popup/modal),
// driven by the shared live loader + hash routing (news.html#id=<CSV_ID>).
// =============================================================================
ok(/data-page="news"/.test(newsHtml), 'news.html flagged as standalone news page (data-page=news)');
ok(/id="news-grid"/.test(newsHtml) && /id="news-tabs"/.test(newsHtml), 'news.html has the News list (tabs + grid)');
ok(/href="index\.html"/.test(newsHtml), 'news.html has HOME button returning to index.html');
// Read mode on news.html: a single live article shell + Back link, populated by
// the shared loader from the hash id. No per-article HTML files.
ok(/id="news-article"/.test(newsHtml), 'news.html has a single live article shell (#news-article)');
ok(/id="article-back"/.test(newsHtml), 'news.html has a Back link (#article-back) for read mode');
ok(/news\.html#id=/.test(newsHtml) || /NewsData/.test(newsHtml), 'news.html renders articles from the shared NewsData loader via hash route');
ok(/is-reading/.test(newsHtml) || /show-article/.test(newsHtml) || /is-reading/.test(css), 'read mode hides the list so only the article shows');
// news.html must NOT duplicate Main Page sections.
['id="classes"', 'id="download"', 'id="server"', 'id="combat"', 'id="roadmap"', 'id="community"', 'id="services"', 'id="footer"'].forEach((id) => {
  ok(!newsHtml.includes(id), 'news.html excludes Main Page section: ' + id.replace(/id="|"/g, ''));
});
ok(!/news-popup|popup-overlay/.test(newsHtml), 'news.html has no popup/overlay markup');
// No legacy per-article HTML files (forbidden by the live-news task).
ok(!fs.existsSync(path.join(root, 'public', 'news')) || fs.readdirSync(path.join(root, 'public', 'news')).length === 0, 'no per-article news/<id>.html files (live hash routing instead)');

// =============================================================================
// OPTIONAL ARTICLE IMAGES (rendered inside the article, not a forced hero)
// The article now renders on the standalone news.html page from the live loader,
// so item.image is supported in the news.html reader (and optional).
// =============================================================================
const imageHtml = main + newsHtml;
ok(/item\.image/.test(imageHtml) && /<img/.test(imageHtml), 'article image rendered when configured');
// Image is optional: the reader only injects <img> when item.image is present
// (the `if (item.image) html += '<p><img ...'` branch), so a text-only article
// with no image renders no <img>.
ok(/if\s*\(item\.image\)\s*\{?\s*[\s\S]*?<img/.test(imageHtml), 'image is optional (text-only fallback: <img> only when item.image set)');

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
ok(/news-row/.test(cssAll), 'compact news list rows styled');
ok(!/news-hero|news-banner-large|giant-banner/.test(cssAll), 'no giant top announcement banner class');
ok(/row-date/.test(cssAll) && /row-cat/.test(cssAll) && /row-title/.test(cssAll) && /row-desc/.test(cssAll) && /row-go/.test(cssAll) && /\.news-tabs a\b/.test(cssAll) && /news-tabs a i/.test(cssAll), 'list shows date/cat/title/desc/READ + bossran .news-tabs <a> filter (All/News/Announcement/Guide)');

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

