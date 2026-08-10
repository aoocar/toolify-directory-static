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
    slogan: "Quality creator directory across every niche",
    sloganShort: "Creators across every niche",

    /* nav */
    navAccounts: "Creators",
    navTools: "AI Tools",
    navPlatforms: "Platforms",
    navCategories: "Niches",
    navRankings: "Rankings",
    navNew: "New",
    navGuides: "Guides",
    navServices: "Services",
    navSubmit: "Recommend",
    navTransfer: "Transfer Station",
    navDirectory: "Nav Station",

    /* hero */
    heroTitle: "Discover quality creators across every niche",
    heroSubtitle:
      "From AI and education to renovation, home appliances, office, and senior living — Dawn Island curates quality social-media creators by niche to spark your inspiration and strategy.",
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
    quickAiTools: "AI Tools",

    /* sections */
    today: "Today's Picks",
    featured: "Featured Creators",
    categories: "Content Niches",
    rankings: "Rankings",
    platformNav: "Browse by Platform",
    freeCategories: "All niche categories",
    guides: "Creator Guides",
    news: "Industry Trends",
    toc: "On this page",
    relatedGuides: "Related guides",
    backToTop: "Back to top",

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
    serviceItem4Title: "GEO (Generative Engine Optimization)",
    serviceItem4Desc:
      "Get your brand cited first when AI answers your customers — AI-visibility baseline audits across Doubao, DeepSeek, Ernie, Kimi, Qwen, and Tencent Yuanbao, semantic content structuring (short answer + key facts + FAQ), authoritative source building, and monthly AI-answer reviews.",
    servicesCTA: "Get a Free Consultation",

    /* submit */
    submitTitle: "Recommend a Creator",
    submitBody:
      "Know an outstanding creator we should feature? Submit their profile and we'll review it for inclusion.",
    submitSubj: "Creator recommendation: ",
    submitName: "Account name: ",
    submitUrl: "Account URL: ",
    submitPlat: "Platform: ",
    submitReason: "Reason: ",

    /* contact */
    contactTitle: "Contact Us",
    contactBody: "Reach out for business inquiries, partnerships, or creator recommendations.",

    /* privacy */
    privacyTitle: "Privacy Policy",
    privacyDesc: "How Dawn Island collects, uses, and protects your information — analytics, external links, and AI-assisted content.",

    /* guides */
    guidesTitle: "Creator Guides",
    guidesDesc:
      "Practical guides on picking creators to follow and avoiding costly mistakes — across renovation, home appliances, office, education, senior living, and AI.",
    guidesIntro:
      "Every account named in these guides is already indexed on Dawn Island, and each name links back to its profile page. We do not quote follower counts we cannot verify.",
    guidesAll: "All guides",
    guidesEmpty: "No guides published yet.",
    guideUpdated: "Updated",
    guidePublished: "Published",
    guideNiche: "Niche",
    guideMentioned: "Creators mentioned in this guide",
    guideRelated: "More guides in this niche",
    guideBack: "Back to all guides",
    guideBrowseNiche: "Browse the full niche",
    guidesForAccount: "Guides featuring this creator",
    guidesInCategory: "Guides in this niche",

    /* business CTA */
    ctaTitle: "Want to build an account like these?",
    ctaBody:
      "We use AI to analyze top creators and craft a custom content strategy for you.",
    ctaButton: "Learn More",

    /* footer */
    footerTagline: "Discover quality creators across every niche — find the accounts worth following.",
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

    /* exit / redirect interstitial */
    exitTitle: "Leaving Dawn Island",
    exitLeaving: "You are about to leave Dawn Island and open an external website:",
    exitWarning: "This website is not operated by Dawn Island. Please protect your personal information.",
    exitCountdownPrefix: "Auto-redirect in",
    exitCountdownSuffix: "seconds",
    exitGo: "Continue",
    exitCancel: "Cancel and go back",
    exitInvalid: "Invalid or unsafe link — cannot redirect.",
    exitBackHome: "Back to home",

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
    slogan: "全领域优质创作者导航",
    sloganShort: "全领域创作者导航",

    /* nav */
    navAccounts: "达人库",
    navTools: "AI工具",
    navPlatforms: "平台",
    navCategories: "领域",
    navRankings: "排行榜",
    navNew: "最新收录",
    navGuides: "指南",
    navServices: "服务",
    navSubmit: "推荐账号",
    navTransfer: "中转站",
    navDirectory: "导航站",

    /* hero */
    heroTitle: "发现全领域优质创作者，获取内容灵感",
    heroSubtitle:
      "从 AI、教育到装修、家电、办公与银发生活，黎明岛按领域精选互联网优质自媒体账号，帮你发现灵感、学习策略。",
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
    quickAiTools: "AI 工具",

    /* sections */
    today: "今日推荐",
    featured: "精选达人",
    categories: "内容领域",
    rankings: "排行榜",
    platformNav: "按平台浏览",
    freeCategories: "全部领域分类",
    guides: "创作者指南",
    news: "行业动态",
    toc: "本页目录",
    relatedGuides: "相关指南",
    backToTop: "返回顶部",

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
    serviceItem4Title: "GEO 生成式引擎优化",
    serviceItem4Desc:
      "让 AI 在回答客户问题时优先引用你的品牌：豆包、DeepSeek、文心一言、Kimi、通义千问、腾讯元宝 6 大模型 AI 可见性基线调研，语义结构化内容优化（一句话结论 + 关键事实 + FAQ），权威信源布局与月度 AI 回答复盘。",
    servicesCTA: "免费咨询",

    /* submit */
    submitTitle: "推荐优质账号",
    submitBody: "发现了值得收录的优质创作者？提交账号信息，我们审核后会尽快收录。",
    submitSubj: "创作者推荐：",
    submitName: "账号名称：",
    submitUrl: "账号链接：",
    submitPlat: "所在平台：",
    submitReason: "推荐理由：",

    /* contact */
    contactTitle: "联系我们",
    contactBody: "商务合作、达人推荐或其他咨询，欢迎联系。",

    /* privacy */
    privacyTitle: "隐私政策",
    privacyDesc: "黎明岛如何收集、使用与保护你的信息，包括数据分析、外部链接与 AI 辅助内容说明。",

    /* guides */
    guidesTitle: "创作者指南",
    guidesDesc:
      "覆盖装修、家电、办公、教育、银发生活与 AI 六大领域的实用指南：该关注谁，以及怎么避开常见的坑。",
    guidesIntro:
      "指南中提到的每一个账号都已收录在黎明岛，点击名字可直接查看该账号的详情页。我们不引用无法核实的粉丝数据。",
    guidesAll: "全部指南",
    guidesEmpty: "暂时还没有发布指南。",
    guideUpdated: "更新于",
    guidePublished: "发布于",
    guideNiche: "所属领域",
    guideMentioned: "本文提到的创作者",
    guideRelated: "该领域的其他指南",
    guideBack: "返回全部指南",
    guideBrowseNiche: "浏览该领域全部账号",
    guidesForAccount: "收录该创作者的指南",
    guidesInCategory: "该领域的创作者指南",

    /* business CTA */
    ctaTitle: "想打造像他们一样的自媒体账号？",
    ctaBody: "我们用 AI 分析优质账号的内容策略，为你定制专属的内容方案和运营计划。",
    ctaButton: "了解详情",

    /* footer */
    footerTagline: "发现全领域优质创作者，找到值得关注的账号。",
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

    /* exit / redirect interstitial */
    exitTitle: "即将离开黎明岛",
    exitLeaving: "你即将离开黎明岛，前往站外网站：",
    exitWarning: "该网站并非黎明岛运营，请注意保护个人信息与账号安全。",
    exitCountdownPrefix: "将在",
    exitCountdownSuffix: "秒后自动跳转",
    exitGo: "立即前往",
    exitCancel: "取消并返回",
    exitInvalid: "链接无效或不安全，无法跳转。",
    exitBackHome: "返回首页",

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
