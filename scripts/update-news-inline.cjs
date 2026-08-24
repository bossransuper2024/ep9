const fs = require('fs');
const f = 'public/news.html';
let t = fs.readFileSync(f, 'utf8');

// Find function inline(t) { and replace the entire function
const startIdx = t.indexOf('function inline(t) {');
if (startIdx === -1) { console.log('not found'); process.exit(1); }
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
        // Inline images: [img]url[img][auto|WxH]
        .replace(/\\\\[img\\\\](.*?)\\\\[img\\\\](?:\\\\[(auto|\\\\d+x\\\\d+)\\\\])?/g, function (_m, url, size) {
          url = String(url).replace(/\\"/g, '"');
          // Same normalization as hero image: bare filename -> assets/content/
          if (url.indexOf('://') === -1 && url.indexOf('/') !== 0) url = 'assets/content/' + url;
          var dim = '';
          if (size && size !== 'auto') { var p = size.split('x'); dim = ' width="' + p[0] + '" height="' + p[1] + '"'; }
          return '<img class="txt-img" src="' + url + '" alt=""' + dim + '>';
        })
        // Tables: [table]header1|header2\\nval1|val2[/table]
        .replace(/\\\\[table\\\\]([\\\\s\\\\S]*?)\\\\[\\\\/table\\\\]/g, function (_m, content) {
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
        // Callout boxes: [callout]content[/callout]
        .replace(/\\\\[callout\\\\]([\\\\s\\\\S]*?)\\\\[\\\\/callout\\\\]/g, '<div class="txt-callout">$1</div>')
        // Blockquotes: [quote]content[/quote]
        .replace(/\\\\[quote\\\\]([\\\\s\\\\S]*?)\\\\[\\\\/quote\\\\]/g, '<blockquote class="txt-quote">$1</blockquote>')
        // Inline code: [code]content[/code]
        .replace(/\\\\[code\\\\](.*?)\\\\[\\\\/code\\\\]/g, '<code class="txt-code">$1</code>')
        // Columns: [col]content[/col] (50/50)
        .replace(/\\\\[col\\\\]([\\\\s\\\\S]*?)\\\\[\\\\/col\\\\]/g, '<div class="txt-col">$1</div>')
        // 3-columns: [col3]content[/col3]
        .replace(/\\\\[col3\\\\]([\\\\s\\\\S]*?)\\\\[\\\\/col3\\\\]/g, '<div class="txt-col3">$1</div>')
        // Horizontal rule: [hr]
        .replace(/\\\\[hr\\\\]/g, '<hr class="txt-hr">')
        // Line break: [br]
        .replace(/\\\\[br\\\\]/g, '<br>')
        // Bold: **text**
        .replace(/\\\\*\\\\*(.+?)\\\\*\\\\*/g, "<strong>$1</strong>")
        // Underline: __text__
        .replace(/__(.+?)__/g, "<u>$1</u>")
        // Strikethrough: ~~text~~
        .replace(/~~(.+?)~~/g, "<del>$1</del>")
        // Italic: *text*
        .replace(/\\\\*(.+?)\\\\*/g, "<em>$1</em>");
    }`;

const newT = t.slice(0, startIdx) + newFunc + t.slice(endIdx);
fs.writeFileSync(f, newT);
console.log('updated news.html inline function');