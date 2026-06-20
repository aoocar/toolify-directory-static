# 黎明岛 — 开发与架构升级指南

本文档面向开发者，介绍「黎明岛」平台的底层架构，以及随着数据量增长后，如何将其从**静态 Markdown 模式**升级为**数据库/动态驱动模式**。

---

## 1. 核心架构与稳定接口

为了确保后续升级时不破坏前端页面和组件，项目采用了**“数据源可替换，接口与组件保持稳定”**的设计理念。

无论底层数据是 Markdown 还是云端数据库，页面路由和核心数据访问接口都应保持一致。

### 1.1 核心数据接口 (`src/lib/directory.ts`)
所有组件与页面获取数据都必须通过该文件定义的函数：
- `getAccounts()` - 获取全部账号列表
- `getAccountBySlug(slug)` - 依据 slug 获取达人详情
- `getAccountsByCategory(slug)` - 依据领域分类获取账号
- `getAccountsByPlatform(slug)` - 依据自媒体平台获取账号
- `getRankedAccounts(sortBy, limit?)` - 获取达人排行榜
- `getPlatforms()` - 获取所有平台
- `getCategories()` - 获取所有领域分类

### 1.2 路由结构
- `/zh` 或 `/en` - 首页
- `/zh/accounts` - 达人库（包含搜索与筛选）
- `/zh/accounts/:slug` - 达人详情页
- `/zh/platforms` - 自媒体平台列表
- `/zh/platforms/:slug` - 特定平台下的账号列表
- `/zh/categories` - 内容领域列表
- `/zh/categories/:slug` - 特定领域下的账号列表
- `/zh/services` - AI内容代运营服务（业务页）

---

## 2. 升级路线图

### 阶段一：100 - 1,000 个达人账号 (维持 Markdown + 增加静态检索)
此阶段数据量较小，静态构建速度极快。你可以继续使用本地 Markdown 维护内容。
- **添加 Pagefind 做静态搜索**：
  Astro 极易集成 Pagefind。这可以在不需要任何后端服务器的情况下，在客户端实现毫秒级的全文检索。

### 阶段二：1,000 - 5,000 个达人账号 (数据外置 + Astro 自动构建)
当账号量变大时，手动编辑 Markdown 会变得繁琐。
- **方案**：将数据存放在 Airtable、Notion 或轻量 CMS 中。
- **改造**：修改 `src/lib/directory.ts` 中的数据源加载方式，通过各平台的 API 拉取数据。Astro 仍然通过静态生成（SSG）在构建时生成全部页面，并配合构建缓存（Build Cache）提升速度。

### 阶段三：5,000+ 达人账号 (迁移至数据库)
如果数据量巨大，且数据需要频繁实时更新（如粉丝数、每日互动率）。
- **方案**：使用 **Supabase / PostgreSQL** 存储动态达人数据。
- **步骤**：
  1. 修改 `astro.config.mjs` 中的渲染模式为混合渲染（Hybrid）或服务端渲染（SSR）。
  2. 重写 `src/lib/directory.ts` 中的函数，使其直接向 PostgreSQL/Supabase 数据库发起 SQL 或 API 请求。
  3. 页面和卡片组件保持原样，仅替换底层的数据存取逻辑。

---

## 3. SEO 与 GEO 优化实践

每个 `Account` 都支持可选的 `seo` 和 `geo` 字段。
- **SEO 结构化数据**：已在 `BaseLayout.astro` 头部集成 Meta 配置，确保每个账号主页均可被 Google/百度检索。
- **GEO (生成式搜索引擎优化)**：`geo` 字段下的 `facts` 与 `faq` 专门用于优化 AI 搜索引擎（如 Perplexity、ChatGPT、Gemini）的抓取，使得在 AI 搜索你的服务或相关达人时，能获得更高的推荐概率。
