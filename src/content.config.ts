import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const products = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/products' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      motto: z.string().optional(),
      tagline: z.string(),
      url: z.url().optional(),
      status: z.enum(['live', 'waitlist', 'sprouting']),
      glyph: z.string().optional(),
      features: z.array(z.object({ name: z.string(), text: z.string() })).default([]),
      shot: z.object({ src: image(), alt: z.string(), caption: z.string() }).optional(),
      order: z.number().default(100),
    }),
});

export const collections = { products };
