// Dependency-free PWA icon generator.
//
// Rasterises a simple, original "Min Hverdag" mark (a rounded dark-green tile
// with a warm off-white sunrise arc) directly to PNG using Node's built-in
// zlib. No image tooling required. Run with `npm run icons`.

import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'public');

const COLORS = {
  green: [45, 90, 74, 255], // --accent
  greenDark: [31, 67, 56, 255],
  cream: [255, 253, 248, 255], // --card
  sun: [238, 229, 201, 255], // --gold
};

function lerp(a, b, t) {
  return a.map((v, i) => Math.round(v + (b[i] - v) * t));
}

// CRC32 for PNG chunks.
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function encodePng(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // colour type RGBA
  // 10,11,12 default 0 (deflate / adaptive / no interlace)

  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filter type: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// Anti-aliased coverage helper (super-sample corners with a simple SDF).
function roundedRectCoverage(x, y, w, h, radius) {
  const rx = Math.min(radius, w / 2);
  const cx = Math.min(Math.max(x, rx), w - rx);
  const cy = Math.min(Math.max(y, rx), h - rx);
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  return Math.max(0, Math.min(1, rx - dist + 0.5));
}

function drawIcon(size, { maskable = false } = {}) {
  const rgba = Buffer.alloc(size * size * 4);
  const pad = maskable ? size * 0.06 : 0; // maskable keeps art inside safe zone
  const tileR = maskable ? size * 0.5 : size * 0.22;
  const inner = size - pad * 2;

  const sunCx = size * 0.5;
  const sunCy = size * 0.6;
  const sunR = inner * 0.26;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const px = x + 0.5;
      const py = y + 0.5;

      const cover = roundedRectCoverage(px - pad, py - pad, inner, inner, tileR);
      if (cover <= 0) continue;

      // Vertical green gradient for a soft, premium feel.
      const t = (py - pad) / inner;
      let color = lerp(COLORS.green, COLORS.greenDark, Math.max(0, Math.min(1, t)));

      // Sunrise arc: an off-white half-disc sitting on a horizon line.
      const ddx = px - sunCx;
      const ddy = py - sunCy;
      const sunDist = Math.sqrt(ddx * ddx + ddy * ddy);
      const aboveHorizon = py <= sunCy;
      if (aboveHorizon && sunDist <= sunR + 0.5) {
        const edge = Math.max(0, Math.min(1, sunR - sunDist + 0.5));
        color = lerp(color, COLORS.cream, edge);
      }
      // Warm horizon band under the arc.
      const bandTop = sunCy + inner * 0.03;
      const bandBottom = sunCy + inner * 0.07;
      if (py >= bandTop && py <= bandBottom && Math.abs(ddx) <= sunR * 1.15) {
        color = lerp(color, COLORS.sun, 0.9);
      }

      const a = Math.round(cover * 255);
      rgba[i] = color[0];
      rgba[i + 1] = color[1];
      rgba[i + 2] = color[2];
      rgba[i + 3] = a;
    }
  }
  return encodePng(size, size, rgba);
}

mkdirSync(OUT_DIR, { recursive: true });

const targets = [
  ['icon-192.png', 192, {}],
  ['icon-512.png', 512, {}],
  ['maskable-512.png', 512, { maskable: true }],
  ['apple-touch-icon-180.png', 180, {}],
];

for (const [name, size, opts] of targets) {
  const png = drawIcon(size, opts);
  writeFileSync(join(OUT_DIR, name), png);
  console.log(`wrote public/${name} (${size}x${size}, ${png.length} bytes)`);
}

// Matching SVG favicon (crisp at any size).
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#2d5a4a"/>
      <stop offset="1" stop-color="#1f4338"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="14" fill="url(#g)"/>
  <path d="M18 40a14 14 0 0 1 28 0z" fill="#fffdf8"/>
  <rect x="16" y="42" width="32" height="3" rx="1.5" fill="#eee5c9"/>
</svg>
`;
writeFileSync(join(OUT_DIR, 'favicon.svg'), favicon);
console.log('wrote public/favicon.svg');
