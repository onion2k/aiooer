// The accessibility audit. Renders the built pages with the design runtime
// and holds them to WCAG 2.2 AAA (bar the reading-level criteria), with a
// figure for each check so a regression shows as a number that moved:
//   axe       axe-core's WCAG A, AA and AAA rules and its best practices,
//             in every theme, with every panel and deep dive open
//   measure   the longest line of running text, in characters (1.4.8: 80)
//   targets   buttons and links outside sentences under 44 by 44 (2.5.5)
//   reflow    horizontal scrolling at 320px wide and at 200% zoom (1.4.10)
//   spacing   clipped text with the 1.4.12 spacing overrides applied
//   keyboard  a Tab walk: focus visible, ring 2px or more, never covered
//   headings  one h1, and no skipped levels
//   corners   no corner rounder than 2px, on any block or control
//   grids     every block in a grid the same height, at desktop and phone
//             widths, and the page's layout on twelve columns at desktop
//   storage   every shape of saved reading settings still loads
// Exits non-zero if any check fails, and writes test-results/audit-report.md.
//   node scripts/audit.mjs [--quick] [--only axe,measure,...] [--pages File.dc.html,...] [--mutate name]

import fs from 'node:fs';
import path from 'node:path';
import { startSite, openPage, setSetting, AXE_PATH } from './harness.mjs';
import { RESULTS } from '../src/paths.mjs';
import { STORE_KEY, DEFAULTS } from '../src/logic.mjs';
const quick = process.argv.includes('--quick');
const only = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1].split(',') : null;
// --only measure,reflow runs just those checks, for quick iteration.
const run = (check) => !only || only.includes(check);
const pagesArg = process.argv.includes('--pages') ? process.argv[process.argv.indexOf('--pages') + 1].split(',') : null;
// --mutate <name> puts a known defect into every page, to prove the check
// that should catch it does catch it.
const mutation = process.argv.includes('--mutate') ? process.argv[process.argv.indexOf('--mutate') + 1] : null;
const MUTATIONS = {
  contrast: { css: '.reader{--ink-2:#8f8a80!important}' },
  focus: {
    css: '.reader :focus-visible{outline:none!important}.part-card:focus-within,.choice:has(input:focus-visible){outline:none!important}',
  },
  targets: { css: '.header-btn{min-height:0!important;padding-block:1px!important;line-height:1!important}' },
  measure: { css: '.reader{--measure-em:40em!important}' },
  reflow: { css: '.plain{min-width:400px}' },
  spacing: { css: '.plain-label{height:1.2em;overflow:hidden}' },
  corners: { css: '.header-btn{border-radius:999px!important}' },
  grids: {
    css: '.part-cards,.ideas,.legend,.routes,.parts-list,.settings-grid,.pager{grid-auto-rows:auto!important;align-items:start!important}',
  },
  twelve: { css: '.layout,.home-hero{grid-template-columns:15em minmax(0,1fr)!important}' },
  headings: {
    js: () => {
      const h = document.querySelector('.article h3:not(.deep-heading):not(.myth-claim)');
      if (h) {
        const h5 = document.createElement('h5');
        h5.textContent = h.textContent;
        h.replaceWith(h5);
      }
    },
  },
};

const FULL_PAGES = [
  'Main.dc.html',
  'Part1.dc.html',
  'Part2.dc.html',
  'Part3.dc.html',
  'Part4.dc.html',
  'Part5.dc.html',
  'Part6.dc.html',
];
const THEMES = quick ? ['paper', 'dark'] : ['paper', 'white', 'dark', 'contrast'];
const COMPS = [
  'Phone-Home.dc.html',
  'Phone-Part.dc.html',
  'Phone-Contents.dc.html',
  'Phone-Parts.dc.html',
  'Phone-Settings.dc.html',
  'Settings-Open.dc.html',
  'Theme-Dark.dc.html',
  'Theme-Contrast.dc.html',
  'Theme-Largest.dc.html',
];

const site = await startSite();
const results = {
  axe: [],
  measure: [],
  targets: [],
  reflow: [],
  spacing: [],
  keyboard: [],
  headings: [],
  corners: [],
  grids: [],
  storage: [],
};
let failures = 0;
const fail = (kind, msg) => {
  failures++;
  results[kind].push('FAIL ' + msg);
};
const pass = (kind, msg) => results[kind].push('ok   ' + msg);

