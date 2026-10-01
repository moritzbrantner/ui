import { spawnSync } from "node:child_process";
import { existsSync, lstatSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { sizeEvidence } from "coding-tooling/size-evidence";

const { values } = parseArgs({
  options: { root: { type: "string" }, baseline: { type: "string" }, update: { type: "boolean" } },
  strict: true,
});
const root = path.resolve(values.root ?? fileURLToPath(new URL("../", import.meta.url)));
const baseline = values.baseline ?? ".performance/baselines/ui-js.json";
if (values.update && values.baseline) {
  throw new Error("Baseline updates use only the repository-owned default path.");
}
const report = sizeEvidence(root, values.update ? {} : { baseline });
function assertLocalFile(file: string): void {
  const relative = path.relative(root, file);
  if (path.isAbsolute(relative) || relative.startsWith(`..${path.sep}`)) {
    throw new Error("Size output must stay inside its repository.");
  }
  let current = root;
  for (const part of relative.split(path.sep)) {
    current = path.join(current, part);
    if (lstatSync(current, { throwIfNoEntry: false })?.isSymbolicLink()) {
      throw new Error("Size output cannot cross a symlink boundary.");
    }
  }
}
function atomicWrite(file: string, contents: string): void {
  assertLocalFile(file);
  mkdirSync(path.dirname(file), { recursive: true });
  const temporary = `${file}.${process.pid}.tmp`;
  writeFileSync(temporary, contents);
  renameSync(temporary, file);
}
let baselineUpdate: "not-requested" | "changed" | "unchanged" = "not-requested";
if (values.update && report.status === "passed") {
  const baselinePath = path.join(root, baseline);
  assertLocalFile(baselinePath);
  const previous: unknown = existsSync(baselinePath)
    ? JSON.parse(readFileSync(baselinePath, "utf8"))
    : null;
  if (
    typeof previous === "object" &&
    previous !== null &&
    "data" in previous &&
    "schemaVersion" in previous &&
    previous.schemaVersion === 1 &&
    "operation" in previous &&
    previous.operation === "size-evidence" &&
    "status" in previous &&
    (previous.status === "passed" || previous.status === "failed") &&
    JSON.stringify(previous.data) === JSON.stringify(report.data)
  ) {
    baselineUpdate = "unchanged";
  } else {
    const formatted = spawnSync("oxfmt", ["--stdin-filepath", baselinePath], {
      cwd: root,
      input: JSON.stringify(report, null, 2) + "\n",
      encoding: "utf8",
      timeout: 10000,
      maxBuffer: 16 * 1024 * 1024,
    });
    if (formatted.error || formatted.status !== 0 || !formatted.stdout.trim()) {
      throw new Error("The declared formatter is unavailable for the baseline update.");
    }
    atomicWrite(baselinePath, formatted.stdout);
    baselineUpdate = "changed";
  }
}
const output = JSON.stringify({ ...report, baselineUpdate }, null, 2) + "\n";
atomicWrite(path.join(root, "benchmark-results/size-evidence.json"), output);
process.stdout.write(output);
if (report.status === "passed") {
  process.exitCode = 0;
} else if (report.status === "failed") {
  process.exitCode = 1;
} else if (report.status === "unavailable") {
  process.exitCode = 2;
} else {
  process.exitCode = 3;
}
