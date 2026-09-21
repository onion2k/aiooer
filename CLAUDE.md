# The AI field guide: the website

The guide is the markdown files in `content/`: the
introduction, and a file for each written part. An optional primer comes
first, Intro to AI (three short parts, files `Intro N ….md`: what AI is,
the basics of using it, and what is possible), which Claude wrote on 20
September 2026 from general knowledge, for readers without much experience
of AI. A module is optional when its heading in the introduction ends
"(optional)": the home page says so beside it, its main button starts at
the first part that is not optional, and a quieter button offers the primer.
After it, the guide is in six modules, each with
its own parts numbered from 1, in an order the author chose on 20 September
2026 so that the guide starts gently: use it well, then see how it works,
then explore further. Practical AI comes first, then AI in the organisation
(three parts, files `Org N ….md`: AI across the software lifecycle, AI in
the team, and strategy and communication), then Language models (three parts, files `Part N ….md`, the
mechanism alone), then Running AI locally, Generative media and Other AI
models. AI in the organisation's parts 2 and 3 were parts 4 and 5 of
Language models until that date, and its part 1, which Claude wrote from
sources read in September 2026 so that the guide is not only about coding,
was Practical AI part 7 until the author moved it the same day. Its pages
are `Org1` to `Org3`, and the ids its links use did not change. Because the mechanism now comes after the practice, Practical
AI part 1 opens with seven things to know about how a model behaves, and
references from the first two modules to Language models are written as
pointers forward, in the present tense. Language models part 3, AI in the
organisation part 3, Practical AI part 9 and Generative media part 7 each
end with their module's core explanations and misconceptions. Generative
media (seven parts, files `Media N ….md`) covers how the
models work, then images, video, music and audio, and 3D, then shaping
models and prompting. The media parts were drafted by Claude in the
author's voice. Parts 1, 6 and 7 grew out of a three-part image module the
author had accepted; parts 3 to 5 were written from sources read in
September 2026. Running AI locally (five parts, files `Local N ….md`) is
the hands-on module: hardware, Hugging Face and model names, engines and
apps, agents and harnesses, and building on a local model. It was written by
Claude from sources read in September 2026, names products throughout, and
explains what tools do without giving commands, which date faster than
anything else here. Practical AI (nine parts, files `Practical N ….md`)
covers AI chat and AI in apps, which the author added on 20 September 2026 as
the two ways nearly everyone meets AI, and then instruction files; skills,
agents and plugins; agentic work; multi-modal models; MCP servers and tool
use; retrieval; and guardrails and evals. "Agent" means three things in this
module and each part says which: in part 3 it is `AGENTS.md`, a file of
standing instructions; in part 4 it is an agent definition, a file declaring
a helper; in part 5 it is the thing itself, a model in a loop. The author
asked for that separation on 20 September 2026, and part 5 was made from
sections that had been part 4's. Its first part carries the module's map and the
seven things about a model's behaviour the rest leans on, which were part 1's
until the two new parts went in front. It replaces
the language module's former part 4, Building with models, whose text is in
the git history at commit 3617b44. Claude wrote parts 3 to 9 around that
text, which the author had accepted, and added what was new from sources
read in September 2026: the instruction file formats, Agent Skills,
plugins, the July 2026 revision of MCP, and the whole of part 3. Each
part's Sources section says which of its claims rest on the drafter's
knowledge and not on a document. Part 9 closes with the module's core
explanations and misconceptions, twenty-seven of them, three to a part. Every mention of "the practical AI module" in the other modules is a
link to the part it means, or to part 1 where it means the whole module. Other AI
models (four parts, files `Other N ….md`) covers small models, world
models, diffusion language models and system one models, each part
standing alone. Claude wrote them from sources read in September 2026.
Part 4 describes one vendor's product, Jev, announced four days before it
was written, from the vendor's own figures and one independent write-up,
and says so at its head; it is the part most likely to need rewriting. The
module is expected to grow; a new part is a new row in its table, linked
once its file exists. Across the
generated modules, sources were checked to
exist, the tables of models and tools date fast and say so, and no one but
the author has reviewed their claims. The guide's name, its modules and
their parts all come from the introduction, and the code reads them from
there. The code here builds the markdown into an ordinary website, in
`dist/site`, to be put on any web server: plain HTML, one page per part, and
one script. It is held to WCAG 2.2 AAA
except the readable-language criteria (3.1.3 to 3.1.6), and made to be as
easy to read as possible. It was called How Frontier LLMs Work, then Using
AI well, and became The AI field guide on 20 September 2026, when the author
decided the name should not promise advice alone: a directory of models is
reference, not advice, and a field guide holds both. The word "guide" runs
through the prose in place of "course" from that date. Readers' saved
settings still live under the first name's key, on purpose. It was built for
a Claude Design canvas until the same day, when the author decided that
would not be published, and every trace of the canvas came out.
The look is Brutalist graphic design: a pale grey
ground, near-black type and heavy rules, International Klein Blue and a
signal yellow, a bright pastel for each module, Archivo 900 for titles over
Atkinson Hyperlegible Next for
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
- **Text a reader can size.** Smaller, Standard, Large, Larger and Largest
  scale the page by 0.85, 1, 1.15, 1.3 and 1.5. Standard is 20px, which is a
  lot on a large screen, so Smaller exists to come down from it. `audit`'s
  measure check reads each size off the page, `--mutate sizes` proves it, and
  the targets check runs again at Smaller.