async function open(file, { width = 1440, height = 900 } = {}) {
  const errors = [];
  const page = await openPage(site, file, { width, height, errors });
  if (errors.length) fail('axe', `${file}: page errors ${errors.join('; ')}`);
  if (mutation) {
    const m = MUTATIONS[mutation];
    if (m.css) await page.addStyleTag({ content: m.css });
    if (m.js) await page.evaluate(m.js);
  }
  return page;
}

async function runAxe(page, label) {
  await page.addScriptTag({ path: AXE_PATH });
  const r = await page.evaluate(async () => {
    const out = await window.axe.run(document, {
      runOnly: {
        type: 'tag',
        values: [
          'wcag2a',
          'wcag2aa',
          'wcag2aaa',
          'wcag21a',
          'wcag21aa',
          'wcag21aaa',
          'wcag22a',
          'wcag22aa',
          'wcag22aaa',
          'best-practice',
        ],
      },
      resultTypes: ['violations', 'incomplete'],
    });
    const brief = (list) =>
      list.map((v) => ({
        id: v.id,
        impact: v.impact,
        n: v.nodes.length,
        targets: v.nodes
          .slice(0, 3)
          .map((n) => n.target.join(' ') + ' :: ' + (n.failureSummary || '').split('\n').slice(1, 2).join('').trim()),
      }));
    return { violations: brief(out.violations), incomplete: brief(out.incomplete), passes: out.passes.length };
  });
  if (r.violations.length)
    fail('axe', `${label}: ${r.violations.map((v) => `${v.id} x${v.n} [${v.targets.join(' | ')}]`).join('; ')}`);
  else pass('axe', `${label}: no violations`);
  if (r.incomplete.length)
    results.axe.push(`note ${label}: needs review: ${r.incomplete.map((v) => `${v.id} x${v.n}`).join(', ')}`);
}

// The longest line of running text, counted in characters, found by
// grouping each word under the line box it sits on.
async function longestLine(page) {
  return page.evaluate(() => {
    const blocks = document.querySelectorAll(
      '.article p, .prose-list > li, .article dd, .plain-summary, .plain-who, .home-section p, .home-lede, .qa p',
    );
    let max = 0;
    let where = '';
    const all = [];
    for (const el of blocks) {
      if (!el.offsetParent) continue;
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      const lines = new Map();
      let node;
      while ((node = walker.nextNode())) {
        if (node.parentElement.closest('.sr-only')) continue;
        const text = node.textContent;
        // A hyphen is a place the browser may break a line, so each piece
        // of a hyphenated word is counted on the line it actually sits on.
        const re = /[^\s-]*-|[^\s-]+/g;
        let m;
        while ((m = re.exec(text))) {
          const range = document.createRange();
          range.setStart(node, m.index);
          range.setEnd(node, m.index + m[0].length);
          const rects = range.getClientRects();
          if (!rects.length) continue;
          const top = Math.round(rects[0].top);
          const key = [...lines.keys()].find((k) => Math.abs(k - top) < 6) ?? top;
          const spaced = m.index > 0 && /\s/.test(text[m.index - 1]);
          const prev = lines.get(key);
          lines.set(key, prev === undefined ? m[0].length : prev + m[0].length + (spaced ? 1 : 0));
        }
      }
      for (const n of lines.values()) {
        all.push(n);
        if (n > max) {
          max = n;
          where = el.textContent.slice(0, 60);
        }
      }
    }
    all.sort((a, b) => a - b);
    const p95 = all[Math.floor(all.length * 0.95)] || 0;
    const median = all[Math.floor(all.length / 2)] || 0;
    return { max, p95, median, lines: all.length, where };
  });
}

async function targetSizes(page) {
  return page.evaluate(() => {
    const small = [];
    const els = document.querySelectorAll('a[href], button, input, [tabindex]:not([tabindex="-1"])');
    for (const el of els) {
      if (!el.offsetParent && getComputedStyle(el).position !== 'fixed') continue;
      if (el.closest('.sr-only')) continue;
      // A link inside a sentence is exempt (2.5.5, "Inline").
      if (el.tagName === 'A') {
        const block = el.closest('p, li, td, dd, dt, th');
        const inSentence =
          block &&
          block.textContent.trim().length > el.textContent.trim().length + 2 &&
          getComputedStyle(el).display === 'inline';
        if (inSentence) continue;
      }
      let box = el.getBoundingClientRect();
      if (el.tagName === 'INPUT' && el.closest('label')) box = el.closest('label').getBoundingClientRect();
      if (el.classList.contains('skip-link')) continue;
      // A stretched link covers its whole card.
      if (el.closest('.part-card')) box = el.closest('.part-card').getBoundingClientRect();
      if (box.width < 44 || box.height < 44)
        small.push(
          `${el.tagName.toLowerCase()}.${[...el.classList].join('.')} "${(el.textContent || el.value || '').trim().slice(0, 40)}" ${Math.round(box.width)}x${Math.round(box.height)}`,
        );
    }
    return small;
  });
}

