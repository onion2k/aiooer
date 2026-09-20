# The canvas's page runtime

`vendor/design-runtime.js` is the script that renders a board on the Claude
Design canvas: React 18 and the runtime that turns a `.dc.html` file into a
page. On the canvas it is served beside each board as `./support.js`.

**Nothing in this project needs it any more.** The build, the checks and the
look tools all render `dist/site`, which is plain HTML, so `build`, `dev`,
`look`, `audit`, `perf` and `check` run with this folder empty. It is kept
here only for as long as the canvas's boards are still built, and both go
together.

**It is not in this repository, and never was.** It carries licence notices
only for its React part (MIT); the rest is the canvas's own code, with no
licence to republish it. That is the whole reason the checks used to be
unrunnable on a build server: the one file they could not be given.

## If you ever need it again

In Claude Code, ask Claude to read `artifact-type/dc-runtime.js` from the
canvas at https://claude.ai/artifact/MedAhUDsLXE6G1apbxFAHk with the
Artifact tool, and save it here as `design-runtime.js`. The copy the old
board checks were run against:

- Source: `artifact-type/dc-runtime.js` of the Design artifact type, release
  `1789741258-1fa0`, read from the canvas on 18 September 2026, and unchanged
  in release `1789760555-6fa8` (checked 19 September 2026).
- SHA-256: `82ab863dabf94f79db1b4ced13046a03425dcd255e97a5e42c60b6e8035fea34`