- **The panel's own buttons work.** Close shuts the settings panel and hands
  the focus back to the button that opened it, and Reset clears every saved
  setting and reloads. Neither worked from the canvas's removal until 21
  September 2026, since the canvas had bound them and nothing else did.
  `audit`'s `panels` holds them, with `--mutate panels`.
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
- **The contents say where the reader is.** They are sticky, so once the
  page's own title has scrolled away they are the only thing on screen that
  says it: they head with the module and the part, not "On this page", which
  told a reader nothing they did not know. A screen reader hears "contents"
  and not the part's title twice.
- **The directory lists every model in the data.** `/models/` has a row for
  every entry in `content/models.json`, a details panel for each, and filters
  that show exactly what the data says: the audit's `directory` check works
  the expectation out from the file rather than from a list written down, so
  a model added tomorrow is checked from the day it is added. The table is
  whole in the HTML and each panel is a native `<details>`, so a reader with
  JavaScript off still gets every model and everything known about it;
  searching and filtering are a convenience over a list already complete.
  `--mutate models` drops a row to prove the check bites.
  The filters fold away behind a summary, and start folded at every width, so
  that what a reader meets is the table and not a screen of controls. They are
  open in the markup and folded by `reader.js`, so a reader without it has
  them. The count of models showing sits outside the fold, so a reader who has
  folded the filters can still see that some are on. A model's own row holds
  the button that opens its details, and what opens is the row beneath,
  spanning the table; those panels are open in the markup and shut by
  `reader.js` for the same reason. Shut is its own attribute rather than
  `hidden`, which the filters use, so a model a filter hides comes back as it
  was left.
- **The directory says what is still current.** Every model carries a status,
  current, superseded or retired, in a column of its own and as a filter. It
  has a column rather than a label under the name so that saying it never
  makes one row taller than the rest. Every model also carries a source, and
  the build refuses a model without one: a claim about somebody else's
  product needs somewhere a reader can go and check it. `links` checks those
  sources along with the addresses the prose cites, since a dead source under
  a claim about somebody else's product matters more, not less. Where a
  vendor publishes a model card, that is the source in preference to a
  pricing page: it says what the model is and where it fails, and it does not
  change when prices do.
- **The directory says how old it is, and that nobody checked it.** Every
  entry was written from the drafter's knowledge, not from a provider's
  documentation, and it is incomplete at the newest end, since that knowledge
  runs out months before the date on the page. It says both in its own words:
  the `about` paragraphs in `models.json`, which are content like any other
  prose and not something the code holds. `models.json` carries a `checked`
  date, shown in the hero and in every details panel, and the build stops if
  the `about` paragraphs are missing or empty.
- **The deploy is in the repository.** `netlify.toml` holds the build
  command, the publish folder and the Node version, and the build stops if
  either the command or the folder disagrees with what is actually here.
- **Every page says what it is.** Each carries a meta description in the
  guide's own words: the home page and a module open with their own prose
  and add their size, and a part says what a reader can do after it, which
  is what the introduction's table already promises. A description that is
  missing, under 50 characters, over 170, or shared with another page stops
  the build. Nothing is ever cut mid-sentence, which is why the ceiling is
  loose: a search engine trims a long one itself, where a sentence broken in
  half reads as a mistake.
