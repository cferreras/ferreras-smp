import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		publishedAt: z.coerce.date(),
		updatedAt: z.coerce.date().optional(),
		author: z.string(),
		category: z.string(),
		tags: z.array(z.string()).default([]),
		image: z.string(),
		imageAlt: z.string(),
		draft: z.boolean().default(false),
		relatedLinks: z.array(z.object({
			title: z.string(),
			description: z.string(),
			href: z.string(),
		})).optional(),
	}),
});

export const collections = { blog };
