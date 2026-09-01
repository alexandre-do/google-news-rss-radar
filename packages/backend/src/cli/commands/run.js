import { collect } from "../../collector/collect.js";
import { downloadPending } from "../../downloader/download.js";
import { extractPending } from "../../extraction/extract.js";
import { enrichPending } from "../../enrich/enrich.js";
import { closeDb } from "../../db/client.js";
import { DEFAULT_TIME_DELTA_DAYS } from "../../shared/constants.js";

export function registerRunCommand(program) {
  program
    .command("run <keywords> <dateFrom> <dateTo>")
    .description("Chain collect -> download -> extract -> enrich")
    .option("--time-delta <days>", "chunk size in days", String(DEFAULT_TIME_DELTA_DAYS))
    .option("--skip-enrich", "skip the enrichment stage", false)
    .action(async (keywords, dateFrom, dateTo, opts) => {
      const collected = await collect(keywords, dateFrom, dateTo, { timeDelta: Number(opts.timeDelta) });
      console.log(`collect: ${collected} entries`);

      const downloaded = await downloadPending({});
      console.log(`download: ${downloaded.length} processed`);

      const extracted = await extractPending({});
      console.log(`extract: ${extracted.length} processed`);

      if (!opts.skipEnrich) {
        const enriched = await enrichPending({});
        console.log(`enrich: ${enriched.length} processed`);
      }

      await closeDb();
    });
}
