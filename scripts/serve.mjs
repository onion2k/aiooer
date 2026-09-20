// A small static server for the built site. The pages fetch
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
import { STATIC_SITE } from '../src/paths.mjs';

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
    // A part's address is a folder, served by the index.html inside it, which
    // is what every static host does. The checks go through here too, so they
    // see the same behaviour a reader's host gives.
    let file = path.join(root, url);
    if (file.startsWith(root) && fs.existsSync(file) && fs.statSync(file).isDirectory())
      file = path.join(file, 'index.html');
    if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404);
      res.end('not found');
      return;
    }
    const ext = path.extname(file);
    res.writeHead(200, { 'content-type': TYPES[ext] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(port, '127.0.0.1', () => resolve(server)));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (!fs.existsSync(path.join(STATIC_SITE, 'index.html'))) {
    console.error('Nothing to serve: run npm run build first.');
    process.exit(1);
  }
  const port = Number(process.argv[2] || process.env.PORT || 5190);
  await serve(STATIC_SITE, port);
  console.log(`The site: http://127.0.0.1:${port}/`);
}
