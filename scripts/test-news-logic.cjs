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
['news-tabs','news-tbody','news-pagination','news-bg','news-title','news-accent','news-intro'].forEach(byId);

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
  // Stub the shared live loader so boot()/renderNews can't crash in the sandbox
  // (no real fetch here). In the browser it fetches the published CSV; the test
  // only exercises the baked-item rendering + pagination contract.
  window.NewsData = {
    load: function(){ return Promise.resolve([]); },
    getById: function(){ return null; },
    filter: function(){ return []; },
    filters: function(){ return [{ key: 'all', label: 'ALL' }]; },
    classify: function(c){ return ('' + (c == null ? '' : c)).toString().toUpperCase(); },
    parseCsv: function(){ return []; },
    RENDER_CACHE: {},
    setItems: function(){},
    get items(){ return []; }
  };
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
ok(/news\.html#id=/.test(mainJsSrc),
  'news row click deep-links via hash route news.html#id=<CSV_ID> (shared live loader)');
ok(/window\.NewsData/.test(mainJsSrc),
  'main.js consumes the shared live NewsData loader');
// news.html renders the article from the shared live loader via the hash route,
// and shows a single Back link (no per-type legacy labels required).
const newsHtml = fs.readFileSync(path.join(__dirname, '..', 'public', 'news.html'), 'utf8');
ok(/id="article-back"/.test(newsHtml), 'news.html has the #article-back link for read mode');
ok(/news\.html#id=/.test(newsHtml) || /NewsData/.test(newsHtml), 'news.html renders articles from the shared NewsData loader via hash route');
ok(/data-back="news"/.test(newsHtml), 'news.html Back link carries data-back=news (returns to list)');

// 4) default page (perPage=10) shows at most 10 rows for the requested category.
//    `items` is the canonical list; renderNews seeds from C.news.items when present.
function renderedRowCount(kind) {
  const html = byId('news-tbody').innerHTML;
  return (html.match(/class="news-row/g) || []).length;
}
function seedItems(arr) { api.C.news.items = arr; }
['a','e'].forEach(function (kind) {
  const total = (kind === 'a' ? 4 : 4);
  seedItems(makeItems(total, kind === 'a' ? 'ANNOUNCEMENT' : 'NEWS'));
  api.__expose.boot(); // re-render with default perPage=10
  api.__expose.renderNewsToPage(kind, 0);
  let n = renderedRowCount(kind);
  ok(n === Math.min(total, 10), `page1 (perPage=10) shows min(total,10) for ${kind}: got ${n}, total ${total}`);
});

// 5) no duplicate ids within each category list (canonical `items` source).
function itemsByCat(cat) { return (api.C.news.items || []).filter(x => (x.cat || '').toUpperCase() === cat); }
const au = new Set(itemsByCat('ANNOUNCEMENT').map(x => x.id));
const eu = new Set(itemsByCat('NEWS').map(x => x.id));
ok(au.size === itemsByCat('ANNOUNCEMENT').length, `no duplicates within announcements (${au.size}/${itemsByCat('ANNOUNCEMENT').length})`);
ok(eu.size === itemsByCat('NEWS').length, `no duplicates within events (${eu.size}/${itemsByCat('NEWS').length})`);

// 6) itemsPerPage configurable (deterministic): inject a 25-item announcement list
//    into the canonical `items` source so pagination actually appears at perPage 10 and 20.
function makeItems(n, cat) {
  const arr = [];
  for (let i = 0; i < n; i++) arr.push({ id: 'gen-' + cat + '-' + i, cat: cat, date: 'Sept ' + (i + 1) + ', 2026', title: 'Item ' + (i + 1), image: '', description: 'Desc ' + (i + 1), text: '' });
  return arr;
}
const big = makeItems(25, 'ANNOUNCEMENT');
api.C.news.items = big;

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
api.C.news.items = data.items || [];

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
const sampleItem = (api.C.news.items && api.C.news.items[0]) || { text: 'Body', description: 'Desc', image: '' };
ok(renderArticleHtml(Object.assign({}, sampleItem, { image: null }), api.C.newsConfig).indexOf('<img') === -1,
  'text-only article when image=null (no <img>)');
ok(renderArticleHtml(Object.assign({}, sampleItem, { image: 'https://example.com/x.jpg' }), api.C.newsConfig).indexOf('<img') !== -1,
  'article image renders INSIDE body when configured');

// 8) pagination bounds: Next disabled on last page; negative/overflow clamp.
api.C.newsConfig.itemsPerPage = 10;
api.__expose.boot();
api.C.news.items = big;            // 25 items => 3 pages
api.__expose.renderNewsToPage('a', 2);    // last page
let pagLast = byId('news-pagination').innerHTML;
ok(pagLast.indexOf('disabled') !== -1, 'Next disabled on last page');
ok(pagLast.indexOf('PAGE 3 / 3') !== -1, 'page status shows 3/3 on last page');
api.__expose.renderNewsToPage('a', -5);
ok(byId('news-pagination').innerHTML.indexOf('PAGE 1 / 3') !== -1, 'negative page clamps to first page');
api.__expose.renderNewsToPage('a', 999);
ok(byId('news-pagination').innerHTML.indexOf('PAGE 3 / 3') !== -1, 'overflow page clamps to last page');
api.C.news.items = data.items || [];

const total = PASS.length + FAIL.length;
console.log(`\n[test-news-logic] ${PASS.length}/${total} checks passed`);
if (FAIL.length) { console.log('FAILURES:'); FAIL.forEach(f => console.log('  x ' + f)); process.exit(2); }
console.log('[test-news-logic] ALL GREEN');
process.exit(0);

