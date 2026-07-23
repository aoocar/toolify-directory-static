# 架构

## 目标

本项目以静态 Astro + Markdown 目录起步，并为将来更大规模的数据库 / 搜索架构预留清晰路径。

## 稳定契约

- URL 形态：
  - `/:lang`
  - `/:lang/accounts`
  - `/:lang/accounts/:slug`
  - `/:lang/categories`
  - `/:lang/categories/:slug`
  - `/:lang/platforms`
  - `/:lang/platforms/:slug`
  - `/:lang/rankings`
  - `/:lang/new`
  - `/:lang/submit`
  - `/:lang/services`
  - `/:lang/contact`
- 公共数据 API（`src/lib/directory.ts`）：
  - `getAccounts()` / `getAccountBySlug(slug)`
  - `getAccountsByCategory(categorySlug)` / `getAccountsByPlatform(platformSlug)`
  - `getFeaturedAccounts()` / `getLatestAccounts(limit?)`
  - `getRankedAccounts(sortBy?, limit?)`（`followers` / `engagement` / `growth`）/ `getFastGrowingAccounts(limit?)`
  - `getCategories()` / `getCategoryBySlug(slug)` / `getCategoryCounts()`
  - `getPlatforms()` / `getPlatformBySlug(slug)` / `getPlatformCounts()`
- 共享类型：`src/lib/types.ts`
- 语言列表与词典：`src/lib/i18n.ts`

## 当前数据源

Markdown 文件，由 Astro Content Collections 加载并在构建期用 `src/content.config.ts` 的 Zod schema 校验：

- `src/content/accounts/*.md`
- `src/content/categories/*.md`
- `src/content/platforms/*.md`

每个 Markdown 目前以 frontmatter 为主；正文可用于长文评测或 SEO 描述。

## 数据加载

`src/lib/directory.ts` 通过 `astro:content` 的 `getCollection()` 加载三个集合，并用 `withRelations()` 把账号关联到其领域与平台。所有 frontmatter 在构建时被 Zod 校验，字段缺失或类型错误会在 `astro build` 时直接报错（不再"校验形同虚设"）。

## 首页组成

首页有意采用密集的目录式布局，而非营销落地页：

- 赞助条：`src/layouts/BaseLayout.astro`
- Hero 搜索与统计：`src/pages/[lang]/index.astro`
- 快捷导航：`quickLinks`
- 今日推荐：`getLatestAccounts()`
- 信息流中的赞助插入：静态占位卡片 `BusinessCTA`
- 排行榜侧栏：`getRankedAccounts()`
- 平台导航：静态取前 6 个平台
- 领域索引：`getCategoryCounts()`
- 行业动态 / 创作者指南：首页编辑型静态列表（后续可改为内容集合或取自账号的 `geo` 字段）
- 精选达人：`getFeaturedAccounts()`

## 迁移路径

当目录规模增长时，替换 `src/lib/directory.ts` 的内部实现：

1. 100–1,000 个账号：保持 Markdown，加 Pagefind 做静态搜索。
2. 1,000–5,000 个账号：把数据导出为生成式 JSON，保留 Astro 静态页，加构建缓存。
3. 5,000+ 个账号：迁移到 PostgreSQL / Supabase，搜索用 Meilisearch / Typesense / Algolia，保持路由与页面组件不变。
4. 动态操作：推荐表单、赞助位、分析、审核后台改为 API 驱动模块；公开列表页可保持静态或采用混合渲染（hybrid rendering）。

## 多语言扩展

1. 在 `src/lib/i18n.ts` 的 `languages` 增加语言代码。
2. 在 `dictionary` 增加对应词条。
3. 在 `src/content` 的 Markdown 增加对应语言的 `name` / `tagline` / `description`。
4. 现有动态路由会自动生成新语言页面。
