# 黎明岛 — 开发与架构升级指南

本文档面向开发者，介绍「黎明岛」平台的底层架构，以及随着数据量增长后，如何将其从**静态 Markdown 模式**升级为**数据库/动态驱动模式**，同时不破坏前端页面、路由与 SEO。

---

## 1. 核心架构与稳定接口

项目采用**"数据源可替换，接口与组件保持稳定"**的设计理念。页面与组件绝不直接读取 Markdown，而是通过 `src/lib/directory.ts` 中定义的异步函数获取数据。后续升级底层数据源时，只要保持这些函数签名不变，页面层就能继续工作。

### 1.1 账号相关接口
- `getAccounts()` — 获取全部账号列表
- `getAccountBySlug(slug)` — 依据 slug 获取达人详情
- `getAccountsByCategory(categorySlug)` — 依据领域分类获取账号
- `getAccountsByPlatform(platformSlug)` — 依据平台获取账号
- `getFeaturedAccounts()` — 首页精选账号
- `getLatestAccounts(limit?)` — 按 `updatedAt` 取最新
- `getRankedAccounts(sortBy, limit?)` — `sortBy: "followers" | "engagement" | "growth"`
- `getFastGrowingAccounts(limit?)` — 涨粉最快

### 1.2 领域 / 平台接口
- `getCategories()`、`getCategoryBySlug(slug)`、`getCategoryCounts()`
- `getPlatforms()`、`getPlatformBySlug(slug)`、`getPlatformCounts()`

### 1.3 首页动态接口
- `getNews(lang)`、`getGuides(lang)` — 返回 `{ title, url, summary?, date? }[]`

### 1.4 工具函数
- `formatNumber(value, lang)` — 本地化大数字格式（万 / K）

### 1.5 路由结构
- `/[lang]` — 首页
- `/[lang]/accounts`、 `/[lang]/accounts/[slug]` — 达人库与详情
- `/[lang]/platforms`、 `/[lang]/platforms/[slug]` — 平台与平台下账号
- `/[lang]/categories`、 `/[lang]/categories/[slug]` — 领域与领域下账号
- `/[lang]/rankings`、 `/[lang]/new`、 `/[lang]/services`、 `/[lang]/submit`、 `/[lang]/contact`
- `/` 重定向到默认语言 `zh`

---

## 2. 技术栈

- Astro 5（`output: "static"`、`trailingSlash: "never"`）
- TypeScript、纯 `.astro` 组件、单一 `global.css`
- Content Collections + Zod 校验（`src/content.config.ts`）
- `@astrojs/sitemap`
- 无前端框架、无后端——纯 GEO/SEO 静态站

---

## 3. 升级路线图

### 阶段一：0 ~ 1,000 个达人账号（当前阶段：Markdown + 静态检索）
数据量较小，静态构建速度极快，继续使用本地 Markdown 维护内容。
- 可接入 **Pagefind** 做客户端全文检索（无需后端服务器）。
- 保持分类 / 平台 slug 稳定。
- 为所有领域补充 SEO 描述。
- 首页「行业动态 / 创作者指南」已迁移为 `news` / `guides` 内容集合（数据驱动，已落地）。
- sitemap + robots（已落地）、流量监控 GA + Clarity（已落地）。

### 阶段二：1,000 ~ 5,000 个达人账号（数据外置 + Astro 自动构建）
手动编辑 Markdown 变繁琐时：
- 数据存放于 Airtable / Notion / 轻量 CMS 或爬虫输出。
- 生成文件至 `src/content/*`，**或**改写 `directory.ts` 中的加载逻辑。
- 保持 `directory.ts` 函数名不变，增加构建期校验。

### 阶段三：5,000+ 达人账号（迁移至数据库）
数据量巨大且需频繁实时更新（粉丝数、每日互动率）时：
- 使用 **Supabase / PostgreSQL** 存储动态达人数据。
- 修改 `astro.config.mjs` 的渲染模式为混合渲染（Hybrid）或服务端渲染（SSR）。
- 重写 `directory.ts` 中的函数，使其直接查询数据库；页面与卡片组件保持原样。

### 阶段四：商业化功能（内容引擎跑通后再做）
- 提交工作流 + 审核队列（当前 `/submit` 的 mailto 可改为 API 路由）
- 赞助位、邮件订阅、对比 / 替代品 / 精选 SEO 页面
  （如 `/zh/best-ai-writing-creators`、`/zh/alternatives/<account>`、`/zh/compare/a-vs-b`）

### 阶段五：国际化扩张
- 先英 + 中，再日 / 西，最后做语言专属落地页与领域页。
- 除非有分语言域名策略，否则 slug 保持英文以保证 SEO 稳定。

---

## 4. 内容 Schema 变更

Schema 定义在 `src/content.config.ts`，构建期由 Zod 校验。新增字段时：
1. 扩展对应集合的 Zod schema（`accounts` / `categories` / `platforms` / `news` / `guides`）。
2. 同步更新 `src/lib/types.ts` 中的 TypeScript 类型。
3. 若该字段影响关联或格式化，更新 `directory.ts` 的映射。
4. 在需要的地方补充 UI 渲染。

> **坑：保留字段 `slug`** —— `slug` 是 Astro 内容集合的保留字段，加载器用 `e.data.slug ?? e.slug` 兜底，不要假设 `data.slug` 一定存在。

---

## 5. 数据层变更

所有读取都经过 `directory.ts` 的 `load()`（带缓存的 `getCollection()` 调用）。迁移数据源时，只替换 `load()` 内部实现，保持导出的 getter 签名不变，从而不影响任何页面与 SEO URL。

---

## 6. SEO 与 GEO 优化实践

- `seo`：面向传统搜索引擎（关键词、标题、`meta_description`）。`meta_description_*` 用作页面 `<meta name="description">`。
- `geo`：面向 AI 搜索与答案引擎（`answer_summary`、`facts`、`faq`），在详情页渲染。
- `BaseLayout.astro` 自动注入 canonical、Open Graph 与 Twitter 标签。

---

## 7. 已知坑

- 保留字段 `slug`（见第 4 节）。
- `draft: true` 的账号在 `load()` 中被过滤，因此既不进入路由，也**不会**出现在 sitemap 中。
- sitemap / robots 依赖 `astro.config.mjs` 中的 `site` 为生产域名（`https://www.limingdao.com`）。

---

## 8. 流量监控

GA4（`G-WJ8ZP9FSE9`）与 Microsoft Clarity（`kn4x488ytp`）在 `BaseLayout.astro` 中以 `is:inline` 注入，全局生效于所有页面。

---

## 9. 部署流水线

GitHub `main` → Vercel 自动部署。`npm run build` → `dist`。保持 `astro.config.mjs` 的 `site` 正确，以保证绝对 URL 与 sitemap 指向生产域名。

---

## 10. Obsidian 同步（运营侧）

内容由 Obsidian 库（`E:\Obsidian\www.limingdao.com`）维护：
- `npm run vault:seed`：一次性把 `src/content/{accounts,categories,platforms,news,guides}` 导入库。
- `npm run vault:sync`：仅发布满足 `publish: true` 等条件的知识卡回到 `src/content`。
- 同步后 `npm run build`，Zod 校验拦截错误数据。
