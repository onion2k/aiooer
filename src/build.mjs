// Builds the canvas: every board under dist/canvas/project/, the canvas
// index, and a test copy in test-results/site beside the canvas runtime, so
// the checks render exactly what will be published. Run it after any change
// to the markdown or the design; nothing in dist/ is edited by hand.

import fs from 'node:fs';
import path from 'node:path';
import { parsePart, parseIntro } from './content.mjs';
import { homeFile, partFile } from './pages.mjs';
import { DIAGRAMS } from './diagrams.mjs';
import { GRID_GUIDE } from './styles.mjs';
import { CONTENT_DIR, CANVAS_PROJECT as PROJECT, TEST_SITE, RUNTIME, HEIGHTS_FILE, CREATED_FILE } from './paths.mjs';

const heights = fs.existsSync(HEIGHTS_FILE) ? JSON.parse(fs.readFileSync(HEIGHTS_FILE, 'utf8')) : {};
const MAX_H = 8000;
const h = (file, fallback) => Math.min(MAX_H, heights[file] || fallback);

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

const partTitle = (m) => `${m.module}, part ${m.n}: ${m.shortTitle}`;

// The boards, row by row. Row one is the website itself; the rows below show
// it on a phone and in its other reading settings.
const rows = [
  {
    note: 'The website',
    boards: [
      {
        file: 'Main.dc.html',
        title: 'Home: course introduction',
        w: 1440,
        h: h('Main.dc.html', 5200),
        fill: true,
        make: (p) => homeFile(intro, parts, p),
      },
      ...models.map((m) => ({
        file: m.out,
        title: partTitle(m),
        w: 1440,
        h: 3200,
        fill: true,
        make: (p) => partFile(m, parts, intro, p),
      })),
    ],
  },
  {
    note: 'On a phone',
    boards: [
      {
        file: 'Phone-Home.dc.html',
        title: 'Phone: home',
        w: 390,
        h: h('Phone-Home.dc.html', 7000),
        fixed: true,
        remember: false,
        make: (p) => homeFile(intro, parts, p),
      },
      {
        file: 'Phone-Part.dc.html',
        title: 'Phone: Part 1, opening sections',
        w: 390,
        h: h('Phone-Part.dc.html', 6000),
        fixed: true,
        remember: false,
        maxSections: 3,
        make: (p) => partFile(models[0], parts, intro, p),
      },
      // The first written part of each later module, so that a module's own
      // label and breadcrumb are seen at phone width too.
      ...models
        .filter((m) => m.n === 1 && m.module !== models[0].module)
        .map((m) => ({
          file: `Phone-${m.out}`,
          title: `Phone: ${m.module}, part 1, opening sections`,
          w: 390,
          h: h(`Phone-${m.out}`, 6000),
          fixed: true,
          remember: false,
          maxSections: 3,
          make: (p) => partFile(m, parts, intro, p),
        })),
      {
        file: 'Phone-Contents.dc.html',
        title: 'Phone: contents open',
        w: 390,
        h: 1560,
        fixed: true,
        remember: false,
        maxSections: 1,
        tocOpen: true,
        make: (p) => partFile(models[0], parts, intro, p),
      },
      {
        file: 'Phone-Parts.dc.html',
        title: 'Phone: parts menu open',
        w: 390,
        h: h('Phone-Parts.dc.html', 1400),
        fixed: true,
        remember: false,
        maxSections: 1,
        openAtStart: 'parts',
        make: (p) => partFile(models[0], parts, intro, p),
      },
      {
        file: 'Phone-Settings.dc.html',
        title: 'Phone: reading settings open',
        w: 390,
        h: h('Phone-Settings.dc.html', 2200),
        fixed: true,
        remember: false,
        maxSections: 1,
        openAtStart: 'settings',
        make: (p) => partFile(models[0], parts, intro, p),
      },
    ],
  },
  {
    note: 'Reading settings and themes',
    boards: [
      {
        file: 'Settings-Open.dc.html',
        title: 'Reading settings open',
        w: 1440,
        h: h('Settings-Open.dc.html', 1500),
        fixed: true,
        remember: false,
        maxSections: 1,
        openAtStart: 'settings',
        make: (p) => partFile(models[0], parts, intro, p),
      },
      {
        file: 'Theme-Dark.dc.html',
        title: 'Dark, with a deep dive open',
        w: 1440,
        h: h('Theme-Dark.dc.html', 3600),
        fixed: true,
        remember: false,
        maxSections: 3,
        start: { theme: 'dark' },
        deepOpenAtStart: ['d1'],
        make: (p) => partFile(models[0], parts, intro, p),
      },
      {
        file: 'Theme-Contrast.dc.html',
        title: 'High contrast',
        w: 1440,
        h: h('Theme-Contrast.dc.html', 3600),
        fixed: true,
        remember: false,
        maxSections: 3,
        start: { theme: 'contrast' },
        deepOpenAtStart: ['d1'],
        make: (p) => partFile(models[0], parts, intro, p),
      },
      {
        file: 'Theme-Largest.dc.html',
        title: 'Largest text, widest spacing, serif',
        w: 1440,
        h: h('Theme-Largest.dc.html', 3600),
        fixed: true,
        remember: false,
        maxSections: 2,
        start: { size: 'largest', spacing: 'widest', font: 'serif' },
        make: (p) => partFile(models[0], parts, intro, p),
      },
    ],
  },
];

