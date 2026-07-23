import { getCollection } from "astro:content";
import type { Lang } from "@/lib/i18n";
import type { Account, Category, Platform } from "@/lib/types";

export type AccountWithCategories = Account & {
  categoryItems: Category[];
  platformItem?: Platform;
};

/* ── Load collections (Zod-validated at build time) ── */

type Cache = {
  categories: Category[];
  accounts: Account[];
  platforms: Platform[];
};

let _cache: Cache | null = null;

async function load(): Promise<Cache> {
  if (!_cache) {
    const [catEntries, accEntries, platEntries] = await Promise.all([
      getCollection("categories"),
      getCollection("accounts"),
      getCollection("platforms")
    ]);
    // `slug` is a reserved field in content collections, so the canonical slug
    // comes from the entry (derived from filename or the frontmatter `slug`),
    // not necessarily from `data.slug`.
    _cache = {
      categories: catEntries.map((e) => ({ ...e.data, slug: e.data.slug ?? e.slug })),
      accounts: accEntries.map((e) => ({ ...e.data, slug: e.data.slug ?? e.slug })),
      platforms: platEntries.map((e) => ({ ...e.data, slug: e.data.slug ?? e.slug }))
    };
  }
  return _cache;
}

async function withRelations(account: Account): Promise<AccountWithCategories> {
  const { categories, platforms } = await load();
  return {
    ...account,
    categoryItems: account.categories
      .map((slug) => categories.find((c) => c.slug === slug))
      .filter(Boolean) as Category[],
    platformItem: platforms.find((p) => p.slug === account.platform)
  };
}

/* ── Accounts ── */

export async function getAccounts() {
  const { accounts } = await load();
  return Promise.all(accounts.map(withRelations));
}

export async function getAccountBySlug(slug: string) {
  const { accounts } = await load();
  const account = accounts.find((a) => a.slug === slug);
  return account ? withRelations(account) : undefined;
}

export async function getAccountsByCategory(categorySlug: string) {
  const { accounts } = await load();
  return Promise.all(
    accounts.filter((a) => a.categories.includes(categorySlug)).map(withRelations)
  );
}

export async function getAccountsByPlatform(platformSlug: string) {
  const { accounts } = await load();
  return Promise.all(
    accounts.filter((a) => a.platform === platformSlug).map(withRelations)
  );
}

export async function getFeaturedAccounts() {
  const { accounts } = await load();
  return Promise.all(accounts.filter((a) => a.featured).map(withRelations));
}

export async function getLatestAccounts(limit?: number) {
  const { accounts } = await load();
  const sorted = [...accounts].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  return Promise.all((limit ? sorted.slice(0, limit) : sorted).map(withRelations));
}

export async function getRankedAccounts(
  sortBy: "followers" | "engagement" | "growth" = "followers",
  limit?: number
) {
  const { accounts } = await load();
  const sorted = [...accounts].sort((a, b) => {
    if (sortBy === "engagement") return b.avgEngagement - a.avgEngagement;
    if (sortBy === "growth") return b.growthRate - a.growthRate;
    return b.followerCount - a.followerCount;
  });
  return Promise.all((limit ? sorted.slice(0, limit) : sorted).map(withRelations));
}

export async function getFastGrowingAccounts(limit?: number) {
  return getRankedAccounts("growth", limit);
}

/* ── Categories ── */

export async function getCategories() {
  const { categories } = await load();
  return categories;
}

export async function getCategoryBySlug(slug: string) {
  const { categories } = await load();
  return categories.find((c) => c.slug === slug);
}

export async function getCategoryCounts() {
  const { categories, accounts } = await load();
  return categories.map((category) => ({
    category,
    count: accounts.filter((a) => a.categories.includes(category.slug)).length
  }));
}

/* ── Platforms ── */

export async function getPlatforms() {
  const { platforms } = await load();
  return platforms;
}

export async function getPlatformBySlug(slug: string) {
  const { platforms } = await load();
  return platforms.find((p) => p.slug === slug);
}

export async function getPlatformCounts() {
  const { platforms, accounts } = await load();
  return platforms.map((platform) => ({
    platform,
    count: accounts.filter((a) => a.platform === platform.slug).length
  }));
}

/* ── Formatting ── */

export function formatNumber(value: number, lang: Lang) {
  if (lang === "zh") {
    if (value >= 100_000_000) return `${(value / 100_000_000).toFixed(1)}亿`;
    if (value >= 10_000) return `${(value / 10_000).toFixed(1)}万`;
    return value.toLocaleString("zh-CN");
  }
  return new Intl.NumberFormat("en-US", {
    notation: value >= 10_000 ? "compact" : "standard",
    maximumFractionDigits: 1
  }).format(value);
}
