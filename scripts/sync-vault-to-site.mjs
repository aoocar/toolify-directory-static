import path from "node:path";
import { dateOnly, defaultVaultPath, fail, listMarkdown, readMarkdown, slugify, writeMarkdown } from "./content-utils.mjs";

const projectRoot = process.cwd();
const vaultRoot = process.env.VAULT_PATH || defaultVaultPath;
const today = dateOnly();

const vaultAccountsDir = path.join(vaultRoot, "Accounts");
const vaultCategoriesDir = path.join(vaultRoot, "Categories");
const vaultPlatformsDir = path.join(vaultRoot, "Platforms");
const vaultNewsDir = path.join(vaultRoot, "News");
const vaultGuidesDir = path.join(vaultRoot, "Guides");
const siteAccountsDir = path.join(projectRoot, "src", "content", "accounts");
const siteCategoriesDir = path.join(projectRoot, "src", "content", "categories");
const sitePlatformsDir = path.join(projectRoot, "src", "content", "platforms");
const siteNewsDir = path.join(projectRoot, "src", "content", "news");
const siteGuidesDir = path.join(projectRoot, "src", "content", "guides");

const validMonetization = new Set([
  "brand-deals",
  "ads",
  "courses",
  "e-commerce",
  "membership",
  "tips",
  "mixed",
  "unknown"
]);
const validFrequency = new Set(["daily", "weekly", "biweekly", "monthly", "irregular"]);

let wroteAccounts = 0;
let wroteCategories = 0;
let wrotePlatforms = 0;
let wroteNews = 0;
let wroteGuides = 0;
let errors = 0;

for (const filePath of listMarkdown(vaultAccountsDir)) {
  const { data } = readMarkdown(filePath);
  if (data.type !== "account" || data.publish !== true || data.status !== "approved") continue;

  const slug = data.slug || slugify(data.name?.en || path.basename(filePath, ".md"));
  const missing = [
    ["profileUrl", data.profileUrl],
    ["name.en", data.name?.en],
    ["name.zh", data.name?.zh],
    ["tagline.en", data.tagline?.en],
    ["tagline.zh", data.tagline?.zh],
    ["description.en", data.description?.en],
    ["description.zh", data.description?.zh]
  ]
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    console.error(`Skip ${filePath}: missing ${missing.join(", ")}`);
    errors += 1;
    continue;
  }

  writeMarkdown(path.join(siteAccountsDir, `${slug}.md`), {
    slug,
    profileUrl: data.profileUrl,
    avatar: data.avatar || initials(data.name?.en || slug),
    platform: data.platform,
    platformId: data.platformId || "",
    verified: Boolean(data.verified),
    categories: arrayOrEmpty(data.categories),
    tags: arrayOrEmpty(data.tags),
    contentStyle: arrayOrEmpty(data.contentStyle),
    monetization: validMonetization.has(data.monetization) ? data.monetization : "unknown",
    featured: Boolean(data.featured),
    followerCount: Number(data.followerCount ?? 0),
    avgEngagement: Number(data.avgEngagement ?? 0),
    contentFrequency: validFrequency.has(data.contentFrequency) ? data.contentFrequency : "irregular",
    growthRate: Number(data.growthRate ?? 0),
    publishedAt: dateOnly(data.publishedAt),
    updatedAt: dateOnly(data.updatedAt),
    name: data.name,
    tagline: data.tagline,
    description: data.description,
    seo: data.seo,
    geo: data.geo
  });
  wroteAccounts += 1;
}

for (const filePath of listMarkdown(vaultCategoriesDir)) {
  const { data } = readMarkdown(filePath);
  if (data.type !== "category" || data.publish !== true) continue;

  const slug = data.slug || slugify(data.name?.en || path.basename(filePath, ".md"));
  if (!data.name?.en || !data.name?.zh || !data.description?.en || !data.description?.zh) {
    console.error(`Skip ${filePath}: category missing localized fields`);
    errors += 1;
    continue;
  }

  writeMarkdown(path.join(siteCategoriesDir, `${slug}.md`), {
    slug,
    icon: data.icon || "Tag",
    name: data.name,
    description: data.description,
    seo: data.seo,
    geo: data.geo
  });
  wroteCategories += 1;
}

for (const filePath of listMarkdown(vaultPlatformsDir)) {
  const { data } = readMarkdown(filePath);
  if (data.type !== "platform" || data.publish !== true) continue;

  const slug = data.slug || slugify(data.name?.en || path.basename(filePath, ".md"));
  if (!data.name?.en || !data.name?.zh || !data.description?.en || !data.description?.zh) {
    console.error(`Skip ${filePath}: platform missing localized fields`);
    errors += 1;
    continue;
  }

  writeMarkdown(path.join(sitePlatformsDir, `${slug}.md`), {
    slug,
    icon: data.icon || "Link",
    name: data.name,
    description: data.description,
    baseUrl: data.baseUrl || "",
    type: data.type || "social"
  });
  wrotePlatforms += 1;
}

for (const filePath of listMarkdown(vaultNewsDir)) {
  const { data } = readMarkdown(filePath);
  if (data.type !== "news" || data.publish !== true) continue;

  const slug = data.slug || slugify(data.title?.en || path.basename(filePath, ".md"));
  const missing = [
    ["title.en", data.title?.en],
    ["title.zh", data.title?.zh],
    ["url", data.url]
  ]
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    console.error(`Skip ${filePath}: missing ${missing.join(", ")}`);
    errors += 1;
    continue;
  }

  writeMarkdown(path.join(siteNewsDir, `${slug}.md`), {
    slug,
    title: data.title,
    url: data.url,
    summary: data.summary,
    order: Number(data.order ?? 0),
    date: data.date ? dateOnly(data.date) : today
  });
  wroteNews += 1;
}

for (const filePath of listMarkdown(vaultGuidesDir)) {
  const { data } = readMarkdown(filePath);
  if (data.type !== "guide" || data.publish !== true) continue;

  const slug = data.slug || slugify(data.title?.en || path.basename(filePath, ".md"));
  const missing = [
    ["title.en", data.title?.en],
    ["title.zh", data.title?.zh],
    ["url", data.url]
  ]
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    console.error(`Skip ${filePath}: missing ${missing.join(", ")}`);
    errors += 1;
    continue;
  }

  writeMarkdown(path.join(siteGuidesDir, `${slug}.md`), {
    slug,
    title: data.title,
    url: data.url,
    summary: data.summary,
    order: Number(data.order ?? 0)
  });
  wroteGuides += 1;
}

console.log(
  `Synced ${wroteAccounts} accounts, ${wroteCategories} categories, ${wrotePlatforms} platforms, ${wroteNews} news and ${wroteGuides} guides from ${vaultRoot}`
);
if (errors > 0) fail(`Completed with ${errors} validation issue(s).`);

function arrayOrEmpty(value) {
  return Array.isArray(value) ? value : [];
}

function initials(value) {
  return String(value)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
