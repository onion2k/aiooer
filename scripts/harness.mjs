// The test API. Serves the built site beside the canvas's own page runtime,
// opens a board in headless Chromium, and drives it the way a reader does:
// through the reading settings panel and the page's buttons. Every check and
// look tool goes through here, so they all see the site exactly as the canvas
// renders it; without it each script would boot the page its own way and
// their figures would not agree.

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { chromium } from 'playwright';
import { serve } from './serve.mjs';
import { TEST_SITE, CONTENT_DIR } from '../src/paths.mjs';
import { parseIntro } from '../src/content.mjs';

const require = createRequire(import.meta.url);
export const AXE_PATH = require.resolve('axe-core/axe.min.js');

// The course as the introduction declares it: its name, its modules and their
// parts, written or still to come. The checks read it from here so that a new
// part is checked the day it is written, without anyone adding it to a list.
export function course() {
  return parseIntro(CONTENT_DIR);
}

// The site's own pages: the home page and every written part, in course order.
export function sitePages() {
  return [
    'Main.dc.html',
    ...course()
      .parts.filter((p) => p.written)
      .map((p) => p.out),
  ];
}

// Starts the server and the browser. Close both with site.close().
// Without the canvas's runtime beside the boards nothing would render, and
// every check would fail on an empty page; this says why before any does.
// Serves a folder and opens a browser on it. The default is the test copy of
// the canvas, which needs the runtime beside it; the static build passes its
// own folder, which needs nothing.
export async function startSite(root = TEST_SITE) {
  if (root === TEST_SITE && !fs.existsSync(path.join(TEST_SITE, 'support.js'))) {
    throw new Error(
      'The canvas runtime is missing, so the boards cannot be rendered. It is not in the repository; vendor/README.md says how to get it. Then run npm run build.',
    );
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

// Opens a board and waits until it has rendered and its typeface is in.
// Line lengths and pictures measured in a fallback font would be wrong, so a
// page whose body face failed to load (offline, or the font service down)
// stops the run instead of producing figures.
// beforeLoad(page) runs before the board is requested, for a check that has to
// watch the load itself or seed the page's storage.
export async function openPage(site, file, { width = 1440, height = 900, errors = [], beforeLoad } = {}) {
  const page = await site.browser.newPage({ viewport: { width, height } });
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
