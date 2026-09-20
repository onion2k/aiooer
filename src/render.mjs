// Draws a part's blocks as HTML: paragraphs, lists, tables, code, and the
// course's own devices. Each device gets one fixed markup shape here, so the
// stylesheet and the accessibility checks can rely on it everywhere it
// appears. The deep dives are the one interactive part; their open state is
// wired to the page's logic through {{dd.<key>}} holes.

import { renderInline, plainText, esc, smartPlain, unescapeEntities } from './inline.mjs';
import { renderDiagram } from './diagrams.mjs';
import { ICONS } from './icons.mjs';
import { MAX_DAYS, SAVED_STEP } from './calculator.mjs';

// The Part column of a reference table holds a bare number, which means that
// part of the same module; ctx.parts is the module's own list.
function partLink(n, parts) {
  const p = parts.find((x) => x.n === n);
  if (!p) throw new Error(`A reference table names part ${n}, which its module does not have`);
  if (!p.written) return `Part ${n}`;
  return `<a href="page:${p.out}">Part ${n}<span class="sr-only">: ${esc(p.shortTitle)}</span></a>`;
}

function cellHtml(cell, ctx, colIndex) {
  const text = cell.text.trim();
  if (ctx.partColumn === colIndex && /^\d$/.test(text)) return partLink(Number(text), ctx.parts);
  // "5x" in a price table is five times.
  if (/^\d+(\.\d+)?x$/.test(text)) return esc(text.slice(0, -1)) + '×';
  return renderInline(cell.tokens);
}

function renderTable(block, ctx) {
  const headers = block.header.map((h) => plainText(h.tokens).trim());
  const partColumn = headers.findIndex((h) => h === 'Part');
  const cctx = { ...ctx, partColumn: ctx.sectionKind === 'core' || ctx.sectionKind === 'quickref' ? partColumn : -1 };
  const cls = ['data'];
  if (ctx.sectionKind === 'twoWays') cls.push('two-ways');
  if (headers.length >= 4) cls.push('is-wide');
  const longest = Math.max(...block.header.concat(...block.rows).map((c) => plainText(c.tokens).length));
  if (headers.length <= 3 && longest <= 32) cls.push('is-compact');
  const labelledBy = ctx.headingId ? ` aria-labelledby="${ctx.headingId}"` : '';
  const head = block.header
    .map((h, i) =>
      headers[i] === ''
        ? '<td role="cell"></td>'
        : `<th role="columnheader" scope="col">${renderInline(h.tokens)}</th>`,
    )
    .join('');
  const rows = block.rows
    .map((row) => {
      const cells = row
        .map((cell, i) => {
          const html = cellHtml(cell, cctx, i);
          if (i === 0) return `<th role="rowheader" scope="row">${html}</th>`;
          if (cell.text.trim() === '') return '<td role="cell" class="is-empty"></td>';
          const label = headers[i]
            ? `<span class="cell-label" aria-hidden="true">${esc(smartPlain(headers[i]))}</span>`
            : '';
          return `<td role="cell">${label}${html}</td>`;
        })
        .join('');
      return `<tr role="row">${cells}</tr>`;
    })
    .join('');
  return `<div class="table-wrap"><table class="${cls.join(' ')}" role="table"${labelledBy}><thead role="rowgroup"><tr role="row">${head}</tr></thead><tbody role="rowgroup">${rows}</tbody></table></div>`;
}

function renderListItem(item, ctx) {
  const toks = item.tokens || [];
  // A tight item is one "text" token; a loose one holds paragraphs.
  if (toks.length === 1 && (toks[0].type === 'text' || toks[0].type === 'paragraph')) {
    return `<li>${renderInline(toks[0].tokens || [{ type: 'text', text: toks[0].text }])}</li>`;
  }
  const inner = toks
    .map((t) => {
      if (t.type === 'text' || t.type === 'paragraph') return `<p>${renderInline(t.tokens)}</p>`;
      if (t.type === 'list') return renderList({ ordered: t.ordered, start: t.start, items: t.items }, ctx);
      if (t.type === 'space') return '';
      throw new Error('Unhandled list item content ' + t.type);
    })
    .join('');
  return `<li>${inner}</li>`;
}

function renderList(block, ctx) {
  const tag = block.ordered ? 'ol' : 'ul';
  const start = block.ordered && block.start && block.start !== 1 ? ` start="${block.start}"` : '';
  return `<${tag} class="prose-list"${start}>${block.items.map((it) => renderListItem(it, ctx)).join('')}</${tag}>`;
}

