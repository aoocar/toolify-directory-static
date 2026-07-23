# Upgrade Guide — Dawn Island (黎明岛)

This document is for developers. It explains the underlying architecture of the Dawn Island creator directory and how to evolve it from the current static Markdown model toward a database / dynamic model — without breaking public URLs or SEO.

---

## 1. Architecture & Stable Interfaces

The site follows a **"swappable data source, stable interface"** design. Pages and components never read Markdown directly — they call async getters in `src/lib/directory.ts`. To upgrade the backend, keep these function signatures unchanged so the page layer keeps working.

### Accounts
- `getAccounts()`
- `getAccountBySlug(slug)`
- `getAccountsByCategory(categorySlug)`
- `getAccountsByPlatform(platformSlug)`
- `getFeaturedAccounts()`
- `getLatestAccounts(limit?)`
- `getRankedAccounts(sortBy, limit?)` — `sortBy: "followers" | "engagement" | "growth"`
- `getFastGrowingAccounts(limit?)`

### Categories / Platforms
- `getCategories()`, `getCategoryBySlug(slug)`, `getCategoryCounts()`
- `getPlatforms()`, `getPlatformBySlug(slug)`, `getPlatformCounts()`

### Homepage feed
- `getNews(lang)`, `getGuides(lang)` — return `{ title, url, summary?, date? }[]`

### Utilities
- `formatNumber(value, lang)` — localized big-number formatting (万 / K)

---

## 2. Tech Stack

- Astro 5 (`output: "static"`, `trailingSlash: "never"`)
- TypeScript, plain `.astro` components, single `global.css`
- Content Collections + Zod (`src/content.config.ts`)
- `@astrojs/sitemap`
- No frontend framework, no backend — a pure GEO/SEO static site

---

## 3. Routing

- `/[lang]` — home
- `/[lang]/accounts`, `/[lang]/accounts/[slug]`
- `/[lang]/platforms`, `/[lang]/platforms/[slug]`
- `/[lang]/categories`, `/[lang]/categories/[slug]`
- `/[lang]/rankings`, `/[lang]/new`, `/[lang]/services`, `/[lang]/submit`, `/[lang]/contact`
- `/` redirects to the default language (`zh`)

---

## 4. Upgrade Roadmap

### Phase 1 — 0 to ~1,000 accounts (current): Markdown + static search
- Keep editing Markdown; add **Pagefind** for client-side full-text search (no backend).
- Keep category/platform slugs stable.
- Add SEO descriptions to every category.
- Homepage items live in the `news` / `guides` collections (already done).
- Sitemap + robots (done) and analytics (GA + Clarity, done) are in place.

### Phase 2 — 1,000 to 5,000 accounts: externalized data + auto build
- Store data in Airtable / Notion / a lightweight CMS or crawler output.
- Generate files into `src/content/*`, **or** change the loader inside `directory.ts`.
- Keep the `directory.ts` function names; add build-time validation.

### Phase 3 — 5,000+ accounts: database-backed
- Use **Supabase / PostgreSQL** for dynamic metrics (follower counts, daily engagement).
- Switch `output` to `hybrid` or `server` in `astro.config.mjs`.
- Rewrite the getters in `directory.ts` to query the DB; pages/components stay unchanged.

### Phase 4 — commercial features (only after the content engine works)
- Submission workflow + approval queue (the `/submit` mailto can become an API route)
- Sponsored placements, newsletter capture, comparison / alternative / best-of SEO pages
  (e.g. `/zh/best-ai-writing-creators`, `/zh/alternatives/<account>`, `/zh/compare/a-vs-b`)

### Phase 5 — international expansion
- English + Chinese first, then Japanese / Spanish, then language-specific landing & category pages.
- Keep slugs in English for SEO stability.

---

## 5. Content Schema Changes

Schemas live in `src/content.config.ts` and are validated at build time. When adding a field:

1. Extend the relevant Zod schema (`accounts` / `categories` / `platforms` / `news` / `guides`).
2. Update the matching TypeScript types in `src/lib/types.ts`.
3. Update `directory.ts` mapping if the field affects relations or formatting.
4. Add UI rendering where needed.

> **Gotcha — reserved `slug`:** `slug` is a reserved field in content collections. The loader resolves it as `e.data.slug ?? e.slug`; never assume `data.slug` is populated.

---

## 6. Data Layer Changes

All reads go through `directory.ts` `load()` (a cached `getCollection()` call). To migrate data sources, replace only the internals of `load()` — keep the exported getter signatures. This preserves every page and all SEO URLs.

---

## 7. SEO / GEO

- `seo` → traditional search (keywords, titles, meta description). `meta_description_*` feeds the page `<meta name="description">`.
- `geo` → generative engines (`answer_summary`, `facts`, `faq`), rendered on detail pages.
- `BaseLayout.astro` auto-injects canonical + Open Graph + Twitter tags.

---

## 8. Known Gotchas

- `slug` reserved field (see §5).
- `draft: true` accounts are filtered in `load()` and therefore excluded from routes **and** the sitemap automatically.
- Sitemap / robots require `site` in `astro.config.mjs` to be the production domain (`https://www.limingdao.com`).

---

## 9. Monitoring

GA4 (`G-WJ8ZP9FSE9`) and Clarity (`kn4x488ytp`) are injected in `BaseLayout.astro` with `is:inline`. They run on every page globally.

---

## 10. Deploy Pipeline

GitHub `main` → Vercel auto-deploy. `npm run build` → `dist`. Keep `site` correct in `astro.config.mjs` for absolute URLs and sitemap.
