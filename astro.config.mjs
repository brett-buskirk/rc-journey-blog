// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import VitePWA from '@vite-pwa/astro';
import remarkStripLeadCover from './scripts/remark-strip-lead-cover.mjs';
import rehypeGallery from './scripts/rehype-gallery.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://rcjourney.cloud',
  integrations: [
    sitemap(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'RC Journey',
        short_name: 'RC Journey',
        description:
          "A returning citizen's travelogue and reentry memoir — the freedom of the American West held up against the realities of life after 24 years inside.",
        theme_color: '#97531a',
        background_color: '#ece3cf',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/apple-touch-icon.png', sizes: '192x192', type: 'image/png' },
          {
            src: '/favicon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        // Precache only immutable, content-hashed assets — NOT HTML. Pages are
        // served network-first (below), so a fresh deploy shows immediately for
        // returning visitors instead of a cached shell that can point at an
        // asset the new build already replaced.
        globPatterns: ['**/*.{css,js,woff,woff2,ico}'],
        // Opt out of @vite-pwa/astro's default navigateFallback ('/'). This is a
        // multi-page site, so there's no single shell to fall back to — and with
        // HTML no longer precached, that default would bind a handler to an
        // unprecached URL and break the worker. The key must be *present* to
        // override the integration default (it uses an `in` check), so we set it
        // to undefined; navigations are handled by the NetworkFirst rule below.
        navigateFallback: undefined,
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            // HTML navigations: try the network first so new content shows on
            // the next visit; fall back to the last-seen cached page only when
            // offline or the network stalls.
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages',
              networkTimeoutSeconds: 3,
              expiration: { maxEntries: 64, maxAgeSeconds: 7 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Astro content-hashes these filenames, so CacheFirst is always safe.
            urlPattern: /\/_astro\/.*\.(webp|png|jpg|jpeg|svg)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'astro-images',
              expiration: { maxEntries: 300, maxAgeSeconds: 30 * 24 * 60 * 60 },
            },
          },
          {
            urlPattern: /\/pagefind\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'pagefind',
              expiration: { maxEntries: 30, maxAgeSeconds: 7 * 24 * 60 * 60 },
            },
          },
        ],
      },
    }),
  ],
  markdown: {
    remarkPlugins: [remarkStripLeadCover],
    rehypePlugins: [rehypeGallery],
  },
  vite: {
    plugins: [tailwindcss()],
  },
  image: {
    responsiveStyles: true,
  },
});
