# Upgrade Guide

## Phase 1: Current Static Version

Use this phase while the site is small and editorially managed.

```text
Data: Markdown
Rendering: Astro static build
Search: simple page search or Pagefind
Hosting: Cloudflare Pages, Vercel, Netlify, GitHub Pages
```

Recommended tasks:

- Add real tools and categories.
- Keep category slugs stable.
- Add SEO descriptions to every category.
- Turn the seeded AI news, guides, prompt tags, and sponsor cards into Markdown collections once they need frequent updates.
- Add sitemap and RSS when content volume grows.
- Add Pagefind once tool count is above 100.

## Phase 2: Generated Data

Use this phase when manual Markdown becomes too slow but static pages are still enough.

```text
Data: CSV, Airtable, Notion, CMS, or crawler output
Build step: generate JSON/Markdown
Rendering: Astro static build
Search: Pagefind, Meilisearch, Typesense, or Algolia
```

Migration approach:

1. Keep existing routes.
2. Generate files into `src/content/tools`.
3. Keep using `src/lib/directory.ts`.
4. Add validation before build.

## Phase 3: Database-Backed Directory

Use this phase when there are thousands of tools, frequent updates, submissions, paid placements, or advanced filtering.

```text
Data: PostgreSQL or Supabase
Search: Meilisearch, Typesense, or Algolia
Rendering: static + server/hybrid rendering
Admin: Directus, Strapi, custom admin, or Supabase Studio
```

Replace the internals of:

```text
src/lib/directory.ts
```

Keep the function names the same:

- `getTools()`
- `getToolBySlug(slug)`
- `getCategories()`
- `getCategoryBySlug(slug)`
- `getToolsByCategory(categorySlug)`
- `getFeaturedTools()`
- `getLatestTools(limit?)`
- `getRankedTools(limit?)`

This preserves the page layer.

## Phase 4: Commercial Features

Add these only after the content engine is working:

- Tool submission workflow
- Admin approval queue
- Sponsored placements in the top strip, daily feed, category pages, and tool detail pages
- Newsletter capture
- Traffic analytics
- Tool comparison pages
- Alternative pages, such as `/alternatives/chatgpt`
- Best-of SEO pages, such as `/best-ai-writing-tools`

## Phase 5: International Expansion

Recommended language rollout:

```text
English + Chinese first
Japanese or Spanish next
Then language-specific landing/category pages
```

Keep slugs in English for SEO stability unless a language-specific domain strategy is planned.
