import type { Lang } from "@/lib/i18n";

export type Pricing = "free" | "freemium" | "paid" | "contact";

export type Category = {
  slug: string;
  icon: string;
  name: Record<Lang, string>;
  description: Record<Lang, string>;
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
};
