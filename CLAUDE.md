# How Frontier LLMs Work: the course website

The course is the seven markdown files at the top of this folder. Its name
is the introduction's heading, and the code reads it from there. The code
here builds the markdown into a website on a Claude Design canvas, at
https://claude.ai/artifact/MedAhUDsLXE6G1apbxFAHk, held to WCAG 2.2 AAA
except the readable-language criteria (3.1.3 to 3.1.6), and made to be as
easy to read as possible. The look is Brutalist graphic design: a pale grey
ground, near-black type and heavy rules, International Klein Blue and a
signal yellow, Archivo 900 for titles over Atkinson Hyperlegible Next for
reading, IBM Carbon icons, square blocks, and a twelve-column grid. Plain
JavaScript modules, marked for the markdown, Playwright and axe-core for
the checks. The house rules in `~/.claude/CLAUDE.md` apply too. This file
was written on 19 September 2026 from what the code does at that date.

## What the site promises, and what holds it

- **Legible in every theme.** Every text colour is 7:1 or better against
  everything it sits on, in all four themes, and every control edge and
  focus ring 3:1 or better. `contrast` holds it.
- **Accessible.** axe-core's WCAG A, AA and AAA rules and its best
  practices find nothing, on every page, in every theme, with the panels
  and deep dives open. `audit` holds it.
- **Lines a reader can choose.** Short keeps every line of running text
  within 80 characters (1.4.8), at any text size or typeface, and offering
  it is how the site meets that criterion. Standard, the default, is half as
  wide again and Long twice as wide, each capped by its column, for readers
  who want more on a line. `audit` holds the 80 and the proportions.
- **Any size, any spacing.** No sideways scrolling at 320px wide or at
  200% zoom (1.4.10), and nothing clipped under the 1.4.12 spacing
  overrides. `audit`.
- **Operable.** Every control outside a sentence is 44 by 44 or larger
  (2.5.5); every Tab stop has a ring and is never covered (2.4.7, 2.4.11 to
  2.4.13), and its text keeps 7:1 against the focus highlighter in every
  theme; one h1 and no skipped heading levels. `audit`.
- **The contents follow the reader.** On a part page the section being read
  is bold in the contents and marked `aria-current="location"`, the sections
  already passed are dimmed at 7:1 or better, and the list never changes
  height as it follows. `audit` holds it.
- **On the grid.** At desktop width the page lays out on twelve equal
  columns, stepping to six and then one; every grid of blocks is one height
  at every width; no corner is rounder than 2px. `audit` holds it.
- **Saved settings keep loading.** Every shape of a reader's saved settings
  still loads as the settings grow. `audit` holds it.
- **True to the markdown.** Every section, block, inline token and diagram
  the parser meets is one it knows, and every icon exists in Carbon; anything
  else stops the build. `build`.
- **One name.** The course is called what the introduction's heading calls
  it, in the wordmark, the footer, every page title and the canvas's title.
  `audit` holds it, and a heading without both the course's name and the
  page's stops the build.

## Gates and baselines

Baselines as of 19 September 2026, on this machine:

| Gate               | Holds                                   | Baseline                                    | Tolerance      |
| ------------------ | --------------------------------------- | ------------------------------------------- | -------------- |
| `contrast`         | 188 colour pairs, four themes           | lowest text pair 7.33:1, lowest edge 8.38:1 | none           |
| `audit`, axe       | 93 runs                                 | 0 violations, 0 needing review              | none           |
| `audit`, measure   | 7 pages × 3 setting mixes × 3 lengths   | Short's longest line 70; widths 1:1.5:2     | 80; 1% widths  |
| `audit`, targets   | 7 pages × desktop and phone             | all 44 × 44 or larger                       | none           |
| `audit`, reflow    | 7 pages × 320px and 200% zoom           | no sideways scroll                          | none           |
| `audit`, spacing   | 7 pages × desktop and phone             | nothing clipped                             | none           |
| `audit`, keyboard  | 7 pages × 2 widths, and 3 more themes   | 114 to 119 stops, ringed, uncovered, 7:1    | none           |
| `audit`, headings  | 7 pages × desktop and phone             | one h1, no skipped level                    | none           |
| `audit`, corners   | 7 pages, every panel and deep dive open | none rounder than 2px                       | none           |
| `audit`, grids     | 7 pages × desktop and phone             | blocks equal; 15 or 5 containers on 12 cols | 1px on heights |
| `audit`, storage   | 5 saved shapes                          | every one loads                             | none           |
| `audit`, numerals  | the home page in four themes            | the four ideas numbered in the text colour  | none           |
| `audit`, spy       | 6 parts × 3 frames × top, middle, end   | one current, earlier passed, no jumps       | none           |
| `audit`, name      | 7 pages and the canvas's index          | the heading's name wherever it is shown     | none           |
| `look`             | 16 boards                               | no errors; recorded heights match           | 2px on heights |
| `perf`, not a gate | render, fonts, repaint, scrolling       | see below                                   | not held       |

