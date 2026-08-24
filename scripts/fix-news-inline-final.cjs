const fs = require('fs');
const f = 'public/news.html';
let t = fs.readFileSync(f, 'utf8');

const startIdx = t.indexOf('function inline(t) {');
const openIdx = t.indexOf('{', startIdx);
let depth = 0, endIdx = openIdx;
for (; endIdx < t.length; endIdx++) {
  if (t[endIdx] === '{') depth++;
  else if (t[endIdx] === '}') { depth--; if (depth === 0) { endIdx++; break; } }
}

const newFunc = `/* mini-markdown for article .txt files:
   **b** __u__ ~~s~~ *i* "- item"
   [img]url[img][auto|WxH] - inline images
   [col]...[/col] - column (flex basis 50%)
   [col3]...[/col3] - 3-column grid
   [table]...[/table] - simple tables (pipe-separated)
   [code]...[/code] - inline code
   [quote]...[/quote] - blockquote
   [callout]...[/callout] - highlighted callout box
   [hr] - horizontal rule
   [br] - line break
*/
    function inline(t) {
      return t
        .replace(/\\[img\\](.*?)\\[img\\](?:\\\\[(auto|\\d+x\\d+)\\\\])?/g, function (_m, url, size) {
          url = String(url).replace(/"/g, '"');
          if (url.indexOf('://') === -1 && url.indexOf('/') !== 0) url = 'assets/content/' + url;
          var dim = '';
          if (size && size !== 'auto') { var p = size.split('x'); dim = ' width="' + p[0] + '" height="' + p[1] + '"'; }
          return '<img class="txt-img" src="' + url + '" alt=""' + dim + '>';
        })
        .replace(/\\[table\\]([\\s\\S]*?)\\[\\/table\\]/g, function (_m, content) {
          var rows = content.trim().split('\\n');
          var html = '<table class="txt-table">';
          rows.forEach(function (row, i) {
            var cells = row.split('|').map(function (c) { return c.trim(); });
            var tag = i === 0 ? 'th' : 'td';
            html += '<tr>';
            cells.forEach(function (cell) { html += '<' + tag + '>' + inline(cell) + '</' + tag + '>'; });
            html += '</tr>';
          });
          html += '</table>';
          return html;
        })
        .replace(/\\[callout\\]([\\s\\S]*?)\\[\\/callout\\]/g, '<div class="txt-callout">$1</div>')
        .replace(/\\[quote\\]([\\s\\S]*?)\\[\\/quote\\]/g, '<blockquote class="txt-quote">$1</blockquote>')
        .replace(/\\[code\\](.*?)\\[\\/code\\]/g, '<code class="txt-code">$1</code>')
        .replace(/\\[col\\]([\\s\\S]*?)\\[\\/col\\]/g, '<div class="txt-col">$1</div>')
        .replace(/\\[col3\\]([\\s\\S]*?)\\[\\/col3\\]/g, '<div class="txt-col3">$1</div>')
        .replace(/\\[hr\\]/g, '<hr class="txt-hr">')
        .replace(/\\[br\\]/g, '<br>')
        .replace(/\\*\\*(.+?)\\*\\*/g, "<strong>$1</strong>")
        .replace(/__(.+?)__/g, "<u>$1</u>")
        .replace(/~~(.+?)~~/g, "<del>$1</del>")
        .replace(/\\*(.+?)\\*/g, "<em>$1</em>");
    }`;

const newT = t.slice(0, startIdx) + newFunc + t.slice(endIdx);
fs.writeFileSync(f, newT);
console.log('fixed news.html inline function');