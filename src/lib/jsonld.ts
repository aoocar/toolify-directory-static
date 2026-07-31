import type { Lang } from "@/lib/i18n";
import type { GeoFields } from "@/lib/types";

/** Build the list of schema.org Question objects from a geo.faq entry set. */
function buildFaqQuestions(
  faq: GeoFields["faq"],
  lang: Lang
): Record<string, unknown>[] {
  if (!faq || faq.length === 0) return [];
  return faq
    .map((item) => Object.entries(item)[0])
    .filter((pair): pair is [string, string] => Array.isArray(pair))
    .map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: answer
      }
    }));
}

/**
 * Standalone schema.org FAQPage. Returns null when there are no usable Q&A
 * pairs so callers can skip rendering (an empty FAQPage is invalid and would
 * hurt, not help, GEO).
 */
export function faqJsonLd(
  faq: GeoFields["faq"],
  lang: Lang
): Record<string, unknown> | null {
  const questions = buildFaqQuestions(faq, lang);
  if (questions.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: lang === "zh" ? "zh-CN" : "en",
    mainEntity: questions
  };
}

/**
 * schema.org Article for guide detail pages. When a `faq` is supplied, the
 * FAQPage graph is embedded as the Article's `mainEntity` — the recommended
 * single-block pattern for guides that answer questions, so the page emits one
 * Article graph instead of a separate FAQPage + Article.
 */
export function articleJsonLd(opts: {
  title: string;
  description: string;
  datePublished?: string;
  dateModified?: string;
  url: string;
  brand: string;
  lang: Lang;
  faq?: GeoFields["faq"];
}): Record<string, unknown> {
  const article: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.title,
    description: opts.description,
    inLanguage: opts.lang === "zh" ? "zh-CN" : "en",
    datePublished: opts.datePublished,
    dateModified: opts.dateModified || opts.datePublished,
    author: { "@type": "Organization", name: opts.brand },
    publisher: {
      "@type": "Organization",
      name: opts.brand,
      url: "https://www.limingdao.com"
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": opts.url }
  };

  const questions = buildFaqQuestions(opts.faq ?? [], opts.lang);
  if (questions.length > 0) {
    article.mainEntity = {
      "@type": "FAQPage",
      inLanguage: opts.lang === "zh" ? "zh-CN" : "en",
      mainEntity: questions
    };
  }

  return article;
}

/**
 * schema.org Person for account detail pages. `sameAs` points at the
 * creator's external profile so AI crawlers can tie the directory entry to the
 * real person/channel — a direct GEO signal. `knowsAbout` (topics the creator
 * covers) and `jobTitle` add topical authority that AI citations can use.
 */
export function personJsonLd(opts: {
  name: string;
  description: string;
  url: string;
  brand: string;
  profileUrl?: string;
  knowsAbout?: string[];
  jobTitle?: string;
}): Record<string, unknown> {
  const person: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: opts.name,
    description: opts.description,
    url: opts.url,
    mainEntityOfPage: { "@type": "WebPage", "@id": opts.url }
  };
  if (opts.knowsAbout && opts.knowsAbout.length > 0) {
    person.knowsAbout = opts.knowsAbout;
  }
  if (opts.jobTitle) {
    person.jobTitle = opts.jobTitle;
  }
  if (opts.profileUrl) {
    person.sameAs = [opts.profileUrl];
  }
  return person;
}

/**
 * schema.org CollectionPage for category detail pages. `mainEntity` is an
 * ItemList of the accounts listed on the page, helping crawlers understand the
 * page as a curated collection rather than a loose list.
 */
export function collectionPageJsonLd(opts: {
  name: string;
  description: string;
  url: string;
  lang: Lang;
  items: { name: string; url: string }[];
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: opts.name,
    description: opts.description,
    url: opts.url,
    inLanguage: opts.lang === "zh" ? "zh-CN" : "en",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: opts.items.length,
      itemListElement: opts.items.map((it, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: it.name,
        url: it.url
      }))
    }
  };
}

/**
 * schema.org WebSite for the homepage. The SearchAction was intentionally
 * dropped: the directory is a static site with no client-side filtering, so the
 * declared search endpoint could not actually answer queries — keeping a
 * non-functional SearchAction would be a false structured-data claim.
 */
export function websiteJsonLd(opts: {
  name: string;
  lang: Lang;
  url: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: opts.name,
    url: opts.url,
    inLanguage: opts.lang === "zh" ? "zh-CN" : "en"
  };
}
