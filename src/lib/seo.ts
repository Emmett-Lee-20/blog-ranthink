import type { ImageMetadata } from 'astro';
import { SITE_TITLE, isoDate } from './site';

// The featured image as search engines and link previews see it.
export interface ShareImage {
  url: URL;
  width: number;
  height: number;
  type: string;
  // og:image:alt. Never empty: as on the old site, an image with no alt text is
  // described by the entry's visible title.
  alt: string;
  // The image's own alt text, which may be empty. The structured data uses it as
  // the caption only when there is one, as Rank Math did.
  caption: string;
}

// Dates and author for a post or page; the homepage has none.
export interface ArticleInfo {
  type: 'BlogPosting' | 'Article';
  published: Date;
  modified: Date;
  author: string;
}

export function shareImage(image: ImageMetadata, alt: string, title: string, site: URL): ShareImage {
  return {
    url: new URL(image.src, site),
    width: image.width,
    height: image.height,
    type: `image/${image.format === 'jpg' ? 'jpeg' : image.format}`,
    alt: alt || title,
    caption: alt,
  };
}

// The schema.org graph the old site's Rank Math plugin emitted, with the same nodes
// and the same names, at the new address. The differences are deliberate: the
// WebSite has no SearchAction, because this site has no search; the author has no
// profile page, avatar or link to a WordPress.com profile, because none exists here;
// and posts have no category.
export function structuredData(options: {
  site: URL;
  url: URL;
  title: string;
  description: string;
  home: boolean;
  image?: ShareImage;
  article?: ArticleInfo;
}) {
  const { site, url, title, description, home, image, article } = options;
  const person = `${site.href}#person`;
  const website = `${site.href}#website`;
  const webpage = `${url.href}#webpage`;
  const author = `${site.href}#author`;
  const dates = article && {
    datePublished: isoDate(article.published),
    dateModified: isoDate(article.modified),
  };

  const graph: Record<string, unknown>[] = [
    // Rank Math typed the site's owner as a Person on the homepage only.
    { '@type': home ? 'Person' : ['Person', 'Organization'], '@id': person, name: SITE_TITLE },
    {
      '@type': 'WebSite',
      '@id': website,
      url: site.origin,
      name: SITE_TITLE,
      alternateName: 'RT',
      publisher: { '@id': person },
      inLanguage: 'en-US',
    },
  ];
  if (image) {
    graph.push({
      '@type': 'ImageObject',
      '@id': image.url.href,
      url: image.url.href,
      width: String(image.width),
      height: String(image.height),
      ...(image.caption && { caption: image.caption }),
      inLanguage: 'en-US',
    });
  }
  graph.push({
    '@type': home ? 'CollectionPage' : 'WebPage',
    '@id': webpage,
    url: url.href,
    name: title,
    ...(home && { about: { '@id': person } }),
    ...dates,
    isPartOf: { '@id': website },
    ...(image && { primaryImageOfPage: { '@id': image.url.href } }),
    inLanguage: 'en-US',
  });
  if (article) {
    graph.push(
      { '@type': 'Person', '@id': author, name: article.author },
      {
        '@type': article.type,
        '@id': `${url.href}#richSnippet`,
        headline: title,
        name: title,
        description,
        ...dates,
        author: { '@id': author, name: article.author },
        publisher: { '@id': person },
        isPartOf: { '@id': webpage },
        ...(image && { image: { '@id': image.url.href } }),
        inLanguage: 'en-US',
        mainEntityOfPage: { '@id': webpage },
      },
    );
  }
  // Escape "<" so no text in the data can close the <script> element early.
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replaceAll('<', '\\u003c');
}
