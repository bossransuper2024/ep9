import fs from 'node:fs';
import vm from 'node:vm';

const t = fs.readFileSync('public/assets/js/generated.js', 'utf8');
const sb = { console };
sb.window = sb;
vm.createContext(sb);
vm.runInContext(t, sb, { filename: 'g.js' });
const svc = sb.window.SITE_CONFIG.services;
console.log('services keys:', Object.keys(svc));
console.log('items count:', (svc.items || []).length);
const streamers = (svc.items || []).filter(x => x.section === 'Streamer');
console.log('Streamer baked items:', streamers.length);
streamers.forEach((it, i) => console.log('  [' + i + ']', JSON.stringify(it)));
