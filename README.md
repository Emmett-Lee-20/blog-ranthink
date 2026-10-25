# blog-ranthink

Source for **blog.ranthink.com**, the static version of the Ranthink blog. It was migrated from
WordPress.com in October 2026. The migration plan and its records are kept in a separate
documentation repository, `Emmett-Lee-20/ranthink`.

The site is built with [Astro](https://astro.build) into plain HTML files, to be served by
Cloudflare Pages. Once Pages is connected to this repository, it builds and publishes every merge to
`main`. There is no server and no database.

## Writing a post

Add a Markdown file to `src/content/posts/`. The file name becomes the last part of the address:
`my-post.md` published on 3 January 2026 is served at `/2026/01/03/my-post/`.

```markdown
---
title: "The heading readers see"
seoTitle: "The title search engines show"
description: "One or two sentences for search results."
pubDate: "2026-01-03T09:30:00+08:00"
updatedDate: "2026-01-03T09:30:00+08:00"
image: "../../assets/images/my-photo.jpg"
imageAlt: "What the photo shows"
---

The text of the post.
```

- Put the featured image in `src/assets/images/`. It is shown as the cover at the top of the post and
  in the list on the homepage.
- Write dates in Malaysia time, ending in `+08:00`.
- Use `imageAlt: ""` only for an image that shows nothing a reader needs to know about.
- Leave out `feedId`. Only the two posts moved from WordPress have one, so that readers already
  subscribed to the old feed do not see them twice.
- Write the punctuation you want readers to see. Curly quotes (’ “ ”), dashes (–) and the ellipsis
  (…) are not added automatically.

Pages such as About go in `src/content/pages/` with the same fields. `about.md` is served at
`/about/` and is linked from the top of every page.

**A mistake stops the build instead of publishing.** A missing or empty field, a date that is not a
date, or an image file that does not exist fails `npm run build` with a message naming the file
and the field. The rules are in `src/content.config.ts`.

## Building it on your computer

This needs Node.js 22.23.4 or later. Node 24 is recommended, and `.node-version` pins the version
Cloudflare Pages uses. Odd-numbered releases such as Node 25 are not supported by Astro.

```sh
npm ci             # install exactly the versions in package-lock.json
npm run dev        # a preview at http://localhost:4321 that reloads as you edit
npm run build      # build the site into dist/
npm run preview    # serve dist/ to check the finished build
```

## Rules for this repository

- **It is public.** Every commit and every pushed branch can be read by anyone. Never commit a
  password, API key, token, or anything else secret, and never push a branch that is not ready to
  be read.
- **Changes reach `main` only through a pull request.** A ruleset on GitHub refuses direct pushes to
  `main`. Work on a branch, open a pull request, and the owner merges it.
- **Merging is publishing.** Once Cloudflare Pages is connected, a merge to `main` goes live within
  minutes.
- **GitHub Actions is turned off** and should stay off. Cloudflare Pages builds the site through its
  own connection to this repository.

## How it is laid out

| Path | What it holds |
|---|---|
| `src/content/posts/`, `src/content/pages/` | The writing, one Markdown file each |
| `src/content.config.ts` | The required fields, checked on every build |
| `src/assets/images/` | Featured images, served byte-for-byte as uploaded |
| `src/assets/theme/` | The homepage cover and footer backgrounds |
| `src/pages/` | Which addresses exist: the homepage, posts by date, pages, and the 404 page |
| `src/pages/rss.xml.ts`, `src/pages/sitemap.xml.ts` | The RSS feed and the sitemap, built from the posts |
| `src/layouts/`, `src/components/` | The page frame, the cover, the top bar and the footer |
| `src/lib/site.ts` | Dates in Malaysia time, post addresses and homepage excerpts |
| `src/lib/seo.ts` | Link previews and the structured data search engines read |
| `src/styles/global.css` | All styling |
| `public/_headers` | Keeps the temporary `*.pages.dev` addresses out of search engines; labels the feed |
| `public/_redirects` | Old WordPress addresses: the feed at `/feed/`, the old sitemap, archive pages |
| `public/robots.txt` | Lets search engines in and points them to the sitemap |
