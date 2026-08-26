/* Parser-parity gate for the content editor + reader.
 * Ensures the inline() mini-markdown parser is identical across the three
 * copies (public/assets/js/main.js = live reader, public/news.html = standalone
 * reader, public/admin-content-editor.html = editor preview) so the editor's
 * Preview is byte-for-byte what the live reader renders — including the
 * [img]url[img][auto|WxH] inline-image syntax.
 * Zero deps. Runs in Node. Exits 2 on any mismatch.
 */
const fs = require('fs');
const path = require('path');

let failures = 0;
function ok(cond, msg) {
  if (cond) { console.log('  PASS  ' + msg); }
  else { console.log('  FAIL  ' + msg); failures++; }
}

// Extract a top-level `function <name>(...) { ... }` by balancing braces.
function extractFn(src, name) {
  const sig = 'function ' + name + '(';
  const start = src.indexOf(sig);
  if (start === -1) throw new Error('function ' + name + ' not found');
  const open = src.indexOf('{', start);
  let depth = 0, i = open;
  for (; i < src.length; i++) {
    const c = src[i];
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) { i++; break; } }
  }
  const fnText = src.slice(start, i);
  // eslint-disable-next-line no-new-func
  return new Function(fnText + '; return ' + name + ';')();
}

// Normalize whitespace so indentation differences between copies don't fail
// the logic-parity gate (main.js uses 4-space, HTML/editor use 6-space indent).
function normWs(s) { return s.replace(/\s+/g, ' ').trim(); }

const root = path.join(__dirname, '..');
const mainJs = fs.readFileSync(path.join(root, 'public/assets/js/main.js'), 'utf8');
const newsHtml = fs.readFileSync(path.join(root, 'public/news.html'), 'utf8');
const editorHtml = fs.readFileSync(path.join(root, 'public/admin-content-editor.html'), 'utf8');

// The parser lives inside an IIFE in both HTML/JS; pull the inline() source text.
function inlineSource(src) {
  const sig = 'function inline(t) {';
  const start = src.indexOf(sig);
  const open = src.indexOf('{', start);
  let depth = 0, i = open;
  for (; i < src.length; i++) {
    const c = src[i];
    if (c === '{') depth++; else if (c === '}') { depth--; if (depth === 0) { i++; break; } }
  }
  return src.slice(start, i);
}

const inlineMain = inlineSource(mainJs);
const inlineNews = inlineSource(newsHtml);
const inlineEditor = inlineSource(editorHtml);

const inlineMainFn = extractFn(mainJs, 'inline');
const inlineEditorFn = extractFn(editorHtml, 'inline');

console.log('\n[1] inline() source sync across copies (whitespace-normalized)');
ok(normWs(inlineMain) === normWs(inlineEditor), 'main.js inline() == editor inline() (source)');
ok(normWs(inlineNews) === normWs(inlineEditor), 'news.html inline() == editor inline() (source)');
ok(normWs(inlineMain) === normWs(inlineNews), 'main.js inline() == news.html inline() (source)');

// Inline-image syntax must be present in all three (the txt-img class is unique to the image replacement).
ok(/txt-img/.test(inlineMain), 'main.js supports [img] inline-image');
ok(/txt-img/.test(inlineEditor), 'editor supports [img] inline-image');

console.log('\n[2] inline-image rendering (auto + custom size)');
const cases = [
  { in: '[img]/images/test.png[img][auto]', expect: '<img class="txt-img" src="/images/test.png" alt="">' },
  { in: '[img]https://x.com/a.jpg[img][320x200]', expect: '<img class="txt-img" src="https://x.com/a.jpg" alt="" width="320" height="200">' },
  { in: 'see [img]/b.png[img][100x50] here', expect: 'see <img class="txt-img" src="/b.png" alt="" width="100" height="50"> here' },
  { in: '**bold** then [img]/c.png[img][auto] end', expect: '<strong>bold</strong> then <img class="txt-img" src="/c.png" alt=""> end' },
];
cases.forEach(function (c) {
  const gotMain = inlineMainFn(c.in);
  const gotEditor = inlineEditorFn(c.in);
  ok(gotMain === c.expect, 'main.js  [' + c.in + '] -> ' + gotMain);
  ok(gotEditor === gotMain, 'editor == main.js for [' + c.in + ']');
});

console.log('\n[2b] H2/H3 heading rendering + editor preview parity');
const headingCases = [
  { in: '[h2]Patch Notes[/h2]', expect: '<h2 class="txt-h2">Patch Notes</h2>' },
  { in: '[h3]Balance Changes[/h3]', expect: '<h3 class="txt-h3">Balance Changes</h3>' },
  { in: 'text [h2]Title Here[/h2] more', expect: 'text <h2 class="txt-h2">Title Here</h2> more' },
  { in: '[h3]a **bold** heading[/h3]', expect: '<h3 class="txt-h3">a <strong>bold</strong> heading</h3>' },
];
headingCases.forEach(function (c) {
  const gotMain = inlineMainFn(c.in);
  const gotEditor = inlineEditorFn(c.in);
  ok(gotMain === c.expect, 'main.js  [' + c.in + '] -> ' + gotMain);
  ok(gotEditor === gotMain, 'editor == main.js for [' + c.in + ']');
});

console.log('\n[3] byte-identical HTML over real .txt files');
const contentDir = path.join(root, 'public/assets/content');
fs.readdirSync(contentDir).filter(function (f) { return /\.txt$/i.test(f); }).forEach(function (f) {
  const raw = fs.readFileSync(path.join(contentDir, f), 'utf8');
  const lines = raw.split(/\n/).map(function (l) { return l.replace(/\r/g, ''); }).filter(function (l) { return l.trim(); });
  const m = lines.map(function (l) { return inlineMainFn(l); }).join('|');
  const e = lines.map(function (l) { return inlineEditorFn(l); }).join('|');
  ok(m === e, f + ' inline render matches');
});

console.log('\n[4] editor hidden + loads from assets/content');
ok(/noindex/.test(editorHtml) || /robots/i.test(editorHtml), 'editor has noindex/robots meta');
ok(editorHtml.indexOf('assets/content/') !== -1, 'editor fetches txt from assets/content/');
ok(editorHtml.indexOf('id="btnUpdate"') !== -1 && editorHtml.indexOf('id="btnDelete"') !== -1, 'editor has Update/Delete controls');

console.log('\n' + (failures === 0 ? 'ALL PASS' : (failures + ' FAILURE(S)')));
process.exit(failures === 0 ? 0 : 2);
