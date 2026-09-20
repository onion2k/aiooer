// Turns a board into a finished page, the way the canvas's runtime does when
// it first draws one, but in Node. The static build needs this because the
// runtime is not in the repository and never can be, so a build server has no
// way to render a board in a browser.
//
// It handles only the forms this project emits, which are few and never
// nested more than one deep: `{{dotted.path}}` holes, `<sc-for>` over a list,
// `<sc-if>` on a value, and the event attributes, which a static page drops
// because src/reader.js binds its own. Anything else it meets is left alone
// and caught by the build's own check for holes and loops it did not expand.

// A dotted lookup into the values, exactly as a hole is: never an expression.
export function look(vals, path) {
  const trimmed = path.trim();
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  let here = vals;
  for (const step of trimmed.split('.')) {
    if (here === null || here === undefined) return undefined;
    here = here[step];
  }
  return here;
}

// What a value looks like in the markup. A handler or anything else that is
// not worth printing disappears, as it does on the canvas, where an attribute
// set to a function is a listener and not text.
function asText(value) {
  if (value === null || value === undefined || value === false) return '';
  if (typeof value === 'function') return '';
  return String(value);
}

function escapeAttr(s) {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

// An attribute whose whole value is one hole takes the raw value: false and
// null drop the attribute, true writes it bare, as `hidden` and `checked`
// need. Anything else is interpolated into a string.
function fillAttrs(tag, vals) {
  return tag.replace(/([a-zA-Z][a-zA-Z0-9-]*)="([^"]*)"/g, (whole, name, value) => {
    // The page's own listeners are bound by reader.js, by class and by
    // position, so a handler attribute would only be dead text here.
    if (/^on[A-Z]/.test(name)) return '';
    if (!value.includes('{{')) return whole;
    const only = /^\{\{([^}]+)\}\}$/.exec(value);
    if (only) {
      const got = look(vals, only[1]);
      if (got === false || got === null || got === undefined || typeof got === 'function') return '';
      if (got === true) return name;
      return `${name}="${escapeAttr(String(got))}"`;
    }
    return `${name}="${escapeAttr(value.replace(/\{\{([^}]+)\}\}/g, (m, p) => asText(look(vals, p))))}"`;
  });
}

// The hint-* attributes are the canvas's placeholders while a page streams in.
// A finished page has nothing to stand in for.
const dropHints = (tag) => tag.replace(/\s+hint-[a-zA-Z-]+="[^"]*"/g, '');

// The whole of one element, from an opening tag to the matching close, for a
// tag that may hold others of its own kind.
function block(html, from, name) {
  const open = new RegExp(`<${name}\\b`, 'g');
  const close = new RegExp(`</${name}>`, 'g');
  let depth = 0;
  let at = from;
  for (;;) {
    open.lastIndex = at;
    close.lastIndex = at;
    const o = open.exec(html);
    const c = close.exec(html);
    if (!c) throw new Error(`A <${name}> is never closed`);
    if (o && o.index < c.index) {
      depth++;
      at = o.index + 1;
      continue;
    }
    if (depth === 0) return { end: c.index + c[0].length, innerEnd: c.index };
    depth--;
    at = c.index + 1;
  }
}

// One pass of the template with one set of values. Loops and branches are
// expanded from the outside in, so a loop's body is filled once per item with
// the item in scope, under the name the `as` attribute gives it.
export function expand(html, vals) {
  let out = '';
  let at = 0;
  for (;;) {
    const next = /<sc-(for|if)\b([^>]*)>/g;
    next.lastIndex = at;
    const m = next.exec(html);
    if (!m) break;
    out += fill(html.slice(at, m.index), vals);
    const { end, innerEnd } = block(html, next.lastIndex, `sc-${m[1]}`);
    const body = html.slice(next.lastIndex, innerEnd);
    const attrs = m[2];
    if (m[1] === 'for') {
      const list = look(vals, /list="\{\{([^}]+)\}\}"/.exec(attrs)[1]);
      const as = /as="([^"]+)"/.exec(attrs)[1];
      (Array.isArray(list) ? list : []).forEach((item, i) => {
        out += expand(body, { ...vals, [as]: item, $index: i });
      });
    } else if (look(vals, /value="\{\{([^}]+)\}\}"/.exec(attrs)[1])) {
      out += expand(body, vals);
    }
    at = end;
  }
  return out + fill(html.slice(at), vals);
}

// A stretch with no loops or branches left in it: its tags take their
// attributes, and its text takes its holes.
function fill(html, vals) {
  return html
    .replace(/<[a-zA-Z][^>]*>/g, (tag) => fillAttrs(dropHints(tag), vals))
    .replace(/\{\{([^}]+)\}\}/g, (m, path) => asText(look(vals, path)));
}
