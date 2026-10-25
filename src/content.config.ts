import { defineCollection, type SchemaContext } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Every field without a default is required. A post with a missing field, a
// malformed date or an image file that does not exist fails the build instead of
// publishing a broken page.
const entry = ({ image }: SchemaContext) =>
  z.object({
    // The heading readers see.
    title: z.string().min(1),
    // The <title> search engines show. On the old site this was set separately in
    // Rank Math and can be a different sentence from `title`; never derive it.
    seoTitle: z.string().min(1),
    // The meta description.
    description: z.string().min(1),
    // Malaysia time, e.g. 2025-08-17T13:18:02+08:00.
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date(),
    // The featured image, shown as the cover at the top of the page.
    image: image(),
    // Alt text for the cover. Empty ("") only if the image is purely decorative.
    imageAlt: z.string(),
    // CSS object-position of the cover image (the WordPress focal point).
    imagePosition: z.string().default('50% 70%'),
    author: z.string().default('Emmett Lee'),
    // The id the old WordPress feed gave this post, kept so that feed readers already
    // subscribed do not show it a second time. Posts written after the move leave it
    // out, and the feed identifies them by their address.
    feedId: z.string().min(1).optional(),
  });

const posts = defineCollection({
  loader: glob({ base: './src/content/posts', pattern: '*.md' }),
  schema: entry,
});

const pages = defineCollection({
  loader: glob({ base: './src/content/pages', pattern: '*.md' }),
  schema: entry,
});

export const collections = { posts, pages };
