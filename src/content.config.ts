import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { CATEGORY_KEYS } from './lib/categories';

// The migrated WordPress export lives in output/posts/<slug>/index.md, with
// co-located images/. We load it in place — the slug (folder name) is preserved
// verbatim as the entry id, which becomes the URL and protects SEO history.
const posts = defineCollection({
  loader: glob({
    pattern: '*/index.md',
    base: './output/posts',
    // entry is "<slug>/index.md" -> id "<slug>"
    generateId: ({ entry }) => entry.replace(/\/index\.md$/, ''),
  }),
  // A missing or malformed field FAILS THE BUILD by design (see CLAUDE.md).
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      author: z.string(),
      date: z.coerce.date(),
      // Exported as a YAML list; every post has exactly one. Unknown/typo'd
      // category -> build error.
      categories: z.array(z.enum(CATEGORY_KEYS)).min(1),
      tags: z.array(z.string()).default([]),
      // Resolves ./images/<file> relative to the entry; optimized at build time.
      // Missing file -> build error.
      coverImage: image(),
      draft: z.boolean().default(false),
    }),
});

export const collections = { posts };
