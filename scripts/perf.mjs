// Measures what a reader waits for: the time until a page has rendered with
// its typeface in, the size of its file, and how long a change of reading
// setting takes to repaint it. The whole page re-renders on every change, so
// the longest part is the worst case. Five runs each; the median is shown.
// These are figures to compare before and after a change; no gate holds them
// yet, so a slowdown is only caught by reading them.
//   node scripts/perf.mjs

import fs from 'node:fs';
import path from 'node:path';
import { startSite, openPage, togglePanel } from './harness.mjs';
import { TEST_SITE } from '../src/paths.mjs';

const PAGES = [
  'Main.dc.html',
  'Part1.dc.html',
  'Part2.dc.html',
  'Part3.dc.html',
  'Part4.dc.html',
  'Part5.dc.html',
  'Part6.dc.html',
];
const RUNS = 5;
const median = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];

// Clicks a setting and waits two frames, so the time includes the repaint.
async function timeSetting(page, key, value) {
  return page.evaluate(
    async ([k, v]) => {
      const input = document.querySelector(`input[name="setting-${k}"][value="${v}"]`);
      const t = performance.now();
      input.click();
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      return performance.now() - t;
    },
    [key, value],
  );
}

const site = await startSite();
const rows = [];
for (const file of PAGES) {
  const load = [];
  const theme = [];
  const deep = [];
  let elements = 0;
  for (let i = 0; i < RUNS; i++) {
    const t0 = Date.now();
    const page = await openPage(site, file);
    // openPage waits a settling 150ms after the fonts; it is not the reader's wait.
    load.push(Date.now() - t0 - 150);
    elements = await page.evaluate(() => document.querySelectorAll('.reader *').length);
    await togglePanel(page, 'settings');
    theme.push(await timeSetting(page, 'theme', 'dark'));
    deep.push(await timeSetting(page, 'deep', 'open'));
    await page.close();
  }
  rows.push({
    page: file,
    'file KB': Math.round(fs.statSync(path.join(TEST_SITE, file)).size / 1024),
    elements,
    'render + fonts ms': median(load),
    'theme change ms': Math.round(median(theme)),
    'open all deep dives ms': Math.round(median(deep)),
  });
}
console.table(rows);
await site.close();