// Python gets one kind of highlighting: comments, which carry the meaning
// the prose refers to. Colour alone never carries meaning here.
function highlightPython(code) {
  return code
    .split('\n')
    .map((line) => {
      const hash = line.indexOf('#');
      if (hash < 0) return esc(line);
      return esc(line.slice(0, hash)) + `<span class="c-note">${esc(line.slice(hash))}</span>`;
    })
    .join('\n');
}

// What a block is called, by the language its fence names. A block with no
// language is a formula, as it always was. A language the course has not used
// before stops the build, so a block is never labelled as something it is not.
const CODE_LABELS = { python: 'Python code', json: 'JSON', prompt: 'Prompt', file: 'File', names: 'Model names' };
// A prompt, and a file of instructions such as AGENTS.md, are prose: they wrap
// like prose, so no one scrolls sideways to read a sentence.
const PROSE = new Set(['prompt', 'file']);

function renderCode(block) {
  if (block.lang && !CODE_LABELS[block.lang]) throw new Error(`No label for a code block in "${block.lang}"`);
  const body = block.lang === 'python' ? highlightPython(block.text) : esc(block.text);
  const label = block.lang ? CODE_LABELS[block.lang] : 'Formula';
  // Each block is a region a keyboard can scroll, and regions on one page
  // need different names, so a part's second Python block says it is the second.
  const name = block.nth > 1 ? `${label} ${block.nth}` : label;
  return `<div class="code-block"><p class="code-cap label" aria-hidden="true">${esc(label)}</p><pre class="code${PROSE.has(block.lang) ? ' is-prose' : ''}" tabindex="0" role="region" aria-label="${esc(name)}"><code>${body}</code></pre></div>`;
}

function renderPlain(block) {
  return `<div class="plain"><p class="plain-label label">${ICONS.plain}<span>In plain terms</span></p><p class="plain-summary">${renderInline(
    block.summary,
  )}</p><p class="plain-who"><strong>Who should read it:</strong> ${renderInline(block.who)}</p></div>`;
}

