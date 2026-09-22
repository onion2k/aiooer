// The test API. Serves the built site, opens a page in headless Chromium, and
// drives it the way a reader does: through the reading settings panel and the
// page's buttons. Every check and look tool goes through here, so they all see
// the same pages the same way; without it each script would boot the page its
// own way and their figures would not agree.
//
// What it serves is dist/site, the pages that ship. A check that rendered
// anything else would be holding a copy to the promises and not the thing.

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { chromium } from 'playwright';
import { serve } from './serve.mjs';
import { STATIC_SITE, CONTENT_DIR } from '../src/paths.mjs';
import { parseIntro } from '../src/content.mjs';

const require = createRequire(import.meta.url);
export const AXE_PATH = require.resolve('axe-core/axe.min.js');

// The course as the introduction declares it: its name, its modules and their
// parts, written or still to come. The checks read it from here so that a new
// part is checked the day it is written, without anyone adding it to a list.
export function course() {
  return parseIntro(CONTENT_DIR);
}

// Where each board is served from: the home page at the site's root, and each
// part in a folder of its own under its module's, so an address says what it
// leads to. The build still writes boards, so this is the one place that knows
// a board's name as an address.
export function pageMap() {
  const c = course();
  const map = new Map([
    ['Main', ''],
    ['Learning', 'learning/'],
    ['Models', 'models/'],
  ]);
  for (const m of c.modules.filter((x) => x.parts.some((p) => p.written))) map.set(`mod-${m.slug}`, m.url);
  for (const p of c.parts.filter((x) => x.written)) map.set(p.out, p.url);
  return map;
}

// The file an address is written to. A folder address is served by the
// index.html inside it, which every static host does.
export const pageFile = (url) => `${url}index.html`;

// How deep a page sits, which is how far a link from it has to climb to reach
// anything at the site's root.
export const upTo = (url) => '../'.repeat((url.match(/\//g) || []).length);

// The site's own pages: the home page and every written part, in course order.
// The checks, look and perf walk this, so a new part is checked the day it is
// written, without anyone adding it to a list.
export function sitePages() {
  return [...pageMap().values()].map(pageFile);
}

// Starts the server and the browser. Close both with site.close().
// An unbuilt site would fail every check on a missing page, so say why here,
// once, rather than leaving each script to report it as its own failure.
export async function startSite(root = STATIC_SITE) {
  if (!fs.existsSync(path.join(root, 'index.html'))) {
    throw new Error(`No site at ${root}: run npm run build first.`);
  }
  const server = await serve(root);
  const browser = await chromium.launch();
  return {
    browser,
    url: (file) => `http://127.0.0.1:${server.address().port}/${file}`,
    async close() {
      await browser.close();
      server.close();
    },
  };
}

// Opens a page and waits until it has rendered and its typeface is in.
// Line lengths and pictures measured in a fallback font would be wrong, so a
// page whose body face failed to load (offline, or the font service down)
// stops the run instead of producing figures.
// beforeLoad(page) runs before the page is requested, for a check that has to
// watch the load itself or seed the page's storage.
export async function openPage(
  site,
  file,
  { width = 1440, height = 900, touch = false, errors = [], beforeLoad } = {},
) {
  // touch opens the page as a phone does, with a coarse pointer, which is half
  // of what makes the page start at the smaller text size.
  const page = await site.browser.newPage({ viewport: { width, height }, hasTouch: touch, isMobile: touch });
  page.on('pageerror', (e) => errors.push(e.message));
  if (beforeLoad) await beforeLoad(page);
  await page.goto(site.url(file));
  await page.waitForSelector('.reader', { timeout: 15000 });
  await bodyFaceLoaded(page, file);
  await page.waitForTimeout(150);
  return page;
}

// Waits for the face the page's text is set in, in each of the weights and
// slants it is drawn with, and stops the run if it is not there. The browser
// only fetches a face when something is first drawn in it, so a page that has
// just changed typeface is in a fallback for a moment, and lines measured in
// that moment are lines of a different face.
async function bodyFaceLoaded(page, what) {
  const face = await page.evaluate(async () => {
    const family = getComputedStyle(document.querySelector('.reader'))
      .fontFamily.split(',')[0]
      .replace(/["']/g, '')
      .trim();
    for (const style of ['400', '700', 'italic 400'])
      await document.fonts.load(`${style} 1em "${family}"`).catch(() => {});
    await document.fonts.ready;
    const loaded = [...document.fonts].some((f) => f.family.replace(/["']/g, '') === family && f.status === 'loaded');
    return { family, loaded };
  });
  if (!face.loaded)
    throw new Error(
      `${what}: the body typeface "${face.family}" did not load, so nothing measured here can be trusted`,
    );
}

// Chooses a reading setting through the panel, opening it if it is shut.
// The panel is left open; close it with togglePanel(page, 'settings').
// Choosing a typeface waits for it, as opening a page does.
export async function setSetting(page, key, value) {
  const button = page.locator('button[aria-controls="settings-panel"]');
  if ((await button.getAttribute('aria-expanded')) !== 'true') await button.click();
  await page.locator(`input[name="setting-${key}"][value="${value}"]`).check();
  if (key === 'font') await bodyFaceLoaded(page, `font=${value}`);
}

// Opens or shuts the header's panels: 'settings' or 'parts'.
export async function togglePanel(page, name) {
  await page.locator(`button[aria-controls="${name}-panel"]`).click();
}
