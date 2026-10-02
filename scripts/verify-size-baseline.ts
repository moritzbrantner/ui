import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { assertSizeOutput, writeSizeOutput } from "./size-output.js";
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
let baselineUpdate: "not-requested" | "changed" | "unchanged" = "not-requested";
if (values.update && report.status === "passed") {
  const baselinePath = path.join(root, baseline);
  assertSizeOutput(root, baselinePath);
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
    writeSizeOutput(root, baselinePath, formatted.stdout);
    baselineUpdate = "changed";
  }
}
const output = JSON.stringify({ ...report, baselineUpdate }, null, 2) + "\n";
writeSizeOutput(root, path.join(root, "benchmark-results/size-evidence.json"), output);
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