async function horizontalOverflow(page) {
  return page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const sw = document.scrollingElement.scrollWidth;
    const culprits = [];
    if (sw > vw) {
      for (const el of document.querySelectorAll('.reader *')) {
        const r = el.getBoundingClientRect();
        if (r.right > vw + 1 && !el.closest('pre') && !el.closest('.sr-only'))
          culprits.push(`${el.tagName.toLowerCase()}.${[...el.classList].join('.')} right=${Math.round(r.right)}`);
        if (culprits.length > 5) break;
      }
    }
    return { vw, sw, culprits };
  });
}

async function clippedText(page) {
  return page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll('.reader *')) {
      if (el.closest('.sr-only') || el.closest('pre') || !el.offsetParent) continue;
      // Content hidden with the visually-hidden pattern is meant for screen
      // readers only; its 1px box clips it on purpose.
      if (el.clientWidth <= 1 && el.clientHeight <= 1) continue;
      const cs = getComputedStyle(el);
      if (!/hidden|clip/.test(cs.overflowX + cs.overflowY)) continue;
      if (el.scrollHeight > el.clientHeight + 2 || el.scrollWidth > el.clientWidth + 2)
        out.push(
          `${el.tagName.toLowerCase()}.${[...el.classList].join('.')} ${el.scrollWidth}x${el.scrollHeight} in ${el.clientWidth}x${el.clientHeight}`,
        );
    }
    return out;
  });
}

async function headingOutline(page) {
  return page.evaluate(() => {
    const hs = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter(
      (h) => h.offsetParent || h.getClientRects().length,
    );
    const problems = [];
    const h1s = hs.filter((h) => h.tagName === 'H1').length;
    if (h1s !== 1) problems.push(`${h1s} h1 elements`);
    let prev = 0;
    for (const h of hs) {
      const lvl = Number(h.tagName[1]);
      if (prev && lvl > prev + 1) problems.push(`h${prev} then h${lvl}: "${h.textContent.trim().slice(0, 50)}"`);
      prev = lvl;
    }
    return { count: hs.length, problems };
  });
}

async function keyboardWalk(page, steps) {
  const issues = [];
  let seen = 0;
  for (let i = 0; i < steps; i++) {
    await page.keyboard.press('Tab');
    const info = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const cs = getComputedStyle(el);
      let ring = parseFloat(cs.outlineWidth) || 0;
      let style = cs.outlineStyle;
      // Some controls show focus on a parent (the radio's label, the card).
      const holder = el.closest('.choice, .part-card');
      if ((style === 'none' || ring === 0) && holder) {
        const hs = getComputedStyle(holder);
        ring = parseFloat(hs.outlineWidth) || 0;
        style = hs.outlineStyle;
      }
      const r = el.getBoundingClientRect();
      const cx = Math.min(Math.max(r.left + r.width / 2, 1), innerWidth - 1);
      const cy = Math.min(Math.max(r.top + r.height / 2, 1), innerHeight - 1);
      const top = document.elementFromPoint(cx, cy);
      const covered = top && !(el === top || el.contains(top) || top.contains(el) || (holder && holder.contains(top)));
      const inView = r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
      return {
        name: `${el.tagName.toLowerCase()} "${(el.textContent || el.value || '').trim().slice(0, 30)}"`,
        ring,
        style,
        covered,
        inView,
      };
    });
    if (!info) continue;
    seen++;
    if (info.style === 'none' || info.ring < 2) issues.push(`no visible ring on ${info.name}`);
    if (info.covered) issues.push(`covered: ${info.name}`);
    if (!info.inView) issues.push(`off screen: ${info.name}`);
  }
  return { seen, issues };
}

