import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const guides = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/guides' }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(155),
    author: z.string(),
    lastVerified: z.coerce.date(),
    sources: z.array(z.object({
      name: z.string(),
      url: z.string().url(),
    })),
    relatedPages: z.array(z.string()).optional(),
    featuredCalculator: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const faqs = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/faqs' }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(155),
    category: z.string(),
    lastVerified: z.coerce.date(),
    draft: z.boolean().default(false),
  }),
});

const comparisons = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/comparisons' }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(155),
    lastVerified: z.coerce.date(),
    draft: z.boolean().default(false),
  }),
});

const news = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/news' }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(155),
    publishDate: z.coerce.date(),
    author: z.string(),
    draft: z.boolean().default(false),
  }),
});

const glossary = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/glossary' }),
  schema: z.object({
    term: z.string(),
    definition: z.string(),
    relatedTerms: z.array(z.string()).optional(),
  }),
});

export const collections = {
  guides,
  faqs,
  comparisons,
  news,
  glossary,
};
