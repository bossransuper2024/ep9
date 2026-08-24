/* ============================================================================
 * gen-news-pages.mjs — generates public/news/<slug>.html for every News item.
 *
 * The Bossran-style News list (main.js renderNews) links each row to
 * news.html?slug=<slug>, and news.html redirects that to news/<slug>.html.
 * This script materialises those standalone article pages at build time so the
 * links resolve to real files (no 404s, fully static, SEO-friendly).
 *
 * It reuses the same config + content pipeline as generate-config.mjs
 * (window.SITE_CONFIG.news.items, where each item already carries its full
 * `text` from its .txt context file) and the same mini-markdown renderer used
 * by the client, so article rendering matches the live site exactly.
 * ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from './generate-config.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const publicDir = path.join(root, 'public');
const newsDir = path.join(publicDir, 'news');
const templatePath = path.join(__dirname, 'news-article-template.html');

/* ---- minimal INI reader (mirrors generate-config.mjs) so we can feed build() */
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

function escAttr(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function escHtml(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/* Normalize a (possibly relative) asset path for a page living in /news/. */
function toRelAsset(v) {
  const s = String(v || '').trim();
  if (!s) return '';
  if (/^https?:\/\//.test(s) || s.startsWith('//') || s.startsWith('data:')) return s;
  if (s.startsWith('/')) return '..' + s;
  return '../' + s;
}


/* ---- mini-markdown (mirrors main.js renderText + inline) ------------------ */
function inlineMd(t) {
  return t
    .replace(/\[img\](.*?)\[img\](?:\[(auto|\d+x\d+)\])?/g, function (_m, url, size) {
      let u = String(url).replace(/^"|"$/g, '').trim();
      if (!/^https?:\/\//.test(u) && u.indexOf('/') !== 0) u = '../assets/content/' + u;
      let dim = '';
      if (size && size !== 'auto') {
        const p = size.split('x');
        dim = ' width="' + p[0] + '" height="' + p[1] + '"';
      }
      return '<img class="a-img" src="' + escAttr(u) + '" alt=""' + dim + '>';
    })
    .replace(/\[table\]([\s\S]*?)\[\/table\]/g, function (_m, content) {
      const rows = content.trim().split('\n');
      let html = '<table class="a-table">';
      rows.forEach(function (row, i) {
        const cells = row.split('|').map((c) => c.trim());
        const tag = i === 0 ? 'th' : 'td';
        html += '<tr>';
        cells.forEach((cell) => { html += '<' + tag + '>' + inlineMd(cell) + '</' + tag + '>'; });
        html += '</tr>';
      });
      html += '</table>';
      return html;
    })
    .replace(/\[callout\]([\s\S]*?)\[\/callout\]/g, '<div class="a-callout">$1</div>')
    .replace(/\[quote\]([\s\S]*?)\[\/quote\]/g, '<blockquote class="a-quote">$1</blockquote>')
    .replace(/\[code\](.*?)\[\/code\]/g, '<code class="a-code">$1</code>')
    .replace(/\[col\]([\s\S]*?)\[\/col\]/g, '<div class="a-col">$1</div>')
    .replace(/\[col3\]([\s\S]*?)\[\/col3\]/g, '<div class="a-col">$1</div>')
    .replace(/\[hr\]/g, '<hr class="a-hr">')
    .replace(/\[br\]/g, '<br>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<u>$1</u>')
    .replace(/~~(.+?)~~/g, '<del>$1</del>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
}

function renderText(raw) {
  const blocks = [];
  (raw || '').split(/\n/).forEach((lineRaw) => {
    const line = lineRaw.replace(/\r/g, '');
    if (!line.trim()) return;
    if (/^[-•]\s+/.test(line)) {
      blocks.push({ type: 'li', text: inlineMd(escHtml(line.replace(/^[-•]\s+/, ''))) });
    } else {
      blocks.push({ type: 'p', text: inlineMd(escHtml(line)) });
    }
  });
  let html = '';
  let inList = false;
  blocks.forEach((b) => {
    if (b.type === 'li') {
      if (!inList) { html += '\n    <ul class="a-list">'; inList = true; }
      html += '\n      <li>' + b.text + '</li>';
    } else {
      if (inList) { html += '\n    </ul>'; inList = false; }
      html += '\n    <p>' + b.text + '</p>';
    }
  });
  if (inList) html += '\n    </ul>';
  return html;
}

/* ---- map item category -> list filter key + body data-cat ---------------- */
function filterKeyFor(cat) {
  const c = String(cat || '').toUpperCase();
  if (c === 'NEWS') return 'news';
  if (c === 'ANNOUNCEMENT') return 'announcement';
  if (c === 'GUIDE') return 'guide';
  return 'all';
}


function main() {
  const ini = readIni(path.join(root, 'config.ini'));
  const config = build(ini);
  const items = (config.news && config.news.items) || [];
  if (!items.length) { console.log('[gen-news-pages] no news items found.'); return; }

  const template = fs.readFileSync(templatePath, 'utf8');
  fs.mkdirSync(newsDir, { recursive: true });

  const indexLinks = [];
  let count = 0;
  items.forEach((item) => {
    const slug = item.slug || item.uid;
    if (!slug) return;
    // Skip hidden items (already filtered out upstream in generate-config.mjs,
    // but guard here in case generated.js is ever edited by hand).
    if (item.hide) return;
    const cat = String(item.type || item.cat || 'NEWS');
    const date = item.date || '';
    const eventDate = item.eventDate || '';
    const author = item.author || 'Admin';
    const title = item.title || '';
    const image = item.image || '';
    const description = item.description || '';
    const text = item.text || description || 'Details coming soon.';

    const body = renderText(text);

    const dateHtml = date
      ? '\n        <span class="a-date">' + escHtml(date) + '</span>'
      : '';
    const eventHtml = eventDate
      ? '\n        <span class="a-event">Event ' + escHtml(eventDate) + '</span>'
      : '';
    const imgHtml = image
      ? '  <figure class="a-figure"><img src="' + escAttr(toRelAsset(image)) +
        '" alt="' + escAttr(title) + '" loading="lazy"></figure>'
      : '';
    const ogImage = image ? toRelAsset(image) : '';

    const html = template
      .replace(/<!--TITLE-->/g, escHtml(title))
      .replace(/<!--DESC-->/g, escAttr(description.slice(0, 160)))
      .replace(/<!--OG_IMAGE-->/g, escAttr(ogImage))
      .replace(/<!--DATACAT-->/g, escAttr(String(cat).toLowerCase()))
      .replace(/<!--TYPE-->/g, escHtml(cat))
      .replace(/<!--DATE-->/g, dateHtml)
      .replace(/<!--EVENTDATE-->/g, eventHtml)
      .replace(/<!--AUTHOR-->/g, escHtml(author))
      .replace(/<!--FILTER-->/g, filterKeyFor(cat))
      .replace(/<!--IMAGE-->/g, imgHtml)
      // CONTENT is already rendered HTML; do last so replacements above don't touch it.
      .replace(/<!--CONTENT-->/g, body);

    fs.writeFileSync(path.join(newsDir, slug + '.html'), html, 'utf8');
    indexLinks.push({ title, slug, cat, date, description });
    count++;
  });

  // Fallback index.html inside /news/ when someone hits /news/ directly.
  const rows = indexLinks.map((l) =>
    '<li><a href="' + escAttr(l.slug + '.html') + '">' + escHtml(l.title) + '</a>' +
    (l.date ? ' <span class="n-meta">' + escHtml(l.date) + '</span>' : '') + '</li>'
  ).join('\n');
  const indexHtml =
    '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">' +
    '<title>News Index — Ran Online EP9</title>' +
    '<link rel="stylesheet" href="../assets/css/style.css">' +
    '<link rel="stylesheet" href="../assets/css/article.css"></head>' +
    '<body class="article-page">' +
    '<header class="article-top"><div class="wrap">' +
    '<a class="a-brand" href="../index.html"><img src="../assets/logo.png" alt="Ran Online EP9">' +
    '<span><b>Ran Online EP9</b><small>NEWS &amp; INTEL</small></span></a>' +
    '<nav><a href="../index.html">Home</a><a href="../news.html" class="is-active">News</a>' +
    '<a href="../download.html">Download</a></nav></div></header>' +
    '<div class="article-tit"><div class="article-tbox"><h1 class="article-title">ALL NEWS</h1></div></div>' +
    '<article class="article-text"><ul class="a-list">' + rows + '</ul></article></body></html>';
  fs.writeFileSync(path.join(newsDir, 'index.html'), indexHtml, 'utf8');

  console.log('[gen-news-pages] wrote ' + count + ' article page(s) + index to public/news/');
}

main();

