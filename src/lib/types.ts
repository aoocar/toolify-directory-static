import type { Lang } from "@/lib/i18n";

/* ── Shared ── */

export type SeoFields = {
  primary_keyword?: string;
  secondary_keywords?: string[];
  search_intent?: string;
  title_zh?: string;
  title_en?: string;
  meta_description_zh?: string;
  meta_description_en?: string;
};

export type GeoFields = {
  answer_summary_zh?: string;
  answer_summary_en?: string;
  facts?: Array<Record<string, string>>;
  faq?: Array<Record<string, string>>;
};

/* ── Platform ── */

export type Platform = {
  slug: string;
  icon: string;
  name: Record<Lang, string>;
  description: Record<Lang, string>;
  baseUrl: string;
  type: "short-video" | "video" | "image-text" | "social" | "knowledge";
};

/* ── Category (content niche) ── */

export type Category = {
  slug: string;
  icon: string;
  name: Record<Lang, string>;
  description: Record<Lang, string>;
  seo?: SeoFields;
  geo?: GeoFields;
};

/* ── Account (core entity) ── */

export type Monetization =
  | "brand-deals"
  | "ads"
  | "courses"
  | "e-commerce"
  | "membership"
  | "tips"
  | "mixed"
  | "unknown";

export type ContentFrequency = "daily" | "weekly" | "biweekly" | "monthly" | "irregular";

export type Account = {
  slug: string;
  profileUrl: string;
  avatar: string;
  platform: string;
  platformId: string;
  verified: boolean;
  categories: string[];
  tags: string[];
  contentStyle: string[];
  monetization: Monetization;
  featured: boolean;
  draft?: boolean;
  followerCount: number;
  avgEngagement: number;
  contentFrequency: ContentFrequency;
  growthRate: number;
  publishedAt: string;
  updatedAt: string;
  name: Record<Lang, string>;
  tagline: Record<Lang, string>;
  description: Record<Lang, string>;
  seo?: SeoFields;
  geo?: GeoFields;
};

/* ── Feed items (homepage 行业动态 / 创作者指南) ── */

export type FeedItem = {
  slug: string;
  title: Record<Lang, string>;
  url: string;
  summary?: Record<Lang, string>;
  order: number;
};

export type NewsItem = FeedItem & {
  date?: string;
};

export type GuideItem = FeedItem;
