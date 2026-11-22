import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE } from '../consts';
import { getPosts, postUrl, postDate, postCategories, postTags } from '../lib/posts';
import { excerpt } from '../lib/excerpt';

// Same URL as the old jekyll-feed output so existing subscribers keep working.
export async function GET(context: APIContext) {
  const posts = await getPosts();
  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site!,
    items: posts.map((p) => ({
      title: p.data.title,
      link: postUrl(p),
      pubDate: postDate(p),
      description: p.data.description ?? p.data.excerpt ?? excerpt(p.body),
      categories: [...postCategories(p), ...postTags(p)],
    })),
  });
}
