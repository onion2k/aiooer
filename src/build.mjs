// Builds the course into an ordinary website, in dist/site: the home page at
// the root and each part in a folder of its own, plus reader.js. Run it after
// any change to the markdown or the design; nothing in dist/ is edited by hand.
//
// It runs in plain Node, with no browser and nothing that is not in this
// repository, so a build server can run it on a push.
//
// A page is written in three steps. pages.mjs makes its markup, with holes
// where a value goes and loops where a list does; logic.mjs says what those
// values are as the page loads; template.mjs fills them in. What happens once
// a reader touches anything is src/reader.js, which the page loads.
import fs from 'node:fs';
import path from 'node:path';
import { parsePart, parseIntro } from './content.mjs';
import { homeFile, partFile, moduleFile } from './pages.mjs';
import { DIAGRAMS } from './diagrams.mjs';
import { expand } from './template.mjs';
import { CONTENT_DIR, STATIC_SITE as OUT, ROOT } from './paths.mjs';
import * as rule from './calculator.mjs';

const READER = path.join(ROOT, 'src', 'reader.js');

const intro = parseIntro(CONTENT_DIR);
const parts = intro.parts;
const models = parts.filter((p) => p.written).map((src) => parsePart(CONTENT_DIR, src));

// Every diagram in the course must have a drawing, and every drawing a diagram.
const used = new Set();
for (const m of models)
  for (const s of m.sections)
    for (const b of s.blocks.flatMap((x) => (x.type === 'deep' ? x.blocks : [x])))
      if (b.type === 'diagram') used.add(b.key);
for (const key of used) if (!DIAGRAMS[key]) throw new Error('Diagram without a drawing: ' + key);
for (const key of Object.keys(DIAGRAMS)) if (!used.has(key)) throw new Error('Drawing without a diagram: ' + key);

// Where each page is served from: the home page at the site's root, and each
// part in a folder of its own under its module's, so an address says what it
// leads to. A page's markup links by key, as `page:Practical1`, because only
// this knows where both ends of a link are served from.
// Only a module with a written part gets a page: one with none has nothing
// to list and no address a reader could have reached.
const liveModules = intro.modules.filter((m) => m.parts.some((p) => p.written));
const pages = [
  { url: '', make: () => homeFile(intro, parts, {}) },
  ...liveModules.map((m) => ({ url: m.url, make: () => moduleFile(m, intro) })),
  ...models.map((m) => ({ url: m.url, make: () => partFile(m, parts, intro, {}) })),
];
const addresses = new Map([
  ['Main', ''],
  ...liveModules.map((m) => [`mod-${m.slug}`, m.url]),
  ...models.map((m) => [m.out, m.url]),
]);

