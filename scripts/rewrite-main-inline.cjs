const fs = require('fs');
const f = 'public/assets/js/main.js';
let t = fs.readFileSync(f, 'utf8');

// Find the inline function and replace the img handler block
const startMarker = 'img\\](.*?)\\[img\\]';
const startIdx = t.indexOf(startMarker);
if (startIdx === -1) {
  console.log('startMarker not found');
  process.exit(1);
}

// Go back to find the .replace( that starts this
let blockStart = startIdx;
while (blockStart > 0 && t[blockStart] !== '(') blockStart--;
blockStart = t.lastIndexOf('.replace(', blockStart);
if (blockStart === -1) {
  console.log('.replace( not found before marker');
  process.exit(1);
}

console.log('Block starts at', blockStart);

// Find the end of this replace block
let braceDepth = 0;
let i = blockStart;
let inFunction = false;
for (; i < t.length; i++) {
  if (t[i] === '{') { braceDepth++; inFunction = true; }
  else if (t[i] === '}') {
    braceDepth--;
    if (braceDepth === 0 && inFunction) {
      i++;
      break;
    }
  }
}

const endIdx = i;
console.log('Block from', blockStart, 'to', endIdx);
console.log('Block content:', t.slice(blockStart, endIdx));

// Build new block
const newBlock = `.replace(/\\[img\\](.*?)\\[img\\](?:\\[(auto|\\d+x\\d+)\\])?/g, function (_m, url, size) {
        url = String(url).replace(/\"/g, '"');
        // Same normalization as hero image: bare filename -> assets/content/
        if (url.indexOf('://') === -1 && url.indexOf('/') !== 0) url = 'assets/content/' + url;
        var dim = '';
        if (size && size !== 'auto') { var p = size.split('x'); dim = ' width="' + p[0] + '" height="' + p[1] + '"'; }
        return '<img class="txt-img" src="' + url + '" alt=""' + dim + '>';
      })`;

const newT = t.slice(0, blockStart) + newBlock + t.slice(endIdx);
fs.writeFileSync(f, newT);
console.log('rewritten main.js inline image handler');