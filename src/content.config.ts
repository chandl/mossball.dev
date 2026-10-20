import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const products = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/products' }),
  schema: z.object({
    name: z.string(),
    tagline: z.string(),
    url: z.url().optional(),
    status: z.enum(['live', 'waitlist', 'sprouting']),
    tags: z.array(z.string()).default([]),
    icon: z.string().optional(), // a glyph; omitted = sprout
    tone: z.enum(['moss', 'peach', 'sky']).default('moss'),
    order: z.number().default(100),
  }),
});

export const collections = { products };
