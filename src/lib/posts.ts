import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

const DATE_FILENAME = /^(?:.*\/)?(\d{4}-\d{2}-\d{2})-(.+)$/;

// Jekyll 3 Utils.slugify(mode: "pretty", cased: true)
function slugifyPretty(s: string): string {
  return s
    .replace(/[^\p{M}\p{L}\p{Nd}._~!$&'()+,;=@]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}

function toList(v: string | string[] | undefined): string[] {
  if (!v) return [];
  // Jekyll splits a string value on whitespace.
  return Array.isArray(v) ? v.map(String) : String(v).split(/\s+/).filter(Boolean);
}

export function postSlug(post: Post): string {
  const m = post.id.match(DATE_FILENAME);
  return slugifyPretty(m ? m[2] : post.id);
}

export function postDate(post: Post): Date {
  if (post.data.date) return post.data.date;
  const m = post.id.match(DATE_FILENAME);
  return m ? new Date(m[1]) : new Date(0);
}

export function postCategories(post: Post): string[] {
  return [...toList(post.data.categories), ...toList(post.data.category)];
}

export function postTags(post: Post): string[] {
  return toList(post.data.tags);
}

/**
 * Reproduces Jekyll's `permalink: /:categories/:title/`:
 * categories are lower-cased, de-duplicated and joined with "/";
 * the title keeps its case. An explicit `permalink` wins.
 * Returned without leading/trailing slashes (route param form).
 */
export function postPath(post: Post): string {
  if (post.data.permalink) return post.data.permalink.replace(/^\/+|\/+$/g, '');
  const cats = [...new Set(postCategories(post).map((c) => c.toLowerCase()))];
  return [...cats, postSlug(post)].join('/');
}

export function postUrl(post: Post): string {
  return `/${postPath(post)}/`;
}

export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('posts', (p) => p.data.published);
  // Jekyll order: newest first, ties broken by file path (reverse).
  return posts.sort(
    (a, b) => postDate(b).getTime() - postDate(a).getTime() || b.id.localeCompare(a.id),
  );
}

export function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** "April 8, 2021" (the date format the Jekyll theme showed). */
export function formatLongDate(d: Date): string {
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}
