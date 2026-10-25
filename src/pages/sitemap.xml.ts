// The list of addresses search engines should index: the homepage, the pages and the
// posts. public/robots.txt points to it.
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { isoDate, newestFirst, postPath } from '../lib/site';

export const GET: APIRoute = async ({ site }) => {
  const posts = newestFirst(await getCollection('posts'));
  const pages = await getCollection('pages');
  const newest = new Date(Math.max(...posts.map((post) => post.data.updatedDate.getTime())));
  const entries = [
    { path: '/', modified: newest },
    ...pages.map((page) => ({ path: `/${page.id}/`, modified: page.data.updatedDate })),
    ...posts.map((post) => ({ path: postPath(post), modified: post.data.updatedDate })),
  ];
  // Every address is built from a file name, so none contains a character XML must escape.
  const urls = entries.map(
    ({ path, modified }) => `
  <url>
    <loc>${new URL(path, site).href}</loc>
    <lastmod>${isoDate(modified)}</lastmod>
  </url>`,
  );
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
