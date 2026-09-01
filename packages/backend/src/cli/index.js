#!/usr/bin/env node
import { Command } from "commander";
import { registerCollectCommand } from "./commands/collect.js";
import { registerCollectBatchCommand } from "./commands/collectBatch.js";
import { registerDownloadCommand } from "./commands/download.js";
import { registerExtractCommand } from "./commands/extract.js";
import { registerEnrichCommand } from "./commands/enrich.js";
import { registerRunCommand } from "./commands/run.js";
import { registerServeCommand } from "./commands/serve.js";

const program = new Command();
program.name("scraping").description("News scraping pipeline CLI");

registerCollectCommand(program);
registerCollectBatchCommand(program);
registerDownloadCommand(program);
registerExtractCommand(program);
registerEnrichCommand(program);
registerRunCommand(program);
registerServeCommand(program);

program.parseAsync(process.argv).catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
