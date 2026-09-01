import { enrichPending } from "../../enrich/enrich.js";
import { closeDb } from "../../db/client.js";

export function registerEnrichCommand(program) {
  program
    .command("enrich")
    .description("Run the (stub) enrichment stage over extracted articles")
    .option("--limit <n>", "max articles to process (0 = no limit)", "0")
    .action(async (opts) => {
      const results = await enrichPending({ limit: Number(opts.limit) });
      console.log(`Enriched ${results.length} articles`);
      await closeDb();
    });
}
