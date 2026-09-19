// The site's icons, drawn inline so they take the text colour of whatever
// they sit beside and so every theme, including high contrast, recolours them
// for free. Each one is hidden from assistive technology, because every icon
// here sits next to words that already say what it means.

const svg = (body, cls = '') =>
  `<svg class="icon${cls ? ' ' + cls : ''}" aria-hidden="true" focusable="false" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;

export const ICONS = {
  parts: svg('<path d="M5 6h14"></path><path d="M5 12h14"></path><path d="M5 18h9"></path>'),
  settings: svg(
    '<path d="M3 7V5h11v2"></path><path d="M8.5 5v14"></path><path d="M6.5 19h4"></path><path d="M14 13v-1.5h7V13"></path><path d="M17.5 11.5V19"></path><path d="M16 19h3"></path>',
  ),
  chevron: svg('<path d="M6 9l6 6 6-6"></path>', 'chev'),
  close: svg('<path d="M6 6l12 12"></path><path d="M18 6L6 18"></path>'),
  arrowLeft: svg('<path d="M19 12H5"></path><path d="M11 18l-6-6 6-6"></path>'),
  arrowRight: svg('<path d="M5 12h14"></path><path d="M13 6l6 6-6 6"></path>'),
  arrowDown: svg('<path d="M12 4v15"></path><path d="M6 13l6 6 6-6"></path>'),
  plain: svg('<path d="M20 12a8 8 0 0 1-11.3 7.3L4 20.5l1.2-4.4A8 8 0 1 1 20 12z"></path>'),
  deep: svg('<path d="M12 3l9 5-9 5-9-5 9-5z"></path><path d="M3 13l9 5 9-5"></path>'),
  isTrue: svg('<circle cx="12" cy="12" r="9"></circle><path d="M8 12.5l2.7 2.7L16.2 9.6"></path>'),
  misleading: svg('<path d="M12 3.8l9 16H3l9-16z"></path><path d="M12 10v4.2"></path><path d="M12 17.2v.3"></path>'),
  say: svg('<path d="M4 5h16v11H10l-6 4V5z"></path><path d="M8.5 9.5h7"></path><path d="M8.5 12.5h4.5"></path>'),
  loop: svg(
    '<path d="M20 11a8 8 0 0 0-14.3-4.3L4 8.5"></path><path d="M4 4v4.5h4.5"></path><path d="M4 13a8 8 0 0 0 14.3 4.3L20 15.5"></path><path d="M20 20v-4.5h-4.5"></path>',
  ),
  clock: svg('<circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3.2 2"></path>'),
  calendar: svg(
    '<rect x="3.5" y="5" width="17" height="15.5" rx="2"></rect><path d="M3.5 10h17"></path><path d="M8 3v4"></path><path d="M16 3v4"></path>',
  ),
  outcome: svg(
    '<circle cx="12" cy="12" r="8.5"></circle><circle cx="12" cy="12" r="4.5"></circle><circle cx="12" cy="12" r="0.8" fill="currentColor"></circle>',
  ),
  book: svg(
    '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"></path><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"></path>',
  ),
  glossary: svg(
    '<path d="M4 4h11a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3z"></path><path d="M8 8h6"></path><path d="M8 12h6"></path>',
  ),
  twoWays: svg(
    '<path d="M4 7h11"></path><path d="M12 4l3 3-3 3"></path><path d="M20 17H9"></path><path d="M12 14l-3 3 3 3"></path>',
  ),
  source: svg(
    '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"></path><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"></path>',
  ),
  text: svg('<path d="M4 6h16"></path><path d="M4 10h16"></path><path d="M4 14h16"></path><path d="M4 18h10"></path>'),
  reset: svg('<path d="M4 12a8 8 0 1 0 2.3-5.7L4 8.5"></path><path d="M4 4v4.5h4.5"></path>'),
};
