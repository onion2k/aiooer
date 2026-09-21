// The page as it loads: the reader's display settings, the three disclosure
// panels, the deep dives, the contents that follow the reader, and the
// calculator, each at the value the build writes into the markup. What
// happens once a reader touches any of them is src/reader.js, which is the
// only implementation of that behaviour.
//
// This used to write a whole logic class into every page for the Claude
// Design canvas to run, which meant the same behaviour existed twice, once
// here and once in reader.js. The canvas is gone and so is the class.

import { THEMES, THEME_ORDER } from './tokens.mjs';
import { delivery } from './calculator.mjs';

// The theme's stored value is its key in tokens.mjs, which never changes; its
// label is whatever tokens.mjs calls it now.
export const SETTINGS = {
  theme: THEME_ORDER.map((key) => [key, THEMES[key].label]),
  size: [
    ['smaller', 'Smaller'],
    ['standard', 'Standard'],
    ['large', 'Large'],
    ['larger', 'Larger'],
    ['largest', 'Largest'],
  ],
  spacing: [
    ['standard', 'Standard'],
    ['wide', 'Wide'],
    ['widest', 'Widest'],
  ],
  measure: [
    ['short', 'Short'],
    ['standard', 'Standard'],
    ['long', 'Long'],
  ],
  font: [
    ['sans', 'Sans serif'],
    ['serif', 'Serif'],
  ],
  deep: [
    ['folded', 'Folded'],
    ['open', 'Open'],
  ],
};

// Where a reader's choices are kept between pages. The shape stored under it
// must go on loading as the settings grow, which the audit's storage check
// holds. The key keeps the course's first name, How Frontier LLMs Work, on
// purpose: it is where readers' choices already are, and a new key would
// quietly lose every one of them.
export const STORE_KEY = 'how-frontier-llms-work/reading-settings/v1';

export const DEFAULTS = {
  theme: 'paper',
  size: 'standard',
  spacing: 'standard',
  measure: 'standard',
  font: 'sans',
  deep: 'folded',
};

// What the page's markup shows before anyone touches it. The build fills the
// holes with these, and src/reader.js takes over in the browser: this is the
// page as it loads, and reader.js is the page as it is used.
//
// These are values only. A handler belongs to reader.js, which binds its own
// by class and position, and the build drops any attribute that would hold
// one.
export function startingVals(page) {
  const start = { ...DEFAULTS, ...(page.start || {}) };
  const options = {};
  for (const [key, list] of Object.entries(SETTINGS)) {
    options[key] = list.map(([value, label]) => ({ value, label, checked: start[key] === value }));
  }
  // A deep dive is open if this page was built with it open, and otherwise
  // follows the deep dives setting.
  const openAtStart = new Set(page.deepOpenAtStart || []);
  const dd = {};
  for (const key of page.deepKeys || []) {
    const isOpen = openAtStart.has(key) ? true : start.deep === 'open';
    dd[key] = { expanded: isOpen ? 'true' : 'false', hidden: !isOpen };
  }
  // The reader has not scrolled, so the first section is the one being read.
  const spy = {};
  (page.spyIds || []).forEach((id, i) => {
    spy['s' + i] = { state: i === 0 ? 'current' : 'next', current: i === 0 ? 'location' : null };
  });
  const panel = (name) => ({
    expanded: (page.openAtStart || null) === name ? 'true' : 'false',
    hidden: (page.openAtStart || null) !== name,
  });
  return {
    s: start,
    options,
    dd,
    spy,
    parts: panel('parts'),
    settingsPanel: panel('settings'),
    toc: { expanded: page.tocOpen ? 'true' : 'false', hidden: !page.tocOpen },
    remembers: page.remember !== false,
    calc: calcVals(page.calculator),
  };
}

// The calculator as it opens: every stage at the days the markdown gives it
// and nothing saved yet. The arithmetic is calculator.mjs's, the same rule
// reader.js is handed, so the page cannot disagree with itself once a slider
// moves.
function calcVals(CALC) {
  if (!CALC) return null;
  const d = delivery(CALC.stages.map((st) => ({ days: st.days, saved: 0 })));
  const longest = Math.max(1, ...d.rows.map((r) => r.days));
  const unit = CALC.unit;
  return {
    rows: d.rows.map((r, i) => ({
      name: CALC.stages[i].name,
      days: r.days,
      saved: r.saved,
      savedText: r.saved + '% of ' + r.days + ' ' + unit + ' saved',
      after: r.after,
      barNow: Math.round((r.days / longest) * 1000) / 10,
      barAfter: Math.round((r.after / longest) * 1000) / 10,
    })),
    before: d.before,
    after: d.after,
    // Nothing is saved as the page opens, so the whole is unchanged and the
    // note invites the reader to move something.
    faster: 'is unchanged',
    note: 'Move a slider, or try an example, to see what a saving in one stage does to the whole.',
    presets: CALC.presets.map((p) => ({
      label: p.label,
      savedList: CALC.stages.map((st) => (st.name in p.saved ? p.saved[st.name] : p.saved.all || 0)).join(','),
    })),
  };
}
