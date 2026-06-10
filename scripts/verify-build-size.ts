import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  formatBuildSizeMarkdown,
  formatBytes,
  getLikelyOwner,
  type BuildSizeArtifact,
  type BuildSizeChunk,
  type BuildSizeEntry,
} from "./build-size-artifact.js";
import { listFiles } from "./list-files.js";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(packageRoot, "dist");
const benchmarkResultsDir = path.join(packageRoot, "benchmark-results");
const buildSizeJsonPath = path.join(benchmarkResultsDir, "build-size.json");
const buildSizeMarkdownPath = path.join(benchmarkResultsDir, "build-size.md");
const maxTotalBytes = 880 * 1024;
const maxEntryBytes = 35 * 1024;
const maxChunkBytes = 40 * 1024;
const maxOptimizedThemeEntryBytes = 1024;
const maxLeanThemeEntryBytes = 1024;
const maxSimpleThemeReachableGraphBytes = 4 * 1024;
const optimizedThemeNames = [
  "zleek",
  "bobba",
  "atlas",
  "studio",
  "paper",
  "scholia",
  "pop",
  "pulse",
] as const;
const simpleThemeNames = ["bobba", "atlas", "studio", "paper", "scholia"] as const;
const publicEntries = [
  "index",
  "server",
  "client",
  "bobba",
  "zleek",
  "atlas",
  "studio",
  "paper",
  "scholia",
  "pop",
  "pulse",
  "themes",
  "themes/zleek",
  "themes/bobba",
  "themes/atlas",
  "themes/studio",
  "themes/paper",
  "themes/scholia",
  "themes/pop",
  "themes/pulse",
];
const failures: string[] = [];

let jsFiles: string[] = [];
let totalBytes = 0;
let entries: BuildSizeEntry[] = [];
let chunks: BuildSizeChunk[] = [];

if (!existsSync(distDir)) {
  failures.push("missing dist/. Run build first.");
} else {
  jsFiles = listFiles(distDir).filter((filePath) => filePath.endsWith(".js"));
  totalBytes = jsFiles.reduce((sum, filePath) => sum + statSync(filePath).size, 0);

  if (totalBytes > maxTotalBytes) {
    failures.push(
      `dist JS total is ${formatBytes(totalBytes)}, above ${formatBytes(maxTotalBytes)} budget`,
    );
  }

  entries = publicEntries.map((entryName) => {
    const entryPath = path.join(distDir, `${entryName}.js`);
    const exists = existsSync(entryPath);
    const bytes = exists ? statSync(entryPath).size : 0;
    const passed = exists && bytes <= maxEntryBytes;
    const owner = getLikelyOwner(`${entryName}.js`);

    if (!exists) {
      failures.push(`missing public entry dist/${entryName}.js [owner: ${owner}]`);
    } else if (!passed) {
      failures.push(
        `dist/${entryName}.js is ${formatBytes(bytes)}, above ${formatBytes(maxEntryBytes)} budget [owner: ${owner}]`,
      );
    }

    return {
      name: entryName,
      relativePath: `dist/${entryName}.js`,
      bytes,
      budgetBytes: maxEntryBytes,
      passed,
      owner,
    };
  });

  verifyOptimizedThemeEntries();

  chunks = jsFiles
    .map((filePath): BuildSizeChunk => {
      const bytes = statSync(filePath).size;
      const relativePath = path.relative(packageRoot, filePath);
      const owner = getLikelyOwner(path.basename(filePath));
      const passed = bytes <= maxChunkBytes;

      if (!passed) {
        failures.push(
          `${path.relative(distDir, filePath)} is ${formatBytes(bytes)}, above ${formatBytes(maxChunkBytes)} chunk budget [owner: ${owner}]`,
        );
      }

      return {
        relativePath,
        bytes,
        budgetBytes: maxChunkBytes,
        passed,
        owner,
      };
    })
    .sort((left, right) => right.bytes - left.bytes);
}

const artifact: BuildSizeArtifact = {
  status: failures.length > 0 ? "failed" : "passed",
  timestamp: new Date().toISOString(),
  distDir: "dist",
  budgets: {
    maxTotalBytes,
    maxEntryBytes,
    maxChunkBytes,
  },
  totalBytes,
  entries,
  chunks,
  failures,
};

writeBuildSizeArtifacts(artifact);

if (failures.length > 0) {
  console.error("@moritzbrantner/ui build-size verification failed:");

  for (const failure of failures) {
    console.error(`- ${failure}`);
  }

  process.exit(1);
}

