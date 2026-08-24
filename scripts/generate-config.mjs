/* ============================================================================
 * generate-config.mjs — parses config.ini => publicassets/js/generated.js
 * Single source of truth: edit config.ini, then run `npm run build`.
 * ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

function readIni(p) {
  const raw = fs.readFileSync(p, 'utf8');
  const result = {};
  let cur = null;
  for (const lineRaw of raw.split(/\r?\n/)) {
    const line = lineRaw.trim();
    if (!line || line.startsWith(';') || line.startsWith('#')) continue;
    const sec = line.match(/^\[(.+)\]$/);
    if (sec) { cur = sec[1]; result[cur] = {}; continue; }
    const eq = line.indexOf('=');
    if (eq === -1 || !cur) continue;
    const key = line.slice(0, eq).trim();
    const val = line.slice(eq + 1).trim();
    result[cur][key] = val;
  }
  return result;
}
const splitPipe = (v) => String(v).split('|').map((s) => s.trim());
const num = (v, d) => { const n = Number(v); return Number.isFinite(n) ? n : d; };
const bool = (v) => v === 'true' || v === '1' || v === 'yes';
const get = (ini, sec, key, d) =>
  (ini[sec] && ini[sec][key] != null && ini[sec][key] !== '') ? ini[sec][key] : d;
const keysOf = (ini, sec, prefix) =>
  Object.keys(ini[sec] || {}).filter((k) => k.startsWith(prefix)).sort();

/* ---- CSV support for services (edit services.csv — one row per person) ---- */
function parseCsv(text) {
  const rows = [];
  let row = [], field = '', i = 0, inQ = false;
  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  while (i < text.length) {
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
    if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; i++; continue; }
    field += c; i++;
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows;
}
const SERVICE_DEFAULT_IMG = {
  Pilots: 'assets/service-pilots.png',
  Middleman: 'assets/service-middleman.png',
  Streamer: 'assets/service-streamer.png'
};
/* Read one category CSV (database of people). Returns array of objects, or null if missing/empty. */
function readCatCsv(file, section) {
  const p = path.join(root, file);
  if (!fs.existsSync(p)) return null;
  const raw = parseCsv(fs.readFileSync(p, 'utf8')).filter((r) => r.some((c) => c.trim() !== ''));
  if (raw.length < 2) return null;
  const header = raw[0].map((h) => h.trim().toLowerCase());
  const out = [];
  for (let r = 1; r < raw.length; r++) {
    const cells = raw[r];
    const row = { section };
    let name = '';
    for (let c = 0; c < header.length; c++) {
      const key = header[c];
      const val = (cells[c] || '').trim();
      if (key === 'name') name = val;
      else row[key] = val;
    }
    if (!name) continue;
    row.name = name;
    out.push(row);
  }
  return out.length ? out : null;
}

/* Read a news CSV (date,title,image,link,description). `kind` is the
   category name ("announcement" | "event") used to namespace ids so the two
   CSVs never collide on the shared `id` field. Returns array of objects, or
   null if missing/empty. */
function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'article';
}
// Maps a CSV `kind` to the Bossran-style category used for the ALL / NEWS /
// ANNOUNCEMENT / GUIDE filter. announcement + event + tutorial each become one
// of those categories; `type` is the finer label shown on each row.
function kindToCat(kind) {
  if (kind === 'event') return 'NEWS';
  if (kind === 'tutorial') return 'GUIDE';
  return 'ANNOUNCEMENT';
}
function readNewsCsv(file, kind) {
  const p = path.join(root, file);
  if (!fs.existsSync(p)) return null;
  const raw = parseCsv(fs.readFileSync(p, 'utf8')).filter((r) => r.some((c) => c.trim() !== ''));
  if (raw.length < 2) return null;
  const header = raw[0].map((h) => h.trim().toLowerCase());
  const out = [];
  const seen = {};
  for (let r = 1; r < raw.length; r++) {
    const cells = raw[r];
    const row = {};
    for (let c = 0; c < header.length; c++) row[header[c]] = (cells[c] || '').trim();
    if (!row.title && !row.context) continue;
    const baseId = row.id || String(r);
    // Stable, unique slug: if the title repeats we disambiguate with the id.
    let slug = row.slug ? slugify(row.slug) : slugify(row.title);
    if (seen[slug]) slug = slug + '-' + baseId;
    seen[slug] = true;
    const cat = kindToCat(kind);
    out.push({
      id: baseId,
      // Namespaced uid so announcement vs event items never collide on the
      // shared `id` (both CSVs default to 1,2,3). The detail route uses slug.
      uid: (kind === 'event' ? 'e' : kind === 'tutorial' ? 'g' : 'a') + baseId,
      slug: slug,
      type: row.type || (kind === 'event' ? 'NEWS' : kind === 'tutorial' ? 'GUIDE' : 'ANNOUNCEMENT'),
      cat: cat,
      date: row.date || '',
      eventDate: row.eventdate || row.eventDate || '',
      author: row.author || 'Admin',
      title: row.title || '',
      image: row.image || '',
      link: row.link || '',
      description: row.description || '',
      context: row.context || '',
      // Per-item hide flag (mirrors the `Enabled` bool pattern used elsewhere).
      // Set `hide=true` in the CSV to remove an item from the News/Guide listing,
      // the Main Page preview, the filter and its generated article page.
      hide: bool(row.hide || ''),
      text: (row.context && fs.existsSync(path.join(root, 'public', 'assets', 'content', row.context)))
        ? fs.readFileSync(path.join(root, 'public', 'assets', 'content', row.context), 'utf8')
        : ''
    });
  }
  // Drop hidden items entirely so they never reach the listing, preview,
  // filter or the generated static article pages.
  const visible = out.filter((it) => !it.hide);
  return visible.length ? visible : null;
}

