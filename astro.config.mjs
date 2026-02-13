// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://trumpaccounts.guide',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    routing: { prefixDefaultLocale: false },
    fallback: { es: 'en' },
  },
  integrations: [
    react(),
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/_'),
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en-US', es: 'es-MX' },
      },
      changefreq: 'weekly',
      priority: 0.7,
      serialize(item) {
        // Boost priority for key pages
        if (item.url === 'https://trumpaccounts.guide/' || item.url === 'https://trumpaccounts.guide/es') {
          item.priority = 1.0;
          item.changefreq = 'daily';
        } else if (
          item.url.includes('/what-are-trump-accounts') ||
          item.url.includes('/how-to-open-trump-account') ||
          item.url.includes('/faq') ||
          item.url.includes('/calculators') ||
          item.url.includes('/calculadoras') ||
          item.url.includes('/preguntas-frecuentes')
        ) {
          item.priority = 0.9;
          item.changefreq = 'weekly';
        } else if (item.url.includes('/blog/')) {
          item.priority = 0.8;
          item.changefreq = 'monthly';
        } else if (item.url.includes('/compare/') || item.url.includes('/glossary')) {
          item.priority = 0.8;
          item.changefreq = 'monthly';
        }
        return item;
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});