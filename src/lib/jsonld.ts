import type { Lang } from "@/lib/i18n";
import type { GeoFields } from "@/lib/types";

/**
 * Build a schema.org FAQPage object from a guide / account / category geo.faq
 * list. Each faq entry is a single-key record { question: answer }.
 * Returns null when there are no usable Q&A pairs so callers can skip rendering
 * (emitting an empty FAQPage is invalid and would hurt, not help, GEO).
 */
export function faqJsonLd(
  faq: GeoFields["faq"],
  lang: Lang
): Record<string, unknown> | null {
  if (!faq || faq.length === 0) return null;

  const questions = faq
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

  if (questions.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: lang === "zh" ? "zh-CN" : "en",
    mainEntity: questions
  };
}

/**
 * schema.org Article block for guide detail pages. Emitted alongside the
 * standalone FAQPage (the guide page already renders that) — an Article with
 * headline / dates / author helps GEO and rich-result eligibility without
 * duplicating the Q&A graph.
 */
export function articleJsonLd(opts: {
  title: string;
  description: string;
  datePublished?: string;
  dateModified?: string;
  url: string;
  brand: string;
  lang: Lang;
}): Record<string, unknown> {
  return {
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
}

/**
 * schema.org Person block for account detail pages. `sameAs` points at the
 * creator's external profile so AI crawlers can tie the directory entry to the
 * real person/channel — a direct GEO signal.
 */
export function personJsonLd(opts: {
  name: string;
  description: string;
  url: string;
  brand: string;
  profileUrl?: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: opts.name,
    description: opts.description,
    url: opts.url,
    mainEntityOfPage: { "@type": "WebPage", "@id": opts.url },
    ...(opts.profileUrl ? { sameAs: [opts.profileUrl] } : {})
  };
}