- **A module has a page of its own.** Every module with a written part is
  served at `/<module>/`, saying what the module is for in the words the
  introduction already uses for it and listing every one of its parts, so
  trimming a part's address back to its module leads somewhere rather than
  to a 404. `audit`'s `modules` holds its breadcrumb, heading, title, the
  parts it lists and the modules either side of it, and `--mutate
modulecards` proves that check still bites.
- **An address says what it leads to.** A part is served from
  `/<module>/<number>-<part>/`, as
  `/practical-ai/1-ai-chat/`, so a shared link reads as itself. Every link
  between pages is relative, so the site works at a domain's root, in a
  folder or off a disk. Two parts that would share an address stop the
  build. `audit` holds that nothing links to a page that was not built.
- **On the grid.** At desktop width the page lays out on twelve equal
  columns, stepping to six and then one; every grid of blocks is one height
  at every width; no corner is rounder than 2px. `audit` holds it.
- **Saved settings keep loading.** Every shape of a reader's saved settings
  still loads as the settings grow. `audit` holds it.
- **True to the markdown.** Every section, block, inline token and diagram
  the parser meets is one it knows, and every icon exists in Carbon; anything
  else stops the build. `build`.
- **Modules from the introduction.** The introduction's "The modules"
  section declares each module and its parts; a part whose name is a link
  is written, and one in plain text is still to come and is shown without a
  link. A written part without its file, a file no table names, parts out
  of order, or a link to a page that was not built stops the build. Every
  part page names its module and its place in it, and the previous and next
  links run through every written part across modules. `audit` holds it.
- **One author line.** Each markdown file's second line is its date and its
  author, as `2026-09-19 · Chris Neale`, and the page says "Written … by …"
  from it; a line with no name shows the date alone. Nothing holds this yet.
- **Colour never says anything on its own.** Each module has a hue, drawn as
  a band on the home page and its cards, under a part's breadcrumbs, beside a
  group of parts in the panel and the footer, and on a way on that crosses
  into another module. Every one of those also names the module in words, and
  the high contrast theme sets every hue to its ink. `audit`'s `hues` holds
  it, and its mutation takes the words away rather than flattening the
  colours, since nothing depends on telling them apart.
- **A band is decoration, and held to a window.** A hue is never behind text
  and carries no meaning, so WCAG asks nothing of it and 1.4.11 does not
  apply. `contrast` holds each one between 1.15 and 2.2:1 against every ground
  it can sit on instead: fainter and a band is a smudge, stronger and it
  competes with the blue and the yellow, which do carry meaning. A band never
  makes a boundary, either: a card's and a link's own borders stay whole and
  the hue sits inside them, since a pastel is too quiet to be an edge.
- **The decoration keeps out of the reader's way.** The page carries technical
  marks in the manner of The Designers Republic's Wipeout work: registration
  rings, tick rails, stepped bars, hazard chevrons, dot fields and small
  machine codes, in the margins on a wide window, in a strip above the footer
  and under the home page's hero, under a part's big number, and in the empty
  corner of a hero. None of it is ever over a word, at any width or text size;
  none of it is a tab stop or is read out; none of it is lettering the page
  sets as text, since the codes are drawn inside the picture; and none of it
  raises itself above the page. `audit`'s `decor` holds all of that, and
  `--mutate decor` slides a mark over the prose to prove it bites. It is drawn
  in `mark`, held like a hue to a quiet window by `contrast`, and the high
  contrast theme and forced colours draw none of it, since it says nothing
  that a reader could be missing.
- **One name.** The guide is called what the introduction's heading calls
  it, in the wordmark, the footer and every page title.
  `audit` holds it, and a heading without both the guide's name and the
  page's stops the build.

## Gates and baselines

Baselines as of 19 September 2026, on this machine:

