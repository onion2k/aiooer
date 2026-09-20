// The arithmetic of the lifecycle calculator, without its picture: how long a
// piece of work takes when each stage has some of its time saved, and how
// much faster that makes the whole. It is kept apart from the page so that it
// can be run headless, and so that the audit checks the page against the rule
// and not against a figure someone typed. The page's logic class is a string,
// so these functions are written into it by their source; they may use
// nothing from outside themselves.

// The most a stage can be set to, in days, and the step its saving moves in.
export const MAX_DAYS = 365;
export const SAVED_STEP = 5;

// A stage's days as a reader typed them: a number from 0 to MAX_DAYS, in
// tenths. Anything that is not a number is no time at all.
export function cleanDays(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(Math.min(n, 365) * 10) / 10;
}

// A stage's saving, as a whole percentage from 0 to 100.
export function cleanSaving(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(Math.min(n, 100));
}

// What the whole piece of work comes to. `faster` is how much sooner it is
// delivered, as the part's own arithmetic says it: half the time is 100%
// faster. Work that takes no time at all with AI has no such figure, and
// neither has work that took none to begin with.
export function delivery(stages) {
  const round = (n) => Math.round(n * 10) / 10;
  const rows = stages.map((s) => ({ days: s.days, saved: s.saved, after: round(s.days * (1 - s.saved / 100)) }));
  const before = round(rows.reduce((sum, r) => sum + r.days, 0));
  const after = round(rows.reduce((sum, r) => sum + r.days * (1 - r.saved / 100), 0));
  const faster = before > 0 && after > 0 ? Math.round((before / after - 1) * 100) : null;
  return { rows, before, after, faster };
}

// A calculator's fence in the markdown, read into what the page needs:
//   caption: Where the time goes
//   unit: days
//   Discovery: 4
//   preset: AI doubles the speed of coding | Building: 50
//   preset: Every stage a quarter faster | all: 20
// A line it cannot read stops the build, as any unknown input does.
export function parseCalculator(text) {
  const out = { caption: null, unit: 'days', stages: [], presets: [] };
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    const m = /^([^:]+):\s*(.+)$/.exec(line);
    if (!m) throw new Error(`A calculator line should read "name: value", not "${line}"`);
    const [, key, value] = m;
    if (key === 'caption') out.caption = value;
    else if (key === 'unit') out.unit = value;
    else if (key === 'preset') {
      const [label, ...sets] = value.split('|').map((v) => v.trim());
      if (!label || !sets.length) throw new Error(`A preset should read "label | stage: saving", not "${value}"`);
      const saved = {};
      for (const set of sets) {
        const s = /^([^:]+):\s*(\d+)$/.exec(set);
        if (!s) throw new Error(`A preset's saving should read "stage: number", not "${set}"`);
        saved[s[1].trim()] = cleanSaving(s[2]);
      }
      out.presets.push({ label, saved });
    } else {
      if (!/^\d+(\.\d)?$/.test(value))
        throw new Error(`The stage "${key}" needs a number of ${out.unit}, not "${value}"`);
      out.stages.push({ name: key.trim(), days: cleanDays(value) });
    }
  }
  if (!out.caption) throw new Error('A calculator needs a caption');
  if (out.stages.length < 2) throw new Error('A calculator needs at least two stages');
  const names = new Set(out.stages.map((s) => s.name));
  for (const p of out.presets)
    for (const name of Object.keys(p.saved))
      if (name !== 'all' && !names.has(name))
        throw new Error(`The preset "${p.label}" names a stage, "${name}", that the calculator does not have`);
  return out;
}