console.log(`@moritzbrantner/ui build-size verified (${formatBytes(totalBytes)} raw JS)`);

function writeBuildSizeArtifacts(artifact: BuildSizeArtifact) {
  mkdirSync(benchmarkResultsDir, { recursive: true });
  writeFileSync(buildSizeJsonPath, `${JSON.stringify(artifact, null, 2)}\n`);
  writeFileSync(buildSizeMarkdownPath, formatBuildSizeMarkdown(artifact));
}

function verifyOptimizedThemeEntries() {
  for (const themeName of optimizedThemeNames) {
    verifyLeanThemeEntry(themeName, path.join(distDir, `${themeName}.js`), {
      entryBudgetBytes: maxLeanThemeEntryBytes,
      forbidThemeRootEntry: false,
    });
    verifyLeanThemeEntry(themeName, path.join(distDir, "themes", `${themeName}.js`), {
      entryBudgetBytes: maxOptimizedThemeEntryBytes,
      forbidThemeRootEntry: true,
    });
  }
}

function verifyLeanThemeEntry(
  themeName: (typeof optimizedThemeNames)[number],
  entryPath: string,
  options: {
    entryBudgetBytes: number;
    forbidThemeRootEntry: boolean;
  },
) {
  const relativePath = path.relative(packageRoot, entryPath);

  if (!existsSync(entryPath)) {
    failures.push(`missing optimized theme entry ${relativePath}`);
    return;
  }

  const bytes = statSync(entryPath).size;

  if (bytes > options.entryBudgetBytes) {
    failures.push(
      `${relativePath} is ${formatBytes(bytes)}, above ${formatBytes(options.entryBudgetBytes)} lean theme entry budget`,
    );
  }

  const graph = collectReachableJsFiles(entryPath);
  const graphRelativePaths = [...graph].map((filePath) => path.relative(packageRoot, filePath));
  const graphBytes = [...graph].reduce((sum, filePath) => sum + statSync(filePath).size, 0);

  if (simpleThemeNames.includes(themeName as (typeof simpleThemeNames)[number])) {
    if (graphBytes > maxSimpleThemeReachableGraphBytes) {
      failures.push(
        `${relativePath} reachable graph is ${formatBytes(graphBytes)}, above ${formatBytes(maxSimpleThemeReachableGraphBytes)} simple theme budget`,
      );
    }
  }

  const forbiddenGraphPaths = [
    "dist/index.js",
    "dist/client.js",
    "dist/stable.js",
    "dist/patterns.js",
    "dist/themes.js",
    ...optimizedThemeNames
      .filter((otherThemeName) => otherThemeName !== themeName)
      .map((otherThemeName) => `dist/${otherThemeName}.js`),
  ];

  if (options.forbidThemeRootEntry) {
    forbiddenGraphPaths.push(`dist/${themeName}.js`);
  }

  for (const forbiddenGraphPath of forbiddenGraphPaths) {
    if (graphRelativePaths.includes(forbiddenGraphPath)) {
      failures.push(`${relativePath} reachable graph must not include ${forbiddenGraphPath}`);
    }
  }

  const graphSource = [...graph].map((filePath) => readFileSync(filePath, "utf8")).join("\n");

  for (const siblingThemeName of optimizedThemeNames.filter(
    (otherThemeName) => otherThemeName !== themeName,
  )) {
    if (new RegExp(`["']${escapeRegExp(siblingThemeName)}["']`).test(graphSource)) {
      failures.push(
        `${relativePath} reachable graph must not contain sibling theme literal "${siblingThemeName}"`,
      );
    }
  }
}

function collectReachableJsFiles(entryPath: string): Set<string> {
  const reachableFiles = new Set<string>();
  const pendingFiles = [entryPath];

  while (pendingFiles.length > 0) {
    const filePath = pendingFiles.pop();

    if (!filePath || reachableFiles.has(filePath)) {
      continue;
    }

    reachableFiles.add(filePath);

    const source = readFileSync(filePath, "utf8");

    for (const specifier of readRelativeJsSpecifiers(source)) {
      const resolvedPath = path.resolve(path.dirname(filePath), specifier);

      if (resolvedPath.startsWith(distDir) && existsSync(resolvedPath)) {
        pendingFiles.push(resolvedPath);
      }
    }
  }

  return reachableFiles;
}

function readRelativeJsSpecifiers(source: string): string[] {
  return [
    ...source.matchAll(/\b(?:import|export)\b(?:[^"']*\bfrom)?\s*["'](\.[^"']+\.js)["']/g),
  ].map((match) => match[1]);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
