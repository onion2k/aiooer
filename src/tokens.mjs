// The colour themes a reader can choose from, and the pairs of colours that
// must stay legible in each. Every page's stylesheet and the contrast check
// read from here, so a colour can only change in one place. Without it the
// check would test a copy of the palette, not the one the pages use.
//
// The look is Brutalist: a pale grey ground, near-black ink and heavy black
// rules, with two colours used hard, International Klein Blue for links,
// buttons and focus, and a signal yellow for the In plain terms blocks and
// for highlights. The theme keys are what a reader's saved settings hold, so
// they never change; only their labels and colours do.

// One muted hue per module, in the order the introduction declares them. They
// are a design language and never a meaning of their own: every place one
// appears also names its module in words, so a reader who cannot see the
// difference loses nothing. They are deliberately quieter than the blue and
// the yellow, which carry meaning and must keep the eye.
//
// The same seven serve every theme but high contrast, which has none: a mid
// tone reads against a near-white ground and a near-black one alike, and each
// clears 3.5:1 against every ground it can sit on, so a band is always a band
// and never a smudge. They carry no text, so nothing needs 7:1 on them.
export const HUE_NAMES = ['sand', 'coral', 'mint', 'periwinkle', 'apricot', 'aqua', 'lilac'];
export const HUE_COUNT = HUE_NAMES.length;

export const THEMES = {
  paper: {
    label: 'Light grey',
    bg: '#F3F3F2',
    sunk: '#E6E6E3',
    surface: '#FFFFFF',
    ink: '#0A0A0A',
    ink2: '#3B3B38',
    past: '#4F4F4C',
    rule: '#C4C4BF',
    edge: '#0A0A0A',
    link: '#002FA7',
    visited: '#5A2D9C',
    hover: '#001A66',
    onAccent: '#FFFFFF',
    focus: '#002FA7',
    focusBg: '#FFE500',
    focusInk: '#0A0A0A',
    plainBg: '#FFE500',
    plainEdge: '#0A0A0A',
    plainInk: '#0A0A0A',
    plainLink: '#002FA7',
    plainFocus: '#002FA7',
    deepBg: '#FFFFFF',
    deepEdge: '#0A0A0A',
    deepLabel: '#002FA7',
    trueInk: '#0A5A26',
    falseInk: '#A0180E',
    sayInk: '#002FA7',
    codeBg: '#0A0A0A',
    codeInk: '#F3F3F2',
    codeNote: '#B9B9B3',
    footerBg: '#0A0A0A',
    footerInk: '#F3F3F2',
    footerLink: '#FFE500',
    select: '#FFE500',
    selectInk: '#0A0A0A',
    hue1: '#E0D2BB', // sand
    hue2: '#FFB0A3', // coral
    hue3: '#A9E4C3', // mint
    hue4: '#B7C6F5', // periwinkle
    hue5: '#F7CB9E', // apricot
    hue6: '#A3DCEA', // aqua
    hue7: '#DCBCEE', // lilac
  },
  white: {
    label: 'White',
    bg: '#FFFFFF',
    sunk: '#EDEDEA',
    surface: '#FFFFFF',
    ink: '#0A0A0A',
    ink2: '#3B3B38',
    past: '#565653',
    rule: '#C9C9C4',
    edge: '#0A0A0A',
    link: '#002FA7',
    visited: '#5A2D9C',
    hover: '#001A66',
    onAccent: '#FFFFFF',
    focus: '#002FA7',
    focusBg: '#FFE500',
    focusInk: '#0A0A0A',
    plainBg: '#FFE500',
    plainEdge: '#0A0A0A',
    plainInk: '#0A0A0A',
    plainLink: '#002FA7',
    plainFocus: '#002FA7',
    deepBg: '#FFFFFF',
    deepEdge: '#0A0A0A',
    deepLabel: '#002FA7',
    trueInk: '#0A5A26',
    falseInk: '#A0180E',
    sayInk: '#002FA7',
    codeBg: '#0A0A0A',
    codeInk: '#F3F3F2',
    codeNote: '#B9B9B3',
    footerBg: '#0A0A0A',
    footerInk: '#F3F3F2',
    footerLink: '#FFE500',
    select: '#FFE500',
    selectInk: '#0A0A0A',
    hue1: '#E0D2BB', // sand
    hue2: '#FFB0A3', // coral
    hue3: '#A9E4C3', // mint
    hue4: '#B7C6F5', // periwinkle
    hue5: '#F7CB9E', // apricot
    hue6: '#A3DCEA', // aqua
    hue7: '#DCBCEE', // lilac
  },
  dark: {
    label: 'Dark',
    bg: '#111111',
    sunk: '#1E1E1D',
    surface: '#181818',
    ink: '#F3F3F2',
    ink2: '#C9C9C4',
    past: '#A3A39F',
    rule: '#3E3E3B',
    edge: '#F3F3F2',
    link: '#9DB1FF',
    visited: '#D3BAFF',
    hover: '#C6D2FF',
    onAccent: '#111111',
    focus: '#FFE500',
    focusBg: '#FFE500',
    focusInk: '#111111',
    plainBg: '#E6CF00',
    plainEdge: '#E6CF00',
    plainInk: '#111111',
    plainLink: '#111111',
    plainFocus: '#111111',
    deepBg: '#181818',
    deepEdge: '#F3F3F2',
    deepLabel: '#9DB1FF',
    trueInk: '#8FDCA9',
    falseInk: '#FFA08F',
    sayInk: '#9DB1FF',
    codeBg: '#000000',
    codeInk: '#F3F3F2',
    codeNote: '#BDBDB7',
    footerBg: '#000000',
    footerInk: '#F3F3F2',
    footerLink: '#FFE500',
    select: '#FFE500',
    selectInk: '#111111',
    hue1: '#403C35', // sand
    hue2: '#4E3632', // coral
    hue3: '#2F4037', // mint
    hue4: '#373C4A', // periwinkle
    hue5: '#463A2D', // apricot
    hue6: '#2F3F43', // aqua
    hue7: '#423948', // lilac
  },
  contrast: {
    label: 'High contrast',
    bg: '#000000',
    sunk: '#000000',
    surface: '#000000',
    ink: '#FFFFFF',
    ink2: '#FFFFFF',
    past: '#B3B3B3',
    rule: '#FFFFFF',
    edge: '#FFFFFF',
    link: '#FFFF00',
    visited: '#FFB8FF',
    hover: '#FFFFFF',
    onAccent: '#000000',
    focus: '#00FFFF',
    focusBg: '#00FFFF',
    focusInk: '#000000',
    plainBg: '#000000',
    plainEdge: '#FFFF00',
    plainInk: '#FFFFFF',
    plainLink: '#FFFF00',
    plainFocus: '#00FFFF',
    deepBg: '#000000',
    deepEdge: '#FFFFFF',
    deepLabel: '#FFFFFF',
    trueInk: '#FFFFFF',
    falseInk: '#FFFFFF',
    sayInk: '#FFFFFF',
    codeBg: '#000000',
    codeInk: '#FFFFFF',
    codeNote: '#FFFFFF',
    footerBg: '#000000',
    footerInk: '#FFFFFF',
    footerLink: '#FFFF00',
    select: '#FFFF00',
    selectInk: '#000000',
    hue1: '#FFFFFF', // sand
    hue2: '#FFFFFF', // coral
    hue3: '#FFFFFF', // mint
    hue4: '#FFFFFF', // periwinkle
    hue5: '#FFFFFF', // apricot
    hue6: '#FFFFFF', // aqua
    hue7: '#FFFFFF', // lilac
  },
};

