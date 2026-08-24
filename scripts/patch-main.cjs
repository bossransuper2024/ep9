const fs = require('fs');
const f = 'public/assets/js/main.js';
let t = fs.readFileSync(f, 'utf8');
// exact 76 chars from file: "url = String(url).replace(/\\\"/g, '"');\n        var dim = '';"
const needle = "url = String(url).replace(/\\\"/g, '"');\n        var dim = '';";
const replacement = "url = String(url).replace(/\\\"/g, '"');\n        // Same normalization as hero image: bare filename -> assets/content/\n        if (url.indexOf('://') === -1 && url.indexOf('/') !== 0) url = 'assets/content/' + url;\n        var dim = '';";
if (t.includes(needle)) {
  t = t.replace(needle, replacement);
  fs.writeFileSync(f, t);
  console.log('patched main.js');
} else {
  console.log('needle not found');
  const idx = t.indexOf('url = String(url).replace');
  if (idx >= 0) console.log('ACTUAL:', JSON.stringify(t.slice(idx, idx+100)));
}