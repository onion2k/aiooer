// The model directory, without its picture: content/models.json into a list
// the page can draw. It makes no HTML.
//
// A tool will keep this file up to date, so nothing here trusts it. Every
// field is checked, and anything unknown stops the build rather than reaching
// a reader as a blank cell or a missing icon. A directory that quietly loses
// a model is worse than one that will not build.

import fs from 'node:fs';
import path from 'node:path';

// What a model can do, and the icon that stands for it. The label is the
// words beside the icon, because an icon never says anything on its own here.
// A capability the page cannot draw is a capability it must not claim, so a
// name missing from this list stops the build.
export const CAPABILITIES = {
  chat: { label: 'Chat', icon: 'chat' },
  reasoning: { label: 'Reasoning', icon: 'idea' },
  tools: { label: 'Tool use', icon: 'api' },
  code: { label: 'Code', icon: 'code' },
  vision: { label: 'Reads images', icon: 'view' },
  images: { label: 'Makes images', icon: 'image' },
  audio: { label: 'Audio', icon: 'microphone' },
  video: { label: 'Video', icon: 'video' },
  music: { label: 'Music', icon: 'music' },
  '3d': { label: '3D', icon: 'cube' },
  embedding: { label: 'Embedding', icon: 'search' },
};

// How a model is got hold of, which is the division a reader most often wants
// to filter on: rent it from somebody, or download the weights.
export const ACCESS = {
  hosted: { label: 'Hosted', icon: 'cloud' },
  open: { label: 'Open weights', icon: 'download' },
};

// Whether a model is the one to reach for, or is still served but has been
// passed, or has been switched off. A directory that does not say so sends a
// reader to something that no longer exists.
export const STATUS = {
  current: 'Current',
  superseded: 'Superseded',
  retired: 'Retired',
};

const REQUIRED = ['name', 'provider', 'access', 'size', 'released', 'does', 'notes', 'status', 'source'];
const ALLOWED = [...REQUIRED, 'licence', 'context', 'price', 'cutoff'];

// A release date, as the provider gave it: a year, or a year and a month.
// Nothing here pretends to a day, because most providers do not give one.
const RELEASED = /^\d{4}(-\d{2})?$/;
const CHECKED = /^\d{4}-\d{2}-\d{2}$/;

export function parseModels(dir) {
  const file = path.join(dir, 'models.json');
  const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!CHECKED.test(raw.checked ?? '')) throw new Error('models.json needs a "checked" date, as 2026-09-20');
  if (!Array.isArray(raw.models) || !raw.models.length) throw new Error('models.json has no models');
  // What the page says about itself, in the author's words and not the code's,
  // so that changing it is an edit to the content like any other.
  if (!Array.isArray(raw.about) || !raw.about.length) throw new Error('models.json has no "about" paragraphs');
  for (const p of raw.about)
    if (typeof p !== 'string' || p.trim().length < 20) throw new Error(`models.json has an empty "about" paragraph`);

  const seen = new Set();
  const models = raw.models.map((m, i) => {
    const where = m.name ? `"${m.name}"` : `the model at position ${i + 1}`;
    for (const key of Object.keys(m))
      if (!ALLOWED.includes(key)) throw new Error(`${where} has an unknown field "${key}"`);
    for (const key of REQUIRED) if (m[key] === undefined || m[key] === '') throw new Error(`${where} has no ${key}`);
    if (seen.has(m.name)) throw new Error(`${where} is listed twice`);
    seen.add(m.name);
    if (!ACCESS[m.access])
      throw new Error(`${where} is "${m.access}", which is not ${Object.keys(ACCESS).join(' or ')}`);
    if (!RELEASED.test(m.released))
      throw new Error(`${where} was released "${m.released}", which is not a year or a year and a month`);
    if (!Array.isArray(m.does) || !m.does.length) throw new Error(`${where} says nothing about what it does`);
    for (const d of m.does)
      if (!CAPABILITIES[d])
        throw new Error(`${where} does "${d}", which is not one of ${Object.keys(CAPABILITIES).join(', ')}`);
    // Open weights without a licence is the one thing a reader must not be
    // left to guess: it decides whether they may use the model at all.
    if (m.access === 'open' && !m.licence) throw new Error(`${where} has open weights but no licence`);
    if (!STATUS[m.status]) throw new Error(`${where} is "${m.status}", which is not ${Object.keys(STATUS).join(', ')}`);
    // A claim about somebody else's product needs somewhere a reader can go
    // and check it, which is the whole difference between this and hearsay.
    if (!/^https:\/\/[^\s"]+$/.test(m.source)) throw new Error(`${where} has no source to check it against`);
    return { ...m, does: [...m.does] };
  });

  // Newest first, since a directory of models is read for what is new. Ties
  // fall back to the name so a build is byte-for-byte repeatable.
  models.sort((a, b) => b.released.localeCompare(a.released) || a.name.localeCompare(b.name));

  const providers = [...new Set(models.map((m) => m.provider))].sort();
  const statuses = Object.keys(STATUS).filter((k) => models.some((m) => m.status === k));
  const capabilities = Object.keys(CAPABILITIES).filter((k) => models.some((m) => m.does.includes(k)));
  return { checked: raw.checked, about: raw.about, models, providers, capabilities, statuses };
}
