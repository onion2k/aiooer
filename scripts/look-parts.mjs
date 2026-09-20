// Takes pictures of single elements of a built page, at a chosen width and
// reading setting, so one device can be looked at closely. Pictures go to
// test-results/parts.
//   node scripts/look-parts.mjs <width> <File.html> <selector>[@index] ...
//     [--theme dark] [--size largest] [--spacing wide] [--measure long] [--font serif] [--deep open]
//     [--click <selector>]

import fs from 'node:fs';
import path from 'node:path';
import { startSite, openPage, setSetting, togglePanel } from './harness.mjs';
import { RESULTS } from '../src/paths.mjs';

const OUT = path.join(RESULTS, 'parts');
fs.mkdirSync(OUT, { recursive: true });

const args = process.argv.slice(2);
const opt = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : null);
const clicks = args.filter((a, i) => args[i - 1] === '--click');
const [width, file, ...selectors] = args.filter((a, i) => !a.startsWith('--') && !(args[i - 1] || '').startsWith('--'));
if (!file) {
  console.error('usage: node scripts/look-parts.mjs <width> <File.html> <selector>[@index] ...');
  process.exit(2);
}

const site = await startSite();
const page = await openPage(site, file, { width: Number(width) });
let changed = false;
for (const key of ['theme', 'size', 'spacing', 'measure', 'font', 'deep']) {
  const value = opt('--' + key);
  if (value) {
    await setSetting(page, key, value);
    changed = true;
  }
}
if (changed) await togglePanel(page, 'settings');
for (const c of clicks) await page.click(c);
await page.waitForTimeout(200);
let n = 0;
for (const spec of selectors) {
  const [sel, idx] = spec.split('@');
  const el = page.locator(sel).nth(Number(idx || 0));
  await el.scrollIntoViewIfNeeded();
  const name = `${file.replace(/\.html$/, '')}-${width}-${++n}.png`;
  await el.screenshot({ path: path.join(OUT, name) });
  console.log(`${name} = ${spec}`);
}
await site.close();
