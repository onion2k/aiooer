// Measures what a reader waits for, in two parts. What every page weighs:
// the page, its fonts and all it downloads, and how many elements it holds,
// which is where bloat shows first. Then, on three pages that stand for the
// rest, the time until a page has rendered with its typeface in, how long a
// change of reading setting takes to repaint it, and what scrolling costs the
// page's own script, where the contents follow the reader. Five runs of each
// timing; the median is shown. These are figures to compare before and after
// a change that could move them; no gate holds them yet, so a slowdown is
// only caught by reading them. It takes about half a minute.
//   node scripts/perf.mjs

import fs from 'node:fs';
import path from 'node:path';
import { startSite, openPage, togglePanel, sitePages } from './harness.mjs';
import { STATIC_SITE } from '../src/paths.mjs';

const PAGES = sitePages();
const RUNS = 5;
const JOBS = 4;
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

// Scrolls the page from top to bottom in 100 steps and times what each step
// costs the page itself: the scroll event, the contents following the reader,
// and the style and layout that follow from it. It does not wait for frames.
// Headless Chromium draws sixty a second whether or not there is work, and
// waiting on two a step spent three seconds a page idle, which made a run take
// a quarter of an hour; frames cannot be driven by hand on macOS. So the page's
// next-frame callbacks are held and run at once, the scroll event is fired by
// hand, and layout is forced, all in one stretch with nothing waited on.
//
// Paint is not in the figure. A step on which the section changes redraws the
// page, and that cost is only seen by scrolling it for real. The walk also
// stops the run if the contents did not follow it to the last section, since
// a figure from a spy that never ran would look like a fast one.
async function timeScroll(page) {
  const { ms, steps, followed } = await page.evaluate(() => {
    const realFrame = window.requestAnimationFrame;
    let held = [];
    window.requestAnimationFrame = (callback) => held.push(callback);
    const end = document.documentElement.scrollHeight - innerHeight;
    const STEPS = 100;
    let ms = 0;
    for (let i = 1; i <= STEPS; i++) {
      const t = performance.now();
      window.scrollTo(0, (end * i) / STEPS);
      window.dispatchEvent(new Event('scroll'));
      const now = held;
      held = [];
      for (const callback of now) callback(performance.now());
      void document.body.offsetHeight;
      ms += performance.now() - t;
    }
    window.requestAnimationFrame = realFrame;
    const items = [...document.querySelectorAll('.toc-list > li')];
    const followed = !items.length || items.at(-1).classList.contains('is-current');
    return { ms, steps: STEPS, followed };
  });
  if (!followed) throw new Error('The contents did not follow the timed scroll, so its figure means nothing');
  return ms / steps;
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

// What every page weighs, from one load each: the same on every run, so there
// is nothing to take a median of, and several pages load at once since
// nothing here is a time.
const weights = [];
const queue = [...PAGES];
await Promise.all(
  Array.from({ length: JOBS }, async () => {
    for (let file; (file = queue.shift());) {
      const tally = { total: 0, fonts: 0 };
      const page = await openPage(site, file, { beforeLoad: (p) => watchDownloads(p, tally) });
      weights.push({
        page: file,
        'file KB': Math.round(fs.statSync(path.join(STATIC_SITE, file)).size / 1024),
        elements: await page.evaluate(() => document.querySelectorAll('.reader *').length),
        'fonts KB': Math.round(tally.fonts / 1024),
        'download KB': Math.round(tally.total / 1024),
      });
      await page.close();
    }
  }),
);
weights.sort((a, b) => PAGES.indexOf(a.page) - PAGES.indexOf(b.page));
console.log('What every page weighs, one load each:');
console.table(weights);

// The timings, on the pages that stand for the rest: the home page, the
// heaviest part, whose contents have the most to follow, and the model
// directory, which holds the most elements. Timing every page five times took
// minutes and told nothing these three do not. One page at a time, so no
// page's figures are another's load.
const heaviest = PAGES.filter((f) => /\/\d+-/.test(f)).sort(
  (a, b) => fs.statSync(path.join(STATIC_SITE, b)).size - fs.statSync(path.join(STATIC_SITE, a)).size,
)[0];
const TIMED = ['index.html', heaviest, 'models/index.html'].filter((f) => PAGES.includes(f));
const rows = [];
for (const file of TIMED) {
  const load = [];
  const theme = [];
  const deep = [];
  const scroll = [];
  for (let i = 0; i < RUNS; i++) {
    const t0 = Date.now();
    const page = await openPage(site, file);
    // openPage waits a settling 150ms after the fonts; it is not the reader's wait.
    load.push(Date.now() - t0 - 150);
    scroll.push(await timeScroll(page));
    await page.evaluate(() => window.scrollTo(0, 0));
    await togglePanel(page, 'settings');
    theme.push(await timeSetting(page, 'theme', 'dark'));
    deep.push(await timeSetting(page, 'deep', 'open'));
    await page.close();
  }
  rows.push({
    page: file,
    'render + fonts ms': median(load),
    'theme change ms': Math.round(median(theme)),
    'open all deep dives ms': Math.round(median(deep)),
    'scroll ms a step, no paint': Number(median(scroll).toFixed(2)),
  });
}
console.log(`Timings, the median of ${RUNS} runs:`);
console.table(rows);
await site.close();
