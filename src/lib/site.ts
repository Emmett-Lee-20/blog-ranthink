import type { CollectionEntry } from 'astro:content';

export const SITE_TITLE = 'Ranthink';
export const TAGLINE = 'Rant about it, then think about it…mostly';

// Malaysia has used UTC+8 all year, with no daylight saving, since 1982.
const OFFSET_HOURS = 8;
const OFFSET = '+08:00';

function shifted(date: Date): Date {
  return new Date(date.getTime() + OFFSET_HOURS * 60 * 60 * 1000);
}

// "2025-08-17T13:18:02+08:00", as WordPress wrote it in <time datetime>.
export function isoDate(date: Date): string {
  return shifted(date).toISOString().slice(0, 19) + OFFSET;
}

// "August 17, 2025", as WordPress displayed it.
export function displayDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    timeZone: 'Asia/Kuala_Lumpur',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Posts keep their WordPress address, /YYYY/MM/DD/<file name>/, dated in Malaysia time.
export function postParams(post: CollectionEntry<'posts'>) {
  const [year, month, day] = shifted(post.data.pubDate).toISOString().slice(0, 10).split('-');
  return { year, month, day, slug: post.id };
}

export function postPath(post: CollectionEntry<'posts'>): string {
  const { year, month, day, slug } = postParams(post);
  return `/${year}/${month}/${day}/${slug}/`;
}

export function newestFirst(posts: CollectionEntry<'posts'>[]) {
  return posts.toSorted((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

// The homepage excerpt, built the way WordPress built it: the post's rendered text
// with all markup removed, cut to its first 55 words, followed by an ellipsis.
export function excerpt(html: string, words = 55): string {
  const text = html
    .replace(/<\/(p|h[1-6]|li|blockquote|summary|details)>|<br\s*\/?>/g, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z]+);/gi, (match, name: string) => {
      if (name[0] !== '#') return ENTITIES[name.toLowerCase()] ?? match;
      const hex = name[1] === 'x' || name[1] === 'X';
      return String.fromCodePoint(parseInt(name.slice(hex ? 2 : 1), hex ? 16 : 10));
    });
  const list = text.split(/[\n\r\t ]+/).filter(Boolean);
  return list.length > words ? list.slice(0, words).join(' ') + '…' : list.join(' ');
}
