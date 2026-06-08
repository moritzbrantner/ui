import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { ComponentTier } from "../src/component-registry";
import { mobileUsabilityConfig } from "./mobile-usability-config";

export type MobileUsabilityFinding = {
  component: string;
  tier: ComponentTier;
  storyId: string;
  storyTitle: string;
  storyName: string;
  importPath: string;
  viewport: { width: 360; height: 568 };
  severity: "fail";
  category:
    | "render"
    | "document-overflow"
    | "internal-scroll"
    | "target-size"
    | "target-actionability"
    | "text-clipping"
    | "overlay"
    | "keyboard-focus";
  message: string;
  selector?: string;
  boundingBox?: { x: number; y: number; width: number; height: number };
  screenshotPath?: string;
};

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const reportDirectory = path.join(packageRoot, "test-results", "mobile-usability");
const fragmentDirectory = path.join(reportDirectory, "fragments");

export function prepareMobileUsabilityReports() {
  rmSync(reportDirectory, { force: true, recursive: true });
  mkdirSync(fragmentDirectory, { recursive: true });
}

export function writeMobileUsabilityReports(
  reportFindings: MobileUsabilityFinding[] = readMobileUsabilityFindingFragments(),
) {
  mkdirSync(reportDirectory, { recursive: true });
  writeFileSync(
    path.join(reportDirectory, "report.json"),
    `${JSON.stringify(reportFindings, null, 2)}\n`,
  );
  writeFileSync(path.join(reportDirectory, "report.md"), formatMarkdownReport(reportFindings));
}

export function writeMobileUsabilityFindingFragment(
  componentName: string,
  componentFindings: MobileUsabilityFinding[],
) {
  mkdirSync(fragmentDirectory, { recursive: true });
  writeFileSync(
    path.join(fragmentDirectory, `${sanitizeFileName(componentName)}.json`),
    `${JSON.stringify(componentFindings, null, 2)}\n`,
  );
}

function readMobileUsabilityFindingFragments() {
  if (!existsSync(fragmentDirectory)) {
    return [] satisfies MobileUsabilityFinding[];
  }

  return readdirSync(fragmentDirectory)
    .filter((fileName) => fileName.endsWith(".json"))
    .flatMap((fileName) => {
      const filePath = path.join(fragmentDirectory, fileName);
      const source = readFileSync(filePath, "utf8").trim();

      return source.length > 0 ? (JSON.parse(source) as MobileUsabilityFinding[]) : [];
    });
}

function formatMarkdownReport(reportFindings: MobileUsabilityFinding[]) {
  if (reportFindings.length === 0) {
    return "# Mobile Usability Report\n\nNo mobile usability findings.\n";
  }

  const sections = ["# Mobile Usability Report", ""];

  for (const finding of reportFindings) {
    sections.push(`## ${finding.component}`);
    sections.push(`- Component: ${finding.component} (${finding.tier})`);
    sections.push(`- Story: ${finding.storyTitle} / ${finding.storyName} (${finding.storyId})`);
    sections.push(`- Failure category: ${finding.category}`);
    sections.push(`- What failed: ${finding.message}`);

    if (finding.selector) {
      sections.push(`- Selector: \`${finding.selector}\``);
    }

    if (finding.boundingBox) {
      sections.push(`- Bounding box: \`${JSON.stringify(finding.boundingBox)}\``);
    }

    if (finding.screenshotPath) {
      sections.push(`- Screenshot: ${finding.screenshotPath}`);
    }

    sections.push(
      "- Suggested next decision: fix layout, add mobile variant, mark desktop/web-only, use an internal scroll container, or replace with an alternative component.",
    );
    sections.push("");
  }

  return `${sections.join("\n")}\n`;
}

function sanitizeFileName(value: string) {
  return value.replace(/[^a-z0-9_-]+/gi, "-").replace(/^-+|-+$/g, "");
}

export const mobileUsabilityViewport = {
  width: mobileUsabilityConfig.viewport.width,
  height: mobileUsabilityConfig.viewport.height,
} as const;
