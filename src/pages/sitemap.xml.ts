import type { APIContext } from 'astro';
import { getPosts, postUrl, postDate, formatDate } from '../lib/posts';

// Served at /sitemap.xml, the address registered in Search Console for the
// Jekyll site. Static pages are discovered from src/pages at build time.
const pageModules = import.meta.glob('./**/*.{astro,md,mdx}');

const EXCLUDE = new Set(['/404/', '/jstestpage/']);

function staticPageUrls(): string[] {
  return Object.keys(pageModules)
    .filter((f) => !f.includes('['))
    .map((f) =>
      f
        .replace(/^\.\//, '/')
        .replace(/\.(astro|mdx?)$/, '')
        .replace(/(^|\/)index$/, '$1')
        .replace(/([^/])$/, '$1/'),
    )
    .filter((u) => !EXCLUDE.has(u));
}

export async function GET(context: APIContext) {
  const site = context.site!;
  const posts = await getPosts();
  const entries = [
    ...posts.map((p) => ({
      loc: new URL(postUrl(p), site).href,
      lastmod: formatDate(p.data.last_modified_at ?? postDate(p)),
    })),
    ...staticPageUrls().map((u) => ({ loc: new URL(u, site).href, lastmod: undefined })),
  ];
  const body =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    entries
      .map((e) => `<url>\n<loc>${e.loc}</loc>\n${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>\n` : ''}</url>`)
      .join('\n') +
    '\n</urlset>\n';
  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
}