`perf` on this machine, two runs: render with fonts 251 to 395 ms, fonts
85 KB, a theme change 32 to 39 ms, opening every deep dive 19 to 33 ms, and
scrolling a part 1.1 to 2.0 ms of main-thread time a step, against 0.5 on
the home page, which has no contents to follow. A step on which the section
changes costs about 6 ms (worst 8.7), since the page redraws whole. Runs on
this machine swing by tens of milliseconds, so compare medians of two runs
each side before believing a change.

A gate that is red is fixed before anything else lands. `perf` prints
figures for the before-and-after in a report; nothing holds them yet, so a
slowdown is only caught by reading them.

## Commands

    npm run dev            build, then the site at http://127.0.0.1:5190 with the canvas runtime
    npm run build          the boards into dist/canvas, and a test copy into test-results/site
    npm run check:quick    formatting, lint, contrast, build (the pre-commit hook; ~1 s)
    npm run check          check:quick, look and the full audit (~3 min)
    npm run contrast       every colour pair in tokens.mjs against 7:1 and 3:1; --all prints them all
    npm run audit          the accessibility audit; report in test-results/audit-report.md
    npm run audit:quick    two themes and shorter keyboard walks (~2 min; line length takes most of it)
    npm run look           every board rendered: errors and stale heights fail it; pictures in test-results/shots
    npm run heights        build, record the showcase boards' natural heights, then build again
    npm run perf           render and repaint times, five runs each, medians

The audit takes `--only axe,measure,targets,reflow,spacing,keyboard,headings,corners,grids,storage,numerals,spy,name`,
`--pages Part1.dc.html,...` and `--mutate <name>`, which puts a known defect
into every page (`contrast`, `focus`, `targets`, `measure`, `widths`,
`reflow`, `spacing`, `headings`, `corners`, `grids`, `twelve`, `numerals`,
`spy`, `spybold`, `spydim`, `spyjump`, `pastfocus`, `focustext`, `name`) to
prove the check that should catch it still does.
`node scripts/look-parts.mjs <width> <File.dc.html> <selector>...` takes
pictures of single elements, with `--theme`, `--size` and the other
settings; `node scripts/tile.mjs <in.png> <out.png>` lays a tall phone
picture out in columns. Look at every picture.

## Publishing

The canvas is output. `npm run build` writes it to `dist/canvas`, and Claude
publishes it with the Artifact tool: `url` the canvas, `root` `dist/canvas`,
`file_path` `dist/canvas/project/canvas.json`, and `files` every
`project/*.dc.html` by that path. Publish only after `npm run check` is
green. Anything changed by hand on the canvas is overwritten by the next
publish, so read the canvas first and bring such changes into `src/`. The
canvas is private until it is shared from its Share menu.

## How the code is laid out

- **The course** is the markdown at the top. The build reads it and never
  writes it, and Prettier is told to leave it alone.
- `src/content.mjs` is the course without its picture: markdown into page
  models, with the course's devices recognised (In plain terms, deep dives,
  misconceptions, glossaries, questions and answers, bold lines that are
  really headings). It makes no HTML. It is handed the folder to read.
- `src/inline.mjs` sets inline text as a typesetter would (curly quotes, ×,
  superscripts) and turns `file/…` links into board links.
- `src/render.mjs` draws blocks, `src/diagrams.mjs` holds the six Mermaid
  diagrams redrawn as HTML figures, `src/chrome.mjs` the parts every page
  shares, and `src/pages.mjs` assembles each page and wraps it as a board.
