import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

function loadEnvFile(path = ".env") {
  if (!existsSync(path)) {
    return;
  }

  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed.length === 0 || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();
    const isQuoted = (value.startsWith("\"") && value.endsWith("\""))
      || (value.startsWith("'") && value.endsWith("'"));

    if (isQuoted) {
      value = value.slice(1, -1);
    }

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvFile();

const direction = process.argv.slice(2);
const args = [
  ...(direction.length > 0 ? direction : ["up"]),
  "--migrations-dir",
  "migrations"
];

const result = spawnSync("node-pg-migrate", args, {
  env: process.env,
  shell: process.platform === "win32",
  stdio: "inherit"
});

if (result.error) {
  console.error(result.error.message);
}

process.exit(result.status ?? 1);
