// Renders every page of the site, reports console and page errors, and saves a
// picture of each to test-results/shots to be looked at. A page that throws or
// renders empty fails the run. Nothing here holds a page to a size: the pages
// are ordinary web pages and are as tall as their content, so the value of
// this run is the errors it catches and the pictures it leaves to look at.
//   node scripts/look.mjs [--only File.html] [--max 5000] [--width 1440]

import fs from 'node:fs';
import path from 'node:path';
import { startSite, openPage, sitePages } from './harness.mjs';
import { RESULTS } from '../src/paths.mjs';

const SHOTS = path.join(RESULTS, 'shots');
fs.mkdirSync(SHOTS, { recursive: true });

const args = process.argv.slice(2);
const arg = (name, fallback) => (args.includes(name) ? args[args.indexOf(name) + 1] : fallback);
const only = arg('--only', null);
const maxShot = Number(arg('--max', 5000));
const width = Number(arg('--width', 1440));

const site = await startSite();
let failed = 0;

for (const file of sitePages()) {
  if (only && file !== only) continue;
  const problems = [];
  const page = await openPage(site, file, { width, height: 1000, errors: problems });
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') problems.push(`${m.type()}: ${m.text()}`);
  });
  const info = await page.evaluate(() => {
    const r = document.querySelector('.reader');
    return { natural: Math.ceil(r.scrollHeight), text: r.innerText.length };
  });
  // A picture of the whole of a long part would be unreadable and slow to
  // write, so the tall ones are cut at --max. What is below the cut is the
  // same page furniture repeated, and the audit walks all of it anyway.
  const clipH = Math.min(info.natural, maxShot);
  await page.screenshot({
    path: path.join(SHOTS, `${file.replace(/\/?index\.html$/, '') || 'index'}.png`.replace(/\//g, '-')),
    clip: { x: 0, y: 0, width, height: clipH },
    fullPage: true,
  });
  if (!info.text || problems.length) failed++;
  console.log(
    `${file}: ${info.natural}px tall, ${info.text} characters${problems.length ? '\n  ' + problems.join('\n  ') : ''}`,
  );
  await page.close();
}

await site.close();
process.exit(failed ? 1 : 0);
