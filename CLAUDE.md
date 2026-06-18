# CLAUDE.md — RC Journey (custom rebuild)

## What this project is

RC Journey rebuilt from the ground up as a custom **static site**. The original
runs on **WordPress + Elementor** on a DigitalOcean droplet (`rcjourney.cloud`).
Elementor's recurring cost is the reason for the move — this repo replaces it
with a self-owned, near-zero-hosting build.

RC Journey is a **reentry-advocacy and personal-memoir project**. Articles and
narrative writing are the heart of it, so content fidelity and a clean reading
experience matter more than flashy UI.

## Direction

- **Full design overhaul.** No obligation to match the old WordPress/Elementor
  look, navigation, or layout. This is greenfield — reinvent freely.
- The migrated **content** (articles, images, links, SEO slugs) is the asset
  that had to survive the jump. The presentation is wide open.
- Priorities, in order: clean reading experience → fast → cheap to host →
  GitOps deploy.

## Stack (decided)

- **Astro** — static site generator. Content authored as Markdown.
- **Content collections** with a **Zod schema** for typed frontmatter. A
  missing or malformed field should *fail the build*, not slip through silently.
- **Pagefind** for client-side search (indexes at build time, no backend).
- **Tailwind** for styling — open to change if the design wants something else.
- **Deploy:** Cloudflare Pages or DigitalOcean App Platform (static tier).
  Git push → build → deploy.
- Optional, later: contact form via a serverless function or form service;
  comments via Giscus if wanted.

## What's already on disk

- `output/` — result of `wordpress-export-to-markdown` v3.0.5, run with:
  `--post-folders=true --prefix-date=false --date-folders=none --save-images=all`.
  One folder per post (named by slug), each containing `index.md` plus an
  `images/` subfolder. Frontmatter fields present:
  `title, date, categories, tags, coverImage, draft`.
- `wp-uploads/` — the full `/wp-content/uploads` tree, rsync'd straight off the
  droplet. This is the **backstop** for any image the export tool couldn't pull
  over HTTP.

## Known content issues — RESOLVED for posts (2026-06-18)

All three were handled by `scripts/rewire-images.mjs` (idempotent). The 22 posts
in `output/posts/` are now fully self-contained with local `./images/` refs.
Note: the `output/pages/` and `output/custom/` Elementor exports were NOT
rewired — they're being rebuilt fresh, so any remaining remote refs there are
moot.

1. **Stale-IP image references.** Only **1** occurrence existed (in
   `output/custom/elementor_library/`, not in any post). Resolved.
2. **"External / hotlinked images" — original assumption was WRONG.** These were
   not unsourced Unsplash stock. The `34.57.223.40` refs (79) were the author's
   own `PXL_*` Pixel-phone photos, and **every one existed in `wp-uploads/`** —
   fully recovered locally. The only genuine third-party stock is 4
   `photo-1478…`-style files, and even those were already downloaded into post
   `images/` folders. Nothing needed re-sourcing.
3. **Image pipeline.** Co-located: each post's `images/` folder feeds Astro's
   build-time optimization (`<Image>` → responsive WebP). `coverImage` resolves
   via the content-collection `image()` helper. Done.

## Content model

Align the Zod schema to the existing frontmatter; rename/extend as the design
needs:

- `title` — string, required
- `date` — date, required
- `categories` — string[], optional
- `tags` — string[], optional
- `coverImage` — image/string, optional
- `draft` — boolean, default `false`

**Preserve the original post slugs** as the URL structure wherever possible —
these articles have SEO history. If any slug must change, add a redirect.

## Roadmap (rough order)

1. ✅ Scaffold Astro in this repo. (Astro 5 + Tailwind v4 + sitemap/RSS/sharp.)
2. ✅ Content collection + Zod schema. (`src/content.config.ts`; `categories` is
   a singular-enum array — unknown category fails the build; `coverImage` via
   `image()`; slugs = folder names.)
3. ✅ Resolve images. (`scripts/rewire-images.mjs`; see resolved issues above.)
4. ✅ Design pass — "The Long View." Warm golden-hour→dusk duotone, light+dark,
   Fraunces/Newsreader/IBM Plex Mono, horizon-rule signature, day-counter.
   Home, article, 5 section pages, About, blog index, 404.
5. ✅ Pagefind search (`/search/`, indexed in `npm run build`).
6. ⏳ Deploy — DigitalOcean App Platform. Spec written (`.do/app.yaml`); needs
   the repo on GitHub + `doctl apps create`.
7. ⏳ Verify against the live site, preserve slugs / add redirects, then
   decommission the droplet — which ends both the Elementor and WP hosting cost.

## Working notes

- Author is an experienced engineer: MERN background, comfortable with Bash,
  Python, Ansible, Terraform, and git. Skip the hand-holding — favor direct,
  technical communication, and show the diff or command.
- Prefers robust, repeatable automation. The deploy and any recurring tasks
  should be scriptable / CI-driven, not manual clicking.
- Repo lives at `~/GitHub/rc-journey-custom` on macOS (Apple Silicon).
- **Keep the old WordPress site running** until the static build is verified
  end to end. The rsync backstop covers images, but don't tear down the droplet
  prematurely.
