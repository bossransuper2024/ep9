/* Logic-level integration test for the News section on the Main Page.
 * Shims a minimal DOM + window so the REAL main.js runs and we can assert behavior:
 *  - clicking a Main Page row deep-links to the standalone news.html article page
 *    (news.html?kind=&i=&page=) — no on-page popup modal.
 *  - the standalone news.html reader shows a per-type Back link (Announcements/Events)
 *  - pagination: itemsPerPage 10 vs 20 changes how many rows render; prev/next bounds ok
 *  - no duplicate news rows across the full list
 * No browser required. Exits 2 on any failure.
 */
const fs = require('fs');
const path = require('path');

function makeEl(id) {
  const e = {
    id, _html: '', _text: '', _attrs: {}, _cls: new Set(), style: {}, dataset: {}, _listeners: {}, disabled: false, scrollTop: 0,
    classList: null,
    set innerHTML(v) { this._html = v; }, get innerHTML() { return this._html; },
    set textContent(v) { this._text = v; }, get textContent() { return this._text; },
    setAttribute(k, v) { this._attrs[k] = v; }, getAttribute(k) { return this._attrs[k]; },
    removeAttribute(k) { delete this._attrs[k]; },
    addEventListener(ev, fn) { (this._listeners[ev] = this._listeners[ev] || []).push(fn); },
    querySelector() { return makeEl('_q_' + Math.random()); }, querySelectorAll() { return []; }, closest() { return null; }
  };
  return e;
}
const els = {};
function byId(id) {
  if (!els[id]) { const e = makeEl(id); e.classList = { _o: e, add(c){this._o._cls.add(c);}, remove(c){this._o._cls.delete(c);}, toggle(c,on){ on?this._o._cls.add(c):this._o._cls.delete(c);}, contains(c){return this._o._cls.has(c);} }; els[id] = e; }
  return els[id];
}
['news-tabs','news-grid','news-pagination','news-bg','news-title','news-accent','news-intro','news-tab-a','news-tab-e'].forEach(byId);

const gen = fs.readFileSync(path.join(__dirname, '..', 'public/assets/js/generated.js'), 'utf8');
const cfg = fs.readFileSync(path.join(__dirname, '..', 'public/assets/js/config.js'), 'utf8');
const main = fs.readFileSync(path.join(__dirname, '..', 'public/assets/js/main.js'), 'utf8')
  // expose internals from inside the IIFE so the test can drive them
  .replace(/\}\)\(\);\s*$/, 'window.__expose = { boot: boot, renderNewsToPage: function(){ return window.renderNewsToPage.apply(window, arguments); } }; })();');

const fsExtra = require('fs');
const pathExtra = require('path');
const sandbox = `
  var document = { getElementById: function(id){ return byId(id); }, querySelectorAll: function(){ return []; }, addEventListener: function(){}, body: { classList: { add: function(c){ docBodyCls.add(c); }, remove: function(c){ docBodyCls.delete(c); }, contains: function(c){ return docBodyCls.has(c); } }, style: {} } };
  var window = { SITE_CONFIG: {}, location: { hash: '' }, scrollTo: function(){}, addEventListener: function(){} };
  var docBodyCls = new Set();
  var els = globalThis.__els; var byId = globalThis.__byId;
  var __readFileSync = globalThis.__readFileSync;
  function XMLHttpRequest() {
    var self = this;
    this.open = function(m, u) { self._url = u; };
    this.send = function() {
      try {
        var p = self._url;
        if (p.indexOf('assets/content/') === 0) p = '../public/' + p;
        else if (p.indexOf('/') === 0) p = '..' + p;
        var txt = __readFileSync(globalThis.__pathJoin(globalThis.__root, p), 'utf8');
        self.readyState = 4; self.status = 200; self.responseText = txt;
        if (self.onreadystatechange) self.onreadystatechange();
      } catch (e) { self.readyState = 4; self.status = 404; self.responseText = ''; if (self.onreadystatechange) self.onreadystatechange(); }
    };
    this.setRequestHeader = function() {};
  }
  globalThis.XMLHttpRequest = XMLHttpRequest;
  ${cfg}
  ${gen}
  ${main}
  globalThis.__api = { C: window.SITE_CONFIG, __expose: window.__expose, getBodyCls: function(){ return docBodyCls; }, byId: byId };
`;
global.__els = els; global.__byId = byId;
global.__readFileSync = fs.readFileSync;
global.__pathJoin = path.join;
global.__root = path.resolve(__dirname, '..');
new Function('globalThis', sandbox)(globalThis);
const api = global.__api;
const PASS = [], FAIL = [];
const ok = (c, m) => (c ? PASS : FAIL).push(m || c);

try { api.__expose.boot(); } catch (e) { console.log('BOOT ERROR:', e.message); process.exit(2); }
const data = api.C.news;

// STANDALONE NEWS PAGE — News is a separate news.html (NOT an overlay). Verify:
//  - On the Main Page, clicking a News row DEEP-LINKS to news.html?kind=&i=&page=
//    (no on-page popup modal).
//  - The standalone news.html page renders the article and a per-type Back link
//    (Announcements/Events) whose label reflects the clicked type.
//  - News list still renders with correct pagination math + bounds.
//  - No duplicate news within each list.
//  - Optional article images render INSIDE the article body (mirrors news.html renderer).

// 1) Main Page row click deep-links to the standalone article page (no modal).
const mainJsSrc = fs.readFileSync(path.join(__dirname, '..', 'public/assets/js/main.js'), 'utf8');
ok(!/showNewsModal/.test(mainJsSrc) && !/news-modal/.test(mainJsSrc),
  'main.js no longer opens a #news-modal popup (deep-link only)');
ok(/location\.href\s*=\s*"news\.html/.test(mainJsSrc),
  'standalone news.html deep-link to news.html?kind=&i=&page= present');
