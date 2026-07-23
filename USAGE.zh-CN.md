# 黎明岛 — 使用与内容维护指南

本文档介绍如何在日常运营中维护「黎明岛」自媒体账号目录平台的内容。

> 说明：仓库目录名 `toolify-directory-static` 为历史遗留，产品名为 **黎明岛 / Dawn Island**。

---

## 1. 环境准备与安装

- Node.js 18+（托管的 22/24 运行时亦可）
- npm

```bash
cd D:\project\codex\toolify
npm install
```

---

## 2. 本地开发与构建

```bash
npm run dev       # 热更新开发服务器 → http://localhost:4321/zh
npm run build     # 生产静态构建 → dist/
npm run preview   # 预览生产构建产物
```

页面以 `/zh`（默认语言）和 `/en` 提供，根路径 `/` 会重定向到 `/zh`。

---

## 3. 内容模型

所有内容都是 `src/content/` 下的 Markdown 文件，并在构建期由 Zod（`src/content.config.ts`）校验：

| 集合 | 路径 | 用途 |
|------|------|------|
| `accounts` | `src/content/accounts` | 核心实体——每个创作者/账号一个文件 |
| `categories` | `src/content/categories` | 内容领域（如 AI 绘画、财经） |
| `platforms` | `src/content/platforms` | 来源平台（抖音、小红书、YouTube…） |
| `news` | `src/content/news` | 首页「行业动态」区块条目 |
| `guides` | `src/content/guides` | 首页「创作者指南」区块条目 |

数据层（`src/lib/directory.ts`）通过 `getCollection()` 读取这些集合，并暴露给各页面调用的异步函数。

---

## 4. 如何添加一个新账号 (Account)

在 `src/content/accounts/` 目录下新建 `<slug>.md`：

```yaml
---
slug: xiaohongshu-specimen            # 账号唯一ID，会作为路由URL的一部分
profileUrl: https://www.xiaohongshu.com/user/profile/123456
avatar: "🎨"                          # 头像（可使用单个 Emoji，也可填图片 URL）
platform: xiaohongshu                 # 平台ID（必须是 content/platforms/ 下已有的 slug）
platformId: "red-creator-abc"         # 达人平台内显示的 ID/Handle
verified: true                        # 是否为平台官方认证账号 (true/false)
categories:                           # 所属内容领域，可填多个（必须是 content/categories/ 下已有的 slug）
  - lifestyle
  - ai-content
tags:                                # 标签（用于搜索与过滤）
  - AI壁纸
  - 美学设计
contentStyle:                        # 内容风格定位
  - 极简视觉
monetization: e-commerce             # 变现方式（可选: brand-deals, ads, courses, e-commerce, membership, tips, mixed, unknown）
featured: true                       # 是否推荐到首页精选 (true/false)
draft: false                         # true = 永不发布（模板/待审核）
followerCount: 150000                # 粉丝数（纯数字，前台自动转化为 15万/150K）
avgEngagement: 8500                  # 平均互动量
contentFrequency: daily              # 创作频次（可选: daily, weekly, biweekly, monthly, irregular）
growthRate: 12.5                     # 月粉增长率 %（数字）
publishedAt: "2026-06-20"            # 收录日期
updatedAt: "2026-06-20"              # 数据最后更新日期
name:
  zh: 灵感生成器
  en: InspirationGen
tagline:
  zh: 每天分享一套超高质量的AI壁纸与提示词
  en: Daily ultra-high-quality AI wallpapers and prompts
description:
  zh: 详细的中文账号描述……
  en: Detailed English description……
seo:
  primary_keyword: AI壁纸
  meta_description_zh: "……"
  meta_description_en: "……"
geo:
  answer_summary_zh: "……"
  answer_summary_en: "……"
  facts:
    - question: 该账号主要做什么？
      answer: ……
  faq:
    - question: 适合谁参考？
      answer: ……
---
```

补充说明：
- `slug` 可省略，省略时以文件名为准。注意 `slug` 是 Astro 内容集合的保留字段，加载器内部用 `data.slug ?? entry.slug` 兜底。
- `draft: true` 的账号不会进入构建产物，也**不会**出现在 sitemap 中。
- 数字均填纯整数，前台通过 `formatNumber()` 本地化显示（15万 / 150K）。

---

## 5. 如何添加一个新分类领域 (Category/Niche)

在 `src/content/categories/` 目录下新建 `<slug>.md`：

```yaml
---
slug: finance
icon: "📈"
name:
  zh: 财经商业
  en: Finance & Business
description:
  zh: 财经趋势、商业案例拆解以及个人搞钱理财方案分享。
  en: Insights on economy, business case studies and personal finance.
seo:
  meta_description_zh: "……"
  meta_description_en: "……"
geo:
  answer_summary_zh: "……"
  answer_summary_en: "……"
---
```

---

## 6. 如何添加一个自媒体平台 (Platform)

在 `src/content/platforms/` 目录下新建 `<slug>.md`：

