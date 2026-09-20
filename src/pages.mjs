// Assembles whole pages: the home page from the course introduction, and a
// page for each part, each with the shared stylesheet and the values its
// markup starts at. The build fills the holes and writes the file.

import { renderInline, plainText, esc, smartPlain } from './inline.mjs';
import { renderBlocks, sectionHeading } from './render.mjs';
import { header, toc, crumbs, pager, footer } from './chrome.mjs';
import { stylesheet, FONT_LINK } from './styles.mjs';
import { startingVals } from './logic.mjs';
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

function partHero(part) {
  const meta = part;
  const title = part.subtitle
    ? `${esc(part.title)}<span class="sr-only">: </span><span class="title-sub">${esc(part.subtitle)}</span>`
    : esc(part.title);
  return `<div class="hero" style="--hue: var(--hue-${part.hue})">${crumbs(part)}<p class="eyebrow label">${esc(part.module)} · Part ${part.n} of ${part.of}</p><h1 class="title">${title}</h1><ul class="hero-meta label" role="list"><li>${ICONS.clock}<span>About ${esc(
    minutes(meta.time),
  )}</span></li><li>${ICONS.calendar}<span>Written ${longDate(part.date)}${part.author ? ` by ${esc(part.author)}` : ''}</span></li></ul><div class="outcome"><p class="outcome-label label">${ICONS.outcome}<span>After this part you can</span></p><p class="outcome-text">${esc(
    smartPlain(meta.outcome),
  )}.</p></div></div>`;
}

