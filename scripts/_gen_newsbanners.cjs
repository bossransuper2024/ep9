// Generate two 1920x212 news banner images from the existing hero-bg-08.png.
// news-bg-01.png -> header band (darker, for eyebrow/title readability)
// news-bg-02.png -> list band (lighter, behind tabs/grid/pagination)
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'public', 'assets', 'hero-bg-08.png');
const OUT = path.join(__dirname, '..', 'public', 'assets');
const W = 1920, H = 212;

const overlay = (top, bottom) => Buffer.from(
  `<svg width="${W}" height="${H}">
     <defs>
       <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
         <stop offset="0%" stop-color="#070B14" stop-opacity="${top}"/>
         <stop offset="100%" stop-color="#070B14" stop-opacity="${bottom}"/>
       </linearGradient>
     </defs>
     <rect width="${W}" height="${H}" fill="url(#g)"/>
   </svg>`
);

async function make(name, top, bottom, extraDark) {
  await sharp(SRC)
    .resize(W, H, { fit: 'cover', position: 'centre' })
    .composite([{ input: overlay(top, bottom), blend: 'over' }])
    .modulate({ brightness: extraDark ? 0.8 : 1 })
    .png()
    .toFile(path.join(OUT, name));
  console.log('wrote', name);
}

(async () => {
  // header: stronger dark overlay so light eyebrow/title reads well
  await make('news-bg-01.png', 0.55, 0.35, true);
  // list: lighter overlay so the list content stays readable but image shows
  await make('news-bg-02.png', 0.30, 0.30, false);
  console.log('done');
})();
