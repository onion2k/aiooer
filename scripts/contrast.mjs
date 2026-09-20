// Prints every colour pair in every theme with its contrast ratio, and fails
// if any text pair is under 7:1 or any boundary under 3:1 (WCAG 1.4.6,
// 1.4.11 and 2.4.13). The palette is only trusted once this passes; a colour
// changed in tokens.mjs without it could quietly drop a theme below AAA.
//   node scripts/contrast.mjs [--all]
import {
  THEMES,
  THEME_ORDER,
  TEXT_PAIRS,
  UI_PAIRS,
  HUE_PAIRS,
  HUE_RANGE,
  MARK_PAIRS,
  MARK_RANGE,
  contrast,
} from '../src/tokens.mjs';

let failures = 0;
const rows = [];
for (const name of THEME_ORDER) {
  const t = THEMES[name];
  for (const [fg, bg] of TEXT_PAIRS) {
    // A colour missing from a theme is a failure, not a crash.
    const r = t[fg] && t[bg] ? contrast(t[fg], t[bg]) : 0;
    const ok = r >= 7;
    if (!ok) failures++;
    rows.push({
      theme: name,
      kind: 'text',
      pair: `${fg} on ${bg}`,
      colours: `${t[fg]} / ${t[bg]}`,
      ratio: r.toFixed(2),
      ok,
    });
  }
  // A module's hue is decoration, held to a window: plain enough to see, quiet
  // enough not to compete. High contrast has no hues, so it is not held to it.
  for (const [fg, bg] of name === 'contrast' ? [] : HUE_PAIRS) {
    const r = t[fg] && t[bg] ? contrast(t[fg], t[bg]) : 0;
    const ok = r >= HUE_RANGE.min && r <= HUE_RANGE.max;
    if (!ok) failures++;
    rows.push({
      theme: name,
      kind: 'hue',
      pair: `${fg} on ${bg}`,
      colours: `${t[fg]} / ${t[bg]}`,
      ratio: r.toFixed(2),
      ok,
    });
  }
  // The decoration's colour, held to its own window. High contrast draws no
  // decoration at all, so nothing there is measured.
  for (const [fg, bg] of name === 'contrast' ? [] : MARK_PAIRS) {
    const r = t[fg] && t[bg] ? contrast(t[fg], t[bg]) : 0;
    const ok = r >= MARK_RANGE.min && r <= MARK_RANGE.max;
    if (!ok) failures++;
    rows.push({
      theme: name,
      kind: 'mark',
      pair: `${fg} on ${bg}`,
      colours: `${t[fg]} / ${t[bg]}`,
      ratio: r.toFixed(2),
      ok,
    });
  }
  for (const [fg, bg] of UI_PAIRS) {
    const r = t[fg] && t[bg] ? contrast(t[fg], t[bg]) : 0;
    const ok = r >= 3;
    if (!ok) failures++;
    rows.push({
      theme: name,
      kind: 'ui',
      pair: `${fg} on ${bg}`,
      colours: `${t[fg]} / ${t[bg]}`,
      ratio: r.toFixed(2),
      ok,
    });
  }
}
const lowest = {};
for (const r of rows) {
  const k = r.theme + ':' + r.kind;
  if (!lowest[k] || Number(r.ratio) < Number(lowest[k].ratio)) lowest[k] = r;
}
if (process.argv.includes('--all')) console.table(rows);
console.log('Lowest ratio per theme and kind:');
console.table(Object.values(lowest));
const bad = rows.filter((r) => !r.ok);
if (bad.length) {
  console.log('FAILING PAIRS:');
  console.table(bad);
}
console.log(
  failures
    ? `${failures} pair(s) fail`
    : `All ${rows.length} pairs pass (text >= 7:1, boundaries >= 3:1, module hues and the decoration ${HUE_RANGE.min} to ${HUE_RANGE.max}:1)`,
);
process.exit(failures ? 1 : 0);
