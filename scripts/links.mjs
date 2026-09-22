// Asks every outside address the course cites whether it still answers, and
// fails if one is gone. The course rests on about a hundred sources, most of
// them product pages and preprints from a fast-moving field; without this a
// source can vanish and the page that leans on it goes on citing a 404.
//   node scripts/links.mjs [--mutate dead] [--only <text in the address>]
//
// It needs the network and other people's servers, so it is not part of
// `npm run check`: a gate that a stranger's outage can turn red teaches people
// to ignore it. Run it before a publish, and whenever the sources are revised.
//
// Three verdicts, because a server that refuses a script is not a dead page:
//   ok          the address answered, after any redirects
//   gone        404, 410, or a name that does not resolve: this fails the run
//   unverified  refused, rate limited, broken or too slow: listed, not failed
import fs from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';
import { CONTENT_DIR, RESULTS } from '../src/paths.mjs';
import { parseModels } from '../src/models.mjs';
import { parseLearning } from '../src/learning.mjs';

const TIMEOUT_MS = 20000;
const TRIES = 3;
const AT_ONCE = 6;
// One request at a time to any one host, with a pause, so that a part which
// cites arXiv nine times does not look like an attack to arXiv.
const HOST_GAP_MS = 1200;

// Every outside link in a markdown text, as marked reads it, so that an
// address inside a code block, which is an example and not a citation, is
// left alone.
export function outsideLinks(markdown) {
  const found = [];
  const walk = (tokens) => {
    for (const tok of tokens || []) {
      if (tok.type === 'link' && /^https?:\/\//.test(tok.href)) found.push({ href: tok.href, text: tok.text });
      if (tok.tokens) walk(tok.tokens);
      if (tok.items) walk(tok.items);
      for (const row of tok.rows || []) for (const cell of row) walk(cell.tokens);
      for (const cell of tok.header || []) walk(cell.tokens);
    }
  };
  walk(marked.lexer(markdown));
  return found;
}

// What an answer means. A status is only "gone" when the server itself says
// the page is not there; anything that might be the server's mood is not.
export function verdict({ status, error }) {
  if (status >= 200 && status < 400) return 'ok';
  if (status === 404 || status === 410) return 'gone';
  if (error === 'ENOTFOUND') return 'gone';
  return 'unverified';
}

// A verdict of "gone" or "ok" is final. Anything else is worth another try,
// since rate limits and timeouts pass.
export function worthRetrying(result) {
  return verdict(result) === 'unverified';
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function ask(href) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    // GET and not HEAD, which many sites refuse. The body is never read.
    const res = await fetch(href, {
      redirect: 'follow',
      signal: ctl.signal,
      headers: { 'user-agent': 'aiooer-link-check (+https://github.com/onion2k/aiooer)', accept: 'text/html,*/*' },
    });
    await res.body?.cancel();
    return { status: res.status, final: res.url };
  } catch (e) {
    const code = e.cause?.code || (e.name === 'AbortError' ? 'TIMEOUT' : e.name);
    return { status: 0, error: code };
  } finally {
    clearTimeout(timer);
  }
}

// Each host has a queue: a request waits for the one before it to finish,
// and for a pause after that.
const hostQueue = new Map();
function onHost(host, job) {
  const run = (hostQueue.get(host) || Promise.resolve()).then(job);
  hostQueue.set(
    host,
    run.then(
      () => sleep(HOST_GAP_MS),
      () => sleep(HOST_GAP_MS),
    ),
  );
  return run;
}

async function askPolitely(href) {
  const host = new URL(href).host;
  let result;
  for (let n = 0; n < TRIES; n++) {
    if (n) await sleep(HOST_GAP_MS * 2 * n);
    result = await onHost(host, () => ask(href));
    if (!worthRetrying(result)) break;
  }
  return result;
}

function args() {
  const a = process.argv.slice(2);
  const take = (flag) => (a.includes(flag) ? a[a.indexOf(flag) + 1] : null);
  return { mutate: take('--mutate'), only: take('--only') };
}

