// Site-wide constants and chrome content.

import { CATEGORIES, type CategoryKey } from './categories';

export const SITE = {
  title: 'RC Journey',
  tagline: 'The long view from the other side of the gate.',
  description:
    'A returning citizen’s travelogue and reentry memoir — the freedom of the American West held up against the realities of life after 24 years inside.',
  url: 'https://rcjourney.cloud',
  author: 'Brett',
  // Day one of freedom — the throughline the site counts from.
  freedomDate: '2021-01-22',
};

// The four editorial sections that anchor the nav — order is the curated path
// from hardest truths toward reflection. Derived from CATEGORIES so labels and
// routes stay in one place. (rcj-info remains a route, just not a nav item.)
const NAV_SECTIONS: CategoryKey[] = [
  'shadowed-mirror',
  'reentry-realities',
  'reflection',
  'the-deep-well',
];
const sectionLinks = NAV_SECTIONS.map((k) => ({
  label: CATEGORIES[k].label,
  href: `/${CATEGORIES[k].route}/`,
}));

export const NAV = [...sectionLinks, { label: 'About', href: '/about/' }];

// Footer mirrors the sections and adds the full archive.
export const FOOTER_NAV = [
  ...sectionLinks,
  { label: 'All Writing', href: '/blog/' },
  { label: 'About', href: '/about/' },
];

export const SOCIAL = [
  { label: 'brett-buskirk.dev', href: 'https://brett-buskirk.dev' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/brett-buskirk/' },
  { label: 'GitHub', href: 'https://github.com/brett-buskirk' },
  { label: 'Medium', href: 'https://medium.com/@brett-buskirk' },
  { label: 'Pexels', href: 'https://www.pexels.com/@brett-buskirk-70981875/' },
];

/**
 * Whole days of freedom elapsed since `freedomDate`. Used for the build-time
 * (and no-JS) fallback; the value is recomputed live in the browser on each
 * visit — see the `[data-days-free]` script in Base.astro — so it stays correct
 * without a rebuild.
 */
export function daysFree(now = new Date()): number {
  const start = new Date(SITE.freedomDate + 'T00:00:00Z');
  return Math.max(0, Math.floor((now.getTime() - start.getTime()) / 86_400_000));
}
