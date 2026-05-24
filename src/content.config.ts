import { defineCollection, z } from "astro:content";

const localizedText = z.object({
  en: z.string(),
  zh: z.string()
});

const seoSchema = z
  .object({
    primary_keyword: z.string().optional(),
    secondary_keywords: z.array(z.string()).optional(),
    search_intent: z.string().optional(),
    title_zh: z.string().optional(),
    title_en: z.string().optional(),
    meta_description_zh: z.string().optional(),
    meta_description_en: z.string().optional()
  })
  .optional();

const geoSchema = z
  .object({
    answer_summary_zh: z.string().optional(),
    answer_summary_en: z.string().optional(),
    facts: z.array(z.record(z.string())).optional(),
    faq: z.array(z.record(z.string())).optional()
  })
  .optional();

const categories = defineCollection({
  type: "content",
  schema: z.object({
    slug: z.string().optional(),
    icon: z.string(),
    name: localizedText,
    description: localizedText,
    seo: seoSchema,
    geo: geoSchema
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
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    name: localizedText,
    tagline: localizedText,
    description: localizedText,
    seo: seoSchema,
    geo: geoSchema
  })
});

export const collections = {
  categories,
  tools
};
