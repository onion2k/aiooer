// Reads the course's markdown files and turns each into a page model: its
// title, date and sections, with the course's recurring devices ("In plain
// terms", deep dives, misconceptions, glossaries) recognised as what they are.
// The renderer draws from these models, so a device the parser misses would
// show up as plain paragraphs and lose its design.

import fs from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';
import { plainText } from './inline.mjs';

export const PART_SOURCES = [
  { n: 1, file: 'Part 1 How an LLM works.md', out: 'Part1.dc.html' },
  { n: 2, file: 'Part 2 How models are built.md', out: 'Part2.dc.html' },
  { n: 3, file: 'Part 3 Running models.md', out: 'Part3.dc.html' },
  { n: 4, file: 'Part 4 Building with models.md', out: 'Part4.dc.html' },
  { n: 5, file: 'Part 5 AI in the team.md', out: 'Part5.dc.html' },
  { n: 6, file: 'Part 6 Strategy and communication.md', out: 'Part6.dc.html' },
];

export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[‘’'"“”]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function lex(dir, file) {
  return marked.lexer(fs.readFileSync(path.join(dir, file), 'utf8'));
}

function isBylineParagraph(tok) {
  return tok.type === 'paragraph' && /^\d{4}-\d{2}-\d{2} · /.test(tok.text);
}

function startsWithStrong(tok, label) {
  const first = tok.tokens?.[0];
  return first?.type === 'strong' && plainText(first.tokens).trim() === label;
}

// A paragraph that is nothing but bold text is a heading in disguise.
function isBoldOnly(tok) {
  return tok.type === 'paragraph' && tok.tokens.length === 1 && tok.tokens[0].type === 'strong';
}

// "**"Will this replace developers?"** It replaces..." is a question and answer.
function isQuestion(tok) {
  const first = tok.tokens?.[0];
  if (tok.type !== 'paragraph' || first?.type !== 'strong') return false;
  const q = plainText(first.tokens).trim();
  return /^".+"$/.test(q);
}

function splitPlain(tok) {
  // "**In plain terms.** Summary... **Who should read it:** guidance."
  const tokens = tok.tokens.slice(1);
  const whoIndex = tokens.findIndex((t) => t.type === 'strong' && plainText(t.tokens).trim() === 'Who should read it:');
  if (whoIndex < 0) throw new Error('In plain terms without "Who should read it": ' + tok.text.slice(0, 80));
  return { summary: trimTokens(tokens.slice(0, whoIndex)), who: trimTokens(tokens.slice(whoIndex + 1)) };
}

// Drops the space left over at either end once a bold label is cut out.
function trimTokens(tokens) {
  const out = tokens.map((t) => ({ ...t }));
  if (out[0]?.type === 'text') out[0] = { ...out[0], text: out[0].text.replace(/^\s+/, ''), tokens: undefined };
  const last = out.length - 1;
  if (out[last]?.type === 'text')
    out[last] = { ...out[last], text: out[last].text.replace(/\s+$/, ''), tokens: undefined };
  return out.filter((t) => !(t.type === 'text' && t.text === ''));
}

function splitMythPart(tok) {
  const label = plainText(tok.tokens[0].tokens).trim().replace(/:$/, '');
  return { label, tokens: trimTokens(tok.tokens.slice(1)) };
}

function uniqueId(base, used) {
  let id = base || 'section';
  let n = 2;
  while (used.has(id)) id = `${base}-${n++}`;
  used.add(id);
  return id;
}

