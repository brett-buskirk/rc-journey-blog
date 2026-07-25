import type { ImageMetadata } from 'astro';

// Section hero images, keyed by the section's route (= the file's basename).
// Drop src/assets/sections/<route>.(webp|jpg|jpeg|png) and it's picked up here.
// Shared by the section pages (full-bleed hero) and the homepage terrain cards
// (thumbnail), so the lookup lives in one place.
const modules = import.meta.glob<ImageMetadata>(
  '../assets/sections/*.{webp,jpg,jpeg,png}',
  { eager: true, import: 'default' },
);

const byRoute = new Map<string, ImageMetadata>();
for (const [path, img] of Object.entries(modules)) {
  const name = path.split('/').pop()?.replace(/\.[^.]+$/, '');
  if (name) byRoute.set(name, img);
}

export const sectionHero = (route: string): ImageMetadata | undefined => byRoute.get(route);
