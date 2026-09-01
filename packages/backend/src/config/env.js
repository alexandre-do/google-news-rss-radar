import "dotenv/config";

export const env = {
  mongoUri: process.env.MONGODB_URI || "mongodb://localhost:27017",
  mongoDb: process.env.MONGODB_DB || "scraping",
  apiPort: Number(process.env.API_PORT || 4000),
  downloadConcurrency: Number(process.env.DOWNLOAD_CONCURRENCY || 4),
  nerServiceUrl: process.env.NER_SERVICE_URL || "http://localhost:8001",
};
