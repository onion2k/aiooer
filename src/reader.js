// The page in the browser, and the only implementation of how it behaves: the
// reading settings, the header's panels, the deep dives, the contents
// following the reader, and the lifecycle calculator. Plain script, no build step, no
// dependencies, and it starts from the markup the build wrote, so a reader
// with JavaScript turned off still gets the whole course with its default
// settings.

(function () {
  'use strict';

  var STORE_KEY = 'how-frontier-llms-work/reading-settings/v1';
  var reader = document.querySelector('.reader');
  if (!reader) return;
  // The build's own check asks each page whether this ran.
  document.documentElement.setAttribute('data-reader', 'on');

  // ---- The reading settings. Each is a class on .reader, as the build wrote
  // it, so choosing one swaps that class and nothing else.
  var KEYS = ['theme', 'size', 'spacing', 'measure', 'font'];

  // What the page itself offers for a setting, read from the panel the build
  // wrote, so the options live in one place and this never has to repeat them.
  function optionsFor(key) {
    var out = [];
    var inputs = document.querySelectorAll('input[name="setting-' + key + '"]');
    for (var o = 0; o < inputs.length; o++) out.push(inputs[o].value);
    return out;
  }

  // Saved settings are a reader's, from whatever version of the site wrote
  // them, so they are not to be trusted: a setting that has since been
  // renamed or dropped would otherwise put a class on the page that no
  // stylesheet knows, and the reader would get a page with no theme at all.
  // Anything the panel does not offer is discarded and the default stands.
  function readSaved() {
    var clean = {};
    try {
      var raw = JSON.parse(window.localStorage.getItem(STORE_KEY) || 'null');
      if (!raw || typeof raw !== 'object') return clean;
      for (var k in raw) {
        if (Object.prototype.hasOwnProperty.call(raw, k) && optionsFor(k).indexOf(raw[k]) !== -1) clean[k] = raw[k];
      }
    } catch (e) {
      // Storage is unavailable in a private window; the defaults still work.
    }
    return clean;
  }

  function writeSaved(saved) {
    try {
      if (Object.keys(saved).length) window.localStorage.setItem(STORE_KEY, JSON.stringify(saved));
      else window.localStorage.removeItem(STORE_KEY);
    } catch (e) {
      // As above: the choice still applies to this page.
    }
  }

  // The class a key currently has, which is also what the build wrote, so the
  // defaults never have to be repeated here.
  function classFor(key) {
    var found = null;
    reader.classList.forEach(function (c) {
      if (c.indexOf(key + '-') === 0) found = c;
    });
    return found;
  }

  function apply(key, value) {
    var old = classFor(key);
    if (old) reader.classList.remove(old);
    reader.classList.add(key + '-' + value);
    // Deep dives follow the setting: open means every one open.
    if (key === 'deep') setAllDives(value === 'open');
  }

  function setAllDives(open) {
    var toggles = document.querySelectorAll('.deep-toggle');
    for (var i = 0; i < toggles.length; i++) setDive(toggles[i], open);
    // As in toggleExpanded: the headings have all moved, so the contents have
    // to look again even though the page did not scroll.
    followSoon();
  }

  var saved = readSaved();

  // A phone starts at the smaller text size, since Standard is set for a
  // reader further from the screen. A phone is narrow and touched: the width
  // is the stylesheet's own 40em, and the touch is what tells a phone from a
  // desktop window zoomed to that width, whose reader zoomed in to make the
  // text bigger and would not thank the page for shrinking it. This is where
  // the page starts, not a choice, so it is not saved, and Reset comes back to
  // it; a reader who picks Standard keeps Standard.
  var atStart = {};
  for (var k in saved) atStart[k] = saved[k];
  if (!atStart.size && window.matchMedia && window.matchMedia('(max-width: 40em) and (pointer: coarse)').matches)
    atStart.size = 'smaller';

  for (var i = 0; i < KEYS.length; i++) {
    var key = KEYS[i];
    if (atStart[key]) {
      apply(key, atStart[key]);
      var input = document.querySelector('input[name="setting-' + key + '"][value="' + atStart[key] + '"]');
      if (input) input.checked = true;
    }
  }
  if (saved.deep === 'open') setAllDives(true);

  document.addEventListener('change', function (event) {
    var input = event.target;
    if (!input.name || input.name.indexOf('setting-') !== 0) return;
    var key = input.name.slice('setting-'.length);
    if (key === 'deep') setAllDives(input.value === 'open');
    else apply(key, input.value);
    saved[key] = input.value;
    writeSaved(saved);
    follow();
  });

  var reset = document.querySelector('.settings-reset');
  if (reset)
    reset.addEventListener('click', function () {
      saved = {};
      writeSaved({});
      window.location.reload();
    });

  // ---- The header's panels, and the contents on a phone. Each button says
  // what it controls, so one handler serves them all.
  function toggleExpanded(button) {
    var id = button.getAttribute('aria-controls');
    var panel = id && document.getElementById(id);
    if (!panel) return;
    var open = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) panel.removeAttribute('hidden');
    else panel.setAttribute('hidden', '');
    // Opening a deep dive above the reader pushes every heading below it down
    // without the page scrolling, so nothing would tell the contents to look
    // again and they would go on marking the section the reader has left.
    followSoon();
  }

  var expanders = document.querySelectorAll('[aria-expanded][aria-controls]');
  for (var e = 0; e < expanders.length; e++) {
    (function (button) {
      button.addEventListener('click', function () {
        toggleExpanded(button);
      });
    })(expanders[e]);
  }

  // The settings panel's Close button does what Escape does, and puts the
  // focus back on the button that opened the panel rather than losing it.
  var settingsClose = document.querySelector('.settings-close');
  var settingsOpener = document.querySelector('button[aria-controls="settings-panel"]');
  if (settingsClose && settingsOpener)
    settingsClose.addEventListener('click', function () {
      toggleExpanded(settingsOpener);
      settingsOpener.focus();
    });

  // Escape shuts a panel and puts the focus back on the button that opened it.
  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    var open = document.querySelector('.site-header [aria-expanded="true"]');
    if (!open) return;
    toggleExpanded(open);
    open.focus();
  });

  // ---- Deep dives. The toggle and its body are a pair; the build marked
  // which body each opens.
  function setDive(toggle, open) {
    var id = toggle.getAttribute('aria-controls');
    var body = id && document.getElementById(id);
    if (!body) return;
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) body.removeAttribute('hidden');
    else body.setAttribute('hidden', '');
  }

  // ---- The contents follow the reader: the section being read is marked, and
  // the ones passed are dimmed. The rule is also the build's, so that both
  // sites mark the same section: the last heading to have risen past a line
  // 30% of the way down the window, the first before any has, and the last
  // when scrolled to the end.
  var items = [].slice.call(document.querySelectorAll('.toc-list li'));
  var ids = items
    .map(function (li) {
      var link = li.querySelector('a');
      var href = link && link.getAttribute('href');
      return href && href.charAt(0) === '#' ? href.slice(1) : null;
    })
    .filter(Boolean);

  function sectionInView() {
    var view = window.innerHeight;
    var end = document.documentElement.scrollHeight - view;
    if (end <= 0) return 0;
    var index = 0;
    var last = 0;
    for (var i = 0; i < ids.length; i++) {
      var heading = document.getElementById(ids[i]);
      if (!heading) continue;
      last = i;
      if (heading.getBoundingClientRect().top <= view * 0.3) index = i;
    }
    return window.scrollY >= end - 2 ? last : index;
  }

  var here = -1;
  function follow() {
    if (!items.length) return;
    var now = sectionInView();
    if (now === here) return;
    here = now;
    for (var i = 0; i < items.length; i++) {
      items[i].classList.toggle('is-past', i < now);
      items[i].classList.toggle('is-current', i === now);
      var link = items[i].querySelector('a');
      if (!link) continue;
      if (i === now) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  }

  var frame = 0;
  function followSoon() {
    if (frame) return;
    frame = window.requestAnimationFrame(function () {
      frame = 0;
      follow();
    });
  }
  window.addEventListener('scroll', followSoon, { passive: true });
  window.addEventListener('resize', followSoon);
  follow();

  // ---- The model directory's search and filters. The table is whole in the
  // HTML, so this only hides rows: a reader without JavaScript still has every
  // model, and a reader with it gets a way through them. The count is a live
  // region, because hiding rows is silent otherwise.
  var filterForm = document.getElementById('model-filters');
  if (filterForm) {
    // Each model's details are open in the markup, so a reader without this
    // script gets them all. With it they start shut and the row's own button
    // opens one. Shut is its own attribute rather than `hidden`, which the
    // filters use, so a model hidden by a filter comes back as it was.
    var toggles = [].slice.call(document.querySelectorAll('.model-toggle'));
    toggles.forEach(function (button) {
      var area = document.getElementById(button.getAttribute('aria-controls'));
      if (!area) return;
      area.setAttribute('data-shut', '');
      button.setAttribute('aria-expanded', 'false');
      button.addEventListener('click', function () {
        var shut = area.hasAttribute('data-shut');
        if (shut) area.removeAttribute('data-shut');
        else area.setAttribute('data-shut', '');
        button.setAttribute('aria-expanded', shut ? 'true' : 'false');
      });
    });

    // The filters are open in the markup so that they are there without this
    // script, and start folded with it, so what a reader meets is the table.
    var panel = filterForm.closest('details.filter-panel');
    if (panel) panel.open = false;
    var modelRows = [].slice.call(document.querySelectorAll('.model-row'));
    var count = document.querySelector('.model-count');
    var none = document.querySelector('.model-none');
    var total = Number(count.getAttribute('data-total'));
    var search = document.getElementById('model-search');

    var ticked = function (name) {
      var on = [];
      var boxes = filterForm.querySelectorAll('input[name="' + name + '"]:checked');
      for (var i = 0; i < boxes.length; i++) on.push(boxes[i].value);
      return on;
    };

    var sift = function () {
      var words = (search.value || '').trim().toLowerCase();
      var kinds = ticked('access');
      var does = ticked('does');
      var providers = ticked('provider');
      var states = ticked('status');
      var shown = 0;
      for (var i = 0; i < modelRows.length; i++) {
        var row = modelRows[i];
        var name = row.getAttribute('data-name');
        var provider = row.getAttribute('data-provider');
        var can = row.getAttribute('data-does').split(' ');
        var slug = provider.replace(/[^a-z0-9]+/g, '-');
        var ok =
          (!words || name.indexOf(words) !== -1 || provider.indexOf(words) !== -1) &&
          (!kinds.length || kinds.indexOf(row.getAttribute('data-access')) !== -1) &&
          (!providers.length || providers.indexOf(slug) !== -1) &&
          (!states.length || states.indexOf(row.getAttribute('data-status')) !== -1);
        // Every capability ticked has to be present, not just one of them:
        // asking for chat and vision means a model that does both.
        for (var d = 0; ok && d < does.length; d++) if (can.indexOf(does[d]) === -1) ok = false;
        row.hidden = !ok;
        // The details sit in a row of their own beneath, which has to go with
        // it or a hidden model leaves its panel behind.
        var extra = row.nextElementSibling;
        if (extra && extra.className.indexOf('model-extra') !== -1) extra.hidden = !ok;
        if (ok) shown++;
      }
      count.textContent =
        shown === total ? 'Showing all ' + total + ' models.' : 'Showing ' + shown + ' of ' + total + ' models.';
      none.hidden = shown !== 0;
    };

    filterForm.addEventListener('input', sift);
    filterForm.addEventListener('change', sift);
    // A reset empties the fields after this event, so the sift waits a tick.
    filterForm.addEventListener('reset', function () {
      window.setTimeout(sift, 0);
    });
    // The form does nothing on its own; filtering happens as you type.
    filterForm.addEventListener('submit', function (event) {
      event.preventDefault();
    });
  }

  // ---- The lifecycle calculator. Its arithmetic is written in below the
  // build, from calculator.mjs, so the page and this work from one rule.
  var calc = document.querySelector('.calc');
  if (calc && window.CALC_RULE) {
    var rows = [].slice.call(calc.querySelectorAll('.calc-row'));
    var unit = calc.getAttribute('data-unit') || 'days';
    var starting = rows.map(function (row) {
      return Number(row.querySelector('.calc-days').value);
    });

    var draw = function () {
      var stages = rows.map(function (row) {
        return {
          days: window.CALC_RULE.cleanDays(row.querySelector('.calc-days').value),
          saved: window.CALC_RULE.cleanSaving(row.querySelector('.calc-saved').value),
        };
      });
      var d = window.CALC_RULE.delivery(stages);
      var longest = Math.max.apply(
        null,
        [1].concat(
          d.rows.map(function (r) {
            return r.days;
          }),
        ),
      );
      d.rows.forEach(function (r, i) {
        var row = rows[i];
        row.querySelector('.calc-pct').textContent = r.saved + '%';
        row
          .querySelector('.calc-saved')
          .setAttribute('aria-valuetext', r.saved + '% of ' + r.days + ' ' + unit + ' saved');
        row.querySelector('.calc-after-n span').textContent = r.after + ' ' + unit;
        row.querySelector('.calc-bar-now').style.width = Math.round((r.days / longest) * 1000) / 10 + '%';
        row.querySelector('.calc-bar-after').style.width = Math.round((r.after / longest) * 1000) / 10 + '%';
      });
      var any = d.rows.some(function (r) {
        return r.saved > 0;
      });
      var helped = d.rows.filter(function (r) {
        return r.saved > 0;
      }).length;
      var faster =
        d.faster === null
          ? d.before > 0 && any
            ? 'takes no time at all'
            : 'is unchanged'
          : d.faster === 0
            ? any
              ? 'is less than 1% faster'
              : 'is unchanged'
            : 'is ' + d.faster + '% faster';
      var note = !any
        ? 'Move a slider, or try an example, to see what a saving in one stage does to the whole.'
        : helped === 1
          ? 'One stage of ' +
            d.rows.length +
            ' is faster. The other ' +
            (d.rows.length - 1) +
            ' take as long as they did, so they set the pace.'
          : helped === d.rows.length
            ? 'Every stage is faster, so the whole line moves.'
            : helped + ' stages of ' + d.rows.length + ' are faster. The rest take as long as they did.';
      var totals = calc.querySelectorAll('.calc-total strong');
      totals[0].textContent = d.before + ' ' + unit;
      totals[1].textContent = d.after + ' ' + unit;
      totals[2].textContent = faster;
      calc.querySelector('.calc-note').textContent = note;
    };

    calc.addEventListener('input', draw);
    calc.addEventListener('change', draw);

    var presets = [].slice.call(calc.querySelectorAll('.calc-preset:not(.calc-reset)'));
    presets.forEach(function (button) {
      button.addEventListener('click', function () {
        var saving = (button.getAttribute('data-saved') || '').split(',').map(Number);
        rows.forEach(function (row, i) {
          row.querySelector('.calc-saved').value = saving[i];
        });
        draw();
      });
    });
    var startAgain = calc.querySelector('.calc-reset');
    if (startAgain)
      startAgain.addEventListener('click', function () {
        rows.forEach(function (row, i) {
          row.querySelector('.calc-days').value = starting[i];
          row.querySelector('.calc-saved').value = 0;
        });
        draw();
      });
    draw();
  }
})();
