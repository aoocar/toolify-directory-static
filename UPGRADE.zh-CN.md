# 升级教程

## 阶段一：当前静态版本

适合网站早期阶段，工具数量较少，内容主要由人工维护。

```text
数据源：Markdown
渲染方式：Astro 静态构建
搜索：页面内简单搜索或 Pagefind
托管：Cloudflare Pages、Vercel、Netlify、GitHub Pages
```

建议任务：

- 添加真实工具和分类。
- 保持分类 slug 稳定。
- 给每个分类补充 SEO 描述。
- 当 AI 新闻、指南、提示词和赞助卡片需要频繁更新时，把这些静态种子数据升级为 Markdown 内容集合。
- 内容变多后添加 sitemap 和 RSS。
- 工具数量超过 100 后可以接入 Pagefind。

## 阶段二：生成式数据

适合 Markdown 人工维护开始变慢，但静态页面仍然足够使用的阶段。

```text
数据源：CSV、Airtable、Notion、CMS 或爬虫输出
构建步骤：自动生成 JSON 或 Markdown
渲染方式：Astro 静态构建
搜索：Pagefind、Meilisearch、Typesense 或 Algolia
```

迁移方式：

1. 保持现有路由不变。
2. 把外部数据生成到 `src/content/tools`。
3. 继续使用 `src/lib/directory.ts` 作为页面数据入口。
4. 在构建前增加数据校验。

## 阶段三：数据库驱动目录站

当工具数量达到几千个、更新频率变高、需要提交审核、付费推荐或高级筛选时，进入这个阶段。

```text
数据源：PostgreSQL 或 Supabase
搜索：Meilisearch、Typesense 或 Algolia
渲染方式：静态 + 服务端/混合渲染
后台：Directus、Strapi、自建后台或 Supabase Studio
```

此时主要替换下面文件的内部实现：

```text
src/lib/directory.ts
```

保持这些函数名不变：

- `getTools()`
- `getToolBySlug(slug)`
- `getCategories()`
- `getCategoryBySlug(slug)`
- `getToolsByCategory(categorySlug)`
- `getFeaturedTools()`
- `getLatestTools(limit?)`
- `getRankedTools(limit?)`

这样页面层可以基本不动。

## 阶段四：商业化功能

建议在内容体系和流量验证后再添加：

- 工具提交工作流
- 后台审核队列
- 顶部横条、今日工具流、分类页和工具详情页中的赞助推荐位
- 邮件订阅
- 流量分析
- 工具对比页
- 替代品页面，例如 `/alternatives/chatgpt`
- 榜单 SEO 页面，例如 `/best-ai-writing-tools`

## 阶段五：国际化扩展

推荐语言扩展顺序：

```text
先做英文 + 中文
再扩展日语或西班牙语
然后根据语言单独优化落地页和分类页
```

除非准备做独立域名或强本地化 SEO，否则建议 slug 继续使用英文，方便保持 URL 稳定。
