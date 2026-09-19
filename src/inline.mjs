// Turns markdown's inline tokens into HTML, setting the text as a typesetter
// would: curly quotes, a real multiplication sign, raised exponents. Without
// it the pages would show typewriter quotes and "10^23", which read worse and
// which a screen reader speaks as "caret".

import { ICONS } from './icons.mjs';

export const PAGE_FILES = {
  '0a139f54-ef01': 'Main.dc.html',
  '590c1ae1-8bf3': 'Part1.dc.html',
  '5086e893-fa85': 'Part2.dc.html',
  '48a4ae01-75ae': 'Part3.dc.html',
  'cadfcb5f-9a30': 'Part4.dc.html',
  '3e89a4fc-a0bc': 'Part5.dc.html',
  'bbb9efdd-e221': 'Part6.dc.html',
  '7c41d2a9-1e05': 'Images1.dc.html',
  '2f9be6c3-5a17': 'Images2.dc.html',
  'e08a7d54-9b32': 'Images3.dc.html',
};

export function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Straight quotes become curly ones. A quote opens when it follows the start
// of the run, a space or an opening bracket, and closes otherwise. The state
// carries the previous character across tokens, so a quote after bold text
// is judged by what really came before it.
function smarten(text, state) {
  let out = '';
  for (const ch of text) {
    const prev = state.prev;
    const opens = prev === '' || /[\s([{—–/-]/.test(prev);
    if (ch === '"') out += opens ? '“' : '”';
    else if (ch === "'") out += opens ? '‘' : '’';
    else out += ch;
    state.prev = ch;
  }
  return out;
}

function typeset(text, state) {
  let t = smarten(text, state);
  // "6 x N x D" and "2 x 80 x 8": a multiplication, not the letter x.
  t = t.replace(/(?<=[\w)]) x (?=[\w(])/g, ' × ');
  t = esc(t);
  // "10^23" is ten to the power 23.
  t = t.replace(/(\d+)\^(\d+)/g, '$1<sup>$2</sup>');
  return t;
}

export function linkTarget(href) {
  const m = /^file\/([0-9a-f-]+)$/.exec(href);
  if (m) {
    const file = PAGE_FILES[m[1]];
    if (!file) throw new Error('Unknown internal link ' + href);
    return { href: file, external: false };
  }
  if (/^https?:\/\//.test(href)) return { href, external: true };
  throw new Error('Unexpected link ' + href);
}

export function renderInline(tokens, state = { prev: '' }) {
  let html = '';
  for (const tok of tokens || []) {
    switch (tok.type) {
      case 'text':
        html += tok.tokens ? renderInline(tok.tokens, state) : typeset(unescapeEntities(tok.text), state);
        break;
      case 'escape':
        html += typeset(unescapeEntities(tok.text), state);
        break;
      case 'strong':
        html += '<strong>' + renderInline(tok.tokens, state) + '</strong>';
        break;
      case 'em':
        html += '<em>' + renderInline(tok.tokens, state) + '</em>';
        break;
      case 'codespan':
        html += '<code>' + esc(unescapeEntities(tok.text)) + '</code>';
        state.prev = 'x';
        break;
      case 'link': {
        const target = linkTarget(tok.href);
        const inner = renderInline(tok.tokens, state);
        html += target.external
          ? `<a href="${esc(target.href)}" target="_blank" rel="noopener noreferrer" class="ext">${inner}<span class="sr-only"> (opens in a new tab)</span>${ICONS.external}</a>`
          : `<a href="${target.href}">${inner}</a>`;
        break;
      }
      case 'br':
        html += '<br>';
        break;
      default:
        throw new Error('Unhandled inline token ' + tok.type);
    }
  }
  return html;
}

// marked hands over text with &, <, > and quotes already escaped. Typesetting
// needs the real characters, and esc() puts the escaping back afterwards.
export function unescapeEntities(s) {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

// Plain text of inline tokens, for ids, labels and headings.
export function plainText(tokens) {
  let s = '';
  for (const tok of tokens || []) {
    if (tok.tokens) s += plainText(tok.tokens);
    else if (tok.type === 'br') s += ' ';
    else s += unescapeEntities(tok.text ?? '');
  }
  return s;
}

export function smartPlain(text) {
  return smarten(text, { prev: '' });
}
