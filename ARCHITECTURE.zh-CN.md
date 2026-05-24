# 架构说明

## 目标

这个项目从 Astro + Markdown 静态目录站开始，同时预留后期升级到数据库和搜索服务的路径。

核心原则是：页面路由和组件尽量稳定，数据来源可以替换。

## 稳定接口

建议长期保持这些约定不变。

路由结构：

- `/:lang`
- `/:lang/tools`
- `/:lang/tools/:slug`
- `/:lang/categories`
- `/:lang/categories/:slug`
- `/:lang/rankings`
- `/:lang/new`
- `/:lang/submit`

数据访问函数位于 `src/lib/directory.ts`：

- `getTools()`
- `getToolBySlug(slug)`
- `getCategories()`
- `getCategoryBySlug(slug)`
- `getToolsByCategory(categorySlug)`
- `getFeaturedTools()`
- `getLatestTools(limit?)`
- `getRankedTools(limit?)`

共享类型位于：

```text
src/lib/types.ts
```

语言配置位于：

```text
src/lib/i18n.ts
```

## 当前数据源

Markdown 文件：

```text
src/content/tools/*.md
src/content/categories/*.md
```

目前主要使用 Markdown frontmatter 存储结构化数据。后续可以在正文区域增加长评测、教程或 SEO 内容。

## 首页组成

首页刻意采用高信息密度的目录站结构，而不是普通营销落地页：

- 顶部赞助横条：`src/layouts/BaseLayout.astro`
- 首页搜索和统计：`src/pages/[lang]/index.astro`
- 快捷入口：`quickLinks`
- 今日工具流：`getLatestTools()`
- 信息流赞助卡片：当前是静态占位，后续可接广告系统
- 右侧排行榜：`getRankedTools()`
- 提示词标签云：当前是静态种子数据，后续可接提示词库
- AI 新闻和热门指南：当前是静态种子列表，后续可升级为内容集合
- 分类索引：`getCategoryCounts()`

当项目增长后，新闻、指南、提示词和赞助位建议独立成内容集合或数据库表。

## 迁移路线

### 100-1,000 个工具

继续使用 Markdown。可以添加 Pagefind 做静态搜索。

### 1,000-5,000 个工具

把工具数据迁移到自动生成的 JSON 或 Markdown。Astro 仍然负责静态页面生成，并增加构建缓存。

### 5,000+ 个工具

把数据迁移到 PostgreSQL 或 Supabase。搜索使用 Meilisearch、Typesense 或 Algolia。页面路由和组件保持不变。

### 动态操作

工具提交、赞助位、数据统计、后台审核等功能应该逐步变成 API 驱动模块。公开列表页仍然可以保持静态或混合渲染。

## 添加新语言

1. 在 `src/lib/i18n.ts` 的 `languages` 中添加语言代码。
2. 在 `dictionary` 中补充界面文案。
3. 在 Markdown frontmatter 的 `name`、`tagline`、`description` 等字段中补充新语言。
4. 现有动态路由会自动生成新语言页面。