```yaml
---
slug: tiktok
icon: "🎵"
name:
  zh: TikTok
  en: TikTok
description:
  zh: 字节跳动旗下的全球短视频社交平台。
  en: Global short-video platform by ByteDance.
baseUrl: https://www.tiktok.com
type: short-video                  # 平台类型（可选: short-video, video, image-text, social, knowledge）
---
```

---

## 7. 首页动态与指南条目 (News / Guides)

这两个集合驱动首页「行业动态」「创作者指南」区块，是**数据驱动**的，不再写死标题。

`src/content/news/<slug>.md`：

```yaml
---
slug: ai-content-largest
title:
  zh: AI 内容进入爆发期
  en: AI Content Enters Hypergrowth
url: "/categories/ai-content"        # 必填，点击后跳转的真实页面（站内路由）
summary:
  zh: 简短摘要……
  en: Short summary……
order: 1                             # 排序，越小越靠前
date: "2026-07-20"                   # 可选发布日期
---
```

`src/content/guides/<slug>.md` 字段相同，但**没有** `date`。

> 约定：`url` 必须指向站内真实存在的页面（不要指向营销页或虚构内容），以保证 GEO/SEO 可信度。news/guides 条目由 AI 批量生成草稿、人工在 Obsidian 中审核与维护真实文案。

---

## 8. 多语言维护

站点内置双语 `en` / `zh`，所有本地化字段都是 `{ en, zh }` 形式。新增语言步骤：

1. 编辑 `src/lib/i18n.ts`：把语言代码加入 `languages`，并在 `dictionary` 中为该语言补全全部翻译键。
2. 在所有内容的 `{ en, zh }` 字段中补上该语言键。

默认语言为 `zh`，根路径 `/` 会重定向到 `/zh`。

---

## 9. SEO 与 GEO 字段

每个 `account` 和 `category` 都支持可选的 `seo` 与 `geo` 字段：

- `seo`：面向传统搜索引擎，包括关键词、标题、`meta_description`。`meta_description_*` 会用作页面 `<meta name="description">`。
- `geo`：面向 AI 搜索与答案引擎，包含 `answer_summary`、`facts`、`faq`，在详情页渲染。

`BaseLayout.astro` 会自动注入 canonical、Open Graph 与 Twitter 标签。

---

## 10. Obsidian 运营工作流

站点内容由 Obsidian 库维护，库路径：

```text
E:\Obsidian\www.limingdao.com
```

- **初始化导入（一次性）：** `npm run vault:seed` —— 把 `src/content/{accounts,categories,platforms,news,guides}` 导入 Obsidian 库，生成 `Accounts/`、`Categories/`、`Platforms/`、`News/`、`Guides/` 知识卡。
- **发布同步：** `npm run vault:sync` —— 仅发布满足以下条件的卡片：

  | 类型 | 同步条件 |
  |------|----------|
  | account | `type: account`、`status: approved`、`publish: true` |
  | category | `type: category`、`publish: true` |
  | platform | `type: platform`、`publish: true` |
  | news | `type: news`、`publish: true` |
  | guide | `type: guide`、`publish: true` |

同步后执行 `npm run build`。Zod 校验会在错误数据上线前拦截。

---

## 11. 推荐账号页

`/zh/submit`（及 `/en/submit`）会调用访客本机邮件客户端，发送至 `aoobee@sina.com`。后续如需服务端接收，可改为混合渲染（hybrid）+ API 路由。

---

## 12. 部署（GitHub + Vercel）

- 推送到 GitHub 的 `main` 分支 → Vercel 自动部署。
- 构建命令：`npm run build`；输出目录：`dist`。
- `astro.config.mjs` 已设置 `site: https://www.limingdao.com`，canonical 与 sitemap 均指向生产域名。

---

## 13. 流量监控

`BaseLayout.astro` 注入（均使用 `is:inline`）：
- Google Analytics 4 —— `G-WJ8ZP9FSE9`
- Microsoft Clarity —— `kn4x488ytp`

两者在所有页面全局加载。

---

## 14. Sitemap 与 robots

- `@astrojs/sitemap` 自动生成 `sitemap-index.xml`（草稿账号因不构建为路由而自动排除）。`public/robots.txt` 指向该 sitemap。
- 验证：`https://www.limingdao.com/sitemap-index.xml`。

---

## 15. 首页区块构成

`/zh` 与 `/en` 首页依次渲染：搜索框 + 数据概览、快捷入口（热门/涨粉最快/最新/各平台入口/AI 创作者）、今日推荐、精选达人、内容领域、排行榜（按粉丝/互动/增长）、按平台浏览、全部领域、创作者指南、行业动态、服务 CTA、页脚。

---

## 16. 常用命令

```bash
npm run dev          # 本地开发（热更新）
npm run build        # 生产静态构建 → dist/
npm run preview      # 预览构建产物
npm run vault:seed   # 将 src/content 导入 Obsidian 库（一次性）
npm run vault:sync   # 将已审核的知识卡发布回 src/content
```
