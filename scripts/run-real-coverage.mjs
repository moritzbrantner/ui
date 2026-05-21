import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

if (process.versions.bun) {
  console.error(
    "@moritzbrantner/ui real coverage requires the Node.js runtime. The current `node` executable is Bun's compatibility shim, which does not expose V8 inspector coverage APIs.",
  );
  console.error(
    "Run this command in CI after actions/setup-node, or locally with real Node on PATH.",
  );
  process.exit(1);
}

const result = spawnSync(
  process.execPath,
  [
    "./node_modules/vitest/vitest.mjs",
    "run",
    "--config",
    "vitest.coverage.config.ts",
    "--coverage",
  ],
  {
    cwd: packageRoot,
    shell: false,
    stdio: "inherit",
  },
);

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
