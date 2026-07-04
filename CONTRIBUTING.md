# Contributing

- **No direct commits to `main`** — branch → PR (`gh pr create`) → green checks → merge.
- **AgentGate runs on every PR** — `secrets` + `dangerous_patterns` block; `scope` is advisory.
- **Commits are signed & Verified**; never commit secrets (`.env`, keys are gitignored).
- Branch naming: `feat/…`, `fix/…`, `docs/…`, `chore/…`.

## Local build

Node 22 (see `.nvmrc`). Install with `npm install`, then `npm run dev` for the
local server and `npm run build` (Astro build + Pagefind index) before opening a
PR — the Zod content schema fails the build on a missing/malformed frontmatter
field, so a clean build is the check that your content changes are valid.
