import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const consumerRoot = path.join(packageRoot, "examples", "consumer");
const tempWorkspace = mkdtempSync(path.join(tmpdir(), "ui-consumer-"));
const tempConsumerRoot = path.join(tempWorkspace, "examples", "consumer");

rmSync(path.join(consumerRoot, "node_modules"), { recursive: true, force: true });
rmSync(path.join(consumerRoot, "dist"), { recursive: true, force: true });

try {
  const tarballPath = packPackage(tempWorkspace);
  const rootPackageJson = JSON.parse(readFileSync(path.join(packageRoot, "package.json"), "utf8"));

  mkdirSync(tempConsumerRoot, { recursive: true });
  cpSync(path.join(packageRoot, "tsconfig.base.json"), path.join(tempWorkspace, "tsconfig.base.json"));
  cpSync(path.join(consumerRoot, "src"), path.join(tempConsumerRoot, "src"), { recursive: true });
  cpSync(path.join(consumerRoot, "index.html"), path.join(tempConsumerRoot, "index.html"));
  cpSync(path.join(consumerRoot, "tsconfig.json"), path.join(tempConsumerRoot, "tsconfig.json"));
  cpSync(path.join(consumerRoot, "vite.config.ts"), path.join(tempConsumerRoot, "vite.config.ts"));

  const packageJson = JSON.parse(readFileSync(path.join(consumerRoot, "package.json"), "utf8"));
  packageJson.dependencies["@moritzbrantner/ui"] = `file:${tarballPath}`;
  packageJson.devDependencies["@types/react"] ??= rootPackageJson.devDependencies["@types/react"];
  packageJson.devDependencies["@types/react-dom"] ??= rootPackageJson.devDependencies["@types/react-dom"];
  writeFileSync(
    path.join(tempConsumerRoot, "package.json"),
    `${JSON.stringify(packageJson, null, 2)}\n`,
  );

  run("bun", ["install"], tempConsumerRoot);
  run("bun", ["run", "check-types"], tempConsumerRoot);
  run("bun", ["run", "build"], tempConsumerRoot);
} finally {
  rmSync(tempWorkspace, { recursive: true, force: true });
}

console.log("@moritzbrantner/ui consumer example verified");

function packPackage(destination: string): string {
  const result = spawnSync("npm", ["pack", "--ignore-scripts", "--pack-destination", destination, "--json"], {
    cwd: packageRoot,
    shell: false,
    encoding: "utf8",
  });

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.stdout.write(result.stdout);
    process.stderr.write(result.stderr);
    process.exit(result.status ?? 1);
  }

  const [packResult] = JSON.parse(result.stdout) as Array<{ filename: string }>;

  return path.join(destination, packResult.filename);
}

function run(command: string, args: string[], cwd: string): void {
  const result = spawnSync(command, args, {
    cwd,
    shell: false,
    stdio: "inherit",
  });

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
