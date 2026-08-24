const fs = require('fs');
const t = fs.readFileSync('old_index_utf8.html', 'utf8');
const re = /class\s*=\s*['"]([^'"]*)['"]/gi;
let m;
const s = new Set();
while (m = re.exec(t)) {
    s.add(m[1]);
}
console.log([...s].sort().join('\n'));