// A small static server for the built site. The canvas's runtime fetches
// sibling boards over http, so the pages cannot be opened straight from disk.
// The checks import serve(); run on its own it is the dev server, for reading
// the built site in a browser. Its port is 5190 unless a PORT variable or an
// argument says otherwise; .claude/launch.json must name the same one, or the
// app's preview waits on a port nothing is listening on.
//   node scripts/serve.mjs [port]

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TEST_SITE } from '../src/paths.mjs';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
};

export function serve(root, port = 0) {
  const server = http.createServer((req, res) => {
    const url = decodeURIComponent(req.url.split('?')[0]);
    const file = path.join(root, url === '/' ? 'Main.dc.html' : url);
    if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404);
      res.end('not found');
      return;
    }
    const ext = file.endsWith('.dc.html') ? '.html' : path.extname(file);
    res.writeHead(200, { 'content-type': TYPES[ext] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(port, '127.0.0.1', () => resolve(server)));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (!fs.existsSync(path.join(TEST_SITE, 'support.js'))) {
    console.error(
      'Nothing to serve: run npm run build, and put the canvas runtime in vendor/ first (see vendor/README.md).',
    );
    process.exit(1);
  }
  const port = Number(process.argv[2] || process.env.PORT || 5190);
  await serve(TEST_SITE, port);
  console.log(`The built site, with the canvas runtime: http://127.0.0.1:${port}/`);
}