| Gate                | Holds                                              | Baseline                                                                               | Tolerance      |
| ------------------- | -------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------- |
| `contrast`          | 254 colour pairs, four themes                      | lowest text pair 7.33:1, lowest edge 8.38:1, hues 1.19 to 1.75:1, marks 1.61 to 1.68:1 | none           |
| `audit`, axe        | 361 runs                                           | 0 violations, 0 needing review                                                         | none           |
| `audit`, measure    | 43 pages × 4 setting mixes × 3 lengths, 5 sizes    | Short's longest line 73; widths 1:1.5:2; sizes 0.85 to 1.5 times Standard's 20px       | 80; 1% widths  |
| `audit`, targets    | 43 pages × desktop and phone, Standard and Smaller | all 44 × 44 or larger                                                                  | none           |
| `audit`, reflow     | 43 pages × 320px and 200% zoom                     | no sideways scroll                                                                     | none           |
| `audit`, spacing    | 43 pages × desktop and phone                       | nothing clipped                                                                        | none           |
| `audit`, keyboard   | 43 pages × 2 widths, and 3 more themes             | 118 to 119 stops, ringed, uncovered, 7:1                                               | none           |
| `audit`, headings   | 43 pages × desktop and phone                       | one h1, no skipped level                                                               | none           |
| `audit`, corners    | 43 pages, every panel, deep dive open              | none rounder than 2px                                                                  | none           |
| `audit`, grids      | 43 pages × desktop and phone                       | blocks equal; 23 or 9 containers on 12 cols                                            | 1px on heights |
| `audit`, storage    | 6 saved shapes                                     | every one loads                                                                        | none           |
| `audit`, panels     | Close and Reset in the settings panel              | Close shuts and hands focus back; Reset clears and reloads                             | none           |
| `audit`, numerals   | the home page in four themes                       | the four ideas numbered in the text colour                                             | none           |
| `audit`, spy        | 28 parts × 3 frames × top, middle, end             | one current, earlier passed, no jumps                                                  | none           |
| `audit`, modules    | the home page and every written part               | label, breadcrumb, title, ways on, no dead links                                       | none           |
| `audit`, name       | 43 pages                                           | the heading's name wherever it is shown                                                | none           |
| `audit`, hues       | every page, everywhere a hue is drawn              | 17 to 21 a page, each beside the words that say the same                               | none           |
| `audit`, calculator | the one part that has a calculator                 | every example, the keyboard, typing and Start again show what the rule gives           | none           |
| `audit`, decor      | 43 pages × 1800, 1440 largest and long, 390        | no mark over any word; nothing tabbable, spoken or raised                              | none           |
| `look`              | 43 pages                                           | no errors, no empty page                                                               | none           |
| `links`             | 235 addresses: the prose, and every model's source | 233 ok, 2 unverified, 0 gone                                                           | none gone      |
| `perf`, not a gate  | every page's weight; timings on three pages        | see below                                                                              | not held       |

`perf` weighs every page from one load, four at a time, and times three
pages that stand for the rest, five runs each: the home page, the heaviest
part and the model directory. It takes 15 to 25 seconds. On this machine, on
21 September 2026, over two runs: fonts 99 KB on every page, downloads 245 KB
for the home page, 311 KB for the heaviest part and 668 KB for the
directory; render with fonts 288 to 393 ms; a theme change 35 to 43 ms and
opening every deep dive 22 to 28 ms, most of each the wait for the next
frame; and scrolling 0.01 to 0.04 ms a step.

The scroll figure is the page's own script, style and layout, without paint.
Headless Chromium draws sixty frames a second whether there is work or not,
and waiting on them made a run take a quarter of an hour; it cannot be made
to draw on demand on macOS. So the walk runs the page's next-frame callbacks
at once rather than waiting for a frame, and stops the run if the contents
did not follow it. Adding 1 ms of work to each step raises the figure by
1.00 to 1.03 ms, so it sees what it is meant to. What it cannot see is the
repaint when the section changes, which a run that waited on frames once
put at about 6 ms. Runs swing by tens of milliseconds, so compare medians
of two runs each side before believing a change, and run it only for a
change that could move it: a page's weight, its fonts, its script, or what
it holds.

The full check, `npm run check`, is not part of the routine. It renders
every page in every theme and takes minutes, which is too slow to run
between changes, so the author runs it by hand now and then, as a survey of
the whole site. Claude does not run it unless asked. What runs on every
change is the quick check, in the pre-commit hook. The baselines above are
what the last full run found, and a change that might move one is checked
on the pages it touches with `npm run audit -- --pages …`, at about a
minute a page. Where this differs from the house rules' "the full check green",
this file wins, as those rules say it does.

A gate that is found red is fixed before anything else lands. `perf` prints
figures for the before-and-after in a report; nothing holds them yet, so a
slowdown is only caught by reading them.

## Keeping the model directory up to date

The author asks now and then for new models to be looked for. These are the
providers' own index pages, which is where to start:

- Google DeepMind, model cards: https://deepmind.google/models/model-cards/
- Anthropic, system cards: https://www.anthropic.com/system-cards
- OpenAI, every model: https://developers.openai.com/api/docs/models/all
- Moonshot AI (Kimi), models: https://platform.kimi.ai/docs/models
- Microsoft, models: https://microsoft.ai/models/

Checked on 20 September 2026: all resolve except microsoft.ai, which refuses
a plain fetch with a 403 and needs a browser.

