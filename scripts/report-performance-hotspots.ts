import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

type UnlighthouseSummary = {
  path: string;
  score?: number;
  performance?: number;
  accessibility?: number;
  "best-practices"?: number;
};
type LighthouseReport = {
  finalDisplayedUrl?: string;
  finalUrl?: string;
  categories?: Record<string, { score: number | null }>;
  audits?: Record<
    string,
    {
      displayValue?: string;
      numericValue?: number;
      score?: number | null;
    }
  >;
};
type FileSize = {
  bytes: number;
  fileName: string;
  owner: string;
  relativePath: string;
};

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const unlighthouseDir = path.join(packageRoot, "unlighthouse-report");
const storybookAssetsDir = path.join(packageRoot, "storybook-static", "assets");
const distDir = path.join(packageRoot, "dist");

printUnlighthouseSummary();
printLighthouseMetrics();
printFileSizes("Storybook JS chunks", storybookAssetsDir, 30);
printFileSizes("Published dist JS chunks", distDir, 30);

function printUnlighthouseSummary() {
  const summaryPath = path.join(unlighthouseDir, "ci-result.json");
  printHeading("Unlighthouse Routes");

  if (!existsSync(summaryPath)) {
    console.log("No unlighthouse-report/ci-result.json found.");
    return;
  }

  const summary = JSON.parse(readFileSync(summaryPath, "utf8")) as UnlighthouseSummary[];
  const sorted = [...summary].sort(
    (left, right) => (left.performance ?? 0) - (right.performance ?? 0),
  );

  for (const item of sorted) {
    console.log(
      [
        item.path,
        `score=${formatScore(item.score)}`,
        `performance=${formatScore(item.performance)}`,
        `accessibility=${formatScore(item.accessibility)}`,
        `best-practices=${formatScore(item["best-practices"])}`,
      ].join(" | "),
    );
  }
}

function printLighthouseMetrics() {
  printHeading("Core Lighthouse Metrics");

  const reportFiles = listFiles(path.join(unlighthouseDir, "reports")).filter((filePath) =>
    filePath.endsWith("lighthouse.json"),
  );

  if (reportFiles.length === 0) {
    console.log("No Lighthouse JSON reports found.");
    return;
  }

  for (const filePath of reportFiles.sort()) {
    const report = JSON.parse(readFileSync(filePath, "utf8")) as LighthouseReport;
    const reportUrl = new URL(report.finalDisplayedUrl ?? report.finalUrl ?? "http://local/");
    const storyId = reportUrl.searchParams.get("id") ?? path.basename(path.dirname(filePath));
    const audits = report.audits ?? {};

    console.log(`\n${storyId}`);
    for (const auditId of [
      "first-contentful-paint",
      "largest-contentful-paint",
      "speed-index",
      "interactive",
      "total-blocking-time",
      "cumulative-layout-shift",
      "unused-javascript",
      "total-byte-weight",
      "dom-size",
    ]) {
      const audit = audits[auditId];

      if (!audit) {
        continue;
      }

      console.log(
        `  ${auditId}: ${audit.displayValue ?? audit.numericValue ?? "n/a"} (score ${formatScore(audit.score)})`,
      );
    }
  }
}

function printFileSizes(title: string, directory: string, limit: number) {
  printHeading(title);

  if (!existsSync(directory)) {
    console.log(`${path.relative(packageRoot, directory)} not found.`);
    return;
  }

  const files = listFiles(directory)
    .filter((filePath) => filePath.endsWith(".js"))
    .map((filePath): FileSize => {
      const relativePath = path.relative(packageRoot, filePath);
      const fileName = path.basename(filePath);

      return {
        bytes: statSync(filePath).size,
        fileName,
        owner: getLikelyOwner(fileName),
        relativePath,
      };
    })
    .sort((left, right) => right.bytes - left.bytes)
    .slice(0, limit);

  for (const file of files) {
    console.log(
      `${formatKb(file.bytes).padStart(8)} | ${file.owner.padEnd(18)} | ${file.relativePath}`,
    );
  }
}

function listFiles(directory: string): string[] {
  if (!existsSync(directory)) {
    return [];
  }

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
    [/platform-navbar/i, "PlatformNavbar"],
    [/chart|recharts/i, "Chart"],
    [/calendar|day-picker/i, "Calendar"],
    [/combobox|base-ui/i, "Combobox"],
    [/motion/i, "Motion"],
    [/axe/i, "Storybook a11y"],
    [/iframe|components|DocsRenderer/i, "Storybook"],
    [/react/i, "React"],
  ];

  return ownerPatterns.find(([pattern]) => pattern.test(fileName))?.[1] ?? "shared";
}

function printHeading(title: string) {
  console.log(`\n## ${title}`);
}

function formatScore(score: number | null | undefined) {
  return typeof score === "number" ? score.toFixed(2) : "n/a";
}

function formatKb(bytes: number) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}
