const net = require("net");
const { spawn } = require("child_process");

const API_PORT = Number(process.env.API_PORT || 4000);
const DASHBOARD_PORT = 5173;

function canConnect(port, host) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ port, host, timeout: 300 });
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("timeout", () => {
      socket.destroy();
      resolve(false);
    });
    socket.once("error", () => resolve(false));
  });
}

async function isPortInUse(port) {
  const [ipv4Up, ipv6Up] = await Promise.all([
    canConnect(port, "127.0.0.1"),
    canConnect(port, "::1"),
  ]);
  return ipv4Up || ipv6Up;
}

async function main() {
  const [apiInUse, dashboardInUse] = await Promise.all([
    isPortInUse(API_PORT),
    isPortInUse(DASHBOARD_PORT),
  ]);

  if (apiInUse || dashboardInUse) {
    console.log("Dev server already running, nothing to start:");
    if (apiInUse) console.log(`  API:       http://localhost:${API_PORT}`);
    if (dashboardInUse) console.log(`  Dashboard: http://localhost:${DASHBOARD_PORT}`);
    if (!apiInUse) console.log(`  API port ${API_PORT} is free (not started).`);
    if (!dashboardInUse) console.log(`  Dashboard port ${DASHBOARD_PORT} is free (not started).`);
    process.exit(0);
  }

  const child = spawn(
    "npx",
    ["concurrently", "npm run api", "npm run dashboard"],
    { stdio: "inherit" }
  );
  child.on("exit", (code) => process.exit(code ?? 0));
}

main();
