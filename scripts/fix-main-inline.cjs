const fs = require('fs');
const f = 'public/assets/js/main.js';
let t = fs.readFileSync(f, 'utf8');
t = t.replace(
  /url = String\(url\)\.replace\(\/\\"\/g, '"'\);[\s\S]*?var dim = '';/,
  'url = String(url).replace(/"/g, \'"\');\n        // Same normalization as hero image: bare filename -> assets/content/\n        if (url.indexOf(\'://\') === -1 && url.indexOf(\'/\') !== 0) url = \'assets/content/\' + url;\n        var dim = \'\';'
);
fs.writeFileSync(f, t);
console.log('fixed main.js inline image normalization');