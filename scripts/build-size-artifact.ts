export type BuildSizeEntry = {
  name: string;
  relativePath: string;
  bytes: number;
  budgetBytes: number;
  passed: boolean;
  owner: string;
};

export type BuildSizeChunk = {
  relativePath: string;
  bytes: number;
  budgetBytes: number;
  passed: boolean;
  owner: string;
};

export type BuildSizeArtifact = {
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

export function formatBuildSizeMarkdown(artifact: BuildSizeArtifact) {
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

export function getLikelyOwner(fileName: string) {
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

export function formatBytes(bytes: number) {
  return `${(bytes / 1024).toFixed(1)} KB`;
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
