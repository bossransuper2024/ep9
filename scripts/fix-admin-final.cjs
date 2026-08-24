const fs = require('fs');
const f = 'public/admin-content-editor.html';
let t = fs.readFileSync(f, 'utf8');

const i = t.indexOf('url = String(url).replace');
if (i < 0) { console.log('not found'); process.exit(1); }

const before = t.slice(0, i);
const after = t.slice(i);
const j = after.indexOf('\n');
const newLine = 
'          url = String(url).replace(/"/g, \'"\');\n' +
'          // Same normalization as hero image: bare filename -> assets/content/\n' +
'          if (url.indexOf(\'://\') === -1 && url.indexOf(\'/\') !== 0) url = \'assets/content/\' + url;\n' +
'          var dim = \'\';\n';

const newT = before + newLine + after.slice(j + 1);
fs.writeFileSync(f, newT);
console.log('done');