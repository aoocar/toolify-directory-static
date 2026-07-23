import path from "node:path";
import { dateOnly, defaultVaultPath, listMarkdown, readMarkdown, slugify, writeMarkdown } from "./content-utils.mjs";

const projectRoot = process.cwd();
const vaultRoot = process.env.VAULT_PATH || defaultVaultPath;
const today = dateOnly();

const siteAccountsDir = path.join(projectRoot, "src", "content", "accounts");
const siteCategoriesDir = path.join(projectRoot, "src", "content", "categories");
const sitePlatformsDir = path.join(projectRoot, "src", "content", "platforms");
const vaultAccountsDir = path.join(vaultRoot, "Accounts");
const vaultCategoriesDir = path.join(vaultRoot, "Categories");
const vaultPlatformsDir = path.join(vaultRoot, "Platforms");

let accountCount = 0;
let categoryCount = 0;
let platformCount = 0;

function defaultSeo(name, tags) {
  return {
    primary_keyword: `${name?.en ?? ""} AI creator`,
    secondary_keywords: tags ?? [],
    search_intent: "informational",
    title_zh: `${name?.zh ?? name?.en ?? ""} - AI 创作者介绍`,
    title_en: `${name?.en ?? ""} - AI Creator Directory`,
    meta_description_zh: "",
    meta_description_en: ""
  };
}

function defaultGeo(description) {
  return {
    answer_summary_zh: description?.zh ?? "",
    answer_summary_en: description?.en ?? "",
    facts: [],
    faq: []
  };
}

for (const filePath of listMarkdown(siteAccountsDir)) {
  const { data } = readMarkdown(filePath);
  const slug = data.slug || slugify(data.name?.en || path.basename(filePath, ".md"));
  writeMarkdown(
    path.join(vaultAccountsDir, `${slug}.md`),
    {
      type: "account",
      status: "approved",
      publish: true,
      slug,
      profileUrl: data.profileUrl,
      avatar: data.avatar ?? "",
      platform: data.platform,
      platformId: data.platformId ?? "",
      verified: Boolean(data.verified),
      categories: data.categories ?? [],
      tags: data.tags ?? [],
      contentStyle: data.contentStyle ?? [],
      monetization: data.monetization ?? "unknown",
      featured: Boolean(data.featured),
      followerCount: Number(data.followerCount ?? 0),
      avgEngagement: Number(data.avgEngagement ?? 0),
      contentFrequency: data.contentFrequency ?? "irregular",
      growthRate: Number(data.growthRate ?? 0),
      publishedAt: dateOnly(data.publishedAt),
      updatedAt: dateOnly(data.updatedAt),
      name: data.name,
      tagline: data.tagline,
      description: data.description,
      seo: data.seo ?? defaultSeo(data.name, data.tags),
      geo: data.geo ?? defaultGeo(data.description)
    },
    "## 一句话定位\n\n## 核心内容\n\n## 适合人群\n\n## 使用场景\n\n## SEO/GEO 备注\n"
  );
  accountCount += 1;
}

for (const filePath of listMarkdown(siteCategoriesDir)) {
  const { data } = readMarkdown(filePath);
  const slug = data.slug || slugify(data.name?.en || path.basename(filePath, ".md"));
  writeMarkdown(
    path.join(vaultCategoriesDir, `${slug}.md`),
    {
      type: "category",
      status: "active",
      publish: true,
      slug,
      icon: data.icon ?? "",
      name: data.name,
      description: data.description,
      seo: data.seo ?? {
        primary_keyword: `${data.name?.en ?? slug} AI creators`,
        secondary_keywords: []
      },
      geo: data.geo ?? {
        answer_summary_zh: data.description?.zh ?? "",
        answer_summary_en: data.description?.en ?? ""
      }
    },
    "## 分类定义\n\n## 收录标准\n\n## SEO/GEO 备注\n"
  );
  categoryCount += 1;
}

for (const filePath of listMarkdown(sitePlatformsDir)) {
  const { data } = readMarkdown(filePath);
  const slug = data.slug || slugify(data.name?.en || path.basename(filePath, ".md"));
  writeMarkdown(
    path.join(vaultPlatformsDir, `${slug}.md`),
    {
      type: "platform",
      status: "active",
      publish: true,
      slug,
      icon: data.icon ?? "",
      name: data.name,
      description: data.description,
      baseUrl: data.baseUrl ?? "",
      type: data.type ?? "social"
    },
    "## 平台定义\n\n## 收录标准\n\n## SEO/GEO 备注\n"
  );
  platformCount += 1;
}

console.log(`Seeded ${accountCount} accounts, ${categoryCount} categories and ${platformCount} platforms into ${vaultRoot}`);
