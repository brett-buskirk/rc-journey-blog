# Roadmap

RC Journey rebuilt as a self-owned Astro static site, replacing the WordPress +
Elementor droplet. The build, content migration, design pass, and search are
done; what remains is getting it live and retiring the old stack.

## Deploy & cut over

- [ ] Ship to DigitalOcean App Platform from the existing spec (`.do/app.yaml`) —
      `doctl apps create`, then GitOps builds on every push to `main`.
- [ ] Verify the static build against the live `rcjourney.cloud` site page by page.
- [ ] Preserve original slugs and add redirects for any URL that changed, so SEO
      history survives the jump.
- [ ] Point DNS at the new app and confirm HTTPS.
- [ ] Decommission the WordPress droplet once verified — ends the Elementor and
      WP hosting cost (the reason for the rebuild).

## Content & polish (nice-to-have)

- [ ] Rebuild the leftover Elementor `pages/`/`custom/` exports as native pages,
      or drop them if no longer needed.
- [ ] Optional: contact form (serverless/form service) and comments (Giscus).

## Maintenance

- Keep Astro, Tailwind, and Pagefind current; the Zod content schema fails the
  build on any malformed frontmatter, which keeps content regressions out.
