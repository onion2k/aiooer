// Renders every board with the canvas's runtime, reports console errors, and
// saves a picture of each to test-results/shots to be looked at. A board that
// throws or renders empty fails the run. With --heights it also records each
// showcase board's natural height in src/heights.json, which the build uses
// to size the frames; without that, a board would be cut short or padded out
// after its content changed.
//   node scripts/look.mjs [--only File.dc.html] [--max 5000] [--heights]

import fs from 'node:fs';
import path from 'node:path';
import { startSite, openPage } from './harness.mjs';
import { CANVAS_PROJECT, HEIGHTS_FILE, RESULTS } from '../src/paths.mjs';

const SHOTS = path.join(RESULTS, 'shots');
fs.mkdirSync(SHOTS, { recursive: true });

const args = process.argv.slice(2);
const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;
const maxShot = args.includes('--max') ? Number(args[args.indexOf('--max') + 1]) : 5000;
const writeHeights = args.includes('--heights');

const canvas = JSON.parse(fs.readFileSync(path.join(CANVAS_PROJECT, 'canvas.json'), 'utf8'));
const site = await startSite();
const heights = fs.existsSync(HEIGHTS_FILE) ? JSON.parse(fs.readFileSync(HEIGHTS_FILE, 'utf8')) : {};
let failed = 0;

for (const file of canvas.order) {
  if (only && file !== only) continue;
  const board = canvas.boards[file];
  const problems = [];
  const page = await openPage(site, file, { width: board.w, height: Math.min(board.h, 1000), errors: problems });
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') problems.push(`${m.type()}: ${m.text()}`);
  });
  const info = await page.evaluate(() => {
    const r = document.querySelector('.reader');
    return { natural: Math.ceil(r.scrollHeight), text: r.innerText.length };
  });
  // A frame sized from a recorded height has to still fit its content, or the
  // board on the canvas is cut short or left with an empty tail.
  const recorded = heights[file];
  const sizedFromHeight = recorded !== undefined && board.h === Math.min(8000, recorded);
  if (!writeHeights && sizedFromHeight && Math.abs(recorded - info.natural) > 2) {
    problems.push(
      `recorded height ${recorded}px is out of date, the board is now ${info.natural}px: run npm run heights`,
    );
  }
  heights[file] = info.natural;
  const clipH = Math.min(info.natural, board.expand === 'fill' ? maxShot : board.h);
  await page.setViewportSize({ width: board.w, height: Math.min(clipH, 1000) });
  await page.screenshot({
    path: path.join(SHOTS, file.replace('.dc.html', '.png')),
    clip: { x: 0, y: 0, width: board.w, height: clipH },
    fullPage: true,
  });
  if (!info.text || problems.length) failed++;
  console.log(
    `${file}: natural ${info.natural}px, board ${board.w}x${board.h}, ${info.text} characters${problems.length ? '\n  ' + problems.join('\n  ') : ''}`,
  );
  await page.close();
}

if (writeHeights) {
  fs.writeFileSync(HEIGHTS_FILE, JSON.stringify(heights, null, 2) + '\n');
  console.log(`Wrote ${path.relative(process.cwd(), HEIGHTS_FILE)}; build again to resize the frames.`);
}
await site.close();
process.exit(failed ? 1 : 0);
