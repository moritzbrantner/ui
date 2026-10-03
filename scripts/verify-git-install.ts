#!/usr/bin/env bun

// Proves that a commit-pinned git dependency on this package works: a clean clone of HEAD
// must build with nothing but the `prepare` script, and every export target must exist afterwards.

import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tempRoot = mkdtempSync(path.join(tmpdir(), "ui-git-install-"));
const cloneDir = path.join(tempRoot, "clone");

function run(command: string, args: string[], cwd: string) {
  execFileSync(command, args, { cwd, stdio: "inherit" });
}

function collectTargets(value: unknown, targets: string[]) {
  if (typeof value === "string") {
    targets.push(value);
  } else if (value && typeof value === "object") {
    for (const nested of Object.values(value)) {
      collectTargets(nested, targets);
    }
  }
}

try {
  const head = execFileSync("git", ["rev-parse", "HEAD"], { cwd: packageRoot }).toString().trim();
  run("git", ["clone", "--quiet", "--no-checkout", packageRoot, cloneDir], packageRoot);
  run("git", ["-c", "advice.detachedHead=false", "checkout", "--quiet", head], cloneDir);

  const manifest = JSON.parse(readFileSync(path.join(cloneDir, "package.json"), "utf8"));
  const prepare: unknown = manifest.scripts?.prepare;
  if (typeof prepare !== "string" || !prepare.includes("--ignore-scripts")) {
    throw new Error(
      "package.json must define a prepare script that installs with --ignore-scripts",
    );
  }

  run("bun", ["run", "prepare"], cloneDir);

  const targets: string[] = [];
  collectTargets(manifest.main, targets);
  collectTargets(manifest.types, targets);
  collectTargets(manifest.exports, targets);

  const missing = targets
    .map((target) => (target.includes("*") ? path.dirname(target) : target))
    .filter((target) => !existsSync(path.join(cloneDir, target)));

  if (missing.length > 0) {
    throw new Error(
      `Export targets missing after prepare in a clean clone:\n- ${missing.join("\n- ")}`,
    );
  }

  console.log(
    `Clean clone of ${head} builds via prepare; ${targets.length} export targets present`,
  );
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}
