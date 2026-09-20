// The site's stylesheet: Brutalist graphic design on a twelve-column grid.
// Every size is in em, so the text size setting and the reader's own browser
// settings scale the whole page, and every layout switch is a container query
// in em, so the grid steps from twelve columns to six and then one as the text
// grows as well as when the window shrinks. Colours come only from tokens.mjs.
//
// The grid: a container with the grid-12 class lays its children out on
// twelve columns. Each child says where it sits with --start and --span, and
// on a narrower page with --start-md and --span-md out of six; on a phone
// every child takes the full width. Every grid of blocks sizes its rows to
// the tallest block, so the blocks in it are always the same height.

import { THEMES, THEME_ORDER, HUE_COUNT } from './tokens.mjs';

export const FONT_LINK =
  'https://fonts.googleapis.com/css2?family=Archivo:wght@700;800;900&family=Atkinson+Hyperlegible+Mono:wght@400;700&family=Atkinson+Hyperlegible+Next:ital,wght@0,400;0,700;0,800;1,400&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;1,6..72,400&display=swap';

const VAR_NAMES = {
  bg: '--bg',
  sunk: '--sunk',
  surface: '--surface',
  ink: '--ink',
  ink2: '--ink-2',
  past: '--past',
  rule: '--rule',
  edge: '--edge',
  link: '--link',
  visited: '--visited',
  hover: '--hover',
  onAccent: '--on-accent',
  focus: '--focus',
  focusBg: '--focus-bg',
  focusInk: '--focus-ink',
  plainBg: '--plain-bg',
  plainEdge: '--plain-edge',
  plainInk: '--plain-ink',
  plainLink: '--plain-link',
  plainFocus: '--plain-focus',
  deepBg: '--deep-bg',
  deepEdge: '--deep-edge',
  deepLabel: '--deep-label',
  trueInk: '--true-ink',
  falseInk: '--false-ink',
  sayInk: '--say-ink',
  codeBg: '--code-bg',
  codeInk: '--code-ink',
  codeNote: '--code-note',
  footerBg: '--footer-bg',
  footerInk: '--footer-ink',
  footerLink: '--footer-link',
  select: '--select',
  selectInk: '--select-ink',
  mark: '--mark',
};

function themeBlocks() {
  return THEME_ORDER.map((name) => {
    const t = THEMES[name];
    const vars = Object.entries(VAR_NAMES)
      .map(([k, v]) => `${v}:${t[k]}`)
      .join(';');
    // High contrast sets every hue to its ink, so it stays black, white, cyan
    // and yellow, and the module is named in words wherever a hue would be.
    const hues = Array.from({ length: HUE_COUNT }, (_, i) => `--hue-${i + 1}:${t[`hue${i + 1}`]}`).join(';');
    return `.theme-${name}{${vars};${hues};color-scheme:${name === 'dark' || name === 'contrast' ? 'dark' : 'light'}}`;
  }).join('\n');
}

function swatches() {
  // High contrast shows its yellow, or it would look just like dark.
  return THEME_ORDER.map((name) => {
    const t = THEMES[name];
    return `.swatch-${name}{background:${t.bg};color:${name === 'contrast' ? t.link : t.ink}}`;
  }).join('\n');
}