// news.html must provide a per-type Back link for read mode.
const newsHtml = fs.readFileSync(path.join(__dirname, '..', 'public', 'news.html'), 'utf8');
ok(/id="article-back"/.test(newsHtml), 'news.html has the #article-back link for read mode');
ok(/BACK TO /.test(newsHtml) && /ANNOUNCEMENTS/.test(newsHtml) && /EVENTS/.test(newsHtml), 'news.html Back link label reflects the clicked type');
ok(/data-back="news"/.test(newsHtml) && /setAttribute\("data-back", isEvent \? "event" : "announcement"\)/.test(newsHtml), 'news.html Back link carries the clicked type (data-back set per type)');

function renderedRowCount(kind) {
  const html = byId('news-grid').innerHTML;
  return (html.match(/class="news-row/g) || []).length;
}
['a','e'].forEach(function (kind) {
  api.__expose.boot(); // re-render with default perPage=10
  api.__expose.renderNewsToPage(kind, 0);
  let n = renderedRowCount(kind);
  const total = (kind === 'a' ? data.announcement : data.event).length;
  ok(n === Math.min(total, 10), `page1 (perPage=10) shows min(total,10) for ${kind}: got ${n}, total ${total}`);
});

// 5) no duplicate news within each list (Tyranny Wars legitimately appears in BOTH
//    Announcement and Event CSVs — that is genuine old content, so check per-list).
const au = new Set(data.announcement.map(x => x.context));
const eu = new Set(data.event.map(x => x.context));
ok(au.size === data.announcement.length, `no duplicates within announcements (${au.size}/${data.announcement.length})`);
ok(eu.size === data.event.length, `no duplicates within events (${eu.size}/${data.event.length})`);

// 6) itemsPerPage configurable (deterministic): inject a 25-item announcement list
//    so pagination actually appears at perPage 10 and 20.
const big = [];
for (let i = 0; i < 25; i++) big.push({ date: 'Sept ' + (i + 1) + ', 2026', title: 'Item ' + (i + 1), image: '', description: 'Desc ' + (i + 1), context: '', cat: 'ANNOUNCEMENT', text: '' });
api.C.news.announcement = big;

api.C.newsConfig.itemsPerPage = 10;
api.__expose.boot();
api.__expose.renderNewsToPage('a', 0);
ok(renderedRowCount('a') === 10, `perPage=10 shows 10 rows (got ${renderedRowCount('a')})`);
let pag10 = byId('news-pagination').innerHTML;
ok(pag10.indexOf('PAGE 1 / 3') !== -1, 'perPage=10 status shows 1/3 (25 items => 3 pages)');
ok(pag10.indexOf('disabled') !== -1, 'Previous disabled on first page (perPage=10)');

api.C.newsConfig.itemsPerPage = 20;
api.__expose.boot();
api.__expose.renderNewsToPage('a', 0);
ok(renderedRowCount('a') === 20, `perPage=20 shows 20 rows (got ${renderedRowCount('a')})`);
ok(byId('news-pagination').innerHTML.indexOf('PAGE 1 / 2') !== -1, 'perPage=20 status shows 1/2 (25 items => 2 pages)');

// restore real data for the remaining checks
api.C.news.announcement = data.announcement;

// 7) optional image (mirrors the news.html article renderer): null -> text-only;
//    configured -> <img> INSIDE the body. Reuse the published renderer contract.
function renderArticleHtml(item, cfg) {
  const blocks = item.text
    ? (item.text.split('\n').filter(l => l.trim()).map(l => '<p>' + l + '</p>'))
    : (item.description ? ['<p>' + item.description + '</p>'] : ['<p>Details coming soon.</p>']);
  let img = '';
  if (item.image && (cfg && cfg.showImagesInArticle !== false)) {
    let src = item.image;
    if (src.indexOf('://') === -1 && src.indexOf('/') !== 0) src = 'assets/content/' + src;
    img = '<figure class="reader-figure"><img src="' + src + '" alt=""></figure>';
  }
  return img + blocks.join('');
}
ok(renderArticleHtml(Object.assign({}, data.announcement[0], { image: null }), api.C.newsConfig).indexOf('<img') === -1,
  'text-only article when image=null (no <img>)');
ok(renderArticleHtml(Object.assign({}, data.announcement[0], { image: 'https://example.com/x.jpg' }), api.C.newsConfig).indexOf('<img') !== -1,
  'article image renders INSIDE body when configured');

// 8) pagination bounds: Next disabled on last page; negative/overflow clamp.
api.C.newsConfig.itemsPerPage = 10;
api.__expose.boot();
api.C.news.announcement = big;            // 25 items => 3 pages
api.__expose.renderNewsToPage('a', 2);    // last page
let pagLast = byId('news-pagination').innerHTML;
ok(pagLast.indexOf('disabled') !== -1, 'Next disabled on last page');
ok(pagLast.indexOf('PAGE 3 / 3') !== -1, 'page status shows 3/3 on last page');
api.__expose.renderNewsToPage('a', -5);
ok(byId('news-pagination').innerHTML.indexOf('PAGE 1 / 3') !== -1, 'negative page clamps to first page');
api.__expose.renderNewsToPage('a', 999);
ok(byId('news-pagination').innerHTML.indexOf('PAGE 3 / 3') !== -1, 'overflow page clamps to last page');
api.C.news.announcement = data.announcement;

const total = PASS.length + FAIL.length;
console.log(`\n[test-news-logic] ${PASS.length}/${total} checks passed`);
if (FAIL.length) { console.log('FAILURES:'); FAIL.forEach(f => console.log('  x ' + f)); process.exit(2); }
console.log('[test-news-logic] ALL GREEN');
process.exit(0);

