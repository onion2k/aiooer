// The model directory's markup: the filters, the table and a details panel
// for each model.
//
// Everything is in the HTML the build writes. The table is whole before any
// script runs, and each model's details are a native <details>, so a reader
// with JavaScript off still gets every model and everything known about it.
// What src/reader.js adds is the searching and filtering, which are a
// convenience over a list that is already complete.

import { esc, longDate, longMonth } from './inline.mjs';
import { ICONS } from './icons.mjs';
import { CAPABILITIES, ACCESS, STATUS } from './models.mjs';

const cap = (key) => ICONS[`cap${key === '3d' ? '3d' : key[0].toUpperCase() + key.slice(1)}`];
const access = (key) => ICONS[`access${key[0].toUpperCase() + key.slice(1)}`];

// One checkbox. Its words are the label, so a filter is never a colour or an
// icon alone, and the icon beside it is hidden from a screen reader.
function choice(group, value, label, icon) {
  const id = `filter-${group}-${value}`;
  return `<label class="choice filter-choice" for="${id}"><input type="checkbox" id="${id}" name="${group}" value="${value}">${
    icon ? icon : ''
  }<span class="choice-label">${esc(label)}</span></label>`;
}

function filters(dir) {
  const providers = dir.providers
    .map((p) => choice('provider', p.toLowerCase().replace(/[^a-z0-9]+/g, '-'), p, ''))
    .join('');
  const kinds = Object.entries(ACCESS)
    .map(([key, a]) => choice('access', key, a.label, access(key)))
    .join('');
  const does = dir.capabilities.map((key) => choice('does', key, CAPABILITIES[key].label, cap(key))).join('');
  const states = dir.statuses.map((key) => choice('status', key, STATUS[key], '')).join('');
  // On a narrow screen the filters are taller than the window, so they fold
  // away behind a summary. It is open in the markup, so a reader without
  // JavaScript gets them whatever the width; reader.js closes it only where
  // the stylesheet shows the summary, which keeps the width in one place.
  return `<details class="filter-panel" open><summary class="filter-toggle"><span>Search and filter</span>${
    ICONS.chevron
  }</summary><form class="filters" id="model-filters"><fieldset class="filter-group filter-search"><legend class="setting-legend label">Search</legend><div class="search-field">${
    ICONS.search
  }<label class="sr-only" for="model-search">Search models by name or provider</label><input type="search" id="model-search" name="search" placeholder="Model or provider" autocomplete="off"></div></fieldset><fieldset class="filter-group"><legend class="setting-legend label">How you get it</legend><div class="choices">${kinds}</div></fieldset><fieldset class="filter-group"><legend class="setting-legend label">What it does</legend><div class="choices">${does}</div></fieldset><fieldset class="filter-group filter-providers"><legend class="setting-legend label">Still current</legend><div class="choices">${states}</div></fieldset><fieldset class="filter-group filter-providers"><legend class="setting-legend label">Provider</legend><div class="choices">${providers}</div></fieldset><div class="filter-actions"><button type="reset" class="btn-line">${
    ICONS.reset
  }<span>Clear the filters</span></button></div></form></details>`;
}

// What a model does. In a row it is icons alone, so a reader can take a
// column of them in at a glance; each carries its name for a screen reader
// and as a tooltip, and the details panel spells them all out in words. An
// icon with no name anywhere would be a column nobody could read.
function doesCell(m) {
  return `<ul class="does does-icons" role="list">${m.does
    .map(
      (key) =>
        `<li class="does-item" title="${esc(CAPABILITIES[key].label)}">${cap(key)}<span class="sr-only">${esc(
          CAPABILITIES[key].label,
        )}</span></li>`,
    )
    .join('')}</ul>`;
}

// The same, named, for the details panel.
function doesNamed(m) {
  return `<ul class="does does-named" role="list">${m.does
    .map((key) => `<li class="does-item">${cap(key)}<span>${esc(CAPABILITIES[key].label)}</span></li>`)
    .join('')}</ul>`;
}

function row(m, i, checked) {
  const id = `model-${i}`;
  const kind = ACCESS[m.access];
  const label = (text) => `<span class="cell-label">${text}</span>`;
  // The control sits in the model's own row, and what it opens is a row of
  // its own beneath, spanning every column. A table cannot nest one row
  // inside another, so the two are joined by id rather than by containment.
  //
  // The panel is open in the markup and shut by src/reader.js on load, so a
  // reader without JavaScript gets every model's notes rather than a button
  // that does nothing.
  return `<tr class="model-row" data-name="${esc(m.name.toLowerCase())}" data-provider="${esc(
    m.provider.toLowerCase(),
  )}" data-access="${m.access}" data-status="${m.status}" data-does="${esc(m.does.join(' '))}">
<th scope="row" class="model-name">${label('Model')}<span class="model-name-text">${esc(m.name)}</span></th>
<td class="model-provider">${label('Provider')}${esc(m.provider)}</td>
<td class="model-access">${label('How you get it')}<span class="access-mark">${access(m.access)}<span>${esc(
    kind.label,
  )}</span></span></td>
<td class="model-size">${label('Size')}${esc(m.size)}</td>
<td class="model-released">${label('Released')}${esc(longMonth(m.released))}</td>
<td class="model-state is-${m.status}">${label('Status')}${esc(STATUS[m.status])}</td>
<td class="model-does">${label('What it does')}${doesCell(m)}</td>
<td class="model-more"><button type="button" class="model-toggle" aria-expanded="true" aria-controls="${id}"><span>Details<span class="sr-only">: ${esc(
    m.name,
  )}</span></span>${ICONS.chevron}</button></td>
</tr>
<tr class="model-extra" id="${id}">
<td colspan="8"><div class="model-body grid-12">
<div class="model-col model-col-notes"><p class="model-notes">${esc(m.notes)}</p></div>
<div class="model-col model-col-does"><p class="model-fact-label">What it does</p>${doesNamed(
    m,
  )}<p class="model-fact-label model-released-label">Released</p><p class="model-released-value">${esc(
    longMonth(m.released),
  )}</p><p class="model-fact-label model-released-label">Checked</p><p class="model-released-value">${esc(
    checked,
  )}</p></div>
<div class="model-col model-col-facts"><dl class="model-facts">${[
    ['Context', m.context || 'Not published'],
    ['Price', m.price || 'Not published'],
    ['Cutoff', m.cutoff || 'Not published'],
    ['Licence', m.licence || 'Not published'],
  ]
    .map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`)
    .join('')}</dl><p class="model-source"><a href="${esc(
    m.source,
  )}" target="_blank" rel="noopener noreferrer" class="ext">Where this came from<span class="sr-only"> for ${esc(
    m.name,
  )} (opens in a new tab)</span>${ICONS.external}</a></p></div>
</div></td>
</tr>`;
}

export function directory(dir) {
  const rows = dir.models.map((m, i) => row(m, i, longDate(dir.checked))).join('');
  return `${filters(dir)}<p class="model-count" role="status" aria-live="polite" data-total="${
    dir.models.length
  }">Showing all ${dir.models.length} models.</p><div class="table-wrap"><table class="data models" role="table" aria-labelledby="directory-title"><thead role="rowgroup"><tr role="row"><th scope="col">Model</th><th scope="col">Provider</th><th scope="col">How you get it</th><th scope="col">Size</th><th scope="col">Released</th><th scope="col">Status</th><th scope="col">What it does</th><th scope="col"><span class="sr-only">Details</span></th></tr></thead><tbody role="rowgroup">${rows}</tbody></table></div><p class="model-none" hidden>No model matches those filters.</p>`;
}
