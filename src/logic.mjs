// Writes the logic class each page runs: the reader's display settings, the
// three disclosure panels and the deep dives. Every page shares the same class
// so a setting behaves identically everywhere; only the constants at the top
// differ per page (its deep dives, and for the showcase boards a fixed start).
// Without it the settings panel would be a picture of a settings panel.

export const SETTINGS = {
  theme: [
    ['paper', 'Paper'],
    ['white', 'White'],
    ['dark', 'Dark'],
    ['contrast', 'High contrast'],
  ],
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
const STORE_KEY = 'how-frontier-llms-work/reading-settings/v1';

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

class Component extends DCLogic {
  constructor(props) {
    super(props);
    const dd = {};
    for (const key of DEEP_OPEN_AT_START) dd[key] = true;
    this.state = { chosen: {}, saved: {}, open: OPEN_AT_START, tocOpen: TOC_OPEN_AT_START, dd };
    this.buttons = {};
  }

  componentDidMount() {
    if (REMEMBER) this.setState({ saved: readSaved() });
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
    return {
      s,
      options,
      dd,
      parts: panel('parts'),
      settingsPanel: panel('settings'),
      toc: {
        expanded: this.state.tocOpen ? 'true' : 'false',
        hidden: !this.state.tocOpen,
        toggle: () => this.setState({ tocOpen: !this.state.tocOpen }),
      },
      reset: () => this.reset(),
      remembers: REMEMBER,
    };
  }
}
`;
}
