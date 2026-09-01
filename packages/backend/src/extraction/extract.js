import { findPendingOrRetryable, markExtracted, markExtractionFailed } from "../db/articleRepository.js";
import { extractArticle } from "./extractArticle.js";
import { STATUS } from "../shared/constants.js";
import { logger } from "../shared/logger.js";

export async function extractPending({ limit = 0, retryFailed = false } = {}) {
  const articles = await findPendingOrRetryable(STATUS.DOWNLOADED, STATUS.EXTRACTION_FAILED, {
    limit,
    retryFailed,
  });

  const results = [];
  for (const article of articles) {
    try {
      const extraction = extractArticle(article.download?.html, article.url);
      await markExtracted(article.uuid, extraction);
      results.push({ uuid: article.uuid, ok: true });
    } catch (err) {
      logger.warn({ err: err.message, url: article.url }, "Extraction failed");
      await markExtractionFailed(article.uuid, err);
      results.push({ uuid: article.uuid, error: err.message });
    }
  }

  logger.info({ count: results.length }, "Extraction stage complete");
  return results;
}
