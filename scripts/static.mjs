// Builds the course as an ordinary website, in dist/site, for putting on any
// web server. It runs in plain Node: no browser, no canvas runtime, nothing
// that is not in this repository, so a build server can run it on a push.
//
// A board is not a page. It is markup with holes in it, loops, branches and a
// logic class, which the canvas's runtime turns into a page in the browser.
// This does the same work here: it runs the board's own logic class to get the
// values it starts with, fills the template with them (src/template.mjs), and
// writes the result. What the runtime went on doing as the reader used the
// page, src/reader.js does instead. Nothing of the runtime, which carries no
// licence to republish, is in what ships.
//   node scripts/static.mjs
import fs from 'node:fs';
import path from 'node:path';
import { sitePages } from './harness.mjs';
import { ROOT, CANVAS, CANVAS_PROJECT } from '../src/paths.mjs';
import { expand } from '../src/template.mjs';
import * as rule from '../src/calculator.mjs';

const OUT = path.join(CANVAS, '..', 'site');
const READER = path.join(ROOT, 'src', 'reader.js');

// A board's name as a page's: Main.dc.html is the site's front page.
const asPage = (file) => (file === 'Main.dc.html' ? 'index.html' : file.replace(/\.dc\.html$/, '.html'));

// The board's own logic class, run here to get the values it would start with
// in the browser. It is the same class the canvas runs, so the two cannot
// disagree about what a page says before anyone touches it.
export function startingValues(script) {
  const DCLogic = class {
    constructor(props) {
      this.props = props || {};
      this.state = {};
    }
    setState() {
      // Nothing sets state before the first draw.
    }
  };
  const make = new Function('DCLogic', 'window', `${script}\nreturn Component;`);
  // No window: the class touches it only once the page is running. A board
  // with no settings chosen starts at its own defaults, which it holds itself.
  const Component = make(DCLogic, undefined);
  return new Component({}).renderVals();
}

// A built board, taken apart. Every piece of its shape is written by
// src/pages.mjs, so a change there this does not expect stops the build rather
// than quietly dropping something.
export function partsOf(board) {
  const piece = (re, what) => {
    const m = re.exec(board);
    if (!m) throw new Error(`No ${what} in the board; src/pages.mjs has changed shape`);
    return m[1];
  };
  return {
    title: piece(/<title>([\s\S]*?)<\/title>/, 'title'),
    helmet: piece(/<helmet>([\s\S]*?)<\/helmet>/, 'helmet'),
    body: piece(/<\/helmet>\s*([\s\S]*?)\s*<\/x-dc>/, 'body'),
    script: piece(/<script type="text\/x-dc"[^>]*>([\s\S]*?)<\/script>/, 'logic class'),
  };
}

// The calculator's arithmetic, by its source, for the one page that has one:
// each function under its own name, since String(fn) gives "function name(…)".
const calcRule = `<script>window.CALC_RULE={${[rule.cleanDays, rule.cleanSaving, rule.delivery]
  .map((fn) => `${fn.name}:${String(fn)}`)
  .join(',')}};</script>`;

export function staticPage(board) {
  const { title, helmet, body, script } = partsOf(board);
  const html = expand(body, startingValues(script));
  const calc = html.includes('figure calc') ? calcRule : '';
  // Links between boards become links between pages.
  const linked = html.replace(/href="([A-Za-z0-9-]+)\.dc\.html/g, (m, name) => `href="${asPage(name + '.dc.html')}`);
  return `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
${helmet.trim()}
</head>
<body>
${linked}
${calc}<script src="reader.js" defer></script>
</body>
</html>
`;
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
fs.copyFileSync(READER, path.join(OUT, 'reader.js'));

const written = [];
for (const file of sitePages()) {
  const board = fs.readFileSync(path.join(CANVAS_PROJECT, file), 'utf8');
  const name = asPage(file);
  fs.writeFileSync(path.join(OUT, name), staticPage(board));
  written.push(name);
}

// Nothing of the canvas may be left in a page, and nothing may link to a page
// that was not written. A hole or a loop still standing would be a piece of
// the page that never rendered.
for (const name of written) {
  const html = fs.readFileSync(path.join(OUT, name), 'utf8');
  for (const [re, what] of [
    [/\{\{[^}]{1,40}\}\}/, 'an unrendered hole'],
    [/<sc-(for|if)\b/, 'an unrendered loop or branch'],
    [/\son[A-Z][a-zA-Z]*=/, 'a canvas event attribute'],
    [/support\.js|<x-dc|<helmet/, "something of the canvas's"],
    [/\.dc\.html/, 'a link to a board'],
  ]) {
    const m = re.exec(html);
    if (m) throw new Error(`${name} still holds ${what}: "${m[0]}"`);
  }
  for (const m of html.matchAll(/href="([^"#:]+\.html)"/g))
    if (!written.includes(m[1])) throw new Error(`${name} links to ${m[1]}, which was not written`);
}

const sizes = written.map((f) => `${f} ${(fs.statSync(path.join(OUT, f)).size / 1024).toFixed(0)} KB`);
console.log(`Built ${written.length} pages in dist/site:\n  ${sizes.join('\n  ')}`);
console.log(`\nServe that folder with any web server. Its front page is index.html.`);
