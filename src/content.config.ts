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

/* ── Platforms ── */

const platforms = defineCollection({
  type: "content",
  schema: z.object({
    slug: z.string().optional(),
    icon: z.string(),
    name: localizedText,
    description: localizedText,
    baseUrl: z.string(),
    type: z.enum(["short-video", "video", "image-text", "social", "knowledge"])
  })
});

/* ── Categories (content niches) ── */

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

/* ── Accounts (core entity) ── */

const accounts = defineCollection({
  type: "content",
  schema: z.object({
    slug: z.string().optional(),
    profileUrl: z.string().url(),
    avatar: z.string(),
    platform: z.string(),
    platformId: z.string(),
    verified: z.boolean(),
    categories: z.array(z.string()),
    tags: z.array(z.string()),
    contentStyle: z.array(z.string()),
    monetization: z.enum([
      "brand-deals",
      "ads",
      "courses",
      "e-commerce",
      "membership",
      "tips",
      "mixed",
      "unknown"
    ]),
    featured: z.boolean(),
    followerCount: z.number(),
    avgEngagement: z.number(),
    contentFrequency: z.enum(["daily", "weekly", "biweekly", "monthly", "irregular"]),
    growthRate: z.number(),
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
  platforms,
  categories,
  accounts
};