Two more that have earned their place: a vendor's `platform` or `developers`
documentation carries prices, context windows and deprecation dates, which
the cards do not, and `openai.com/index/*` and `help.openai.com` refuse to be
fetched at all, so OpenAI facts come from `developers.openai.com`. The list
of model cards at https://github.com/ivylee/model-cards-and-datasheets is a
bibliography rather than a catalogue: most of its entries are components and
enterprise features that do not belong here, but it is a good way to notice a
model that is missing.

What a new model needs before it can go in `content/models.json` is in
`src/models.mjs`, and the build refuses anything short of it: a name, a
provider, how it is got hold of, a size, a release date, what it does, a
status, notes, and a source. Say "Not published" rather than guessing, and
prefer the model card as the source where one exists.

## Commands

    npm run dev            build, then the site at http://127.0.0.1:5190
    npm run build          the guide as an ordinary website in dist/site
    npm run check:quick    formatting, lint, contrast, build (the pre-commit hook)
    npm run check          check:quick, look and the full audit; slow, and run by hand now and then, not on every change
    npm run contrast       every colour pair in tokens.mjs against 7:1 and 3:1; --all prints them all
    npm run audit          the accessibility audit; report in test-results/audit-report.md
    npm run audit:quick    two themes and shorter keyboard walks (~2 min; line length takes most of it)
    npm run look           every page rendered: an error or an empty page fails it; pictures in test-results/shots
    npm run perf           every page's weight, and timings on three pages; ~20 s
    npm run links          every outside address the guide cites: gone fails it, refused or slow is listed (~2 min, needs the network)

The audit takes `--only axe,measure,targets,reflow,spacing,keyboard,headings,corners,grids,storage,panels,numerals,spy,modules,name,calculator,directory,decor`,
`--pages practical-ai/1-ai-chat/index.html,...`, `--jobs 4` for how many pages it audits at once, `--all` to audit pages it would skip, and `--mutate <name>`, which puts a known defect
into every page (`contrast`, `focus`, `targets`, `measure`, `widths`,
`reflow`, `spacing`, `sizes`, `panels`, `headings`, `corners`, `grids`, `twelve`, `numerals`,
`spy`, `spybold`, `spydim`, `spyjump`, `pastfocus`, `focustext`, `modulelabel`, `modulecards`, `models`, `pagerchain`, `cominglink`, `name`, `calc`, `hues`, `decor`) to
prove the check that should catch it still does.
A page that passed is skipped until its built file, the audit, the harness,
the runtime, the packages, the introduction, the list of pages or the flags
change; what it wrote last time is kept in `test-results/audit-kept.json` and
goes into the report, a failure is never kept, and a mutated run neither
reads nor writes it. The headings check runs inside the keyboard walk, so
`--only headings` needs `keyboard` beside it.
`node scripts/look-parts.mjs <width> <page/index.html> <selector>...` takes
pictures of single elements, with `--theme`, `--size` and the other
settings; `node scripts/tile.mjs <in.png> <out.png>` lays a tall phone
picture out in columns. Look at every picture.

## Publishing

`npm run build` writes `dist/site`: the home page as `index.html`, each part
as `<module>/<number>-<part>/index.html`, and `reader.js` at the root. Copy
that folder to any static host. It needs no server code and no build step at
the far end, only the ordinary serving of a folder's `index.html`, which
every static host does. Every link between pages is relative, so the site
works at a domain's root, in a folder, or opened from a disk.

It runs in plain Node, with no browser and nothing that is not in this
repository, so a build server can run it on a push. `netlify.toml` says how:
the command, the folder to publish and the Node version, in the repository
rather than in a dashboard, since Netlify takes a file's settings over its
UI's. The build checks that file against itself, because this broke once:
the command lived only in the dashboard, `build:static` was renamed to
`build`, and nothing here could know until the deploy failed. A command that
is not a script, or a published folder that is not where the site is
written, now stops the build.

A page is written in three steps. `pages.mjs` makes its markup, with holes
where a value goes and loops where a list does; `logic.mjs` says what those
values are as the page loads; `template.mjs` fills them in. Dotted holes,
`<sc-for>` and `<sc-if>` are the only forms, and they are never nested more
than one deep. What happens once a reader touches anything is `reader.js`,
the only implementation of that behaviour: the reading settings, the
header's panels, the deep dives, the contents that follow the reader, and
the calculator, whose arithmetic is written into the page from
`calculator.mjs` so that the page and the script cannot disagree. Without
JavaScript a page still holds the whole guide, with the settings the build
wrote.

