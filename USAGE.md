# Usage Guide — Dawn Island (黎明岛)

Dawn Island (黎明岛) is a bilingual (English / Chinese), statically generated directory of outstanding AI-driven social-media creators. This guide covers local setup, content authoring, the Obsidian workflow, deployment, and analytics.

> Tech note: the repository is named `toolify-directory-static` for historical reasons; the product is **Dawn Island / 黎明岛**.

---

## 1. Prerequisites & Install

- Node.js 18+ (the managed 22/24 runtimes also work)
- npm

```bash
cd D:\project\codex\toolify
npm install
```

---

## 2. Local Development & Build

```bash
npm run dev       # hot-reload dev server → http://localhost:4321/zh
npm run build     # static build → dist/
npm run preview   # preview the production build
```

Pages are served at `/zh` (default language) and `/en`. The root `/` issues a redirect to `/zh`.

---

## 3. Content Model

All content lives in `src/content/` as Markdown with frontmatter, validated by Zod (`src/content.config.ts`) at build time:

| Collection | Path | Purpose |
|------------|------|---------|
| `accounts` | `src/content/accounts` | Core entity — one creator/profile per file |
| `categories` | `src/content/categories` | Content niches (e.g. AI art, finance) |
| `platforms` | `src/content/platforms` | Source platforms (Douyin, XHS, YouTube…) |
| `news` | `src/content/news` | Homepage "Industry Trends" feed items |
| `guides` | `src/content/guides` | Homepage "Creator Guides" feed items |

The data layer (`src/lib/directory.ts`) reads these via `getCollection()` and exposes async getters consumed by every page.

---

## 4. Add a Creator (Account)

Create `src/content/accounts/<slug>.md`:

```yaml
---
slug: xiaohongshu-specimen            # unique id, becomes part of the URL
profileUrl: https://www.xiaohongshu.com/user/profile/123456
avatar: "🎨"                          # emoji or image URL
platform: xiaohongshu                 # must match a platform slug
platformId: "red-creator-abc"         # in-platform id / handle
verified: true                        # platform-verified? (true/false)
categories:                           # must match category slugs
  - lifestyle
  - ai-content
tags:
  - AI壁纸
  - 美学设计
contentStyle:
  - 极简视觉
monetization: e-commerce              # brand-deals|ads|courses|e-commerce|membership|tips|mixed|unknown
featured: true                        # show in homepage Featured
draft: false                          # true = never published (template / pending)
followerCount: 150000                 # raw integer; UI formats as 15万 / 150K
avgEngagement: 8500
contentFrequency: daily               # daily|weekly|biweekly|monthly|irregular
growthRate: 12.5                      # monthly growth %
publishedAt: "2026-06-20"
updatedAt: "2026-06-20"
name:
  zh: 灵感生成器
  en: InspirationGen
tagline:
  zh: 每天分享一套超高质量的AI壁纸与提示词
  en: Daily ultra-high-quality AI wallpapers and prompts
description:
  zh: 详细的中文账号描述……
  en: Detailed English description……
seo:
  primary_keyword: AI壁纸
  meta_description_zh: "……"
  meta_description_en: "……"
geo:
  answer_summary_zh: "……"
  answer_summary_en: "……"
  facts:
    - question: 该账号主要做什么？
      answer: ……
  faq:
    - question: 适合谁参考？
      answer: ……
---
```

Notes:
- `slug` is optional; when omitted the filename is used. Internally `slug` is a reserved field — the loader resolves it as `data.slug ?? entry.slug`.
- `draft: true` excludes the account from the build **and** the sitemap.
- Numbers are raw integers; `formatNumber()` localizes them (15万 / 150K).

---

## 5. Add a Category

`src/content/categories/<slug>.md`:

```yaml
---
slug: finance
icon: "📈"
name:
  zh: 财经商业
  en: Finance & Business
description:
  zh: 财经趋势、商业案例拆解。
  en: Economy, business case studies.
seo:
  meta_description_zh: "……"
  meta_description_en: "……"
geo:
  answer_summary_zh: "……"
  answer_summary_en: "……"
---
```

---

## 6. Add a Platform

