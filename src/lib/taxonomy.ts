import { getPosts, postCategories, postTags, type Post } from './posts';

/** Jekyll `slugify` (default mode): lower-case, non-alphanumerics -> "-". */
export function taxonomySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}

export interface TaxonomyGroup {
  name: string;
  slug: string;
  posts: Post[];
}

/** Groups posts by category or tag, largest group first (as Minimal Mistakes did). */
export async function groupPosts(kind: 'categories' | 'tags'): Promise<TaxonomyGroup[]> {
  const posts = await getPosts();
  const groups = new Map<string, TaxonomyGroup>();
  for (const post of posts) {
    const names = kind === 'categories' ? postCategories(post) : postTags(post);
    for (const name of names) {
      const slug = taxonomySlug(name);
      const g = groups.get(slug) ?? { name, slug, posts: [] };
      if (!g.posts.includes(post)) g.posts.push(post);
      groups.set(slug, g);
    }
  }
  return [...groups.values()].sort((a, b) => b.posts.length - a.posts.length);
}
