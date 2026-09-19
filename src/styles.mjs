// The site's stylesheet. Every size is in em, so the text size setting and
// the reader's own browser settings scale the whole page, and every layout
// switch is a container query in em, so a page reflows when its text grows
// as well as when its window shrinks. Colours come only from tokens.mjs.

import { THEMES, THEME_ORDER } from './tokens.mjs';

export const FONT_LINK =
  'https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Mono:wght@400;700&family=Atkinson+Hyperlegible+Next:ital,wght@0,400;0,700;0,800;1,400&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400&display=swap';

const VAR_NAMES = {
  bg: '--bg',
  sunk: '--sunk',
  surface: '--surface',
  ink: '--ink',
  ink2: '--ink-2',
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
  plainLabel: '--plain-label',
  deepBg: '--deep-bg',
  deepEdge: '--deep-edge',
  deepLabel: '--deep-label',
  trueInk: '--true-ink',
  falseInk: '--false-ink',
  sayInk: '--say-ink',
  codeBg: '--code-bg',
  codeNote: '--code-note',
  zebra: '--zebra',
  select: '--select',
  selectInk: '--select-ink',
};

function themeBlocks() {
  return THEME_ORDER.map((name) => {
    const t = THEMES[name];
    const vars = Object.entries(VAR_NAMES)
      .map(([k, v]) => `${v}:${t[k]}`)
      .join(';');
    return `.theme-${name}{${vars};color-scheme:${name === 'dark' || name === 'contrast' ? 'dark' : 'light'}}`;
  }).join('\n');
}

function swatches() {
  return THEME_ORDER.map((name) => `.swatch-${name}{background:${THEMES[name].bg};color:${THEMES[name].ink}}`).join(
    '\n',
  );
}

