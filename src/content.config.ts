import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const blog = defineCollection({
  loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    author: z.string().min(1),
    category: z.string().min(1),
    tags: z.array(z.string().min(1)).min(1),
    image: z.string().startsWith("/"),
    imageAlt: z.string().min(1),
    draft: z.boolean().default(false),
    relatedLinks: z.array(z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      href: z.string().startsWith("/"),
    })).default([]),
  }).refine((data) => data.updatedAt >= data.publishedAt, {
    message: "updatedAt no puede ser anterior a publishedAt",
    path: ["updatedAt"],
  }),
});

export const collections = { blog };