- `src/styles.mjs` is the stylesheet, and holds the grid: a `grid-12`
  container lays its children on twelve columns, each child placing itself
  with `--start` and `--span` (and `--start-md` and `--span-md` out of six),
  and every grid of blocks sizes its rows with `grid-auto-rows: 1fr`.
  `GRID_GUIDE` gives the canvas's desktop boards matching column guides.
- `src/tokens.mjs` is the only place a colour lives, with the pairs
  `contrast` checks. A theme's key is what a reader's saved settings hold, so
  it never changes; its label and colours can.
- `src/icons.mjs` inlines IBM Carbon's 32px icons from `@carbon/icons` by
  name when the site builds, and stops the build if a name is missing.
- `src/logic.mjs` writes the page's logic class: the reading settings, the
  header's panels, the deep dives, and the spy that follows the reader down
  a part in its contents.
- `src/build.mjs` is the one place that wires everything together and knows
  the boards and their layout. `src/paths.mjs` says where everything is.
- `src/heights.json` is measured by `npm run heights`, never typed.
  `src/canvas-created.json` is the canvas's creation stamp, kept so every
  build writes the same index.
- `scripts/harness.mjs` is the test API. `scripts/` also holds the gates
  and the look tools.
- `vendor/design-runtime.js` is the canvas's own page runtime, so the checks
  render exactly what the canvas does. It is not in the repository, since it
  carries no licence to republish it; each machine gets its own copy, as
  `vendor/README.md` says, with the hash the baselines were set with.
  `build` and `check:quick` run without it; everything that renders a page
  stops and points there until it is in place.

## Model features

What to copy the shape of, when building something new:

- **Something a reader sees:** the In plain terms panel. `splitPlain` in
  `content.mjs` recognises it, `renderPlain` in `render.mjs` draws it,
  `.plain` in `styles.mjs` styles it, its colours are `plainBg`,
  `plainEdge`, `plainInk`, `plainLink` and `plainFocus` in `tokens.mjs` with their pairs in
  `TEXT_PAIRS`, and the home page's legend shows it (`SPECIMENS` in
  `pages.mjs`).
- **A reading setting:** line length. Its options are in `SETTINGS` in
  `logic.mjs`, its classes are `.measure-*` in `styles.mjs`, its legend is
  in `chrome.mjs`, and the audit's measure check holds Short under 80
  characters in both typefaces and the three widths at 1, 1.5 and 2 times
  Short.
- **Something that follows the reader:** the contents spy. `sectionInView`
  in `logic.mjs` reads the page once a frame at most, its state reaches the
  markup through `renderVals()` into holes on each item of `toc` in
  `chrome.mjs`, `.is-past` and `.is-current` in `styles.mjs` give it its
  look with the `past` colour from `tokens.mjs`, and `spyAt` in `audit.mjs`
  holds it.
- **A grid of blocks:** the six part cards on the home page. An `ol` with
  `grid-12`, each card `--span: 4` and `--span-md: 3`, rows at
  `grid-auto-rows: 1fr`, and the list named in `GRIDS` and `TWELVE` in
  `audit.mjs` so the grids check holds it.
- **A tool that measures:** the measure check, `longestLine` in
  `audit.mjs`, with its mutation `--mutate measure`.

## The test API

`scripts/harness.mjs`: `startSite()` serves `test-results/site` beside the
canvas runtime and launches Chromium; `openPage(site, file, { width,
height, errors, beforeLoad })` opens a board and stops the run if its
typeface did not load, since nothing measured in a fallback font can be
trusted, and `beforeLoad(page)` runs first, to watch the load or seed the
page's storage;
`setSetting(page, key, value)` chooses a reading setting through the panel,
as a reader would (`theme`, `size`, `spacing`, `measure`, `font`, `deep`);
`togglePanel(page, 'settings' | 'parts')` opens or shuts a header panel.
Each page opens in a fresh browser context, so no check ever sees a
reader's saved settings.

## Rules for the code

- **The words are the author's.** A change to what the course says is made
  in the markdown, and that includes its name, which the code reads from
  the introduction's heading. Typesetting happens in the render, never in
  the files.
- **Unknown input stops the build.** A new kind of section, block, inline
  token or diagram throws until it is handled; it never falls through as
  plain text.
