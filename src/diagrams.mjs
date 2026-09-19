// The course's six Mermaid diagrams, redrawn as HTML figures. A drawing of
// boxes and arrows is an image to a screen reader and does not reflow on a
// phone; an ordered list of real text is read in order, grows with the text
// size setting and stacks at any width. Each entry follows its Mermaid source
// node for node, and the build checks that every diagram in the course has
// one, so a new diagram cannot slip through undrawn.

import { esc } from './inline.mjs';
import { ICONS } from './icons.mjs';

export const DIAGRAMS = {
  // Part 1, section 1. flowchart LR, with the sampler looping back.
  'part1-1': {
    kind: 'flow',
    layout: 'column',
    caption: 'Inside one call to the model',
    steps: [
      { text: 'Text' },
      { text: 'Tokeniser' },
      { text: 'Embedding lookup' },
      { text: 'Transformer blocks × N layers' },
      { text: 'Logits: a score per vocab entry' },
      { text: 'Sampler' },
    ],
    loop: 'Append the token and run again from step 3, embedding lookup.',
  },
  // Part 1, section 5. flowchart TD, with the two residual additions.
  'part1-2': {
    kind: 'flow',
    layout: 'column',
    caption: 'One transformer block',
    steps: [
      { text: 'Vector per position from layer below' },
      { text: 'Normalise' },
      { text: 'Multi-head attention' },
      { text: 'Add', add: true, note: 'the attention output to the vector from step 1' },
      { text: 'Normalise' },
      { text: 'Feed-forward network or MoE experts' },
      { text: 'Add', add: true, note: 'the feed-forward output to the vector from step 4' },
      { text: 'Vector per position to layer above' },
    ],
  },
  // Part 2, "About this part". flowchart LR, nine stages in a line.
  'part2-1': {
    kind: 'flow',
    layout: 'column',
    caption: 'From raw text to released model',
    steps: [
      { text: 'Raw text and code' },
      { text: 'Curated corpus' },
      { text: 'Pretraining' },
      { text: 'Base model' },
      { text: 'Instruction tuning', tag: 'Post-training' },
      { text: 'Preference optimisation', tag: 'Post-training' },
      { text: 'RL on checkable tasks', tag: 'Post-training' },
      { text: 'Released model' },
      { text: 'Distilled smaller models' },
    ],
  },
  // Part 4, "About this part". Three sources feed the context; the model
  // either calls a tool, whose result goes back in, or produces output.
  'part4-1': {
    kind: 'flow',
    layout: 'column',
    caption: 'The system around the model',
    inputs: {
      label: 'Three things go into the context',
      items: ['Instructions and examples', 'Retrieved documents', 'Tool results'],
    },
    steps: [
      { text: 'Context' },
      { text: 'Model' },
      { text: 'Output' },
      { text: 'Validation and approval' },
      { text: 'Logged and evaluated' },
    ],
    loop: 'When the model makes a tool call, your code runs the tool, and its result goes back into the context as tool results.',
  },
  // Part 4, section 2. sequenceDiagram with three participants.
  'part4-2': {
    kind: 'sequence',
    caption: 'The tool-use loop',
    participants: ['Your application', 'Model', 'Tool'],
    messages: [
      { from: 0, to: 1, text: 'Prompt + tool definitions' },
      { from: 1, to: 0, text: 'Tool call: name + arguments' },
      { from: 0, to: 2, text: 'Execute, after checks' },
      { from: 2, to: 0, text: 'Result' },
      { from: 0, to: 1, text: 'Result added to context' },
      { from: 1, to: 0, text: 'Final answer, or another tool call' },
    ],
  },
  // Part 4, section 3. Two rows: indexing ahead of time, answering per question.
  'part4-3': {
    kind: 'lanes',
    caption: 'The RAG pipeline',
    lanes: [
      { label: 'Top row: ahead of time', steps: ['Documents', 'Split into chunks', 'Embed', 'Index'] },
      {
        label: 'Bottom row: for every question',
        steps: [
          'Question',
          'Search: meaning + keywords, in the index',
          'Rerank',
          'Top passages into prompt',
          'Answer with citations',
        ],
      },
    ],
  },
};

