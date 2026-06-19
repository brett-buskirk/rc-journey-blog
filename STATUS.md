# STATUS — RC Journey rebuild (handoff log)

_Living progress log so work can resume on a different computer or in a fresh
Claude session. Last updated: 2026-06-18._

This file + `CLAUDE.md` + `README.md` are the durable record. The chat history
and any local Claude "memory" do **not** travel; everything needed is here.

---

## TL;DR — where we are

Steps 1–5 of the roadmap are **done and committed**; the site builds, renders,
and searches. Repo is on GitHub (private). **Remaining: step 6 (deploy to
DigitalOcean App Platform) and step 7 (verify + cutover), plus optional stub
pages.**

| # | Step | State |
|---|------|-------|
| 1 | Scaffold (Astro 5, Tailwind v4, sitemap/RSS/sharp) | ✅ |
| 2 | Content collection + Zod schema (22 posts, slugs preserved) | ✅ |
| 3 | Image pipeline (`scripts/rewire-images.mjs`) | ✅ |
| 4 | Design — "The Long View" (home/article/sections/about/blog/404) | ✅ |
| 5 | Pagefind search (`/search/`) | ✅ |
| 6 | Deploy — DO App Platform (`.do/app.yaml` written, not yet created) | ⏳ |
| 7 | Verify vs live site, redirects, decommission droplet | ⏳ |
| — | Stub pages (gallery / voices / resources / newsletter) | ⏳ optional |

GitHub: **https://github.com/brett-buskirk/rc-journey-custom** (private, `main`).

---

## Resume on a new machine

```bash
git clone git@github.com:brett-buskirk/rc-journey-custom.git
cd rc-journey-custom
nvm use            # Node 22 (see .nvmrc); or install Node >=20.3
npm install        # node_modules is NOT committed
npm run dev        # http://localhost:4321  (NOTE: search does NOT work in dev)
npm run build      # astro build + pagefind index -> dist/
npm run preview    # serve dist/ — use THIS to test search
```

### ⚠️ Critical: `wp-uploads/` is not in the repo
It's the 1.7 GB rsync backstop of `/wp-content/uploads`, **gitignored**.
- The **build does not need it** — every post image is already co-located under
  `output/posts/*/images/` and committed.
- You **will** want it for the remaining image work (gallery page, re-sourcing
  the 4 stock photos, alt hero shots). To get it on the new machine, either copy
  the folder directly (external drive / cloud) or re-rsync from the still-running
  droplet (`rcjourney.cloud`). Confirm the remote uploads path first.
- `scripts/rewire-images.mjs` reads `wp-uploads/` — don't run it without the
  folder present. It's already done and idempotent, so you shouldn't need to.

---

## Project map (key files)

```
astro.config.mjs              site=rcjourney.cloud, sitemap, tailwind vite,
                              remark plugin to strip duplicate lead cover image
src/content.config.ts         posts collection + Zod schema (build-fail gate)
src/lib/categories.ts         5 categories -> {route, label, blurb}; CATEGORY_KEYS
src/lib/site.ts               SITE consts, NAV, SOCIAL, daysFree()
src/lib/posts.ts              getPosts/byCategory, formatDate, stamp, readingTime
src/layouts/Base.astro        <head>, theme no-FOUC bootstrap, live days-free script
src/components/Header.astro   logo mark + wordmark, nav (.navlink), theme toggle
src/components/Footer.astro   mark + wordmark, terrain/elsewhere links, day counter
src/components/PostRow.astro  editorial list row (thumb + mono stamp + title)
src/components/SectionView.astro  shared section-page body
src/pages/index.astro         home (hero, terrain grid, latest)
src/pages/[slug].astro        article template (root slug; getStaticPaths)
src/pages/{the-shadowed-mirror,reentry-realities,reflections,the-deep-well,rcj-info}.astro
                              thin section pages (static files; see gotcha below)
src/pages/{about,blog,search,404}.astro, rss.xml.js
src/styles/global.css         Tailwind v4 @theme, duotone tokens, .horizon, .eyebrow, .navlink, .prose-rcj
scripts/rewire-images.mjs     image/link/shortcode/widget normalizer (idempotent, --dry)
scripts/remark-strip-lead-cover.mjs   drops body lead image when == coverImage
.do/app.yaml                  DigitalOcean App Platform deploy spec
src/assets/                   hero-arizona-sunset.webp, brett-mount-lemmon.webp, rcj-mark.png
public/                       favicon.png + apple-touch-icon.png (the RCJ mark)
```

---

## Design system — "The Long View"

Concept: a returning citizen who counted *days inside* now measures freedom in
the open West. Throughline = **time + the horizon**.