The build checks its own output: no hole or loop left unrendered, no unbound
event attribute, and no link that lands on a page that was not written. The
audit then walks those pages, and only those, so everything the site
promises is held against the thing that ships rather than a copy of it, and
no check needs anything that is not in this repository.

### The canvas, which is gone

The guide was built for a Claude Design canvas at
https://claude.ai/artifact/MedAhUDsLXE6G1apbxFAHk until 20 September 2026,
when the author decided it would not be published. Everything of it has
gone: the boards and their index, the fifteen showcase boards, the recorded
heights, the column guides, the page runtime in `vendor/`, and the logic
class `logic.mjs` used to write into every page, which was a second
implementation of everything `reader.js` does. `logic.mjs` is now 133 lines
saying what a page starts at, where it was 384.

The removal was proved rather than trusted: the built site was kept, the
canvas taken out, and the site built again from nothing but this repository.
All 35 pages and `reader.js` came out byte for byte identical. The text in
the git history at the commit before it has the boards, if they are ever
wanted again.

## How the code is laid out

- **The models** are `content/models.json`, the one piece of content that is
  data rather than prose, because a tool will keep it up to date and parsing
  a markdown table safely is harder than reading JSON. It holds the
  directory's own words too, in `about`, so that what the page says about
  itself is an edit to the content and not to the code. The build validates
  it and never writes it.
- **The guide** is the markdown in `content/`, which the build reads and
  never writes, and which Prettier is told to leave alone as a folder, so a
  new module needs nothing but its prefix in `MODULE_FILES`. `CONTENT_DIR` in
  `paths.mjs` is the one place the folder is named.
- `src/content.mjs` is the guide without its picture: the introduction into
  the guide's modules and parts (`MODULE_FILES` there gives each module's
  file and page prefix; a new module is added to it), and markdown into page
  models, with the guide's devices recognised (In plain terms, deep dives,
  misconceptions, glossaries, questions and answers, bold lines that are
  really headings). It makes no HTML. It is handed the folder to read.
- `src/inline.mjs` sets inline text as a typesetter would (curly quotes, ×,
  superscripts) and turns `file/…` links into links between pages.
- `src/render.mjs` draws blocks, `src/diagrams.mjs` holds the twelve Mermaid
  diagrams redrawn as HTML figures, `src/chrome.mjs` the parts every page
  shares, and `src/pages.mjs` assembles each page.
- `src/styles.mjs` is the stylesheet, and holds the grid: a `grid-12`
  container lays its children on twelve columns, each child placing itself
  with `--start` and `--span` (and `--start-md` and `--span-md` out of six),
  and each module's hue: a block belonging to a module sets `--hue` from the
  `--hue-1` to `--hue-7` every theme defines,
  and every grid of blocks sizes its rows with `grid-auto-rows: 1fr`.
- `src/tokens.mjs` is the only place a colour lives, with the pairs
  `contrast` checks. A theme's key is what a reader's saved settings hold, so
  it never changes; its label and colours can.
- `src/icons.mjs` inlines IBM Carbon's 32px icons from `@carbon/icons` by
  name when the site builds, and stops the build if a name is missing.
- `src/models.mjs` is the model directory without its picture:
  `content/models.json` into a list the page can draw, with `CAPABILITIES`
  and `ACCESS` naming what a model can do and how it is got hold of. Nothing
  trusts the file, since a tool will write it: an unknown field, an unknown
  capability, a missing value, a duplicate name or open weights without a
  licence all stop the build. `src/directory.mjs` draws it.
- `src/decor.mjs` is the page's decoration: the marks themselves, and the four
  places they go. It knows nothing of the guide's content, every mark leaves
  through a guard that refuses words set as text, and `styles.mjs` places and
  sizes them. `decor` in `audit.mjs` holds them off the words.
- `src/logic.mjs` says what a page starts at: the reading settings, the
  header's panels, the deep dives, the contents that follow the reader, and
  the calculator, each at the value the build writes into the markup. Values
  only; the behaviour is `src/reader.js`.
- `src/template.mjs` fills a page's holes, loops and branches with those
  values, and drops the attributes that would hold a handler.
- `src/reader.js` is the page in the browser, and the only implementation of
  its behaviour. Plain script, no build step, no dependencies.
- `src/build.mjs` is the one place that wires everything together and writes
  `dist/site`. `src/paths.mjs` says where everything is.