`src/content/platforms/<slug>.md`:

```yaml
---
slug: tiktok
icon: "🎵"
name:
  zh: TikTok
  en: TikTok
description:
  zh: 字节跳动旗下的全球短视频平台。
  en: Global short-video platform by ByteDance.
baseUrl: https://www.tiktok.com
type: short-video        # short-video|video|image-text|social|knowledge
---
```

---

## 7. Homepage Feed Items (News & Guides)

These drive the homepage "Industry Trends" / "Creator Guides" blocks. They are **data-driven** from Markdown — no hard-coded headlines.

`src/content/news/<slug>.md`:

```yaml
---
slug: ai-content-largest
title:
  zh: AI 内容进入爆发期
  en: AI Content Enters Hypergrowth
url: "/categories/ai-content"         # real internal route
summary:
  zh: 简短摘要……
  en: Short summary……
order: 1                              # lower = higher
date: "2026-07-20"                    # optional
---
```

`src/content/guides/<slug>.md` uses the same shape **without** `date`.

> Rule: `url` must point to a real internal page (never a marketing or fictional link) to keep GEO/SEO credible.

---

## 8. Internationalization

Bilingual `en` / `zh` is built in. Every localized field is `{ en, zh }`. To add a language:

1. Edit `src/lib/i18n.ts`: add the code to `languages`, and add a full block in `dictionary` for both source and target languages.
2. Add the new key to every `{ en, zh }` frontmatter field across content.

The default language is `zh`; the root `/` redirects there.

---

## 9. SEO & GEO Fields

Every `account` and `category` supports optional `seo` and `geo`:

- `seo`: `primary_keyword`, `secondary_keywords`, `search_intent`, `title_zh/en`, `meta_description_zh/en` → traditional search engines. `meta_description_*` is used as the page `<meta name="description">`.
- `geo`: `answer_summary_zh/en`, `facts[]`, `faq[]` → generative engines (Perplexity, ChatGPT, Gemini). Rendered on detail pages.

`BaseLayout.astro` auto-injects canonical, Open Graph, and Twitter tags.

---

## 10. Content Source & Editing

`src/content/` is the **single source of truth** — Astro reads it directly at build time. You can edit it with any Markdown editor, or open the folder `D:\project\codex\toolify\src\content` directly in Obsidian as a "UI-backed database manager" (graph view, backlinks, search). See `OBSIDIAN_WORKFLOW.zh-CN.md`.

Daily workflow: edit `.md` files under `src/content` → `npm run build` (Zod blocks malformed data) → push to deploy. There is **no** `vault:seed` / `vault:sync` step.

---

## 11. Submit Page

`/zh/submit` (and `/en/submit`) opens the visitor's mail client to `aoobee@sina.com`. To support a server endpoint later, switch to hybrid rendering + an API route.

---

## 12. Deploy (GitHub + Vercel)

- Push to `main` on GitHub → Vercel auto-deploys.
- Build command: `npm run build`; output directory: `dist`.
- `astro.config.mjs` sets `site: https://www.limingdao.com`, so canonical URLs and the sitemap resolve to the production domain.

---

## 13. Analytics

`BaseLayout.astro` injects (with `is:inline`):
- Google Analytics 4 — `G-WJ8ZP9FSE9`
- Microsoft Clarity — `kn4x488ytp`

Both load on every page globally.

---

## 14. Sitemap & robots

- `@astrojs/sitemap` generates `sitemap-index.xml` (drafts are excluded automatically because they are never built as routes). `public/robots.txt` points to it.
- Verify: `https://www.limingdao.com/sitemap-index.xml`.

---

## 15. Homepage Sections

The `/zh` and `/en` home pages render, in order: hero search + stats, quick links (trending / fastest-growing / new / platform shortcuts / AI creators), Today's Picks, Featured Creators, Content Niches, Rankings (by followers / engagement / growth), Browse by Platform, All Niches, Creator Guides, Industry Trends, Services CTA, footer.

---

## 16. Common Commands

```bash
npm run dev          # local dev (hot reload)
npm run build        # production static build → dist/
npm run preview      # preview the build
```
