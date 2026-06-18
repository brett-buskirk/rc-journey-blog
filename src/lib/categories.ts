// The five categories present in the migrated content double as the site's
// editorial sections. The `route` slugs match the original WordPress page URLs
// (e.g. /the-shadowed-mirror/) so existing inbound links and the rewired
// in-post links keep resolving.

export const CATEGORIES = {
  'shadowed-mirror': {
    route: 'the-shadowed-mirror',
    label: 'The Shadowed Mirror',
    blurb: 'Confronting the hard, often unseen truths of incarceration and reentry.',
  },
  'reentry-realities': {
    route: 'reentry-realities',
    label: 'Reentry Realities',
    blurb: 'The systemic barriers and daily realities of life after release.',
  },
  reflection: {
    route: 'reflections',
    label: 'Reflections',
    blurb: 'Travel, nature, and freedom as a lens for looking inward.',
  },
  'the-deep-well': {
    route: 'the-deep-well',
    label: 'The Deep Well',
    blurb: 'Longer meditations on meaning, mortality, and what comes next.',
  },
  'rcj-info': {
    route: 'rcj-info',
    label: 'About the Journey',
    blurb: 'What RC Journey is and why it exists.',
  },
} as const;

export type CategoryKey = keyof typeof CATEGORIES;

// Zod-friendly tuple of the valid keys (non-empty, for z.enum).
export const CATEGORY_KEYS = Object.keys(CATEGORIES) as [CategoryKey, ...CategoryKey[]];

export const categoryMeta = (key: CategoryKey) => CATEGORIES[key];

// Reverse lookup: route slug -> category key.
export const routeToCategory = (route: string): CategoryKey | undefined =>
  (Object.keys(CATEGORIES) as CategoryKey[]).find((k) => CATEGORIES[k].route === route);
