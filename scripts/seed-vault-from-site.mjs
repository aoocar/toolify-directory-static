import path from "node:path";
import { dateOnly, defaultVaultPath, listMarkdown, readMarkdown, slugify, writeMarkdown } from "./content-utils.mjs";

const projectRoot = process.cwd();
const vaultRoot = process.env.VAULT_PATH || defaultVaultPath;
const today = dateOnly();

const siteToolsDir = path.join(projectRoot, "src", "content", "tools");
const siteCategoriesDir = path.join(projectRoot, "src", "content", "categories");
const vaultToolsDir = path.join(vaultRoot, "Tools");
const vaultCategoriesDir = path.join(vaultRoot, "Categories");

let toolCount = 0;
let categoryCount = 0;

for (const filePath of listMarkdown(siteToolsDir)) {
  const { data } = readMarkdown(filePath);
  const slug = data.slug || slugify(data.name?.en || path.basename(filePath, ".md"));
  writeMarkdown(
    path.join(vaultToolsDir, `${slug}.md`),
    {
      type: "tool",
      status: "approved",
      publish: true,
      slug,
      name: data.name,
      website: data.website,
      source_url: data.website,
      captured_at: today,
      last_checked_at: today,
      logo: data.logo,
      categories: data.categories ?? [],
      tags: data.tags ?? [],
      pricing: data.pricing ?? "unknown",
      featured: Boolean(data.featured),
      monthlyVisits: Number(data.monthlyVisits ?? 0),
      savedCount: Number(data.savedCount ?? 0),
      publishedAt: dateOnly(data.publishedAt),
      updatedAt: dateOnly(data.updatedAt),
      language_support: ["en", "zh"],
      target_users: [],
      quality_score: 3,
      seo_score: 2,
      geo_score: 2,
      duplicate_of: "",
      tagline: data.tagline,
      description: data.description,
      seo: data.seo ?? {
        primary_keyword: `${data.name?.en ?? slug} AI tool`,
        secondary_keywords: data.tags ?? [],
        search_intent: "informational",
        title_zh: `${data.name?.zh ?? data.name?.en ?? slug} - AI 工具介绍`,
        title_en: `${data.name?.en ?? slug} - AI Tool Directory`,
        meta_description_zh: data.description?.zh ?? "",
        meta_description_en: data.description?.en ?? ""
      },
      geo: data.geo ?? {
        answer_summary_zh: data.description?.zh ?? "",
        answer_summary_en: data.description?.en ?? "",
        facts: [{ pricing: data.pricing ?? "unknown" }],
        faq: []
      }
    },
    "## 一句话定位\n\n## 核心功能\n\n## 适合人群\n\n## 使用场景\n\n## SEO/GEO 备注\n"
  );
  toolCount += 1;
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
        primary_keyword: `${data.name?.en ?? slug} AI tools`,
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

console.log(`Seeded ${toolCount} tools and ${categoryCount} categories into ${vaultRoot}`);
