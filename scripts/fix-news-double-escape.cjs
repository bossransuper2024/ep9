const fs = require('fs');
const f = 'public/news.html';
let t = fs.readFileSync(f, 'utf8');

// Fix the double-escaped brackets
t = t.replace(/\\\\\[/g, '\\[');
t = t.replace(/\\\\\]/g, '\\]');

fs.writeFileSync(f, t);
console.log('fixed double-escaped brackets in news.html');