function capitalise(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// "**True:** the training objective..." loses its bold label to a separate
// line, so the sentence that follows needs its own capital letter.
function capitaliseTokens(tokens) {
  const [first, ...rest] = tokens;
  if (!first || first.type !== 'text') return tokens;
  return [{ ...first, text: capitalise(first.text), tokens: undefined }, ...rest];
}

function renderDeep(block, ctx) {
  const inner = renderBlocks(block.blocks, { ...ctx, headingId: block.id + '-title' });
  const k = block.key;
  return `<div class="deep" id="${block.id}"><h3 class="deep-heading" id="${block.id}-title"><button type="button" class="deep-toggle" aria-expanded="{{dd.${k}.expanded}}" aria-controls="${block.id}-body" onClick="{{dd.${k}.toggle}}"><span class="deep-kicker label">${ICONS.deep}<span>Deep dive <span class="deep-optional">(optional)</span></span></span><span class="sr-only">: </span><span class="deep-title">${esc(
    smartPlain(capitalise(block.title)),
  )}</span><span class="deep-state" aria-hidden="true"><span class="when-closed">Show</span><span class="when-open">Hide</span>${ICONS.chevron}</span></button></h3><div class="deep-body" id="${block.id}-body" hidden="{{dd.${k}.hidden}}">${inner}</div></div>`;
}

const MYTH_PARTS = {
  True: { cls: 'is-true', icon: ICONS.isTrue },
  Misleading: { cls: 'is-misleading', icon: ICONS.misleading },
  'What to say': { cls: 'is-say', icon: ICONS.say },
};

function renderMyth(block) {
  const parts = block.parts
    .map((p) => {
      const meta = MYTH_PARTS[p.label];
      return `<div class="myth-part ${meta.cls}"><dt class="label">${meta.icon}<span>${esc(p.label)}</span></dt><dd>${renderInline(capitaliseTokens(p.tokens))}</dd></div>`;
    })
    .join('');
  return `<div class="myth"><h3 class="myth-claim" id="${block.id}">${esc(smartPlain(block.claim))}</h3><dl class="myth-parts">${parts}</dl></div>`;
}

function renderGlossary(block) {
  const rows = block.entries
    .map(
      (e) =>
        `<div class="gl-row"><dt id="${e.id}">${renderInline(e.term.tokens)}</dt><dd>${renderInline(e.meaning.tokens)}</dd></div>`,
    )
    .join('');
  return `<dl class="glossary">${rows}</dl>`;
}

function renderQA(block) {
  return `<div class="qa"><h4 class="qa-q" id="${block.id}">${esc(smartPlain(block.question))}</h4><p>${renderInline(block.answer)}</p></div>`;
}

// The lifecycle calculator: a row for each stage, with the days it takes now
// and the share of them AI saves, and under them what the whole comes to.
// Every number on it is a hole, worked out in the page's logic from
// calculator.mjs; the markup holds the words and the controls only. The
// inputs are real ones with labels of their own, and the result is a live
// region, so a screen reader hears the new total when a value changes.
function renderCalculator(block) {
  const unit = esc(block.unit);
  return `<figure class="figure calc" data-unit="${unit}" aria-labelledby="calc-cap"><figcaption class="figure-cap label" id="calc-cap">${esc(block.caption)}</figcaption><div class="calc-presets" role="group" aria-label="Try an example"><sc-for list="{{calc.presets}}" as="p"><button type="button" class="btn-line calc-preset" data-saved="{{p.savedList}}" onClick="{{p.apply}}">{{p.label}}</button></sc-for><button type="button" class="btn-line calc-preset calc-reset" onClick="{{calc.reset}}">${ICONS.reset}<span>Start again</span></button></div><ol class="calc-rows" role="list"><sc-for list="{{calc.rows}}" as="r"><li class="calc-row"><h4 class="calc-stage">{{r.name}}</h4><label class="calc-field"><span class="calc-label label">${unit[0].toUpperCase()}${unit.slice(1)} now</span><input class="calc-days" type="number" inputmode="decimal" min="0" max="${MAX_DAYS}" step="0.5" value="{{r.days}}" onChange="{{r.setDays}}"></label><label class="calc-field calc-field-saved"><span class="calc-label label">Time AI saves: <span class="calc-pct">{{r.saved}}%</span></span><input class="calc-saved" type="range" min="0" max="100" step="${SAVED_STEP}" value="{{r.saved}}" aria-valuetext="{{r.savedText}}" onChange="{{r.setSaved}}"></label><p class="calc-after"><span class="calc-label label">With AI</span><span class="calc-after-n"><span>{{r.after}} ${unit}</span></span></p><div class="calc-bar" aria-hidden="true"><span class="calc-bar-now" style="width: {{r.barNow}}%"></span><span class="calc-bar-after" style="width: {{r.barAfter}}%"></span></div></li></sc-for></ol><div class="calc-result" role="status" aria-live="polite"><p class="calc-totals"><span class="calc-total"><span class="calc-label label">Now</span><strong>{{calc.before}} ${unit}</strong></span><span class="calc-total"><span class="calc-label label">With AI</span><strong>{{calc.after}} ${unit}</strong></span><span class="calc-total calc-total-faster"><span class="calc-label label">The whole piece of work</span><strong>{{calc.faster}}</strong></span></p><p class="calc-note">{{calc.note}}</p></div></figure>`;
}

export function renderBlocks(blocks, ctx) {
  let headingId = ctx.headingId;
  let html = '';
  for (const b of blocks) {
    const c = { ...ctx, headingId };
    switch (b.type) {
      case 'p':
        html += `<p>${renderInline(b.tokens)}</p>`;
        break;
      case 'h3':
        headingId = b.id;
        html += `<h3 id="${b.id}">${renderInline(b.tokens)}</h3>`;
        break;
      case 'plain':
        html += renderPlain(b);
        break;
      case 'deep':
        html += renderDeep(b, c);
        break;
      case 'myth':
        html += renderMyth(b);
        break;
      case 'list':
        html += renderList(b, c);
        break;
      case 'table':
        html += renderTable(b, c);
        break;
      case 'code':
        html += renderCode(b);
        break;
      case 'diagram':
        html += renderDiagram(b.key);
        break;
      case 'calculator':
        html += renderCalculator(b);
        break;
      case 'glossary':
        html += renderGlossary(b);
        break;
      case 'qa':
        headingId = b.id;
        html += renderQA(b);
        break;
      default:
        throw new Error('Unhandled block ' + b.type);
    }
  }
  return html;
}

export function sectionHeading(section) {
  // The number shows as two digits; a screen reader hears "1.", not "zero one".
  const num =
    section.number !== null
      ? `<span class="sec-num" aria-hidden="true">${String(section.number).padStart(2, '0')}</span><span class="sr-only">${section.number}. </span>`
      : '';
  return `<h2 class="sec-title" id="${section.id}">${num}${esc(smartPlain(section.heading))}</h2>`;
}

export { unescapeEntities };