export function parsePart(dir, src) {
  const tokens = lex(dir, src.file);
  const used = new Set(['main', 'top', 'toc-list', 'parts-panel', 'settings-panel', 'toc-title', 'settings-title']);
  const h1 = tokens.find((t) => t.type === 'heading' && t.depth === 1);
  const full = plainText(h1.tokens);
  const m = /^Part (\d+): (.*)$/.exec(full);
  if (!m || Number(m[1]) !== src.n) throw new Error('Unexpected title ' + full);
  const rest = m[2];
  const colon = rest.indexOf(': ');
  const title = colon >= 0 ? rest.slice(0, colon) : rest;
  const subtitle = colon >= 0 ? rest.slice(colon + 2) : null;
  const byline = tokens.find(isBylineParagraph);
  const date = byline ? byline.text.slice(0, 10) : null;

  const sections = [];
  let section = null;
  let deep = null;
  let myth = null;
  let deepCount = 0;
  let diagramCount = 0;

  const push = (block) => {
    if (deep) deep.blocks.push(block);
    else if (myth) throw new Error('Unexpected block inside a misconception: ' + JSON.stringify(block).slice(0, 120));
    else section.blocks.push(block);
  };
  const closeNested = () => {
    deep = null;
    myth = null;
  };

  for (const tok of tokens) {
    if (tok === h1 || tok === byline || tok.type === 'space') continue;
    if (tok.type === 'heading' && tok.depth === 2) {
      closeNested();
      const text = plainText(tok.tokens);
      const num = /^(\d+)\. (.*)$/.exec(text);
      const heading = num ? num[2] : text;
      const kind = num
        ? 'numbered'
        : {
            'About this part': 'about',
            'Say it two ways': 'twoWays',
            'Misconceptions to correct': 'myths',
            Glossary: 'glossary',
            Sources: 'sources',
            'Core explanations': 'core',
            'Misconceptions quick reference': 'quickref',
          }[text];
      if (!kind) throw new Error('Unknown section ' + text);
      section = {
        kind,
        number: num ? Number(num[1]) : null,
        heading,
        id: uniqueId(slugify(heading), used),
        blocks: [],
      };
      sections.push(section);
      continue;
    }
    if (!section) throw new Error('Content before the first section in ' + src.file);
    if (tok.type === 'heading' && tok.depth === 3) {
      closeNested();
      const text = plainText(tok.tokens);
      const dd = /^Deep dive \(optional\): (.*)$/.exec(text);
      if (dd) {
        deepCount++;
        deep = {
          type: 'deep',
          key: 'd' + deepCount,
          id: uniqueId('deep-dive-' + slugify(dd[1]), used),
          title: dd[1],
          blocks: [],
        };
        section.blocks.push(deep);
      } else if (section.kind === 'myths') {
        myth = { type: 'myth', id: uniqueId('myth-' + slugify(text), used), claim: text, parts: [] };
        section.blocks.push(myth);
      } else {
        section.blocks.push({ type: 'h3', id: uniqueId(slugify(text), used), tokens: tok.tokens, text });
      }
      continue;
    }
    if (
      myth &&
      tok.type === 'paragraph' &&
      ['True:', 'Misleading:', 'What to say:'].some((l) => startsWithStrong(tok, l))
    ) {
      myth.parts.push(splitMythPart(tok));
      continue;
    }
    if (tok.type === 'paragraph' && startsWithStrong(tok, 'In plain terms.')) {
      if (deep || myth) throw new Error('In plain terms inside a nested block');
      section.blocks.push({ type: 'plain', ...splitPlain(tok) });
      continue;
    }
    if (tok.type === 'code' && tok.lang === 'mermaid') {
      diagramCount++;
      push({ type: 'diagram', key: `part${src.n}-${diagramCount}`, source: tok.text });
      continue;
    }
    if (tok.type === 'code') {
      push({ type: 'code', lang: tok.lang || null, text: tok.text });
      continue;
    }
    if (isBoldOnly(tok)) {
      closeNested();
      const text = plainText(tok.tokens);
      section.blocks.push({ type: 'h3', id: uniqueId(slugify(text), used), tokens: tok.tokens[0].tokens, text });
      continue;
    }
    if (isQuestion(tok)) {
      const q = plainText(tok.tokens[0].tokens).trim();
      push({ type: 'qa', id: uniqueId('q-' + slugify(q), used), question: q, answer: trimTokens(tok.tokens.slice(1)) });
      continue;
    }
    if (tok.type === 'table' && section.kind === 'glossary') {
      push({
        type: 'glossary',
        entries: tok.rows.map((r) => ({ term: r[0], meaning: r[1], id: uniqueId('term-' + slugify(r[0].text), used) })),
      });
      continue;
    }
    if (tok.type === 'paragraph') push({ type: 'p', tokens: tok.tokens });
    else if (tok.type === 'list') push({ type: 'list', ordered: tok.ordered, start: tok.start, items: tok.items });
    else if (tok.type === 'table') push({ type: 'table', header: tok.header, rows: tok.rows });
    else throw new Error(`Unhandled block ${tok.type} in ${src.file}`);
  }

  for (const s of sections) {
    for (const b of s.blocks) {
      if (b.type === 'myth' && b.parts.map((p) => p.label).join('|') !== 'True|Misleading|What to say') {
        throw new Error('Misconception with unexpected parts: ' + b.claim);
      }
    }
  }
  return { ...src, title, subtitle, fullTitle: full, date, sections, deepKeys: collectDeepKeys(sections) };
}

function collectDeepKeys(sections) {
  const keys = [];
  for (const s of sections) for (const b of s.blocks) if (b.type === 'deep') keys.push(b.key);
  return keys;
}

// The course introduction becomes the home page. Its sections are kept as
// token lists, and the home page renderer lays each one out in its own way.
export function parseIntro(dir) {
  const tokens = lex(dir, 'Course introduction.md');
  const h1 = tokens.find((t) => t.type === 'heading' && t.depth === 1);
  const full = plainText(h1.tokens);
  const [courseTitle, pageTitle] = full.split(': ');
  const byline = tokens.find(isBylineParagraph);
  const sections = {};
  let current = null;
  for (const tok of tokens) {
    if (tok === h1 || tok === byline || tok.type === 'space') continue;
    if (tok.type === 'heading' && tok.depth === 2) {
      current = { heading: plainText(tok.tokens), blocks: [] };
      sections[current.heading] = current;
      continue;
    }
    current.blocks.push(tok);
  }
  const partsTable = sections['The six parts'].blocks.find((b) => b.type === 'table');
  const parts = partsTable.rows.map((row) => {
    const link = row[0].tokens.find((t) => t.type === 'link');
    const label = plainText(link.tokens);
    const mm = /^Part (\d+): (.*)$/.exec(label);
    return {
      n: Number(mm[1]),
      shortTitle: mm[2],
      outcomeTokens: row[1].tokens,
      outcome: row[1].text,
      time: row[2].text,
    };
  });
  return { courseTitle, pageTitle, date: byline ? byline.text.slice(0, 10) : null, sections, parts };
}