async function main() {
  const { mutate, only } = args();
  // Where each address is cited, so that a dead one can be found in the text.
  const cited = new Map();
  for (const file of fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith('.md'))
    .sort()) {
    if (file === 'CLAUDE.md' || file === 'README.md') continue;
    for (const { href } of outsideLinks(fs.readFileSync(path.join(CONTENT_DIR, file), 'utf8'))) {
      if (!cited.has(href)) cited.set(href, new Set());
      cited.get(href).add(file);
    }
  }
  // The directory's sources are addresses the guide cites too, and the only
  // thing standing behind a claim about somebody else's product. A dead one
  // there matters more than a dead one in the prose, not less.
  for (const m of parseModels(CONTENT_DIR).models) {
    if (!cited.has(m.source)) cited.set(m.source, new Set());
    cited.get(m.source).add(`models.json (${m.name})`);
  }
  // The learning directory is nothing but addresses, so a dead one there is a
  // card that leads a reader nowhere.
  for (const s of parseLearning(CONTENT_DIR).sections)
    for (const l of s.links) {
      if (!cited.has(l.url)) cited.set(l.url, new Set());
      cited.get(l.url).add(`learning.json (${l.title})`);
    }

  if (mutate === 'dead') {
    // A page that is not there, and a name that does not resolve: the two
    // ways a source dies. If the run passes with these in, it proves nothing.
    cited.set('https://arxiv.org/abs/0000.00000', new Set(['(mutation: no such paper)']));
    cited.set('https://no-such-host.invalid/page', new Set(['(mutation: no such host)']));
  } else if (mutate) throw new Error(`No mutation called "${mutate}"; there is only "dead"`);

  let hrefs = [...cited.keys()];
  if (only) hrefs = hrefs.filter((h) => h.includes(only));
  if (!hrefs.length) throw new Error('No outside links were found, which cannot be right');

  const results = new Map();
  let next = 0;
  await Promise.all(
    Array.from({ length: AT_ONCE }, async () => {
      while (next < hrefs.length) {
        const href = hrefs[next++];
        results.set(href, await askPolitely(href));
      }
    }),
  );

  const rows = hrefs.map((href) => {
    const r = results.get(href);
    return { href, verdict: verdict(r), detail: r.status || r.error, files: [...cited.get(href)] };
  });
  const gone = rows.filter((r) => r.verdict === 'gone');
  const unverified = rows.filter((r) => r.verdict === 'unverified');
  const ok = rows.filter((r) => r.verdict === 'ok');

  const lines = [
    `# Links`,
    ``,
    `${rows.length} addresses: ${ok.length} ok, ${unverified.length} unverified, ${gone.length} gone.`,
    ``,
  ];
  for (const [title, set] of [
    ['Gone', gone],
    ['Unverified', unverified],
  ]) {
    if (!set.length) continue;
    lines.push(`## ${title}`, ``);
    for (const r of set) lines.push(`- ${r.detail} ${r.href}`, ...r.files.map((f) => `  - ${f}`));
    lines.push(``);
  }
  fs.mkdirSync(RESULTS, { recursive: true });
  fs.writeFileSync(path.join(RESULTS, 'links-report.md'), lines.join('\n'));

  for (const r of unverified) console.log(`unverified ${r.detail} ${r.href}`);
  for (const r of gone) console.log(`GONE ${r.detail} ${r.href}\n     cited in ${r.files.join(', ')}`);
  console.log(`\n${rows.length} addresses: ${ok.length} ok, ${unverified.length} unverified, ${gone.length} gone`);
  console.log(`Report in test-results/links-report.md`);
  if (gone.length) {
    console.log(`\n${gone.length} SOURCE(S) GONE`);
    process.exit(1);
  }
  console.log(`\nNO SOURCE IS GONE`);
}

// Run only when called as a script, so the working parts can be imported and
// tried on their own.
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) await main();
