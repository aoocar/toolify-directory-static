import path from "node:path";
import { dateOnly, defaultVaultPath, fail, listMarkdown, readMarkdown, slugify, writeMarkdown } from "./content-utils.mjs";

const projectRoot = process.cwd();
const vaultRoot = process.env.VAULT_PATH || defaultVaultPath;

const vaultToolsDir = path.join(vaultRoot, "Tools");
const vaultCategoriesDir = path.join(vaultRoot, "Categories");
const siteToolsDir = path.join(projectRoot, "src", "content", "tools");
const siteCategoriesDir = path.join(projectRoot, "src", "content", "categories");

const validPricing = new Set(["free", "freemium", "paid", "contact"]);
let wroteTools = 0;
let wroteCategories = 0;
let errors = 0;

for (const filePath of listMarkdown(vaultToolsDir)) {
  const { data } = readMarkdown(filePath);
  if (data.type !== "tool" || data.publish !== true || data.status !== "approved") continue;

  const slug = data.slug || slugify(data.name?.en || path.basename(filePath, ".md"));
  const missing = [
    ["website", data.website],
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

  writeMarkdown(path.join(siteToolsDir, `${slug}.md`), {
    slug,
    website: data.website,
    logo: data.logo || initials(data.name?.en || slug),
    categories: arrayOrEmpty(data.categories),
    tags: arrayOrEmpty(data.tags),
    pricing: validPricing.has(data.pricing) ? data.pricing : "contact",
    featured: Boolean(data.featured),
    monthlyVisits: Number(data.monthlyVisits ?? 0),
    savedCount: Number(data.savedCount ?? 0),
    publishedAt: dateOnly(data.publishedAt),
    updatedAt: dateOnly(data.updatedAt),
    name: data.name,
    tagline: data.tagline,
    description: data.description,
    seo: data.seo,
    geo: data.geo
  });
  wroteTools += 1;
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

console.log(`Synced ${wroteTools} tools and ${wroteCategories} categories from ${vaultRoot}`);
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
