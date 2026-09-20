// Builds the course as an ordinary website, in dist/site, for putting on any
// web server. The canvas build is the source of truth and this is taken from
// it: each board is opened with the canvas runtime, exactly as the checks and
// the canvas render it, and the page it produces is saved as plain HTML. So
// the static site cannot drift from what the canvas shows, and none of the
// runtime, which carries no licence to republish, goes into it: what is saved
// is the markup this project wrote, rendered.
//
// What the runtime did in the browser, src/reader.js does instead: the
// reading settings, the panels, the deep dives, the contents that follow the
// reader, and the calculator. The pages work without it, with the settings the
// build wrote.
//   node scripts/static.mjs
import fs from 'node:fs';
import path from 'node:path';
import { startSite, openPage, sitePages } from './harness.mjs';
import { ROOT, CANVAS } from '../src/paths.mjs';
import * as rule from '../src/calculator.mjs';

const OUT = path.join(CANVAS, '..', 'site');
const READER = path.join(ROOT, 'src', 'reader.js');

// A board's name as a page's: Main.dc.html is the site's front page.
const asPage = (file) => (file === 'Main.dc.html' ? 'index.html' : file.replace(/\.dc\.html$/, '.html'));

// The rendered page, with everything of the canvas's taken out of it and this
// site's own script put in. The runtime's own placeholder styles go, its
// script tag goes, and the logic class goes with it.
export function staticPage(html, { calculator }) {
  let out = html;
  const cut = (re, what) => {
    const before = out;
    out = out.replace(re, '');
    if (out === before) throw new Error(`Nothing to take out for ${what}; the runtime's output has changed shape`);
  };
  cut(/<style>\s*\.sc-placeholder[\s\S]*?<\/style>/, "the runtime's placeholder styles");
  cut(/<script[^>]*src="\.\/support\.js"[^>]*><\/script>/, "the runtime's script tag");
  cut(/<script type="text\/x-dc"[\s\S]*?<\/script>/, 'the page logic class');
  // Links between boards become links between pages.
  out = out.replace(/href="([A-Za-z0-9-]+)\.dc\.html/g, (m, name) => `href="${asPage(name + '.dc.html')}`);
  // The reader's script, and for the one page that has a calculator, the
  // arithmetic from calculator.mjs by its source, so that both sites work
  // from one rule.
  // Each function by its own name, so the object is valid however the
  // arithmetic is written: String(fn) gives "function name(...)".
  const calcRule = calculator
    ? `<script>window.CALC_RULE={${[rule.cleanDays, rule.cleanSaving, rule.delivery]
        .map((fn) => `${fn.name}:${String(fn)}`)
        .join(',')}};</script>`
    : '';
  out = out.replace('</body>', `${calcRule}<script src="reader.js" defer></script></body>`);
  return '<!doctype html>\n' + out + '\n';
}

const site = await startSite();
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
fs.copyFileSync(READER, path.join(OUT, 'reader.js'));

const written = [];
for (const file of sitePages()) {
  const page = await openPage(site, file);
  const html = await page.evaluate(() => document.documentElement.outerHTML);
  const calculator = await page.locator('.calc').count();
  await page.close();
  const name = asPage(file);
  fs.writeFileSync(path.join(OUT, name), staticPage(html, { calculator }));
  written.push(name);
}
await site.close();

// Nothing may be left of the canvas in a page, and nothing may link to a page
// that was not written.
for (const name of written) {
  const html = fs.readFileSync(path.join(OUT, name), 'utf8');
  for (const [re, what] of [
    [/\{\{[^}]{1,40}\}\}/, 'an unrendered hole'],
    [/<sc-(for|if)\b/, 'an unrendered loop or branch'],
    [/support\.js/, "the canvas's runtime"],
    [/\.dc\.html/, 'a link to a board'],
  ]) {
    const m = re.exec(html);
    if (m) throw new Error(`${name} still holds ${what}: "${m[0]}"`);
  }
  for (const m of html.matchAll(/href="([^"#:]+\.html)"/g))
    if (!written.includes(m[1])) throw new Error(`${name} links to ${m[1]}, which was not written`);
}

// Trust the instrument before its figures: every page is opened again, from
// the folder just written, with nothing of the canvas near it. A page that
// throws, or that asks for a file that is not there, would look perfectly
// well-formed on disk and be broken in a browser.
const check = await startSite(OUT);
for (const name of written) {
  const problems = [];
  const page = await openPage(check, name, { errors: problems });
  page.on('response', (r) => {
    if (r.status() >= 400) problems.push(`${r.status()} ${new URL(r.url()).pathname}`);
  });
  await page.reload();
  await page.waitForTimeout(150);
  const working = await page.evaluate(() => ({
    ruleWanted: !!document.querySelector('.calc'),
    ruleThere: !!window.CALC_RULE,
    // The script marks the page as its own once it has run.
    ran: document.documentElement.hasAttribute('data-reader'),
  }));
  if (!working.ran) problems.push('the reader script did not run');
  if (working.ruleWanted && !working.ruleThere) problems.push('the calculator has no arithmetic');
  await page.close();
  if (problems.length) throw new Error(`${name} does not work when served: ${problems.slice(0, 3).join('; ')}`);
}
await check.close();

const sizes = written.map((f) => `${f} ${(fs.statSync(path.join(OUT, f)).size / 1024).toFixed(0)} KB`);
console.log(`Built ${written.length} pages in dist/site:\n  ${sizes.join('\n  ')}`);
console.log(`\nServe that folder with any web server. Its front page is index.html.`);