function partArticle(part, parts) {
  return part.sections
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
// parts is the whole course's list; a reference table's bare part numbers mean
// this part's own module.
export function partMain(part, parts) {
  const own = parts.filter((p) => p.module === part.module);
  const number = String(part.n).padStart(2, '0');
  return `<main id="main" tabindex="-1"><div class="shell layout grid-12"><div class="hero-num" aria-hidden="true">${number}</div>${partHero(part)}${toc(part.sections, part)}<div class="article">${partArticle(part, own)}${pager(part, parts)}</div></div></main>`;
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

// Counts and reading times are worked out from the introduction's tables, so
// they stay true as parts are written. Numbers up to twenty are spelt out.
const WORDS = [
  'no',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
  'thirteen',
  'fourteen',
  'fifteen',
  'sixteen',
  'seventeen',
  'eighteen',
  'nineteen',
  'twenty',
];
const word = (n) => WORDS[n] ?? String(n);
const capital = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const plural = (n, noun) => `${word(n)} ${noun}${n === 1 ? '' : 's'}`;

// The reading time of some parts, to the nearest half hour: "four hours".
function hoursOf(parts) {
  const total = parts.reduce((sum, p) => {
    const m = /^(\d+) min$/.exec(p.time);
    if (!m) throw new Error(`A reading time should read "<number> min", not "${p.time}"`);
    return sum + Number(m[1]);
  }, 0);
  const halves = Math.round(total / 30);
  // Under an hour is said in minutes, since 45 minutes rounded to the half
  // hour reads as an hour, which it is not.
  if (total < 60) return `${total} minutes`;
  const whole = Math.floor(halves / 2);
  return `${word(whole)}${halves % 2 ? ' and a half' : ''} hour${whole === 1 && !(halves % 2) ? '' : 's'}`;
}

function moduleMeta(m) {
  const written = m.parts.filter((p) => p.written);
  const coming = m.parts.length - written.length;
  if (!written.length) return `${capital(plural(coming, 'part'))}, all still to come`;
  return `${m.optional ? 'Optional · ' : ''}${capital(plural(written.length, 'part'))}${coming ? `, ${word(coming)} more to come` : ''} · about ${hoursOf(written)}`;
}

// The course's size, for the hero. It says how many of the modules a reader
// may skip, because the introduction counts only the modules it expects to be
// read and puts the optional ones before them, and a bare total would
// contradict the sentence a few lines below it.
function courseCount(modules) {
  const all = modules.flatMap((m) => m.parts);
  const written = all.filter((p) => p.written).length;
  const coming = all.length - written;
  const optional = modules.filter((m) => m.optional).length;
  return `${capital(plural(modules.length, 'module'))}${optional ? `, ${word(optional)} optional` : ''}, ${plural(written, 'part')}${coming ? `, ${word(coming)} more to come` : ''}`;
}

// The home page on the twelve-column grid: every section is a grid-12, and
// every set of blocks (a module's parts, the four ideas, the legend, the routes)
// is a grid-12 of its own whose rows size to the tallest block.
function homeMain(intro, parts) {
  const S = intro.sections;
  const purpose = S['What this course is for'].blocks.filter((b) => b.type === 'paragraph');
  const lede = renderInline(purpose[0].tokens);
  const purposeRest = purpose
    .slice(1)
    .map((p) => `<p>${renderInline(p.tokens)}</p>`)
    .join('');

  // A card for each part, three to a row, a grid for each module. A part still
  // to come has a card too, so a reader sees what the module will hold, but it
  // links nowhere and says "Coming" where the others give a reading time.
  const card = (p) => {
    const num = `<span class="part-num" aria-hidden="true">${String(p.n).padStart(2, '0')}</span>`;
    const outcome = `<p class="part-outcome"><span class="sr-only">After it you can: </span>${esc(smartPlain(p.outcome))}</p>`;
    if (!p.written)
      return `<li class="part-card is-coming">${num}<h4 class="part-title"><span class="sr-only">Part ${p.n}: </span>${esc(p.shortTitle)}</h4>${outcome}<p class="part-time label">Coming</p></li>`;
    return `<li class="part-card">${num}<h4 class="part-title"><a href="page:${p.out}"><span class="sr-only">Part ${p.n}: </span>${esc(
      p.shortTitle,
    )}</a></h4>${outcome}<p class="part-time label">${ICONS.clock}<span>${esc(minutes(p.time))}</span></p></li>`;
  };
  const moduleBlock = (m) =>
    `<div class="module" id="module-${m.slug}" style="--hue: var(--hue-${m.hue})"><h3 class="module-title">${esc(m.name)}</h3><p class="module-meta label">${esc(moduleMeta(m))}</p><div class="module-notes">${paragraphs(
      m.notes,
    )}</div><ol class="part-cards grid-12" role="list">${m.parts.map(card).join('')}</ol></div>`;
  const written = parts.filter((p) => p.written);
  // The course starts at its first part that is not in an optional module. A
  // module a reader may skip gets a quieter way in of its own beside it.
  const skippable = new Set(intro.modules.filter((m) => m.optional).map((m) => m.name));
  const first = written.find((p) => !skippable.has(p.module)) || written[0];
  const primer = written.find((p) => skippable.has(p.module));
  const primerLink = primer
    ? `<a class="btn-quiet" href="page:${primer.out}">New to AI? Start with ${esc(primer.module)}</a>`
    : '';

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
  )}</h1><div class="hero-rule"></div><p class="home-lede">${lede}</p><div class="hero-side"><ul class="home-meta label" role="list"><li>${ICONS.book}<span>${esc(courseCount(intro.modules))}</span></li><li>${ICONS.clock}<span>About ${esc(hoursOf(written))} of reading</span></li><li>${ICONS.calendar}<span>Written in September 2026${intro.author ? ` by ${esc(intro.author)}` : ''}</span></li></ul><div class="cta-row"><a class="btn-primary" href="page:${first.out}"><span>Start with Part ${first.n}: ${esc(
    first.shortTitle,
  )}</span>${ICONS.arrowRight}</a>${primerLink}<a class="btn-quiet" href="#suggested-routes">Choose a reading route</a></div></div></div>
<section class="home-section"><div class="shell grid-12 split"><h2 class="home-h2" id="what-this-course-is-for">What this course is for</h2><div class="split-body">${purposeRest}</div></div></section>
<section class="home-section"><div class="shell grid-12"><h2 class="home-h2" id="the-modules">The modules</h2><div class="section-intro">${paragraphs(
    intro.lead,
  )}</div>${intro.modules.map(moduleBlock).join('')}</div></section>
<section class="home-section"><div class="shell grid-12"><h2 class="home-h2" id="four-ideas">Four ideas that run through everything</h2><ol class="ideas grid-12" role="list">${ideas}</ol></div></section>
<section class="home-section"><div class="shell grid-12"><h2 class="home-h2" id="how-each-part-is-laid-out">How each part is laid out</h2><ul class="legend grid-12" role="list">${legend}</ul><div class="section-outro">${paragraphs(
    layoutBlocks,
  )}</div></div></section>
<section class="home-section"><div class="shell grid-12"><h2 class="home-h2" id="suggested-routes">Suggested routes</h2><div class="section-intro">${paragraphs(
    S['Suggested routes'].blocks,
  )}</div><ul class="routes grid-12" role="list">${routes}</ul></div></section>
<section class="home-section"><div class="shell grid-12 split"><h2 class="home-h2" id="a-note-on-currency">A note on currency</h2><div class="split-body currency">${paragraphs(
    S['A note on currency'].blocks,
  )}</div></div></section></main>`;
}

// ----------------------------------------------------------------- the page

// A page, in the pieces the build assembles: its title, what belongs in the
// head, the markup with its holes still in it, and the values to fill them
// with. The build fills the holes and rewrites the links, because only it
// knows where a page is served from.
function pageFile({ title, body, page }) {
  const rootClass =
    'reader theme-{{s.theme}} size-{{s.size}} spacing-{{s.spacing}} measure-{{s.measure}} font-{{s.font}}';
  return {
    title: esc(title),
    helmet: `<link rel="stylesheet" href="${FONT_LINK}">\n<style>${stylesheet()}</style>`,
    body: `<div class="${rootClass}"><div class="page">${body}</div></div>`,
    vals: startingVals(page),
    calculator: page.calculator || null,
  };
}

export function homeFile(intro, parts, page) {
  const course = intro.courseTitle;
  const body = `${header(intro.modules, null, course)}${homeMain(intro, parts)}${footer(intro.modules, currencyNote(intro), course)}`;
  return pageFile({
    title: `${course}: ${intro.pageTitle.toLowerCase().replace(/^c/, 'C')}`,
    body,
    page: { ...page, deepKeys: [] },
  });
}

export function partFile(part, parts, intro, page) {
  const course = intro.courseTitle;
  // The header marks the current part by identity, so it needs the
  // introduction's own record of this part, not the parsed page.
  const current = parts.find((p) => p.out === part.out);
  const body = `${header(intro.modules, current, course)}${partMain(part, parts)}${footer(intro.modules, currencyNote(intro), course)}`;
  const deepKeys = [];
  for (const s of part.sections) for (const b of s.blocks) if (b.type === 'deep') deepKeys.push(b.key);
  const spyIds = part.sections.map((s) => s.id);
  return pageFile({
    title: `${part.module}, part ${part.n}: ${part.shortTitle} · ${course}`,
    body,
    page: { ...page, deepKeys, spyIds, calculator: part.calculator || null },
  });
}
