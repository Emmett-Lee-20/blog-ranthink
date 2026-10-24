// @ts-check
import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';

export default defineConfig({
  site: 'https://blog.ranthink.com',
  // WordPress served every page at a URL ending in "/" (/about/, /2025/08/17/<slug>/).
  trailingSlash: 'always',
  markdown: {
    // The posts were captured with WordPress's typography already applied (curly
    // quotes, dashes, ellipses). Applying smart punctuation again would alter the text.
    processor: satteri({ features: { smartPunctuation: false } }),
  },
  vite: {
    build: {
      // The CSS minifier rounds numbers (1.056603774 becomes 1.0566). The design spec
      // requires the measured line-heights exactly, and the stylesheet is a few KB.
      cssMinify: false,
    },
  },
});
