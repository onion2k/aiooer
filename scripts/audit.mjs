// The accessibility audit. Renders the pages that ship, in dist/site, and
// holds them to WCAG 2.2 AAA (bar the reading-level criteria), with a
// figure for each check so a regression shows as a number that moved:
//   axe       axe-core's WCAG A, AA and AAA rules and its best practices,
//             in every theme, with every panel and deep dive open
//   measure   the longest line at each line length: Short within AAA's 80
//             characters (1.4.8), Standard and Long wider on purpose, and
//             the three widths held at 1, 1.5 and 2 times Short
//   targets   buttons and links outside sentences under 44 by 44 (2.5.5)
//   reflow    horizontal scrolling at 320px wide and at 200% zoom (1.4.10)
//   spacing   clipped text with the 1.4.12 spacing overrides applied
//   keyboard  a Tab walk: focus visible, ring 2px or more, never covered,
//             and focused text 7:1 or better, in every theme
//   headings  one h1, and no skipped levels
//   corners   no corner rounder than 2px, on any block or control
//   grids     every block in a grid the same height, at desktop and phone
//             widths, and the page's layout on twelve columns at desktop
//   storage   every shape of saved reading settings still loads
//   numerals  the home page's four ideas numbered in the text colour
//   spy       the contents list marks the section the reader is in, bold,
//             and dims the ones already passed
//   modules   every part page says which module it is in and where, the
//             previous and next links run through every written part and
//             end at the introduction, nothing links to an unwritten part,
//             and the home page and the parts panel group parts by module
//   hues      a module's hue is never the only signal: everywhere one is
//             drawn, the module is also named in words, and in the high
//             contrast theme every hue is the ink, so nothing there needs
//             telling apart
//   calculator  a part's calculator shows what calculator.mjs works out from
//             the values on the page: as it opens, after each example, after
//             a slider is moved from the keyboard and a day count typed, and
//             after Start again
//   name      the course called by one name, its introduction's heading, in
//             the wordmark, the footer and every page title
//   decor     the page's decoration sits in no reader's way: no mark is ever
//             over a word, at any width or text size, none of it is reachable
//             by the keyboard or read out, and none of it is lettering the
//             page itself sets
// Exits non-zero if any check fails, and writes test-results/audit-report.md.
//   node scripts/audit.mjs [--quick] [--only axe,measure,...] [--pages File.html,...] [--mutate name]
//                           [--jobs 4] [--all]
//
// Pages are audited several at a time, since each opens in its own browser
// context and shares nothing with the others, and their results are put back
// in page order, so the report reads the same however the work fell out.
//
// A page that passed is not audited again until something that could change
// its result has changed: its own built file, this script, the harness, the
// reader script, the installed packages, the introduction, the list of built
// pages, or the flags. The key is a hash of all of those, and the results kept
// under it are the very lines the last run wrote. A failure is never kept, a
// mutated run neither reads nor writes what is kept, and --all audits every
// page whatever is kept. The typefaces come from the network and are not in
// the key; a page stops the run if its face did not load, so a bad one is
// never kept either.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { AsyncLocalStorage } from 'node:async_hooks';
import { startSite, openPage, setSetting, AXE_PATH, course, sitePages, pageMap, pageFile } from './harness.mjs';
import { RESULTS, STATIC_SITE, ROOT, CONTENT_DIR } from '../src/paths.mjs';
import { STORE_KEY, DEFAULTS } from '../src/logic.mjs';
import { parseModels, CAPABILITIES } from '../src/models.mjs';
import { delivery } from '../src/calculator.mjs';
const quick = process.argv.includes('--quick');
const only = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1].split(',') : null;
// --only measure,reflow runs just those checks, for quick iteration.
const run = (check) => !only || only.includes(check);
const jobs = process.argv.includes('--jobs') ? Number(process.argv[process.argv.indexOf('--jobs') + 1]) : 4;
const all = process.argv.includes('--all');
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
  widths: { css: '.reader{--measure-em:30em!important}' },
  numerals: { css: '.idea-num{color:var(--link)!important}' },
  // A part that claims to be in the other module, a way on that stops short,
  // and an unwritten part linked as if it were there.
  modulelabel: {
    js: () => {
      const e = document.querySelector('.eyebrow');
      if (e) e.textContent = 'Some other module · Part 1 of 3';
    },
  },
  pagerchain: {
    js: () => {
      const a = document.querySelector('.pager-link.is-next');
      if (a) a.setAttribute('href', 'index.html');
    },
  },
  cominglink: {
    js: () => {
      const a = document.querySelector('.footer-links a');
      if (a) a.setAttribute('href', 'Nowhere9.html');
    },
  },
  // A module's page losing one of the parts it is supposed to list, which
  // would leave a reader who came to it no way to reach that part.
  modulecards: {
    js: () => {
      document.querySelector('.part-card')?.remove();
    },
  },
  // A model dropped from the directory, which is the one thing a directory
  // must never do quietly.
  models: {
    js: () => {
      document.querySelector('.model-row')?.remove();
    },
  },
  // A wordmark that says something other than the introduction's heading.
  name: {
    js: () => {
      document.querySelector('.wordmark').textContent = 'Another course';
    },
  },
  // The spy's own scroll listener never hears the page scroll.
  spy: { js: () => window.addEventListener('scroll', (e) => e.stopImmediatePropagation(), true) },
  // The words are taken away from beside the hues, leaving the colour to say
  // on its own which module a thing belongs to, which is what must never
  // happen. Flattening the hues instead would prove nothing: nothing depends
  // on telling them apart, which is the whole point of them.
  hues: {
    js: () => {
      for (const el of document.querySelectorAll(
        '.module-title, .hero .eyebrow, .parts-group-title, .footer-group-title, .pager-link',
      ))
        el.textContent = '';
    },
  },
  // The calculator's result is swapped for a copy the page no longer updates.
  calc: {
    js: () => {
      const result = document.querySelector('.calc-result');
      if (result) result.replaceWith(result.cloneNode(true));
    },
  },
  // A mark slid over the prose, which is the one thing the decoration must
  // never do: text whose background cannot be worked out is text the audit
  // has to report as needing review.
  decor: {
    js: () => {
      const mark = [...document.querySelectorAll('.decor-mark')].find((el) => el.getClientRects().length);
      const words = [...document.querySelectorAll('.article p, .home-lede, .module-lede p, .directory-lede p, p')].find(
        (el) => el.getClientRects().length && el.textContent.trim().length > 20,
      );
      if (!mark || !words) return;
      const r = words.getBoundingClientRect();
      // A copy of a mark, dropped on the page over the words themselves. It
      // is hung on the body, which nothing positions, so the coordinates mean
      // what they say however the page around it is laid out.
      const slid = document.createElement('div');
      slid.className = 'decor';
      slid.setAttribute('aria-hidden', 'true');
      slid.style.position = 'absolute';
      slid.style.left = `${r.left + window.scrollX + 8}px`;
      slid.style.top = `${r.top + window.scrollY + 4}px`;
      slid.style.width = '6em';
      slid.style.height = '2em';
      slid.append(mark.cloneNode(true));
      document.body.append(slid);
    },
  },
  spybold: { css: '.reader .toc-list .is-current a{font-weight:400!important}' },
  spydim: { css: '.reader .toc-list .is-past a{color:var(--ink)!important}' },
  spyjump: { css: '.toc-text::after{display:none!important}' },
  pastfocus: { css: '.reader .toc-list .is-past a{color:var(--past)!important}' },
  focustext: { css: '.reader .toc-list a{color:var(--ink)!important}' },
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

