/**
 * Runs docker compose with Docker CLI discovery (Windows PATH fix).
 * Usage: node scripts/infra.js up|down|logs
 */
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const action = process.argv[2] || "up";
const repoRoot = path.join(__dirname, "..");
const composeFile = path.join(
  repoRoot,
  "infrastructure",
  "docker",
  "docker-compose.yml"
);

const windowsDockerDirs = [
  path.join(process.env.ProgramFiles || "C:\\Program Files", "Docker", "Docker", "resources", "bin"),
  path.join(process.env["ProgramFiles(x86)"] || "C:\\Program Files (x86)", "Docker", "Docker", "resources", "bin"),
  path.join(process.env.LOCALAPPDATA || "", "Docker", "cli-plugins"),
];

function findDockerExe() {
  const names = process.platform === "win32" ? ["docker.exe", "docker"] : ["docker"];
  for (const name of names) {
    const which = spawnSync(process.platform === "win32" ? "where" : "which", [name], {
      encoding: "utf8",
      shell: true,
    });
    if (which.status === 0 && which.stdout.trim()) {
      const first = which.stdout.trim().split(/\r?\n/)[0];
      if (fs.existsSync(first)) return first;
    }
  }
  for (const dir of windowsDockerDirs) {
    const candidate = path.join(dir, "docker.exe");
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

const dockerExe = findDockerExe();
if (!dockerExe) {
  console.error(`
Docker CLI not found.

1. Install Docker Desktop: https://www.docker.com/products/docker-desktop/
2. Start Docker Desktop and wait until it says "Engine running"
3. Restart this terminal, then run: npm run infra:${action}

Or add Docker to PATH (Windows):
  Settings → System → About → Advanced system settings → Environment Variables
  Add to Path: C:\\Program Files\\Docker\\Docker\\resources\\bin
`);
  process.exit(1);
}

const dockerDir = path.dirname(dockerExe);
const env = {
  ...process.env,
  PATH: `${dockerDir}${path.delimiter}${process.env.PATH || ""}`,
};

const composeArgs =
  action === "up"
    ? ["compose", "-f", composeFile, "up", "-d"]
    : action === "down"
      ? ["compose", "-f", composeFile, "down"]
      : action === "logs"
        ? ["compose", "-f", composeFile, "logs", "-f"]
        : null;

if (!composeArgs) {
  console.error("Usage: node scripts/infra.js <up|down|logs>");
  process.exit(1);
}

console.log(`Using: ${dockerExe}`);
console.log(`Compose: ${composeFile}\n`);

const ping = spawnSync(dockerExe, ["info"], { env, encoding: "utf8" });
if (ping.status !== 0) {
  const msg = (ping.stderr || ping.stdout || "").toString();
  console.error(`
Docker CLI found but the engine is not running.

1. Open Docker Desktop (Start menu → Docker Desktop)
2. Wait until it shows "Engine running"
3. Run again: npm run infra:${action}

Details: ${msg.trim() || "docker info failed"}
`);
  process.exit(1);
}

const result = spawnSync(dockerExe, composeArgs, {
  cwd: repoRoot,
  env,
  stdio: "inherit",
  shell: false,
});

if (result.status !== 0) {
  const stderr = result.stderr?.toString() || "";
  if (
    stderr.includes("dockerDesktopLinuxEngine") ||
    stderr.includes("Internal Server Error") ||
    stderr.includes("Cannot connect")
  ) {
    console.error(`
Docker is installed but the engine is not running.

1. Open Docker Desktop from the Start menu
2. Wait until the status shows "Engine running" (green)
3. Run again: npm run infra:${action}
`);
  }
  process.exit(result.status ?? 1);
}

if (action === "up") {
  console.log("\nInfrastructure started (MongoDB, Redis, LiveKit).");
  console.log("  MongoDB  → localhost:27017");
  console.log("  Redis    → localhost:6379");
  console.log("  LiveKit  → ws://localhost:7880 (keys: devkey / secret)");
}
