const fs = require('fs');
const f = 'public/assets/js/main.js';
let t = fs.readFileSync(f, 'utf8');

// Fix the double-escaped brackets in the inline image regex
// The file has: \\\\[(auto|\\d+x\\d+)\\\\] -> should be \\[(auto|\\d+x\\d+)\\]
t = t.replace(/:\\\\(auto\\|\\\\d\\+x\\\\d\\+)\\\\/g, ':(auto|\\d+x\\d+)');

fs.writeFileSync(f, t);
console.log('fixed double-escaped brackets in main.js');