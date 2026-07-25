// The five categories present in the migrated content double as the site's
// editorial sections. The `route` slugs match the original WordPress page URLs
// (e.g. /the-shadowed-mirror/) so existing inbound links and the rewired
// in-post links keep resolving.

// Each section has a short `blurb` (used for meta/SEO and list previews) and a
// longer `intro` (the on-page lede that opens the section).
export const CATEGORIES = {
  'shadowed-mirror': {
    route: 'the-shadowed-mirror',
    label: 'The Shadowed Mirror',
    blurb: 'Confronting the hard, often unseen truths of incarceration and reentry.',
    intro:
      'The parts of the story that don’t fit on a postcard. These essays sit with the harder truths — what incarceration does to a person, what it asks of the people who love them, and what reentry keeps costing long after the gate closes behind you. No flinching, no tidy endings; just an honest look in the mirror.',
  },
  'reentry-realities': {
    route: 'reentry-realities',
    label: 'Reentry Realities',
    blurb: 'The systemic barriers and daily realities of life after release.',
    intro:
      'Freedom on paper and freedom in practice are two different things. This is the ground-level view of rebuilding a life — housing, work, paperwork, and the small bureaucracies that decide how quickly you’re allowed to belong again. Reported from inside the experience, not from above it.',
  },
  reflection: {
    route: 'reflections',
    label: 'Reflections',
    blurb: 'Travel, nature, and freedom as a lens for looking inward.',
    intro:
      'The open West as a way of thinking. Written from trailheads, summits, and long drives, these pieces use landscape and distance as a lens for what freedom feels like once you finally have it — and what you do with the time you were once forced to count.',
  },
  'the-deep-well': {
    route: 'the-deep-well',
    label: 'The Deep Well',
    blurb: 'Longer meditations on meaning, mortality, and what comes next.',
    intro:
      'The longer, slower questions — meaning, mortality, identity, and what a second life is actually for. These are the meditations that don’t resolve in a single sitting. Draw the bucket up slowly; there’s no bottom to reach in a hurry.',
  },
  // Not a browsable section — it holds the single "About the Journey" intro
  // article, which lives with the About page. Its `route` points at /about/ so
  // the article's category badge links there. Kept as a category so the post
  // stays schema-valid; it's excluded from the section grids.
  'rcj-info': {
    route: 'about',
    label: 'About the Journey',
    blurb: 'What RC Journey is and why it exists.',
    intro: 'What RC Journey is, and why it exists — the shape of the project, in its own words.',
  },
} as const;

export type CategoryKey = keyof typeof CATEGORIES;

// Zod-friendly tuple of the valid keys (non-empty, for z.enum).
export const CATEGORY_KEYS = Object.keys(CATEGORIES) as [CategoryKey, ...CategoryKey[]];

export const categoryMeta = (key: CategoryKey) => CATEGORIES[key];

// Reverse lookup: route slug -> category key.
export const routeToCategory = (route: string): CategoryKey | undefined =>
  (Object.keys(CATEGORIES) as CategoryKey[]).find((k) => CATEGORIES[k].route === route);
