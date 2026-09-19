// The parts every page shares: the skip link, the header with its two
// panels (the course's parts, and reading settings), the page contents list,
// the previous and next links and the footer. Keeping them in one place is
// what makes navigation identical on every page (WCAG 3.2.3 and 3.2.4); a
// page that drew its own header would drift.

import { esc } from './inline.mjs';
import { ICONS } from './icons.mjs';
import { SETTINGS } from './logic.mjs';

export const COURSE_TITLE = 'How Frontier LLMs Work';

const SETTING_LEGENDS = {
  theme: 'Colours',
  size: 'Text size',
  spacing: 'Line spacing',
  measure: 'Line length',
  font: 'Typeface',
  deep: 'Deep dives',
};

function settingGroup(key) {
  const swatch = key === 'theme' ? '<span class="swatch swatch-{{o.value}}" aria-hidden="true">Aa</span>' : '';
  const count = SETTINGS[key].length;
  return `<fieldset class="setting setting-${key}"><legend class="setting-legend label">${SETTING_LEGENDS[key]}</legend><div class="choices"><sc-for list="{{options.${key}}}" as="o" hint-placeholder-count="${count}"><label class="choice"><input type="radio" name="setting-${key}" value="{{o.value}}" checked="{{o.checked}}" onChange="{{o.pick}}">${swatch}<span class="choice-label">{{o.label}}</span></label></sc-for></div></fieldset>`;
}

function settingsPanel() {
  const groups = Object.keys(SETTINGS).map(settingGroup).join('');
  return `<div class="panel settings-panel" id="settings-panel" role="region" aria-labelledby="settings-title" hidden="{{settingsPanel.hidden}}" onKeyDown="{{settingsPanel.onKeyDown}}"><div class="shell panel-inner"><div class="panel-head"><h2 class="panel-title" id="settings-title">Reading settings</h2><p class="panel-note">Changes apply straight away. <sc-if value="{{remembers}}" hint-placeholder-val="{{ true }}">This device remembers them for every page of the course.</sc-if></p></div><div class="settings-grid grid-12">${groups}</div><div class="panel-actions"><button type="button" class="btn-line" onClick="{{reset}}">${ICONS.reset}<span>Reset to defaults</span></button><button type="button" class="btn-line" onClick="{{settingsPanel.close}}">${ICONS.close}<span>Close reading settings</span></button></div></div></div>`;
}

function partsPanel(parts, current) {
  const items = parts
    .map((p) => {
      const here = current === p.n;
      return `<li class="parts-item${here ? ' is-current' : ''}"><a class="parts-link" href="Part${p.n}.dc.html"${here ? ' aria-current="page"' : ''}><span class="parts-num label">Part ${p.n}</span><span class="parts-title">${esc(p.shortTitle)}</span></a><span class="parts-time label">${esc(p.time)}${here ? '<span class="parts-here"> · You are here</span>' : ''}</span></li>`;
    })
    .join('');
  const introHere = current === 0;
  return `<nav class="panel parts-panel" id="parts-panel" aria-label="Course parts" hidden="{{parts.hidden}}" onKeyDown="{{parts.onKeyDown}}"><div class="shell panel-inner"><p class="parts-intro"><a class="parts-home" href="Main.dc.html"${introHere ? ' aria-current="page"' : ''}>${ICONS.book}<span>Course introduction</span></a></p><ol class="parts-list grid-12" role="list">${items}</ol><div class="panel-actions"><button type="button" class="btn-line" onClick="{{parts.close}}">${ICONS.close}<span>Close the list of parts</span></button></div></div></nav>`;
}