- `scripts/links.mjs` asks every outside address the guide cites whether it
  still answers. It is not part of `check`, since it depends on other
  people's servers and a gate a stranger's outage can turn red gets ignored;
  it is run before a publish. A 404, a 410 or a name that does not resolve is
  gone and fails it; a refusal, a rate limit, a server error or a timeout is
  unverified and only listed. `--mutate dead` adds a page and a host that do
  not exist, to prove it still fails, and `--only <text>` checks a few.
- `scripts/harness.mjs` is the test API. `scripts/` also holds the gates
  and the look tools.

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
- **Something that follows the reader:** the contents spy. The build marks
  the first section, from `startingVals()` in `logic.mjs` into holes on each
  item of `toc` in `chrome.mjs`; `sectionInView` in `reader.js` reads the
  page once a frame at most and moves the mark, and is called again whenever
  something moves the headings without a scroll; `.is-past` and
  `.is-current` in `styles.mjs` give it its look with the `past` colour from
  `tokens.mjs`, and `spyAt` in `audit.mjs` holds it.
- **A grid of blocks:** a module's part cards on the home page. An `ol` with
  `grid-12`, each card `--span: 4` and `--span-md: 3`, rows at
  `grid-auto-rows: 1fr`, and the list named in `GRIDS` and `TWELVE` in
  `audit.mjs` so the grids check holds it.
- **Something a reader works:** the lifecycle calculator in AI in the
  organisation part 1. Its stages, days and examples are a `calculator`
  fence in the markdown, which `parseCalculator` in `calculator.mjs` reads
  and which stops the build if a line is wrong. Its arithmetic is `delivery`
  in the same file, which knows nothing of the page. `logic.mjs` works out
  what it shows as it opens, `build.mjs` writes the same functions into the
  page by their source for `reader.js` to use, `renderCalculator` in
  `render.mjs` draws it with every number a hole, `.calc-*` in `styles.mjs`
  styles it from existing tokens, and the audit's `calculator` check works
  the expectation out from the values on the page with the same `delivery`.
  A part can hold one.
- **A colour that groups:** a module's hue. `HUE_NAMES` and each theme's
  `hue1` to `hue7` are in `tokens.mjs`, with their pairs in `UI_PAIRS`;
  `content.mjs` numbers each module as the introduction declares it, and
  stops the build if there are more modules than hues; `styles.mjs` emits
  `--hue-1` to `--hue-7` per theme and draws the bands; the blocks that carry
  one set `--hue` inline; and `hues` in `audit.mjs` holds the rule that the
  words are always there too.
- **A page of reference rather than reading:** the model directory.
  `content/models.json` is the data, `parseModels` in `models.mjs` checks it
  and stops the build on anything it does not know, `directory.mjs` draws the
  filters and the table, `directoryFile` in `pages.mjs` makes the page,
  `build.mjs` serves it at `models/`, `.filters` and `.models` in
  `styles.mjs` style it, the filtering is in `reader.js`, and `directory` in
  `audit.mjs` holds it against the data with `--mutate models`.
- **Something that is only a look:** the page's decoration. `decor.mjs` draws
  the marks and says where they go, `pages.mjs` and `chrome.mjs` put them on
  the page, `.decor-*` in `styles.mjs` places them, `mark` in `tokens.mjs` is
  their one colour with its pair in `MARK_PAIRS`, and `decor` in `audit.mjs`
  holds them clear of every word with `--mutate decor`.
- **A tool that measures:** the measure check, `longestLine` in
  `audit.mjs`, with its mutation `--mutate measure`.

## The test API

`scripts/harness.mjs`: `startSite()` serves `dist/site`, the pages that ship,
and launches Chromium; it stops the run if the site is not built. `openPage(site, file, { width,
height, errors, beforeLoad })` opens a page and stops the run if its
typeface did not load, since nothing measured in a fallback font can be
trusted, and `beforeLoad(page)` runs first, to watch the load or seed the
page's storage;
`setSetting(page, key, value)` chooses a reading setting through the panel,
as a reader would (`theme`, `size`, `spacing`, `measure`, `font`, `deep`);
`togglePanel(page, 'settings' | 'parts')` opens or shuts a header panel;
`guide()` is the guide as the introduction declares it, and `sitePages()`
the home page, every module with a written part and every written part as
they are served (`index.html`, `practical-ai/index.html`,
`practical-ai/1-ai-chat/index.html`, and so on), which is what the audit,
`look` and `perf` walk, so a new part is checked from the day it is written.
`pageMap()` is the one place that knows a board's name as an address,
`pageFile()` the `index.html` that serves an address, and `upTo()` how far a
link from a page has to climb to reach the root.
Each page opens in a fresh browser context, so no check ever sees a
reader's saved settings.

