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

---

## 进阶：把库当作内容数据库管理

> 本节能帮你像管理一个「内容数据库」那样使用 Obsidian 库，而不只是当笔记软件。

### A. 各类型卡的 Properties 字段对照

控制字段（`type` / `status` / `publish`）是**库侧发布闸门**，`vault:sync` 写入站点时会被**剥离**（站点 schema 无这些字段）；业务字段原样写入。

| 类型 | 控制字段（库侧） | 必填业务字段 | 可选业务字段 |
|------|----------------|-------------|-------------|
| account | `type: account` + `status: approved` + `publish: true` | `slug`, `profileUrl`, `name{en,zh}`, `tagline{en,zh}`, `description{en,zh}` | `avatar`, `platform`, `platformId`, `verified`, `categories[]`, `tags[]`, `contentStyle[]`, `monetization`, `featured`, `followerCount`, `avgEngagement`, `contentFrequency`, `growthRate`, `publishedAt`, `updatedAt`, `seo`, `geo` |
| category | `type: category` + `publish: true` | `slug`, `name{en,zh}`, `description{en,zh}` | `icon`, `seo`, `geo` |
| platform | `type: platform` + `publish: true` | `slug`, `name{en,zh}`, `description{en,zh}` | `icon`, `baseUrl`, `type` |
| news | `type: news` + `publish: true` | `slug`, `title{en,zh}`, `url` | `summary{en,zh}`, `order`, `date` |
| guide | `type: guide` + `publish: true` | `slug`, `title{en,zh}`, `url` | `summary{en,zh}`, `order` |

> 注意：同步脚本**仅对 account 校验 `status: approved`**；category / platform / news / guide 只需 `publish: true`，历史示例里写的 `status: active` 对它们无意义，可省略。

### B. Templates 用法

在库的 `Templates/` 放 5 类卡模板（含全部「控制 + 必填」字段）。新建卡时套用模板，
保证字段齐全、不漏 `publish`，也不漏账号必需的 `status: approved`。模板示例：

```yaml
---
type: account
status: approved
publish: true
slug:
profileUrl:
avatar: "🤖"
platform:
platformId:
verified: false
categories: []
tags: []
contentStyle: []
monetization: unknown
featured: false
name: { en: "", zh: "" }
tagline: { en: "", zh: "" }
description: { en: "", zh: "" }
---
```

### C. 发布闸门

- `publish: false` = 卡留在库里但**不发布**到站点（草稿 / 待审）。
- 账号还需 `status: approved`（机器审核通过）才发布。
- 想临时下线某账号：把 `publish` 改为 `false`，重跑 `vault:sync` 即从其站点移除
  （URL 404、sitemap 自动剔除），卡仍留库可随时恢复。

### D. 去重与 slug

- 同步以 `slug` 为唯一键；缺省时用 `slugify(name.en)` 推导。
- **同一 slug 两张卡会相互覆盖**——新增前先搜索库确认无重名。

### E. 入库流水线

```text
Raw/  →  Inbox/  →  Claudian 按 00_System/INGEST_PROMPT.md 处理
                    →  生成/更新 Accounts/{slug}.md
                    →  人工 QA（领域/平台/指标/seo/geo/重复）
                    →  置 publish: true
                    →  npm run vault:sync
```

### F. 双向同步说明

- `vault:seed`：**站点 → 库**，一次性引导（把已有 `src/content` 导入库）。
- `vault:sync`：**库 → 站点**，日常发布。
- 二者**不是持续双向**。若你直接改了 `src/content`，库不会自动反向更新——
  应以库为**唯一真源**，避免双头编辑导致漂移。

### G. 常见坑

- `src/content/.obsidian` 已被 `.gitignore` 忽略，勿把库配置提交进仓库。
- 勿改 `Raw/` 原始资料。
- 控制字段（`type` / `status` / `publish`）写在库卡里，但站点 Markdown 里**不会出现**——
  这是正常的（sync 剥离），不代表丢失。
- 站点 `accounts` schema 用 `draft` 而非 `publish`；库侧用 `publish` 作闸门，
  sync 时不写 `draft`（默认 `false` = 发布）。
- ⚠️ **指南的两种形态**：经 `vault:sync` 生成的指南卡是 `kind: link` 型
  （首页「创作者指南」快捷链接，仅 `title` + `url`）。12 篇 GEO 长文指南
  （`article` 型，含 `guideId` / `lang` / `category` / `accounts` / `seo` / `geo`）
  **直接在 `src/content/guides/{zh,en}/` 维护，不走 Obsidian 同步**。
