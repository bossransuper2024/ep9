// End-to-end: load news-data.js, ND.load() against LIVE sheet, verify getById
const fs = require('fs');
const https = require('https');
const path = require('path');
const urlM = require('url');

const genPath = path.join(__dirname, '..', 'public/assets/js/generated.js');
const cfgFn = new Function('window', fs.readFileSync(genPath, 'utf8') + '\nreturn window.SITE_CONFIG;');
const C = cfgFn({});

// Shim window.SITE_CONFIG + fetch (follow redirects)
global.window = { SITE_CONFIG: C };
global.fetch = (u, opts) => new Promise((res, rej) => {
  const redirectRe = /HREF="([^"]+)"/;
  const get = (uu) => https.get(uu, (resp) => {
    let body = '';
    resp.on('data', c => body += c);
    resp.on('end', () => {
      if (resp.statusCode >= 300 && resp.statusCode < 400 && resp.headers.location) {
        get(urlM.resolve(uu, resp.headers.location));
      } else if (resp.statusCode !== 200) {
        res({ ok: false, status: resp.statusCode, text: () => Promise.resolve(body) });
      } else {
        const isJson = (resp.headers['content-type'] || '').indexOf('json') !== -1;
        res({ ok: true, status: 200, text: () => Promise.resolve(body), json: () => Promise.resolve(JSON.parse(body)) });
      }
    });
  }).on('error', rej);
  get(u);
});
global.navigator = { onLine: true };
global.AbortController = function () { this.signal = {}; this.abort = () => {}; };

// Load news-data.js — it attaches window.NewsData via (function(){...})()
const ndSrc = fs.readFileSync(path.join(__dirname, '..', 'public/assets/js/news-data.js'), 'utf8');
eval(ndSrc);

const ND = window.NewsData;
console.log('NewsData keys:', Object.keys(ND));
console.log('sheetUrl from C:', C.news.sheetUrl);

ND.load().then((items) => {
  console.log('loaded items count:', items.length);
  console.log('item ids:', items.map(x => x.id + ':' + x.cat));
  const item2 = ND.getById('2');
  console.log('--- getById("2") ---');
  console.log('id:', item2 && item2.id);
  console.log('title:', item2 && item2.title);
  console.log('cat:', item2 && item2.cat);
  console.log('date:', item2 && item2.date);
  console.log('description:', item2 && item2.description);
  console.log('text (first 120):', item2 && item2.text && item2.text.slice(0, 120));
  console.log('author:', item2 && item2.author);
  console.log('--- filters ---');
  console.log(JSON.stringify(ND.filters()));
  process.exit(0);
}).catch((e) => { console.log('ERROR:', e && e.message ? e.message : e); process.exit(1); });




