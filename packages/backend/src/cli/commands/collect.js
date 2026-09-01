import { collect } from "../../collector/collect.js";
import { closeDb } from "../../db/client.js";
import { DEFAULT_TIME_DELTA_DAYS } from "../../shared/constants.js";

export function registerCollectCommand(program) {
  program
    .command("collect <keywords> <dateFrom> <dateTo>")
    .description("Collect RSS entries for a keyword and date range into Mongo")
    .option("--time-delta <days>", "chunk size in days", String(DEFAULT_TIME_DELTA_DAYS))
    .action(async (keywords, dateFrom, dateTo, opts) => {
      const total = await collect(keywords, dateFrom, dateTo, { timeDelta: Number(opts.timeDelta) });
      console.log(`Collected ${total} entries for "${keywords}"`);
      await closeDb();
    });
}
