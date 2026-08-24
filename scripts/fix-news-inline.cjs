const fs = require('fs');
const f = 'public/news.html';
let t = fs.readFileSync(f, 'utf8');

const startMarker = "url = String(url).replace(/\\\\\"/g, '"');";
const startIdx = t.indexOf(startMarker);
if (startIdx === -1) {
  console.log('startMarker not found');
  process.exit(1);
}

// Find the line end
const lineEnd = t.indexOf('\n', startIdx);
const before = t.slice(0, lineEnd + 1);
const after = t.slice(lineEnd + 1);

const newLines = 
"          url = String(url).replace(/\\\\\"/g, '"');\n" +
"          // Same normalization as hero image: bare filename -> assets/content/\n" +
"          if (url.indexOf('://') === -1 && url.indexOf('/') !== 0) url = 'assets/content/' + url;\n" +
"          var dim = '';";

const newT = before + newLines + after;
fs.writeFileSync(f, newT);
console.log('fixed news.html inline image normalization');