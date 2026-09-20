// Where everything lives, in one place. The build and every check read their
// paths from here; without it each script would carry its own idea of the
// layout, and moving a folder would break them one at a time.

import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// The course itself: one markdown file per part, in a folder of their own,
// so that the top of the project is the code that builds them.
export const CONTENT_DIR = path.join(ROOT, 'content');

// What is published to the canvas: the index and one file per board.
export const CANVAS = path.join(ROOT, 'dist', 'canvas');
export const CANVAS_PROJECT = path.join(CANVAS, 'project');

// Build inputs that are measured or stamped, not written by hand.
export const HEIGHTS_FILE = path.join(ROOT, 'src', 'heights.json');
export const CREATED_FILE = path.join(ROOT, 'src', 'canvas-created.json');

// The canvas's page runtime, and the copy of the site the checks render with it.
export const RUNTIME = path.join(ROOT, 'vendor', 'design-runtime.js');
export const RESULTS = path.join(ROOT, 'test-results');
export const TEST_SITE = path.join(RESULTS, 'site');
