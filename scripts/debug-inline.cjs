const fs = require('fs');
const m = fs.readFileSync('public/assets/js/main.js', 'utf8');
const e = fs.readFileSync('public/admin-content-editor.html', 'utf8');
function s(src) {
  const k = 'function inline(t) {';
  const st = src.indexOf(k);
  const op = src.indexOf('{', st);
  let d = 0, i = op;
  for (; i < src.length; i++) {
    const c = src[i];
    if (c === '{') d++; else if (c === '}') { d--; if (d === 0) { i++; break; } }
  }
  return src.slice(st, i);
}
const A = s(m);
const C = s(e);
console.log('A includes [img]:', A.includes('[img]'));
console.log('A has img pattern:', /\\\[img\\\]/.test(A));
console.log('raw slice 30-60:', JSON.stringify(A.slice(30, 80)));
console.log('---');
console.log('C includes [img]:', C.includes('[img]'));
console.log('C raw slice 30-60:', JSON.stringify(C.slice(30, 80)));