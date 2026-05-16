# Toolify-style AI Directory

An Astro + Markdown static AI tools directory scaffold inspired by Toolify's information architecture. It is built with a replaceable data layer, so the first version can run from local content files and later move to a database/search service without redesigning routes or pages.

## Features

- Static-first Astro site.
- Bilingual routes for English and Chinese: `/en` and `/zh`.
- Markdown-managed tools and categories.
- SEO-friendly pages for home, tool details, categories, rankings, newest tools, and submission.
- Replaceable data access layer in `src/lib/directory.ts`.
- Content schema validation in `src/content.config.ts`.

## Run

```bash
npm install
npm run dev
```

Open:

- `http://localhost:4321/en`
- `http://localhost:4321/zh`

## Build

```bash
npm run build
npm run preview
```

The production static files are generated in `dist`.

## Current architecture

- Static Astro pages with bilingual routes: `/en` and `/zh`.
- Markdown seed data in `src/content/tools` and `src/content/categories`.
- Public page code calls `src/lib/directory.ts` instead of reading raw data directly.
- Future data migration can replace `directory.ts` internals with PostgreSQL, Supabase, Meilisearch, Typesense, or an API.

## Key routes

- `/en` and `/zh`: home dashboards
- `/en/tools/[slug]` and `/zh/tools/[slug]`: tool detail pages
- `/en/categories/[slug]` and `/zh/categories/[slug]`: category landing pages
- `/en/rankings`: ranking page
- `/en/new` and `/zh/new`: newest tools
- `/en/submit` and `/zh/submit`: submit page placeholder

## Add another language

1. Add the language code in `src/lib/i18n.ts`.
2. Add translations in `dictionary`.
3. Add localized strings to each tool/category in `src/content`.
4. Routes will be generated for the new language automatically where pages use `getStaticPaths()`.

See `ARCHITECTURE.md` for the migration plan.

## Content editing

Add tools in:

```text
src/content/tools
```

Add categories in:

```text
src/content/categories
```

Every tool should include localized fields:

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

## Deployment

This project can deploy to any static host:

- Cloudflare Pages
- Vercel
- Netlify
- GitHub Pages

Recommended build settings:

```text
Build command: npm run build
Output directory: dist
Node version: 20+
```
