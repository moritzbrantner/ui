import { readFileSync, realpathSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const dependencyRoot = realpathSync(fileURLToPath(new URL("../node_modules/", import.meta.url)));
const tsupManifest = realpathSync(path.join(dependencyRoot, "tsup/package.json"));
const tsupLoad = createRequire(tsupManifest);
function version(path: string): string {
  const manifest: unknown = JSON.parse(readFileSync(path, "utf8"));
  if (
    typeof manifest !== "object" ||
    manifest === null ||
    !("version" in manifest) ||
    typeof manifest.version !== "string" ||
    !manifest.version.trim()
  ) {
    throw new Error(`Missing installed tool version: ${path}`);
  }
  return manifest.version;
}
const esbuildManifest = realpathSync(tsupLoad.resolve("esbuild/package.json"));
const esbuildRelative = path.relative(dependencyRoot, esbuildManifest);
if (path.isAbsolute(esbuildRelative) || esbuildRelative.startsWith(`..${path.sep}`)) {
  throw new Error("The size probe requires the locally installed esbuild dependency.");
}
process.stdout.write(
  JSON.stringify({
    tsup: version(tsupManifest),
    esbuild: version(esbuildManifest),
  }) + "\n",
);
