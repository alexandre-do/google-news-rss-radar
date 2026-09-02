import { getDb } from "./client.js";
import { urlToUuid } from "../shared/hash.js";
import { STATUS, MAX_RETRY_COUNT } from "../shared/constants.js";

async function collection() {
  const db = await getDb();
  return db.collection("articles");
}

export async function upsertRssEntry(entry) {
  const col = await collection();
  const uuid = urlToUuid(entry.link);
  const now = new Date();

  await col.updateOne(
    { uuid },
    {
      $setOnInsert: {
        uuid,
        url: entry.link,
        status: STATUS.COLLECTED,
        error: null,
        retryCount: 0,
        createdAt: now,
      },
      $set: {
        rss: {
          title: entry.title ?? null,
          link: entry.link,
          guid: entry.guid ?? null,
          published: entry.published ?? null,
          publishedParsed: entry.publishedParsed ?? null,
          summary: entry.summary ?? null,
          source: entry.source ?? null,
          query: entry.query ?? null,
          keyword: entry.keyword ?? null,
          collectedAt: now,
        },
        updatedAt: now,
      },
    },
    { upsert: true }
  );

  return uuid;
}

export async function findByStatus(statuses, { limit = 0 } = {}) {
  const col = await collection();
  const cursor = col.find({ status: { $in: statuses } });
  if (limit) cursor.limit(limit);
  return cursor.toArray();
}

export async function findPendingOrRetryable(pendingStatus, failedStatus, { limit = 0, retryFailed = false } = {}) {
  const col = await collection();
  const query = retryFailed
    ? {
        $or: [
          { status: pendingStatus },
          { status: failedStatus, retryCount: { $lt: MAX_RETRY_COUNT } },
        ],
      }
    : { status: pendingStatus };
  const cursor = col.find(query);
  if (limit) cursor.limit(limit);
  return cursor.toArray();
}

export async function findByUuid(uuid) {
  const col = await collection();
  return col.findOne({ uuid });
}

export async function markDownloaded(uuid, download) {
  const col = await collection();
  await col.updateOne(
    { uuid },
    {
      $set: {
        download,
        status: STATUS.DOWNLOADED,
        error: null,
        updatedAt: new Date(),
      },
    }
  );
}

export async function markDownloadFailed(uuid, error) {
  const col = await collection();
  await col.updateOne(
    { uuid },
    {
      $set: {
        status: STATUS.DOWNLOAD_FAILED,
        error: { stage: "download", message: error.message, at: new Date() },
        updatedAt: new Date(),
      },
      $inc: { retryCount: 1 },
    }
  );
}

export async function markExtracted(uuid, extraction) {
  const col = await collection();
  await col.updateOne(
    { uuid },
    {
      $set: {
        extraction,
        status: STATUS.EXTRACTED,
        error: null,
        updatedAt: new Date(),
      },
    }
  );
}

export async function markExtractionFailed(uuid, error) {
  const col = await collection();
  await col.updateOne(
    { uuid },
    {
      $set: {
        status: STATUS.EXTRACTION_FAILED,
        error: { stage: "extract", message: error.message, at: new Date() },
        updatedAt: new Date(),
      },
      $inc: { retryCount: 1 },
    }
  );
}

export async function markEnriched(uuid, enrichment) {
  const col = await collection();
  await col.updateOne(
    { uuid },
    {
      $set: {
        enrichment,
        status: STATUS.ENRICHED,
        error: null,
        updatedAt: new Date(),
      },
    }
  );
}

export async function markEnrichFailed(uuid, error) {
  const col = await collection();
  await col.updateOne(
    { uuid },
    {
      $set: {
        status: STATUS.ENRICH_FAILED,
        error: { stage: "enrich", message: error.message, at: new Date() },
        updatedAt: new Date(),
      },
      $inc: { retryCount: 1 },
    }
  );
}

export async function searchArticles({ q, source, from, to, status, page = 1, pageSize = 20 } = {}) {
  const col = await collection();
  const filter = {};
  if (q) filter.$text = { $search: q };
  if (source) filter["rss.source.title"] = source;
  if (status) filter.status = status;
  if (from || to) {
    filter["extraction.publishedDate"] = {};
    if (from) filter["extraction.publishedDate"].$gte = new Date(from);
    if (to) filter["extraction.publishedDate"].$lte = new Date(to);
  }

  const size = Math.min(Number(pageSize) || 20, 100);
  const skip = (Math.max(Number(page) || 1, 1) - 1) * size;

  const sort = q ? { score: { $meta: "textScore" } } : { "extraction.publishedDate": -1 };
  const projection = {
    "download.html": 0,
    "extraction.html": 0,
    ...(q ? { score: { $meta: "textScore" } } : {}),
  };

  const cursor = col
    .find(filter, { projection })
    .sort(sort)
    .skip(skip)
    .limit(size);

  const [items, total] = await Promise.all([cursor.toArray(), col.countDocuments(filter)]);
  return { items, total, page: Number(page) || 1, pageSize: size };
}

export async function deleteAllArticles() {
  const col = await collection();
  const { deletedCount } = await col.deleteMany({});
  return deletedCount;
}

export async function distinctSources() {
  const col = await collection();
  const sources = await col.distinct("rss.source.title");
  return sources.filter(Boolean);
}

export async function trendsByDay({ from, to, source } = {}) {
  const col = await collection();
  const match = { "extraction.publishedDate": { $ne: null } };
  if (source) match["rss.source.title"] = source;
  if (from || to) {
    match["extraction.publishedDate"] = { $ne: null };
    if (from) match["extraction.publishedDate"].$gte = new Date(from);
    if (to) match["extraction.publishedDate"].$lte = new Date(to);
  }

  return col
    .aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$extraction.publishedDate" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: "$_id", count: 1 } },
    ])
    .toArray();
}

export async function trendsBySource({ from, to } = {}) {
  const col = await collection();
  const match = {};
  if (from || to) {
    match["extraction.publishedDate"] = {};
    if (from) match["extraction.publishedDate"].$gte = new Date(from);
    if (to) match["extraction.publishedDate"].$lte = new Date(to);
  }

  return col
    .aggregate([
      { $match: match },
      { $group: { _id: "$rss.source.title", count: { $sum: 1 } } },
      { $match: { _id: { $ne: null } } },
      { $sort: { count: -1 } },
      { $project: { _id: 0, source: "$_id", count: 1 } },
    ])
    .toArray();
}