- **Every device has one markup shape,** in `render.mjs`, so the styles and
  the checks can rely on it everywhere it appears.
- **Colours come only from `tokens.mjs`,** and every new pairing goes into
  `TEXT_PAIRS` or `UI_PAIRS`.
- **Everything sits on the grid.** A new layout is a `grid-12` whose
  children place themselves with `--start` and `--span`; a new grid of
  blocks uses `grid-auto-rows: 1fr` and goes into the audit's `GRIDS`, and
  into `TWELVE` if it spans the page.
- **Corners are square,** or 2px on a control; icons come only from Carbon.
- **Sizes are in em, and layout switches are container queries in em,** so
  the text size setting and the reader's zoom reflow the page as well as a
  narrow window does.
- **No logic in the markup.** A hole is a dotted lookup into
  `renderVals()`; anything computed is computed there.
- **A page's listeners are its own.** The canvas swaps in a fresh copy of
  the logic class when a board is edited, calling `componentWillUnmount` on
  the old one, so anything added to `window` is removed there. The canvas
  allows no global keydown handlers.
- **Focus colours win.** The link highlighter's colours are `!important`,
  and everything inside a focused link takes them, because any rule giving
  a link its own colour would otherwise paint that colour on the yellow.
- **Nothing here uses chance,** and a build is byte-for-byte repeatable.
- **Match the style.** Comments are full sentences in the house voice,
  saying why and not what. Prettier decides the formatting.

## Definition of done

The house's nine points, in `~/.claude/CLAUDE.md`. Here they mean: a check
in `audit.mjs`, or a throw in the build, for any new rule, seen failing
first and mutation-checked with `--mutate`; every path in the checklist
below; `npm run check` green; the boards touched looked at with `look`,
`look-parts` and `tile`; `perf` before and after; and a publish only after
all of that. There are no unit tests, no type checking and no fuzzer yet,
so those parts of the nine points have nothing to run until they are added.
Type-aware linting would need the code in TypeScript, or `checkJs` with
types written as comments.

## Edge-case checklist

For anything new on a page, check what it does:

- **every theme:** light grey (its key is `paper`), white, dark and high
  contrast
- **every setting:** text size up to largest, line spacing up to widest,
  each line length, the serif typeface, deep dives folded and open. On the
  home page at desktop width the text column is 774px, so Standard (780px)
  and Long both fill it and look the same there
- **every width:** desktop, tablet, phone at 390px, 320px, and 200% zoom of
  a 1280px window; tables stack below 44em, the header wraps below 40em
- **every board:** home, each part, and the showcase boards, which are
  trimmed pages at fixed sizes
- **every grid:** twelve columns at desktop, six on a tablet, one on a
  phone, and its blocks one height at each
- **saved settings:** a new setting adds its shape to `SAVED_SHAPES` in
  `audit.mjs`, and every older shape stays
- **inside a deep dive,** hidden until opened, as well as outside one
- **the keyboard:** reached by Tab, a visible ring, its text 7:1 or better
  while focused in every theme, and Escape closing a panel back to the
  button that opened it
- **scrolling:** the top, middle and end of a part; the canvas's 1440 by
  3200 frame, where a short last section never reaches the reading line; a
  frame too tall to scroll, like a board drawn at full height; and headings
  that move without a scroll, as a deep dive opening does in a browser
  without scroll anchoring
- **a screen reader:** real buttons, links and labelled inputs, headings in
  order, table roles kept when a table stacks, icons hidden, new-tab links
  announced
- **the 1.4.12 spacing overrides** and **forced colours**
- **the markdown's shapes:** tight and loose lists, empty table cells and an
  empty corner cell, code spans whose spaces matter, bold-only paragraphs,
  bold quoted questions, `file/…` links and outside links
- **a new diagram,** which needs a drawing in `diagrams.mjs` before the
  build will run

## Verifying in a browser

Headless, through the harness, for anything seen or measured; never the
in-app browser pane. The typefaces come from Google Fonts, so the checks
need the network. The site keeps a reader's settings in local storage under
`how-frontier-llms-work/reading-settings/v1`; a test that needs a setting
chooses it through the panel.

## Commits

Commit only when asked, in the house style. The repository is public at
https://github.com/onion2k/aiooer; `npm install` points git at `.githooks`,
and the pre-commit hook runs `check:quick`.
