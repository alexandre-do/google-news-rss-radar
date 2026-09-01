import { readFile } from "node:fs/promises";
import { collectBatch } from "../../collector/collect.js";
import { closeDb } from "../../db/client.js";
import { DEFAULT_TIME_DELTA_DAYS } from "../../shared/constants.js";

export function registerCollectBatchCommand(program) {
  program
    .command("collect-batch <inputFile>")
    .description("Collect RSS entries for every keyword;dateFrom;dateTo line in a file")
    .option("--time-delta <days>", "chunk size in days", String(DEFAULT_TIME_DELTA_DAYS))
    .action(async (inputFile, opts) => {
      const content = await readFile(inputFile, "utf-8");
      const lines = content.split("\n");
      const total = await collectBatch(lines, { timeDelta: Number(opts.timeDelta) });
      console.log(`Collected ${total} entries total`);
      await closeDb();
    });
}
