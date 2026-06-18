// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import remarkStripLeadCover from './scripts/remark-strip-lead-cover.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://rcjourney.cloud',
  integrations: [sitemap()],
  markdown: {
    remarkPlugins: [remarkStripLeadCover],
  },
  vite: {
    plugins: [tailwindcss()],
  },
  image: {
    // Build-time optimization via sharp (AVIF/WebP, responsive).
    responsiveStyles: true,
  },
});
