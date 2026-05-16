# AI 工具目录静态站

这是一个受 Toolify 信息架构启发的 Astro + Markdown 静态 AI 工具目录项目。项目采用可替换的数据层设计：前期可以直接用本地 Markdown 内容文件运行，后期数据量增长后，可以迁移到数据库或搜索服务，而不需要重新设计页面路由和整体架构。

## 功能特性

- Astro 静态站优先架构。
- 已内置中英双语路由：`/zh` 和 `/en`。
- 工具和分类内容使用 Markdown 管理。
- 包含首页、工具详情页、分类页、排行榜、最新工具页、提交页等 SEO 友好页面。
- 数据访问统一封装在 `src/lib/directory.ts`，后期方便替换数据源。
- 内容字段校验集中在 `src/content.config.ts`。

## 本地运行

```bash
npm install
npm run dev
```

打开：

- `http://localhost:4321/zh`
- `http://localhost:4321/en`

## 构建与预览

```bash
npm run build
npm run preview
```

生产静态文件会生成在 `dist` 目录。

## 当前架构

- Astro 静态页面，中英双语路由：`/zh` 和 `/en`。
- 示例数据位于 `src/content/tools` 和 `src/content/categories`。
- 页面代码只调用 `src/lib/directory.ts`，不直接读取底层数据。
- 后期可以把 `directory.ts` 内部替换成 PostgreSQL、Supabase、Meilisearch、Typesense、Algolia 或 API。

## 主要路由

- `/zh` 和 `/en`：首页
- `/zh/tools/[slug]` 和 `/en/tools/[slug]`：工具详情页
- `/zh/categories/[slug]` 和 `/en/categories/[slug]`：分类页
- `/zh/rankings` 和 `/en/rankings`：排行榜
- `/zh/new` 和 `/en/new`：最新工具
- `/zh/submit` 和 `/en/submit`：提交工具占位页

## 添加新语言

1. 打开 `src/lib/i18n.ts`。
2. 在 `languages` 中添加新的语言代码。
3. 在 `dictionary` 中补充对应翻译。
4. 在每个工具和分类的 Markdown 字段中补充该语言内容。
5. 使用 `getStaticPaths()` 的页面会自动生成新语言路由。

更多迁移思路见 [ARCHITECTURE.zh-CN.md](./ARCHITECTURE.zh-CN.md)。

## 内容维护

添加工具：

```text
src/content/tools
```

添加分类：

```text
src/content/categories
```

每个工具建议包含本地化字段：

```yaml
name:
  en: Example Tool
  zh: 示例工具
tagline:
  en: Short one-line positioning
  zh: 简短定位语
description:
  en: Longer description for detail pages.
  zh: 详情页使用的较长描述。
```

## 部署

本项目可以部署到任何静态托管平台：

- Cloudflare Pages
- Vercel
- Netlify
- GitHub Pages

推荐构建配置：

```text
Build command: npm run build
Output directory: dist
Node version: 20+
```
