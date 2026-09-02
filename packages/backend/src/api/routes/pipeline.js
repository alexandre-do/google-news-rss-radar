import { Router } from "express";
import { collect } from "../../collector/collect.js";
import { downloadPending } from "../../downloader/download.js";
import { extractPending } from "../../extraction/extract.js";
import { enrichPending } from "../../enrich/enrich.js";
import { deleteAllArticles } from "../../db/articleRepository.js";
import { DEFAULT_TIME_DELTA_DAYS, DEFAULT_DOWNLOAD_CONCURRENCY } from "../../shared/constants.js";

export const pipelineRouter = Router();

// Runs the "collect" stage: searches Google News RSS for a keyword/date
// range and stores matching entries in Mongo (status: collected).
pipelineRouter.post("/collect", async (req, res, next) => {
  try {
    const { keywords, dateFrom, dateTo, timeDelta } = req.body || {};
    if (!keywords || !dateFrom || !dateTo) {
      return res.status(400).json({ error: "keywords, dateFrom and dateTo are required" });
    }

    const collected = await collect(keywords, dateFrom, dateTo, {
      timeDelta: timeDelta ? Number(timeDelta) : DEFAULT_TIME_DELTA_DAYS,
    });

    res.json({ collected });
  } catch (err) {
    next(err);
  }
});

// Runs download -> extract -> enrich in sequence for pending articles, so
// downloaded HTML is turned into extracted text and the NER service has
// real content to work with instead of empty enrichment.entities.
//
// This can take a while (real HTTP/browser fetches per article), so it runs
// as a background job the client polls via GET /download/status instead of
// blocking the request — that's what lets the frontend show a progress bar.
function freshDownloadJob() {
  return {
    status: "idle",
    stage: null,
    current: 0,
    total: 0,
    results: { downloaded: 0, extracted: 0, enriched: 0 },
    error: null,
  };
}

let downloadJob = freshDownloadJob();

pipelineRouter.post("/download", (req, res) => {
  if (downloadJob.status === "running") {
    return res.status(409).json({ error: "A download job is already running" });
  }

  const { limit, concurrency, retryFailed } = req.body || {};
  const stageLimit = limit ? Number(limit) : 0;

  downloadJob = { ...freshDownloadJob(), status: "running" };
  res.status(202).json({ started: true });

  function enterStage(stage) {
    downloadJob.stage = stage;
    downloadJob.current = 0;
    downloadJob.total = 0;
  }

  (async () => {
    try {
      enterStage("download");
      const downloaded = await downloadPending({
        limit: stageLimit,
        concurrency: concurrency ? Number(concurrency) : DEFAULT_DOWNLOAD_CONCURRENCY,
        retryFailed: Boolean(retryFailed),
        onProgress: (current, total) => {
          downloadJob.current = current;
          downloadJob.total = total;
        },
      });
      downloadJob.results.downloaded = downloaded.length;

      enterStage("extract");
      const extracted = await extractPending({
        limit: stageLimit,
        retryFailed: Boolean(retryFailed),
        onProgress: (current, total) => {
          downloadJob.current = current;
          downloadJob.total = total;
        },
      });
      downloadJob.results.extracted = extracted.length;

      enterStage("enrich");
      const enriched = await enrichPending({
        limit: stageLimit,
        onProgress: (current, total) => {
          downloadJob.current = current;
          downloadJob.total = total;
        },
      });
      downloadJob.results.enriched = enriched.length;

      downloadJob.status = "done";
      downloadJob.stage = null;
    } catch (err) {
      downloadJob.status = "error";
      downloadJob.error = err.message;
    }
  })();
});

pipelineRouter.get("/download/status", (req, res) => {
  res.json(downloadJob);
});

// Deletes every article document, resetting the app back to empty.
// Requires an explicit confirm phrase so a stray POST can't wipe the data.
pipelineRouter.post("/reset", async (req, res, next) => {
  try {
    const { confirm } = req.body || {};
    if (confirm !== "RESET") {
      return res.status(400).json({ error: 'confirm must be the string "RESET"' });
    }

    const deleted = await deleteAllArticles();
    res.json({ deleted });
  } catch (err) {
    next(err);
  }
});
