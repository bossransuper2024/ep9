#!/usr/bin/env node
/* ============================================================================
 * verify-site.mjs — mechanical completion gate for the Ran Online EP9
 * static rebuild. Runs as `npm test` (invoked by loop-engineering gate.py).
 * All checks must pass or the gate goes RED.
 * ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const fail = [];
const ok = [];
function check(name, cond, detail) { if (cond) ok.push(name); else fail.push(detail || name); }

function loadScript(rel) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) throw new Error('missing file: ' + rel);
  const code = fs.readFileSync(p, 'utf8');
  const sandbox = { console };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox, { filename: rel });
  return sandbox;
}

try {
  const indexHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  check('index.html exists', true);
  check('references style.css', indexHtml.includes('assets/css/style.css'));
  check('references config.js', indexHtml.includes('assets/js/config.js'));
  check('references generated.js', indexHtml.includes('assets/js/generated.js'));
  check('references downloads.js', indexHtml.includes('assets/js/downloads.js'));
  check('references main.js', indexHtml.includes('assets/js/main.js'));
  check('no react runtime', !indexHtml.includes('react.production.min.js') && !indexHtml.includes('react-dom.production.min.js'));
  check('no react site.js', !indexHtml.includes('assets/js/site.js'));
  check('no React root mount', !indexHtml.includes('id="root"'));

  const ids = ['nav', 'nav-menu', 'nav-burger', 'home', 'hero-bg', 'hero-title', 'hero-subtitle',
    'hero-lead', 'hero-trailer', 'hero-download', 'hero-stats', 'server', 'server-bg',
    'server-intro', 'server-stats', 'server-rates', 'classes', 'classes-bg', 'class-tabs',
    'class-panel', 'combat', 'combat-bg', 'combat-intro', 'combat-live', 'combat-modes',
    'combat-raids', 'roadmap', 'roadmap-bg', 'roadmap-intro', 'roadmap-grid', 'road-line-fill',
        'news', 'news-bg', 'news-title', 'news-accent', 'news-intro', 'news-tabs', 'news-grid',
    'news-tbody', 'download', 'download-bg', 'download-title', 'download-accent',
    'download-intro', 'download-grid', 'download-notes', 'community', 'community-bg', 'community-title',
    'community-accent', 'community-desc', 'community-actions', 'community-stats', 'community-discord',
    'services', 'services-bg', 'services-title', 'services-accent', 'services-intro', 'svc-tabs',
    'svc-grid', 'footer', 'footer-bg', 'footer-tagline', 'footer-copyright', 'footer-cols',
    'music-control', 'music-toggle', 'bgm'];
  ids.forEach((id) => check('has #' + id, indexHtml.includes('id="' + id + '"')));

  const navItems = ['Home', 'Server', 'News', 'Classes', 'Combat', 'Roadmap', 'Download', 'Community', 'Services'];
  check('nav items present', navItems.every((n) => indexHtml.includes('>' + n + '<')));

  const mainJs = fs.statSync(path.join(root, 'public/assets/js/main.js'));
  const css = fs.statSync(path.join(root, 'public/assets/css/style.css'));
  check('main.js non-trivial', mainJs.size > 5000);
  check('style.css non-trivial', css.size > 5000);

  ['assets/logo.png', 'assets/hero-bg-01.png', 'assets/css/style.css'].forEach((a) => {
    check('asset exists: ' + a, fs.existsSync(path.join(root, 'public', a)) || fs.existsSync(path.join(root, a)));
  });

  // 5) downloads.js real mirror URLs
  const dl = loadScript('public/assets/js/downloads.js');
  const gd = (dl.window.RGSE_DOWNLOAD_MIRRORS && dl.window.RGSE_DOWNLOAD_MIRRORS.googleDrive) || [];
  const mf = (dl.window.RGSE_DOWNLOAD_MIRRORS && dl.window.RGSE_DOWNLOAD_MIRRORS.mediafire) || [];
  check('2 Google Drive mirrors', gd.length === 2, 'expected 2 Google Drive mirrors, got ' + gd.length);
  check('2 MediaFire mirrors', mf.length === 2, 'expected 2 MediaFire mirrors, got ' + mf.length);
  const allUrls = [...gd, ...mf].map((m) => m.url);
  allUrls.forEach((u) => {
    check('mirror url valid: ' + u,
      /^https:\/\/drive\.google\.com\//.test(u) || /^https:\/\/www\.mediafire\.com\//.test(u),
      'unexpected mirror url: ' + u);
  });

  // 6) config.js branding + nav
  const cfg = loadScript('public/assets/js/config.js');
  const site = (cfg.window.SITE_CONFIG && cfg.window.SITE_CONFIG.site) || {};
  check('brand preserved (RanOnline EP9)', /RanOnline EP9/i.test(site.title || ''), 'site title = ' + site.title);
  check('tagline preserved', /(EP9|Student) calls\. Answer it\./i.test(site.tagline || ''), 'tagline = ' + site.tagline);
  const nav = (cfg.window.SITE_CONFIG && cfg.window.SITE_CONFIG.nav) || [];
  check('config nav 9 items', nav.length === 9, 'nav length = ' + nav.length);

  // 7) 9 content .txt present
  const txt = ['news-open-beta.txt', 'news-patch-1-1.txt', 'news-tyranny-wars.txt',
    'event-double-exp.txt', 'event-giveaway.txt', 'tutorial-install.txt',
    'tutorial-classes.txt', 'tutorial-middleman.txt'];
  txt.forEach((t) => check('content file: ' + t, fs.existsSync(path.join(root, 'public/assets/content', t))));

  // classes count preserved (7)
  const gen = (() => { try { return loadScript('public/assets/js/generated.js').window.SITE_CONFIG; } catch (e) { return {}; } })();
  const classes = (gen && gen.classes && gen.classes.list) ? gen.classes.list.length : 0;
  check('7 classes generated', classes === 7, 'classes = ' + classes);

  // 8) services + live Google Sheet wiring. Services are driven LIVE from the
  // published Google Sheet at runtime: the Sheet URLs configured in [SERVICES]
  // are copied into services.sheets (an array of {section, url}) and main.js
  // fetches them in the browser on page load so the team can add/edit/delete
  // rows WITHOUT a rebuild. The gate verifies the configured URLs actually made
  // it into generated.js services.sheets, and the offline fallback rows (local
  // *.csv / Service_x) are present as a safety net.
  const iniText = (() => { try { return fs.readFileSync(path.join(root, 'config.ini'), 'utf8'); } catch (e) { return ''; } })();
  const sheetUrls = iniText.split(/\r?\n/).filter((l) => /^Sheet(Streamer|Middleman|Pilot)=https?:/i.test(l.trim()));
  const svc = (gen && gen.services) || {};
  if (sheetUrls.length) {
    const sheets = svc.sheets || [];
    const wired = new Set(sheets.map((x) => x && x.url));
    sheetUrls.forEach((line) => {
      const eq = line.indexOf('=');
      const url = (eq === -1 ? '' : line.slice(eq + 1)).trim();
      check('services.sheets includes ' + url.slice(0, 40) + '…', wired.has(url), 'config.ini Sheet URL missing from generated.js services.sheets');
    });
    check('services.sheets has ' + sheetUrls.length + ' entry/entries', sheets.length === sheetUrls.length,
      'services.sheets length = ' + sheets.length + ', expected ' + sheetUrls.length);
  } else {
    ok.push('services sheet check skipped (no Sheet_* URLs in config.ini)');
  }
  // Offline fallback: baked rows must exist so the site still renders on a
  // static host if the live fetch is blocked/offline.
  const fallbackItems = svc.items || [];
  check('services has offline fallback rows', fallbackItems.length > 0, 'no fallback service rows in generated.js; got ' + fallbackItems.length);

  // 9) DOWNLOAD live Google Sheet wiring. Mirrors the Services check above: the
  // published CSV URL configured in [DOWNLOAD] SheetDownload must be present in
  // generated.js download.sheets so main.js can fetch it LIVE in the browser
  // (the sheet sends `access-control-allow-origin: *`, so no rebuild is needed
  // when staff add rows). A regression that empties download.sheets (and so
  // disables the live fetch) is caught here.
  const dlSheetUrls = iniText.split(/\r?\n/).filter((l) => /^SheetDownload=https?:/i.test(l.trim()));
  const dlCfg = (gen && gen.download) || {};
  if (dlSheetUrls.length) {
    const dlSheets = dlCfg.sheets || [];
    const dlWired = new Set(dlSheets.map((x) => x && x.url));
    dlSheetUrls.forEach((line) => {
      const eq = line.indexOf('=');
      const url = (eq === -1 ? '' : line.slice(eq + 1)).trim();
      check('download.sheets includes ' + url.slice(0, 40) + '…', dlWired.has(url),
        'config.ini SheetDownload URL missing from generated.js download.sheets');
    });
    check('download.sheets has ' + dlSheetUrls.length + ' entry/entries', dlSheets.length === dlSheetUrls.length,
      'download.sheets length = ' + dlSheets.length + ', expected ' + dlSheetUrls.length);
  } else {
    ok.push('download sheet check skipped (no SheetDownload URL in config.ini)');
  }
} catch (e) {
  fail.push('GATE ERROR: ' + e.message);
}

console.log('\n[verify-site] ' + ok.length + ' passed, ' + fail.length + ' failed');
if (fail.length) {
  console.log('\nFAILURES:');
  fail.forEach((f) => console.log('  x ' + f));
  process.exit(2);
}
console.log('[verify-site] all checks green.');
process.exit(0);

