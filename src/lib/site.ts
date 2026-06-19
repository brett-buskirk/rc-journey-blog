// Site-wide constants and chrome content.

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

export const NAV = [
  { label: 'The Shadowed Mirror', href: '/the-shadowed-mirror/' },
  { label: 'Reentry Realities', href: '/reentry-realities/' },
  { label: 'Reflections', href: '/reflections/' },
  { label: 'The Deep Well', href: '/the-deep-well/' },
  { label: 'Voices of Resilience', href: '/voices-of-resilience/' },
  { label: 'Resources & Support', href: '/resources-and-support/' },
  { label: 'About', href: '/about/' },
];

export const SOCIAL = [
  { label: 'YouTube', href: 'https://www.youtube.com/@RC_Journey' },
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
