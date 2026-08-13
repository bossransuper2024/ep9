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

export function build(ini) {
  return {
    site: {
      title: get(ini, 'SITE', 'Title', 'RAN GS Eternity EP9'),
      tagline: get(ini, 'SITE', 'Tagline', 'Eternity calls. Answer it.'),
      brandShort: get(ini, 'SITE', 'BrandShort', 'RAN GS'),
      brandLong: get(ini, 'SITE', 'BrandLong', 'ETERNITY'),
      logo: get(ini, 'SITE', 'Logo', 'assets/logo.png'),
      favicon: get(ini, 'SITE', 'Favicon', 'assets/logo.png'),
      version: get(ini, 'SITE', 'Version', 'EP9'),
      year: get(ini, 'SITE', 'Year', '2026')
    },
    hero: {
      title: get(ini, 'HERO', 'Title', 'RAN ONLINE'),
      subtitle: get(ini, 'HERO', 'Subtitle', 'ETERNITY EP9'),
      description: get(ini, 'HERO', 'Description', ''),
      bg: get(ini, 'HERO', 'Background', 'assets/hero-bg.png'),
      ctaPlay: get(ini, 'HERO', 'CtaPlay', 'WATCH TRAILER'),
      ctaPlayUrl: get(ini, 'HERO', 'CtaPlayUrl', ''),
      ctaDownload: get(ini, 'HERO', 'CtaDownload', 'DOWNLOAD NOW')
    },
    music: {
      enabled: bool(get(ini, 'MUSIC', 'Enabled', 'true')),
      src: get(ini, 'MUSIC', 'Src', ''),
      title: get(ini, 'MUSIC', 'Title', 'RAN GS Eternity'),
      autoplay: bool(get(ini, 'MUSIC', 'Autoplay', 'false'))
    },
    nav: get(ini, 'NAV', 'Items', 'Home,Server,Classes,Combat,Roadmap,Download,Community')
      .split(',').map((s) => s.trim()).filter(Boolean),
    server: {
      intro: get(ini, 'SERVER', 'Intro', ''),
      stats: keysOf(ini, 'SERVER', 'Stat_').map((k) => { const [label, value, note] = splitPipe(ini.SERVER[k]); return { label, value, note: note || '' }; }),
      rates: keysOf(ini, 'SERVER', 'Rate_').map((k) => { const [label, value] = splitPipe(ini.SERVER[k]); return { k: label, v: value }; }),
    },
    classes: keysOf(ini, 'CLASSES', 'CLASS_').map((k) => {
      const [name, role, spec, difficulty, img, playstyle, pvpAdvantage, pvpDisadvantage] = splitPipe(ini.CLASSES[k]);
      return { name, role, spec, difficulty: num(difficulty, 3), img, playstyle, pvpAdvantage, pvpDisadvantage };
    }),
    combat: {
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
      facebookUrl: get(ini, 'DOWNLOAD', 'FacebookUrl', '')
    },
    community: {
      title: get(ini, 'COMMUNITY', 'Title', 'JOIN THE'),
      accent: get(ini, 'COMMUNITY', 'Accent', 'LEGEND.'),
      desc: get(ini, 'COMMUNITY', 'Desc', ''),
      discordUrl: get(ini, 'COMMUNITY', 'DiscordUrl', ''),
      facebookUrl: get(ini, 'COMMUNITY', 'FacebookUrl', ''),
      stats: keysOf(ini, 'COMMUNITY', 'Stat_').map((k) => { const [a, b] = splitPipe(ini.COMMUNITY[k]); return [a, b]; }),
      facebookPage: get(ini, 'COMMUNITY', 'FacebookPage', 'RanGsEternityEp9')
    },
    facebook: {
      pageId: get(ini, 'FACEBOOK', 'PageId', 'RanGsEternityEp9'),
      title: get(ini, 'FACEBOOK', 'Title', 'FIND US ON'),
      accent: get(ini, 'FACEBOOK', 'Accent', 'FACEBOOK.')
    },
    footer: {
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