export function stylesheet() {
  return `
body{margin:0}
${themeBlocks()}
${swatches()}
.reader{
  --base:1.25rem;--scale:1;--face-scale:1;--lh:1.6;--para:1.2em;--measure-em:30em;--measure-face:1;--measure:calc(var(--measure-em) * var(--measure-face));--wide:46em;
  --font-body:'Atkinson Hyperlegible Next','Atkinson Hyperlegible',system-ui,-apple-system,'Segoe UI',sans-serif;
  --font-display:'Newsreader','Iowan Old Style','Palatino Linotype',Georgia,serif;
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
/* Line lengths are held under 80 characters (1.4.8). The serif face fits
   about a tenth more characters into the same width, so it gets less. */
.measure-short{--measure-em:26em}.measure-long{--measure-em:32em}
.font-serif{--font-body:'Newsreader','Iowan Old Style','Palatino Linotype',Georgia,serif;--face-scale:1.08;--measure-face:0.9}
.reader ::selection{background:var(--select);color:var(--select-ink)}

.page{container:page / inline-size}
.shell{width:100%;max-width:80em;margin-inline:auto;padding-inline:2.5em}
@container page (width < 48em){.shell{padding-inline:1em}.figure{padding-inline:1em}}
.sr-only{position:absolute!important;width:1px!important;height:1px!important;margin:-1px!important;padding:0!important;overflow:hidden!important;clip:rect(0 0 0 0)!important;clip-path:inset(50%)!important;white-space:nowrap!important;border:0!important}
.icon{width:1.15em;height:1.15em;flex:none;vertical-align:-0.2em}

/* Links. Underlined wherever they sit in running text, so colour is never
   the only sign of a link (1.4.1). */
.reader a{color:var(--link);text-decoration-line:underline;text-decoration-thickness:0.075em;text-underline-offset:0.2em}
.reader a:hover{color:var(--hover);text-decoration-thickness:0.15em}
.article a:visited{color:var(--visited)}
.reader a.ext .icon{width:0.8em;height:0.8em;margin-left:0.2em;vertical-align:0}

/* Focus: a 3px ring well clear of the element, in a colour at 3:1 or more
   against every surface (2.4.7, 2.4.13), and a highlighter behind links. */
.reader :focus{outline:none}
.reader :focus-visible{outline:3px solid var(--focus);outline-offset:3px}
.reader a:focus-visible{outline-offset:2px;background:var(--focus-bg);color:var(--focus-ink);box-shadow:0 0 0 2px var(--focus-bg);text-decoration-thickness:0.12em;border-radius:2px}
.reader main:focus-visible,.reader [tabindex="-1"]:focus-visible{outline:none}

.skip-link{position:absolute;left:1em;top:1em;z-index:20;padding:0.75em 1.25em;min-height:44px;background:var(--focus-bg);color:var(--focus-ink)!important;font-weight:800;border-radius:8px;transform:translateY(-300%)}
.skip-link:focus,.skip-link:focus-visible{transform:none}

/* Header */
.site-header{position:relative;background:var(--bg);border-bottom:1px solid var(--rule)}
.header-bar{display:flex;align-items:center;justify-content:space-between;gap:0.75em 1.5em;min-height:4.75em;padding-block:0.6em}
.reader .wordmark{display:inline-flex;align-items:center;min-height:44px;font-family:var(--font-display);font-weight:600;font-size:1.35em;line-height:1.15;letter-spacing:-0.005em;color:var(--ink);text-decoration:none}
.reader .wordmark:hover{text-decoration:underline;text-decoration-thickness:0.06em;color:var(--ink)}
.header-actions{display:flex;flex-wrap:wrap;gap:0.6em}
.header-btn,.btn-line,.toc-toggle{font:inherit;color:var(--ink);cursor:pointer}
.header-btn{display:inline-flex;align-items:center;gap:0.55em;min-height:48px;padding:0.45em 1.1em 0.45em 0.95em;border:2px solid var(--edge);border-radius:999px;background:var(--surface);font-weight:700;font-size:0.95em;line-height:1.2}
.header-btn:hover{border-color:var(--ink)}
.header-btn[aria-expanded="true"]{background:var(--ink);color:var(--bg);border-color:var(--ink)}
@container page (width < 40em){
  .header-bar{flex-wrap:wrap;padding-block:0.75em}
  .header-actions{width:100%}
  .header-btn{flex:1 1 0;justify-content:center;border-radius:14px;padding-inline:0.7em;gap:0.4em;text-align:left}
}

/* Panels opened from the header */
.panel{background:var(--sunk);border-top:1px solid var(--rule)}
.panel-inner{padding-block:1.75em 2em}
.panel-head{display:flex;flex-wrap:wrap;align-items:baseline;gap:0.25em 1.25em;margin-bottom:1.25em}
.panel-title{font-family:var(--font-display);font-weight:600;font-size:1.6em;line-height:1.2;margin:0}
.panel-note{margin:0;color:var(--ink-2)}
.panel-actions{display:flex;flex-wrap:wrap;gap:0.75em;margin-top:1.5em}
.btn-line{display:inline-flex;align-items:center;gap:0.5em;min-height:48px;padding:0.5em 1.1em;border:2px solid var(--edge);border-radius:999px;background:var(--surface);font-weight:700;line-height:1.2}
.btn-line:hover{border-color:var(--ink)}
.settings-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(17em,100%),1fr));gap:1.5em 2.5em}
.setting{margin:0;padding:0;border:0;min-width:0}
.setting-legend{padding:0;margin:0 0 0.6em;font-weight:800}
.choices{display:flex;flex-wrap:wrap;gap:0.5em}
.choice{display:inline-flex;align-items:center;gap:0.55em;min-height:48px;padding:0.35em 0.95em 0.35em 0.75em;border:2px solid var(--edge);border-radius:12px;background:var(--surface);cursor:pointer;line-height:1.25}
.choice:hover{border-color:var(--ink)}
.choice:has(input:checked){border-color:var(--ink);box-shadow:inset 0 0 0 1px var(--ink);font-weight:800}
.choice:has(input:focus-visible){outline:3px solid var(--focus);outline-offset:3px}
.choice input{width:1.15em;height:1.15em;margin:0;flex:none;accent-color:var(--link)}
.choice input:focus-visible{outline:none}
.swatch{display:inline-grid;place-items:center;width:1.9em;height:1.9em;border-radius:8px;border:1px solid var(--edge);font-family:var(--font-display);font-weight:600;font-size:0.95em;line-height:1}
.parts-intro{margin:0 0 1em}
.reader .parts-home{display:inline-flex;align-items:center;gap:0.5em;min-height:44px;font-weight:700}
.parts-list{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(21em,1fr));gap:0.75em 1.5em}
.parts-item{margin:0;display:flex;flex-direction:column;gap:0.1em;padding:0.8em 1em;border-radius:12px;background:var(--surface);border:1px solid var(--rule)}
.parts-item.is-current{border:2px solid var(--ink)}
.reader .parts-link{display:flex;flex-direction:column;min-height:44px;color:var(--ink);text-decoration:none}
.reader .parts-link:hover .parts-title{text-decoration-thickness:0.15em}
.parts-num{font-size:0.9em;font-weight:700;color:var(--ink-2)}
.parts-title{font-weight:800;color:var(--link);text-decoration:underline;text-decoration-thickness:0.075em;text-underline-offset:0.2em}
.parts-time{font-size:0.9em;color:var(--ink-2)}
.parts-here{font-weight:800;color:var(--ink)}

/* Part hero */
.hero{min-width:0;padding-block:1.75em 2.5em;border-bottom:1px solid var(--rule)}
.crumbs ol{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;align-items:center;gap:0 0.5em;font-size:0.95em}
.crumbs li{display:flex;align-items:center;gap:0.5em;margin:0}
.reader .crumbs a{display:inline-flex;align-items:center;min-height:44px}
.reader .crumbs a[aria-current]{color:var(--ink);text-decoration:none;font-weight:700}
.crumb-sep{color:var(--ink-2)}
.eyebrow{margin:1.25em 0 0.5em;font-weight:800;color:var(--ink-2);font-size:1em}
.title{font-family:var(--font-display);font-weight:600;font-size:3.4em;line-height:1.05;letter-spacing:-0.015em;margin:0;max-width:17em;text-wrap:balance}
.title-sub{display:block;margin-top:0.4em;font-size:0.5em;line-height:1.2;font-weight:500;letter-spacing:0;color:var(--ink-2)}
.hero-meta{list-style:none;margin:1.5em 0 0;padding:0;display:flex;flex-wrap:wrap;gap:0.5em 1.75em;color:var(--ink-2);font-weight:700}
.hero-meta li{display:flex;align-items:center;gap:0.45em;margin:0}
.outcome{display:flex;gap:0.75em;align-items:flex-start;margin:1.75em 0 0;padding:1em 1.25em;max-width:calc(var(--measure) + 3em);background:var(--surface);border:1px solid var(--rule);border-radius:16px}
.outcome .icon{margin-top:0.2em;color:var(--ink-2)}
.outcome p{margin:0}
@container page (width < 48em){.title{font-size:2.3em}.hero{padding-block:1em 2em}}

/* Contents and article */
.layout{display:grid;grid-template-columns:minmax(0,1fr);gap:2.5em;padding-block:0 1em}
.toc{font-size:0.95em}
.toc-title{margin:0;font-family:var(--font-body);font-size:1em;line-height:1.3}
.toc-static{display:none}
.toc-toggle{display:flex;width:100%;align-items:center;justify-content:space-between;gap:1em;min-height:52px;padding:0.6em 1.1em;border:2px solid var(--edge);border-radius:12px;background:var(--surface);font-weight:800;text-align:left}
.toc-toggle:hover{border-color:var(--ink)}
.toc-toggle[aria-expanded="true"] .chev{transform:rotate(180deg)}
.toc-list{list-style:none;margin:0.75em 0 0;padding:0}
.toc-list li{margin:0}
.reader .toc-list a{display:flex;gap:0.6em;align-items:baseline;min-height:44px;padding:0.55em 0.6em;border-radius:8px;color:var(--ink);text-decoration:none;line-height:1.35}
.reader .toc-list a:hover{background:var(--sunk);text-decoration:underline;color:var(--ink)}
.toc-num{flex:none;min-width:1.5em;color:var(--ink-2);font-weight:700;font-variant-numeric:tabular-nums}
@container page (width >= 62em){
  .layout{grid-template-columns:15em minmax(0,1fr);grid-template-areas:". hero" "toc article";gap:3em 4.5em;padding-block:0 1em}
  .hero{grid-area:hero}
  .article{grid-area:article}
  .toc{grid-area:toc}
  .toc{position:sticky;top:1.5em;align-self:start;max-height:calc(100vh - 3em);overflow-y:auto;padding:0.25em 0.5em 0.5em 0}
  .toc-static{display:block;font-weight:800;padding:0 0.6em}
  .toc-toggle{display:none}
  .toc-list[hidden]{display:block}
}

.article{min-width:0;max-width:var(--wide)}
.article > section{margin-top:5em}
.article > section:first-child{margin-top:0}
.article p{margin:0 0 var(--para);max-width:var(--measure)}
.prose-list{margin:0 0 var(--para);padding-left:1.35em;max-width:var(--measure)}
.prose-list > li{margin:0 0 0.9em;padding-left:0.25em}
.prose-list > li::marker{color:var(--ink-2);font-weight:700}
.prose-list > li > p{margin-bottom:0.6em}
.article strong{font-weight:800}
.reader code{font-family:var(--font-mono);font-size:0.88em;background:var(--code-bg);padding:0.08em 0.3em;border-radius:4px;white-space:pre;box-shadow:inset 0 0 0 1px var(--rule)}
.reader sup{font-size:0.7em;line-height:0;vertical-align:0.55em}
.sec-title{font-family:var(--font-display);font-weight:600;font-size:2.15em;line-height:1.15;letter-spacing:-0.01em;margin:0 0 0.8em;max-width:19em;text-wrap:balance;scroll-margin-top:1em}
.sec-num{color:var(--ink-2);font-weight:500}
.article h3{font-family:var(--font-body);font-weight:800;font-size:1.3em;line-height:1.3;margin:2.2em 0 0.6em;max-width:var(--measure);scroll-margin-top:1em}
.article h4{font-weight:800;font-size:1.1em;line-height:1.35;margin:1.8em 0 0.4em;max-width:var(--measure)}
@container page (width < 48em){.sec-title{font-size:1.75em}.article h3{font-size:1.2em}.article > section{margin-top:4em}}

/* In plain terms */
.plain{margin:0 0 2.25em;padding:1.25em 1.5em 1.3em;max-width:calc(var(--measure) + 3em);background:var(--plain-bg);border:1px solid var(--plain-edge);border-radius:18px}
.plain-label{display:flex;align-items:center;gap:0.5em;margin:0 0 0.45em!important;font-weight:800;color:var(--plain-label)}
.article .plain-summary{font-size:1.07em;margin:0 0 0.9em}
.article .plain-who{margin:0;padding-top:0.85em;border-top:1px solid var(--plain-edge)}

/* Deep dives */
.deep{margin:2.5em 0;max-width:calc(var(--measure) + 3em);background:var(--deep-bg);border:1px solid var(--deep-edge);border-radius:18px}
.article .deep-heading{margin:0;font-size:1em;max-width:none}
.deep-toggle{font:inherit;color:inherit;display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:0.2em 1em;width:100%;min-height:56px;padding:1em 1.25em;margin:0;border:0;border-radius:18px;background:none;text-align:left;cursor:pointer}
.deep-kicker{grid-column:1;display:flex;align-items:center;gap:0.45em;font-size:0.9em;font-weight:800;color:var(--deep-label)}
.deep-optional{font-weight:700}
.deep-title{grid-column:1;font-size:1.2em;font-weight:800;line-height:1.3}
.deep-state{grid-column:2;grid-row:1 / span 2;display:inline-flex;align-items:center;gap:0.35em;min-height:44px;padding:0.3em 0.85em;border:2px solid var(--edge);border-radius:999px;background:var(--surface);font-weight:800;color:var(--ink)}
.deep-toggle:hover .deep-state{border-color:var(--ink)}
.deep-toggle[aria-expanded="true"] .when-closed,.deep-toggle[aria-expanded="false"] .when-open{display:none}
.deep-toggle[aria-expanded="true"] .chev{transform:rotate(180deg)}
.deep-body{padding:0.25em 1.5em 1.5em}
.deep-body > :last-child{margin-bottom:0}
.deep-body .table-wrap,.deep-body .code-block{max-width:100%}
/* On a phone the Show button moves under the title, so the title keeps the width. */
@container page (width < 40em){.deep-toggle{grid-template-columns:minmax(0,1fr)}.deep-state{grid-column:1;grid-row:auto;justify-self:start;margin-top:0.5em}}

/* Misconceptions */
.myth{margin:2em 0 2.25em;padding:1.5em 1.5em 1.4em;max-width:calc(var(--measure) + 3em);background:var(--surface);border:1px solid var(--rule);border-radius:18px}
.article .myth-claim{font-family:var(--font-display);font-weight:600;font-size:1.65em;line-height:1.2;margin:0 0 0.85em;letter-spacing:-0.005em}
.myth-parts{margin:0;display:grid;gap:1.1em}
.myth-part dt{display:flex;align-items:center;gap:0.45em;margin:0 0 0.15em;font-weight:800;font-size:0.95em}
.myth-part dd{margin:0}
.is-true dt{color:var(--true-ink)}
.is-misleading dt{color:var(--false-ink)}
.is-say dt{color:var(--say-ink)}
.is-say dd{padding:0.85em 1.1em;background:var(--sunk);border-radius:12px;font-size:1.04em}

/* Tables: a table on wide screens, a stack of labelled cards on narrow ones.
   The role attributes keep the table's meaning when CSS changes its display. */
.table-wrap{margin:1.5em 0 2.25em;max-width:var(--wide)}
.data{width:100%;border-collapse:collapse;font-size:0.92em;line-height:1.55;font-variant-numeric:tabular-nums}
.data th,.data td{text-align:left;vertical-align:top;padding:0.8em 1.2em 0.8em 0;border-bottom:1px solid var(--rule)}
.data th:last-child,.data td:last-child{padding-right:0}
.data thead th{font-weight:800;border-bottom:2px solid var(--ink);padding-top:0;vertical-align:bottom}
.data thead td{border-bottom:2px solid var(--ink)}
.data tbody th{font-weight:800}
.data.two-ways tbody th{width:22%}
.data.is-compact{width:auto;min-width:min(100%,24em)}
.cell-label{display:none}
@container page (width < 44em){
  .data,.data tbody,.data tr,.data th,.data td{display:block;width:auto}
  .data thead{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
  .data tbody tr{margin:0 0 1em;padding:0.9em 1.1em;background:var(--surface);border:1px solid var(--rule);border-radius:14px}
  .data th,.data td{padding:0.2em 0;border:0}
  .data tbody th{font-size:1.05em;padding-bottom:0.35em}
  .data.two-ways tbody th{width:auto}
  .data td + td,.data th + td{padding-top:0.55em}
  .cell-label{display:block;font-size:0.9em;font-weight:800;color:var(--ink-2)}
  .data td.is-empty{display:none}
}

/* Code */
.code-block{margin:1.5em 0 2.25em;max-width:var(--wide)}
.code-cap{margin:0 0 0.4em!important;font-size:0.9em;font-weight:800;color:var(--ink-2)}
.code{margin:0;padding:1em 1.25em;overflow-x:auto;background:var(--code-bg);border:1px solid var(--rule);border-radius:14px;font-family:var(--font-mono);font-size:0.86em;line-height:1.65;tab-size:4;white-space:pre}
.code code{background:none;padding:0;font-size:1em;border-radius:0;white-space:inherit;box-shadow:none}
.c-note{color:var(--code-note)}

/* Figures redrawn from the course's diagrams */
.figure{margin:2em 0 2.5em;padding:1.4em 1.75em 1.5em;max-width:min(var(--wide),100%);background:var(--surface);border:1px solid var(--rule);border-radius:18px}
.figure-cap{margin:0 0 1.1em;font-weight:800;font-size:1em}
.flow-column{width:fit-content;min-width:min(100%,24em)}
.flow-steps{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;align-items:flex-start}
.flow-step{margin:0;padding:0;max-width:100%;display:flex;flex-direction:column;align-items:flex-start}
.flow-box{display:inline-flex;max-width:100%;align-items:center;gap:0.6em;padding:0.5em 1em 0.5em 0.55em;border:2px solid var(--edge);border-radius:12px;background:var(--bg);font-size:0.95em;line-height:1.35}
.flow-n{display:inline-grid;place-items:center;flex:none;min-width:1.75em;height:1.75em;padding:0 0.3em;border-radius:999px;background:var(--ink);color:var(--bg);font-size:0.8em;font-weight:800;line-height:1}
.flow-box.is-add{padding-left:0.45em;border-style:dashed}
.flow-plus{display:inline-grid;place-items:center;flex:none;width:1.75em;height:1.75em;border-radius:999px;border:2px solid var(--ink);font-weight:800;line-height:1}
.flow-note{color:var(--ink-2)}
.flow-text{min-width:0}
.flow-tag{display:inline-block;margin-left:0.2em;padding:0.1em 0.55em;border-radius:999px;background:var(--plain-bg);color:var(--plain-label);font-size:0.85em;font-weight:800}
.flow-arrow{display:flex;padding:0.3em 0 0.3em 0.75em;color:var(--ink-2)}
.flow-inputs{margin:0}
.flow-inputs-label{margin:0 0 0.5em;font-size:0.95em;color:var(--ink-2);font-weight:700}
.flow-input-list{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:0.5em}
.flow-input-list li{margin:0}
.flow-box.is-input{padding-left:1em}
.flow-loop{display:flex;align-items:flex-start;gap:0.6em;margin:1.1em 0 0!important;padding-top:1em;border-top:2px dashed var(--rule);font-size:0.95em}
.flow-loop .icon{margin-top:0.2em;color:var(--ink-2)}
.lane + .lane{margin-top:1.25em;padding-top:1.25em;border-top:1px solid var(--rule)}
.lane-label{margin:0 0 0.6em!important;font-weight:700;color:var(--ink-2);font-size:0.95em}
.flow-row .flow-steps{flex-direction:row;flex-wrap:wrap;align-items:center;row-gap:0.6em}
.flow-row .flow-step{flex-direction:row;align-items:center}
.flow-row .flow-arrow{padding:0 0.3em;transform:rotate(-90deg)}
@container page (width < 50em){
  .flow-row .flow-steps{flex-direction:column;align-items:flex-start}
  .flow-row .flow-step{flex-direction:column;align-items:flex-start}
  .flow-row .flow-arrow{padding:0.3em 0 0.3em 0.75em;transform:none}
}

/* The sequence diagram: three lifelines on wide screens, a numbered list of
   messages that says who sends what to whom on narrow ones. */
.seq-heads{display:none}
.seq-steps{list-style:none;margin:0;padding:0;display:grid;gap:0.75em}
.seq-step{margin:0;display:flex;flex-direction:column;gap:0.15em;padding:0.7em 1em;border:2px solid var(--edge);border-radius:12px;background:var(--bg)}
.seq-route{font-size:0.9em;font-weight:700;color:var(--ink-2)}
.seq-msg{font-weight:700}
@container page (width >= 50em){
  .seq-heads{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0;margin-bottom:0.25em}
  .seq-head{justify-self:center;padding:0.4em 0.9em;border:2px solid var(--edge);border-radius:10px;background:var(--bg);font-weight:800;font-size:0.9em;text-align:center}
  .seq-steps{grid-template-columns:repeat(3,minmax(0,1fr));gap:0;padding-block:0.5em;
    background-image:linear-gradient(var(--rule),var(--rule)),linear-gradient(var(--rule),var(--rule)),linear-gradient(var(--rule),var(--rule));
    background-size:2px 100%;background-repeat:no-repeat;background-position:16.667% 0,50% 0,83.333% 0}
  .seq-step{position:relative;border:0;border-radius:0;background:none;padding:0.55em 0 0.7em;text-align:center;border-bottom:2px solid var(--ink)}
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
.glossary{margin:1.25em 0 0;max-width:var(--wide);border-top:2px solid var(--ink)}
.gl-row{display:grid;grid-template-columns:13em minmax(0,1fr);gap:0.2em 2em;padding:0.9em 0;border-bottom:1px solid var(--rule)}
.gl-row dt{font-weight:800}
.gl-row dd{margin:0;max-width:var(--measure)}
@container page (width < 44em){.gl-row{grid-template-columns:minmax(0,1fr)}}

/* Questions and answers */
.qa{margin:1.75em 0 2em}
.article .qa-q{margin:0 0 0.35em;font-size:1.12em}

/* Previous and next */
.pager{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1em;margin:5em 0 0;max-width:var(--wide)}
.reader .pager-link{display:flex;flex-direction:column;gap:0.25em;min-height:44px;padding:1em 1.25em;border:2px solid var(--edge);border-radius:16px;background:var(--surface);color:var(--ink);text-decoration:none}
.reader .pager-link:hover{border-color:var(--ink);color:var(--ink)}
.reader .pager-link:hover .pager-title{text-decoration-thickness:0.15em}
.pager-dir{display:flex;align-items:center;gap:0.4em;font-size:0.92em;font-weight:700;color:var(--ink-2)}
.pager-title{font-weight:800;color:var(--link);text-decoration:underline;text-decoration-thickness:0.075em;text-underline-offset:0.2em}
.reader .pager-link.is-next{grid-column:2;align-items:flex-end;text-align:right}
@container page (width < 40em){.pager{grid-template-columns:minmax(0,1fr)}.reader .pager-link.is-next{grid-column:1}}

/* Footer */
.site-footer{margin-top:5em;padding-block:3em 3.5em;background:var(--sunk);border-top:1px solid var(--rule)}
.footer-title{margin:0 0 0.75em;font-family:var(--font-display);font-weight:600;font-size:1.35em}
.footer-links{list-style:none;margin:0 0 1.25em;padding:0;display:flex;flex-wrap:wrap;gap:0 1.75em}
.footer-links li{margin:0}
.reader .footer-links a{display:inline-flex;align-items:center;min-height:44px}
.footer-note{margin:0;max-width:var(--measure);color:var(--ink-2)}

/* Home */
.home-hero{padding-block:4em 4.5em}
.home-kicker{margin:0 0 1em;font-weight:800;color:var(--ink-2)}
.home-title{font-family:var(--font-display);font-weight:600;font-size:5.6em;line-height:0.98;letter-spacing:-0.025em;margin:0;max-width:14em;text-wrap:balance}
.hero-grid{display:grid;grid-template-columns:minmax(0,1fr);gap:1.75em;margin-top:1.75em}
.home-lede{margin:0;max-width:30em;font-size:1.3em;line-height:1.5}
.home-meta{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:0.5em 1.75em;color:var(--ink-2);font-weight:700}
.home-meta li{display:flex;align-items:center;gap:0.45em;margin:0}
.cta-row{display:flex;flex-wrap:wrap;align-items:center;gap:1em;margin-top:1.75em}
@container page (width >= 62em){
  .hero-grid{grid-template-columns:minmax(0,30em) minmax(0,1fr);gap:5em;margin-top:2.25em;padding-top:2.25em;border-top:1px solid var(--rule)}
  .hero-side{display:flex;flex-direction:column;gap:1.75em;justify-self:start;padding-top:0.3em}
  .home-meta{flex-direction:column;gap:0.8em}
  .hero-side .cta-row{flex-direction:column;align-items:flex-start;margin-top:0}
}
.reader .btn-primary{display:inline-flex;align-items:center;gap:0.6em;min-height:3.1em;padding:0.65em 1.5em;border:2px solid var(--link);border-radius:999px;background:var(--link);color:var(--on-accent);font-weight:800;text-decoration:none}
.reader .btn-primary:hover{background:var(--hover);border-color:var(--hover);color:var(--on-accent)}
.reader .btn-quiet{display:inline-flex;align-items:center;gap:0.5em;min-height:3.1em;padding:0.65em 1.3em;border:2px solid var(--edge);border-radius:999px;color:var(--ink);font-weight:700;text-decoration:none}
.reader .btn-quiet:hover{border-color:var(--ink);color:var(--ink)}
.home-section{padding-block:4.5em;border-top:1px solid var(--rule)}
.home-h2{font-family:var(--font-display);font-weight:600;font-size:2.5em;line-height:1.1;letter-spacing:-0.01em;margin:0 0 0.6em;scroll-margin-top:1em}
.home-section p{max-width:var(--measure);margin:0 0 var(--para)}
.split{display:grid;grid-template-columns:minmax(0,1fr);gap:0.5em 3em}
@container page (width >= 62em){.split{grid-template-columns:16em minmax(0,1fr)}.split .home-h2{font-size:2.2em}}
.halves{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:2.5em 3em;margin-top:2.5em}
.half-title{margin:0 0 1em;font-size:1.15em;font-weight:800;color:var(--ink-2)}
.part-cards{list-style:none;margin:0;padding:0;display:grid;gap:1em}
.part-card{position:relative;margin:0;display:grid;grid-template-columns:auto minmax(0,1fr);gap:0.3em 1.25em;padding:1.3em 1.5em;background:var(--surface);border:2px solid var(--edge);border-radius:18px}
.part-card:hover{border-color:var(--ink)}
.part-card:focus-within{outline:3px solid var(--focus);outline-offset:3px}
.part-num{grid-row:1 / span 3;font-family:var(--font-display);font-weight:500;font-size:3.2em;line-height:0.9;color:var(--ink-2)}
.part-title{margin:0;font-size:1.3em;line-height:1.25;font-weight:800}
.reader .part-title a{color:var(--link)}
.reader .part-title a::after{content:'';position:absolute;inset:0;border-radius:16px}
.reader .part-title a:focus-visible{outline:none;background:none;box-shadow:none;color:var(--link)}
.home-section .part-outcome{margin:0}
.part-time{display:flex;align-items:center;gap:0.4em;margin:0.2em 0 0!important;font-size:0.92em;font-weight:700;color:var(--ink-2)}
.ideas{list-style:none;margin:2.25em 0 0;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:2.5em 3.5em}
.idea{margin:0;display:grid;grid-template-columns:auto minmax(0,1fr);gap:0 1.1em}
.idea-num{font-family:var(--font-display);font-weight:500;font-size:3.4em;line-height:0.85;color:var(--plain-label)}
.home-section .idea p{margin:0}
.idea-lead{display:block;margin-bottom:0.35em;font-size:1.12em}
.legend{list-style:none;margin:2.25em 0 var(--para);padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1.25em 2.5em}
.legend li{margin:0;display:grid;grid-template-columns:8.75em minmax(0,1fr);gap:1.25em;align-items:start}
.home-section .legend p{margin:0}
.specimen{display:flex;flex-direction:column;justify-content:center;gap:0.3em;min-height:4.4em;padding:0.6em 0.75em;border-radius:12px;border:1px solid var(--rule);background:var(--surface);font-size:0.78em;font-weight:800;line-height:1.25}
.specimen .icon{width:1.2em;height:1.2em}
.spec-row{display:flex;align-items:center;gap:0.35em}
.specimen.is-plain{background:var(--plain-bg);border-color:var(--plain-edge);color:var(--plain-label)}
.specimen.is-deep{background:var(--deep-bg);border-color:var(--deep-edge);color:var(--deep-label)}
.specimen.is-text{font-family:var(--font-display);font-weight:500;font-size:1.6em;align-items:center}
.spec-true{color:var(--true-ink)}.spec-false{color:var(--false-ink)}.spec-say{color:var(--say-ink)}
.routes{list-style:none;margin:2.25em 0 0;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1.25em}
.route{margin:0;padding:1.4em 1.5em;background:var(--surface);border:1px solid var(--rule);border-radius:18px}
.route-reader{margin:0 0 0.5em;font-size:1.2em;line-height:1.3;font-weight:800}
.home-section .route p{margin:0}
.currency{padding:1.4em 1.6em;background:var(--sunk);border-radius:18px;max-width:calc(var(--measure) + 3.2em)}
.home-section .currency p:last-child{margin-bottom:0}
@container page (width < 62em){.halves,.ideas,.legend,.routes{grid-template-columns:minmax(0,1fr)}}
@container page (width < 48em){.home-title{font-size:3em}.home-lede{font-size:1.15em}.home-h2{font-size:1.9em}.home-hero{padding-block:2.5em 3em}.home-section{padding-block:3.25em}.legend li{grid-template-columns:minmax(0,1fr);gap:0.6em}.specimen{max-width:12em}}

/* Windows high contrast and other forced colours: keep edges and rings. */
@media (forced-colors:active){
  .header-btn,.choice,.btn-line,.toc-toggle,.deep-state,.pager-link,.part-card,.flow-box{border-color:CanvasText}
  .reader :focus-visible{outline-color:Highlight}
  .seq-step{border-bottom-color:CanvasText}
}
@media (prefers-reduced-motion:reduce){.reader *{transition:none!important;animation:none!important;scroll-behavior:auto!important}}
@media print{.site-header,.toc,.pager,.site-footer,.skip-link{display:none}.deep-body[hidden]{display:block}.reader{background:#fff;color:#000}}
`;
}
