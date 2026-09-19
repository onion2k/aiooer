// Assembles whole pages: the home page from the course introduction, and a
// page for each part, each wrapped as a Design Component file with the shared
// stylesheet and logic. The showcase boards are the same pages started in a
// different state, so they cannot drift from the real ones.

import { renderInline, plainText, esc, smartPlain } from './inline.mjs';
import { renderBlocks, sectionHeading } from './render.mjs';
import { header, toc, crumbs, pager, footer } from './chrome.mjs';
import { stylesheet, FONT_LINK } from './styles.mjs';
import { logicScript, dataProps } from './logic.mjs';
import { ICONS } from './icons.mjs';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function longDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

function minutes(time) {
  return time.replace(/\bmin\b/, 'minutes');
}

function sentences(text) {
  return text.match(/[^.]+\.(\s|$)/g).map((s) => s.trim());
}

export function currencyNote(intro) {
  const text = intro.sections['A note on currency'].blocks.find((b) => b.type === 'paragraph').text;
  const all = sentences(text);
  const keep = all.filter((s) => /^The course was written/.test(s) || /^All prices are illustrative/.test(s));
  if (keep.length !== 2) throw new Error('The currency note has changed; update the footer sentences');
  return esc(keep.join(' '));
}

// ---------------------------------------------------------------- part pages

function partHero(part, meta) {
  const title = part.subtitle
    ? `${esc(part.title)}<span class="sr-only">: </span><span class="title-sub">${esc(part.subtitle)}</span>`
    : esc(part.title);
  return `<div class="hero">${crumbs(part.n, meta.shortTitle)}<p class="eyebrow label">Part ${part.n} of 6</p><h1 class="title">${title}</h1><ul class="hero-meta label" role="list"><li>${ICONS.clock}<span>About ${esc(
    minutes(meta.time),
  )}</span></li><li>${ICONS.calendar}<span>Written ${longDate(part.date)}</span></li></ul><div class="outcome"><p class="outcome-label label">${ICONS.outcome}<span>After this part you can</span></p><p class="outcome-text">${esc(
    smartPlain(meta.outcome),
  )}.</p></div></div>`;
}

function partArticle(part, parts, maxSections) {
  const sections = maxSections ? part.sections.slice(0, maxSections) : part.sections;
  return sections
    .map(
      (s) =>
        `<section class="sec sec-${s.kind}">${sectionHeading(s)}${renderBlocks(s.blocks, {
          parts,
          sectionKind: s.kind,
          headingId: s.id,
        })}</section>`,
    )
    .join('');
}

// The part's number, set huge in the three left columns above the contents.
// It repeats "Part 3 of 6" for the eye only, so it is hidden from screen readers.
export function partMain(part, parts, opts = {}) {
  const meta = parts.find((p) => p.n === part.n);
  const number = String(part.n).padStart(2, '0');
  return `<main id="main" tabindex="-1"><div class="shell layout grid-12"><div class="hero-num" aria-hidden="true">${number}</div>${partHero(
    part,
    meta,
  )}${toc(part.sections)}<div class="article">${partArticle(part, parts, opts.maxSections)}${
    opts.maxSections ? '' : pager(part.n, parts)
  }</div></div></main>`;
}

// ------------------------------------------------------------------ home page

const SPECIMENS = {
  'In plain terms': `<span class="specimen label is-plain" aria-hidden="true"><span class="spec-row">${ICONS.plain}<span>In plain terms</span></span></span>`,
  'Main text': `<span class="specimen is-text" aria-hidden="true">Aa</span>`,
  'Deep dive (optional)': `<span class="specimen label is-deep" aria-hidden="true"><span class="spec-row">${ICONS.deep}<span>Deep dive</span></span></span>`,
  'Say it two ways': `<span class="specimen label" aria-hidden="true"><span class="spec-row">${ICONS.twoWays}<span>Two ways</span></span></span>`,
  'Misconceptions to correct': `<span class="specimen label" aria-hidden="true"><span class="spec-row spec-true">${ICONS.isTrue}<span>True</span></span><span class="spec-row spec-false">${ICONS.misleading}<span>Misleading</span></span><span class="spec-row spec-say">${ICONS.say}<span>What to say</span></span></span>`,
  Glossary: `<span class="specimen label" aria-hidden="true"><span class="spec-row">${ICONS.glossary}<span>Glossary</span></span></span>`,
  Sources: `<span class="specimen label" aria-hidden="true"><span class="spec-row">${ICONS.source}<span>Sources</span></span></span>`,
};

