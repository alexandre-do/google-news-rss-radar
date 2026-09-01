import Parser from "rss-parser";
import { addDays, differenceInCalendarDays, format, isBefore, parseISO } from "date-fns";
import {
  GOOGLE_NEWS_RSS_BASE_URL,
  DEFAULT_LANG,
  DEFAULT_COUNTRY,
  DEFAULT_TIME_DELTA_DAYS,
} from "../shared/constants.js";

const parser = new Parser({
  customFields: {
    item: [["source", "source", { keepArray: false }]],
  },
});

function ceid(lang, country) {
  return `ceid=${country}:${lang}&hl=${lang}&gl=${country}`;
}

export function splitDateRange(dateFrom, dateTo, timeDeltaDays = DEFAULT_TIME_DELTA_DAYS) {
  const start = parseISO(dateFrom);
  const end = parseISO(dateTo);
  if (differenceInCalendarDays(end, start) <= 0) {
    return [{ from: dateFrom, to: dateTo }];
  }

  const chunks = [];
  let chunkStart = start;
  while (isBefore(chunkStart, end)) {
    const tentativeEnd = addDays(chunkStart, timeDeltaDays);
    const chunkEnd = isBefore(end, tentativeEnd) ? end : tentativeEnd;
    chunks.push({
      from: format(chunkStart, "yyyy-MM-dd"),
      to: format(chunkEnd, "yyyy-MM-dd"),
    });
    chunkStart = chunkEnd;
  }
  return chunks;
}

export function buildQuery(keywords, { from, to } = {}, { lang = DEFAULT_LANG, country = DEFAULT_COUNTRY } = {}) {
  let query = keywords;
  if (from) query += ` after:${from}`;
  if (to) query += ` before:${to}`;
  const encoded = encodeURIComponent(query).replace(/%20/g, "+");
  return `${GOOGLE_NEWS_RSS_BASE_URL}/search?q=${encoded}&${ceid(lang, country)}`;
}

export function buildQueries(keywords, dateFrom, dateTo, timeDeltaDays = DEFAULT_TIME_DELTA_DAYS) {
  return splitDateRange(dateFrom, dateTo, timeDeltaDays).map((chunk) => ({
    url: buildQuery(keywords, chunk),
    ...chunk,
  }));
}

export async function fetchFeed(url) {
  const feed = await parser.parseURL(url);
  return (feed.items || []).map((item) => ({
    title: item.title ?? null,
    link: item.link ?? null,
    guid: item.guid ?? item.id ?? null,
    published: item.pubDate ?? null,
    publishedParsed: item.pubDate ? new Date(item.pubDate) : null,
    summary: item.contentSnippet ?? item.content ?? null,
    source: item.source
      ? { title: item.source._ ?? String(item.source), url: item.source?.$?.url ?? null }
      : null,
    query: url,
  }));
}
