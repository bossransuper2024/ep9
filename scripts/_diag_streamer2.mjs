import fs from 'node:fs';
import { parseCsv } from './_imports.mjs';

const u = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS0VR0xFeBPfB2vFwepHAMdIk_OVHpr-8Hae9FZPyY1zbZX8iLP0esSEphwR1tJI3eubpO65ON5NsyD/pub?output=csv&gid=0';
const r = await fetch(u);
const csv = await r.text();
console.log('char 0 code:', csv.charCodeAt(0), 'BOM?', csv.charCodeAt(0) === 0xFEFF);
console.log('first 60 chars hex:');
for (let i = 0; i < 60; i++) { if (i % 20 === 0) process.stdout.write('\n' + i + ': '); process.stdout.write(csv.charCodeAt(i).toString(16).padStart(2, '0') + ' '); }
console.log();
const rows = parseCsv(csv);
console.log('parseCsv row count:', rows.length);
rows.slice(0, 3).forEach((row, i) => {
  console.log('ROW' + i + ' (' + row.length + ' cells):');
  row.forEach((cell, j) => console.log('  [' + j + ']=' + JSON.stringify(cell)));
});
