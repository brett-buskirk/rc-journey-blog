# CLAUDE.md — RC Journey (`rc-journey-blog`)

Operating manual for the agent working **inside this repo**. This repo was
scaffolded by the Estate Steward at `~/github-repos`; day-to-day it's mine to
run. The machine-wide **managed policy** (`/etc/claude-code/CLAUDE.md`) and the
**estate manual** (`~/github-repos/CLAUDE.md`) sit above this file with the
universal safety/review/governance floors — this file refines them locally and
**never relaxes** them. When they conflict, they win and I stop and ask.

`STATUS.md` is the historical build-phase handoff log; for *current* state,
this file is authoritative.

## The chain of command (non-negotiable)

Branch → open a PR → **stop and let Brett merge.** Never self-merge, never
commit to `main`. One focused, reviewable change per PR. Signed commits ending
with `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`. Brett owns
architecture and the final call; I do the labor and report honestly.

## What this project is

RC Journey — a **reentry-advocacy and personal-memoir** site — rebuilt from a
**WordPress + Elementor** droplet into a self-owned **Astro static site**.
Elementor's recurring cost is the reason for the move. Articles and narrative
writing are the heart of it, so **content fidelity and a clean reading
experience beat flashy UI**. Design was greenfield ("The Long View" — golden-
hour→dusk duotone, light default + dark toggle, Fraunces/Newsreader/IBM Plex
Mono, a horizon-rule signature, and a live **days-free counter** from
`2021-01-22`).

_Note on subject matter:_ the site content **is** Brett's own reentry memoir —
that story is the product and is public by his choice. The managed-policy
positioning rules (self-taught/independent framing; "agentic engineering," never
"vibe coding") still govern any **professional/brand** copy written *about* Brett
or the project — that's a separate thing from the memoir itself.

## Current state (2026-07-21) — SHIPPED / in production

The migration is **complete**. All 7 roadmap steps are done: the site is built,
deployed, and serving in production on DigitalOcean App Platform, and the old
**WordPress + Elementor droplet has been destroyed** — the recurring Elementor +
WP hosting cost (the whole reason for the rebuild) is retired.

DNS is fully cut over on `rcjourney.cloud` (DO-managed nameservers): the apex and
`www` both serve the live static site over HTTPS. Everything now rides on the CI
pipeline — **push to `main` → DO App build → live**. No manual infra remains.

Analytics: **Plausible** (self-hosted, privacy-friendly) is wired into every
page and confirmed tracking. See below.

Day-to-day this repo is now in **maintenance mode**: content additions (see
`ADDING-ARTICLES.md`), dependency currency, and optional polish (remaining stub
pages, a contact/newsletter form, Giscus comments).

## Stack

- **Astro 5** static site, Markdown content. **Tailwind v4** (`@theme` tokens in
  `src/styles/global.css`; semantic duotone vars flip per theme).
- **Content collections + Zod schema** — a missing/malformed field **fails the
  build** by design. `@astrojs/sitemap`, `@astrojs/rss`, `sharp` image pipeline.
- **Pagefind** client-side search (indexed at build, no backend).
- **PWA** via `@vite-pwa/astro` (`registerType: 'autoUpdate'`), self-hosted
  fonts via `@fontsource*`.

## Content model

Schema: `src/content.config.ts` — collection `posts`, glob loader over
`output/posts/*/index.md`, **slug = folder name** (original WP slugs preserved
verbatim for SEO). Fields: `title` (req), `author` (req — every post is stamped
with the byline), `date` (`z.coerce.date`, req), `categories`
(`z.array(z.enum(CATEGORY_KEYS)).min(1)` — one per post; an unknown/typo'd key
breaks the build), `tags` (default `[]`), `coverImage` (`image()` helper; missing
file → build error), `draft` (default `false`).

The five category keys → section routes/labels live in `src/lib/categories.ts`;
section routes match the old WP page URLs (e.g. `/the-shadowed-mirror/`). Change
a slug → add a redirect. 22 posts migrated.

## Deploy — DigitalOcean App Platform (runbook)

GitOps: **every push to `main` builds and deploys** (`deploy_on_push: true`).

- **App:** `rc-journey` · id `b1d7faad-9a9b-4b84-a4e5-e33503ad4875` · region
  `nyc` · static-site component `web` · build `npm run build` · output `dist` ·
  Node 22 · `catchall_document: 404.html`.
- **Ingress:** `https://rc-journey-gwl48.ondigitalocean.app` (the build is always
  live here regardless of DNS). **Domains (live):** `rcjourney.cloud` (PRIMARY)
  and `www.rcjourney.cloud` (ALIAS) both serve over HTTPS; DNS is DO-managed
  (nameservers `ns[1-3].digitalocean.com`).
- **`doctl` auth:** the `brett` context (`doctl auth list`).

**The rename gotcha (learned the hard way — 2026-07-21).** DO does **not** read
the in-repo `.do/app.yaml` on push; it runs off a **config stored inside DO**.
Editing/merging `.do/app.yaml` changes the file, not the live app. When the repo
was renamed `rc-journey-custom` → `rc-journey-blog`, the stored config still
pointed at the old name and the GitHub→DO link went dark — pushes stopped
deploying. Fix: push the corrected spec to the live app, then it re-arms:

```bash
doctl apps update b1d7faad-9a9b-4b84-a4e5-e33503ad4875 --spec .do/app.yaml
```

Watching a deploy:

```bash
doctl apps list-deployments b1d7faad-9a9b-4b84-a4e5-e33503ad4875   # cause + phase
doctl apps get-deployment  b1d7faad-9a9b-4b84-a4e5-e33503ad4875 <DEPLOY_ID> --format Phase,Progress
```

A push-triggered deploy shows cause `commit <sha> pushed to …/rc-journey-blog`;
a manual re-apply shows `app spec updated`. Terminal phase = `ACTIVE` (good) or
`ERROR`/`CANCELED`.

## Analytics — Plausible

Loaded on every page from `src/layouts/Base.astro`'s `<head>`: an async loader
from the self-hosted endpoint `analytics.brett-buskirk.dev/js/pa-…-p.js` plus the
`window.plausible` command queue. **Both `<script>` tags are `is:inline`** so
Astro emits them verbatim in `<head>` instead of bundling/hoisting (which can
desync the loader and the queue). If AgentGate/GitGuardian ever flag the random-
looking script filename as a secret, it's a **false positive** — that URL is
public by design. For stats to record, the Plausible dashboard must have the
site domain (`rcjourney.cloud`) registered.

## Build & dev gotchas

- **Search only works on the built site** (`npm run build && npm run preview`),
  not `npm run dev` — Pagefind's `/pagefind/` bundle is generated post-build.
- **After a deploy, an open tab may show stale content until a hard refresh** —
  the `autoUpdate` service worker precaches HTML and hands over on reload. Not a
  broken deploy; verify against the ingress with a hard refresh / fresh tab.
- **Node:** `.nvmrc` pins **22**; DO builds on **22**. A newer local Node
  usually builds fine, but 22 is the source of truth. `node_modules` isn't
  committed — `npm ci` before building.
- **⚠️ Lockfile must be regenerated on Node 22 (`nvm use` first) whenever
  dependencies change.** DO runs `npm ci`, which hard-fails the build if
  `package-lock.json` is out of sync with `package.json`. Running `npm install`
  on a newer Node (e.g. 24) silently prunes `sharp`'s optional `@emnapi/*` deps
  from the lockfile; DO's Node-22 `npm ci` then errors *"npm lockfile is not in
  sync"* and **the deploy fails while the old build stays live** — so the site
  looks unchanged even though `main` merged. Fix/avoid: `nvm use` (→ 22) before
  any `npm install`, commit the resulting `package-lock.json`. Bitten twice now
  (commit `e5b0497`, then the #7→#8 design deploy).
- **One dynamic route per directory level in Astro** — posts use `[slug].astro`
  at root, so the 5 section pages are thin **static** files (a second root-level
  dynamic route would collide).
- **Days-free counter:** build value is a no-JS fallback; the inline script in
  `Base.astro` recomputes it live from `SITE.freedomDate` on every visit.
- **`scripts/rewire-images.mjs`** (image/link normalizer) reads the gitignored
  1.7 GB `wp-uploads/` backstop. It's **done and idempotent** — you shouldn't
  need to re-run it, and don't run it without that folder present.

## Conventions (this repo)

Wire every issue/PR up **completely on creation**:
- **Assign** to `brett-buskirk`.
- **Label** from the repo's base taxonomy (`documentation`, `enhancement`,
  `bug`, … — no custom scope labels here). **No milestones** in this repo.
- **Add to the Estate board** (Project **#17**) *and* this repo's own project
  (**#8 "RC Journey"**):
  `gh project item-add <17|8> --owner brett-buskirk --url <url>`
  (the Estate board aggregates many repos — query it with a high `--limit` to
  find an item).
- The `brett-buskirk` gh account must be **active** for writes (`gh auth status`).

**AgentGate** runs on every PR (`.agentgate.yml`): `scope` is **warning** here
(solo-dev repo), `secrets` + `dangerous_patterns` stay **error**. Quirk:
`dangerous_patterns` matches risky literal tokens against *added diff lines* and
fires even in prose — keep such tokens out of diffs, or have Brett bypass.

## Key files

```
astro.config.mjs              site, sitemap, PWA, markdown remark/rehype plugins
.do/app.yaml                  DO App Platform spec (template for doctl; not read on push)
src/content.config.ts         posts collection + Zod schema (build-fail gate)
src/lib/categories.ts         5 categories → {route, label, blurb}; CATEGORY_KEYS
src/lib/site.ts               SITE consts, NAV/FOOTER/SOCIAL, freedomDate, daysFree()
src/lib/posts.ts              getPosts/byCategory, formatDate, stamp, readingTime
src/layouts/Base.astro        <head> (SEO/OG, Plausible, PWA, no-FOUC theme, live counter)
src/components/               Header, Footer, PostRow, SectionView
src/pages/                    index, [slug] (articles), 5 section pages, about,
                              blog, writing, voices-of-resilience,
                              resources-and-support, search, 404, rss.xml.js
src/styles/global.css         Tailwind v4 @theme, duotone tokens, .horizon/.eyebrow/.prose-rcj
scripts/                      rewire-images, remark-strip-lead-cover, rehype-gallery
```

## Source inputs (not shipped)

- `output/` — `wordpress-export-to-markdown` result (posts migrated; `pages/` +
  `custom/` are Elementor salvage, rebuilt fresh not migrated).
- `wp-uploads/` — full `/wp-content/uploads` rsync, the image backstop
  (gitignored, ~1.7 GB). The build does **not** need it (post images are
  committed under `output/posts/*/images/`). ⚠️ The source droplet is **gone**,
  so this can no longer be re-rsync'd — the only copies are local/offline. Keep a
  durable backup if the gallery / image re-sourcing work still matters.
- `export.xml` — raw WordPress export (gitignored; also local-only now).
