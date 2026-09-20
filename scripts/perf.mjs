// Measures what a reader waits for: the time until a page has rendered with
// its typeface in, what it downloads (the page, its fonts, all of it), how
// long a change of reading setting takes to repaint it, and what scrolling
// costs the page's main thread, where the contents follow the reader. The
// whole page re-renders on every change, so the longest part is the worst
// case. Five runs each; the median is shown. These are figures to compare
// before and after a change; no gate holds them yet, so a slowdown is only
// caught by reading them.
//   node scripts/perf.mjs

import fs from 'node:fs';
import path from 'node:path';
import { startSite, openPage, togglePanel, sitePages } from './harness.mjs';
import { STATIC_SITE } from '../src/paths.mjs';

const PAGES = sitePages();
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

// Scrolls the page from top to bottom in 100 steps of two frames each, and
// reads how long the main thread was busy meanwhile, per step: the browser's
// own scrolling and painting, and on a part page the contents following the
// reader. The home page has no contents, so it shows what scrolling costs
// without them.
async function timeScroll(page) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Performance.enable');
  const busy = async () =>
    (await cdp.send('Performance.getMetrics')).metrics.find((m) => m.name === 'TaskDuration').value;
  const before = await busy();
  const steps = await page.evaluate(async () => {
    const end = document.documentElement.scrollHeight - innerHeight;
    const STEPS = 100;
    for (let i = 1; i <= STEPS; i++) {
      window.scrollTo(0, (end * i) / STEPS);
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    }
    return STEPS;
  });
  const seconds = (await busy()) - before;
  await cdp.detach();
  return (seconds * 1000) / steps;
}

// Counts the bytes each response brought in, as sent over the wire. Fonts are
// counted apart, since a typeface is the heaviest thing a design can add.
function watchDownloads(page, tally) {
  page.on('requestfinished', async (request) => {
    const sizes = await request.sizes().catch(() => null);
    if (!sizes) return;
    const bytes = sizes.responseBodySize + sizes.responseHeadersSize;
    tally.total += bytes;
    if (/fonts\.gstatic\.com/.test(request.url())) tally.fonts += bytes;
  });
}

const site = await startSite();
const rows = [];
for (const file of PAGES) {
  const load = [];
  const theme = [];
  const deep = [];
  const scroll = [];
  const fontKB = [];
  const totalKB = [];
  let elements = 0;
  for (let i = 0; i < RUNS; i++) {
    const tally = { total: 0, fonts: 0 };
    const t0 = Date.now();
    const page = await openPage(site, file, { beforeLoad: (p) => watchDownloads(p, tally) });
    // openPage waits a settling 150ms after the fonts; it is not the reader's wait.
    load.push(Date.now() - t0 - 150);
    fontKB.push(Math.round(tally.fonts / 1024));
    totalKB.push(Math.round(tally.total / 1024));
    elements = await page.evaluate(() => document.querySelectorAll('.reader *').length);
    scroll.push(await timeScroll(page));
    await page.evaluate(() => window.scrollTo(0, 0));
    await togglePanel(page, 'settings');
    theme.push(await timeSetting(page, 'theme', 'dark'));
    deep.push(await timeSetting(page, 'deep', 'open'));
    await page.close();
  }
  rows.push({
    page: file,
    'file KB': Math.round(fs.statSync(path.join(STATIC_SITE, file)).size / 1024),
    elements,
    'fonts KB': median(fontKB),
    'download KB': median(totalKB),
    'render + fonts ms': median(load),
    'theme change ms': Math.round(median(theme)),
    'open all deep dives ms': Math.round(median(deep)),
    'scroll ms a step': Number(median(scroll).toFixed(2)),
  });
}
console.table(rows);
await site.close();