// Any element, or its ::before or ::after, whose corners are rounder than
// 2px. Radio buttons are left out: the browser draws those itself.
async function roundCorners(page) {
  return page.evaluate(() => {
    const out = [];
    const sides = ['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomLeftRadius', 'borderBottomRightRadius'];
    for (const el of document.querySelectorAll('.reader, .reader *')) {
      if (el.matches('input[type="radio"]') || !el.getClientRects().length) continue;
      for (const pseudo of [null, '::before', '::after']) {
        const cs = getComputedStyle(el, pseudo);
        if (pseudo && (cs.content === 'none' || cs.content === 'normal')) continue;
        const r = Math.max(...sides.map((k) => parseFloat(cs[k]) || 0));
        if (r > 2)
          out.push(
            `${el.tagName.toLowerCase()}.${[...el.classList].join('.')}${pseudo || ''} ${cs.borderTopLeftRadius}`,
          );
      }
    }
    return [...new Set(out)];
  });
}

// The grids of blocks, and how far apart the tallest and shortest block in
// each are. A grid that is shut away in a closed panel is not measured.
const GRIDS = ['.part-cards', '.ideas', '.legend', '.routes', '.pager', '.parts-list', '.settings-grid'];
async function gridSpreads(page, selectors = GRIDS) {
  return page.evaluate((selectors) => {
    const out = [];
    for (const sel of selectors) {
      for (const grid of document.querySelectorAll(sel)) {
        if (!grid.getClientRects().length) continue;
        const heights = [...grid.children]
          .filter((c) => c.getClientRects().length)
          .map((c) => c.getBoundingClientRect().height);
        if (heights.length < 2) continue;
        out.push({ sel, n: heights.length, spread: Math.max(...heights) - Math.min(...heights) });
      }
    }
    return out;
  }, selectors);
}

// The containers that must lay out on twelve columns at desktop width, by
// kind of page. Each is checked open; the panels' grids with the panel open.
const TWELVE = {
  home: [
    '.header-bar',
    '.home-hero',
    '.home-section > .shell',
    '.part-cards',
    '.ideas',
    '.legend',
    '.routes',
    '.site-footer > .shell',
  ],
  part: ['.header-bar', '.layout', '.site-footer > .shell'],
  panels: ['.parts-list', '.settings-grid'],
};
// A container is on twelve columns when its grid has exactly twelve tracks
// of one width. Counting tracks alone is not enough: an item placed at column
// 9 of a grid that has lost its twelve columns makes the browser add columns
// of its own, some of them empty, and the count comes back twelve anyway.
async function columnCounts(page, selectors) {
  return page.evaluate((sels) => {
    const out = [];
    for (const sel of sels) {
      const els = [...document.querySelectorAll(sel)].filter((e) => e.getClientRects().length);
      if (!els.length) out.push({ sel, tracks: 0, equal: false, missing: true });
      for (const el of els) {
        const cs = getComputedStyle(el);
        const widths = cs.display.includes('grid')
          ? cs.gridTemplateColumns
              .split(' ')
              .filter(Boolean)
              .map((w) => parseFloat(w))
          : [];
        const equal = widths.length > 0 && Math.max(...widths) - Math.min(...widths) <= 1;
        out.push({ sel, tracks: widths.length, equal });
      }
    }
    return out;
  }, selectors);
}

// Every shape of saved settings a reader's browser may hold. A new setting
// adds a shape here; an old one is never taken away, so a returning reader's
// choices always load. Values the panel could not have written fall back to
// the defaults instead of breaking the page.
const SAVED_SHAPES = [
  { name: 'nothing saved', value: null, expect: {} },
  { name: 'one setting', value: { theme: 'dark' }, expect: { theme: 'dark' } },
  {
    name: 'every setting',
    value: { theme: 'contrast', size: 'largest', spacing: 'widest', measure: 'short', font: 'serif', deep: 'open' },
    expect: { theme: 'contrast', size: 'largest', spacing: 'widest', measure: 'short', font: 'serif', deep: 'open' },
  },
  { name: 'unknown values', value: { theme: 'sepia', size: 7, colour: 'red' }, expect: {} },
  { name: 'not JSON', value: '{theme:', expect: {} },
];

const SPACING_CSS = `.reader *{line-height:1.5!important;letter-spacing:0.12em!important;word-spacing:0.16em!important}.reader p{margin-bottom:2em!important}`;

