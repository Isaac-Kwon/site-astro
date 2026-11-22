import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const stringOrList = z.union([z.string(), z.array(z.string())]);

const posts = defineCollection({
  // Keep the Jekyll file name (YYYY-MM-DD-slug) as the entry id; URLs are
  // derived from it in src/lib/posts.ts with Jekyll's own rules.
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/posts',
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date().optional(),
    last_modified_at: z.coerce.date().optional(),
    categories: stringOrList.optional(),
    category: z.string().optional(),
    tags: stringOrList.optional(),
    permalink: z.string().optional(),
    excerpt: z.string().optional(),
    description: z.string().optional(),
    published: z.boolean().default(true),
    toc: z.boolean().default(false),
    toc_label: z.string().optional(),
    toc_sticky: z.boolean().default(false),
  }),
});

export const collections = { posts };
