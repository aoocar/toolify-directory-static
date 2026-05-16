export const languages = ["en", "zh"] as const;

export type Lang = (typeof languages)[number];

export const defaultLang: Lang = "en";

export function isLang(value: string | undefined): value is Lang {
  return languages.includes(value as Lang);
}

export function localizedPath(lang: Lang, path = "") {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `/${lang}${cleanPath === "/" ? "" : cleanPath}`;
}

export const dictionary = {
  en: {
    brand: "AITools Index",
    navNew: "New AIs",
    navRankings: "Rankings",
    navSubmit: "Submit",
    navCategories: "Categories",
    heroTitle: "Discover and compare the newest AI tools",
    heroSubtitle:
      "A static-first AI tools directory with multilingual routes, SEO pages, rankings, categories, and a replaceable data layer.",
    searchPlaceholder: "Search tools, categories, or tags",
    featured: "Featured tools",
    latest: "Latest updates",
    categories: "Popular categories",
    rankings: "Rankings",
    allTools: "All tools",
    search: "Search",
    view: "View",
    visits: "visits",
    saves: "saves",
    seedTools: "Seed tools",
    languagesReady: "Languages ready",
    visitWebsite: "Visit website",
    pricing: "Pricing",
    tags: "Tags",
    submitTitle: "Submit an AI tool",
    submitBody:
      "This static placeholder can later connect to a form backend, Airtable, Supabase, or a CMS approval queue.",
    empty: "No tools found yet."
  },
  zh: {
    brand: "AI工具索引",
    navNew: "最新AI",
    navRankings: "排行榜",
    navSubmit: "提交工具",
    navCategories: "分类",
    heroTitle: "发现并比较最新 AI 工具",
    heroSubtitle:
      "一个静态优先的 AI 工具目录架构，预留多语言、SEO 页面、排行榜、分类和可替换数据层。",
    searchPlaceholder: "搜索工具、分类或标签",
    featured: "精选工具",
    latest: "最近更新",
    categories: "热门分类",
    rankings: "排行榜",
    allTools: "全部工具",
    search: "搜索",
    view: "查看",
    visits: "访问",
    saves: "收藏",
    seedTools: "示例工具",
    languagesReady: "已支持语言",
    visitWebsite: "访问官网",
    pricing: "价格",
    tags: "标签",
    submitTitle: "提交 AI 工具",
    submitBody:
      "这里先作为静态占位页，后续可以接表单后端、Airtable、Supabase 或 CMS 审核队列。",
    empty: "暂时没有工具。"
  }
} satisfies Record<Lang, Record<string, string>>;

export function t(lang: Lang, key: keyof (typeof dictionary)["en"]) {
  return dictionary[lang][key] ?? dictionary[defaultLang][key];
}
