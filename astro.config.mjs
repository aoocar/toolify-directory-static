import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { readFile, readdir } from "node:fs/promises";
import yaml from "js-yaml";

/**
 * Truthful sitemap lastmod.
 *
 * Instead of stamping "now" on every URL at build time (which told crawlers
 * the whole site changes daily), each URL gets the last time its content was
 * actually modified:
 *   - account pages   → the account's `updatedAt` (fallback publishedAt)
 *   - guide pages     → the guide's `updated` (fallback date)
 *   - category/platform/list/home pages → the most recent `updatedAt` among
 *     the accounts they aggregate (so they only "change" when something in
 *     them really changed)
 *   - static pages (contact/services/privacy/submit…) → no lastmod at all
 */
const fmCache = new Map();

async function readFrontmatter(file) {
  if (fmCache.has(file)) return fmCache.get(file);
  let data = {};
  try {
    const text = await readFile(file, "utf8");
    const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (m) data = yaml.load(m[1]) || {};
  } catch {
    /* file missing → empty frontmatter */
  }
  fmCache.set(file, data);
  return data;
}

let accountsMetaPromise;

function getAccountsMeta() {
  if (!accountsMetaPromise) {
    accountsMetaPromise = (async () => {
      const files = await readdir("src/content/accounts");
      const metas = [];
      for (const f of files) {
        if (!f.endsWith(".md")) continue;
        const slug = f.replace(/\.md$/, "");
        const data = await readFrontmatter(`src/content/accounts/${f}`);
        metas.push({ slug, data });
      }
      return metas;
    })();
  }
  return accountsMetaPromise;
}

async function resolveLastmod(urlStr) {
  const path = new URL(urlStr).pathname;
  const segs = path.split("/").filter(Boolean);
  // e.g. /zh, /en/accounts/3blue1brown, /en/guides/ai-learning-path
  if (segs.length < 2) return undefined; // homepage handled by the aggregate path below
  const [lang, first, second] = segs;

  // Account detail pages → the account's own updatedAt.
  if (first === "accounts" && second) {
    const data = await readFrontmatter(`src/content/accounts/${second}.md`);
    return data.updatedAt || data.publishedAt;
  }

  // Guide pages → the guide's own updated / date.
  if (first === "guides" && second) {
    const data = await readFrontmatter(`src/content/guides/${lang}/${second}.md`);
    return data.updated || data.date;
  }

  // Static, hand-maintained pages (contact/services/privacy/submit/new/rankings…)
  // have no content-driven update time — leave them without a lastmod so
  // crawlers don't treat them as freshly-changed every build.
  // Tools (legacy bookmark migration) also have no content timestamps — the
  // whole set was imported in one batch, so stamping "now" or the newest
  // account date on all 1062 pages would be equally misleading.
  if (["contact", "services", "privacy", "submit", "new", "rankings", "tools"].includes(first)) {
    return undefined;
  }

  // Aggregate pages (home, category, platform, list pages) → the most recent
  // real content change among the accounts they surface.
  const metas = await getAccountsMeta();
  let pool = metas;
  if (first === "categories" && second) {
    pool = metas.filter((m) => (m.data.categories || []).includes(second));
  } else if (first === "platforms" && second) {
    pool = metas.filter((m) => m.data.platform === second);
  }
  const lastmod = pool
    .map((m) => m.data.updatedAt || m.data.publishedAt)
    .filter(Boolean)
    .sort()
    .pop();
  return lastmod;
}

export default defineConfig({
  site: "https://www.limingdao.com",
  output: "static",
  trailingSlash: "never",
  integrations: [
    sitemap({
      // draft accounts are already filtered out of the build, so they never
      // appear as routes and are excluded from the sitemap automatically.
      changefreq: "weekly",
      priority: 0.7,
      // keep the external-link interstitial (/exit) out of the sitemap;
      // exclude the bare root URL — it 308-redirects to /zh (see vercel.json),
      // and sitemap URLs must resolve to 200, not redirects.
      filter: (page) => {
        const u = new URL(page);
        const isRoot = u.pathname === "/";
        return !page.includes("/exit") && !isRoot;
      },
      // truthful lastmod: real content update time, not build time (see above)
      serialize: async (item) => {
        const lastmod = await resolveLastmod(item.url);
        if (!lastmod) return { ...item, lastmod: undefined };
        return { ...item, lastmod };
      }
    })
  ]
});
