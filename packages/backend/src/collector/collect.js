import { buildQueries, fetchFeed } from "./googleNewsRss.js";
import { upsertRssEntry } from "../db/articleRepository.js";
import { logger } from "../shared/logger.js";
import { DEFAULT_TIME_DELTA_DAYS } from "../shared/constants.js";

export async function collect(keywords, dateFrom, dateTo, { timeDelta = DEFAULT_TIME_DELTA_DAYS } = {}) {
  const queries = buildQueries(keywords, dateFrom, dateTo, timeDelta);
  let total = 0;

  for (const { url } of queries) {
    logger.info({ url }, "Fetching Google News RSS feed");
    const entries = await fetchFeed(url);
    for (const entry of entries) {
      if (!entry.link) continue;
      await upsertRssEntry({ ...entry, keyword: keywords });
      total += 1;
    }
  }

  logger.info({ keywords, dateFrom, dateTo, total }, "Collect stage complete");
  return total;
}

export async function collectBatch(lines, { timeDelta = DEFAULT_TIME_DELTA_DAYS } = {}) {
  const unique = [
    ...new Set(
      lines.map((line) => line.trim()).filter((line) => line && !line.startsWith("#"))
    ),
  ];
  let total = 0;

  for (const line of unique) {
    const [keywords, dateFrom, dateTo] = line.split(";").map((part) => part?.trim());
    if (!keywords || !dateFrom || !dateTo) {
      logger.warn({ line }, "Skipping malformed collect-batch line");
      continue;
    }
    total += await collect(keywords, dateFrom, dateTo, { timeDelta });
  }

  return total;
}
