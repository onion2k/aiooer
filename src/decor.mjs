// The page's decoration: the technical marks that sit in the margins, in the
// strip above the footer and beside a part's number. They are drawn in the
// manner of The Designers Republic's Wipeout work — registration rings, tick
// rails, stepped bars, hazard chevrons and small machine codes — which is the
// same family as the rest of the site's look: squares, rules and a grid.
//
// Two rules hold everything here, and the audit's decor check holds them:
//
// A mark never sits behind text. Not for taste: text whose background cannot
// be resolved is text the accessibility audit has to report as needing review,
// and the site promises none of that. So the decoration lives in the shell's
// outer margins and in strips of its own, and the check measures every mark
// against every word on the page.
//
// A mark never says anything. The codes are lettering, not information: they
// are the same on every page, they are drawn inside an aria-hidden figure so
// nothing reads them out, and the guide reads exactly the same with the
// decoration turned off, which is what the high contrast theme does. This is
// why they are drawn as SVG lettering rather than set as text: a paragraph on
// the page is prose a reader is owed, and these are not that.

// Nothing the decoration draws may set words as text. The codes are drawn
// inside a picture, where they are lettering and nothing more; a word set as
// text on the page is prose a reader is owed, and the decoration owes a reader
// nothing. Every mark leaves through here, so a stray word stops the build
// rather than turning up in a screen reader or in a search result.
function noWords(html) {
  const left = html
    .replace(/<text\b[^>]*>[\s\S]*?<\/text>/g, '')
    .replace(/<[^>]+>/g, '')
    .trim();
  if (left) throw new Error(`The decoration sets words as text: "${left.slice(0, 60)}"`);
  return html;
}

// Every mark is built from these, so a change to the weight of the line or the
// look of a ring happens once. The numbers are SVG user units, which the
// stylesheet scales in em, so the decoration grows with the reader's text.
const LINE = 'fill="none" stroke="currentColor"';

// A registration ring: two circles, a cross that stops short of the middle,
// and four ticks on the diagonals. The mark the whole family is built around.
function ring() {
  return `<svg class="decor-mark decor-ring" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
<circle cx="32" cy="32" r="29" ${LINE} stroke-width="2"></circle>
<circle cx="32" cy="32" r="17" ${LINE} stroke-width="1"></circle>
<circle cx="32" cy="32" r="4" fill="currentColor"></circle>
<path d="M32 0V14M32 50V64M0 32H14M50 32H64" ${LINE} stroke-width="2"></path>
<path d="M11 11L18 18M53 11L46 18M11 53L18 46M53 53L46 46" ${LINE} stroke-width="1"></path>
</svg>`;
}

// A run of bars of set widths, read left to right as a machine would: the
// pattern is fixed, so it is a texture and never a reading of anything. The
// rails want the same run turned on its end, which is a drawing of its own
// rather than a rotation, so that nothing has to be rotated in the page.
const BARS = [0, 5, 9, 16, 19, 27, 33, 36, 44, 51, 55, 62, 70, 73, 81, 88];
const BAR_WIDTHS = [3, 2, 5, 1, 6, 4, 1, 5, 4, 2, 5, 6, 1, 5, 4, 8];
function bars(vertical = false) {
  // One path rather than sixteen rectangles: the same drawing, a quarter of
  // the bytes, and every page carries three or four of these.
  const d = BARS.map((at, i) =>
    vertical ? `M0 ${at}h24v${BAR_WIDTHS[i]}H0z` : `M${at} 0h${BAR_WIDTHS[i]}v24h-${BAR_WIDTHS[i]}z`,
  ).join('');
  const box = vertical ? '0 0 24 96' : '0 0 96 24';
  const cls = vertical ? 'decor-bars is-vertical' : 'decor-bars';
  return `<svg class="decor-mark ${cls}" viewBox="${box}" aria-hidden="true" focusable="false"><path d="${d}" fill="currentColor"></path></svg>`;
}

