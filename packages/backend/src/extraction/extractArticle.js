import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

function extractJsonLd(document) {
  const scripts = [...document.querySelectorAll('script[type="application/ld+json"]')];
  for (const script of scripts) {
    try {
      const data = JSON.parse(script.textContent);
      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        const types = Array.isArray(item["@type"]) ? item["@type"] : [item["@type"]];
        if (types.some((type) => type && /article|newsarticle/i.test(type))) {
          return item;
        }
      }
    } catch {
      // malformed JSON-LD block, skip it
    }
  }
  return null;
}

function metaContent(document, selectors) {
  for (const selector of selectors) {
    const el = document.querySelector(selector);
    const content = el?.getAttribute?.("content") ?? el?.textContent;
    if (content) return content.trim();
  }
  return null;
}

export function extractArticle(html, url) {
  if (!html) {
    throw new Error("Cannot extract article: no HTML content available");
  }

  const dom = new JSDOM(html, { url });
  const { document } = dom.window;

  const jsonLd = extractJsonLd(document);
  const reader = new Readability(document.cloneNode(true));
  const parsed = reader.parse();

  const title =
    jsonLd?.headline ||
    parsed?.title ||
    metaContent(document, ['meta[property="og:title"]', "title"]) ||
    null;

  const author =
    (typeof jsonLd?.author === "string" ? jsonLd.author : jsonLd?.author?.name) ||
    metaContent(document, ['meta[name="author"]', 'meta[property="article:author"]']) ||
    null;

  const publishedRaw =
    jsonLd?.datePublished ||
    metaContent(document, ['meta[property="article:published_time"]', 'meta[name="date"]']) ||
    document.querySelector("time")?.getAttribute("datetime") ||
    null;
  const publishedDate = publishedRaw ? new Date(publishedRaw) : null;

  const sitename =
    metaContent(document, ['meta[property="og:site_name"]']) ||
    (typeof jsonLd?.publisher === "object" ? jsonLd.publisher?.name : null) ||
    null;

  const extractionMethod = jsonLd ? "readability+jsonld" : parsed ? "readability" : "meta-fallback";

  return {
    title,
    author,
    publishedDate: publishedDate && !Number.isNaN(publishedDate.getTime()) ? publishedDate : null,
    sitename,
    text: parsed?.textContent?.trim() || null,
    html: parsed?.content || null,
    excerpt: parsed?.excerpt || null,
    extractionMethod,
    extractedAt: new Date(),
  };
}