for (const file of pagesArg || FULL_PAGES) {
  // axe in every theme, first as the page opens, then with the settings
  // panel and every deep dive open so nothing hidden escapes the check.
  for (const theme of run('axe') ? THEMES : []) {
    const page = await open(file);
    if (theme !== 'paper') {
      await setSetting(page, 'theme', theme);
      await page.locator('button[aria-controls="settings-panel"]').click();
    }
    await runAxe(page, `${file} ${theme}`);
    await setSetting(page, 'deep', 'open');
    await runAxe(page, `${file} ${theme}, settings and deep dives open`);
    await page.locator('button[aria-controls="settings-panel"]').click();
    await page.locator('button[aria-controls="parts-panel"]').click();
    await runAxe(page, `${file} ${theme}, parts open`);
    await page.close();
  }

  // Line length at each line-length setting, and at the largest text.
  for (const [measure, size, font] of !run('measure')
    ? []
    : [
        ['standard', 'standard', 'sans'],
        ['long', 'standard', 'sans'],
        ['short', 'standard', 'sans'],
        ['long', 'largest', 'sans'],
        ['standard', 'standard', 'serif'],
        ['long', 'standard', 'serif'],
      ]) {
    const page = await open(file);
    await setSetting(page, 'measure', measure);
    await setSetting(page, 'size', size);
    await setSetting(page, 'font', font);
    await setSetting(page, 'deep', 'open');
    await page.locator('button[aria-controls="settings-panel"]').click();
    const m = await longestLine(page);
    const label = `${file} measure=${measure} size=${size} font=${font}: longest ${m.max} chars, 95th pct ${m.p95}, median ${m.median} over ${m.lines} lines`;
    if (m.max > 80) fail('measure', `${label} ("${m.where}")`);
    else pass('measure', label);
    await page.close();
  }

  // Targets, headings and the keyboard walk at desktop and phone widths.
  for (const width of run('keyboard') ? [1440, 390] : []) {
    const page = await open(file, { width, height: 900 });
    await setSetting(page, 'deep', 'open');
    const small = await targetSizes(page);
    if (small.length) fail('targets', `${file} @${width}: ${small.length} small: ${small.slice(0, 6).join('; ')}`);
    else pass('targets', `${file} @${width}: all targets 44x44 or larger`);
    await page.locator('button[aria-controls="settings-panel"]').click();
    const h = await headingOutline(page);
    if (h.problems.length) fail('headings', `${file} @${width}: ${h.problems.join('; ')}`);
    else pass('headings', `${file} @${width}: ${h.count} headings, one h1, no skipped levels`);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.mouse.click(5, 5);
    const k = await keyboardWalk(page, quick ? 40 : 120);
    if (k.issues.length) fail('keyboard', `${file} @${width}: ${k.issues.slice(0, 5).join('; ')}`);
    else pass('keyboard', `${file} @${width}: ${k.seen} tab stops, all with a ring of 2px or more, none covered`);
    await page.close();
  }

  // Reflow at 320px, and at 200% zoom of a 1280px window (640 CSS px).
  for (const [width, label] of run('reflow')
    ? [
        [320, '320px'],
        [640, '200% zoom'],
      ]
    : []) {
    const page = await open(file, { width, height: 800 });
    await setSetting(page, 'deep', 'open');
    const o = await horizontalOverflow(page);
    await page.locator('button[aria-controls="settings-panel"]').click();
    const o2 = await horizontalOverflow(page);
    const worst = o.sw > o.vw ? o : o2;
    if (worst.sw > worst.vw)
      fail('reflow', `${file} @${label}: scroll width ${worst.sw} > ${worst.vw}: ${worst.culprits.join('; ')}`);
    else pass('reflow', `${file} @${label}: no horizontal scrolling`);
    await page.close();
  }

  // Text spacing overrides must not clip or overlap text.
  for (const width of run('spacing') ? [1440, 390] : []) {
    const page = await open(file, { width, height: 900 });
    await setSetting(page, 'deep', 'open');
    await page.locator('button[aria-controls="settings-panel"]').click();
    await page.addStyleTag({ content: SPACING_CSS });
    await page.waitForTimeout(100);
    const clipped = await clippedText(page);
    const o = await horizontalOverflow(page);
    if (clipped.length || o.sw > o.vw)
      fail(
        'spacing',
        `${file} @${width}: ${clipped.slice(0, 5).join('; ')} ${o.sw > o.vw ? 'overflow ' + o.culprits.join('; ') : ''}`,
      );
    else pass('spacing', `${file} @${width}: nothing clipped with 1.4.12 spacing`);
    await page.close();
  }
  // Corners, with every panel and deep dive open so nothing escapes.
  if (run('corners')) {
    const page = await open(file);
    await setSetting(page, 'deep', 'open');
    const round = await roundCorners(page);
    await page.locator('button[aria-controls="settings-panel"]').click();
    await page.locator('button[aria-controls="parts-panel"]').click();
    round.push(...(await roundCorners(page)));
    const unique = [...new Set(round)];
    if (unique.length) fail('corners', `${file}: ${unique.length} rounder than 2px: ${unique.slice(0, 6).join('; ')}`);
    else pass('corners', `${file}: no corner rounder than 2px`);
    await page.close();
  }

  // Equal blocks in every grid, at both widths; twelve columns at desktop.
  for (const width of run('grids') ? [1440, 390] : []) {
    const page = await open(file, { width, height: 900 });
    const spreads = await gridSpreads(page);
    await page.locator('button[aria-controls="parts-panel"]').click();
    spreads.push(...(await gridSpreads(page, ['.parts-list'])));
    const panelTracks = width === 1440 ? await columnCounts(page, ['.parts-list']) : [];
    await page.locator('button[aria-controls="parts-panel"]').click();
    await page.locator('button[aria-controls="settings-panel"]').click();
    spreads.push(...(await gridSpreads(page, ['.settings-grid'])));
    if (width === 1440) panelTracks.push(...(await columnCounts(page, ['.settings-grid'])));
    await page.locator('button[aria-controls="settings-panel"]').click();
    const uneven = spreads.filter((g) => g.spread > 1);
    const label = spreads.map((g) => `${g.sel} ${g.n} blocks`).join(', ');
    if (!spreads.length) fail('grids', `${file} @${width}: no grids of blocks found`);
    else if (uneven.length)
      fail(
        'grids',
        `${file} @${width}: uneven ${uneven.map((g) => `${g.sel} by ${Math.round(g.spread)}px`).join(', ')}`,
      );
    else pass('grids', `${file} @${width}: every block the same height (${label})`);
    if (width === 1440) {
      const kind = file === 'Main.dc.html' ? 'home' : 'part';
      const counts = [...(await columnCounts(page, TWELVE[kind])), ...panelTracks];
      const wrong = counts.filter((c) => c.tracks !== 12 || !c.equal);
      if (wrong.length)
        fail(
          'grids',
          `${file} @1440: not on twelve columns: ${wrong.map((c) => `${c.sel} (${c.missing ? 'missing' : c.tracks + (c.equal ? ' columns' : ' columns of unequal widths')})`).join(', ')}`,
        );
      else pass('grids', `${file} @1440: ${counts.length} containers on twelve columns`);
    }
    await page.close();
  }
  console.error(`audited ${file}`);
}

