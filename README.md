# RC Journey

A returning citizen's travelogue and reentry memoir, rebuilt as a self-owned
static site to retire the WordPress + Elementor hosting cost.

**Stack:** [Astro](https://astro.build) (static) · content collections with a Zod
schema · Tailwind v4 · [Pagefind](https://pagefind.app) search · deployed on
DigitalOcean App Platform (static tier).

## Develop

```bash
npm install
npm run dev          # local dev server
npm run build        # astro build + pagefind index -> dist/
npm run preview      # serve the built dist/
```

Node 22 (see `.nvmrc`).

## Content

The 22 migrated articles live in `output/posts/<slug>/index.md` with co-located
`images/`. They're loaded **in place** by the `posts` content collection
(`src/content.config.ts`); the folder name is the URL slug (SEO preserved). The
Zod schema fails the build on a missing/malformed field, a bad category, or a
missing cover image.

Editorial sections are the five post categories (`src/lib/categories.ts`); their
routes match the original WordPress page URLs (e.g. `/the-shadowed-mirror/`).

## Image pipeline

`npm run rewire-images` (`scripts/rewire-images.mjs`, idempotent, `--dry`)
normalizes migrated content to self-contained local assets:

- Resolves any `…/wp-content/uploads/<path>` reference (old droplet IP, GCloud
  box, or domain) against the `wp-uploads/` backstop, copies the file into the
  post's `images/`, and rewrites the reference to `./images/<file>`.
- Rewrites internal `rcjourney.cloud/<page>/` links to local routes.
- Normalizes `coverImage` frontmatter for Astro's `image()` helper.

A remark plugin (`scripts/remark-strip-lead-cover.mjs`) drops a post's leading
body image when it duplicates the cover (the cover is already shown in the hero).

## Deploy

GitOps via DigitalOcean App Platform — spec in `.do/app.yaml`. After pushing to
GitHub and setting the `repo` field:

```bash
doctl apps create --spec .do/app.yaml      # one-time
doctl apps update <APP_ID> --spec .do/app.yaml
```

Every push to `main` builds and deploys.

## Source inputs (not shipped)

- `output/` — `wordpress-export-to-markdown` result (posts/pages/custom).
- `wp-uploads/` — full `/wp-content/uploads` rsync, the image backstop.
- `export.xml` — raw WordPress export.
