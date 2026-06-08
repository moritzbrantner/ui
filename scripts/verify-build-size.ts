import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

type BuildSizeEntry = {
  name: string;
  relativePath: string;
  bytes: number;
  budgetBytes: number;
  passed: boolean;
  owner: string;
};
type BuildSizeChunk = {
  relativePath: string;
  bytes: number;
  budgetBytes: number;
  passed: boolean;
  owner: string;
};
type BuildSizeArtifact = {
  status: "passed" | "failed";
  timestamp: string;
  distDir: "dist";
  budgets: {
    maxTotalBytes: number;
    maxEntryBytes: number;
    maxChunkBytes: number;
  };
  totalBytes: number;
  entries: BuildSizeEntry[];
  chunks: BuildSizeChunk[];
  failures: string[];
};

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(packageRoot, "dist");
const benchmarkResultsDir = path.join(packageRoot, "benchmark-results");
const buildSizeJsonPath = path.join(benchmarkResultsDir, "build-size.json");
const buildSizeMarkdownPath = path.join(benchmarkResultsDir, "build-size.md");
const maxTotalBytes = 880 * 1024;
const maxEntryBytes = 35 * 1024;
const maxChunkBytes = 40 * 1024;
const maxOptimizedThemeEntryBytes = 1024;
const optimizedThemeNames = ["zleek", "bobba", "atlas", "studio", "paper", "pop", "pulse"] as const;
const publicEntries = [
  "index",
  "server",
  "client",
  "bobba",
  "zleek",
  "atlas",
  "studio",
  "paper",
  "pop",
  "pulse",
  "themes",
  "themes/zleek",
  "themes/bobba",
  "themes/atlas",
  "themes/studio",
  "themes/paper",
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

function formatBuildSizeMarkdown(artifact: BuildSizeArtifact) {
  const lines = [
    "# Build Size Results",
    "",
    "- Command: `bun run verify:build-size`",
    `- Status: \`${artifact.status}\``,
    `- Timestamp: \`${artifact.timestamp}\``,
    `- Total JS size: ${formatBytes(artifact.totalBytes)} / ${formatBytes(artifact.budgets.maxTotalBytes)}`,
    "",
    "## Public Entries",
    "",
    ...formatMarkdownTable(
      ["Entry", "Owner", "Size", "Budget", "Status"],
      artifact.entries.map((entry) => [
        `\`${entry.relativePath}\``,
        entry.owner,
        formatBytes(entry.bytes),
        formatBytes(entry.budgetBytes),
        entry.passed ? "passed" : "failed",
      ]),
      new Set([2, 3]),
    ),
    "",
    "## Largest Chunks",
    "",
    ...formatMarkdownTable(
      ["Chunk", "Owner", "Size", "Budget", "Status"],
      artifact.chunks
        .slice(0, 30)
        .map((chunk) => [
          `\`${chunk.relativePath}\``,
          chunk.owner,
          formatBytes(chunk.bytes),
          formatBytes(chunk.budgetBytes),
          chunk.passed ? "passed" : "failed",
        ]),
      new Set([2, 3]),
    ),
    "",
    "## Failures",
    "",
    ...(artifact.failures.length > 0
      ? artifact.failures.map((failure) => `- ${failure}`)
      : ["No build-size failures."]),
    "",
  ];

  return lines.join("\n");
}

function formatMarkdownTable(
  headers: readonly string[],
  rows: readonly string[][],
  rightAlignedColumns = new Set<number>(),
) {
  const widths = headers.map((header, columnIndex) =>
    Math.max(header.length, ...rows.map((row) => row[columnIndex].length)),
  );

  return [
    formatMarkdownTableRow(headers, widths, rightAlignedColumns),
    formatMarkdownTableRow(
      widths.map((width, index) =>
        rightAlignedColumns.has(index) ? `${"-".repeat(width - 1)}:` : "-".repeat(width),
      ),
      widths,
    ),
    ...rows.map((row) => formatMarkdownTableRow(row, widths, rightAlignedColumns)),
  ];
}

function formatMarkdownTableRow(
  cells: readonly string[],
  widths: readonly number[],
  rightAlignedColumns = new Set<number>(),
) {
  return `| ${cells
    .map((cell, index) =>
      rightAlignedColumns.has(index) ? cell.padStart(widths[index]) : cell.padEnd(widths[index]),
    )
    .join(" | ")} |`;
}

function listFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return listFiles(filePath);
    }

    return filePath;
  });
}

function getLikelyOwner(fileName: string) {
  const ownerPatterns: Array<[RegExp, string]> = [
    [/primitive-components|primitive-/, "primitive stories"],
    [/data-grid/i, "DataGrid"],
    [/navbar/i, "Navbar"],
    [/calendar|day-picker/i, "Calendar"],
    [/combobox|base-ui/i, "Combobox"],
    [/motion/i, "Motion"],
    [/axe/i, "Storybook a11y"],
    [/iframe|components|DocsRenderer/i, "Storybook"],
    [/react/i, "React"],
  ];

  return ownerPatterns.find(([pattern]) => pattern.test(fileName))?.[1] ?? "shared";
}

function formatBytes(bytes: number) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function verifyOptimizedThemeEntries() {
  for (const themeName of optimizedThemeNames) {
    const entryPath = path.join(distDir, "themes", `${themeName}.js`);
    const relativePath = `dist/themes/${themeName}.js`;

    if (!existsSync(entryPath)) {
      failures.push(`missing optimized theme entry ${relativePath}`);
      continue;
    }

    const bytes = statSync(entryPath).size;

    if (bytes > maxOptimizedThemeEntryBytes) {
      failures.push(
        `${relativePath} is ${formatBytes(bytes)}, above ${formatBytes(maxOptimizedThemeEntryBytes)} optimized theme budget`,
      );
    }

    const source = readFileSync(entryPath, "utf8");
    const forbiddenReferences = [
      "dist/index.js",
      "dist/client.js",
      "dist/stable.js",
      "dist/themes.js",
      `dist/${themeName}.js`,
      "../index.js",
      "../client.js",
      "../stable.js",
      "../themes.js",
      `../${themeName}.js`,
    ];

    for (const forbiddenReference of forbiddenReferences) {
      if (source.includes(forbiddenReference)) {
        failures.push(`${relativePath} must not reference broad barrel ${forbiddenReference}`);
      }
    }
  }
}
