const fs = require('fs');
const f = 'public/assets/js/main.js';
let t = fs.readFileSync(f, 'utf8');

// Find the first "url = String(url).replace"
const firstIdx = t.indexOf('url = String(url).replace');
if (firstIdx === -1) { console.log('not found'); process.exit(1); }

// Find the second "url = String(url).replace" 
const secondIdx = t.indexOf('url = String(url).replace', firstIdx + 1);
if (secondIdx === -1) { console.log('second not found'); process.exit(1); }

// Remove everything from second occurrence back to the line before it
// We want to keep only one copy, so remove the duplicate block
const lineStart = t.lastIndexOf('\n', secondIdx - 1) + 1;
const lineEnd = t.indexOf('\n', secondIdx) + 1;

// Actually, let's just find the block from secondIdx to the next "var dim"
const varDimIdx = t.indexOf('var dim = \'\';', secondIdx);
if (varDimIdx === -1) { console.log('var dim not found after second'); process.exit(1); }

// The duplicate block goes from secondIdx to varDimIdx + 'var dim = \'\';'.length
const duplicateEnd = varDimIdx + 'var dim = \'\';'.length;
const before = t.slice(0, secondIdx);
const after = t.slice(duplicateEnd);

// But also there's the comment line before it
const commentIdx = t.lastIndexOf('// Same normalization', secondIdx);
if (commentIdx !== -1 && commentIdx > firstIdx) {
  // Remove from commentIdx to duplicateEnd
  const before2 = t.slice(0, commentIdx);
  const after2 = t.slice(duplicateEnd);
  t = before2 + after2;
}

fs.writeFileSync(f, t);
console.log('fixed duplicate');