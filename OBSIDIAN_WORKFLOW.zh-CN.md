# Obsidian 运营工作流

本项目已接入 Obsidian 库：

```text
E:\Obsidian\www.limingdao.com
```

## 目录分层

```text
Raw/              从 Web Clipper 或其他来源保存的原始资料
Inbox/            待处理入口
Accounts/         AI 创作者（账号）知识卡
Categories/       领域知识卡
Platforms/        平台知识卡
News/             行业动态（对应 src/content/news，首页「行业动态」区块）
Guides/           创作者指南（对应 src/content/guides，首页「创作者指南」区块）
SEO/             SEO/GEO 专题内容
Comparisons/     对比、替代品、榜单
Prompts/         提示词库
Sponsors/        赞助位资料
Templates/       Obsidian 模板
Dashboards/      运营看板
Logs/            ingest 日志
00_System/       AI 工作规则与发布规则
```

## 日常流程

1. 用 Obsidian Web Clipper 把网页保存到 `Raw/web-clips`。
2. 把值得处理的链接放入 `Inbox`。
3. 在 Claudian 中按 `00_System/INGEST_PROMPT.md` 处理，生成或更新 `Accounts/{slug}.md`。
4. 人工检查内容、领域、平台、数据指标与 `seo` / `geo` 字段、以及重复情况。
5. 确认可发布后，把账号卡改为：

```yaml
type: account
status: approved
publish: true
```

6. 在 Astro 项目中同步并构建：

```powershell
Set-Location D:\project\codex\toolify
npm run vault:sync
npm run build
```

## 初始化数据

已把当前站点的账号 / 领域 / 平台从 `src/content` 导入 Obsidian：

```powershell
npm run vault:seed
```

该命令会读取 `src/content/{accounts,categories,platforms,news,guides}`，生成 Obsidian 库中的 `Accounts/`、`Categories/`、`Platforms/`、`News/`、`Guides/` 知识卡。

## 发布同步

同步命令：

```powershell
npm run vault:sync
```

只会发布满足条件的账号：

```yaml
type: account
status: approved
publish: true
```

领域满足以下条件会同步：

```yaml
type: category
publish: true
```

平台满足以下条件会同步：

```yaml
type: platform
publish: true
```

行业动态（首页「行业动态」区块）满足以下条件会同步：

```yaml
type: news
publish: true
```

创作者指南（首页「创作者指南」区块）满足以下条件会同步：

```yaml
type: guide
publish: true
```

## 字段映射

账号卡（Obsidian ↔ 站点）使用以下字段：

```yaml
type: account
status: approved
publish: true
slug: example-account
profileUrl: "https://..."
avatar: "🤖"
platform: xiaohongshu
platformId: "xhs-example"
verified: true
categories: [ai-content]
tags: [AI绘画]
contentStyle: [治愈系]
monetization: mixed
featured: false
followerCount: 120000
avgEngagement: 8000
contentFrequency: weekly
growthRate: 12
publishedAt: "2024-01-01"
updatedAt: "2026-06-01"
name: { en: ..., zh: ... }
tagline: { en: ..., zh: ... }
description: { en: ..., zh: ... }
seo: { primary_keyword, secondary_keywords, search_intent, title_zh, title_en, meta_description_zh, meta_description_en }
geo: { answer_summary_zh, answer_summary_en, facts, faq }
```

行业动态卡（`type: news`，首页「行业动态」区块）字段：

```yaml
type: news
status: active
publish: true
slug: ai-content-largest
title: { en: "...", zh: "..." }   # 必填，作为首页链接文案
url: "/categories/ai-content"      # 必填，点击后跳转的真实页面（指向站内真实路由）
summary: { en: "...", zh: "..." }  # 可选摘要
order: 1                           # 排序，越小越靠前
date: "2026-07-20"                 # 可选发布日期
```

创作者指南卡（`type: guide`，首页「创作者指南」区块）字段：

```yaml
type: guide
status: active
publish: true
slug: ten-ways-start
title: { en: "...", zh: "..." }   # 必填，作为首页链接文案
url: "/categories"                # 必填，点击后跳转的真实页面
summary: { en: "...", zh: "..." } # 可选摘要
order: 1                           # 排序，越小越靠前
```

> 内容维护约定：news/guides 的条目由 AI 批量生成草稿、人工在 Obsidian 中审核与维护真实文案；`url` 必须指向站内真实存在的页面（不要指向营销页或虚构内容），以保证 GEO/SEO 可信度。

## SEO/GEO 策略

每个账号卡保留两类字段：

- `seo`：面向传统搜索引擎，包括关键词、标题、meta description。
- `geo`：面向 AI 搜索与答案引擎，包括短答案、事实、FAQ。

后续可把 SEO/GEO 内容扩展为独立页面，例如：

```text
/zh/best-ai-writing-creators
/zh/alternatives/account-a
/zh/compare/account-a-vs-account-b
/zh/free-ai-video-creators
```

## 注意事项

- `Raw/` 中的文件不要改。
- 不确定信息写 `unknown`。
- 不要把广告宣传语当作事实。
- 发布前先跑 `npm run build`（Zod 校验会拦截错误数据）。
- `src/content/.obsidian` 已被 `.gitignore` 忽略，请勿把 vault 配置提交进仓库。
