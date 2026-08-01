# 用 Obsidian 管理 src/content（数据库管理界面）

> **2026-08-01 架构简化**：本项目**没有独立的 Obsidian vault 根目录，也没有 vault↔site 的同步脚本**。内容真源就是项目内的 `src/content/`，Astro 构建时直接读取它。Obsidian 在这里只当作一个「带 UI 的 Markdown 编辑器 / 数据库管理界面」来用——直接打开 `src/content/` 这个文件夹即可。

## 如何打开

在 Obsidian 里 `Open folder as vault`，选择项目目录下的：

```text
D:\project\codex\toolify\src\content
```

打开后 `accounts/` `categories/` `platforms/` `news/` `guides/` 就是你的「数据库表」，每个 `.md` 是一张卡。无需初始化、无需导入、无需同步。

## 日常流程（直接编辑即上线）

1. 在对应子目录新建 / 编辑 `.md`（frontmatter + 正文）。
2. `npm run build` 验证（Zod 校验会拦截错误数据）。
3. `git push`（wincred）→ Vercel 部署。

没有任何 `vault:seed` / `vault:sync` 步骤。

## 数据控制（无「库侧控制字段」）

- **账号**：可用 `draft: true` 暂不上线（`src/content.config.ts` 已支持，`directory.ts` 加载时过滤；默认 `false` = 发布）。
- **分类 / 平台 / news / guides**：当前选择「src/content 里有什么就上什么」——**文件存在即上线，无 draft 闸门**。要下线某条目，直接删除或移走该 `.md`（URL 404、sitemap 自动剔除）。
- 旧 sync 层用来「剥离」的 `type` / `status` / `publish` 字段**现已无作用**，直接写 `src/content` 不需要它们（留着也无害，但无意义，建议不写）。

## 字段映射（与站点 schema 一致）

账号卡（`src/content/accounts/<slug>.md`）字段同 `src/content.config.ts` 的 accounts schema：

```yaml
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
draft: false            # true = 暂不上线
followerCount: 120000   # 查不到就留空（不写该键），绝不编造
avgEngagement: 8000
contentFrequency: weekly
growthRate: 12
publishedAt: "2024-01-01"
updatedAt: "2026-06-01"
name: { en: ..., zh: ... }
tagline: { en: ..., zh: ... }
description: { en: ..., zh: ... }
seo: { primary_keyword, secondary_keywords, search_intent, title_zh, title_en, meta_description_zh, meta_description_en }
geo: { answer_summary_zh, answer_summary_en, facts_zh, facts_en, faq_zh, faq_en }
```

分类 / 平台 / news / guide 字段见 `USAGE.zh-CN.md` §5–§7 与 `src/content.config.ts`。

## 指南的两种形态

- **`link` 型**（首页「创作者指南」快捷链接）：`src/content/guides/<slug>.md`，只含 `title` + `url` + `summary` + `order`。
- **`article` 型**（双语长文，详情页 `/[lang]/guides/[guideId]`）：直接维护在 `src/content/guides/{zh,en}/<guideId>.md`，frontmatter 带 `kind: article` / `lang` / `guideId` / `category` / `accounts` / `seo` / `geo`，正文写在 frontmatter 之后；由 `src/pages/[lang]/guides/[slug].astro` 按 `kind === "article" && lang && guideId` 生成详情页。
- 两种形态都**直接落在 `src/content/`**，不走任何同步脚本。

## 账号正文（双语「详细档案」）

账号详情页渲染 frontmatter 之后的 Markdown 正文，用 `<!-- zh -->` 与 `<!-- en -->` 两个 HTML 注释标记分隔同一文件内的中/英两份正文；英文页只渲染 `<!-- en -->` 段，绝不显示中文。`scripts/dethin-accounts.py` 可基于 frontmatter 真实字段批量扩写这两份正文（不编造数字）。

## SEO/GEO 策略

每个账号 / 分类卡保留 `seo`（关键词 / 标题 / meta）与 `geo`（短答案 / 事实 / FAQ）两类字段，详情页渲染成「一句话结论 / 关键事实 / FAQ」区块，直接服务 AI 引用。

## 注意事项

- 不确定信息写 `unknown`；不要把广告宣传语当事实。
- 发布前先 `npm run build`（Zod 校验拦截错误数据）。
- 账号指标（followerCount 等）为可选，查不到就留空，绝不编造。
- 若把 `src/content` 当 vault 打开，Obsidian 会在其中生成 `.obsidian/`，已被 `.gitignore` 忽略，无需提交、无需处理。
