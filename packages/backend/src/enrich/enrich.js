import { findByStatus, markEnriched, markEnrichFailed } from "../db/articleRepository.js";
import { STATUS } from "../shared/constants.js";
import { logger } from "../shared/logger.js";

// Extension point: replace the placeholder bodies below with real analysis,
// e.g. sending article.extraction.text to an LLM (see the claude-api skill)
// and parsing a structured JSON response for sentiment/entities/topics.

export async function summarize(article) {
  const text = article.extraction?.text || "";
  const summary = text ? `${text.slice(0, 200)}${text.length > 200 ? "…" : ""}` : null;
  return { summary, method: "stub-truncate" };
}

export async function analyzeSentiment(_article) {
  // TODO: replace with a real sentiment model / LLM call
  return { label: "unknown", score: null };
}

export async function extractEntities(_article) {
  // TODO: replace with a real NER model / LLM call
  return [];
}

export async function classifyTopics(_article) {
  // TODO: replace with a real topic classifier / LLM call
  return [];
}

export async function enrichArticle(article) {
  const [{ summary }, sentiment, entities, topics] = await Promise.all([
    summarize(article),
    analyzeSentiment(article),
    extractEntities(article),
    classifyTopics(article),
  ]);

  return {
    summary,
    sentiment,
    entities,
    topics,
    method: "stub-v1",
    enrichedAt: new Date(),
  };
}

export async function enrichPending({ limit = 0 } = {}) {
  const articles = await findByStatus([STATUS.EXTRACTED], { limit });

  const results = [];
  for (const article of articles) {
    try {
      const enrichment = await enrichArticle(article);
      await markEnriched(article.uuid, enrichment);
      results.push({ uuid: article.uuid, ok: true });
    } catch (err) {
      logger.warn({ err: err.message, uuid: article.uuid }, "Enrichment failed");
      await markEnrichFailed(article.uuid, err);
      results.push({ uuid: article.uuid, error: err.message });
    }
  }

  logger.info({ count: results.length }, "Enrichment stage complete");
  return results;
}
