const { execSync } = require("child_process");

const API_PORT = Number(process.env.API_PORT || 4000);
const DASHBOARD_PORT = 5173;

const includeDocker = process.argv.includes("--all") || process.argv.includes("--docker");

function pidsOnPort(port) {
  try {
    const out = execSync(`lsof -ti tcp:${port}`, { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
    return out ? out.split("\n") : [];
  } catch {
    return [];
  }
}

function stopPort(name, port) {
  const pids = pidsOnPort(port);
  if (pids.length === 0) {
    console.log(`  ${name} (:${port}) — not running`);
    return;
  }
  for (const pid of pids) {
    process.kill(Number(pid), "SIGTERM");
  }
  console.log(`  ${name} (:${port}) — stopped (pid ${pids.join(", ")})`);
}

function stopDocker() {
  console.log("  docker compose down (mongo, ner)");
  try {
    execSync("docker compose down", { stdio: "inherit" });
  } catch (err) {
    console.error("  docker compose down failed:", err.message);
  }
}

console.log("Stopping dev services...");
stopPort("API", API_PORT);
stopPort("Dashboard", DASHBOARD_PORT);

if (includeDocker) {
  stopDocker();
} else {
  console.log("  (pass --all to also stop mongo/ner containers)");
}
