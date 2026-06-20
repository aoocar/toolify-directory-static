import type { Lang } from "@/lib/i18n";
import type { Account, Category, Platform } from "@/lib/types";

export type AccountWithCategories = Account & {
  categoryItems: Category[];
  platformItem?: Platform;
};

type MarkdownData<T> = {
  frontmatter: T;
};

/* ── Load collections ── */

const categoryModules = import.meta.glob<MarkdownData<Category>>("../content/categories/*.md", {
  eager: true
});

const accountModules = import.meta.glob<MarkdownData<Account>>("../content/accounts/*.md", {
  eager: true
});

const platformModules = import.meta.glob<MarkdownData<Platform>>("../content/platforms/*.md", {
  eager: true
});

const categories = Object.values(categoryModules).map((m) => m.frontmatter);
const accounts = Object.values(accountModules).map((m) => m.frontmatter);
const platforms = Object.values(platformModules).map((m) => m.frontmatter);

/* ── Helpers ── */

function withRelations(account: Account): AccountWithCategories {
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
  return accounts.map(withRelations);
}

export async function getAccountBySlug(slug: string) {
  const account = accounts.find((a) => a.slug === slug);
  return account ? withRelations(account) : undefined;
}

export async function getAccountsByCategory(categorySlug: string) {
  return accounts
    .filter((a) => a.categories.includes(categorySlug))
    .map(withRelations);
}

export async function getAccountsByPlatform(platformSlug: string) {
  return accounts
    .filter((a) => a.platform === platformSlug)
    .map(withRelations);
}

export async function getFeaturedAccounts() {
  return accounts.filter((a) => a.featured).map(withRelations);
}

export async function getLatestAccounts(limit?: number) {
  const sorted = [...accounts].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  return (limit ? sorted.slice(0, limit) : sorted).map(withRelations);
}

export async function getRankedAccounts(
  sortBy: "followers" | "engagement" | "growth" = "followers",
  limit?: number
) {
  const sorted = [...accounts].sort((a, b) => {
    if (sortBy === "engagement") return b.avgEngagement - a.avgEngagement;
    if (sortBy === "growth") return b.growthRate - a.growthRate;
    return b.followerCount - a.followerCount;
  });
  return (limit ? sorted.slice(0, limit) : sorted).map(withRelations);
}

export async function getFastGrowingAccounts(limit?: number) {
  return getRankedAccounts("growth", limit);
}

/* ── Categories ── */

export async function getCategories() {
  return categories;
}

export async function getCategoryBySlug(slug: string) {
  return categories.find((c) => c.slug === slug);
}

export async function getCategoryCounts() {
  return categories.map((category) => ({
    category,
    count: accounts.filter((a) => a.categories.includes(category.slug)).length
  }));
}

/* ── Platforms ── */

export async function getPlatforms() {
  return platforms;
}

export async function getPlatformBySlug(slug: string) {
  return platforms.find((p) => p.slug === slug);
}

export async function getPlatformCounts() {
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
