#!/usr/bin/env node
// Rewire migrated post content to self-contained local assets.
//
// What it does, idempotently, for every output/posts/<slug>/index.md:
//   1. Any image/link URL pointing at .../wp-content/uploads/<path> (regardless of
//      host: the old droplet IP 104.131.184.150, the GCloud box 34.57.223.40,
//      rcjourney.cloud, etc.) is resolved against the local wp-uploads/ backstop,
//      copied into that post's images/ folder, and the reference rewritten to a
//      relative ./images/<file> path.
//   2. Internal page links (https://rcjourney.cloud/<page>/) become local routes
//      (/<page>/). Genuine external links (thelastmile.org, youtube, ...) are left
//      untouched.
//   3. Existing relative images/ refs are normalized to ./images/ so Astro's
//      build-time image optimization picks them up.
//   4. The coverImage frontmatter (a bare filename) is normalized to
//      ./images/<file> so the content-collection image() helper can resolve it.
//
// Re-running is a no-op once everything is local. Pass --dry to preview.

import { readFileSync, writeFileSync, existsSync, copyFileSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, basename, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const POSTS_DIR = join(ROOT, 'output', 'posts');
const UPLOADS_DIR = join(ROOT, 'wp-uploads');
const DRY = process.argv.includes('--dry');

// Any URL whose path contains /wp-content/uploads/<rest>. Captures <rest>.
const UPLOAD_URL = /https?:\/\/[^\s)"']+?\/wp-content\/uploads\/([^\s)"']+)/g;
// Internal site links that are NOT uploads (those are handled above).
const INTERNAL_LINK = /https?:\/\/(?:www\.)?rcjourney\.cloud(\/[a-z0-9-]+\/?|\/?)(?=[)"'\s])/g;
// True third-party stock (Unsplash-style) that happens to already be local.
const STOCK_RE = /photo-\d{10,}/;

// Build an index of every file under wp-uploads, keyed by both its path relative
// to the uploads root and by bare basename (for fallback).
function indexUploads(dir, rel = '', byPath = new Map(), byName = new Map()) {
  for (const entry of readdirSync(dir)) {
    const abs = join(dir, entry);
    const r = rel ? `${rel}/${entry}` : entry;
    if (statSync(abs).isDirectory()) indexUploads(abs, r, byPath, byName);
    else {
      byPath.set(r, abs);
      if (!byName.has(entry)) byName.set(entry, abs);
    }
  }
  return { byPath, byName };
}

const { byPath, byName } = indexUploads(UPLOADS_DIR);

const report = { posts: 0, copied: 0, rewritten: 0, internalLinks: 0, shortcodes: 0, widgets: 0, missing: [], stock: [] };

function resolveUpload(rest) {
  // rest looks like "2025/07/PXL_x.webp" or may contain query/size suffix.
  const clean = rest.split('?')[0].split('#')[0];
  if (byPath.has(clean)) return byPath.get(clean);
  const name = basename(clean);
  if (byName.has(name)) return byName.get(name);
  return null;
}

for (const slug of readdirSync(POSTS_DIR)) {
  const postDir = join(POSTS_DIR, slug);
  const mdPath = join(postDir, 'index.md');
  if (!existsSync(mdPath)) continue;
  report.posts++;

  const imagesDir = join(postDir, 'images');
  let md = readFileSync(mdPath, 'utf8');
  const original = md;

  // 1. Rewire wp-content/uploads URLs -> local ./images/<file>
  md = md.replace(UPLOAD_URL, (match, rest) => {
    const src = resolveUpload(rest);
    const name = basename(rest.split('?')[0].split('#')[0]);
    if (!src) {
      report.missing.push({ slug, ref: match });
      return match; // leave as-is so it's visibly broken, not silently dropped
    }
    const dest = join(imagesDir, name);
    if (!existsSync(dest)) {
      if (!DRY) {
        mkdirSync(imagesDir, { recursive: true });
        copyFileSync(src, dest);
      }
      report.copied++;
    }
    report.rewritten++;
    return `./images/${name}`;
  });

  // 2. Internal page links -> local routes (skip uploads, already handled).
  md = md.replace(INTERNAL_LINK, (match, path) => {
    report.internalLinks++;
    return path && path !== '/' ? path : '/';
  });

  // 3. Normalize existing relative images/ refs to ./images/ for Astro.
  md = md.replace(/\]\(images\//g, '](./images/');
  md = md.replace(/<img([^>]*?)src="images\//g, '<img$1src="./images/');

  // 3b. Strip leftover WP shortcodes that survived the export and now show as
  //     literal text, e.g. a standalone [newsletter_form] line (escaped or not).
  //     Safe: real links/images/refs aren't a bare bracketed token on their own line.
  md = md.replace(/^\s*\\?\[[a-z][a-z0-9 _\\-]*?\\?\]\s*$\n?/gim, (m) => {
    report.shortcodes++;
    return '';
  });

  // 3c. Strip trailing WP end-of-post WIDGET headings — a "Subscribe to Continue
  //     the Journey" form and a "More <section>" related-posts block — that
  //     exported as orphaned, body-less headings. Our article template already
  //     links the section and offers prev/next, so these are dead ends. Only
  //     removed when trailing (end of file), so mid-article headings are safe.
  const WIDGET = /^\s*#{1,3}\s*\[?\s*(subscribe to continue the journey|more (from )?[\w '’-]*?)\s*\]?(\([^)]*\))?\s*$/i;
  {
    const lines = md.replace(/\s+$/, '').split('\n');
    while (lines.length) {
      const last = lines[lines.length - 1];
      if (last.trim() === '') { lines.pop(); continue; }
      if (WIDGET.test(last)) { lines.pop(); report.widgets++; continue; }
      break;
    }
    md = lines.join('\n') + '\n';
  }

  // 4. Normalize coverImage frontmatter -> ./images/<file>
  md = md.replace(/^(coverImage:\s*)"?([^"\n]+?)"?\s*$/m, (m, key, val) => {
    const v = val.trim();
    if (v.startsWith('./images/') || v.startsWith('images/')) {
      return `${key}"${v.replace(/^images\//, './images/')}"`;
    }
    return `${key}"./images/${basename(v)}"`;
  });

  // Flag any leftover true-stock images (already local; candidates for replacement).
  for (const line of md.split('\n')) {
    if (STOCK_RE.test(line) && /!\[/.test(line)) {
      const hit = line.match(/photo-\d{10,}[^)"'\s]*/);
      if (hit) report.stock.push({ slug, file: hit[0] });
    }
  }

  if (md !== original && !DRY) writeFileSync(mdPath, md);
}

// ---- report ----
const log = (...a) => console.log(...a);
log(`\nRewire ${DRY ? '(dry run) ' : ''}complete:`);
log(`  posts scanned     : ${report.posts}`);
log(`  images copied     : ${report.copied}`);
log(`  refs rewritten    : ${report.rewritten}`);
log(`  internal links    : ${report.internalLinks}`);
log(`  shortcodes stripped: ${report.shortcodes}`);
log(`  widget headings    : ${report.widgets}`);
if (report.missing.length) {
  log(`\n  ⚠ ${report.missing.length} ref(s) NOT found in wp-uploads:`);
  for (const m of report.missing) log(`    [${m.slug}] ${m.ref}`);
} else {
  log(`  missing uploads   : 0 ✓`);
}
if (report.stock.length) {
  const uniq = [...new Set(report.stock.map((s) => `${s.slug} :: ${s.file}`))];
  log(`\n  ℹ ${uniq.length} third-party stock image(s) (local, flagged for re-source/replace):`);
  for (const s of uniq) log(`    ${s}`);
}
log('');
