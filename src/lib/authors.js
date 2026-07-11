import { z } from "zod";

export const authorSchema = z.object({
  slug: z.string(),
  name: z.string(),
  avatar: z.string().nullable().optional().default(null),
  title: z.string().nullable().optional().default(null),
  bio: z.string().nullable().optional().default(null),
  socials: z
    .object({
      twitter: z.string().nullable().optional().default(null),
      linkedin: z.string().nullable().optional().default(null),
      facebook: z.string().nullable().optional().default(null),
      instagram: z.string().nullable().optional().default(null),
      website: z.string().nullable().optional().default(null),
    })
    .optional()
    .default({}),
});

export const DEFAULT_AUTHOR_SLUG = "krishna-gupta";

const AUTHORS = {
  "krishna-gupta": {
    slug: "krishna-gupta",
    name: "Krishna Gupta",
    avatar: "/icons/ContextGPT_author.jpg",
    title: "Founder @ ContextGPT",
    bio: "I build AI-powered customer support and lead generation tools.",
    socials: {
      twitter: "https://x.com/kgupta_2005",
      linkedin: "https://www.linkedin.com/in/krishna-gupta-739506254/",
      facebook: null,
      instagram: "https://www.instagram.com/oye._.gupta/",
      website: "https://portfolio-jet-three-21.vercel.app/",
    },
  },
};

export function slugifyAuthor(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function getAuthorBySlug(slug) {
  const entry = AUTHORS[slug] ?? AUTHORS[DEFAULT_AUTHOR_SLUG];
  return authorSchema.parse(entry);
}

export function getAllAuthorEntries() {
  return Object.values(AUTHORS).map((a) => authorSchema.parse(a));
}
