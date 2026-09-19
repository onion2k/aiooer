// Lays a tall, narrow screenshot out in side-by-side columns, so a whole
// phone page can be looked at in one picture instead of a thin strip.
//   node scripts/tile.mjs <in.png> <out.png> [columnHeight]
import fs from 'node:fs';
import { chromium } from 'playwright';
const [input, output, colH = '2400'] = process.argv.slice(2);
const b64 = fs.readFileSync(input).toString('base64');
const browser = await chromium.launch();
const page = await browser.newPage();
const size = await page.evaluate(async (src) => {
  const img = new Image();
  img.src = src;
  await img.decode();
  return { w: img.naturalWidth, h: img.naturalHeight };
}, 'data:image/png;base64,' + b64);
const H = Number(colH);
const cols = Math.ceil(size.h / H);
const gap = 24;
const W = cols * size.w + (cols - 1) * gap;
await page.setViewportSize({ width: W, height: H });
const divs = Array.from(
  { length: cols },
  (_, i) =>
    `<div style="position:absolute;top:0;left:${i * (size.w + gap)}px;width:${size.w}px;height:${Math.min(H, size.h - i * H)}px;background:url(data:image/png;base64,${b64}) 0 -${i * H}px no-repeat;outline:1px solid #ccc"></div>`,
).join('');
await page.setContent(
  `<body style="margin:0;background:#fff;position:relative;width:${W}px;height:${H}px">${divs}</body>`,
);
await page.screenshot({ path: output, clip: { x: 0, y: 0, width: W, height: H } });
console.log(`${input}: ${size.w}x${size.h} -> ${cols} columns`);
await browser.close();
