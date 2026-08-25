#!/usr/bin/env bun

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

type RegistrySource = {
  source: string;
  target: string;
  replacements?: readonly (readonly [from: string, to: string])[];
};

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const checkOnly = process.argv.includes("--check");
const registrySources: readonly RegistrySource[] = [
  { source: "src/lib/cn.ts", target: "registry/default/lib/cn.ts" },
  { source: "src/components/stable/button.tsx", target: "registry/default/ui/button.tsx" },
  { source: "src/components/stable/tabs.tsx", target: "registry/default/ui/tabs.tsx" },
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
  {
    source: "src/components/patterns/source-passage.tsx",
    target: "registry/default/ui/source-passage.tsx",
  },
  {
    source: "src/components/patterns/apparatus-list.tsx",
    target: "registry/default/ui/apparatus-list.tsx",
  },
  {
    source: "src/components/patterns/scholarly-note.tsx",
    target: "registry/default/ui/scholarly-note.tsx",
  },
  {
    source: "src/components/patterns/scholia-source-workbench.tsx",
    target: "registry/default/ui/scholia-source-workbench.tsx",
    replacements: [
      ['from "./apparatus-list"', 'from "@/registry/default/ui/apparatus-list"'],
      ['from "./scholarly-note"', 'from "@/registry/default/ui/scholarly-note"'],
      ['from "./source-passage"', 'from "@/registry/default/ui/source-passage"'],
    ],
  },
  {
    source: "src/components/patterns/pop-rewards.tsx",
    target: "registry/default/ui/pop-rewards.tsx",
    replacements: [['from "./theme-motion"', 'from "@/registry/default/ui/theme-motion"']],
  },
  {
    source: "src/components/patterns/theme-motion.tsx",
    target: "registry/default/ui/theme-motion.tsx",
    replacements: [
      ['from "../stable/button"', 'from "@/registry/default/ui/button"'],
      ['from "../stable/tabs"', 'from "@/registry/default/ui/tabs"'],
    ],
  },
  {
    source: "src/components/patterns/atlas-operations.tsx",
    target: "registry/default/ui/atlas-operations.tsx",
  },
  {
    source: "src/components/patterns/studio-tools.tsx",
    target: "registry/default/ui/studio-tools.tsx",
  },
  {
    source: "src/components/patterns/scholia-research.tsx",
    target: "registry/default/ui/scholia-research.tsx",
  },
  {
    source: "src/components/patterns/paper-documents.tsx",
    target: "registry/default/ui/paper-documents.tsx",
  },
  {
    source: "src/components/patterns/zleek-shells.tsx",
    target: "registry/default/ui/zleek-shells.tsx",
  },
  {
    source: "src/components/patterns/product-patterns.tsx",
    target: "registry/default/ui/product-patterns.tsx",
  },
  {
    source: "src/components/patterns/pop-rewards-extended.tsx",
    target: "registry/default/ui/pop-rewards-extended.tsx",
    replacements: [['from "./pop-rewards"', 'from "@/registry/default/ui/pop-rewards"']],
  },
  {
    source: "src/components/patterns/pulse-spatial.tsx",
    target: "registry/default/ui/pulse-spatial.tsx",
  },
  { source: "base.css", target: "registry/default/styles/moritz-base.css" },
  {
    source: "bobba/styles.css",
    target: "registry/default/styles/bobba.css",
    replacements: [['@import "../base.css";', '@import "./moritz-base.css";']],
  },
  {
    source: "zleek/styles.css",
    target: "registry/default/styles/zleek.css",
    replacements: [['@import "../base.css";', '@import "./moritz-base.css";']],
  },
  {
    source: "atlas/styles.css",
    target: "registry/default/styles/atlas.css",
    replacements: [['@import "../base.css";', '@import "./moritz-base.css";']],
  },
  {
    source: "studio/styles.css",
    target: "registry/default/styles/studio.css",
    replacements: [['@import "../base.css";', '@import "./moritz-base.css";']],
  },
  {
    source: "paper/styles.css",
    target: "registry/default/styles/paper.css",
    replacements: [['@import "../base.css";', '@import "./moritz-base.css";']],
  },
  {
    source: "scholia/styles.css",
    target: "registry/default/styles/scholia.css",
    replacements: [['@import "../base.css";', '@import "./moritz-base.css";']],
  },
  {
    source: "pop/styles.css",
    target: "registry/default/styles/pop.css",
    replacements: [['@import "../base.css";', '@import "./moritz-base.css";']],
  },
  {
    source: "pulse/styles.css",
    target: "registry/default/styles/pulse.css",
    replacements: [['@import "../base.css";', '@import "./moritz-base.css";']],
  },
];
const expectedTargets = new Set(registrySources.map(({ target }) => target));
const errors: string[] = [];
let updated = 0;

for (const { source, target, replacements } of registrySources) {
  const sourcePath = path.join(packageRoot, source);
  const targetPath = path.join(packageRoot, target);
  const expected = toRegistrySource(readFileSync(sourcePath, "utf8"), replacements);
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

for (const directory of [
  "registry/default/lib",
  "registry/default/styles",
  "registry/default/ui",
]) {
  const directoryPath = path.join(packageRoot, directory);

  if (!existsSync(directoryPath)) {
    continue;
  }

  for (const entryName of readdirSync(directoryPath)) {
    if (!entryName.endsWith(".css") && !entryName.endsWith(".ts") && !entryName.endsWith(".tsx")) {
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

function toRegistrySource(
  source: string,
  replacements: RegistrySource["replacements"] = [],
): string {
  let result = source.replaceAll('from "../../lib/cn"', 'from "@/registry/default/lib/cn"');

  for (const [from, to] of replacements) {
    result = result.replaceAll(from, to);
  }

  return result;
}
