const fs = require('fs');
const f = 'public/assets/js/main.js';
let t = fs.readFileSync(f, 'utf8');
// find "url = String(url).replace" and the "var dim = '';" after it
const idx = t.indexOf('url = String(url).replace');
if (idx === -1) { console.log('not found'); process.exit(1); }
const j = t.indexOf('var dim = \'\';', idx);
if (j === -1) { console.log('var dim not found'); process.exit(1); }
// rebuild the slice
const before = t.slice(0, j);
const after = t.slice(j);
const newSlice = 
'url = String(url).replace(/"/g, \'"\');\n' +
'        // Same normalization as hero image: bare filename -> assets/content/\n' +
'        if (url.indexOf(\'://\') === -1 && url.indexOf(\'/\') !== 0) url = \'assets/content/\' + url;\n' +
'        var dim = \'\';';
const newT = before + newSlice + after.slice('var dim = \'\';'.length);
fs.writeFileSync(f, newT);
console.log('fixed main.js inline image normalization');