import { extractPending } from "../../extraction/extract.js";
import { closeDb } from "../../db/client.js";

export function registerExtractCommand(program) {
  program
    .command("extract")
    .description("Extract article content from downloaded HTML")
    .option("--limit <n>", "max articles to process (0 = no limit)", "0")
    .option("--retry-failed", "also retry previously failed extractions", false)
    .action(async (opts) => {
      const results = await extractPending({
        limit: Number(opts.limit),
        retryFailed: Boolean(opts.retryFailed),
      });
      console.log(`Extracted ${results.length} articles`);
      await closeDb();
    });
}
