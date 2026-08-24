const fs = require('fs');
const t = fs.readFileSync('public/assets/js/generated.js', 'utf8');
const re = /className\s*=\s*['"]([^'"]*)['"]/gi;
let m;
const s = new Set();
while (m = re.exec(t)) {
    s.add(m[1]);
}
console.log([...s].sort().join('\n'));