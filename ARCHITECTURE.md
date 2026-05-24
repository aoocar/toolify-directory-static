# Architecture

## Goal

This project starts as a static Astro + Markdown directory and leaves a clean path to a larger database-backed architecture later.

## Stable contracts

Keep these contracts stable:

- URL shape:
  - `/:lang`
  - `/:lang/tools`
  - `/:lang/tools/:slug`
  - `/:lang/categories`
  - `/:lang/categories/:slug`
  - `/:lang/rankings`
  - `/:lang/new`
  - `/:lang/submit`
- Public data API in `src/lib/directory.ts`:
  - `getTools()`
  - `getToolBySlug(slug)`
  - `getCategories()`
  - `getCategoryBySlug(slug)`
  - `getToolsByCategory(categorySlug)`
  - `getFeaturedTools()`
  - `getLatestTools(limit?)`
  - `getRankedTools(limit?)`
- Shared types in `src/lib/types.ts`.
- Language list and dictionary in `src/lib/i18n.ts`.

## Current data source

Markdown files:

- `src/content/tools/*.md`
- `src/content/categories/*.md`

Each Markdown file stores frontmatter only for now. Body content can be added later for long-form reviews or SEO descriptions.

## Home page composition

The home page intentionally follows a dense directory pattern rather than a marketing landing page:

- Sponsor strip: `src/layouts/BaseLayout.astro`
- Hero search and statistics: `src/pages/[lang]/index.astro`
- Shortcut navigation: `quickLinks`
- Daily feed: `getLatestTools()`
- Sponsored feed insertion: static placeholder card
- Ranking rail: `getRankedTools()`
- Prompt tag cloud: static seed list
- AI news and guide panels: static seed lists, ready to become content collections later
- Category index: `getCategoryCounts()`

When this grows, news, guides, prompts, and sponsors should become their own content collections or database tables.

## Migration path

When the catalog grows, replace the internals of `src/lib/directory.ts`:

1. 100-1,000 tools:
   Keep Markdown. Add Pagefind for static search.

2. 1,000-5,000 tools:
   Move tool data to generated JSON, keep Astro static pages, add build caching.

3. 5,000+ tools:
   Move data to PostgreSQL or Supabase. Use Meilisearch, Typesense, or Algolia for search. Keep route shape and page components.

4. Dynamic operations:
   Submit form, sponsor placements, analytics, and admin review should become API-backed modules. Public listing pages can remain static or use hybrid rendering.

## Adding languages

1. Add the language code to `languages` in `src/lib/i18n.ts`.
2. Add dictionary entries for the new language.
3. Add localized `name`, `tagline`, and `description` fields in Markdown frontmatter.
4. Existing dynamic routes will generate the new language.