const FULL_PAGES = sitePages();
// Where each board is served, and the page a link to an address lands on: a
// folder is served by the index.html inside it.
const WHERE = pageMap();
const fileOf = (board) => pageFile(WHERE.get(board));
// A module's own page, which is neither the home page nor a part: it has no
// contents to follow and lists its module's parts rather than every module's.
// The directory of models: reference rather than reading, so it has no
// contents to follow and is neither the home page nor a part.
const CATALOGUE = parseModels(CONTENT_DIR);
const DIRECTORY = 'models/index.html';
const MODULE_PAGES = new Map(
  course()
    .modules.filter((m) => m.parts.some((p) => p.written))
    .map((m) => [pageFile(m.url), m]),
);
const landing = (p) => {
  const clean = p.replace(/^\//, '');
  return clean === '' || clean.endsWith('/') ? `${clean}index.html` : clean;
};
const COURSE = course();
const THEMES = quick ? ['paper', 'dark'] : ['paper', 'white', 'dark', 'contrast'];
// The showcase boards: every board the build made that is not one of the
// site's own pages. Read from the built index, so a new module's phone board
// is checked without anyone adding it to a list.
const site = await startSite();
const KINDS = [
  'axe',
  'measure',
  'targets',
  'reflow',
  'spacing',
  'keyboard',
  'headings',
  'corners',
  'grids',
  'storage',
  'numerals',
  'spy',
  'name',
  'modules',
  'calculator',
  'hues',
  'directory',
  'decor',
];
const emptyResults = () => Object.fromEntries(KINDS.map((k) => [k, []]));
const results = emptyResults();
// Each page being audited has results of its own, found through the async
// context, so that pages running side by side never write into one list.
// Anything checked outside a page writes straight into the run's results.
const current = new AsyncLocalStorage();
const fail = (kind, msg) => (current.getStore() || results)[kind].push('FAIL ' + msg);
const pass = (kind, msg) => (current.getStore() || results)[kind].push('ok   ' + msg);

async function open(file, { width = 1440, height = 900 } = {}) {
  const errors = [];
  const page = await openPage(site, file, { width, height, errors });
  if (errors.length) fail('axe', `${file}: page errors ${errors.join('; ')}`);
  await mutate(page);
  return page;
}

// Puts the run's defect into a page. A check that moves the page about after
// it opens — by choosing a reading setting, say — asks for it again, since a
// defect placed from measurements is in the wrong place once the page reflows.
async function mutate(page) {
  if (!mutation) return;
  const m = MUTATIONS[mutation];
  if (m.css) await page.addStyleTag({ content: m.css });
  if (m.js) await page.evaluate(m.js);
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
    (current.getStore() || results).axe.push(
      `note ${label}: needs review: ${r.incomplete.map((v) => `${v.id} x${v.n}`).join(', ')}`,
    );
}

// The longest line of running text, counted in characters, found by
// grouping each word under the line box it sits on.
async function longestLine(page) {
  return page.evaluate(() => {
    const blocks = document.querySelectorAll(
      '.article p, .prose-list > li, .article dd, .plain-summary, .plain-who, .home-section p, .home-lede, .module-lede p, .qa p',
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

// The width a paragraph of running text is allowed (its measure), the width
// it fills, and the column it sits in, in pixels.
async function textWidths(page) {
  return page.evaluate(() => {
    const p = [...document.querySelectorAll('.article > section > p, .split-body > p, .module-lede > p')].find(
      (e) => e.getClientRects().length,
    );
    if (!p) throw new Error('No running text on this page to measure');
    return {
      measure: Math.round(parseFloat(getComputedStyle(p).maxWidth)),
      rendered: Math.round(p.getBoundingClientRect().width),
      column: Math.round(p.parentElement.getBoundingClientRect().width),
    };
  });
}

// Scrolls to the top, the bottom, or just into section `index`, waits for the
// contents list to follow, and says what is wrong with it: there must be one
// current item, marked for screen readers and bold, every earlier item
// dimmed and every later one plain.
// Which section the rule says is current once section `index` has been
// scrolled to the top: the last heading above a line 30% down the window, or
// the last of all when the page cannot scroll that far.
async function expectedAt(page, index) {
  return page.evaluate((i) => {
    const heads = [...document.querySelectorAll('.article > section > h2')];
    const end = document.documentElement.scrollHeight - window.innerHeight;
    const y = Math.min(end, heads[i].getBoundingClientRect().top + window.scrollY - 40);
    if (y >= end - 2) return heads.length - 1;
    let current = 0;
    heads.forEach((h, k) => {
      if (h.getBoundingClientRect().top + window.scrollY - y <= window.innerHeight * 0.3) current = k;
    });
    return current;
  }, index);
}

async function spyAt(page, where, scrollTo, index = scrollTo) {
  await page.evaluate(
    ([w, i]) => {
      const heads = document.querySelectorAll('.article > section > h2');
      const y =
        w === 'top'
          ? 0
          : w === 'bottom'
            ? document.documentElement.scrollHeight
            : heads[i].getBoundingClientRect().top + window.scrollY - 40;
      window.scrollTo(0, y);
    },
    [where, scrollTo],
  );
  await page
    .waitForFunction((i) => document.querySelectorAll('.toc-list > li')[i]?.classList.contains('is-current'), index, {
      timeout: 3000,
    })
    .catch(() => {});
  return page.evaluate((i) => {
    const problems = [];
    const items = [...document.querySelectorAll('.toc-list > li')];
    const marked = items.filter((li) => li.querySelector('a').getAttribute('aria-current') === 'location');
    if (marked.length !== 1) problems.push(`${marked.length} items marked current`);
    items.forEach((li, k) => {
      const want = k < i ? 'is-past' : k === i ? 'is-current' : 'is-next';
      if (!li.classList.contains(want)) problems.push(`item ${k + 1} is "${li.className}", not ${want}`);
    });
    const link = items[i]?.querySelector('a');
    if (link && parseInt(getComputedStyle(link).fontWeight, 10) < 700) problems.push('the current item is not bold');
    if (i > 0 && i < items.length - 1) {
      const past = getComputedStyle(items[0].querySelector('a')).color;
      const next = getComputedStyle(items[items.length - 1].querySelector('a')).color;
      if (past === next) problems.push('passed items are not dimmed');
    }
    return problems.slice(0, 4);
  }, index);
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
      // Every piece of text in the focused control, and what is behind it: the
      // nearest background that is not transparent (a part-transparent one
      // counts as solid, which this site never uses).
      const pieces = [];
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        const text = node.parentElement;
        if (!node.textContent.trim() || text.closest('.sr-only, svg')) continue;
        const ts = getComputedStyle(text);
        let back = null;
        for (let n = text; n && !back; n = n.parentElement) {
          const c = getComputedStyle(n).backgroundColor;
          if (c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') back = c;
        }
        const size = parseFloat(ts.fontSize);
        const large = size >= 24 || (size >= 18.66 && parseInt(ts.fontWeight, 10) >= 700);
        if (back) pieces.push({ color: ts.color, back, large });
      }
      return {
        name: `${el.tagName.toLowerCase()} "${(el.textContent || el.value || '').trim().slice(0, 30)}"`,
        ring,
        style,
        covered,
        inView,
        pieces,
      };
    });
    if (!info) continue;
    seen++;
    if (info.style === 'none' || info.ring < 2) issues.push(`no visible ring on ${info.name}`);
    if (info.covered) issues.push(`covered: ${info.name}`);
    if (!info.inView) issues.push(`off screen: ${info.name}`);
    const faint = faintest(info.pieces);
    if (faint) issues.push(`focused text at ${faint}: ${info.name}`);
  }
  return { seen, issues };
}

// The contrast between two computed colours, rgb() or rgba() strings, as
// WCAG works it out.
const channels = (c) => (c.match(/[\d.]+/g) || []).map(Number);
function luminance(c) {
  return [0.2126, 0.7152, 0.0722].reduce((sum, weight, i) => {
    const v = channels(c)[i] / 255;
    return sum + weight * (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  }, 0);
}
function contrastOf(fg, bg) {
  const [a, b] = [luminance(fg), luminance(bg)].sort((x, y) => y - x);
  return (a + 0.05) / (b + 0.05);
}

// The piece of text furthest short of AAA's 7:1 (4.5:1 when large), said as
// its ratio and colours, or null when every piece clears it. A focus style
// that paints a background has to recolour the text on it too, and a later
// rule that sets a colour can quietly undo that.
function faintest(pieces) {
  let worst = null;
  for (const p of pieces) {
    const ratio = contrastOf(p.color, p.back);
    const short = (p.large ? 4.5 : 7) - ratio;
    if (short > 0 && (!worst || short > worst.short))
      worst = { short, text: `${ratio.toFixed(2)}:1, ${p.color} on ${p.back}` };
  }
  return worst && worst.text;
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

// Every mark the decoration draws, and every word on the page, measured
// against each other. The decoration promises to sit in no reader's way, and
// a mark over a word would break that twice over: it would put a background
// under text that nothing can work out the colour of, which axe has to report
// as needing review, and it would make a reader work to read the guide.
//
// Words are measured as the glyphs themselves, through a range over each text
// node, rather than as the boxes around them: a mark beside a paragraph sits
// inside that paragraph's box quite legitimately, and it is the letters it
// must not touch. A mark that is fixed to the window is measured across the
// page's whole height, since anything it clears now it would meet as soon as
// the reader scrolled.
async function decorClashes(page) {
  return page.evaluate(() => {
    const name = (el) => (typeof el.className === 'string' ? el.className : el.className.baseVal) || el.tagName;
    // A word the decoration cannot be behind: something between it and the
    // page has lifted it above the decoration on its own opaque ground. The
    // skip link is the one thing on the site that does this — it lands over
    // whatever is beneath it when a reader tabs to it, in its own yellow
    // block. Everything else is measured strictly, since the decoration is
    // drawn under the page and a mark under a word is a mark over it.
    const liftedAbove = (el) => {
      for (let at = el; at && at !== document.body; at = at.parentElement) {
        const cs = getComputedStyle(at);
        const alpha = /^rgba\([^)]*,\s*([\d.]+)\)$/.exec(cs.backgroundColor);
        const opaque = cs.backgroundColor !== 'transparent' && (!alpha || Number(alpha[1]) > 0.9);
        if (cs.position !== 'static' && cs.zIndex !== 'auto' && Number(cs.zIndex) > 0 && opaque) return true;
      }
      return false;
    };
    // What of a word is actually on the screen. A code block scrolls sideways,
    // so the line inside it runs on well past the edge of its box: those
    // letters are not on the page at all, and a mark out there is behind
    // nothing. Every box that clips takes its bite out of the rectangle.
    const onScreen = (rect, el) => {
      let box = { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
      for (let at = el; at && at !== document.documentElement; at = at.parentElement) {
        const cs = getComputedStyle(at);
        if (cs.overflowX === 'visible' && cs.overflowY === 'visible') continue;
        const clip = at.getBoundingClientRect();
        box = {
          left: Math.max(box.left, clip.left),
          right: Math.min(box.right, clip.right),
          top: Math.max(box.top, clip.top),
          bottom: Math.min(box.bottom, clip.bottom),
        };
      }
      return box.right - box.left > 0.5 && box.bottom - box.top > 0.5 ? box : null;
    };
    const marks = [];
    for (const el of document.querySelectorAll('.decor, .decor *')) {
      const fixed = getComputedStyle(el).position === 'fixed' || !!el.closest('.decor-rail');
      for (const r of el.getClientRects()) {
        if (r.width < 0.5 || r.height < 0.5) continue;
        marks.push({
          left: r.left,
          right: r.right,
          top: fixed ? -1e6 : r.top,
          bottom: fixed ? 1e6 : r.bottom,
          what: name(el),
        });
      }
    }
    const words = [];
    const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let node = walk.nextNode(); node; node = walk.nextNode()) {
      if (!node.nodeValue.trim()) continue;
      const el = node.parentElement;
      // The decoration itself, and the text kept for a screen reader alone,
      // which is a clipped speck of a box and would collide by accident.
      if (!el || el.closest('.decor') || el.closest('.sr-only')) continue;
      // The skip link, which a reader tabs to and which lands on top of
      // whatever is under it in a block of its own.
      if (liftedAbove(el)) continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      for (const r of range.getClientRects()) {
        const seen = onScreen(r, el);
        if (!seen) continue;
        words.push({ r: seen, text: node.nodeValue.trim().slice(0, 30) });
      }
    }
    const over = [];
    for (const m of marks)
      for (const w of words) {
        const across = Math.min(m.right, w.r.right) - Math.max(m.left, w.r.left);
        const down = Math.min(m.bottom, w.r.bottom) - Math.max(m.top, w.r.top);
        if (across > 0.5 && down > 0.5) over.push(`${m.what} over "${w.text}"`);
      }
    // The decoration says nothing and goes nowhere: nothing in it is a tab
    // stop, everything in it is hidden from a screen reader, and the only
    // lettering it carries is drawn inside a picture, never set as text.
    const loud = [];
    for (const d of document.querySelectorAll('.decor')) {
      if (d.getAttribute('aria-hidden') !== 'true') loud.push(`${name(d)} is not hidden from a screen reader`);
      if (d.querySelector('a, button, input, select, textarea, [tabindex]')) loud.push(`${name(d)} can be tabbed to`);
      for (const el of [d, ...d.querySelectorAll('*')]) {
        const z = getComputedStyle(el).zIndex;
        if (z !== 'auto' && Number(z) > 0) loud.push(`${name(el)} is raised above the page at z-index ${z}`);
      }
      for (const el of d.querySelectorAll('*'))
        if (el.tagName !== 'text')
          for (const kid of el.childNodes)
            if (kid.nodeType === 3 && kid.nodeValue.trim()) loud.push(`${name(el)} sets words as text`);
    }
    return { marks: marks.length, words: words.length, over: [...new Set(over)], loud: [...new Set(loud)] };
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
  module: ['.header-bar', '.module-layout', '.site-footer > .shell'],
  directory: ['.header-bar', '.directory-layout', '.site-footer > .shell'],
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

async function auditPage(file) {
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

  // Line length. Short is the setting that holds AAA's 80 characters (1.4.8),
  // in both typefaces and at the largest text: offering it is the mechanism
  // the criterion asks for. Standard and Long are wider on purpose, so their
  // lines are reported, not capped, and their widths are held to Short's:
  // Standard half as wide again, Long twice, or the column where it is less.
  for (const [size, font] of run('measure')
    ? [
        ['standard', 'sans'],
        ['largest', 'sans'],
        ['standard', 'serif'],
      ]
    : []) {
    const widths = {};
    for (const measure of ['short', 'standard', 'long']) {
      const page = await open(file);
      await setSetting(page, 'measure', measure);
      await setSetting(page, 'size', size);
      await setSetting(page, 'font', font);
      await setSetting(page, 'deep', 'open');
      await page.locator('button[aria-controls="settings-panel"]').click();
      const m = await longestLine(page);
      widths[measure] = await textWidths(page);
      const label = `${file} measure=${measure} size=${size} font=${font}: longest ${m.max} chars, 95th pct ${m.p95}, median ${m.median} over ${m.lines} lines`;
      if (measure === 'short' && m.max > 80) fail('measure', `${label} ("${m.where}")`);
      else pass('measure', measure === 'short' ? label : `${label} (wider on purpose)`);
      await page.close();
    }
    const [s, st, l] = ['short', 'standard', 'long'].map((k) => widths[k].measure);
    const proportions = Math.abs(l / s - 2) < 0.01 && Math.abs(st / s - 1.5) < 0.01;
    const filled = Object.values(widths).every((w) => Math.abs(w.rendered - Math.min(w.measure, w.column)) <= 1);
    const label = `${file} size=${size} font=${font}: text widths short ${s}px, standard ${st}px, long ${l}px, in a ${widths.long.column}px column`;
    if (proportions && filled) pass('measure', `${label}; standard 1.5 and long 2 times short`);
    else
      fail(
        'measure',
        `${label}; standard ${(st / s).toFixed(2)} and long ${(l / s).toFixed(2)} times short, wanted 1.5 and 2`,
      );
  }

  // Modules. A part page names its module and its place in it, in the label
  // over its title, its breadcrumb and its page title; its way on leads to the
  // next written part, or from the last one back to the introduction; and no
  // page links to a page that was not built.
  if (run('modules')) {
    const written = COURSE.parts.filter((p) => p.written);
    const built = new Set(FULL_PAGES);
    const part = written.find((p) => fileOf(p.out) === file);
    const page = await open(file);
    const seen = await page.evaluate(() => ({
      label: document.querySelector('.eyebrow')?.textContent.trim() ?? null,
      crumbs: [...document.querySelectorAll('.crumbs li')].map((li) => li.querySelector('a')?.textContent.trim()),
      title: document.title,
      next: document.querySelector('.pager-link.is-next')?.href ?? null,
      prev: document.querySelector('.pager-link.is-prev')?.href ?? null,
      // Every link between pages is relative, so the browser's own resolution
      // of it is what a reader would follow. Anything off this origin is
      // somebody else's site and is the link checker's business, not this.
      links: [...document.querySelectorAll('a[href]')]
        .filter((a) => a.href.startsWith(location.origin))
        .map((a) => new URL(a.href).pathname),
      groups: [...document.querySelectorAll('.parts-group')].map((g) => ({
        name: g.querySelector('.parts-group-title')?.textContent.trim(),
        items: g.querySelectorAll('.parts-item').length,
        coming: g.querySelectorAll('.parts-item.is-coming').length,
      })),
      h1: document.querySelector('h1')?.textContent.trim() ?? null,
      cards: document.querySelectorAll('.part-card').length,
      comingCards: document.querySelectorAll('.part-card.is-coming').length,
      comingCardLinks: document.querySelectorAll('.part-card.is-coming a').length,
      home: [...document.querySelectorAll('.module')].map((m) => ({
        name: m.querySelector('.module-title')?.textContent.trim(),
        level: m.querySelector('.module-title')?.tagName,
        cards: m.querySelectorAll('.part-card').length,
        coming: m.querySelectorAll('.part-card.is-coming').length,
        comingLinks: m.querySelectorAll('.part-card.is-coming a').length,
      })),
    }));
    await page.close();
    const wrong = [];
    // A folder address is served by the index.html inside it, so that is the
    // page a link to it lands on.
    const dead = [...new Set(seen.links.map(landing).filter((h) => !built.has(h)))];
    if (dead.length) wrong.push(`links to pages that were not built: ${dead.join(', ')}`);
    const wantGroups = COURSE.modules.map((m) => ({
      name: m.name,
      items: m.parts.length,
      coming: m.parts.filter((p) => !p.written).length,
    }));
    if (JSON.stringify(seen.groups) !== JSON.stringify(wantGroups))
      wrong.push(`the parts panel groups ${JSON.stringify(seen.groups)}, wanted ${JSON.stringify(wantGroups)}`);
    if (part) {
      const i = written.indexOf(part);
      const label = `${part.module} · Part ${part.n} of ${part.of}`;
      if (seen.label !== label) wrong.push(`label "${seen.label}", wanted "${label}"`);
      const crumbs = ['Introduction', part.module, `Part ${part.n}: ${part.shortTitle}`];
      if (JSON.stringify(seen.crumbs) !== JSON.stringify(crumbs))
        wrong.push(`breadcrumb ${JSON.stringify(seen.crumbs)}`);
      if (!seen.title.includes(`${part.module}, part ${part.n}: `)) wrong.push(`page title "${seen.title}"`);
      const next = fileOf(written[i + 1]?.out ?? 'Main');
      const prev = fileOf(written[i - 1]?.out ?? 'Main');
      const went = (h) => (h ? landing(new URL(h).pathname) : null);
      if (went(seen.next) !== next) wrong.push(`next lands on ${went(seen.next)}, wanted ${next}`);
      if (went(seen.prev) !== prev) wrong.push(`previous lands on ${went(seen.prev)}, wanted ${prev}`);
    } else if (file === DIRECTORY) {
      // The directory names itself in its breadcrumb, its heading and its
      // page title, the way every other page does.
      const crumbs = ['Introduction', 'Models'];
      if (JSON.stringify(seen.crumbs) !== JSON.stringify(crumbs))
        wrong.push(`breadcrumb ${JSON.stringify(seen.crumbs)}`);
      if (seen.h1 !== 'Models') wrong.push(`heading "${seen.h1}"`);
      if (!seen.title.startsWith('Models · ')) wrong.push(`page title "${seen.title}"`);
    } else if (MODULE_PAGES.has(file)) {
      // A module's page names the module in its breadcrumb, its heading and
      // its page title, lists every one of its parts, and leads on to the
      // modules either side of it.
      const mod = MODULE_PAGES.get(file);
      const modules = COURSE.modules;
      const i = modules.findIndex((x) => x.name === mod.name);
      const crumbs = ['Introduction', mod.name];
      if (JSON.stringify(seen.crumbs) !== JSON.stringify(crumbs))
        wrong.push(`breadcrumb ${JSON.stringify(seen.crumbs)}`);
      if (seen.h1 !== mod.name) wrong.push(`heading "${seen.h1}", wanted "${mod.name}"`);
      if (!seen.title.startsWith(`${mod.name} · `)) wrong.push(`page title "${seen.title}"`);
      if (seen.cards !== mod.parts.length) wrong.push(`${seen.cards} cards, wanted ${mod.parts.length}`);
      const coming = mod.parts.filter((p) => !p.written).length;
      if (seen.comingCards !== coming) wrong.push(`${seen.comingCards} cards marked coming, wanted ${coming}`);
      if (seen.comingCardLinks) wrong.push(`${seen.comingCardLinks} parts still to come are linked`);
      const side = (m) => (m ? fileOf(`mod-${m.slug}`) : 'index.html');
      const went = (h) => (h ? landing(new URL(h).pathname) : null);
      const before = modules
        .slice(0, i)
        .reverse()
        .find((x) => x.parts.some((p) => p.written));
      const after = modules.slice(i + 1).find((x) => x.parts.some((p) => p.written));
      if (went(seen.prev) !== side(before)) wrong.push(`previous lands on ${went(seen.prev)}, wanted ${side(before)}`);
      if (went(seen.next) !== side(after)) wrong.push(`next lands on ${went(seen.next)}, wanted ${side(after)}`);
    } else {
      const wantHome = COURSE.modules.map((m) => {
        const coming = m.parts.filter((p) => !p.written).length;
        return { name: m.name, level: 'H3', cards: m.parts.length, coming, comingLinks: 0 };
      });
      if (JSON.stringify(seen.home) !== JSON.stringify(wantHome))
        wrong.push(`home modules ${JSON.stringify(seen.home)}, wanted ${JSON.stringify(wantHome)}`);
    }
    if (wrong.length) fail('modules', `${file}: ${wrong.join('; ')}`);
    else
      pass(
        'modules',
        part
          ? `${file}: ${part.module}, part ${part.n} of ${part.of}, in its label, breadcrumb and title; ways on and back right`
          : file === DIRECTORY
            ? `${file}: the directory, named in its breadcrumb, heading and title; no dead links`
            : MODULE_PAGES.has(file)
              ? `${file}: ${MODULE_PAGES.get(file).name}, ${seen.cards} parts listed, named in its breadcrumb, heading and title; ways on and back right`
              : `${file}: ${seen.home.map((m) => `${m.name} ${m.cards} cards (${m.coming} coming)`).join(', ')}; no dead links`,
      );
  }

  // The course's name is the introduction's heading, and every page says it
  // the same way: in the wordmark, the footer, the page title, and on the
  // home page as its heading.
  if (run('name')) {
    const course = COURSE.courseTitle;
    const page = await open(file);
    const seen = await page.evaluate(() => {
      const text = (sel) => document.querySelector(sel)?.textContent.trim() ?? null;
      return {
        wordmark: text('.wordmark'),
        footer: text('.footer-title'),
        home: text('.home-title'),
        title: document.title,
      };
    });
    await page.close();
    const wrong = [];
    if (seen.wordmark !== course) wrong.push(`wordmark "${seen.wordmark}"`);
    if (seen.footer !== course) wrong.push(`footer "${seen.footer}"`);
    if (file === 'index.html' && seen.home !== course) wrong.push(`heading "${seen.home}"`);
    if (!seen.title.startsWith(`${course}: `) && !seen.title.endsWith(` · ${course}`))
      wrong.push(`page title "${seen.title}"`);
    if (wrong.length) fail('name', `${file}: ${wrong.join('; ')}, not "${course}"`);
    else pass('name', `${file}: "${course}" in the wordmark, footer and page title`);
  }

  // The four ideas' numerals are the text colour, in every theme.
  for (const theme of run('numerals') && file === 'index.html' ? THEMES : []) {
    const page = await open(file);
    if (theme !== 'paper') {
      await setSetting(page, 'theme', theme);
      await page.locator('button[aria-controls="settings-panel"]').click();
    }
    const r = await page.evaluate(() => ({
      ink: getComputedStyle(document.querySelector('.reader')).color,
      nums: [...document.querySelectorAll('.idea-num')].map((n) => getComputedStyle(n).color),
    }));
    const off = r.nums.filter((c) => c !== r.ink);
    if (!r.nums.length) fail('numerals', `${file} ${theme}: no numerals found`);
    else if (off.length)
      fail('numerals', `${file} ${theme}: ${off.length} numerals are ${off[0]}, not the text colour ${r.ink}`);
    else pass('numerals', `${file} ${theme}: all ${r.nums.length} numerals in the text colour`);
    await page.close();
  }

  // The directory lists every model in models.json, says how many it is
  // showing, and filters down to exactly the models that match. The
  // expectation is worked out from the data, not written down here, so a
  // model added to models.json is checked from the day it is added.
  if (run('directory') && file === DIRECTORY) {
    const page = await open(file);
    const seen = await page.evaluate(() => ({
      names: [...document.querySelectorAll('.model-row .model-name-text')].map((el) => el.textContent.trim()),
      details: document.querySelectorAll('.model-extra .model-body').length,
      toggles: document.querySelectorAll('.model-row .model-toggle').length,
      shut: document.querySelectorAll('.model-extra[data-shut]').length,
      count: document.querySelector('.model-count')?.textContent.trim() ?? null,
      filtersFolded: !document.querySelector('details.filter-panel')?.open,
    }));
    const wrong = [];
    const want = CATALOGUE.models.map((m) => m.name);
    const missing = want.filter((n) => !seen.names.includes(n));
    if (missing.length) wrong.push(`missing ${missing.join(', ')}`);
    if (seen.names.length !== want.length) wrong.push(`${seen.names.length} rows, wanted ${want.length}`);
    if (seen.details !== want.length) wrong.push(`${seen.details} details panels, wanted ${want.length}`);
    if (seen.toggles !== want.length) wrong.push(`${seen.toggles} details buttons, wanted ${want.length}`);
    // Every panel starts shut, and each one's button says so.
    if (seen.shut !== want.length) wrong.push(`${seen.shut} panels shut at rest, wanted ${want.length}`);
    if (seen.count !== `Showing all ${want.length} models.`) wrong.push(`count says "${seen.count}"`);
    // The filters start folded, so a reader meets the table and not a screen
    // of controls. The count sits outside the fold and stays visible.
    if (!seen.filtersFolded) wrong.push('the filters are not folded as the page opens');

    // Everything below drives the filters, which means opening them first.
    await page.click('.filter-toggle');
    await page.waitForTimeout(40);

    // Filtering, driven as a reader drives it. Every capability in the data
    // is tried, so a new one cannot arrive unchecked.
    for (const key of CATALOGUE.capabilities) {
      await page.evaluate(() => document.querySelector('.filters').reset());
      await page.check(`#filter-does-${key}`);
      await page.waitForTimeout(30);
      const got = await page.evaluate(
        () => [...document.querySelectorAll('.model-row')].filter((r) => !r.hidden).length,
      );
      const expected = CATALOGUE.models.filter((m) => m.does.includes(key)).length;
      if (got !== expected) wrong.push(`${CAPABILITIES[key].label} shows ${got}, wanted ${expected}`);
    }
    // The button in a model's row opens the area beneath it, and says so.
    // The loop above leaves its last filter on, so the rows come back first:
    // clicking a row a filter is hiding would wait for a button that is not
    // there, which is what this check did when it was first written.
    await page.evaluate(() => document.querySelector('.filters').reset());
    await page.waitForTimeout(40);
    await page.click('.model-row:first-child .model-toggle');
    await page.waitForTimeout(40);
    const opened = await page.evaluate(() => {
      const button = document.querySelector('.model-row:first-child .model-toggle');
      const area = document.getElementById(button.getAttribute('aria-controls'));
      return {
        says: button.getAttribute('aria-expanded'),
        shown: !area.hasAttribute('data-shut') && !!area.offsetParent,
        wide: Math.round(area.getBoundingClientRect().width),
        table: Math.round(document.querySelector('table.models').getBoundingClientRect().width),
      };
    });
    if (opened.says !== 'true' || !opened.shown)
      wrong.push(`the first details button says ${opened.says}, shown ${opened.shown}`);
    // The area spans the table, which is the point of it being a row.
    if (Math.abs(opened.wide - opened.table) > 2)
      wrong.push(`the opened area is ${opened.wide}px against a ${opened.table}px table`);

    // A search that matches nothing says so rather than showing an empty table.
    await page.evaluate(() => document.querySelector('.filters').reset());
    await page.fill('#model-search', 'zzzzzz');
    await page.waitForTimeout(30);
    const empty = await page.evaluate(() => ({
      rows: [...document.querySelectorAll('.model-row')].filter((r) => !r.hidden).length,
      told: !document.querySelector('.model-none').hidden,
    }));
    if (empty.rows !== 0 || !empty.told)
      wrong.push(`a search matching nothing shows ${empty.rows} rows, told ${empty.told}`);
    await page.close();
    if (wrong.length) fail('directory', `${file}: ${wrong.join('; ')}`);
    else
      pass(
        'directory',
        `${file}: ${want.length} models, each with details; ${CATALOGUE.capabilities.length} filters show what the data says`,
      );
  }

  // The contents list follows the reader: at the top, in the middle and at
  // the bottom of a part, at desktop and phone size, and in a tall
  // 1440 by 3200 frame, where a short last section never reaches the line.
  const frames = [
    [1440, 900],
    [390, 844],
    [1440, 3200],
  ];
  const follows = file !== 'index.html' && file !== DIRECTORY && !MODULE_PAGES.has(file);
  for (const [width, height] of run('spy') && follows ? frames : []) {
    const page = await open(file, { width, height });
    const count = await page.evaluate(() => document.querySelectorAll('.article > section > h2').length);
    for (const [where, index] of [
      ['top', 0],
      ['middle', Math.floor(count / 2)],
      ['bottom', count - 1],
    ]) {
      // Scrolling a heading to the top makes it current only if the next one
      // is still below the reading line. On a short page in a tall frame
      // several headings sit above the line at once, and the rule is that
      // the last of them is current, or the last of all at the page's end.
      const expected = where === 'middle' ? await expectedAt(page, index) : index;
      const problems = await spyAt(page, where, index, expected);
      const label = `${file} @${width}x${height} ${where}`;
      if (where === 'middle' && expected === 0)
        fail('spy', `${label}: the test never left the first section, so it proves nothing`);
      else if (problems.length) fail('spy', `${label}: ${problems.join('; ')}`);
      else pass('spy', `${label}: section ${expected + 1} of ${count} current, ${expected} passed`);
    }
    // Headings that move without any scrolling: deep dives above the reader
    // open, in a browser that does not hold the view still around them, as
    // Chromium's scroll anchoring would. The spy looks again after the redraw.
    if (width === 1440 && height === 900) {
      // The middle section, or if no deep dive comes before it, the one after
      // the first section that has one.
      const target = await page.evaluate((count) => {
        const sections = [...document.querySelectorAll('.article > section')];
        const first = sections.findIndex((sec) => sec.querySelector('.deep-toggle'));
        const middle = Math.floor(count / 2);
        return first === -1 ? -1 : first < middle ? middle : Math.min(first + 1, count - 2);
      }, count);
      if (target !== -1) await spyAt(page, 'middle', target);
      const moved = await page.evaluate(async () => {
        document.documentElement.style.overflowAnchor = 'none';
        document.body.style.overflowAnchor = 'none';
        const above = [...document.querySelectorAll('.deep-toggle[aria-expanded="false"]')].filter(
          (b) => b.getBoundingClientRect().bottom < 0,
        );
        for (const b of above) b.click();
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        let expected = 0;
        document.querySelectorAll('.article > section > h2').forEach((h, i) => {
          if (h.getBoundingClientRect().top <= innerHeight * 0.3) expected = i;
        });
        const shown = [...document.querySelectorAll('.toc-list > li')].findIndex((li) =>
          li.classList.contains('is-current'),
        );
        return { opened: above.length, expected, shown };
      });
      const label = `${file} @${width}x${height}, ${moved.opened} deep dives opened above the reader`;
      if (target === -1)
        (current.getStore() || results).spy.push(`note ${file}: no deep dives, so nothing moves without scrolling`);
      else if (moved.expected === target)
        fail('spy', `${label}: the reader's section did not change, so this proves nothing`);
      else if (moved.shown !== moved.expected)
        fail('spy', `${label}: section ${moved.shown + 1} shown, section ${moved.expected + 1} under the line`);
      else pass('spy', `${label}: section ${moved.shown + 1} current, as it now is under the line`);
    }
    // Bold is wider, so an item that wrapped differently when current would
    // make the whole list below it jump as the reader scrolls past.
    if (width === 1440 && height === 900) {
      const jumps = await page.evaluate(() =>
        [...document.querySelectorAll('.toc-list > li')].flatMap((li) => {
          const was = li.className;
          const heights = ['is-next', 'is-current', 'is-past'].map((state) => {
            li.className = state;
            return li.getBoundingClientRect().height;
          });
          li.className = was;
          return Math.max(...heights) - Math.min(...heights) > 0.5
            ? [`"${li.textContent.slice(0, 40)}" ${heights.map((h) => h.toFixed(0)).join('/')}px`]
            : [];
        }),
      );
      if (jumps.length) fail('spy', `${file} @${width}: items change height with their state: ${jumps.join('; ')}`);
      else pass('spy', `${file} @${width}: every item the same height whether passed, current or next`);
    }
    // A passed item given keyboard focus takes the focus colours, as every
    // link does. The walk never reaches one, since Tab from the top of the
    // page scrolls it back to the first section.
    if (width === 1440 && height === 900) {
      const f = await page.evaluate(() => {
        const a = document.querySelector('.toc-list > li.is-past a');
        if (!a) return null;
        a.focus({ preventScroll: true });
        const cs = getComputedStyle(a);
        return { visible: a.matches(':focus-visible'), color: cs.color, back: cs.backgroundColor };
      });
      const faint = !f ? null : f.back === 'rgba(0, 0, 0, 0)' ? 'on no background' : faintest([{ ...f, large: false }]);
      if (!f) fail('spy', `${file} @${width}: no passed item at the bottom of the page to give focus to`);
      else if (!f.visible) fail('spy', `${file} @${width}: a passed item given focus does not show it`);
      else if (faint) fail('spy', `${file} @${width}: a passed item with focus is ${faint}`);
      else pass('spy', `${file} @${width}: a passed item with focus at ${contrastOf(f.color, f.back).toFixed(2)}:1`);

      // A page that does not scroll at all, like a board drawn at its full
      // height, stays on the first section with none passed. Two frames let
      // the spy hear the resize and redraw.
      await page.evaluate(() => window.scrollTo(0, 0));
      const tall = await page.evaluate(() => document.documentElement.scrollHeight);
      await page.setViewportSize({ width, height: tall });
      await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
      const still = await page.evaluate(() => {
        const items = [...document.querySelectorAll('.toc-list > li')];
        return {
          scrolls: document.documentElement.scrollHeight > innerHeight,
          current: items.findIndex((li) => li.classList.contains('is-current')),
          past: items.filter((li) => li.classList.contains('is-past')).length,
        };
      });
      const label = `${file} @${width}x${tall}, not scrolling`;
      if (still.scrolls) fail('spy', `${label}: the page still scrolls`);
      else if (still.current !== 0 || still.past)
        fail(
          'spy',
          `${label}: section ${still.current + 1} current and ${still.past} passed, wanted the first and none`,
        );
      else pass('spy', `${label}: the first section current, none passed`);
    }
    await page.close();
  }

  // Targets, headings and the keyboard walk at desktop and phone widths, and
  // the walk again at desktop in each other theme, whose focus colours differ.
  const walks = [[1440, 'paper'], [390, 'paper'], ...THEMES.filter((t) => t !== 'paper').map((t) => [1440, t])];
  for (const [width, theme] of run('keyboard') ? walks : []) {
    const page = await open(file, { width, height: 900 });
    if (theme !== 'paper') await setSetting(page, 'theme', theme);
    await setSetting(page, 'deep', 'open');
    if (theme === 'paper') {
      const small = await targetSizes(page);
      if (small.length) fail('targets', `${file} @${width}: ${small.length} small: ${small.slice(0, 6).join('; ')}`);
      else pass('targets', `${file} @${width}: all targets 44x44 or larger`);
    }
    await page.locator('button[aria-controls="settings-panel"]').click();
    if (theme === 'paper') {
      const h = await headingOutline(page);
      if (h.problems.length) fail('headings', `${file} @${width}: ${h.problems.join('; ')}`);
      else pass('headings', `${file} @${width}: ${h.count} headings, one h1, no skipped levels`);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.mouse.click(5, 5);
    const k = await keyboardWalk(page, quick ? 40 : 120);
    const label = `${file} @${width} ${theme}`;
    if (k.issues.length) fail('keyboard', `${label}: ${k.issues.slice(0, 5).join('; ')}`);
    else pass('keyboard', `${label}: ${k.seen} tab stops, all ringed, none covered, focused text 7:1 or better`);
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
  // A calculator shows what its own rule gives for the values on the page. The
  // expectation is worked out here from those values, never typed, so the
  // check holds whatever stages and days the markdown declares.
  // A hue is a design language, never a meaning: wherever one is drawn, the
  // module it stands for is named in words within the same block, so the
  // mutation that makes every hue alike takes nothing away.
  if (run('hues')) {
    const page = await open(file);
    const named = await page.evaluate(() => {
      const modules = [...document.querySelectorAll('.module')].map((el) => ({
        where: 'a module on the home page',
        hue: getComputedStyle(el).getPropertyValue('--hue').trim(),
        words: el.querySelector('.module-title')?.textContent.trim() || '',
      }));
      const hero = [...document.querySelectorAll('.hero .eyebrow')].map((el) => ({
        where: "a part's band",
        hue: getComputedStyle(el.closest('.hero')).getPropertyValue('--hue').trim(),
        words: el.textContent.trim(),
      }));
      const groups = [...document.querySelectorAll('.parts-group, .footer-group')].map((el) => ({
        where: 'a group of parts',
        hue: getComputedStyle(el).getPropertyValue('--hue').trim(),
        words: el.querySelector('.parts-group-title, .footer-group-title')?.textContent.trim() || '',
      }));
      const pagers = [...document.querySelectorAll('.pager-link')].map((el) => ({
        where: 'a way on',
        hue: getComputedStyle(el).getPropertyValue('--hue').trim(),
        words: el.textContent.trim(),
      }));
      return [...modules, ...hero, ...groups, ...pagers];
    });
    const mute = named.filter((h) => h.hue && !h.words);
    if (!named.length) fail('hues', `${file}: nothing carries a module's hue`);
    else if (mute.length) fail('hues', `${file}: ${mute.length} coloured without words, first ${mute[0].where}`);
    else pass('hues', `${file}: ${named.length} hues drawn, every one beside the words that say the same`);
    await page.close();
  }
  // The decoration, where it is widest and where it is narrowest, and at the
  // text size and line length that bring the words closest to it: the rails
  // only appear on a wide window, and the marks grow with the reader's text,
  // so a collision would show at one of these and not at the others.
  if (run('decor')) {
    for (const [width, big] of [
      [1800, false],
      [1440, true],
      [390, false],
    ]) {
      const page = await open(file, { width });
      if (big) {
        await setSetting(page, 'size', 'largest');
        await setSetting(page, 'spacing', 'widest');
        await setSetting(page, 'measure', 'long');
        await page.locator('button[aria-controls="settings-panel"]').click();
        await mutate(page);
      }
      const seen = await decorClashes(page);
      const where = `${file} @${width}${big ? ', largest and long' : ''}`;
      if (!seen.marks) fail('decor', `${where}: the page draws no decoration`);
      else if (seen.over.length) fail('decor', `${where}: ${seen.over.length} marks over words, first ${seen.over[0]}`);
      else if (seen.loud.length) fail('decor', `${where}: ${seen.loud[0]}`);
      else pass('decor', `${where}: ${seen.marks} marks, clear of all ${seen.words} words`);
      await page.close();
    }
  }
  if (run('calculator')) {
    const page = await open(file);
    if (await page.locator('.calc').count()) {
      const shown = () =>
        page.evaluate(() => ({
          days: [...document.querySelectorAll('.calc-days')].map((e) => Number(e.value)),
          saved: [...document.querySelectorAll('.calc-saved')].map((e) => Number(e.value)),
          after: [...document.querySelectorAll('.calc-after-n')].map((e) => e.textContent.trim()),
          totals: [...document.querySelectorAll('.calc-total strong')].map((e) => e.textContent.trim()),
        }));
      const problems = [];
      const check = async (when, wantSaved) => {
        const s = await shown();
        const d = delivery(s.days.map((days, i) => ({ days, saved: s.saved[i] })));
        const unit = s.totals[0].split(' ').slice(1).join(' ');
        const want = [`${d.before} ${unit}`, `${d.after} ${unit}`];
        if (s.totals[0] !== want[0] || s.totals[1] !== want[1])
          problems.push(`${when}: shows ${s.totals[0]} and ${s.totals[1]}, the rule gives ${want[0]} and ${want[1]}`);
        if (d.faster > 0 && !s.totals[2].includes(`${d.faster}%`))
          problems.push(`${when}: says "${s.totals[2]}", the rule gives ${d.faster}% faster`);
        d.rows.forEach((r, i) => {
          if (s.after[i] !== `${r.after} ${unit}`)
            problems.push(`${when}: stage ${i + 1} shows ${s.after[i]}, not ${r.after} ${unit}`);
        });
        if (wantSaved && !wantSaved(s.saved)) problems.push(`${when}: the savings are ${s.saved.join(', ')}`);
      };
      await check('as it opens', (saved) => saved.every((v) => v === 0));
      const presets = page.locator('.calc-preset:not(.calc-reset)');
      for (let i = 0; i < (await presets.count()); i++) {
        await presets.nth(i).click();
        await check(`after example ${i + 1}`, (saved) => saved.some((v) => v > 0));
      }
      await page.locator('.calc-reset').click();
      await check('after Start again', (saved) => saved.every((v) => v === 0));
      await page.locator('.calc-saved').first().focus();
      await page.keyboard.press('ArrowRight');
      await check('after an arrow key on the first slider', (saved) => saved[0] > 0);
      await page.locator('.calc-days').nth(1).fill('12.5');
      await check('after typing 12.5 days', null);
      if ((await shown()).days[1] !== 12.5) problems.push('a typed day count did not take');
      if (problems.length) fail('calculator', `${file}: ${problems.slice(0, 4).join('; ')}`);
      else
        pass(
          'calculator',
          `${file}: ${await presets.count()} examples, the keyboard, typing and Start again all show what the rule gives`,
        );
    }
    await page.close();
  }
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
      const kind =
        file === 'index.html' ? 'home' : file === DIRECTORY ? 'directory' : MODULE_PAGES.has(file) ? 'module' : 'part';
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
}

// A showcase board is a trimmed page at a fixed size, so axe is all it needs.
// Everything that could change a page's result, other than the page itself.
const sha = (...parts) => parts.reduce((h, p) => h.update(p), crypto.createHash('sha256')).digest('hex');
const SHARED = sha(
  fs.readFileSync(new URL(import.meta.url)),
  fs.readFileSync(new URL('./harness.mjs', import.meta.url)),
  fs.readFileSync(path.join(ROOT, 'src', 'reader.js')),
  fs.readFileSync(path.join(ROOT, 'package-lock.json')),
  fs.readFileSync(path.join(CONTENT_DIR, 'Introduction.md')),
  fs.readdirSync(STATIC_SITE).sort().join('|'),
  JSON.stringify({ quick, only }),
);
const keyOf = (file) => sha(SHARED, fs.readFileSync(path.join(STATIC_SITE, file)));
const KEPT_FILE = path.join(RESULTS, 'audit-kept.json');
const kept = !mutation && fs.existsSync(KEPT_FILE) ? JSON.parse(fs.readFileSync(KEPT_FILE, 'utf8')) : {};

// Every page, several at a time, each into results of its own. A page whose
// key is unchanged since it last passed gives back the lines it wrote then.
const work = (pagesArg || FULL_PAGES).map((file) => ({ file, audit: auditPage }));
let unchanged = 0;
let next = 0;
await Promise.all(
  Array.from({ length: Math.max(1, jobs) }, async () => {
    while (next < work.length) {
      const job = work[next++];
      const key = keyOf(job.file);
      if (!all && !mutation && kept[job.file]?.key === key) {
        job.results = kept[job.file].results;
        unchanged++;
        continue;
      }
      job.results = emptyResults();
      await current.run(job.results, () => job.audit(job.file));
      const passed = !Object.values(job.results).some((lines) => lines.some((l) => l.startsWith('FAIL')));
      if (passed && !mutation) kept[job.file] = { key, results: job.results };
      else delete kept[job.file];
      console.error(`audited ${job.file}`);
    }
  }),
);
// Pages first and boards last, each in its own order, as one run would have
// written them.
for (const job of work) for (const k of KINDS) results[k].push(...job.results[k]);

// Saved settings of every shape load, once, on a part with deep dives, since
// one of the shapes has them open and a part without any would pass whatever
// the page did. Naming a page here would go stale the moment one was renamed,
// so it is found by what it holds.
// The class name alone would match the stylesheet, which every page inlines,
// so this looks for the attribute as the markup writes it.
const STORAGE_PAGE = FULL_PAGES.find(
  (f) => f !== 'index.html' && fs.readFileSync(path.join(STATIC_SITE, f), 'utf8').includes('class="deep-toggle"'),
);
if (run('storage') && !STORAGE_PAGE)
  throw new Error('No part has a deep dive, so the storage check would prove nothing');
for (const shape of run('storage') ? SAVED_SHAPES : []) {
  const page = await openPage(site, STORAGE_PAGE, {
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

await site.close();
const report = Object.entries(results)
  .map(([k, lines]) => `## ${k}\n${lines.join('\n')}`)
  .join('\n\n');
fs.mkdirSync(RESULTS, { recursive: true });
fs.writeFileSync(path.join(RESULTS, 'audit-report.md'), report + '\n');
if (!mutation) fs.writeFileSync(KEPT_FILE, JSON.stringify(kept));
const failures = Object.values(results).reduce((n, lines) => n + lines.filter((l) => l.startsWith('FAIL')).length, 0);
console.log(report);
console.log(`\n${work.length - unchanged} audited, ${unchanged} unchanged since they last passed`);
console.log(`${failures ? failures + ' FAILURE(S)' : 'ALL CHECKS PASS'}`);
process.exit(failures ? 1 : 0);