fs.rmSync(PROJECT, { recursive: true, force: true });
fs.mkdirSync(PROJECT, { recursive: true });
fs.rmSync(TEST_SITE, { recursive: true, force: true });
fs.mkdirSync(TEST_SITE, { recursive: true });

const boards = {};
const order = [];
const notes = {};
let y = 0;
const GAP_X = 80;
const ROW_GAP = 120;
const NOTE_SPACE = 300;
rows.forEach((row, ri) => {
  let x = 0;
  const rowY = ri === 0 ? 0 : y + ROW_GAP + NOTE_SPACE;
  let rowH = 0;
  for (const b of row.boards) {
    const page = { ...b, start: b.start, remember: b.remember, fixed: !!b.fixed };
    const html = b.make(page);
    fs.writeFileSync(path.join(PROJECT, b.file), html);
    fs.writeFileSync(path.join(TEST_SITE, b.file), html);
    const entry = { x, y: rowY, w: b.w, h: b.h, title: b.title };
    // Desktop boards show the twelve-column grid they are laid out on.
    if (b.w === 1440) entry.guides = [GRID_GUIDE];
    if (b.fill) {
      entry.expand = 'fill';
      entry.is_interactive = true;
    }
    boards[b.file] = entry;
    order.push(b.file);
    x += b.w + GAP_X;
    rowH = Math.max(rowH, b.h);
  }
  // The editor saves a title's width and caps maxW at 8000; writing the same
  // keeps a rebuild from differing from what the canvas holds.
  notes['row' + (ri + 1)] = {
    x: 0,
    y: rowY - 260,
    text: row.note,
    kind: 'title1',
    maxW: Math.min(8000, x - GAP_X),
    w: 240,
  };
  y = rowY + rowH;
});

// Nothing may link to a page that was not built: a part still to come has an
// address waiting for it, and a link to it would lead nowhere.
for (const file of order) {
  const html = fs.readFileSync(path.join(PROJECT, file), 'utf8');
  for (const m of html.matchAll(/href="([^"#]+\.dc\.html)/g))
    if (!boards[m[1]]) throw new Error(`${file} links to ${m[1]}, which was not built`);
}

const indexFile = path.join(PROJECT, 'canvas.json');
// The canvas was created once; its stamp is kept so every rebuild writes the
// same index, and a publish never looks like a new canvas.
const previous = fs.existsSync(CREATED_FILE) ? JSON.parse(fs.readFileSync(CREATED_FILE, 'utf8')) : null;
const createdOnFiles = previous || { v: 1, at: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z') };
if (!previous) fs.writeFileSync(CREATED_FILE, JSON.stringify(createdOnFiles));
const canvas = {
  v: 3,
  attachments: {},
  createdOnFiles,
  title: intro.courseTitle,
  launch: { view: 'focused', file: 'Main.dc.html' },
  pages: [],
  boards,
  order,
  notes,
  designSystems: [],
};
fs.writeFileSync(indexFile, JSON.stringify(canvas, null, 2));

// The canvas's runtime is not in the repository, since it carries no licence
// to republish it. The boards build without it; only the checks, which render
// the test copy, need it, and they say so if it is missing.
const hasRuntime = fs.existsSync(RUNTIME);
if (hasRuntime) fs.copyFileSync(RUNTIME, path.join(TEST_SITE, 'support.js'));

const sizes = order.map((f) => `${f} ${(fs.statSync(path.join(PROJECT, f)).size / 1024).toFixed(0)} KB`);
console.log(`Built ${order.length} boards:\n  ${sizes.join('\n  ')}`);
if (!hasRuntime)
  console.log('No canvas runtime in vendor/, so the checks cannot render the test copy: see vendor/README.md.');
