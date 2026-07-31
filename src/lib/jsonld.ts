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
