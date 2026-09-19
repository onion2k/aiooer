// Prints every colour pair in every theme with its contrast ratio, and fails
// if any text pair is under 7:1 or any boundary under 3:1 (WCAG 1.4.6,
// 1.4.11 and 2.4.13). The palette is only trusted once this passes; a colour
// changed in tokens.mjs without it could quietly drop a theme below AAA.
//   node scripts/contrast.mjs [--all]
import { THEMES, THEME_ORDER, TEXT_PAIRS, UI_PAIRS, contrast } from '../src/tokens.mjs';

let failures = 0;
const rows = [];
for (const name of THEME_ORDER) {
  const t = THEMES[name];
  for (const [fg, bg] of TEXT_PAIRS) {
    const r = contrast(t[fg], t[bg]);
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
  for (const [fg, bg] of UI_PAIRS) {
    const r = contrast(t[fg], t[bg]);
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
console.log(failures ? `${failures} pair(s) fail` : `All ${rows.length} pairs pass (text >= 7:1, boundaries >= 3:1)`);
process.exit(failures ? 1 : 0);
