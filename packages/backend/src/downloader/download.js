import pLimit from "p-limit";
import { fetchHttp, isContentSufficient } from "./httpFetcher.js";
import { fetchBrowser, closeBrowser } from "./browserFetcher.js";
import { findPendingOrRetryable, markDownloaded, markDownloadFailed } from "../db/articleRepository.js";
import { STATUS, DEFAULT_DOWNLOAD_CONCURRENCY } from "../shared/constants.js";
import { logger } from "../shared/logger.js";

async function downloadOne(article) {
  const { uuid, url } = article;
  try {
    const httpResult = await fetchHttp(url);
    if (isContentSufficient(httpResult.html)) {
      await markDownloaded(uuid, {
        html: httpResult.html,
        method: "http",
        httpStatus: httpResult.status,
        downloadedAt: new Date(),
      });
      return { uuid, method: "http" };
    }

    const browserResult = await fetchBrowser(url);
    await markDownloaded(uuid, {
      html: browserResult.html,
      method: "browser",
      httpStatus: browserResult.status,
      downloadedAt: new Date(),
    });
    return { uuid, method: "browser" };
  } catch (err) {
    logger.warn({ err: err.message, url }, "Download failed");
    await markDownloadFailed(uuid, err);
    return { uuid, error: err.message };
  }
}

export async function downloadPending({
  limit = 0,
  concurrency = DEFAULT_DOWNLOAD_CONCURRENCY,
  retryFailed = false,
} = {}) {
  const articles = await findPendingOrRetryable(STATUS.COLLECTED, STATUS.DOWNLOAD_FAILED, {
    limit,
    retryFailed,
  });
  const limiter = pLimit(concurrency);

  const results = await Promise.all(articles.map((article) => limiter(() => downloadOne(article))));
  await closeBrowser();

  logger.info({ count: results.length }, "Download stage complete");
  return results;
}