// Hazard chevrons, pointing the way the reader is going.
function chevrons() {
  return `<svg class="decor-mark decor-chevrons" viewBox="0 0 72 24" aria-hidden="true" focusable="false">
<path d="M2 2L14 12L2 22M26 2L38 12L26 22M50 2L62 12L50 22" ${LINE} stroke-width="3"></path>
</svg>`;
}

// A stepped bar, the shape a Wipeout livery uses to turn a corner.
function steps() {
  return `<svg class="decor-mark decor-steps" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
<path d="M0 44H12V32H24V20H36V8H48" ${LINE} stroke-width="4"></path>
<rect x="0" y="0" width="8" height="8" fill="currentColor"></rect>
<rect x="12" y="0" width="4" height="8" fill="currentColor"></rect>
</svg>`;
}

// A field of dots on the grid: the quietest mark, for filling a length.
function dots() {
  // Square dots, on the grid, as one path: the site has no round corners
  // anywhere else either.
  const d = [];
  for (let y = 3; y < 24; y += 8) for (let x = 3; x < 96; x += 8) d.push(`M${x} ${y}h3v3h-3z`);
  return `<svg class="decor-mark decor-dots" viewBox="0 0 96 24" aria-hidden="true" focusable="false"><path d="${d.join(
    '',
  )}" fill="currentColor"></path></svg>`;
}

// A machine code. The same few strings appear on every page: they are the
// grid and the standard the site is built to, drawn rather than written. The
// face is the site's own mono, set by the stylesheet, so a code is of a piece
// with the labels even though nothing reads it.
function code(text) {
  const width = Math.max(24, text.length * 9);
  return `<svg class="decor-mark decor-code" viewBox="0 0 ${width} 16" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid meet"><text x="0" y="12" fill="currentColor" font-size="12" letter-spacing="1">${text}</text></svg>`;
}

// The hairline that fills whatever length is left, with ticks along it. It is
// a gradient rather than a drawing, so it stretches without distorting a
// circle or a chevron.
function ticks(cls) {
  return `<span class="decor-ticks ${cls}"></span>`;
}

// The rails: a column of marks in each of the shell's outer margins, shown
// only where the page is wide enough that they clear the text. They are
// different from each other on purpose, as the two margins of a technical
// drawing would be. Neither carries a code: a rail is a hand's width across,
// and lettering that narrow would have to be turned on its side, which is a
// trick the page can do without.
export function decorRails() {
  return noWords(
    `<div class="decor decor-rail is-left" aria-hidden="true">${ring()}${ticks('is-vertical')}${bars(
      true,
    )}${ticks('is-vertical')}${steps()}</div><div class="decor decor-rail is-right" aria-hidden="true">${bars(
      true,
    )}${ticks('is-vertical')}${ring()}${ticks('is-vertical')}${bars(true)}</div>`,
  );
}

// The strip: a band of marks across the page, in a row of its own so that
// nothing is beside it and nothing is behind it.
export function decorStrip(variant = '') {
  const cls = variant ? ` decor-strip-${variant}` : '';
  return noWords(
    `<div class="decor decor-strip${cls}" aria-hidden="true">${ring()}${bars()}${ticks(
      'is-flex',
    )}${dots()}${chevrons()}${code('12 COL')}</div>`,
  );
}

// The tag: a small cluster pinned to the top right of a hero, on the line the
// breadcrumbs or the kicker leave empty. It is what fills the corner of the
// page that a big title always leaves bare.
export function decorTag() {
  return noWords(`<span class="decor decor-tag" aria-hidden="true">${code('AAA 2.2')}${bars()}${ring()}</span>`);
}

// The reticle: the mark that registers a part's number, under it in the three
// columns the number has to itself. It is the one mark that belongs to a page
// rather than to the site.
export function decorReticle() {
  return noWords(
    `<div class="decor decor-reticle" aria-hidden="true">${ticks(
      'is-wide',
    )}${ring()}<span class="decor-row">${chevrons()}${code('REF 01')}</span></div>`,
  );
}
