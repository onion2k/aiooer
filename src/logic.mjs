// Writes the logic class each page runs: the reader's display settings, the
// three disclosure panels, the deep dives, and the spy that follows the reader
// down a part in its contents. Every page shares the same class so a setting
// behaves identically everywhere; only the constants at the top differ per
// page (its deep dives and sections, and for the showcase boards a fixed
// start). Without it the settings panel would be a picture of a settings panel.

import { THEMES, THEME_ORDER } from './tokens.mjs';
import { cleanDays, cleanSaving, delivery } from './calculator.mjs';

// The theme's stored value is its key in tokens.mjs, which never changes; its
// label is whatever tokens.mjs calls it now.
export const SETTINGS = {
  theme: THEME_ORDER.map((key) => [key, THEMES[key].label]),
  size: [
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

export function dataProps(page) {
  const props = {};
  const start = { ...DEFAULTS, ...(page.start || {}) };
  for (const [key, options] of Object.entries(SETTINGS)) {
    props[key] = {
      editor: 'enum',
      options: options.map((o) => o[0]),
      default: start[key],
      section: 'Reading settings',
    };
  }
  props.$preview = { width: page.w, height: page.h };
  return JSON.stringify(props).replace(/&/g, '&amp;').replace(/'/g, '&#39;');
}

export function logicScript(page) {
  const constants = {
    DEEP_KEYS: page.deepKeys || [],
    START: { ...DEFAULTS, ...(page.start || {}) },
    OPEN_AT_START: page.openAtStart || null,
    DEEP_OPEN_AT_START: page.deepOpenAtStart || [],
    TOC_OPEN_AT_START: !!page.tocOpen,
    REMEMBER: page.remember !== false,
    SPY_IDS: page.spyIds || [],
    // The part's calculator, if it has one: its stages and its examples.
    CALC: page.calculator || null,
  };
  return `
const SETTINGS = ${JSON.stringify(SETTINGS)};
const DEFAULTS = ${JSON.stringify(DEFAULTS)};
const DEEP_KEYS = ${JSON.stringify(constants.DEEP_KEYS)};
const START = ${JSON.stringify(constants.START)};
const OPEN_AT_START = ${JSON.stringify(constants.OPEN_AT_START)};
const DEEP_OPEN_AT_START = ${JSON.stringify(constants.DEEP_OPEN_AT_START)};
const TOC_OPEN_AT_START = ${JSON.stringify(constants.TOC_OPEN_AT_START)};
const REMEMBER = ${JSON.stringify(constants.REMEMBER)};
const STORE_KEY = ${JSON.stringify(STORE_KEY)};
const SPY_IDS = ${JSON.stringify(constants.SPY_IDS)};
const CALC = ${JSON.stringify(constants.CALC)};
// The calculator's arithmetic, written in from calculator.mjs by its source,
// so that the page and the audit work from one rule.
${constants.CALC ? [cleanDays, cleanSaving, delivery].map(String).join('\n') : ''}

function isOption(key, value) {
  return SETTINGS[key].some((o) => o[0] === value);
}

// Only keys and values the panel could have written are trusted from storage.
function cleanSaved(saved) {
  const out = {};
  if (!saved || typeof saved !== 'object') return out;
  for (const key of Object.keys(SETTINGS)) if (isOption(key, saved[key])) out[key] = saved[key];
  return out;
}

function readSaved() {
  try {
    return cleanSaved(JSON.parse(window.localStorage.getItem(STORE_KEY) || 'null'));
  } catch (e) {
    // Storage is unavailable in some sandboxed frames; defaults still work.
    return {};
  }
}

function writeSaved(saved) {
  try {
    if (Object.keys(saved).length) window.localStorage.setItem(STORE_KEY, JSON.stringify(saved));
    else window.localStorage.removeItem(STORE_KEY);
  } catch (e) {
    // As above: the choice still applies to this page.
  }
}

// The section the reader is in, as an index into SPY_IDS: the last whose
// heading has risen past a line 30% of the way down the window. At the top of
// the page, before any heading reaches the line, that is the first. Scrolled
// to the very end it is the last, since a short last section can finish below
// the line and would otherwise never be reached. A page that does not scroll
// at all, like a board drawn at its full height, stays on the first.
function sectionInView() {
  const view = window.innerHeight;
  const end = document.documentElement.scrollHeight - view;
  if (end <= 0) return 0;
  let index = 0;
  let last = 0;
  SPY_IDS.forEach((id, i) => {
    const heading = document.getElementById(id);
    if (!heading) return;
    last = i;
    if (heading.getBoundingClientRect().top <= view * 0.3) index = i;
  });
  return window.scrollY >= end - 2 ? last : index;
}

class Component extends DCLogic {
  constructor(props) {
    super(props);
    const dd = {};
    for (const key of DEEP_OPEN_AT_START) dd[key] = true;
    this.state = {
      chosen: {},
      saved: {},
      open: OPEN_AT_START,
      tocOpen: TOC_OPEN_AT_START,
      dd,
      spy: 0,
      calc: this.calcStart(),
    };
    this.buttons = {};
    this.frame = 0;
  }

  componentDidMount() {
    if (REMEMBER) this.setState({ saved: readSaved() });
    if (!SPY_IDS.length) return;
    // Scrolling fires many times a frame; the spy looks once a frame at most,
    // and the page redraws only when the section changes.
    this.followSoon = () => {
      if (this.frame) return;
      this.frame = window.requestAnimationFrame(() => {
        this.frame = 0;
        this.follow();
      });
    };
    window.addEventListener('scroll', this.followSoon, { passive: true });
    window.addEventListener('resize', this.followSoon);
    this.follow();
  }

  // A new text size or line length, or a deep dive opening, moves the
  // headings without any scrolling, so every redraw looks again.
  componentDidUpdate() {
    if (this.followSoon) this.followSoon();
  }

  // The canvas swaps in a fresh copy of this class when the page is edited,
  // and the old copy's listeners must go with it or they pile up.
  componentWillUnmount() {
    if (!this.followSoon) return;
    window.removeEventListener('scroll', this.followSoon);
    window.removeEventListener('resize', this.followSoon);
    window.cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.followSoon = null;
  }

  follow() {
    const spy = sectionInView();
    if (spy !== this.state.spy) this.setState({ spy });
  }

  // A choice made in this page's panel wins; then a value set on the design
  // board; then what the reader chose on another page; then the default.
  settings() {
    const out = {};
    for (const key of Object.keys(SETTINGS)) {
      const fromProps = isOption(key, this.props[key]) && this.props[key] !== START[key] ? this.props[key] : null;
      out[key] = this.state.chosen[key] || fromProps || this.state.saved[key] || START[key];
    }
    return out;
  }

  choose(key, value) {
    const chosen = Object.assign({}, this.state.chosen, { [key]: value });
    const saved = Object.assign({}, this.state.saved, { [key]: value });
    const patch = { chosen, saved };
    if (key === 'deep') patch.dd = {};
    this.setState(patch);
    if (REMEMBER) writeSaved(saved);
  }

  reset() {
    this.setState({ chosen: {}, saved: {}, dd: {} });
    if (REMEMBER) writeSaved({});
  }

  toggle(panel) {
    this.setState({ open: this.state.open === panel ? null : panel });
  }

  // Escape closes an open panel and puts focus back on the button that
  // opened it, so a keyboard user is never left inside a closed region.
  closeOnEscape(panel) {
    return (event) => {
      if (event.key !== 'Escape' || this.state.open !== panel) return;
      event.stopPropagation();
      this.setState({ open: null });
      const button = this.buttons[panel];
      if (button && button.focus) button.focus();
    };
  }

  // The calculator as the markdown declares it: each stage's days, and no
  // time saved anywhere.
  calcStart() {
    if (!CALC) return null;
    return { days: CALC.stages.map((st) => st.days), saved: CALC.stages.map(() => 0) };
  }

  calcSet(field, index, value) {
    const calc = { days: this.state.calc.days.slice(), saved: this.state.calc.saved.slice() };
    calc[field][index] = field === 'days' ? cleanDays(value) : cleanSaving(value);
    this.setState({ calc });
  }

  // Everything the calculator's markup shows. The bars are drawn against the
  // longest stage as it stands now, so they keep their scale as savings move.
  calcVals() {
    if (!CALC) return null;
    const { days, saved } = this.state.calc;
    const d = delivery(CALC.stages.map((st, i) => ({ days: days[i], saved: saved[i] })));
    const longest = Math.max(1, ...d.rows.map((r) => r.days));
    const unit = CALC.unit;
    const any = d.rows.some((r) => r.saved > 0);
    const faster =
      d.faster === null
        ? d.before > 0 && any
          ? 'takes no time at all'
          : 'is unchanged'
        : d.faster === 0
          ? any
            ? 'is less than 1% faster'
            : 'is unchanged'
          : 'is ' + d.faster + '% faster';
    const helped = d.rows.filter((r) => r.saved > 0).length;
    const note = !any
      ? 'Move a slider, or try an example, to see what a saving in one stage does to the whole.'
      : helped === 1
        ? 'One stage of ' + d.rows.length + ' is faster. The other ' + (d.rows.length - 1) + ' take as long as they did, so they set the pace.'
        : helped === d.rows.length
          ? 'Every stage is faster, so the whole line moves.'
          : helped + ' stages of ' + d.rows.length + ' are faster. The rest take as long as they did.';
    return {
      rows: d.rows.map((r, i) => ({
        name: CALC.stages[i].name,
        days: r.days,
        saved: r.saved,
        savedText: r.saved + '% of ' + r.days + ' ' + unit + ' saved',
        after: r.after,
        barNow: Math.round((r.days / longest) * 1000) / 10,
        barAfter: Math.round((r.after / longest) * 1000) / 10,
        setDays: (event) => this.calcSet('days', i, event.target.value),
        setSaved: (event) => this.calcSet('saved', i, event.target.value),
      })),
      before: d.before,
      after: d.after,
      faster,
      note,
      presets: CALC.presets.map((p) => ({
        label: p.label,
        apply: () =>
          this.setState({
            calc: {
              days: this.state.calc.days.slice(),
              saved: CALC.stages.map((st) => (st.name in p.saved ? p.saved[st.name] : p.saved.all || 0)),
            },
          }),
      })),
      reset: () => this.setState({ calc: this.calcStart() }),
    };
  }

  renderVals() {
    const s = this.settings();
    const options = {};
    for (const [key, list] of Object.entries(SETTINGS)) {
      options[key] = list.map(([value, label]) => ({
        value,
        label,
        checked: s[key] === value,
        pick: () => this.choose(key, value),
      }));
    }
    const open = this.state.open;
    const dd = {};
    for (const key of DEEP_KEYS) {
      const explicit = this.state.dd[key];
      const isOpen = explicit === undefined ? s.deep === 'open' : explicit;
      dd[key] = {
        expanded: isOpen ? 'true' : 'false',
        hidden: !isOpen,
        toggle: () => this.setState({ dd: Object.assign({}, this.state.dd, { [key]: !isOpen }) }),
      };
    }
    const panel = (name) => ({
      expanded: open === name ? 'true' : 'false',
      hidden: open !== name,
      toggle: () => this.toggle(name),
      close: () => {
        this.setState({ open: null });
        const button = this.buttons[name];
        if (button && button.focus) button.focus();
      },
      onKeyDown: this.closeOnEscape(name),
      buttonRef: (el) => {
        this.buttons[name] = el;
      },
    });
    const spy = {};
    SPY_IDS.forEach((id, i) => {
      const here = this.state.spy;
      spy['s' + i] = {
        state: i < here ? 'past' : i === here ? 'current' : 'next',
        current: i === here ? 'location' : null,
      };
    });
    return {
      s,
      options,
      dd,
      spy,
      parts: panel('parts'),
      settingsPanel: panel('settings'),
      toc: {
        expanded: this.state.tocOpen ? 'true' : 'false',
        hidden: !this.state.tocOpen,
        toggle: () => this.setState({ tocOpen: !this.state.tocOpen }),
      },
      reset: () => this.reset(),
      remembers: REMEMBER,
      calc: this.calcVals(),
    };
  }
}
`;
}