## Rules for the code

- **The words are the author's.** A change to what the guide says is made
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
- **No logic in the markup.** A hole is a dotted lookup into what
  `startingVals()` returns; anything computed is computed there.
- **The page starts where the build leaves it.** `logic.mjs` gives values
  only, never a handler, and `reader.js` binds every listener itself, by
  class and position, from the markup the build wrote.
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
below; the quick check green, and the audit green on the pages the change
touched (`npm run audit -- --pages …`), with the full check left to the
author's occasional run; the pages touched looked at with `look`,
`look-parts` and `tile`; `perf` before and after, for a change that could
move it; and a publish only after
all of that. There are no unit tests, no type checking and no fuzzer yet,
so those parts of the nine points have nothing to run until they are added.
Type-aware linting would need the code in TypeScript, or `checkJs` with
types written as comments.

## Edge-case checklist

For anything new on a page, check what it does:

- **every theme:** light grey (its key is `paper`), white, dark and high
  contrast
- **every setting:** text size from smaller up to largest, line spacing up to widest,
  each line length, the serif typeface, deep dives folded and open. On the
  home page at desktop width the text column is 774px, so Standard (780px)
  and Long both fill it and look the same there; that is by choice, and the
  home page keeps its layout for Long
- **every width:** desktop, tablet, phone at 390px, 320px, and 200% zoom of
  a 1280px window; tables stack below 44em, the header wraps below 40em
- **every page:** home, and each part of each module
- **every module:** a part written and a part still to come, on the home
  page's cards, in the parts panel and the footer; the first and last part
  of a module, where previous and next cross into another module; a
  reference from one module to another, which names the module, since a
  bare "part 3" means the same module
- **every grid:** twelve columns at desktop, six on a tablet, one on a
  phone, and its blocks one height at each
- **saved settings:** a new setting adds its shape to `SAVED_SHAPES` in
  `audit.mjs`, and every older shape stays
- **inside a deep dive,** hidden until opened, as well as outside one
- **the keyboard:** reached by Tab, a visible ring, its text 7:1 or better
  while focused in every theme, and Escape closing a panel back to the
  button that opened it
- **scrolling:** the top, middle and end of a part; a window too short for a
  last section to reach the reading line; a page too short to scroll at all;
  and headings that move without a scroll, as a deep dive opening above the
  reader does, which the contents have to notice for themselves
- **a screen reader:** real buttons, links and labelled inputs, headings in
  order, table roles kept when a table stacks, icons hidden, new-tab links
  announced
- **the decoration:** nothing new may sit under a mark or push one over a
  word; the rails appear only on a window wider than 87em, and the high
  contrast theme and forced colours draw none of it
- **the 1.4.12 spacing overrides** and **forced colours**
- **a code block's language:** `python`, `json`, `prompt` and `file` (an instruction file
  such as `AGENTS.md`; both wrap as prose), `names` for a list of model names, or none, which is a formula; any other stops the build until
  `CODE_LABELS` in `render.mjs` names it
- **a part's second block in one language:** each code block is a named,
  scrollable region, and regions on a page need different names, so the
  parser numbers them and the second says it is the second
- **the markdown's shapes:** tight and loose lists, empty table cells and an
  empty corner cell, code spans whose spaces matter, bold-only paragraphs,
  bold quoted questions, `file/…` links and outside links
- **a calculator:** one to a part, under an h3 so that its stage names, which
  are h4, skip no level; its values are not saved, and go back to the
  markdown's on every load
- **a new diagram,** which needs a drawing in `diagrams.mjs` before the
  build will run

## Verifying in a browser

Headless, through the harness, for anything seen or measured; never the
in-app browser pane. What every check renders is `dist/site`, the pages that
ship, so a check holds the thing itself and not a copy of it. The typefaces
come from Google Fonts, so the checks need the network. The site keeps a reader's settings in local storage under
`how-frontier-llms-work/reading-settings/v1`, which keeps the guide's first
name on purpose, since a new key would lose every reader's saved choices; a
test that needs a setting chooses it through the panel.

## Commits

Commit only when asked, in the house style. The repository is public at
https://github.com/onion2k/aiooer; `npm install` points git at `.githooks`,
and the pre-commit hook runs `check:quick`.