/* ---------------------------------------------------------------------------
 * Google Sheets integration (RUNTIME / browser-side).
 *
 * The Services section is driven LIVE from a published Google Sheet so the
 * team can add rows without a rebuild. The published CSV URLs live in
 * [SERVICES] Sheet_* (File -> Share -> Publish to web -> CSV; a "viewer with
 * link" share still 401s). generate-config just copies those URLs into the
 * runtime config (services.sheets); main.js fetches them in the browser on
 * page load and re-paints. The baked services.items (from local *.csv or
 * Service_x) remain as an OFFLINE FALLBACK if the fetch fails.
 * ------------------------------------------------------------------------- */

export function build(ini) {
  // Categories suppressed across the News list, the Main Page preview and the
  // standalone article pages. From [NEWS_CONFIG] HiddenCategories (a comma list
  // of category keys: NEWS, ANNOUNCEMENT, EVENT, GUIDE).
  const hiddenCategories = (get(ini, 'NEWS_CONFIG', 'HiddenCategories', '') || '')
    .split(',').map((s) => s.trim().toUpperCase()).filter(Boolean);
  return {
    site: {
      title: get(ini, 'SITE', 'Title', 'RanOnline EP9'),
      tagline: get(ini, 'SITE', 'Tagline', 'EP9 calls. Answer it.'),
      brandShort: get(ini, 'SITE', 'BrandShort', 'RAN EP9'),
      brandLong: get(ini, 'SITE', 'BrandLong', 'RanOnline EP9'),
      logo: get(ini, 'SITE', 'Logo', 'assets/logo.png'),
      favicon: get(ini, 'SITE', 'Favicon', 'assets/logo.png'),
      version: get(ini, 'SITE', 'Version', 'EP9'),
      year: get(ini, 'SITE', 'Year', '2026')
    },
    nav: get(ini, 'NAV', 'Items', 'Home,Server,News,Classes,Combat,Roadmap,Download,Community,Services')
      .split(',').map((s) => s.trim()).filter(Boolean),
    hero: {
      title: get(ini, 'HERO', 'Title', 'RAN ONLINE'),
      subtitle: get(ini, 'HERO', 'Subtitle', 'RAN ONLINE EP9'),
      description: get(ini, 'HERO', 'Description', ''),
      bg: get(ini, 'HERO', 'Background', 'assets/hero-bg.png'),
      ctaPlay: get(ini, 'HERO', 'CtaPlay', 'WATCH TRAILER'),
      ctaPlayUrl: get(ini, 'HERO', 'CtaPlayUrl', ''),
      ctaDownload: get(ini, 'HERO', 'CtaDownload', 'DOWNLOAD NOW')
    },
    music: {
      enabled: bool(get(ini, 'MUSIC', 'Enabled', 'true')),
      src: get(ini, 'MUSIC', 'Src', ''),
      title: get(ini, 'MUSIC', 'Title', 'RanOnline EP9'),
      autoplay: bool(get(ini, 'MUSIC', 'Autoplay', 'false')),
      bounce: bool(get(ini, 'MUSIC', 'Bounce', 'true')),
      aggressive: bool(get(ini, 'MUSIC', 'Aggressive', 'true')),
      lowGain: num(get(ini, 'MUSIC', 'LowGain', '1.0')),
      highGain: num(get(ini, 'MUSIC', 'HighGain', '1.0'))
      },
      audioFx: {
        enabled: bool(get(ini, 'MUSIC_AUDIO_FX', 'Enabled', 'false')),
        clickVolume: num(get(ini, 'MUSIC_AUDIO_FX', 'ClickVolume', '0.3')),
        hoverVolume: num(get(ini, 'MUSIC_AUDIO_FX', 'HoverVolume', '0.15'))
      },
    nav: get(ini, 'NAV', 'Items', 'Home,Server,News,Classes,Combat,Roadmap,Download,Community,Services'),
    background: {
      zoom: num(get(ini, 'BACKGROUND', 'Zoom', '1.1'), 1.1),
      rotate: num(get(ini, 'BACKGROUND', 'Rotate', '3'), 3),
      duration: num(get(ini, 'BACKGROUND', 'Duration', '40'), 40)
    },
    server: {
      bg: get(ini, 'SERVER', 'Background', 'assets/hero-bg-02.png'),
      intro: get(ini, 'SERVER', 'Intro', ''),
      stats: keysOf(ini, 'SERVER', 'Stat_').map((k) => { const [label, value, note] = splitPipe(ini.SERVER[k]); return { label, value, note: note || '' }; }),
      rates: keysOf(ini, 'SERVER', 'Rate_').map((k) => { const [label, value] = splitPipe(ini.SERVER[k]); return { k: label, v: value }; })
    },
    classes: {
      bg: get(ini, 'CLASSES', 'Background', 'assets/hero-bg-03.png'),
      list: keysOf(ini, 'CLASSES', 'CLASS_').map((k) => {
        const [name, role, spec, difficulty, img, playstyle, pvpAdvantage, pvpDisadvantage] = splitPipe(ini.CLASSES[k]);
        return { name, role, spec, difficulty: num(difficulty, 3), img, playstyle, pvpAdvantage, pvpDisadvantage };
      })
    },
    combat: {
      bg: get(ini, 'COMBAT', 'Background', 'assets/hero-bg-04.png'),
      intro: get(ini, 'COMBAT', 'Intro', ''),
      liveEvent: {
        tag: get(ini, 'COMBAT', 'LiveEventTag', 'LIVE EVENT'),
        title: get(ini, 'COMBAT', 'LiveEventTitle', ''),
        desc: get(ini, 'COMBAT', 'LiveEventDesc', ''),
        schedule: get(ini, 'COMBAT', 'LiveEventSchedule', '')
      },
      modes: keysOf(ini, 'COMBAT', 'MODE_').map((k) => { const [n, t, cap, schedule, hot] = splitPipe(ini.COMBAT[k]); return { n, t, cap, schedule, hot: bool(hot) }; }),
      raids: keysOf(ini, 'COMBAT', 'RAID_').map((k) => { const [n, t, limit] = splitPipe(ini.COMBAT[k]); return { n, t, limit }; })
    },
    roadmap: {
      bg: get(ini, 'ROADMAP', 'Background', 'assets/hero-bg-05.png'),
      intro: get(ini, 'ROADMAP', 'Intro', ''),
      progress: num(get(ini, 'ROADMAP', 'roadprogress', '0'), 0),
      items: keysOf(ini, 'ROADMAP', 'ROADMAP_').map((k) => {
        const [phase, title, status, ...points] = splitPipe(ini.ROADMAP[k]);
        return { phase, title, status, points: points.filter(Boolean) };
      })
    },
    download: {
      title: get(ini, 'DOWNLOAD', 'Title', 'GET IN THE'),
      accent: get(ini, 'DOWNLOAD', 'Accent', 'FIGHT.'),
      intro: get(ini, 'DOWNLOAD', 'Intro', ''),
      mirrors: [
        ...keysOf(ini, 'DOWNLOAD', 'DRIVE_').map((k) => { const [label, url, note] = splitPipe(ini.DOWNLOAD[k]); return { label, url, note: note || '' }; }),
        ...keysOf(ini, 'DOWNLOAD', 'MEDIAFIRE_').map((k) => { const [label, url, note] = splitPipe(ini.DOWNLOAD[k]); return { label, url, note: note || '' }; })
      ],
      discordUrl: get(ini, 'DOWNLOAD', 'DiscordUrl', ''),
      facebookUrl: get(ini, 'DOWNLOAD', 'FacebookUrl', ''),
      // Live Google Sheet for download mirrors (published CSV). main.js fetches this
      // in the browser so new rows added by staff appear without a rebuild.
      sheets: [
        get(ini, 'DOWNLOAD', 'SheetDownload', '') ? { section: 'Download', url: get(ini, 'DOWNLOAD', 'SheetDownload', '') } : null
      ].filter(Boolean)
    },
    news: (function () {
      const announcement = readNewsCsv('announcement.csv', 'announcement') || [];
      const event = readNewsCsv('event.csv', 'event') || [];
      const tutorial = readNewsCsv('tutorial.csv', 'tutorial') || [];
      // Single chronological feed (newest first) used by the Bossran-style
      // News list + filter. Each item keeps its slug so rows link to a real
      // standalone content page (news/<slug>.html).
      const items = announcement.concat(event, tutorial).sort(function (a, b) {
        return String(b.date || '').localeCompare(String(a.date || ''));
      });
      return {
        bg: get(ini, 'NEWS', 'Background', 'assets/hero-bg-08.png'),
        title: get(ini, 'NEWS', 'Title', 'THE LATEST'),
        accent: get(ini, 'NEWS', 'Accent', 'NEWS.'),
        intro: get(ini, 'NEWS', 'Intro', ''),
        tabAnnouncement: get(ini, 'NEWS', 'TabAnnouncement', 'Announcement'),
        tabEvent: get(ini, 'NEWS', 'TabEvent', 'Event'),
        // How many cards to show in the News preview on the main page, and how
        // many per page on the dedicated /news listing (both editable in config.ini).
        homeLimit: num(get(ini, 'NEWS', 'HomeLimit', 4), 4),
        pageSize: num(get(ini, 'NEWS', 'PageSize', 10), 10),
        announcement: announcement,
        event: event,
        tutorial: tutorial,
        // Drop any item whose category is in HiddenCategories (NEWS/GUIDE/etc.)
        // so hidden categories never reach the feed, the Main Page preview, the
        // filter or the generated article pages.
        items: hiddenCategories.length ? items.filter(function (it) {
          return hiddenCategories.indexOf((it.cat || it.type || '').toUpperCase()) === -1;
        }) : items
      };
    })(),
    // Bossran-style category filter shown on the News list page. The order here
    // is the order the filter chips appear (ALL first, then each category).
    // Categories listed in HiddenCategories are removed from the chip row.
    newsFilter: [
      { key: 'all', label: 'All' },
      { key: 'news', label: 'News' },
      { key: 'announcement', label: 'Announcement' },
      { key: 'guide', label: 'Guide' }
    ].filter(function (f) { return hiddenCategories.indexOf(f.key.toUpperCase()) === -1; }),
    // Centralized News configuration. All list/pagination behavior derives from
    // this single object — change itemsPerPage (10/20) and the list auto-updates.
    newsConfig: {
      itemsPerPage: num(get(ini, 'NEWS_CONFIG', 'ItemsPerPage', 10), 10),
      showImagesInList: bool(get(ini, 'NEWS_CONFIG', 'ShowImagesInList', 'false')),
      showImagesInArticle: bool(get(ini, 'NEWS_CONFIG', 'ShowImagesInArticle', 'true')),
      showDate: bool(get(ini, 'NEWS_CONFIG', 'ShowDate', 'true')),
      showCategory: bool(get(ini, 'NEWS_CONFIG', 'ShowCategory', 'true')),
      showExcerpt: bool(get(ini, 'NEWS_CONFIG', 'ShowExcerpt', 'true')),
      pagination: bool(get(ini, 'NEWS_CONFIG', 'Pagination', 'true')),
      previousLabel: get(ini, 'NEWS_CONFIG', 'PreviousLabel', 'Previous'),
      nextLabel: get(ini, 'NEWS_CONFIG', 'NextLabel', 'Next')
    },
    community: {
      title: get(ini, 'COMMUNITY', 'Title', 'JOIN THE'),
      accent: get(ini, 'COMMUNITY', 'Accent', 'LEGEND.'),
      desc: get(ini, 'COMMUNITY', 'Desc', ''),
      discordUrl: get(ini, 'COMMUNITY', 'DiscordUrl', ''),
      facebookUrl: get(ini, 'COMMUNITY', 'FacebookUrl', ''),
      facebookGroupUrl: get(ini, 'COMMUNITY', 'FacebookGroupUrl', ''),
      stats: keysOf(ini, 'COMMUNITY', 'Stat_').map((k) => { const [a, b] = splitPipe(ini.COMMUNITY[k]); return [a, b]; }),
      facebookPage: get(ini, 'COMMUNITY', 'FacebookPage', 'RanOnlineEP9')
    },
    services: {
      bg: get(ini, 'SERVICES', 'Background', 'assets/hero-bg-07.png'),
      title: get(ini, 'SERVICES', 'Title', 'OUR'),
      accent: get(ini, 'SERVICES', 'Accent', 'SERVICES.'),
      intro: get(ini, 'SERVICES', 'Intro', ''),
      // per-category "apply" link (shown as the first card of each tab, keyed by section)
      apply: {
        Pilots: get(ini, 'SERVICES', 'ApplyPilots', ''),
        Middleman: get(ini, 'SERVICES', 'ApplyMiddleman', ''),
        Streamer: get(ini, 'SERVICES', 'ApplyStreamer', ''),
        Services: get(ini, 'SERVICES', 'ApplyServices', '')
      },
      // Per-category data sources (OFFLINE FALLBACK for the live sheet):
      // local CSV databases (pilot.csv / middleman.csv / streamer.csv), then
      // Service_x rows. At runtime main.js fetches services.sheets (the Google
      // Sheet CSVs) and overrides these with the live rows.
      items: (function () {
        const rows = [].concat(
          readCatCsv('pilot.csv', 'Pilots') || [],
          readCatCsv('middleman.csv', 'Middleman') || [],
          readCatCsv('streamer.csv', 'Streamer') || []
        );
        const mapped = rows.length
          ? rows
          : keysOf(ini, 'SERVICES', 'Service_').map((k) => {
              const [name, role, img, desc, cta, url] = splitPipe(ini.SERVICES[k]);
              return { name, role, img, desc, cta: cta || '', url: url || '', section: 'Services' };
            });
        return mapped.map((it) => {
          const def = SERVICE_DEFAULT_IMG[it.section] || 'assets/logo.png';
          return Object.assign({ img: def }, it);
        });
      })(),
      // Live Google Sheet tabs (published CSV). main.js fetches these in the
      // browser so new rows added by staff appear without a rebuild. Each entry
      // pairs a tab URL with the service section it populates.
      sheets: [
        get(ini, 'SERVICES', 'SheetStreamer', '') ? { section: 'Streamer', url: get(ini, 'SERVICES', 'SheetStreamer', '') } : null,
        get(ini, 'SERVICES', 'SheetMiddleman', '') ? { section: 'Middleman', url: get(ini, 'SERVICES', 'SheetMiddleman', '') } : null,
        get(ini, 'SERVICES', 'SheetPilot', '') ? { section: 'Pilots', url: get(ini, 'SERVICES', 'SheetPilot', '') } : null
      ].filter(Boolean)
    },
    facebook: {
      bg: get(ini, 'FACEBOOK', 'Background', 'assets/hero-bg-09.png'),
      pageId: get(ini, 'FACEBOOK', 'PageId', 'RanOnlineEP9'),
      title: get(ini, 'FACEBOOK', 'Title', 'FIND US ON'),
      accent: get(ini, 'FACEBOOK', 'Accent', 'FACEBOOK.')
    },
    footer: {
      bg: get(ini, 'FOOTER', 'Background', 'assets/hero-bg-10.png'),
      tagline: get(ini, 'FOOTER', 'Tagline', ''),
      columns: keysOf(ini, 'FOOTER', 'COLUMN_').map((k) => {
        const [title, ...links] = splitPipe(ini.FOOTER[k]);
        return { title, links: links.map((l) => { const [label, href] = l.split('>'); return { label: label.trim(), href: (href || '').trim() }; }) };
      }),
      copyright: get(ini, 'FOOTER', 'Copyright', '')
    }
  };
}

function toJs(obj) {
  return '/* AUTO-GENERATED from config.ini — do not edit by hand. */\n'
    + '(function () {\n'
    + '  window.SITE_CONFIG = Object.assign({}, window.SITE_CONFIG, ' + JSON.stringify(obj, null, 2) + ');\n'
    + '})();\n';
}

const ini = readIni(path.join(root, 'config.ini'));
// Services are driven LIVE from the published Google Sheet at runtime
// (services.sheets in generated.js). No build-time network fetch — the build
// stays deterministic and the team can add rows without a rebuild.
const obj = build(ini);
const js = toJs(obj);

const targets = [
  path.join(root, 'public', 'assets', 'js', 'generated.js'),
  path.join(root, 'src', 'config', 'generated.js')
];
for (const t of targets) {
  fs.mkdirSync(path.dirname(t), { recursive: true });
  fs.writeFileSync(t, js, 'utf8');
  console.log('wrote', path.relative(root, t));
}
console.log('config build complete.');

