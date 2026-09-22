// The learning directory, without its picture: content/learning.json into a
// list of sections the page can draw. It makes no HTML.
//
// The list is picked by hand and will grow by hand, so every field is checked
// and anything unknown stops the build. Without that, a link filed under a
// section that does not exist would vanish from the page, and nobody would
// know it had been added.

import fs from 'node:fs';
import path from 'node:path';

const SECTION_FIELDS = ['key', 'heading', 'about'];
const REQUIRED = ['title', 'by', 'kind', 'about', 'url'];
const ALLOWED = [...REQUIRED, 'published'];

const CHECKED = /^\d{4}-\d{2}-\d{2}$/;
// A year, or a year and a month, as with a model's release: most of these
// pages do not give a day, and nothing here pretends to one.
const PUBLISHED = /^\d{4}(-\d{2})?$/;
const KEY = /^[a-z][a-z0-9-]*$/;

const filled = (v) => typeof v === 'string' && v.trim() !== '';

export function parseLearning(dir) {
  const raw = JSON.parse(fs.readFileSync(path.join(dir, 'learning.json'), 'utf8'));
  for (const key of Object.keys(raw))
    if (!['checked', 'about', 'sections', 'links'].includes(key))
      throw new Error(`learning.json has an unknown field "${key}"`);
  if (!CHECKED.test(raw.checked ?? '')) throw new Error('learning.json needs a "checked" date, as 2026-09-22');
  // What the page says about itself is the author's, in the content, like
  // the model directory's.
  if (!Array.isArray(raw.about) || !raw.about.length) throw new Error('learning.json has no "about" paragraphs');
  for (const p of raw.about)
    if (typeof p !== 'string' || p.trim().length < 20) throw new Error('learning.json has an empty "about" paragraph');
  if (!Array.isArray(raw.sections) || !raw.sections.length) throw new Error('learning.json has no sections');
  if (!Array.isArray(raw.links) || !raw.links.length) throw new Error('learning.json has no links');

  const sections = raw.sections.map((s, i) => {
    const where = s.key ? `the section "${s.key}"` : `the section at position ${i + 1}`;
    for (const key of Object.keys(s))
      if (!SECTION_FIELDS.includes(key)) throw new Error(`${where} has an unknown field "${key}"`);
    for (const key of SECTION_FIELDS) if (!filled(s[key])) throw new Error(`${where} has no ${key}`);
    if (!KEY.test(s.key)) throw new Error(`${where} needs a key of lower-case letters, digits and hyphens`);
    return { ...s, links: [] };
  });
  const byKey = new Map();
  for (const s of sections) {
    if (byKey.has(s.key)) throw new Error(`the section "${s.key}" is declared twice`);
    byKey.set(s.key, s);
  }

  const seen = new Set();
  raw.links.forEach((l, i) => {
    const where = filled(l.title) ? `"${l.title}"` : `the link at position ${i + 1}`;
    for (const key of Object.keys(l))
      if (!ALLOWED.includes(key)) throw new Error(`${where} has an unknown field "${key}"`);
    for (const key of REQUIRED) if (!filled(l[key])) throw new Error(`${where} has no ${key}`);
    if (!/^https:\/\/[^\s"]+$/.test(l.url)) throw new Error(`${where} needs an https address, not "${l.url}"`);
    if (seen.has(l.url)) throw new Error(`${where} links to ${l.url}, which is listed already`);
    seen.add(l.url);
    if (l.published !== undefined && !PUBLISHED.test(l.published))
      throw new Error(`${where} was published "${l.published}", which is not a year or a year and a month`);
    const home = byKey.get(l.kind);
    if (!home)
      throw new Error(`${where} is filed under "${l.kind}", which is not one of ${[...byKey.keys()].join(', ')}`);
    home.links.push({ ...l, host: new URL(l.url).hostname.replace(/^www\./, '') });
  });

  // A heading with nothing under it tells a reader something is here that is
  // not, so a section waits in the file until it has a link.
  for (const s of sections) if (!s.links.length) throw new Error(`the section "${s.key}" has no links`);

  return { checked: raw.checked, about: raw.about, sections, count: raw.links.length };
}
