# The canvas's page runtime

The checks need `vendor/design-runtime.js`: the script that renders a board
on the Claude Design canvas, React 18 and the runtime that turns a
`.dc.html` file into a page. On the canvas it is served beside each board as
`./support.js`. With a local copy, the checks render the built boards
exactly as the canvas does, in headless Chromium, without a login.

**It is not in this repository.** It carries licence notices only for its
React part (MIT); the rest is the canvas's own code, with no licence to
republish it. So `.gitignore` keeps it out, and each machine gets its own
copy. `npm run build` works without it; `dev`, `look`, `audit`, `perf` and
`check` stop and point here until it is in place.

## Getting it

In Claude Code, ask Claude to read `artifact-type/dc-runtime.js` from the
canvas at https://claude.ai/artifact/MedAhUDsLXE6G1apbxFAHk with the
Artifact tool, and save it here as `design-runtime.js`. Then check it:

    shasum -a 256 vendor/design-runtime.js

The checks' baselines were set with this copy:

- Source: `artifact-type/dc-runtime.js` of the Design artifact type, release
  `1789741258-1fa0`, read from the canvas on 18 September 2026.
- SHA-256: `82ab863dabf94f79db1b4ced13046a03425dcd255e97a5e42c60b6e8035fea34`

A different hash means the canvas has moved to a newer release. Run
`npm run check` with the new copy before trusting its figures, and update
the two lines above: a change in the runtime can change what the checks see.
