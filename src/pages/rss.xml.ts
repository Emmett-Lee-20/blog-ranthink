// The RSS feed. Readers subscribed to the old site asked for /feed/; public/_redirects
// serves this file there, so those subscriptions keep working.
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SITE_TITLE, TAGLINE, excerpt, newestFirst, postPath } from '../lib/site';

const ENTITIES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' };

function escape(text: string): string {
  return text.replace(/[&<>"']/g, (c) => ENTITIES[c]);
}

function cdata(text: string): string {
  return `<![CDATA[${text.replaceAll(']]>', ']]]]><![CDATA[>')}]]>`;
}

// "Sun, 21 Dec 2025 06:02:14 +0000", as WordPress wrote it.
function rfc822(date: Date): string {
  return date.toUTCString().replace('GMT', '+0000');
}

export const GET: APIRoute = async ({ site }) => {
  const posts = newestFirst(await getCollection('posts'));
  const feed = new URL('/feed/', site);
  // The newest edit, not the time of the build, so an unchanged site builds an
  // identical feed.
  const updated = new Date(Math.max(...posts.map((post) => post.data.updatedDate.getTime())));

  const items = posts.map((post) => {
    if (!post.rendered) throw new Error(`${post.id}: no rendered text for the feed`);
    const link = new URL(postPath(post), site).href;
    // Feed readers do not all resolve "/about/" against the post's address.
    const html = post.rendered.html.replace(/(href|src)="\//g, `$1="${site!.origin}/`);
    const guid = post.data.feedId
      ? `<guid isPermaLink="false">${escape(post.data.feedId)}</guid>`
      : `<guid isPermaLink="true">${escape(link)}</guid>`;
    return `
    <item>
      <title>${escape(post.data.title)}</title>
      <link>${escape(link)}</link>
      <dc:creator>${cdata(post.data.author)}</dc:creator>
      <pubDate>${rfc822(post.data.pubDate)}</pubDate>
      ${guid}
      <description>${cdata(excerpt(post.rendered.html))}</description>
      <content:encoded>${cdata(html)}</content:encoded>
    </item>`;
  });

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(SITE_TITLE)}</title>
    <atom:link href="${escape(feed.href)}" rel="self" type="application/rss+xml" />
    <link>${escape(site!.href)}</link>
    <description>${escape(TAGLINE)}</description>
    <lastBuildDate>${rfc822(updated)}</lastBuildDate>
    <language>en-US</language>${items.join('')}
  </channel>
</rss>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
