import { z } from "zod";
import { DEFAULT_AUTHOR_SLUG } from "./authors";

export const blogFrontmatterSchema = z.object({
  title: z.string().min(1, "title is required"),
  description: z.string().min(1, "description is required"),
  publishedAt: z.string().min(1, "publishedAt is required"),
  updatedAt: z.string().nullable().optional().default(null),
  canonicalUrl: z.string().nullable().optional().default(null),
  coverImage: z.string().nullable().optional().default(null),
  author: z
    .union([z.string().min(1), z.array(z.string().min(1)).min(1)])
    .optional()
    .default(DEFAULT_AUTHOR_SLUG)
    .transform((value) => (Array.isArray(value) ? value : [value])),
  tags: z.array(z.string()).optional().default([]),
  category: z.string().nullable().optional().default(null),
  keywords: z.array(z.string()).optional().default([]),
  draft: z.boolean().optional().default(false),
  featured: z.boolean().optional().default(false),
  noindex: z.boolean().optional().default(false),
  series: z
    .object({
      name: z.string(),
      part: z.number(),
    })
    .nullable()
    .optional()
    .default(null),
});
