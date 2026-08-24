const fs = require('fs');

// Test the regex directly - what the function actually has
const regex = /\[img\](.*?)\[img\](?:\[(auto|\d+x\d+)\])?/g;
const testStr = '[img]/images/test.png[img][auto]';
const match = regex.exec(testStr);
console.log('Direct regex Match result:', match);

if (match) {
  const url = match[1];
  const size = match[2];
  console.log('Direct URL:', url);
  console.log('Direct SIZE:', size);
}

// Now test the actual inline function from main.js
const mainJs = fs.readFileSync('public/assets/js/main.js', 'utf8');
const sig = 'function inline(t) {';
const start = mainJs.indexOf(sig);
const open = mainJs.indexOf('{', start);
let depth = 0, i = open;
for (; i < mainJs.length; i++) {
  const c = mainJs[i];
  if (c === '{') depth++;
  else if (c === '}') { depth--; if (depth === 0) { i++; break; } }
}
const fnText = mainJs.slice(start, i);
console.log('\n--- Extracted function (first 500 chars) ---');
console.log(fnText.slice(0, 500));

// Let's manually test just the first replace
const firstReplaceRegex = /\[img\](.*?)\[img\](?:\[(auto|\d+x\d+)\])?/g;
console.log('\n--- Testing first replace directly ---');
const test1 = '[img]/images/test.png[img][auto]';
const result1 = test1.replace(firstReplaceRegex, function(_m, url, size) {
  console.log('  Callback: url=', url, 'size=', size);
  url = String(url).replace(/"/g, '"');
  if (url.indexOf('://') === -1 && url.indexOf('/') !== 0) url = 'assets/content/' + url;
  var dim = '';
  if (size && size !== 'auto') { var p = size.split('x'); dim = ' width="' + p[0] + '" height="' + p[1] + '"'; }
  return '<img class="txt-img" src="' + url + '" alt=""' + dim + '>';
});
console.log('  Result:', result1);

try {
  const inline = new Function(fnText + '; return inline;')();
  console.log('\n--- Full inline function test results ---');
  console.log('Test 1:', inline('[img]/images/test.png[img][auto]'));
  console.log('Test 2:', inline('[img]https://x.com/a.jpg[img][320x200]'));
  console.log('Test 3:', inline('see [img]/b.png[img][100x50] here'));
  console.log('Test 4:', inline('**bold** then [img]/c.png[img][auto] end'));
} catch (e) {
  console.error('Error:', e.message);
  console.error(e.stack);
}