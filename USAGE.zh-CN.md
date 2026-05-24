# 使用教程

## 1. 本地启动网站

```powershell
Set-Location D:\project\codex\toolify
npm install
npm run dev
```

访问：

```text
http://localhost:4321/zh
http://localhost:4321/en
```

## 2. 添加新的 AI 工具

在下面目录中新建 Markdown 文件：

```text
src/content/tools
```

示例：

```yaml
---
slug: sample-ai
website: https://example.com
logo: SA
categories:
  - productivity
tags:
  - notes
  - automation
pricing: freemium
featured: false
monthlyVisits: 12000
savedCount: 320
publishedAt: 2026-05-16
updatedAt: 2026-05-16
name:
  en: Sample AI
  zh: Sample AI
tagline:
  en: A short positioning sentence
  zh: 一句简短定位语
description:
  en: A longer English description.
  zh: 一段较长的中文介绍。
---
```

文件名建议和 `slug` 保持一致，例如：

```text
sample-ai.md
```

首页“今天”工具流会根据 `updatedAt` 自动排序。

精选工具由下面字段控制：

```yaml
featured: true
```

排行榜当前根据下面字段排序：

```yaml
monthlyVisits: 12000
```

## 3. 添加新分类

在下面目录中新建 Markdown 文件：

```text
src/content/categories
```

示例：

```yaml
---
slug: ai-agents
icon: Agent
name:
  en: AI Agents
  zh: AI Agent
description:
  en: Autonomous AI assistants and workflow agents.
  zh: 自主 AI 助手和工作流 Agent。
---
```

然后在工具文件中引用该分类：

```yaml
categories:
  - ai-agents
```

## 4. 添加新语言

1. 打开 `src/lib/i18n.ts`。
2. 在 `languages` 数组中添加语言代码。
3. 在 `dictionary` 中添加界面文案翻译。
4. 在所有 Markdown 的本地化字段中添加该语言。

示例：

```ts
export const languages = ["en", "zh", "ja"] as const;
```

内容字段中补充：

```yaml
name:
  en: Sample AI
  zh: Sample AI
  ja: Sample AI
```

## 5. 后期升级路线

推荐增长路线：

```text
0-1,000 个工具：Astro + Markdown
1,000-5,000 个工具：Astro + 生成 JSON
5,000+ 个工具：PostgreSQL/Supabase + Meilisearch/Typesense
```

升级时尽量保持页面路由不变，只替换：

```text
src/lib/directory.ts
```

这样可以保持已有页面、组件和 SEO URL 稳定。

## 6. 常用命令

```powershell
npm run dev
npm run build
npm run preview
```

## 7. 首页模块说明

首页被设计成目录型工作台，而不是普通营销页：

- 顶部赞助横条位于 `src/layouts/BaseLayout.astro`。
- 首页搜索和统计位于 `src/pages/[lang]/index.astro`。
- 快捷入口包括最新 AI、最多保存、最多人使用、浏览器插件、Apps 和 Discord of AI。
- “今天”工具流来自 `getLatestTools()`。
- 信息流中预留赞助工具卡片。
- 右侧排行榜来自 `getRankedTools()`。
- 右侧提示词标签用于后续扩展提示词库。
- AI 新闻和热门指南用于 SEO 内容拓展。
- 免费分类索引来自 `getCategoryCounts()`。

## 8. GitHub 部署说明

如果部署到 Cloudflare Pages、Vercel 或 Netlify：

```text
Build command: npm run build
Output directory: dist
```

如果部署到 GitHub Pages，可以使用项目中已经提供的 GitHub Actions 工作流，它会构建 Astro 并发布 `dist`。
