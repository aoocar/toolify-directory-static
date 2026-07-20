export const languages = ["en", "zh"] as const;

export type Lang = (typeof languages)[number];

export const defaultLang: Lang = "zh";

export function isLang(value: string | undefined): value is Lang {
  return languages.includes(value as Lang);
}

export function localizedPath(lang: Lang, path = "") {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `/${lang}${cleanPath === "/" ? "" : cleanPath}`;
}

export const dictionary = {
  en: {
    /* brand */
    brand: "Dawn Island",
    slogan: "AI Avatars — Perhaps the Last Opportunity for Ordinary People",
    sloganShort: "AI Avatars for Everyone",

    /* nav */
    navAccounts: "Creators",
    navPlatforms: "Platforms",
    navCategories: "Niches",
    navRankings: "Rankings",
    navNew: "New",
    navServices: "Services",
    navSubmit: "Recommend",
    navTransfer: "Transfer Station",
    navDirectory: "Nav Station",

    /* hero */
    heroTitle: "Discover Top Creators, Inspire Your AI Content",
    heroSubtitle:
      "A curated directory of outstanding social-media creators. Find inspiration, learn strategies, and launch your own AI-powered content brand.",
    searchPlaceholder: "Search creators, niches, or platforms…",
    search: "Search",
    dailyUpdated: "Updated regularly",

    /* stats */
    statAccounts: "Creators",
    statPlatforms: "Platforms",
    statNiches: "Niches",

    /* quick links */
    quickHot: "🔥 Trending",
    quickGrowing: "📈 Fastest growing",
    quickNew: "🆕 New additions",
    quickDouyin: "Douyin",
    quickXiaohongshu: "Xiaohongshu",
    quickBilibili: "Bilibili",
    quickYoutube: "YouTube",
    quickAiCreators: "AI Creators",

    /* sections */
    today: "Today's Picks",
    featured: "Featured Creators",
    categories: "Content Niches",
    rankings: "Rankings",
    platformNav: "Browse by Platform",
    freeCategories: "All niche categories",
    guides: "Creator Guides",
    news: "Industry Trends",

    /* account card */
    followers: "followers",
    engagement: "engagement",
    view: "View",
    more: "View more",

    /* rankings */
    rankByFollowers: "By Followers",
    rankByEngagement: "By Engagement",
    rankByGrowth: "By Growth",

    /* services */
    servicesTitle: "AI Content Management Services",
    servicesSubtitle:
      "We analyze top creators with AI, distill their strategies, and build custom content plans so you can launch your brand without starting from scratch.",
    serviceItem1Title: "Account Strategy",
    serviceItem1Desc:
      "We study trending accounts in your niche, use AI to distill winning content patterns, and design a roadmap for your brand.",
    serviceItem2Title: "AI Content Production",
    serviceItem2Desc:
      "Leveraging the latest AI models, we produce scripts, images, short videos, and copywriting tailored to your brand voice.",
    serviceItem3Title: "Ongoing Operations",
    serviceItem3Desc:
      "From publishing schedules to community engagement, we handle day-to-day management so you can focus on your business.",
    servicesCTA: "Get a Free Consultation",

    /* submit */
    submitTitle: "Recommend a Creator",
    submitBody:
      "Know an outstanding creator we should feature? Submit their profile and we'll review it for inclusion.",

    /* contact */
    contactTitle: "Contact Us",
    contactBody: "Reach out for business inquiries, partnerships, or creator recommendations.",

    /* business CTA */
    ctaTitle: "Want to build an account like these?",
    ctaBody:
      "We use AI to analyze top creators and craft a custom content strategy for you.",
    ctaButton: "Learn More",

    /* footer */
    footerTagline: "Discover creators. Get inspired. Launch with AI.",
    footerAbout: "About",
    footerServices: "Services",
    footerContact: "Contact",
    footerPrivacy: "Privacy",

    /* misc */
    allAccounts: "All creators",
    tags: "Tags",
    visitProfile: "Visit profile",
    contentStyle: "Content style",
    monetization: "Monetization",
    frequency: "Post frequency",
    growth: "Monthly growth",
    verified: "Verified",
    empty: "No creators found yet.",

    /* platform types */
    "type.short-video": "Short Video",
    "type.video": "Video",
    "type.image-text": "Image & Text",
    "type.social": "Social",
    "type.knowledge": "Knowledge"
  },
  zh: {
    /* brand */
    brand: "黎明岛",
    slogan: "AI 分身，可能是普通人最后的机会",
    sloganShort: "AI 分身，人人可及",

    /* nav */
    navAccounts: "达人库",
    navPlatforms: "平台",
    navCategories: "领域",
    navRankings: "排行榜",
    navNew: "最新收录",
    navServices: "服务",
    navSubmit: "推荐账号",
    navTransfer: "中转站",
    navDirectory: "导航站",

    /* hero */
    heroTitle: "发现优质创作者，获取 AI 内容灵感",
    heroSubtitle:
      "精选互联网优质自媒体账号目录。发现灵感、学习策略，用 AI 启动你的内容品牌。",
    searchPlaceholder: "搜索创作者、领域或平台…",
    search: "搜索",
    dailyUpdated: "持续更新",

    /* stats */
    statAccounts: "收录账号",
    statPlatforms: "覆盖平台",
    statNiches: "内容领域",

    /* quick links */
    quickHot: "🔥 热门账号",
    quickGrowing: "📈 涨粉最快",
    quickNew: "🆕 最新收录",
    quickDouyin: "抖音",
    quickXiaohongshu: "小红书",
    quickBilibili: "B站",
    quickYoutube: "YouTube",
    quickAiCreators: "AI 创作者",

    /* sections */
    today: "今日推荐",
    featured: "精选达人",
    categories: "内容领域",
    rankings: "排行榜",
    platformNav: "按平台浏览",
    freeCategories: "全部领域分类",
    guides: "创作者指南",
    news: "行业动态",

    /* account card */
    followers: "粉丝",
    engagement: "互动",
    view: "查看",
    more: "查看更多",

    /* rankings */
    rankByFollowers: "按粉丝数",
    rankByEngagement: "按互动量",
    rankByGrowth: "按增长率",

    /* services */
    servicesTitle: "AI 内容代运营服务",
    servicesSubtitle:
      "我们用 AI 分析优质账号的内容策略，为你蒸馏定制专属的内容方案和运营计划，助你从零启动自媒体品牌。",
    serviceItem1Title: "账号策略定制",
    serviceItem1Desc:
      "深度研究你所在领域的头部账号，利用 AI 提炼爆款内容规律，为你制定清晰的品牌路线图。",
    serviceItem2Title: "AI 内容生产",
    serviceItem2Desc:
      "调用最新 AI 模型，为你生产脚本、图文、短视频、文案等内容，匹配你的品牌调性。",
    serviceItem3Title: "持续代运营",
    serviceItem3Desc:
      "从发布排期到社群互动，我们负责日常运营管理，你只需要专注自己的业务。",
    servicesCTA: "免费咨询",

    /* submit */
    submitTitle: "推荐优质账号",
    submitBody: "发现了值得收录的优质创作者？提交账号信息，我们审核后会尽快收录。",

    /* contact */
    contactTitle: "联系我们",
    contactBody: "商务合作、达人推荐或其他咨询，欢迎联系。",

    /* business CTA */
    ctaTitle: "想打造像他们一样的自媒体账号？",
    ctaBody: "我们用 AI 分析优质账号的内容策略，为你定制专属的内容方案和运营计划。",
    ctaButton: "了解详情",

    /* footer */
    footerTagline: "发现创作者，获取灵感，用 AI 启动。",
    footerAbout: "关于",
    footerServices: "服务",
    footerContact: "联系",
    footerPrivacy: "隐私政策",

    /* misc */
    allAccounts: "全部达人",
    tags: "标签",
    visitProfile: "访问主页",
    contentStyle: "内容风格",
    monetization: "变现方式",
    frequency: "更新频率",
    growth: "月增长率",
    verified: "已认证",
    empty: "暂时没有收录。",

    /* platform types */
    "type.short-video": "短视频",
    "type.video": "视频",
    "type.image-text": "图文",
    "type.social": "社交",
    "type.knowledge": "知识"
  }
} satisfies Record<Lang, Record<string, string>>;

export function t(lang: Lang, key: keyof (typeof dictionary)["en"]) {
  return dictionary[lang][key] ?? dictionary[defaultLang][key];
}
