# 黎明岛 AI 创作者目录（Dawn Island）

基于 **Astro + Markdown** 的静态「AI 自媒体创作者」导航站。收录各平台优质 AI 内容创作者（达人账号），提供双语（中文 / 英文）浏览、搜索、榜单与领域索引。数据层可替换，当前使用本地 Markdown，未来可平滑迁移到数据库 / 搜索服务而不改动路由与页面。

## 特性

- 静态优先的 Astro 站点，构建产物可直接部署到任意静态托管。
- 双语路由：中文 `/zh`、英文 `/en`。
- Markdown 管理的核心数据：**账号（accounts）**、**领域（categories）**、**平台（platforms）**。
- 密集的目录式首页仪表盘：搜索、快捷入口、今日推荐、排行榜、平台导航、领域索引、行业动态、创作者指南。
- SEO 友好的详情页、榜单页、最新收录页、推荐页。
- 内容层带 `seo`（面向搜索引擎）与 `geo`（面向 AI 答案引擎）字段，详情页已渲染 `geo` 速览 / 事实 / FAQ。
- 数据访问层集中在 `src/lib/directory.ts`，并在构建期通过 Astro Content Collections + Zod（`src/content.config.ts`）做校验，脏数据会在 `astro build` 时暴露。

## 目录结构

```
src/
  components/           AccountCard / CategoryCard / PlatformCard / BusinessCTA
  content/              accounts/ categories/ platforms/  (Markdown 内容)
  layouts/             BaseLayout.astro（导航 / 赞助条 / 页脚 / 语言切换）
  lib/
    directory.ts       数据访问层（getAccounts 等）
    i18n.ts            语言列表、词典、t() 助手
    types.ts            Account / Category / Platform 类型
  pages/[lang]/        各语言页面
  styles/global.css
scripts/               Obsidian 库 ↔ 站点 同步脚本
```

## 运行

```bash
npm install
npm run dev
```

打开：

- `http://localhost:4321/zh`
- `http://localhost:4321/en`

## 构建

```bash
npm run build
npm run preview
```

静态产物生成在 `dist`。

## 数据模型

三个核心集合（见 `src/content.config.ts`，构建期经 Zod 校验）：

- **Account（账号，核心实体）**：名称、头像、所属平台、粉丝数、互动量、月增长率、认证状态、领域、标签、内容风格、变现方式、更新频率，以及 `seo` / `geo` 字段。
- **Category（领域）**：名称、图标、描述、`seo` / `geo`。
- **Platform（平台）**：名称、图标、描述、官网、类型（短视频 / 视频 / 图文 / 社交 / 知识）。

## 关键路由

- `/zh`、`/en`：首页仪表盘
- `/zh/accounts`、`/zh/accounts/[slug]`：账号列表（支持 `?q=` 搜索）与账号详情
- `/zh/categories`、`/zh/categories/[slug]`：领域列表与领域落地页
- `/zh/platforms`、`/zh/platforms/[slug]`：平台列表与平台落地页
- `/zh/rankings`：排行榜（按粉丝 / 互动 / 增长）
- `/zh/new`：最新收录
- `/zh/submit`：推荐账号（表单经 `mailto:` 提交，可改为服务端接口）
- `/zh/services`、`/zh/contact`：服务与联系

## 数据访问层

所有页面通过 `src/lib/directory.ts` 取数，不直接读取 Markdown：

- `getAccounts()` / `getAccountBySlug(slug)`
- `getAccountsByCategory(slug)` / `getAccountsByPlatform(slug)`
- `getFeaturedAccounts()` / `getLatestAccounts(limit?)`
- `getRankedAccounts(sortBy?, limit?)`（`followers` / `engagement` / `growth`）/ `getFastGrowingAccounts(limit?)`
- `getCategories()` / `getCategoryBySlug(slug)` / `getCategoryCounts()`
- `getPlatforms()` / `getPlatformBySlug(slug)` / `getPlatformCounts()`
- `formatNumber(value, lang)`：中文本地化（亿 / 万）

数据在构建期由 Astro Content Collections 加载，并经过 `src/content.config.ts` 的 Zod schema 校验，前置数据错误会在构建时直接报错。

## 编辑内容

新增账号：在 `src/content/accounts/` 新建 `.md`，frontmatter 至少包含：

```yaml
---
slug: example-account
profileUrl: "https://www.xiaohongshu.com/user/profile/xxx"
avatar: "🤖"
platform: xiaohongshu
platformId: "xhs-example"
verified: true
categories:
  - ai-content
tags:
  - AI绘画
contentStyle:
  - 治愈系
monetization: mixed
featured: false
followerCount: 120000
avgEngagement: 8000
contentFrequency: weekly
growthRate: 12
publishedAt: "2024-01-01"
updatedAt: "2026-06-01"
name:
  en: Example Account
  zh: 示例账号
tagline:
  en: One-line positioning
  zh: 一句话定位
description:
  en: Longer description for detail page.
  zh: 详情页使用的较长描述。
---
```

> 注意：`slug`、`platform`、`categories` 会参与关联与路由，请确保 `platform` 与 `categories` 对应 `platforms/`、`categories/` 中已存在的 slug。

## Obsidian 内容工作流

内容由 Obsidian 库（`E:\Obsidian\www.limingdao.com`）驱动，详见 `OBSIDIAN_WORKFLOW.zh-CN.md`。常用命令：

```bash
npm run vault:seed   # 把 src/content 的账号/领域/平台同步到 Obsidian 库（初始化用）
npm run vault:sync   # 把 Obsidian 库里已 approved 的内容同步回 src/content
```

## 多语言扩展

1. 在 `src/lib/i18n.ts` 的 `languages` 增加语言代码。
2. 在 `dictionary` 增加该语言的词条。
3. 在 `src/content` 的各 Markdown 增加对应语言的 `name` / `tagline` / `description` 等字段。
4. 动态路由会自动为新增语言生成页面。

## 部署

可部署到任意静态托管（Cloudflare Pages / Vercel / Netlify / GitHub Pages）。构建设置：

```text
Build command: npm run build
Output directory: dist
Node version: 20+
```

> `astro.config.mjs` 的 `site` 已设为 `https://www.limingdao.com`，请按实际域名调整，否则 canonical / OG 链接会不准确。
