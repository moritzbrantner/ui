import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { writeSizeOutput } from "./size-output.js";

const producer = fileURLToPath(new URL("../", import.meta.url));
const fixture = mkdtempSync(path.join(tmpdir(), "ui-size-evidence-"));
const baselineRelative = ".performance/baselines/ui-js.json";
const baselinePath = path.join(fixture, baselineRelative);
function invoke(...arguments_: string[]) {
  const result = spawnSync(
    process.execPath,
    [path.join(producer, "scripts/verify-size-baseline.ts"), "--root", fixture, ...arguments_],
    { cwd: producer, encoding: "utf8", timeout: 30000 },
  );
  assert.equal(result.error, undefined);
  const report = JSON.parse(result.stdout);
  return { status: result.status, report };
}
try {
  for (const name of ["dist", ".performance"]) {
    cpSync(path.join(producer, name), path.join(fixture, name), { recursive: true });
  }
  const declaration = JSON.parse(
    readFileSync(path.join(fixture, ".performance/size.json"), "utf8"),
  );
  for (const name of declaration.targets[0].buildInputs) {
    mkdirSync(path.dirname(path.join(fixture, name)), { recursive: true });
    cpSync(path.join(producer, name), path.join(fixture, name));
  }
  symlinkSync(path.join(producer, "node_modules"), path.join(fixture, "node_modules"), "dir");
  const before = readFileSync(baselinePath, "utf8");
  const beforeMtime = statSync(baselinePath).mtimeMs;
  const valid = invoke();
  assert.equal(valid.status, 0, JSON.stringify(valid.report));
  assert.equal(valid.report.data.targets[0].comparison.state, "comparable");
  assert.equal(valid.report.data.targets[0].comparison.deltaBytes, 0);
  assert.equal(readFileSync(baselinePath, "utf8"), before);
  const update = invoke("--update");
  assert.equal(update.status, 0);
  assert.equal(update.report.baselineUpdate, "unchanged");
  assert.equal(statSync(baselinePath).mtimeMs, beforeMtime);
  assert.equal(readFileSync(baselinePath, "utf8"), before);

  const missing = invoke("--baseline", "missing.json");
  assert.equal(missing.status, 2);
  assert.equal(missing.report.status, "unavailable");
  declaration.targets[0].profile = "incompatible-build";
  writeFileSync(path.join(fixture, ".performance/size.json"), JSON.stringify(declaration));
  const incompatible = invoke();
  assert.equal(incompatible.status, 2);
  assert.equal(incompatible.report.data.targets[0].comparison.state, "incomparable");
  declaration.targets[0].profile = "production-esm";
  writeFileSync(path.join(fixture, ".performance/size.json"), JSON.stringify(declaration));

  const compilerConfig = path.join(fixture, "tsconfig.json");
  cpSync(path.join(producer, "tsconfig.json"), compilerConfig);
  const compilerBefore = readFileSync(compilerConfig, "utf8");
  const changedCompiler = JSON.parse(compilerBefore);
  changedCompiler.compilerOptions.jsx = "react-jsxdev";
  writeFileSync(compilerConfig, JSON.stringify(changedCompiler));
  const changedConfiguration = invoke();
  assert.equal(changedConfiguration.status, 2);
  assert.equal(changedConfiguration.report.data.targets[0].comparison.state, "incomparable");
  writeFileSync(compilerConfig, compilerBefore);

  const entrypoint = path.join(fixture, "dist/index.js");
  const original = readFileSync(entrypoint);
  writeFileSync(entrypoint, Buffer.alloc(880 * 1024 + 1));
  const oversized = invoke();
  assert.equal(oversized.status, 1);
  assert.equal(oversized.report.data.targets[0].comparison.state, "comparable");
  assert(oversized.report.data.targets[0].failures.length > 0);
  const rejectedUpdate = invoke("--update");
  assert.equal(rejectedUpdate.status, 1);
  assert.equal(readFileSync(baselinePath, "utf8"), before);
  writeFileSync(entrypoint, original);
  rmSync(path.join(fixture, "node_modules"));
  const missingTool = invoke();
  assert.equal(missingTool.status, 2);
  assert.equal(missingTool.report.status, "unavailable");
  assert.equal(readFileSync(baselinePath, "utf8"), before);
  const guardedOutput = path.join(fixture, "guarded-output.json");
  const victim = path.join(fixture, "victim.txt");
  writeFileSync(victim, "preserve this file");
  symlinkSync(victim, `${guardedOutput}.${process.pid}.tmp`);
  assert.throws(() => writeSizeOutput(fixture, guardedOutput, "must not reach victim"));
  assert.equal(readFileSync(victim, "utf8"), "preserve this file");
  process.stdout.write(
    "Size acceptance passed: unchanged baseline, repeat update no-op, missing baseline, incompatible build, changed JSX config, oversize failure, rejected update, missing tool and staging symlink rejection.\n",
  );
} finally {
  rmSync(fixture, { recursive: true, force: true });
}
