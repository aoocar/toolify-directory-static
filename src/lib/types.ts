import type { Lang } from "@/lib/i18n";

export type Pricing = "free" | "freemium" | "paid" | "contact";

export type Category = {
  slug: string;
  icon: string;
  name: Record<Lang, string>;
  description: Record<Lang, string>;
  seo?: SeoFields;
  geo?: GeoFields;
};

export type Tool = {
  slug: string;
  website: string;
  logo: string;
  categories: string[];
  tags: string[];
  pricing: Pricing;
  featured: boolean;
  monthlyVisits: number;
  savedCount: number;
  publishedAt: string;
  updatedAt: string;
  name: Record<Lang, string>;
  tagline: Record<Lang, string>;
  description: Record<Lang, string>;
  seo?: SeoFields;
  geo?: GeoFields;
};

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
