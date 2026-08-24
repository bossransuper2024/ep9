// Generates branded placeholder PNGs for missing assets so the site renders
// cleanly on any host (GitHub Pages / IIS / shared). Pure Node, no deps.
import zlib from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const OUT = join(process.cwd(), "public", "assets");

// Minimal PNG encoder (RGBA, 8-bit, no interlace)
function crc32(buf) {
  let c, table = crc32.table;
  if (!table) {
    table = crc32.table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c >>> 0;
    }
  }
  c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}
function encodePNG(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  // PNG adaptive per-scanline filtering. The backgrounds here are smooth
  // gradients, which ordinary "no filter" (the old default) cannot compress —
  // a 1920x1080 background ballooned to 1-3 MB. For each scanline we try all
  // five standard filters (None/Sub/Up/Average/Paeth) and keep the one whose
  // bytes have the smallest sum-of-abs (the heuristic libpng uses), then apply
  // the actual filter and let deflate crush the now-near-constant rows. This
  // drops every background to a few KB with zero visual change.
  const bpp = 4;
  const stride = width * bpp;
  const raw = Buffer.alloc((stride + 1) * height);
  const paeth = (a, b, c) => {
    const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
    return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
  };
  for (let y = 0; y < height; y++) {
    const ro = y * (stride + 1);
    const so = y * stride;
    const up = y > 0 ? (y - 1) * stride : null;
    let bestType = 0, bestSum = Infinity, bestRow = null;
    for (let type = 0; type < 5; type++) {
      const row = Buffer.allocUnsafe(stride);
      let sum = 0;
      for (let x = 0; x < stride; x++) {
        const cur = rgba[so + x];
        const a = x >= bpp ? rgba[so + x - bpp] : 0; // left
        const b = up ? rgba[up + x] : 0;             // up
        const c = up && x >= bpp ? rgba[up + x - bpp] : 0; // up-left
        let v;
        if (type === 0) v = cur;
        else if (type === 1) v = cur - a;
        else if (type === 2) v = cur - b;
        else if (type === 3) v = cur - ((a + b) >> 1);
        else v = cur - paeth(a, b, c);
        v &= 0xff;
        row[x] = v;
        if (v > 127) v -= 256;
        sum += Math.abs(v);
      }
      if (sum < bestSum) { bestSum = sum; bestType = type; bestRow = row; }
    }
    raw[ro] = bestType;
    bestRow.copy(raw, ro + 1);
  }
  // Z_FILTERED tunes deflate's matching for PNG-filtered scanlines, yielding
  // noticeably smaller files than the default strategy for these gradients.
  const idat = zlib.deflateSync(raw, { level: 9, strategy: zlib.Z_FILTERED });
  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", idat), chunk("IEND", Buffer.alloc(0))]);
}
function lerp(a, b, t) { return Math.round(a + (b - a) * t); }

// Build a square class-card placeholder with a brand-gold emblem.
function classImage(size, hue) {
  const buf = Buffer.alloc(size * size * 4);
  const cx = size / 2, cy = size / 2;
  const rOuter = size * 0.32, rInner = size * 0.24;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      // dark navy base with subtle vertical gradient
      const g = y / size;
      let r = lerp(12, 20, g), gg = lerp(18, 28, g), b = lerp(32, 44, g);
      const dx = x - cx, dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      // gold ring
      if (Math.abs(dist - rOuter) < size * 0.012) { r = 255; gg = 214; b = 10; }
      // gold filled disc
      if (dist < rInner) {
        const a = 0.85 - (dist / rInner) * 0.25;
        r = lerp(255 * a + r * (1 - a), 255, a);
        gg = lerp(214 * a + gg * (1 - a), 214, a);
        b = lerp(10 * a + b * (1 - a), 10, a);
      }
      // accent glow by hue
      const ang = Math.atan2(dy, dx);
      if (dist < rOuter && dist > rInner) {
        const tint = (Math.sin(ang * 3 + hue) + 1) * 0.5;
        const rr = Math.round(lerp(40, 255, tint * 0.4));
        r = lerp(r, rr, 0.5); gg = lerp(gg, 214, 0.5); b = lerp(b, 60, 0.5);
      }
      buf[i] = r; buf[i + 1] = gg; buf[i + 2] = b; buf[i + 3] = 255;
    }
  }
  return encodePNG(size, size, buf);
}
// Wide background placeholder (radial gold glow on dark)
function bgImage(w, h) {
  const buf = Buffer.alloc(w * h * 4);
  const cx = w / 2, cy = h / 2;
  const maxd = Math.sqrt(cx * cx + cy * cy);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      const t = Math.max(0, 1 - dist / maxd);
      const glow = t * t;
      buf[i] = lerp(10, 255, glow * 0.5);
      buf[i + 1] = lerp(16, 214, glow * 0.5);
      buf[i + 2] = lerp(30, 60, glow * 0.5);
      buf[i + 3] = 255;
    }
  }
  return encodePNG(w, h, buf);
}