export function header(parts, current) {
  const homeCurrent = current === 0 ? ' aria-current="page"' : '';
  return `<a class="skip-link" href="#main">Skip to main content</a><header class="site-header"><div class="shell header-bar grid-12"><a class="wordmark" href="Main.dc.html"${homeCurrent}>${COURSE_TITLE}</a><div class="header-actions"><button type="button" class="header-btn" aria-expanded="{{parts.expanded}}" aria-controls="parts-panel" onClick="{{parts.toggle}}" ref="{{parts.buttonRef}}">${ICONS.parts}<span>Parts</span></button><button type="button" class="header-btn" aria-expanded="{{settingsPanel.expanded}}" aria-controls="settings-panel" onClick="{{settingsPanel.toggle}}" ref="{{settingsPanel.buttonRef}}">${ICONS.settings}<span>Reading settings</span></button></div></div>${partsPanel(parts, current)}${settingsPanel()}</header>`;
}

// The contents list. Each item carries the spy's state for its section
// (past, current or next) as a class, and the current one says so to a
// screen reader with aria-current. Each heading also carries a copy of
// itself for the stylesheet, which keeps room for it in bold.
export function toc(sections) {
  const items = sections
    .map((s, i) => {
      const num =
        s.number !== null
          ? `<span class="toc-num" aria-hidden="true">${String(s.number).padStart(2, '0')}</span>`
          : '<span class="toc-num" aria-hidden="true"></span>';
      const label = s.number !== null ? `<span class="sr-only">Section ${s.number}: </span>` : '';
      return `<li class="is-{{spy.s${i}.state}}"><a href="#${s.id}" aria-current="{{spy.s${i}.current}}">${num}<span class="toc-text" data-bold="${esc(s.heading)}"><span>${label}${esc(s.heading)}</span></span></a></li>`;
    })
    .join('');
  return `<nav class="toc" aria-labelledby="toc-title"><h2 class="toc-title" id="toc-title"><span class="toc-static label">On this page</span><button type="button" class="toc-toggle" aria-expanded="{{toc.expanded}}" aria-controls="toc-list" onClick="{{toc.toggle}}"><span>On this page</span>${ICONS.chevron}</button></h2><ol class="toc-list" id="toc-list" role="list" hidden="{{toc.hidden}}">${items}</ol></nav>`;
}

export function crumbs(n, shortTitle) {
  return `<nav class="crumbs label" aria-label="Breadcrumb"><ol role="list"><li><a href="Main.dc.html">Course introduction</a><span class="crumb-sep" aria-hidden="true">/</span></li><li><a href="Part${n}.dc.html" aria-current="page">Part ${n}: ${esc(shortTitle)}</a></li></ol></nav>`;
}

export function pager(n, parts) {
  const prev =
    n === 1
      ? { href: 'Main.dc.html', label: 'Course introduction' }
      : { href: `Part${n - 1}.dc.html`, label: `Part ${n - 1}: ${parts[n - 2].shortTitle}` };
  const next =
    n === 6
      ? { href: 'Main.dc.html', label: 'Back to the course introduction', dir: 'End of the course' }
      : { href: `Part${n + 1}.dc.html`, label: `Part ${n + 1}: ${parts[n].shortTitle}` };
  return `<nav class="pager" aria-label="Previous and next"><a class="pager-link is-prev" href="${prev.href}"><span class="pager-dir label">${ICONS.arrowLeft}<span>Previous</span></span><span class="pager-title">${esc(prev.label)}</span></a><a class="pager-link is-next" href="${next.href}"><span class="pager-dir label"><span>${next.dir || 'Next'}</span>${ICONS.arrowRight}</span><span class="pager-title">${esc(next.label)}</span></a></nav>`;
}

export function footer(parts, currencyNote) {
  const links = [`<li><a href="Main.dc.html">Course introduction</a></li>`]
    .concat(parts.map((p) => `<li><a href="Part${p.n}.dc.html">Part ${p.n}: ${esc(p.shortTitle)}</a></li>`))
    .join('');
  return `<footer class="site-footer"><div class="shell grid-12"><p class="footer-title">${COURSE_TITLE}</p><nav class="footer-nav" aria-label="All pages"><ul class="footer-links" role="list">${links}</ul></nav><p class="footer-note">${currencyNote}</p></div></footer>`;
}
