import { getCollection } from "astro:content";
import type { Lang } from "@/lib/i18n";
import type { Account, Category, Platform, NewsItem, GuideItem } from "@/lib/types";

export type AccountWithCategories = Account & {
  categoryItems: Category[];
  platformItem?: Platform;
};

/* ── Load collections (Zod-validated at build time) ── */

type Cache = {
  categories: Category[];
  accounts: Account[];
  platforms: Platform[];
  news: NewsItem[];
  guides: GuideItem[];
};

let _cache: Cache | null = null;

async function load(): Promise<Cache> {
  if (!_cache) {
    const [catEntries, accEntries, platEntries, newsEntries, guidesEntries] = await Promise.all([
      getCollection("categories"),
      getCollection("accounts"),
      getCollection("platforms"),
      getCollection("news"),
      getCollection("guides")
    ]);
    // `slug` is a reserved field in content collections, so the canonical slug
    // comes from the entry (derived from filename or the frontmatter `slug`),
    // not necessarily from `data.slug`.
    _cache = {
      categories: catEntries.map((e) => ({ ...e.data, slug: e.data.slug ?? e.slug })),
      accounts: accEntries
        .map((e) => ({ ...e.data, slug: e.data.slug ?? e.slug }))
        // Exclude draft entries from the published site (Obsidian `publish: false`
        // equivalent). They stay in the repo as templates but are never built.
        .filter((a) => !a.draft),
      platforms: platEntries.map((e) => ({ ...e.data, slug: e.data.slug ?? e.slug })),
      news: newsEntries.map((e) => ({
        ...e.data,
        slug: e.data.slug ?? e.slug,
        date: e.data.date ? new Date(e.data.date).toISOString() : undefined
      })),
      guides: guidesEntries.map((e) => ({
        ...e.data,
        // Article guides live in guides/<lang>/ and share one `guideId` across
        // languages — that is the public URL segment. Legacy link entries sit
        // at the collection root and still use `slug`.
        slug: e.data.guideId ?? e.data.slug ?? e.slug,
        date: e.data.date ? new Date(e.data.date).toISOString() : undefined,
        updated: e.data.updated ? new Date(e.data.updated).toISOString() : undefined
      }))
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
    (a, b) =>
      new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime()
  );
  return Promise.all((limit ? sorted.slice(0, limit) : sorted).map(withRelations));
}

export async function getRankedAccounts(
  sortBy: "followers" | "engagement" | "growth" = "followers",
  limit?: number
) {
  const { accounts } = await load();
  const sorted = [...accounts].sort((a, b) => {
    if (sortBy === "engagement")
      return (b.avgEngagement ?? -Infinity) - (a.avgEngagement ?? -Infinity);
    if (sortBy === "growth")
      return (b.growthRate ?? -Infinity) - (a.growthRate ?? -Infinity);
    return (b.followerCount ?? -Infinity) - (a.followerCount ?? -Infinity);
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

/* ── Feed items (homepage 行业动态 / 创作者指南) ── */

export type ResolvedFeedItem = {
  title: string;
  url: string;
  summary?: string;
  date?: string;
};

export async function getNews(lang: Lang): Promise<ResolvedFeedItem[]> {
  const { news } = await load();
  return [...news]
    .sort((a, b) => {
      const ta = a.date ? new Date(a.date).getTime() : 0;
      const tb = b.date ? new Date(b.date).getTime() : 0;
      if (tb !== ta) return tb - ta;
      return a.order - b.order;
    })
    .map((n) => ({
      title: n.title[lang],
      url: n.url,
      summary: n.summary?.[lang],
      date: n.date
    }));
}

/**
 * Homepage "creator guides" list. Article guides exist once per language, so
 * only the entry matching the current language is kept — otherwise every guide
 * would appear twice. Legacy link entries have no `lang` and always show.
 */
export async function getGuides(lang: Lang, limit?: number): Promise<ResolvedFeedItem[]> {
  const { guides } = await load();
  const items = [...guides]
    .filter((g) => g.kind !== "article" || g.lang === lang)
    .sort((a, b) => {
      // newest articles first, then legacy links by their manual order
      const ta = a.date ? new Date(a.date).getTime() : 0;
      const tb = b.date ? new Date(b.date).getTime() : 0;
      if (tb !== ta) return tb - ta;
      return a.order - b.order;
    })
    .map((g) => ({
      title: g.title[lang],
      url: g.url ?? `/guides/${g.slug}`,
      summary: g.summary?.[lang],
      date: g.date
    }));
  return limit ? items.slice(0, limit) : items;
}

export type GuideArticle = GuideItem & { category?: string };

/** Original long-form guides for the given language, newest first. */
export async function getGuideArticles(lang: Lang): Promise<GuideArticle[]> {
  const { guides } = await load();
  return [...guides]
    .filter((g) => g.kind === "article" && g.lang === lang)
    .sort((a, b) => {
      const ta = a.date ? new Date(a.date).getTime() : 0;
      const tb = b.date ? new Date(b.date).getTime() : 0;
      if (tb !== ta) return tb - ta;
      return a.order - b.order;
    });
}

/** Other guides covering the same niche, used for cross-linking. */
export async function getRelatedGuides(lang: Lang, category: string | undefined, excludeSlug: string) {
  if (!category) return [];
  const articles = await getGuideArticles(lang);
  return articles.filter((g) => g.category === category && g.slug !== excludeSlug);
}

/* ── Formatting ── */

export function formatNumber(value: number | undefined, lang: Lang) {
  if (value === undefined || value === null) return "—";
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
