import { defineCollection, z } from "astro:content";

const localizedText = z.object({
  en: z.string(),
  zh: z.string()
});

const categories = defineCollection({
  type: "content",
  schema: z.object({
    slug: z.string().optional(),
    icon: z.string(),
    name: localizedText,
    description: localizedText
  })
});

const tools = defineCollection({
  type: "content",
  schema: z.object({
    slug: z.string().optional(),
    website: z.string().url(),
    logo: z.string(),
    categories: z.array(z.string()),
    tags: z.array(z.string()),
    pricing: z.enum(["free", "freemium", "paid", "contact"]),
    featured: z.boolean(),
    monthlyVisits: z.number(),
    savedCount: z.number(),
    publishedAt: z.date(),
    updatedAt: z.date(),
    name: localizedText,
    tagline: localizedText,
    description: localizedText
  })
});

export const collections = {
  categories,
  tools
};
