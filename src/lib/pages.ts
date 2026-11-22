import { getCollection, type CollectionEntry } from 'astro:content';

export type Page = CollectionEntry<'pages'>;

export async function getPages(): Promise<Page[]> {
  return getCollection('pages');
}

/** Route param form of the page's permalink (no leading/trailing slash). */
export function pagePath(page: Page): string {
  return page.data.permalink.replace(/^\/+|\/+$/g, '');
}
