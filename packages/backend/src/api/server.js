import express from "express";
import cors from "cors";
import { env } from "../config/env.js";
import { logger } from "../shared/logger.js";
import { getDb } from "../db/client.js";
import { articlesRouter, sourcesRouter } from "./routes/articles.js";
import { trendsRouter } from "./routes/trends.js";
import { pipelineRouter } from "./routes/pipeline.js";

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/api/health", async (req, res) => {
    try {
      const db = await getDb();
      await db.command({ ping: 1 });
      res.json({ ok: true, mongo: "connected" });
    } catch (err) {
      res.status(503).json({ ok: false, error: err.message });
    }
  });

  app.use("/api/articles", articlesRouter);
  app.use("/api/trends", trendsRouter);
  app.use("/api/sources", sourcesRouter);
  app.use("/api/pipeline", pipelineRouter);

  app.use((err, req, res, next) => {
    logger.error(err, "API error");
    res.status(500).json({ error: err.message });
  });

  return app;
}

export function startServer() {
  const app = createApp();
  return app.listen(env.apiPort, () => {
    logger.info(`API listening on http://localhost:${env.apiPort}`);
  });
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  startServer();
}