// Distinct wide section-background placeholders. Each section gets its own
// corner-glow position + accent tint + gradient direction, so the backgrounds
// never look "mixed" even at the low opacity the UI applies (SecBg ~0.16).
const HERO_BG = {
  "hero-bg": { glow: [0.5, 0.5], tint: [255, 214, 10] }, // home / fallback — centered gold
  "hero-bg-01": { glow: [0.5, 0.5], tint: [255, 214, 10] },  // hero — centered gold
  "hero-bg-02": { glow: [0.15, 0.2], tint: [80, 160, 255] }, // server — blue
  "hero-bg-03": { glow: [0.85, 0.25], tint: [180, 120, 255] },// classes — purple
  "hero-bg-04": { glow: [0.2, 0.8], tint: [255, 90, 90] },    // combat — red
  "hero-bg-05": { glow: [0.8, 0.8], tint: [80, 220, 160] },   // roadmap — teal
  "hero-bg-06": { glow: [0.5, 0.12], tint: [255, 170, 60] },  // (spare) — orange
  "hero-bg-07": { glow: [0.15, 0.5], tint: [255, 214, 10] },  // services — gold
  "hero-bg-08": { glow: [0.85, 0.5], tint: [120, 200, 255] }, // news — cyan
  "hero-bg-09": { glow: [0.5, 0.85], tint: [255, 120, 200] }  // facebook — pink
};
function heroBg(w, h, info) {
  const buf = Buffer.alloc(w * h * 4);
  const gcx = info.glow[0] * w, gcy = info.glow[1] * h;
  // gradient direction is derived from the glow corner so direction + corner differ together
  const ang = Math.atan2(h / 2 - gcy, w / 2 - gcx) + Math.PI / 2;
  const dx = Math.cos(ang), dy = Math.sin(ang);
  const projScale = 1 / (w * 0.8);
  const [tr, tg, tb] = info.tint;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const proj = Math.max(0, Math.min(1, (x * dx + y * dy) * projScale));
      let r = lerp(8, 22, proj), gg = lerp(14, 26, proj), b = lerp(28, 46, proj);
      const d = Math.sqrt((x - gcx) ** 2 + (y - gcy) ** 2);
      const t = Math.max(0, 1 - d / (w * 0.7));
      const glow = t * t;
      r = lerp(r, tr, glow * 0.4);
      gg = lerp(gg, tg, glow * 0.4);
      b = lerp(b, tb, glow * 0.4);
      buf[i] = r; buf[i + 1] = gg; buf[i + 2] = b; buf[i + 3] = 255;
    }
  }
  return encodePNG(w, h, buf);
}

const classes = ["brawler", "archer", "swordsman", "shaman", "extreme", "gunner", "assassin"];
mkdirSync(OUT, { recursive: true });
classes.forEach((c, idx) => {
  const png = classImage(600, idx * 0.9);
  writeFileSync(join(OUT, `class-${c}.png`), png);
  console.log("wrote class-" + c + ".png");
});
writeFileSync(join(OUT, "discord-bg.png"), bgImage(1600, 900));
console.log("wrote discord-bg.png");

// Wide service-card placeholder (gold ring emblem on dark navy) — replaced later
// by the community's own artwork (e.g. service-pilots.png, etc.).
function serviceImage(w, h, hue) {
  const buf = Buffer.alloc(w * h * 4);
  const cx = w / 2, cy = h / 2;
  const rOuter = Math.min(w, h) * 0.30;
  const rInner = rOuter * 0.75;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const g = y / h;
      let r = lerp(12, 20, g), gg = lerp(18, 28, g), b = lerp(32, 44, g);
      const dx = x - cx, dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (Math.abs(dist - rOuter) < Math.min(w, h) * 0.012) { r = 255; gg = 214; b = 10; }
      if (dist < rInner) {
        const a = 0.85 - (dist / rInner) * 0.25;
        r = lerp(255 * a + r * (1 - a), 255, a);
        gg = lerp(214 * a + gg * (1 - a), 214, a);
        b = lerp(10 * a + b * (1 - a), 10, a);
      }
      const ang = Math.atan2(dy, dx);
      if (dist < rOuter && dist > rInner) {
        const tint = (Math.sin(ang * 3 + hue) + 1) * 0.5;
        const rr = Math.round(lerp(40, 255, tint * 0.4));
        r = lerp(r, rr, 0.5); gg = lerp(gg, 214, 0.5); b = lerp(b, 60, 0.5);
      }
      buf[i] = r; buf[i + 1] = gg; buf[i + 2] = b; buf[i + 3] = 255;
    }
  }
  return encodePNG(w, h, buf);
}
[["pilots", 0.3], ["middleman", 1.4], ["streamer", 2.6]].forEach(([s, hue]) => {
  writeFileSync(join(OUT, `service-${s}.png`), serviceImage(800, 600, hue));
  console.log("wrote service-" + s + ".png");
});

// Section backgrounds — each distinct so sections don't share a look.
Object.keys(HERO_BG).forEach((name) => {
  writeFileSync(join(OUT, name + ".png"), heroBg(1920, 1080, HERO_BG[name]));
  console.log("wrote " + name + ".png");
});
console.log("done");
