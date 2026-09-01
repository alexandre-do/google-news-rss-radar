import { startServer } from "../../api/server.js";

export function registerServeCommand(program) {
  program
    .command("serve")
    .description("Start the Express API server")
    .action(() => {
      startServer();
    });
}
