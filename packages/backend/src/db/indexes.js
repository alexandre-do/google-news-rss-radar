import { getDb, closeDb } from "./client.js";
import { logger } from "../shared/logger.js";

export async function createIndexes() {
  const db = await getDb();
  const articles = db.collection("articles");

  await articles.createIndex({ uuid: 1 }, { unique: true, name: "uuid_unique" });
  await articles.createIndex({ status: 1 }, { name: "status_idx" });
  await articles.createIndex(
    { "extraction.publishedDate": -1, "rss.source.title": 1 },
    { name: "publishedDate_source_idx" }
  );
  await articles.createIndex(
    {
      "rss.title": "text",
      "rss.summary": "text",
      "extraction.title": "text",
      "extraction.text": "text",
    },
    { name: "articles_text_idx" }
  );

  logger.info("Indexes created on articles collection");
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  createIndexes()
    .then(() => closeDb())
    .catch((err) => {
      logger.error(err, "Failed to create indexes");
      process.exitCode = 1;
    });
}
