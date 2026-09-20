// The site's icons, from IBM's Carbon icon library (@carbon/icons, Apache
// 2.0), inlined from the package's 32px drawings when the site is built. Each
// takes the colour of the text beside it, so every theme recolours it, and
// each is hidden from assistive technology, because every icon here sits next
// to words that already say what it means. A name the library does not have,
// or a drawing carrying markup the page cannot take, stops the build, so an
// icon can never go missing quietly.

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const CARBON = path.join(path.dirname(require.resolve('@carbon/icons/package.json')), 'svg', '32');

// What each icon is for on the site, and its name in Carbon.
export const ICON_NAMES = {
  parts: 'list',
  settings: 'text--scale',
  chevron: 'chevron--down',
  close: 'close',
  arrowLeft: 'arrow--left',
  arrowRight: 'arrow--right',
  arrowDown: 'arrow--down',
  plain: 'chat',
  deep: 'layers',
  isTrue: 'checkmark--outline',
  misleading: 'warning--alt',
  say: 'quotes',
  loop: 'renew',
  clock: 'time',
  calendar: 'calendar',
  outcome: 'flag',
  book: 'book',
  glossary: 'catalog',
  twoWays: 'arrows--horizontal',
  source: 'link',
  reset: 'reset',
  external: 'arrow--up-right',
  search: 'search',
  filter: 'filter',
  models: 'machine-learning-model',
  // What a model can do, and how it is got hold of. models.mjs names these.
  capChat: 'chat',
  capReasoning: 'idea',
  capTools: 'api',
  capCode: 'code',
  capVision: 'view',
  capImages: 'image',
  capAudio: 'microphone',
  capVideo: 'video',
  capMusic: 'music',
  cap3d: 'cube',
  capEmbedding: 'search',
  accessHosted: 'cloud',
  accessOpen: 'download',
};

// Reads one drawing and keeps only its shapes: the library's titles, style
// blocks and the transparent frame some icons carry are dropped, and every
// shape is closed explicitly, so the markup parses the same everywhere.
export function loadIcon(name, dir = CARBON) {
  const file = path.join(dir, `${name}.svg`);
  if (!fs.existsSync(file)) throw new Error(`Carbon has no icon called "${name}"`);
  const svg = fs.readFileSync(file, 'utf8');
  const viewBox = /viewBox="([^"]+)"/.exec(svg)?.[1];
  if (!viewBox) throw new Error(`Carbon's "${name}" has no viewBox`);
  const body = svg
    .replace(/^[\s\S]*?<svg[^>]*>/, '')
    .replace(/<\/svg>\s*$/, '')
    .replace(/<title>[\s\S]*?<\/title>/g, '')
    .replace(/<defs>[\s\S]*?<\/defs>/g, '')
    .replace(/<rect[^>]*(?:Transparent|fill:\s*none|class="cls-1")[^>]*\/>/g, '')
    .replace(/<(path|circle|rect|polygon|polyline|ellipse|line)((?:\s+[a-zA-Z-]+="[^"]*")*)\s*\/>/g, '<$1$2></$1>')
    .trim();
  if (!body || /style=|class=|<style|<image|<use|<g\b|\/>/.test(body)) {
    throw new Error(`Carbon's "${name}" has markup the page cannot take: ${body.slice(0, 100)}`);
  }
  return { viewBox, body };
}

function svg({ viewBox, body }, extraClass) {
  const cls = extraClass ? `icon ${extraClass}` : 'icon';
  return `<svg class="${cls}" aria-hidden="true" focusable="false" width="24" height="24" viewBox="${viewBox}" fill="currentColor">${body}</svg>`;
}

const EXTRA_CLASS = { chevron: 'chev', external: 'icon-ext' };

export const ICONS = Object.fromEntries(
  Object.entries(ICON_NAMES).map(([key, name]) => [key, svg(loadIcon(name), EXTRA_CLASS[key])]),
);
