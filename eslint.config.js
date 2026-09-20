// Lint for mistakes, not style: Prettier has the look of the code. The code
// here is plain JavaScript modules, so the house's type-aware rules have no
// types to work from; CLAUDE.md says so, and what it would take to add them.
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
  { ignores: ['dist', 'node_modules', 'test-results', 'vendor'] },
  js.configs.recommended,
  {
    languageOptions: { ecmaVersion: 'latest', sourceType: 'module', globals: { ...globals.node } },
    rules: {
      eqeqeq: ['error', 'always'],
      'no-constant-condition': ['error', { checkLoops: false }],
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  // The checks hand functions to the page, where the browser's globals exist.
  { files: ['scripts/**'], languageOptions: { globals: { ...globals.node, ...globals.browser } } },
  // src/reader.js is the static site's own script: it runs in a browser, not
  // in Node, and its caught-and-ignored storage errors are deliberate.
  {
    files: ['src/reader.js'],
    languageOptions: { sourceType: 'script', globals: { ...globals.browser } },
    rules: { 'no-unused-vars': ['error', { caughtErrors: 'none' }] },
  },
  prettier,
];
