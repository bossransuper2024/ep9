// Generates branded placeholder PNGs for missing assets so the site renders
// cleanly on any host (GitHub Pages / IIS / shared). Pure Node, no deps.
import { deflateSync } from "node:zlib";
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
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const idat = deflateSync(raw, { level: 9 });
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

const classes = ["brawler", "archer", "swordsman", "shaman", "extreme", "gunner", "assassin"];
mkdirSync(OUT, { recursive: true });
classes.forEach((c, idx) => {
  const png = classImage(600, idx * 0.9);
  writeFileSync(join(OUT, `class-${c}.png`), png);
  console.log("wrote class-" + c + ".png");
});
writeFileSync(join(OUT, "discord-bg.png"), bgImage(1600, 900));
console.log("wrote discord-bg.png");
console.log("done");