// How far a link from a page has to climb to reach the site's root, and the
// link from one page to another. Every link is relative, so the site works at
// a domain's root, in a folder, or opened from a disk.
const upTo = (url) => '../'.repeat((url.match(/\//g) || []).length);
const linkFrom = (from, to) => `${upTo(from)}${to}` || './';

// The calculator's arithmetic, by its source, for the one page that has one:
// each function under its own name, since String(fn) gives "function name(…)".
// The page and reader.js work from one rule, so they cannot disagree.
const calcRule = `<script>window.CALC_RULE={${[rule.cleanDays, rule.cleanSaving, rule.delivery]
  .map((fn) => `${fn.name}:${String(fn)}`)
  .join(',')}};</script>`;

function page({ title, description, helmet, body, vals, calculator }, from) {
  const html = expand(body, vals).replace(/href="page:([A-Za-z0-9-]+)/g, (m, key) => {
    const to = addresses.get(key);
    if (to === undefined) throw new Error(`A link to ${key}, which is not a page of the site`);
    return `href="${linkFrom(from, to)}`;
  });
  return `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${description}">
${helmet}
</head>
<body>
${html}
${calculator ? calcRule : ''}<script src="${upTo(from)}reader.js" defer></script>
</body>
</html>
`;
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
fs.copyFileSync(READER, path.join(OUT, 'reader.js'));

const written = [];
for (const { url, make } of pages) {
  const name = `${url}index.html`;
  fs.mkdirSync(path.join(OUT, path.dirname(name)), { recursive: true });
  fs.writeFileSync(path.join(OUT, name), page(make(), url));
  written.push(name);
}

// A hole or a loop still standing would be a piece of the page that never
// rendered, and a link that lands nowhere is one a reader would follow into a
// 404. Every link between pages is relative, so resolving one against the page
// it sits on is the only way to know where it lands.
for (const name of written) {
  const html = fs.readFileSync(path.join(OUT, name), 'utf8');
  for (const [re, what] of [
    [/\{\{[^}]{1,40}\}\}/, 'an unrendered hole'],
    [/<sc-(for|if)\b/, 'an unrendered loop or branch'],
    [/\son[A-Z][a-zA-Z]*=/, 'an unbound event attribute'],
    [/href="page:/, 'a link that was never rewritten'],
  ]) {
    const m = re.exec(html);
    if (m) throw new Error(`${name} still holds ${what}: "${m[0]}"`);
  }
  for (const m of html.matchAll(/href="([^"#:]*)(?:#[^"]*)?"/g)) {
    const href = m[1];
    if (!href || /^(https?:)?\/\//.test(href)) continue;
    const landing = path.posix.normalize(path.posix.join(path.posix.dirname(name), href));
    const target = landing.endsWith('/') || !landing.endsWith('.html') ? `${landing}/index.html` : landing;
    const clean = path.posix.normalize(target).replace(/^\.\//, '');
    if (!written.includes(clean))
      throw new Error(`${name} links to ${href}, which lands on ${clean} and was not written`);
  }
}

// Every page tells a search result what it is, in the course's own words. A
// description that is missing, too thin to say anything, too long to be shown
// whole, or shared with another page is worth nothing, and none of that is
// visible on the page itself, so the build is the only thing that can catch
// it. The ceiling is loose because a description is never cut mid-sentence.
const SAID = new Map();
for (const name of written) {
  const html = fs.readFileSync(path.join(OUT, name), 'utf8');
  const said = /<meta name="description" content="([^"]*)">/.exec(html)?.[1];
  if (!said) throw new Error(`${name} has no description`);
  if (said.length < 50 || said.length > 170)
    throw new Error(`${name} has a description of ${said.length} characters, wanted 50 to 170: "${said}"`);
  const other = SAID.get(said);
  if (other) throw new Error(`${name} and ${other} share a description: "${said}"`);
  SAID.set(said, name);
}

// The deploy reads netlify.toml, so what it says has to be true here. This
// exists because it once was not: the build command lived only in Netlify's
// dashboard, a script was renamed, and nothing in the repository could know.
// Now a rename fails here, where it is cheap, instead of on a push.
const deploy = fs.readFileSync(path.join(ROOT, 'netlify.toml'), 'utf8');
const says = (key) => new RegExp(`^\\s*${key}\\s*=\\s*"([^"]+)"`, 'm').exec(deploy)?.[1];
const command = says('command');
const publish = says('publish');
const scripts = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).scripts;
const named = /^npm run (?:--silent )?([\w:-]+)$/.exec(command || '')?.[1];
if (!named || !scripts[named])
  throw new Error(`netlify.toml builds with "${command}", which is not a script in package.json`);
if (publish !== path.relative(ROOT, OUT))
  throw new Error(`netlify.toml publishes ${publish}, but the site is written to ${path.relative(ROOT, OUT)}`);

const sizes = written.map((f) => `${f} ${(fs.statSync(path.join(OUT, f)).size / 1024).toFixed(0)} KB`);
console.log(`Built ${written.length} pages in dist/site:\n  ${sizes.join('\n  ')}`);
console.log(`\nServe that folder with any web server. Its front page is index.html.`);