function arrow() {
  return `<span class="flow-arrow" aria-hidden="true">${ICONS.arrowDown}</span>`;
}

function renderFlow(d, id) {
  const steps = d.steps
    .map((s, i) => {
      const last = i === d.steps.length - 1;
      const box = s.add
        ? `<span class="flow-box is-add"><span class="flow-plus" aria-hidden="true">+</span><span class="flow-text"><strong>${esc(s.text)}</strong> <span class="flow-note">${esc(s.note)}</span></span></span>`
        : `<span class="flow-box"><span class="flow-n" aria-hidden="true">${i + 1}</span><span class="flow-text">${esc(s.text)}${s.tag ? ` <span class="flow-tag">${esc(s.tag)}</span>` : ''}</span></span>`;
      return `<li class="flow-step">${box}${last ? '' : arrow()}</li>`;
    })
    .join('');
  const inputs = d.inputs
    ? `<div class="flow-inputs"><p class="flow-inputs-label">${esc(d.inputs.label)}</p><ul class="flow-input-list" role="list">${d.inputs.items
        .map((t) => `<li class="flow-box is-input"><span class="flow-text">${esc(t)}</span></li>`)
        .join('')}</ul>${arrow()}</div>`
    : '';
  const loop = d.loop ? `<p class="flow-loop">${ICONS.loop}<span>${esc(d.loop)}</span></p>` : '';
  return `<figure class="figure flow flow-${d.layout}" aria-labelledby="${id}-cap"><figcaption class="figure-cap" id="${id}-cap">${esc(d.caption)}</figcaption>${inputs}<ol class="flow-steps" role="list">${steps}</ol>${loop}</figure>`;
}

function renderLanes(d, id) {
  const lanes = d.lanes
    .map((lane, li) => {
      const steps = lane.steps
        .map((s, i) => {
          const last = i === lane.steps.length - 1;
          return `<li class="flow-step"><span class="flow-box"><span class="flow-n" aria-hidden="true">${i + 1}</span><span class="flow-text">${esc(s)}</span></span>${last ? '' : arrow()}</li>`;
        })
        .join('');
      return `<div class="lane"><p class="lane-label" id="${id}-lane${li + 1}">${esc(lane.label)}</p><ol class="flow-steps" role="list" aria-labelledby="${id}-lane${li + 1}">${steps}</ol></div>`;
    })
    .join('');
  return `<figure class="figure flow flow-column lanes" aria-labelledby="${id}-cap"><figcaption class="figure-cap" id="${id}-cap">${esc(d.caption)}</figcaption>${lanes}</figure>`;
}

function renderSequence(d, id) {
  const heads = d.participants.map((p) => `<span class="seq-head">${esc(p)}</span>`).join('');
  const msgs = d.messages
    .map((m, i) => {
      const lo = Math.min(m.from, m.to);
      const hi = Math.max(m.from, m.to);
      const dir = m.to > m.from ? 'right' : 'left';
      return `<li class="seq-step span-${lo + 1}-${hi + 1} to-${dir}"><span class="seq-route"><span class="seq-n">${i + 1}.</span> ${esc(d.participants[m.from])}<span class="seq-arrow" aria-hidden="true"> ${dir === 'right' ? '→' : '←'} </span><span class="sr-only"> to </span>${esc(
        d.participants[m.to],
      )}<span class="sr-only">:</span></span><span class="seq-msg">${esc(m.text)}</span></li>`;
    })
    .join('');
  return `<figure class="figure seq" aria-labelledby="${id}-cap"><figcaption class="figure-cap" id="${id}-cap">${esc(d.caption)}</figcaption><div class="seq-heads" aria-hidden="true">${heads}</div><ol class="seq-steps" role="list">${msgs}</ol></figure>`;
}

export function renderDiagram(key) {
  const d = DIAGRAMS[key];
  if (!d) throw new Error('No drawing for diagram ' + key);
  const id = 'fig-' + key;
  if (d.kind === 'flow') return renderFlow(d, id);
  if (d.kind === 'lanes') return renderLanes(d, id);
  if (d.kind === 'sequence') return renderSequence(d, id);
  throw new Error('Unknown diagram kind ' + d.kind);
}