- **Palette (duotone, golden-hour→dusk).** Semantic CSS vars in `global.css`
  flip per theme; Tailwind tokens map to them (`bg-bg`, `text-ink`, `text-ochre`,
  `text-dusk`, `border-line`, `bg-surface`).
  - Light: sand `#ece4d3`, surface `#f5efe2`, ink `#241c14`, ochre `#b9772a`, dusk `#4a4571`, line `#cdbfa3`.
  - Dark: bg `#221b13` (warm, deliberately lifted off near-black per feedback), surface `#2d251a`, ink `#ede4d2`, ochre `#e0a24a`, dusk `#a39cce`, line `#443a2b`.
- **Type (self-hosted via @fontsource):** Fraunces Variable (display), Newsreader
  Variable (body), IBM Plex Mono (metadata/labels — the "counting" voice).
- **Signature:** `.horizon` rule (ochre→dusk hairline) as the divider; the
  **days-free counter**.
- **Theme:** light default + dark toggle, class-based (`.dark` on `<html>`),
  no-FOUC bootstrap in `Base.astro`, persisted to `localStorage`.

---

## Decisions & rationale (so they aren't re-litigated)

- **Deploy target = DigitalOcean App Platform** (static tier), not Cloudflare —
  user's choice (keeps it in the existing DO account). Spec in `.do/app.yaml`.
- **Pages: rebuild fresh, salvage prose.** Only the 22 posts are migrated as
  content. `output/pages` + `output/custom` are Elementor soup, kept as salvage
  reference only (About prose was hand-lifted into `src/pages/about.astro`).
- **`categories` = singular enum array**, not free `string[]` — matches the data
  (one per post) and turns a typo into a build failure.
- **Section routes match old WP page slugs** (`/the-shadowed-mirror/` etc.) to
  preserve SEO + the rewired in-post links.
- **Image refs pre-rewritten by a committed script**, not a runtime plugin —
  keeps markdown self-contained and the transform auditable in git.
- **Days-free counter: ELAPSED days, recomputed client-side every visit.**
  Started inclusive (Day 1 = release) then user chose elapsed. Build value is a
  no-JS fallback; inline script in `Base.astro` updates `[data-days-free]` from
  `SITE.freedomDate` (2021-01-22) on load. Today ≈ Day 1,973.
- **Logo:** used the symbol-only mark (`logo512.png` → `src/assets/rcj-mark.png`)
  beside a Fraunces wordmark, so it adapts to both themes (the baked white/black
  wordmark PNGs in `wp-uploads` are theme-specific). Mark also = favicon.

## Corrections to original assumptions (verified)

- CLAUDE.md's "external stock images" worry was **wrong**: the 79 `34.57.223.40`
  refs were the author's own `PXL_*` photos and all existed in `wp-uploads/`.
  Only 4 genuine `photo-1478…` stock files, already downloaded locally.
- All 22 cover images resolve locally; 0 missing image refs after rewire.

## Gotchas / non-obvious facts

- **Search only works on the built site** (`npm run build && npm run preview`),
  not `npm run dev` — Pagefind's `/pagefind/` bundle is generated post-build. The
  search page shows a "run the build" note on dev. This is expected.
- **One dynamic route per dir level in Astro** — that's why posts use
  `[slug].astro` at root and the 5 sections are thin *static* files (can't have a
  second root-level `[section].astro`). Static files win over dynamic on collision.
- **Pagefind "Indexed N words"** = unique vocabulary size, not total word count
  (~3.3k is correct for 22 essays). Article bodies are tagged `data-pagefind-body`.
- The rewire script also strips two classes of WP export cruft, idempotently:
  a stray `[newsletter_form]` shortcode, and **trailing** "Subscribe…" / "More …"
  widget headings (21 across 13 posts) that exported body-less.
- `daysFree()` and the footer year use `new Date()` at build — fine here (real
  Node build), but note the live counter is the authoritative on-page value.

---

## Next actions (in order)

1. **Deploy (step 6).** Set the correct GitHub `repo` in `.do/app.yaml` (already
   `brett-buskirk/rc-journey-custom`), then:
   `doctl apps create --spec .do/app.yaml` (one-time). Verify the build runs on
   DO with Node 22. Then it's deploy-on-push to `main`.
2. **Verify (step 7).** Crawl/spot-check every original post slug resolves; diff
   against live `rcjourney.cloud`; add redirects (App Platform spec or a
   `_redirects`/404 strategy) for anything that can't keep its slug. THEN it's
   safe to decommission the droplet (ends Elementor + WP cost). Keep the droplet
   up until this passes.
3. **Optional stub pages** the old site had and nothing currently links to:
   gallery, voices-of-resilience, resources-and-support, fellow-travelers,
   newsletter. Add real ones when ready (newsletter needs a form service; a real
   subscribe CTA can replace the stripped `[newsletter_form]`).

## Things worth confirming with the user on resume

- Domain/DNS cutover plan for `rcjourney.cloud` (currently points at the droplet).
- Whether to wire a contact/newsletter form now or later (Giscus comments too).
- Whether `wp-uploads/` made it to the new machine (needed for gallery work).
