import { downloadPending } from "../../downloader/download.js";
import { closeDb } from "../../db/client.js";
import { DEFAULT_DOWNLOAD_CONCURRENCY } from "../../shared/constants.js";

export function registerDownloadCommand(program) {
  program
    .command("download")
    .description("Download HTML for collected articles (Cheerio fast path, Playwright fallback)")
    .option("--limit <n>", "max articles to process (0 = no limit)", "0")
    .option("--concurrency <n>", "concurrent downloads", String(DEFAULT_DOWNLOAD_CONCURRENCY))
    .option("--retry-failed", "also retry previously failed downloads", false)
    .action(async (opts) => {
      const results = await downloadPending({
        limit: Number(opts.limit),
        concurrency: Number(opts.concurrency),
        retryFailed: Boolean(opts.retryFailed),
      });
      console.log(`Downloaded ${results.length} articles`);
      await closeDb();
    });
}
