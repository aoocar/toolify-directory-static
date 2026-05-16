# Usage Guide

## 1. Start The Site Locally

```powershell
Set-Location D:\project\codex\toolify
npm install
npm run dev
```

Visit:

```text
http://localhost:4321/zh
http://localhost:4321/en
```

## 2. Add A New AI Tool

Create a new Markdown file under:

```text
src/content/tools
```

Example:

```yaml
---
slug: sample-ai
website: https://example.com
logo: SA
categories:
  - productivity
tags:
  - notes
  - automation
pricing: freemium
featured: false
monthlyVisits: 12000
savedCount: 320
publishedAt: 2026-05-16
updatedAt: 2026-05-16
name:
  en: Sample AI
  zh: Sample AI
tagline:
  en: A short positioning sentence
  zh: 一句简短定位语
description:
  en: A longer English description.
  zh: 一段较长的中文介绍。
---
```

The file name can match the slug, for example `sample-ai.md`.

## 3. Add A Category

Create a new Markdown file under:

```text
src/content/categories
```

Example:

```yaml
---
slug: ai-agents
icon: Agent
name:
  en: AI Agents
  zh: AI Agent
description:
  en: Autonomous AI assistants and workflow agents.
  zh: 自主 AI 助手和工作流 Agent。
---
```

Then reference the category slug from tool files:

```yaml
categories:
  - ai-agents
```

## 4. Add A New Language

1. Open `src/lib/i18n.ts`.
2. Add the new language code to `languages`.
3. Add translations in `dictionary`.
4. Add the same language key to every localized Markdown field.

Example:

```ts
export const languages = ["en", "zh", "ja"] as const;
```

Then add `ja` to content:

```yaml
name:
  en: Sample AI
  zh: Sample AI
  ja: Sample AI
```

## 5. Upgrade Path

Recommended growth plan:

```text
0-1,000 tools: Astro + Markdown
1,000-5,000 tools: Astro + generated JSON
5,000+ tools: PostgreSQL/Supabase + Meilisearch/Typesense
```

When upgrading, keep the page routes unchanged and only replace the internals of:

```text
src/lib/directory.ts
```

This keeps the public pages and SEO URLs stable.

## 6. Common Commands

```powershell
npm run dev
npm run build
npm run preview
```

## 7. GitHub Deployment Notes

For Cloudflare Pages, Vercel, or Netlify:

```text
Build command: npm run build
Output directory: dist
```

For GitHub Pages, use a GitHub Actions workflow that builds Astro and publishes `dist`.
