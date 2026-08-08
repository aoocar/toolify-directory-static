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
    facts_zh: z.array(z.record(z.string())).optional(),
    facts_en: z.array(z.record(z.string())).optional(),
    faq: z.array(z.record(z.string())).optional(),
    faq_zh: z.array(z.record(z.string())).optional(),
    faq_en: z.array(z.record(z.string())).optional()
  })
  .optional();

/* ── Feed items: homepage 行业动态 / 创作者指南 (data-driven, Obsidian-managed) ── */

const feedItem = z.object({
  slug: z.string().optional(),
  title: localizedText,
  url: z.string(),
  summary: localizedText.optional(),
  order: z.number().default(0)
});

const news = defineCollection({
  type: "content",
  schema: feedItem.extend({ date: z.coerce.date().optional() })
});

// Guides serve two roles:
//   * kind: "link"    — legacy homepage shortcuts pointing at existing pages.
//                       They only carry a title + url and render no body.
//   * kind: "article" — original long-form guides that live under
//                       guides/<lang>/<slug>.md and render their Markdown body
//                       at /[lang]/guides/<slug>. One file per language, both
//                       sharing the same `slug` so the language switcher lines up.
const guides = defineCollection({
  type: "content",
  schema: feedItem.extend({
    url: z.string().optional(),
    kind: z.enum(["link", "article"]).default("link"),
    // `slug` is reserved: the loader uses it as the collection-wide unique id,
    // so the zh/en pair of one article cannot share it. Article guides declare
    // `guideId` instead — that is what becomes the public URL segment, and it
    // is intentionally identical across languages so the switcher lines up.
    guideId: z.string().optional(),
    lang: z.enum(["en", "zh"]).optional(),
    category: z.string().optional(),
    date: z.coerce.date().optional(),
    updated: z.coerce.date().optional(),
    // slugs of accounts already in the directory that this guide links to;
    // never list a creator we have not actually indexed.
    accounts: z.array(z.string()).optional(),
    seo: seoSchema,
    geo: geoSchema
  })
});

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

/* ── Tools (legacy AI-tool navigation, single-language zh) ──
 *   Ported from the old Hugo bookmark site (方案 A). One file per tool, the
 *   filename slug matches the old site's URL slug so a single wildcard 301
 *   (`/bookmarks/*` → `/zh/tools/*`) recovers all historical link equity.
 */

const tools = defineCollection({
  type: "content",
  schema: z.object({
    slug: z.string().optional(),
    title: z.string(),
    url: z.string().optional(),
    category: z.string().optional(),
    subCategory: z.string().optional(),
    tags: z.array(z.string()).optional(),
    recommend: z.number().optional(),
    description: z.string().optional()
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
    draft: z.boolean().optional().default(false),
    // metrics made optional on 2026-07-31: do NOT fabricate follower/engagement
    // figures for real accounts we cannot verify — leave blank instead.
    followerCount: z.number().optional(),
    avgEngagement: z.number().optional(),
    contentFrequency: z
      .enum(["daily", "weekly", "biweekly", "monthly", "irregular"])
      .optional(),
    growthRate: z.number().optional(),
    publishedAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
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
  accounts,
  news,
  guides,
  tools
};