export function stylesheet() {
  return `
body{margin:0}
${themeBlocks()}
${swatches()}
.reader{
  --base:1.25rem;--scale:1;--face-scale:1;--lh:1.6;--para:1.2em;
  --measure-em:39em;--measure-face:1;--measure:calc(var(--measure-em) * var(--measure-face));--wide:max(46em, var(--measure) + 2.8em);
  --gutter:1.2em;--margin:2.4em;--r:2px;--bw:2px;--bw-heavy:4px;
  --font-body:'Atkinson Hyperlegible Next','Atkinson Hyperlegible',system-ui,-apple-system,'Segoe UI',sans-serif;
  --font-display:'Archivo','Helvetica Neue',Arial,sans-serif;
  --font-mono:'Atkinson Hyperlegible Mono',ui-monospace,'SF Mono',Menlo,Consolas,monospace;
  box-sizing:border-box;min-height:100vh;
  font-family:var(--font-body);font-size:calc(var(--base) * var(--scale) * var(--face-scale));line-height:var(--lh);
  color:var(--ink);background:var(--bg);
  font-kerning:normal;text-rendering:optimizeLegibility;-webkit-text-size-adjust:100%;
  overflow-wrap:break-word;
}
.reader *,.reader *::before,.reader *::after{box-sizing:border-box}
@media (max-width:40em){.reader{--base:1.125rem}}
.size-large{--scale:1.15}.size-larger{--scale:1.3}.size-largest{--scale:1.5}
.spacing-wide{--lh:1.8}.spacing-widest{--lh:2}
/* Short keeps every line under 80 characters, and offering it is how the
   site meets 1.4.8; Standard is half as wide again and Long twice as wide,
   for readers who want more on a line. Tables and figures widen with Long,
   so they never sit narrower than the text around them. The serif face
   fits about a tenth more characters into the same width, so it gets less. */
.measure-short{--measure-em:26em}.measure-long{--measure-em:52em}
.font-serif{--font-body:'Newsreader','Iowan Old Style','Palatino Linotype',Georgia,serif;--face-scale:1.08;--measure-face:0.9}
.reader ::selection{background:var(--select);color:var(--select-ink)}

/* The page and its grid */
.page{container:page / inline-size}
.shell{width:100%;max-width:80em;margin-inline:auto;padding-inline:var(--margin)}
.grid-12{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));column-gap:var(--gutter)}
.grid-12 > *{grid-column:var(--start,auto) / span var(--span,12);min-width:0}
@container page (width < 62em){
  .grid-12{grid-template-columns:repeat(6,minmax(0,1fr))}
  .grid-12 > *{grid-column:var(--start-md,auto) / span var(--span-md,6)}
}
@container page (width < 40em){
  .grid-12{grid-template-columns:minmax(0,1fr)}
  .grid-12 > *{grid-column:1 / -1}
}
@container page (width < 48em){.reader{--margin:1em}}

.sr-only{position:absolute!important;width:1px!important;height:1px!important;margin:-1px!important;padding:0!important;overflow:hidden!important;clip:rect(0 0 0 0)!important;clip-path:inset(50%)!important;white-space:nowrap!important;border:0!important}
.icon{width:1.2em;height:1.2em;flex:none;vertical-align:-0.22em}
.label{font-family:var(--font-mono);font-size:0.8em;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;line-height:1.35}

/* Links: underlined wherever they sit, so colour is never the only sign of
   a link (1.4.1). In running text a link fills with blue on hover. */
.reader a{color:var(--link);text-decoration-line:underline;text-decoration-thickness:0.09em;text-underline-offset:0.18em}
.reader a:hover{color:var(--hover);text-decoration-thickness:0.16em}
.article a:visited{color:var(--visited)}
.article :is(p,li,dd,td) a:not(.pager-link):hover,.home-section :is(p,li) a:hover{background:var(--link);color:var(--on-accent);text-decoration-color:var(--on-accent)}
.reader a.ext .icon{width:0.85em;height:0.85em;margin-left:0.15em;vertical-align:-0.05em}

/* Focus: a 3px ring clear of the element, at 3:1 or more against every
   surface (2.4.7, 2.4.13), and a yellow highlighter behind links. The
   highlighter's colours are important, down to every span inside the
   link: any rule giving a link or its parts their own colour would
   otherwise paint that colour on the yellow, as the footer's yellow links,
   the pager's labels and the dark theme's contents once did. */
.reader :focus{outline:none}
.reader :focus-visible{outline:3px solid var(--focus);outline-offset:3px}
.reader a:focus-visible{outline-offset:2px;background:var(--focus-bg)!important;color:var(--focus-ink)!important;box-shadow:0 0 0 2px var(--focus-bg);text-decoration-color:currentColor}
.reader a:focus-visible *{color:inherit!important}
.plain :focus-visible{outline-color:var(--plain-focus)}
.site-footer :focus-visible{outline-color:var(--footer-link)}
.reader main:focus-visible,.reader [tabindex="-1"]:focus-visible{outline:none}

.skip-link{position:absolute;left:1em;top:1em;z-index:20;padding:0.75em 1.25em;min-height:44px;background:var(--focus-bg);color:var(--focus-ink)!important;font-weight:800;border:var(--bw) solid var(--focus-ink);transform:translateY(-300%)}
.skip-link:focus,.skip-link:focus-visible{transform:none}

/* Controls */
.btn,.header-btn,.btn-line,.toc-toggle{font:inherit;cursor:pointer}
.header-btn,.btn-line{display:inline-flex;align-items:center;gap:0.5em;min-height:48px;padding:0.45em 1em;border:var(--bw) solid var(--edge);border-radius:var(--r);background:var(--surface);color:var(--ink);font-weight:700;line-height:1.2}
.header-btn:hover,.btn-line:hover,.header-btn[aria-expanded="true"]{background:var(--ink);color:var(--bg)}

/* Header */
.site-header{position:relative;background:var(--bg);border-top:var(--bw-heavy) solid var(--ink);border-bottom:var(--bw) solid var(--ink)}
.header-bar{align-items:center;min-height:4.75em;padding-block:0.6em;row-gap:0.6em}
.reader .wordmark{--span:6;--span-md:3;justify-self:start;display:inline-flex;align-items:center;min-height:44px;font-family:var(--font-display);font-weight:900;font-size:1.45em;line-height:1;letter-spacing:-0.025em;color:var(--ink);text-decoration:none}
.reader .wordmark:hover{color:var(--ink);text-decoration:underline;text-decoration-thickness:0.08em}
/* One of the header's items is a link and the others are buttons, and they
   have to look like each other: without this the link takes the link colour
   and an underline, and sits among two things that take neither. */
.reader a.header-btn{color:var(--ink);text-decoration:none}
.reader a.header-btn:hover{color:var(--bg);text-decoration:none}
.header-actions{--start:7;--span:6;--start-md:4;--span-md:3;justify-self:end;display:flex;flex-wrap:wrap;justify-content:flex-end;gap:0.6em}
@container page (width < 40em){
  .header-actions{justify-self:stretch}
  .header-btn{flex:1 1 0;justify-content:center;padding-inline:0.7em;text-align:left}
}

/* Panels opened from the header */
.panel{background:var(--sunk);border-top:var(--bw) solid var(--ink)}
.panel-inner{padding-block:2em 2.25em}
.panel-head{display:flex;flex-wrap:wrap;align-items:baseline;gap:0.3em 1.25em;margin-bottom:1.4em}
.panel-title{font-family:var(--font-display);font-weight:900;font-size:2.1em;line-height:1;letter-spacing:-0.03em;margin:0}
.panel-note{margin:0;color:var(--ink-2)}
.panel-actions{display:flex;flex-wrap:wrap;gap:0.75em;margin-top:1.6em}
.settings-grid,.parts-list{list-style:none;margin:0;padding:0;row-gap:var(--gutter);grid-auto-rows:1fr}
.setting{--span:4;--span-md:3;margin:0;padding:1em 1.1em 1.2em;border:var(--bw) solid var(--edge);background:var(--surface)}
.setting-legend{float:left;width:100%;padding:0;margin:0 0 0.8em}
.setting-legend + *{clear:both}
.choices{display:flex;flex-wrap:wrap;gap:0.5em}
.choice{display:inline-flex;align-items:center;gap:0.55em;min-height:48px;padding:0.35em 0.9em 0.35em 0.7em;border:var(--bw) solid var(--edge);border-radius:var(--r);background:var(--bg);color:var(--ink);cursor:pointer;line-height:1.25}
.choice:hover{background:var(--sunk)}
.choice:has(input:checked){background:var(--ink);color:var(--bg);font-weight:800}
.choice:has(input:checked) input{accent-color:var(--bg)}
.choice:has(input:focus-visible){outline:3px solid var(--focus);outline-offset:3px}
.choice input{width:1.15em;height:1.15em;margin:0;flex:none;accent-color:var(--ink)}
.choice input:focus-visible{outline:none}
.swatch{display:inline-grid;place-items:center;width:1.9em;height:1.9em;border:1px solid var(--edge);font-family:var(--font-display);font-weight:900;font-size:0.95em;line-height:1}
.parts-intro{margin:0 0 1.2em}
.reader .parts-home{display:inline-flex;align-items:center;gap:0.5em;min-height:44px;font-weight:700}
.parts-item{--span:4;--span-md:3;margin:0;display:flex;flex-direction:column;justify-content:space-between;gap:0.5em;padding:1em 1.1em;border:var(--bw) solid var(--edge);background:var(--surface)}
.parts-item.is-current{background:var(--ink);color:var(--bg)}
.reader .parts-link{display:flex;flex-direction:column;gap:0.2em;min-height:44px;color:inherit;text-decoration:none}
.parts-title{font-family:var(--font-display);font-weight:800;font-size:1.2em;line-height:1.15;letter-spacing:-0.01em;color:var(--link);text-decoration:underline;text-decoration-thickness:0.08em;text-underline-offset:0.18em}
.reader .parts-link:hover .parts-title{text-decoration-thickness:0.16em}
.is-current .parts-title{color:var(--bg)}
.parts-here{margin-left:0.5em}
/* A group of parts for each module. A part still to come is words on the
   sunk ground with no link, so it cannot be mistaken for somewhere to go. */
.parts-group + .parts-group{margin-top:1.6em}
.parts-group-title{margin:0 0 0.7em}
.parts-item.is-coming{background:var(--sunk)}
.parts-title.is-plain{color:inherit;text-decoration:none}

/* Part pages: the giant number and the contents in the left three columns,
   the title and the text in the right nine. */
.layout{row-gap:3em;padding-bottom:1em;align-items:start}
.hero-num{--start:1;--span:3;margin:0.35em 0 0;color:var(--ink)}
/* The digits carry the type, and the column carries the placing, so the
   reticle under them is sized in the reader's own text and not in twelve
   times it. */
.hero-num-digits{display:block;font-family:var(--font-display);font-weight:900;font-size:12em;line-height:0.8;letter-spacing:-0.07em}
.hero{--start:4;--span:9;padding-block:2em 2.4em;border-bottom:var(--bw-heavy) solid var(--ink)}
/* A part's hero is indented to leave the first three columns for its number.
   A module's page and the directory have no number, so theirs start at the
   first column and line up with the text and the table below them. */
.module-hero,.directory-hero{--start:1;--span:12}
.crumbs ol{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;align-items:center;gap:0 0.5em}
.crumbs li{display:flex;align-items:center;gap:0.5em;margin:0}
.reader .crumbs a{display:inline-flex;align-items:center;min-height:44px}
.reader .crumbs a[aria-current]{color:var(--ink);text-decoration:none}
.crumb-sep{color:var(--ink-2)}
.eyebrow{margin:1.2em 0 0.6em}
.title{font-family:var(--font-display);font-weight:900;font-size:4.2em;line-height:0.94;letter-spacing:-0.035em;margin:0;max-width:13em;text-wrap:balance}
.title-sub{display:block;margin-top:0.45em;font-size:0.4em;font-weight:800;line-height:1.15;letter-spacing:-0.01em}
.hero-meta{list-style:none;margin:1.6em 0 0;padding:0;display:flex;flex-wrap:wrap;gap:0.6em 1.75em;color:var(--ink-2)}
.hero-meta li{display:flex;align-items:center;gap:0.45em;margin:0}
.outcome{margin:1.8em 0 0;padding:1em 1.2em 1.1em;max-width:calc(var(--measure) + 2.8em);background:var(--surface);border:var(--bw) solid var(--edge)}
.outcome-label{display:flex;align-items:center;gap:0.5em;margin:0 0 0.45em}
.outcome-text{margin:0;font-size:1.05em}
.toc{--start:1;--span:3;font-size:0.95em}
.article{--start:4;--span:9}
@container page (width < 62em){
  .hero-num{display:none}
  .title{font-size:3.2em}
  .hero{padding-block:1.2em 2em}
}
@container page (width < 40em){.title{font-size:2.3em}}

/* Contents */
.toc-title{margin:0;font-family:var(--font-body);font-size:1em;line-height:1.3}
.toc-static{display:none}
/* Where the reader is, in the sticky contents: the module over the part, so
   that once the page's own title has scrolled away this still says it. The
   part's name is set in the title face, since it is a title. */
.toc-where{display:block;color:var(--ink-2)}
.toc-page{display:block;font-family:var(--font-display);font-weight:900;font-size:1.15em;line-height:1.15;margin-top:0.15em}
.toc-toggle .toc-where,.toc-toggle .toc-page{text-align:left}
.toc-toggle{display:flex;width:100%;align-items:center;justify-content:space-between;gap:1em;min-height:52px;padding:0.6em 1em;border:var(--bw) solid var(--edge);border-radius:var(--r);background:var(--surface);color:var(--ink);font-weight:800;text-align:left}
.toc-toggle:hover{background:var(--ink);color:var(--bg)}
.toc-toggle[aria-expanded="true"] .chev{transform:rotate(180deg)}
.toc-list{list-style:none;margin:0.75em 0 0;padding:0;border-top:var(--bw) solid var(--ink)}
.toc-list li{margin:0}
.reader .toc-list a{display:flex;gap:0.7em;align-items:baseline;min-height:44px;padding:0.55em 0.5em;border-bottom:1px solid var(--rule);color:var(--ink);text-decoration:none;line-height:1.3}
/* The contents follow the reader down the page: the section being read is
   bold, and the ones already passed are dimmed, never below 7:1. Bold is
   wider, and a heading that wrapped onto another line in bold would make
   the list below it jump as the reader scrolled past. So each heading has
   an unseen bold copy stacked in the same cell, which keeps room for it,
   and a heading shorter than its copy sits in the middle of that room. */
.reader .toc-list .is-past a{color:var(--past)}
.reader .toc-list .is-current a{font-weight:800}
.toc-text{display:grid;align-items:center}
.toc-text > span,.toc-text::after{grid-area:1 / 1}
.toc-text::after{content:attr(data-bold);font-weight:800;visibility:hidden}
.reader .toc-list a:hover{background:var(--ink);color:var(--bg)}
.toc-num{flex:none;min-width:1.6em;font-family:var(--font-mono);font-weight:700;font-size:0.9em}
@container page (width >= 62em){
  .toc{position:sticky;top:1.5em;max-height:calc(100vh - 3em);overflow-y:auto;padding:0.2em 0.2em 0.5em 0}
  .toc-static{display:block;padding:0 0 0.7em;border-bottom:var(--bw-heavy) solid var(--ink);margin-bottom:0.2em}
  .toc-toggle{display:none}
  .toc-list[hidden]{display:block}
}

/* The article */
.article > section{margin-top:4.5em;padding-top:1.2em;border-top:var(--bw-heavy) solid var(--ink)}
.article > section:first-child{margin-top:0;padding-top:0;border-top:0}
.article p{margin:0 0 var(--para);max-width:var(--measure)}
.prose-list{margin:0 0 var(--para);padding-left:1.3em;max-width:var(--measure);list-style-type:square}
.prose-list > li{margin:0 0 0.9em;padding-left:0.3em}
.prose-list > li::marker{color:var(--ink)}
.prose-list > li > p{margin-bottom:0.6em}
.article strong{font-weight:800}
/* A code span is kept whole and its spaces kept, since a leading space can
   be the point. A long one with no spaces, which the renderer marks, may
   break anywhere: a model's name can be longer than a phone is wide. */
.reader code{font-family:var(--font-mono);font-size:0.88em;background:var(--sunk);padding:0.08em 0.3em;white-space:pre;box-shadow:inset 0 0 0 1px var(--rule)}
.reader code.is-long{white-space:normal;overflow-wrap:anywhere;box-decoration-break:clone;-webkit-box-decoration-break:clone}
.reader sup{font-size:0.7em;line-height:0;vertical-align:0.55em}
.sec-title{font-family:var(--font-display);font-weight:900;font-size:2.7em;line-height:0.98;letter-spacing:-0.035em;margin:0 0 0.8em;max-width:15em;text-wrap:balance;scroll-margin-top:1em}
.sec-num{display:block;margin-bottom:0.3em;font-size:0.5em;letter-spacing:-0.02em}
.article h3{font-family:var(--font-display);font-weight:800;font-size:1.4em;line-height:1.15;letter-spacing:-0.015em;margin:2.2em 0 0.6em;max-width:var(--measure);scroll-margin-top:1em}
.article h4{font-family:var(--font-display);font-weight:800;font-size:1.15em;line-height:1.25;letter-spacing:-0.01em;margin:1.8em 0 0.4em;max-width:var(--measure)}
@container page (width < 48em){.sec-title{font-size:2.1em}.article h3{font-size:1.25em}.article > section{margin-top:4em}}

/* In plain terms */
.plain{margin:0 0 2.25em;padding:1.2em 1.4em 1.3em;max-width:calc(var(--measure) + 2.8em);background:var(--plain-bg);color:var(--plain-ink);border:var(--bw) solid var(--plain-edge)}
.reader .plain a{color:var(--plain-link)}
/* A code span in the panel keeps the panel's ground. Its own sunk fill is a
   page colour, and in the dark theme that is near-black under the panel's
   near-black ink. */
.reader .plain code{background:none;box-shadow:inset 0 0 0 1px currentColor}
.plain-label{display:flex;align-items:center;gap:0.5em;margin:0 0 0.6em!important}
.article .plain-summary{font-size:1.07em;margin:0 0 0.9em}
.article .plain-who{margin:0;padding-top:0.85em;border-top:var(--bw) solid var(--plain-ink)}

/* Deep dives */
.deep{margin:2.5em 0;max-width:calc(var(--measure) + 2.8em);background:var(--deep-bg);border:var(--bw) solid var(--deep-edge)}
.article .deep-heading{margin:0;font-size:1em;max-width:none}
.deep-toggle{font:inherit;color:inherit;display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:0.3em 1em;width:100%;min-height:56px;padding:1em 1.2em;margin:0;border:0;background:none;text-align:left;cursor:pointer}
.deep-toggle[aria-expanded="true"]{border-bottom:var(--bw) solid var(--deep-edge)}
.deep-kicker{grid-column:1;display:flex;align-items:center;gap:0.45em;color:var(--deep-label)}
.deep-title{grid-column:1;font-family:var(--font-display);font-size:1.3em;font-weight:800;line-height:1.15;letter-spacing:-0.015em}
.deep-state{grid-column:2;grid-row:1 / span 2;display:inline-flex;align-items:center;gap:0.35em;min-height:44px;padding:0.3em 0.8em;border:var(--bw) solid var(--edge);border-radius:var(--r);background:var(--ink);color:var(--bg);font-weight:800}
.deep-toggle:hover .deep-state{background:var(--link);border-color:var(--link);color:var(--on-accent)}
.deep-toggle[aria-expanded="true"] .when-closed,.deep-toggle[aria-expanded="false"] .when-open{display:none}
.deep-toggle[aria-expanded="true"] .chev{transform:rotate(180deg)}
.deep-body{padding:1.2em 1.4em 1.4em}
.deep-body > :last-child{margin-bottom:0}
.deep-body .table-wrap,.deep-body .code-block{max-width:100%}
/* On a phone the Show button moves under the title, so the title keeps the width. */
@container page (width < 40em){.deep-toggle{grid-template-columns:minmax(0,1fr)}.deep-state{grid-column:1;grid-row:auto;justify-self:start;margin-top:0.5em}}

/* Misconceptions */
.myth{margin:2em 0 2.25em;padding:1.4em 1.4em 1.3em;max-width:calc(var(--measure) + 2.8em);background:var(--surface);border:var(--bw) solid var(--edge)}
.article .myth-claim{font-family:var(--font-display);font-weight:900;font-size:1.8em;line-height:1.02;letter-spacing:-0.03em;margin:0 0 0.9em}
.myth-parts{margin:0;display:grid;gap:1.1em}
.myth-part dt{display:flex;align-items:center;gap:0.45em;margin:0 0 0.25em}
.myth-part dd{margin:0}
.is-true dt{color:var(--true-ink)}
.is-misleading dt{color:var(--false-ink)}
.is-say dt{color:var(--say-ink)}
.is-say dd{padding:0.85em 1.1em;background:var(--sunk);border:var(--bw) solid var(--edge);font-size:1.04em}

/* Tables: a table on wide screens, a stack of labelled blocks on narrow ones.
   The role attributes keep the table's meaning when CSS changes its display. */
.table-wrap{margin:1.5em 0 2.25em;max-width:var(--wide)}
.data{width:100%;border-collapse:collapse;font-size:0.92em;line-height:1.55;font-variant-numeric:tabular-nums;border-top:var(--bw-heavy) solid var(--ink)}
.data th,.data td{text-align:left;vertical-align:top;padding:0.8em 1.2em 0.8em 0;border-bottom:1px solid var(--rule)}
.data th:last-child,.data td:last-child{padding-right:0}
.data thead th{font-family:var(--font-mono);font-size:0.82em;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;border-bottom:var(--bw) solid var(--ink);padding-top:0.75em;vertical-align:bottom}
.data thead td{border-bottom:var(--bw) solid var(--ink)}
.data tbody th{font-weight:800}
.data.two-ways tbody th{width:22%}
.data.is-compact{width:auto;min-width:min(100%,24em)}
.cell-label{display:none}
@container page (width < 44em){
  .data,.data tbody,.data tr,.data th,.data td{display:block;width:auto}
  .data{border-top:0}
  .data thead{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
  .data tbody tr{margin:0 0 1em;padding:0.9em 1.1em;background:var(--surface);border:var(--bw) solid var(--edge)}
  .data th,.data td{padding:0.2em 0;border:0}
  .data tbody th{font-size:1.05em;padding-bottom:0.35em}
  .data.two-ways tbody th{width:auto}
  .data td + td,.data th + td{padding-top:0.55em}
  .cell-label{display:block;font-family:var(--font-mono);font-size:0.82em;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;color:var(--ink-2)}
  .data td.is-empty{display:none}
}

/* The model directory. A table of reference, so it is denser than the prose
   pages and sits across the whole grid rather than in a reading column. */
.directory-layout .directory-lede{--start:1;--span:9}
/* The filters fold away, and start folded at every width: a reader comes to
   the directory to look at models, and meets the table rather than a screen
   of controls. */
.filter-panel{--start:1;--span:12;margin:2em 0 0}
.filter-toggle{display:flex;align-items:center;justify-content:space-between;gap:1em;min-height:48px;padding:0.4em 1em;border:var(--bw) solid var(--edge);border-radius:var(--r);background:var(--surface);font-weight:800;cursor:pointer;list-style:none}
.filter-toggle::-webkit-details-marker{display:none}
.filter-toggle:hover{background:var(--ink);color:var(--bg)}
.filter-toggle:focus-visible{outline:3px solid var(--focus);outline-offset:2px}
.filter-panel[open] .filter-toggle .chev{transform:rotate(180deg)}
.filter-panel[open] .filters{margin-top:0.6em}
.filters{display:flex;flex-direction:column;gap:1.2em;margin:0;padding:1.2em 1.3em 1.4em;background:var(--surface);border:var(--bw) solid var(--edge)}
/* Each group takes a row of its own and its choices run across it. They were
   laid out in equal columns, which gave a group of two choices as much width
   as a group of ten, and wrapped the ten into a ragged stack beside an empty
   half of the panel. */
.filter-group{margin:0;padding:0;border:0;min-width:0}
.filter-group .choices{display:flex;flex-wrap:wrap;gap:0.5em}
.filter-actions{display:flex}
.filter-choice{min-height:44px}
.search-field{display:flex;align-items:center;gap:0.5em;padding:0 0.7em;background:var(--bg);border:var(--bw) solid var(--edge)}
.search-field input{flex:1;min-height:44px;padding:0.3em 0;border:0;background:none;color:var(--ink);font:inherit;font-size:1em}
.search-field input:focus-visible{outline:3px solid var(--focus);outline-offset:-1px}
.search-field input{min-width:0}
.model-count{--start:1;--span:12;margin:1.2em 0 0;font-family:var(--font-mono);font-size:0.9em;color:var(--ink-2)}
.model-none{--start:1;--span:12;margin:1.5em 0 0}
/* A table inside prose is capped at the reading width. This one is the page,
   so it takes all twelve columns. */
.directory-layout .table-wrap{--start:1;--span:12;max-width:none;margin-top:0.8em}
.models{font-size:0.95em}
/* The columns are sized so a model's name does not wrap and the list of what
   it does has room to run across rather than down. Only while the table is a
   table: below 44em every row becomes a card, and a width meant for a column
   would squeeze a name to one letter a line. */
@container page (width >= 44em){
  .models th:nth-child(1){width:17%}
  .models th:nth-child(2){width:11%}
  .models th:nth-child(3){width:12%}
  .models th:nth-child(4){width:13%}
  .models th:nth-child(5){width:11%}
  .models th:nth-child(6){width:11%}
  .models th:nth-child(7){width:14%}
  .models th:nth-child(8){width:11%}
}
/* The control sits in the model's row; what it opens is the row beneath,
   spanning every column, because a panel inside one cell was a column wide
   and twenty lines tall. */
.model-toggle{display:flex;align-items:center;justify-content:space-between;gap:0.5em;width:100%;min-height:44px;padding:0.3em 0.7em;border:var(--bw) solid var(--edge);border-radius:var(--r);background:var(--bg);color:var(--ink);font:inherit;font-weight:800;cursor:pointer}
.model-toggle:hover{background:var(--ink);color:var(--bg)}
.model-toggle:focus-visible{outline:3px solid var(--focus);outline-offset:2px}
.model-toggle[aria-expanded="true"] .chev{transform:rotate(180deg)}
.model-extra[data-shut]{display:none}
.model-extra > td{padding-top:0;padding-bottom:0.9em}
.models tbody th{vertical-align:top}
.models td{vertical-align:top}
.does{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:0.3em 0.7em}
/* In a row the icons stand alone, so they get room to be told apart. */
.does-icons{gap:0.45em 0.6em}
.does-icons .icon{width:1.35em;height:1.35em}
.does-named{gap:0.4em 1.2em;margin-top:0.3em}
.model-released-value{margin:0.1em 0 0}
/* A model that has been passed or switched off says so in its own column, so
   that saying it never makes one row taller than the rest. */
.model-state.is-superseded,.model-state.is-retired{color:var(--ink-2)}
.model-source{margin:0.9em 0 0}
.model-fact-label{margin:0;font-family:var(--font-mono);font-size:0.82em;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;color:var(--ink-2)}
/* After the list above it, which wraps, so it needs the room said here and
   not in the rule above, which would lose to the margin reset. */
.model-released-label{margin-top:1.4em}
.does-item{display:flex;align-items:center;gap:0.3em;white-space:nowrap}
.does-item .icon,.access-mark .icon{width:1.1em;height:1.1em;flex:none}
.does-word{font-size:0.9em}
.access-mark{display:flex;align-items:center;gap:0.35em;white-space:nowrap}
.model-body{margin:0.7em 0 0.3em;padding:1em 1.1em 1.1em;background:var(--sunk);border:var(--bw) solid var(--edge);row-gap:1.1em}
/* Three columns of four: what the model is, what it does and when it came,
   then the facts and where they came from. Each starts at the top, so the
   labels across the three line up. */
.model-col{align-self:start}
.model-col-notes{--start:1;--span:4;--start-md:1;--span-md:6}
.model-col-does{--start:5;--span:4;--start-md:1;--span-md:3}
.model-col-facts{--start:9;--span:4;--start-md:4;--span-md:3}
.model-notes{margin:0;max-width:var(--measure)}
/* Label and value in two columns, so every value starts at the same place. */
.model-facts{margin:0;display:grid;grid-template-columns:max-content minmax(0,1fr);gap:0.35em 1em}
.model-facts dt{font-family:var(--font-mono);font-size:0.82em;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;color:var(--ink-2);line-height:1.45}
.model-facts dd{margin:0}
@container page (width < 62em){
  .directory-layout .directory-lede{--span:12}
}

/* Code */
.code-block{margin:1.5em 0 2.25em;max-width:var(--wide)}
.code-cap{margin:0 0 0.5em!important}
.code{margin:0;padding:1.1em 1.3em;overflow-x:auto;background:var(--code-bg);color:var(--code-ink);border:var(--bw) solid var(--edge);font-family:var(--font-mono);font-size:0.86em;line-height:1.65;tab-size:4;white-space:pre}
/* A prompt is prose, not code: it wraps like prose, so no one scrolls
   sideways to read a sentence. */
.code.is-prose{white-space:pre-wrap;overflow-wrap:anywhere}
.code code{background:none;color:inherit;padding:0;font-size:1em;white-space:inherit;box-shadow:none}
.c-note{color:var(--code-note)}

/* Figures redrawn from the course's diagrams */
.figure{margin:2em 0 2.5em;padding:1.3em 1.5em 1.5em;max-width:min(var(--wide),100%);background:var(--surface);border:var(--bw) solid var(--edge)}
.figure-cap{margin:0 0 1.1em}
.flow-column{width:fit-content;min-width:min(100%,24em)}
.flow-steps{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;align-items:flex-start}
.flow-step{margin:0;padding:0;max-width:100%;display:flex;flex-direction:column;align-items:flex-start}
/* The lifecycle calculator. A row for each stage: its name, the days it takes
   now, the share AI saves, what is left, and a bar of the two under them. The
   bars are an outline for now and a solid for with AI, in the text colour, so
   they need no colours of their own and hold in every theme. Below 44em the
   row's four pieces stack. */
.calc-presets{display:flex;flex-wrap:wrap;gap:0.6em;margin:0 0 1.4em}
.reader .calc-preset{font-size:0.92em;font-weight:700;line-height:1.25;text-align:left}
.calc-rows{list-style:none;margin:0;padding:0;border-top:var(--bw) solid var(--edge)}
.calc-row{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,0.9fr) minmax(0,1.9fr) minmax(0,0.8fr);gap:0.5em 1.4em;align-items:end;padding:1em 0 1.1em;border-bottom:1px solid var(--rule)}
.calc-stage{margin:0;align-self:center;font-family:var(--font-display);font-weight:800;font-size:1.1em;line-height:1.15;letter-spacing:-0.01em}
.calc-field{display:flex;flex-direction:column;gap:0.35em;min-width:0}
.calc-label{display:block}
.calc-pct{font-weight:800;color:var(--ink)}
.calc-days{font:inherit;font-variant-numeric:tabular-nums;width:100%;min-height:48px;padding:0.3em 0.6em;border:var(--bw) solid var(--edge);border-radius:var(--r);background:var(--bg);color:var(--ink)}
.calc-saved{width:100%;min-height:48px;margin:0;accent-color:var(--ink);cursor:pointer}
.reader .calc-after{margin:0;display:flex;flex-direction:column;gap:0.35em}
.calc-after-n{display:flex;align-items:center;min-height:48px;font-weight:800;font-variant-numeric:tabular-nums}
.calc-bar{grid-column:1 / -1;position:relative;height:1.1em}
.calc-bar-now,.calc-bar-after{position:absolute;left:0;top:0;bottom:0;min-width:2px;box-sizing:border-box}
.calc-bar-now{border:var(--bw) solid var(--edge)}
.calc-bar-after{background:var(--ink)}
.calc-result{margin:1.4em 0 0;padding:1.1em 1.3em 1.2em;background:var(--plain-bg);color:var(--plain-ink);border:var(--bw) solid var(--plain-edge)}
.calc-totals{display:flex;flex-wrap:wrap;gap:0.8em 2.4em;margin:0}
.calc-total{display:flex;flex-direction:column;gap:0.2em}
.calc-total strong{font-family:var(--font-display);font-weight:900;font-size:1.5em;line-height:1.1;letter-spacing:-0.015em}
.calc-result .calc-label{color:var(--plain-ink)}
.reader .calc-note{margin:0.9em 0 0;max-width:var(--measure)}
@container page (width < 44em){
  .calc-row{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}
  .calc-stage,.calc-field-saved{grid-column:1 / -1}
}
@container page (width < 26em){.calc-row{grid-template-columns:minmax(0,1fr)}}
.flow-box{display:inline-flex;max-width:100%;align-items:center;gap:0.6em;padding:0.5em 1em 0.5em 0.55em;border:var(--bw) solid var(--edge);background:var(--bg);font-size:0.95em;line-height:1.35}
.flow-text{min-width:0}
.flow-n{display:inline-grid;place-items:center;flex:none;min-width:1.8em;height:1.8em;padding:0 0.3em;background:var(--ink);color:var(--bg);font-family:var(--font-mono);font-size:0.8em;font-weight:700;line-height:1}
.flow-box.is-add{padding-left:0.45em;border-style:dashed}
.flow-plus{display:inline-grid;place-items:center;flex:none;width:1.8em;height:1.8em;border:var(--bw) solid var(--ink);font-weight:800;line-height:1}
.flow-note{color:var(--ink-2)}
.flow-tag{display:inline-block;margin-left:0.2em;padding:0.1em 0.45em;background:var(--plain-bg);color:var(--plain-ink);font-family:var(--font-mono);font-size:0.78em;font-weight:700;letter-spacing:0.05em;text-transform:uppercase}
.flow-arrow{display:flex;padding:0.3em 0 0.3em 0.75em;color:var(--ink)}
.flow-inputs{margin:0}
.flow-inputs-label{margin:0 0 0.5em;color:var(--ink-2)}
.flow-input-list{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:0.5em}
.flow-input-list li{margin:0}
.flow-box.is-input{padding-left:1em}
.flow-loop{display:flex;align-items:flex-start;gap:0.6em;margin:1.1em 0 0!important;padding-top:1em;border-top:var(--bw) dashed var(--ink);font-size:0.95em}
.lane + .lane{margin-top:1.25em;padding-top:1.25em;border-top:var(--bw) solid var(--ink)}
.lane-label{margin:0 0 0.6em!important;color:var(--ink-2)}

/* The sequence diagram: three lifelines on wide screens, a numbered list of
   messages that says who sends what to whom on narrow ones. */
.seq-heads{display:none}
.seq-steps{list-style:none;margin:0;padding:0;display:grid;gap:0.75em}
.seq-step{margin:0;display:flex;flex-direction:column;gap:0.15em;padding:0.7em 1em;border:var(--bw) solid var(--edge);background:var(--bg)}
.seq-route{color:var(--ink-2)}
.seq-msg{font-weight:800}
@container page (width >= 50em){
  .seq-heads{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0;margin-bottom:0.25em}
  .seq-head{justify-self:center;padding:0.4em 0.9em;border:var(--bw) solid var(--edge);background:var(--bg);font-weight:800;font-size:0.9em;text-align:center}
  .seq-steps{grid-template-columns:repeat(3,minmax(0,1fr));gap:0;padding-block:0.5em;
    background-image:linear-gradient(var(--rule),var(--rule)),linear-gradient(var(--rule),var(--rule)),linear-gradient(var(--rule),var(--rule));
    background-size:2px 100%;background-repeat:no-repeat;background-position:16.667% 0,50% 0,83.333% 0}
  .seq-step{position:relative;border:0;background:none;padding:0.55em 0 0.7em;text-align:center;border-bottom:var(--bw) solid var(--ink)}
  .seq-step + .seq-step{margin-top:0.35em}
  .seq-step::after{content:'';position:absolute;bottom:-7px;width:0;height:0;border-block:6px solid transparent}
  .seq-step.to-right::after{right:-1px;border-left:10px solid var(--ink)}
  .seq-step.to-left::after{left:-1px;border-right:10px solid var(--ink)}
  .span-1-2{grid-column:1 / 3;margin-inline:25%}
  .span-2-3{grid-column:2 / 4;margin-inline:25%}
  .span-1-3{grid-column:1 / 4;margin-inline:16.667%}
  .seq-route{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
  .seq-msg{display:inline-block;padding:0 0.5em;background:var(--surface)}
}

/* Glossary */
.glossary{margin:1.25em 0 0;max-width:var(--wide);border-top:var(--bw-heavy) solid var(--ink)}
.gl-row{display:grid;grid-template-columns:13em minmax(0,1fr);gap:0.2em 2em;padding:0.9em 0;border-bottom:1px solid var(--rule)}
.gl-row dt{font-weight:800}
.gl-row dd{margin:0;max-width:var(--measure)}
@container page (width < 44em){.gl-row{grid-template-columns:minmax(0,1fr)}}

/* Questions and answers */
.qa{margin:1.75em 0 2em}
.article .qa-q{margin:0 0 0.35em;font-size:1.2em}

/* Previous and next */
.pager{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--gutter);grid-auto-rows:1fr;margin:5em 0 0;max-width:var(--wide)}
.reader .pager-link{display:flex;flex-direction:column;justify-content:space-between;gap:0.6em;min-height:44px;padding:1.1em 1.3em 1.2em;border:var(--bw) solid var(--edge);background:var(--surface);color:var(--ink);text-decoration:none}
.reader .pager-link:hover{background:var(--ink);color:var(--bg)}
.pager-dir{display:flex;align-items:center;gap:0.45em}
.pager-title{font-family:var(--font-display);font-weight:800;font-size:1.3em;line-height:1.12;letter-spacing:-0.015em;color:var(--link);text-decoration:underline;text-decoration-thickness:0.08em;text-underline-offset:0.18em}
.reader .pager-link:hover .pager-title{color:var(--bg)}
.reader .pager-link.is-next{grid-column:2;align-items:flex-end;text-align:right}
@container page (width < 40em){.pager{grid-template-columns:minmax(0,1fr)}.reader .pager-link.is-next{grid-column:1}}

/* Footer: a dark block in every theme */
.site-footer{margin-top:6em;padding-block:3em 4em;background:var(--footer-bg);color:var(--footer-ink);border-top:var(--bw-heavy) solid var(--footer-link)}
.site-footer .shell{row-gap:1.5em;align-items:start}
.footer-title{--span:4;--span-md:6;margin:0;font-family:var(--font-display);font-weight:900;font-size:1.9em;line-height:1;letter-spacing:-0.03em}
.footer-nav{--start:5;--span:8;--span-md:6}
.footer-links{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 var(--gutter)}
.footer-links li{margin:0}
.footer-group{margin-top:1.2em}
.footer-group-title{margin:0 0 0.2em;color:var(--footer-ink)}
.reader .footer-links a{display:inline-flex;align-items:center;min-height:44px;color:var(--footer-link)}
.reader .footer-links a:hover{color:var(--footer-link);text-decoration-thickness:0.16em}
.footer-note{--start:5;--span:7;--span-md:6;margin:0;max-width:var(--measure);color:var(--footer-ink)}
@container page (width < 40em){.footer-links{grid-template-columns:minmax(0,1fr)}}

/* Home */
.home-hero{padding-block:2.4em 3.6em}
.home-kicker{margin:0 0 1.1em}
.home-title{margin:0;font-family:var(--font-display);font-weight:900;font-size:7.4em;line-height:0.87;letter-spacing:-0.05em;text-wrap:balance}
.hero-rule{margin-top:1.3em;border-top:var(--bw-heavy) solid var(--ink)}
/* A part page's band sits between the breadcrumbs and the eyebrow that names
   its module, so the colour and the words arrive together. */
.hero .eyebrow::before{content:"";display:block;height:0.5em;margin:0 0 0.9em;background:var(--hue)}
.parts-group-title,.footer-group-title{border-left:0.5em solid var(--hue);padding-left:0.6em}
/* The pager names the module it crosses into whenever it is a different one.
   The band sits inside the link's own border, which stays whole: a pastel is
   too quiet to carry a boundary. */
.reader .pager-link{position:relative;padding-top:1.7em}
.reader .pager-link::before{content:"";position:absolute;left:0;right:0;top:0;height:0.5em;background:var(--hue)}
.home-lede{--start:1;--span:7;margin:1.4em 0 0;max-width:30em;font-size:1.3em;line-height:1.5}
.hero-side{--start:9;--span:4;display:flex;flex-direction:column;gap:1.5em;padding-top:1.9em}
.home-meta{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:0.75em;color:var(--ink-2)}
.home-meta li{display:flex;align-items:center;gap:0.5em;margin:0}
.cta-row{display:flex;flex-direction:column;align-items:stretch;gap:0.7em}
.reader .btn-primary,.reader .btn-quiet{display:inline-flex;align-items:center;justify-content:space-between;gap:0.8em;min-height:3.1em;padding:0.7em 1.1em;border:var(--bw) solid var(--edge);border-radius:var(--r);font-weight:800;text-decoration:none}
.reader .btn-primary{background:var(--link);border-color:var(--link);color:var(--on-accent)}
.reader .btn-primary:hover{background:var(--ink);border-color:var(--ink);color:var(--bg)}
.reader .btn-quiet{background:transparent;color:var(--ink)}
.reader .btn-quiet:hover{background:var(--ink);color:var(--bg)}
.home-section{padding-block:3.2em 4.5em;border-top:var(--bw-heavy) solid var(--ink)}
.home-section > .shell{row-gap:1.6em;align-items:start}
.home-h2{margin:0;font-family:var(--font-display);font-weight:900;font-size:3.3em;line-height:0.94;letter-spacing:-0.04em;scroll-margin-top:1em}
.home-section p{margin:0 0 var(--para);max-width:var(--measure)}
.split > .home-h2{--span:4;--span-md:6}
.split-body{--start:5;--span:7;--span-md:6}
.section-intro{--span:7;--span-md:6}
.section-intro > :last-child,.split-body > :last-child{margin-bottom:0}
.part-cards,.ideas,.legend,.routes{list-style:none;margin:0.6em 0 0;padding:0;row-gap:var(--gutter);grid-auto-rows:1fr}
.part-card{--span:4;--span-md:3;position:relative;margin:0;display:grid;grid-template-columns:minmax(0,1fr) auto;grid-template-areas:"num time" "title title" "outcome outcome";align-content:start;gap:0.2em 1em;padding:1.2em 1.3em 1.4em;background:var(--surface);border:var(--bw) solid var(--edge)}
.part-card:hover{background:var(--link);border-color:var(--link);color:var(--on-accent)}
.part-card:focus-within{outline:3px solid var(--focus);outline-offset:3px}
/* Seven cards sit four and then three, since three, three and one would
   strand the last on a row of its own. */
.part-cards:has(> :nth-child(7):last-child) > :nth-child(-n+4){--span:3}
/* Four sit in one row, since three and one would strand the last. */
.part-cards:has(> :nth-child(4):last-child) > *{--span:3}
/* Five sit three and then two, the two sharing the row between them. */
.part-cards:has(> :nth-child(5):last-child) > :nth-child(n+4){--span:6}
/* Two share the row between them, since two thirds would leave the last
   third of it empty. */
.part-cards:has(> :nth-child(2):last-child) > *{--span:6}
/* A part still to come: the same card, sunk into the ground, leading nowhere. */
.part-card.is-coming,.part-card.is-coming:hover{background:var(--sunk);border-color:var(--edge);color:inherit}
.module{--span:12;margin-top:1.6em;padding-top:1.2em;border-top:var(--bw) solid var(--ink)}
/* A module's hue. It is a design language and never a meaning: the module is
   named in words wherever one of these appears, and the high contrast theme
   sets every hue to the ink, so nothing there depends on telling them apart.
   The hues are bands and rules only, never behind text, so none of them has to
   carry a 7:1 pair. */
.module{position:relative}
.module::before{content:"";position:absolute;left:0;right:0;top:calc(var(--bw) * -1);height:0.5em;background:var(--hue)}
.module .part-card::before{content:"";position:absolute;left:0;right:0;top:0;height:0.5em;background:var(--hue)}
.module .part-card{padding-top:1.7em}
.module-title{margin:0;font-family:var(--font-display);font-weight:900;font-size:2em;line-height:1.05;letter-spacing:-0.03em;scroll-margin-top:1em}
/* These outrank the home page's paragraph rule, which would otherwise close
   the gap under the module's name and open one under its last paragraph. */
.home-section .module-meta{margin:1.7em 0 0;color:var(--ink-2)}
.module-lede{--start:1;--span:9;margin:1.6em 0 0}
/* The way in sits under the module's explanation and above its parts, on the
   grid with them, with room of its own so it does not butt against the text. */
.module-cta{--start:1;--span:12;margin:1.8em 0 0.4em}
.module-lede p{margin:0 0 var(--para);max-width:var(--measure)}
.module-lede > :last-child{margin-bottom:0}
.home-section .module-notes{margin-top:1.1em}
.home-section .module-notes > :last-child{margin-bottom:0}
.home-section .module .part-cards{margin-top:2.2em}
@container page (width < 40em){.module-title{font-size:1.6em}}
.part-num{grid-area:num;font-family:var(--font-display);font-weight:900;font-size:3.8em;line-height:0.8;letter-spacing:-0.06em}
.part-time{grid-area:time;display:flex;align-items:center;gap:0.4em;margin:0;color:inherit}
.part-title{grid-area:title;margin:1em 0 0.35em;font-family:var(--font-display);font-weight:800;font-size:1.45em;line-height:1.08;letter-spacing:-0.02em}
.module-title a{display:inline-block;min-height:44px}
.reader .part-title a{color:inherit;text-decoration-thickness:0.07em}
.reader .part-title a::after{content:'';position:absolute;inset:0}
.reader .part-title a:hover{background:none;color:inherit}
.reader .part-title a:focus-visible{outline:none;background:none!important;box-shadow:none;color:inherit!important}
.part-outcome{grid-area:outcome;margin:0}
.idea{--span:3;--span-md:3;margin:0;display:flex;flex-direction:column;gap:0.9em;padding:1.1em 0 0;border-top:var(--bw-heavy) solid var(--ink)}
.idea-num{font-family:var(--font-display);font-weight:900;font-size:4.2em;line-height:0.8;letter-spacing:-0.06em;color:var(--ink)}
.home-section .idea p{margin:0}
.idea-lead{display:block;margin-bottom:0.45em;font-family:var(--font-display);font-weight:800;font-size:1.3em;line-height:1.12;letter-spacing:-0.015em}
.legend li{--span:3;--span-md:3;margin:0;display:flex;flex-direction:column;align-items:flex-start;gap:1em;padding:1.1em 1.2em 1.3em;background:var(--surface);border:var(--bw) solid var(--edge)}
.legend li:first-child{--span:6;--span-md:6}
.home-section .legend p{margin:0}
.specimen{display:flex;flex-direction:column;gap:0.3em;padding:0.5em 0.75em;border:var(--bw) solid var(--edge);background:var(--bg)}
.specimen .icon{width:1.25em;height:1.25em}
.spec-row{display:flex;align-items:center;gap:0.4em}
.specimen.is-plain{background:var(--plain-bg);color:var(--plain-ink);border-color:var(--plain-edge)}
.specimen.is-deep{background:var(--deep-bg);color:var(--deep-label)}
.specimen.is-text{font-family:var(--font-display);font-weight:900;font-size:1.6em;letter-spacing:-0.03em;line-height:1;text-transform:none}
.spec-true{color:var(--true-ink)}.spec-false{color:var(--false-ink)}.spec-say{color:var(--say-ink)}
.section-outro{--span:7;--span-md:6}
.route{--span:3;--span-md:3;margin:0;display:flex;flex-direction:column;gap:0.6em;padding:1.2em 1.3em 1.4em;background:var(--surface);border:var(--bw) solid var(--edge)}
/* Four routes sit four across. Six sit three and three, since four and two
   would leave half a row empty, and nine sit three by three, since four, four
   and one would leave most of one. */
.routes:has(> :nth-child(6):last-child) > .route,.routes:has(> :nth-child(9):last-child) > .route{--span:4}
.routes:has(> :nth-child(7):last-child) > .route:nth-child(n+5){--span:4}
.route-reader{margin:0;font-family:var(--font-display);font-weight:800;font-size:1.3em;line-height:1.12;letter-spacing:-0.015em}
.home-section .route p{margin:0}
.currency{padding:1.4em 1.6em;background:var(--sunk);border:var(--bw) solid var(--edge)}
.home-section .currency p:last-child{margin-bottom:0}
@container page (width < 62em){
  .home-title{font-size:4.6em}
  .home-h2{font-size:2.6em}
  .hero-side{padding-top:1.4em}
}
@container page (width < 40em){
  .home-title{font-size:3.1em}
  .home-lede{font-size:1.15em}
  .home-h2{font-size:2.1em}
  .home-hero{padding-block:1.6em 2.8em}
  .home-section{padding-block:2.6em 3.2em}
}

/* Decoration: the technical marks in decor.mjs. Two rules hold it, and the
   audit's decor check holds them both. A mark never sits behind text, so
   nothing here changes what any word is drawn on; and a mark never says
   anything, so the high contrast theme and forced colours drop the lot and
   the guide reads the same without it. The marks are drawn in --mark, which
   the contrast gate holds to the same quiet window as a module's hue. */
.decor{color:var(--mark);pointer-events:none;-webkit-user-select:none;user-select:none}
.decor-mark{display:block;color:inherit;overflow:visible}
.decor-ring{width:2.2em;height:2.2em}
.decor-steps{width:2em;height:2em}
.decor-chevrons{width:2.6em;height:0.9em}
.decor-bars{width:4.4em;height:1.1em}
.decor-bars.is-vertical{width:1.1em;height:4.4em}
.decor-dots{width:4.4em;height:1.1em}
.decor-code{width:4.6em;height:0.8em}
.decor-code text{font-family:var(--font-mono);font-weight:700}
.decor-row{display:flex;align-items:center;gap:0.8em}
/* The hairline that fills whatever length is left. It is a gradient rather
   than a drawing, so it stretches without turning a circle into an egg. */
.decor-ticks{display:block;color:inherit}
.decor-ticks.is-flex{flex:1 1 2em;min-width:1em;height:0.9em;background:
  repeating-linear-gradient(to right,currentColor 0 1px,transparent 1px 0.55em) center bottom/100% 0.45em no-repeat,
  linear-gradient(currentColor,currentColor) left bottom/100% 1px no-repeat}
.decor-ticks.is-wide{flex:none;width:100%;height:0.9em;background:
  repeating-linear-gradient(to right,currentColor 0 1px,transparent 1px 0.55em) center bottom/100% 0.45em no-repeat,
  linear-gradient(currentColor,currentColor) left bottom/100% 1px no-repeat}
.decor-ticks.is-vertical{flex:1 1 2em;min-height:1em;width:0.9em;background:
  repeating-linear-gradient(to bottom,currentColor 0 1px,transparent 1px 0.55em) right center/0.45em 100% no-repeat,
  linear-gradient(currentColor,currentColor) right top/1px 100% no-repeat}

/* A strip: a band of marks in a row of its own, so nothing is beside it and
   nothing is behind it. */
.decor-strip{--span:12;display:flex;align-items:center;gap:0.9em;height:2.6em}
.decor-strip .decor-code{margin-left:auto}
.decor-strip-wrap{margin-top:5em}
.decor-strip-wrap + .site-footer{margin-top:1.4em}
/* Below the point where the grid folds to one column there is no room for a
   run of marks, so the strip keeps the hairline and the ring alone. */
@container page (width < 40em){
  .decor-strip{height:2.2em}
  .decor-strip .decor-bars,.decor-strip .decor-dots,.decor-strip .decor-chevrons{display:none}
}

/* The tag: pinned to the top right of a hero, on the line the breadcrumbs or
   the kicker leave empty. It goes once the page is narrow enough that the
   line might fill, which is well before it could reach the words. */
.home-hero,.hero{position:relative}
.decor-tag{position:absolute;top:2.5em;right:var(--margin);display:flex;align-items:center;gap:0.7em}
.decor-tag .decor-ring{width:1.6em;height:1.6em}
.decor-tag .decor-bars{width:3.2em;height:0.9em}
@container page (width < 62em){.decor-tag{display:none}}

/* The reticle: the mark that registers a part's number, in the three columns
   the number has to itself. It goes when the number does. */
.decor-reticle{display:flex;flex-direction:column;align-items:flex-start;gap:1em;margin-top:2.6em}
.decor-reticle .decor-ring{width:4.4em;height:4.4em}
.decor-reticle .decor-chevrons{width:3em;height:1em}

/* The rails: a column of marks in each margin, shown only where the page is
   wide enough that they stand clear of the shell. They are fixed, so they
   stay with the reader as a drawing's border would. */
.decor-rail{position:fixed;top:0;bottom:0;width:2.6em;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding-block:2.4em;z-index:0}
.decor-rail.is-left{right:calc(50vw + 40em + 0.5em)}
.decor-rail.is-right{left:calc(50vw + 40em + 0.5em)}
@container page (width < 87em){.decor-rail{display:none}}

/* High contrast keeps to black, white, cyan and yellow, and nothing here
   carries meaning, so it draws none of it; forced colours do the same. */
.theme-contrast .decor{display:none}
@media (forced-colors:active){.decor{display:none}}

/* Windows high contrast and other forced colours: keep edges and rings. */
@media (forced-colors:active){
  .calc-bar-after{background:CanvasText;forced-color-adjust:none}
  .calc-bar-now,.calc-days,.calc-result{border-color:CanvasText}
  .header-btn,.choice,.btn-line,.toc-toggle,.deep-state,.pager-link,.part-card,.flow-box,.plain,.deep,.myth,.figure,.setting,.parts-item,.route,.legend li{border-color:CanvasText}
  .reader :focus-visible{outline-color:Highlight}
  .seq-step{border-bottom-color:CanvasText}
}
@media (prefers-reduced-motion:reduce){.reader *{transition:none!important;animation:none!important;scroll-behavior:auto!important}}
@media print{.site-header,.toc,.pager,.site-footer,.skip-link,.hero-num,.decor{display:none}.deep-body[hidden]{display:block}.reader{background:#fff;color:#000}}
`;
}
