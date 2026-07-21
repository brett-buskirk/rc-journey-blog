# Roadmap

RC Journey rebuilt as a self-owned Astro static site, replacing the WordPress +
Elementor droplet. **The migration is complete** — the site is live in
production on DigitalOcean App Platform, DNS is cut over, and the old droplet has
been retired. What remains below is optional polish and ongoing maintenance.

## Deploy & cut over

- [x] Ship to DigitalOcean App Platform from the existing spec (`.do/app.yaml`) —
      GitOps builds on every push to `main`. **Done** — app `rc-journey` is live
      (deploy-on-push against `brett-buskirk/rc-journey-blog`).
- [x] Verify the static build against the live `rcjourney.cloud` — apex + `www`
      serve the Astro build over HTTPS.
- [x] Preserve original slugs — kept verbatim as the URL structure, so no
      redirects were needed for SEO history.
- [x] Point DNS at the new app and confirm HTTPS — done (DO-managed DNS).
- [x] Decommission the WordPress droplet — **destroyed**; the Elementor + WP
      hosting cost is retired (the reason for the rebuild).

## Content & polish (nice-to-have)

- [ ] Rebuild the leftover Elementor `pages/`/`custom/` exports as native pages,
      or drop them if no longer needed.
- [ ] Optional: contact form (serverless/form service) and comments (Giscus).

## Maintenance

- Keep Astro, Tailwind, and Pagefind current; the Zod content schema fails the
  build on any malformed frontmatter, which keeps content regressions out.