export const THEME_ORDER = ['paper', 'white', 'dark', 'contrast'];

// Text colours and the backgrounds each is drawn on. AAA asks 7:1 of all text
// here, including large text, so that nothing depends on a size exception.
export const TEXT_PAIRS = [
  ['ink', 'bg'],
  ['ink', 'sunk'],
  ['ink', 'surface'],
  ['ink', 'deepBg'],
  ['ink2', 'bg'],
  ['ink2', 'surface'],
  ['ink2', 'sunk'],
  ['ink2', 'deepBg'],
  // The contents list dims the sections a reader has passed; dim, not faint.
  ['past', 'bg'],
  // A block turned inside out on hover or when chosen: ink behind, bg as text.
  ['bg', 'ink'],
  ['surface', 'ink'],
  ['link', 'bg'],
  ['link', 'surface'],
  ['link', 'sunk'],
  ['link', 'deepBg'],
  ['visited', 'bg'],
  ['visited', 'surface'],
  ['visited', 'sunk'],
  ['visited', 'deepBg'],
  ['hover', 'bg'],
  ['hover', 'surface'],
  ['hover', 'sunk'],
  ['onAccent', 'link'],
  ['onAccent', 'hover'],
  ['focusInk', 'focusBg'],
  ['plainInk', 'plainBg'],
  ['plainLink', 'plainBg'],
  ['deepLabel', 'deepBg'],
  ['trueInk', 'surface'],
  ['falseInk', 'surface'],
  ['sayInk', 'surface'],
  ['codeInk', 'codeBg'],
  ['codeNote', 'codeBg'],
  ['footerInk', 'footerBg'],
  ['footerLink', 'footerBg'],
  ['selectInk', 'select'],
];

// Boundaries and indicators that must stand out from what surrounds them:
// 3:1 for component edges (1.4.11) and for the focus ring (2.4.13). The
// footer is a dark block in every theme, so its ring is the footer link colour.
// A module's hue is decoration: it is never behind text and nothing depends
// on telling one from another, so WCAG asks nothing of it and 1.4.11 does not
// apply. What it does need is to look deliberate, which is a window rather
// than a floor. Too faint and a band is a smudge; too strong and it competes
// with the blue and the yellow, which carry meaning and must keep the eye.
export const HUE_RANGE = { min: 1.15, max: 2.2 };
export const HUE_PAIRS = Array.from({ length: 7 }, (_, i) => `hue${i + 1}`).flatMap((h) => [
  [h, 'bg'],
  [h, 'surface'],
  [h, 'sunk'],
]);

export const UI_PAIRS = [
  ['edge', 'bg'],
  ['edge', 'surface'],
  ['edge', 'sunk'],
  ['focus', 'bg'],
  ['focus', 'surface'],
  ['focus', 'sunk'],
  ['plainFocus', 'plainBg'],
  ['focus', 'deepBg'],
  ['footerLink', 'footerBg'],
  ['link', 'bg'],
  ['plainEdge', 'bg'],
];

export function luminance(hex) {
  const n = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255);
  const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
