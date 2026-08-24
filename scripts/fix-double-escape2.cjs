const fs = require('fs');
const f = 'public/assets/js/main.js';
let t = fs.readFileSync(f, 'utf8');

// Find the regex part
const idx = t.indexOf('(auto|\\d+x\\d+)');
if (idx >= 0) {
  console.log('Found at:', idx);
  console.log('Context:', t.slice(idx-20, idx+40));
  console.log('HEX:', Buffer.from(t.slice(idx-5, idx+40)).toString('hex'));
}

// Replace double-backslash-brackets with single-backslash-brackets
// Pattern: \\\\[  and  \\\\]  (which in the string literal are \\\\[ and \\\\])
t = t.replace(/\\\\\[/g, '\\[');
t = t.replace(/\\\\\]/g, '\\]');

fs.writeFileSync(f, t);
console.log('fixed double-escaped brackets in main.js');