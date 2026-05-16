import type { Lang } from "@/lib/i18n";
import type { Category, Tool } from "@/lib/types";

export type ToolWithCategories = Tool & {
  categoryItems: Category[];
};

type MarkdownData<T> = {
  frontmatter: T;
};

const categoryModules = import.meta.glob<MarkdownData<Category>>("../content/categories/*.md", {
  eager: true
});

const toolModules = import.meta.glob<MarkdownData<Tool>>("../content/tools/*.md", {
  eager: true
});

const categories = Object.values(categoryModules).map((module) => module.frontmatter);
const tools = Object.values(toolModules).map((module) => module.frontmatter);

function withCategories(tool: Tool): ToolWithCategories {
  return {
    ...tool,
    categoryItems: tool.categories
      .map((slug) => categories.find((category) => category.slug === slug))
      .filter(Boolean) as Category[]
  };
}

export async function getTools() {
  return tools.map(withCategories);
}

export async function getCategories() {
  return categories;
}

export async function getToolBySlug(slug: string) {
  const tool = tools.find((item) => item.slug === slug);
  return tool ? withCategories(tool) : undefined;
}

export async function getCategoryBySlug(slug: string) {
  return categories.find((category) => category.slug === slug);
}

export async function getToolsByCategory(categorySlug: string) {
  return tools
    .filter((tool) => tool.categories.includes(categorySlug))
    .map(withCategories);
}

export async function getFeaturedTools() {
  return tools.filter((tool) => tool.featured).map(withCategories);
}

export async function getLatestTools(limit?: number) {
  const sorted = [...tools].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  return (limit ? sorted.slice(0, limit) : sorted).map(withCategories);
}

export async function getRankedTools(limit?: number) {
  const sorted = [...tools].sort((a, b) => b.monthlyVisits - a.monthlyVisits);
  return (limit ? sorted.slice(0, limit) : sorted).map(withCategories);
}

export async function getCategoryCounts() {
  return categories.map((category) => ({
    category,
    count: tools.filter((tool) => tool.categories.includes(category.slug)).length
  }));
}

export function formatNumber(value: number, lang: Lang) {
  return new Intl.NumberFormat(lang === "zh" ? "zh-CN" : "en-US", {
    notation: value >= 10000 ? "compact" : "standard",
    maximumFractionDigits: 1
  }).format(value);
}
