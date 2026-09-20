// What the static site needs a browser for. On the canvas the page's runtime
// does all of this; a page served from an ordinary web server has only this
// file, so it must do the same work with the same markup: the reading
// settings, the header's panels, the deep dives, the contents following the
// reader, and the lifecycle calculator. Plain script, no build step, no
// dependencies, and it starts from the markup the build wrote, so a reader
// with JavaScript turned off still gets the whole course with its default
// settings.

(function () {
  'use strict';

  var STORE_KEY = 'how-frontier-llms-work/reading-settings/v1';
  var reader = document.querySelector('.reader');
  if (!reader) return;
  // The static build asks each page whether this ran.
  document.documentElement.setAttribute('data-reader', 'on');

  // ---- The reading settings. Each is a class on .reader, as the build wrote
  // it, so choosing one swaps that class and nothing else.
  var KEYS = ['theme', 'size', 'spacing', 'measure', 'font'];

  function readSaved() {
    try {
      var raw = JSON.parse(window.localStorage.getItem(STORE_KEY) || 'null');
      return raw && typeof raw === 'object' ? raw : {};
    } catch (e) {
      // Storage is unavailable in a private window; the defaults still work.
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
  }

  var saved = readSaved();
  for (var i = 0; i < KEYS.length; i++) {
    var key = KEYS[i];
    if (saved[key]) {
      apply(key, saved[key]);
      var input = document.querySelector('input[name="setting-' + key + '"][value="' + saved[key] + '"]');
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
  }

  var expanders = document.querySelectorAll('[aria-expanded][aria-controls]');
  for (var e = 0; e < expanders.length; e++) {
    (function (button) {
      button.addEventListener('click', function () {
        toggleExpanded(button);
      });
    })(expanders[e]);
  }

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
  // the ones passed are dimmed. The rule is the canvas page's, so that both
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

  // ---- The lifecycle calculator. Its arithmetic is written in below the
  // build, from calculator.mjs, so the page and the canvas work from one rule.
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
