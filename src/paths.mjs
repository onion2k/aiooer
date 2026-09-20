// Where everything lives, in one place. The build and every check read their
// paths from here; without it each script would carry its own idea of the
// layout, and moving a folder would break them one at a time.

import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// The course itself: one markdown file per part, in a folder of their own,
// so that the top of the project is the code that builds them.
export const CONTENT_DIR = path.join(ROOT, 'content');

// The site itself: the ordinary web pages that ship, and what every check
// renders. It is the output that matters, so it is the thing held to the
// promises, rather than a copy of it rendered some other way.
export const STATIC_SITE = path.join(ROOT, 'dist', 'site');

// Where the checks put what they write: reports and pictures, never anything
// the site is built from.
export const RESULTS = path.join(ROOT, 'test-results');
