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
        navigateFallback: '/404.html',
        // Precache all HTML, CSS, JS, and fonts; images are handled at runtime.
        globPatterns: ['**/*.{html,css,js,woff,woff2,ico}'],
        runtimeCaching: [
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