function listItemTokens(item) {
  const t = item.tokens[0];
  return t.tokens || [{ type: 'text', text: t.text }];
}

const paragraphs = (blocks) =>
  blocks
    .filter((b) => b.type === 'paragraph')
    .map((p) => `<p>${renderInline(p.tokens)}</p>`)
    .join('');

// The home page on the twelve-column grid: every section is a grid-12, and
// every set of blocks (the six parts, the four ideas, the legend, the routes)
// is a grid-12 of its own whose rows size to the tallest block.
function homeMain(intro, parts) {
  const S = intro.sections;
  const purpose = S['What this course is for'].blocks.filter((b) => b.type === 'paragraph');
  const lede = renderInline(purpose[0].tokens);
  const purposeRest = purpose
    .slice(1)
    .map((p) => `<p>${renderInline(p.tokens)}</p>`)
    .join('');

  // One list of all six, three to a row: parts 1 to 3 (how the technology
  // works) above parts 4 to 6 (how to use it), as the introduction says.
  const card = (p) =>
    `<li class="part-card"><span class="part-num" aria-hidden="true">${String(p.n).padStart(2, '0')}</span><h3 class="part-title"><a href="Part${p.n}.dc.html"><span class="sr-only">Part ${p.n}: </span>${esc(
      p.shortTitle,
    )}</a></h3><p class="part-outcome"><span class="sr-only">After it you can: </span>${esc(smartPlain(p.outcome))}</p><p class="part-time label">${ICONS.clock}<span>${esc(minutes(p.time))}</span></p></li>`;

  const layoutBlocks = S['How each part is laid out'].blocks;
  const legendList = layoutBlocks.find((b) => b.type === 'list');
  const legend = legendList.items
    .map((item) => {
      const toks = listItemTokens(item);
      const label = plainText(toks[0].tokens);
      const specimen = SPECIMENS[label];
      if (!specimen) throw new Error('No specimen for ' + label);
      return `<li>${specimen}<p>${renderInline(toks)}</p></li>`;
    })
    .join('');

  const routesTable = S['Suggested routes'].blocks.find((b) => b.type === 'table');
  const routes = routesTable.rows
    .map(
      (r) =>
        `<li class="route"><h3 class="route-reader">${renderInline(r[0].tokens)}</h3><p>${renderInline(r[1].tokens)}</p></li>`,
    )
    .join('');

  const ideasList = S['Four ideas that run through everything'].blocks.find((b) => b.type === 'list');
  const ideas = ideasList.items
    .map((item, i) => {
      const toks = listItemTokens(item);
      const [lead, ...rest] = toks;
      return `<li class="idea"><span class="idea-num" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><p><strong class="idea-lead">${renderInline(lead.tokens)}</strong>${renderInline(rest)}</p></li>`;
    })
    .join('');

  const kicker = intro.pageTitle.charAt(0) + intro.pageTitle.slice(1).toLowerCase();
  return `<main id="main" tabindex="-1"><div class="shell home-hero grid-12"><p class="home-kicker label">${esc(kicker)}</p><h1 class="home-title">${esc(
    intro.courseTitle,
  )}</h1><div class="hero-rule"></div><p class="home-lede">${lede}</p><div class="hero-side"><ul class="home-meta label" role="list"><li>${ICONS.book}<span>Six parts</span></li><li>${ICONS.clock}<span>About four hours of reading</span></li><li>${ICONS.calendar}<span>Written in September 2026</span></li></ul><div class="cta-row"><a class="btn-primary" href="Part1.dc.html"><span>Start with Part 1: ${esc(
    parts[0].shortTitle,
  )}</span>${ICONS.arrowRight}</a><a class="btn-quiet" href="#suggested-routes">Choose a reading route</a></div></div></div>
<section class="home-section"><div class="shell grid-12 split"><h2 class="home-h2" id="what-this-course-is-for">What this course is for</h2><div class="split-body">${purposeRest}</div></div></section>
<section class="home-section"><div class="shell grid-12"><h2 class="home-h2" id="the-six-parts">The six parts</h2><div class="section-intro">${paragraphs(
    S['The six parts'].blocks,
  )}</div><ol class="part-cards grid-12" role="list">${parts.map(card).join('')}</ol></div></section>
<section class="home-section"><div class="shell grid-12"><h2 class="home-h2" id="four-ideas">Four ideas that run through everything</h2><ol class="ideas grid-12" role="list">${ideas}</ol></div></section>
<section class="home-section"><div class="shell grid-12"><h2 class="home-h2" id="how-each-part-is-laid-out">How each part is laid out</h2><ul class="legend grid-12" role="list">${legend}</ul><div class="section-outro">${paragraphs(
    layoutBlocks,
  )}</div></div></section>
<section class="home-section"><div class="shell grid-12"><h2 class="home-h2" id="suggested-routes">Suggested routes</h2><ul class="routes grid-12" role="list">${routes}</ul></div></section>
<section class="home-section"><div class="shell grid-12 split"><h2 class="home-h2" id="a-note-on-currency">A note on currency</h2><div class="split-body currency">${paragraphs(
    S['A note on currency'].blocks,
  )}</div></div></section></main>`;
}