// Saved settings of every shape load, once, on a part with deep dives.
for (const shape of run('storage') ? SAVED_SHAPES : []) {
  const page = await openPage(site, 'Part1.dc.html', {
    beforeLoad: (p) =>
      p.addInitScript(
        ([key, value]) => {
          if (value !== null) localStorage.setItem(key, value);
        },
        [
          STORE_KEY,
          shape.value === null || typeof shape.value === 'string' ? shape.value : JSON.stringify(shape.value),
        ],
      ),
  });
  const want = { ...DEFAULTS, ...shape.expect };
  const seen = await page.evaluate(() => ({
    classes: document.querySelector('.reader').className,
    deepOpen: document.querySelector('.deep-toggle')?.getAttribute('aria-expanded') === 'true',
  }));
  const missing = ['theme', 'size', 'spacing', 'measure', 'font']
    .map((k) => `${k}-${want[k]}`)
    .filter((c) => !seen.classes.split(' ').includes(c));
  if (seen.deepOpen !== (want.deep === 'open')) missing.push(`deep dives ${want.deep}`);
  if (missing.length) fail('storage', `${shape.name}: expected ${missing.join(', ')}; page has "${seen.classes}"`);
  else
    pass(
      'storage',
      `${shape.name}: loads as ${Object.keys(shape.expect).length ? JSON.stringify(shape.expect) : 'the defaults'}`,
    );
  await page.close();
}

for (const file of run('axe') ? COMPS : []) {
  const phone = file.startsWith('Phone');
  const page = await open(file, { width: phone ? 390 : 1440, height: 900 });
  await runAxe(page, `${file} (showcase board)`);
  await page.close();
}

await site.close();
const report = Object.entries(results)
  .map(([k, lines]) => `## ${k}\n${lines.join('\n')}`)
  .join('\n\n');
fs.mkdirSync(RESULTS, { recursive: true });
fs.writeFileSync(path.join(RESULTS, 'audit-report.md'), report + '\n');
console.log(report);
console.log(`\n${failures ? failures + ' FAILURE(S)' : 'ALL CHECKS PASS'}`);
process.exit(failures ? 1 : 0);
