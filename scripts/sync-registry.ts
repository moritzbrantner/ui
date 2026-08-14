#!/usr/bin/env bun

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

type RegistrySource = {
  source: string;
  target: string;
};

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const checkOnly = process.argv.includes("--check");
const registrySources: readonly RegistrySource[] = [
  { source: "src/lib/cn.ts", target: "registry/default/lib/cn.ts" },
  { source: "src/components/stable/button.tsx", target: "registry/default/ui/button.tsx" },
  { source: "src/components/stable/input.tsx", target: "registry/default/ui/input.tsx" },
  { source: "src/components/stable/label.tsx", target: "registry/default/ui/label.tsx" },
  {
    source: "src/components/stable/description-list.tsx",
    target: "registry/default/ui/description-list.tsx",
  },
  {
    source: "src/components/stable/metric-strip.tsx",
    target: "registry/default/ui/metric-strip.tsx",
  },
];
const expectedTargets = new Set(registrySources.map(({ target }) => target));
const errors: string[] = [];
let updated = 0;

for (const { source, target } of registrySources) {
  const sourcePath = path.join(packageRoot, source);
  const targetPath = path.join(packageRoot, target);
  const expected = toRegistrySource(readFileSync(sourcePath, "utf8"));
  const current = existsSync(targetPath) ? readFileSync(targetPath, "utf8") : null;

  if (current === expected) {
    continue;
  }

  if (checkOnly) {
    errors.push(`${target} is not synchronized with ${source}`);
    continue;
  }

  mkdirSync(path.dirname(targetPath), { recursive: true });
  writeFileSync(targetPath, expected);
  updated += 1;
}

for (const directory of ["registry/default/lib", "registry/default/ui"]) {
  const directoryPath = path.join(packageRoot, directory);

  if (!existsSync(directoryPath)) {
    continue;
  }

  for (const entryName of readdirSync(directoryPath)) {
    if (!entryName.endsWith(".ts") && !entryName.endsWith(".tsx")) {
      continue;
    }

    const target = path.posix.join(directory, entryName);

    if (!expectedTargets.has(target)) {
      errors.push(`${target} is not declared by scripts/sync-registry.ts`);
    }
  }
}

if (errors.length > 0) {
  console.error("Registry source verification failed:");

  for (const error of errors) {
    console.error(`- ${error}`);
  }

  console.error("Run `bun run sync:registry` after changing registry-backed source files.");
  process.exit(1);
}

if (checkOnly) {
  console.log(`Verified ${registrySources.length} synchronized registry source files.`);
} else {
  console.log(`Synchronized ${registrySources.length} registry source files (${updated} updated).`);
}

function toRegistrySource(source: string): string {
  return source.replaceAll('from "../../lib/cn"', 'from "@/registry/default/lib/cn"');
}