// ------------------------------------------------------------- the dc wrapper

function dcFile({ title, body, page }) {
  const rootClass =
    'reader theme-{{s.theme}} size-{{s.size}} spacing-{{s.spacing}} measure-{{s.measure}} font-{{s.font}}';
  const inner = `<div class="${rootClass}"><div class="page">${body}</div></div>`;
  const root = page.fixed
    ? `<div style="width: ${page.w}px; height: ${page.h}px; overflow: hidden;">${inner}</div>`
    : inner;
  return `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<link rel="stylesheet" href="${FONT_LINK}">
<style>${stylesheet()}</style>
</helmet>
${root}
</x-dc>
<script type="text/x-dc" data-dc-script data-props='${dataProps(page)}'>${logicScript(page)}</script>
</body>
</html>
`;
}

export function homeFile(intro, parts, page) {
  const course = intro.courseTitle;
  const body = `${header(parts, 0, course)}${homeMain(intro, parts)}${footer(parts, currencyNote(intro), course)}`;
  return dcFile({
    title: `${course}: ${intro.pageTitle.toLowerCase().replace(/^c/, 'C')}`,
    body,
    page: { ...page, deepKeys: [] },
  });
}

export function partFile(part, parts, intro, page) {
  const meta = parts.find((p) => p.n === part.n);
  const course = intro.courseTitle;
  const body = `${header(parts, part.n, course)}${partMain(part, parts, page)}${page.maxSections ? '' : footer(parts, currencyNote(intro), course)}`;
  const deepKeys = [];
  const sections = page.maxSections ? part.sections.slice(0, page.maxSections) : part.sections;
  for (const s of sections) for (const b of s.blocks) if (b.type === 'deep') deepKeys.push(b.key);
  // The contents list every section, even on a board trimmed to a few, so
  // the spy follows the same list in the same order.
  const spyIds = part.sections.map((s) => s.id);
  return dcFile({
    title: `Part ${part.n}: ${meta.shortTitle} · ${course}`,
    body,
    page: { ...page, deepKeys, spyIds },
  });
}
