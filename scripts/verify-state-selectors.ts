import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

type StateSelectorRule = {
  paths: string[];
  forbidden: string[];
  replacementHint: string;
};

type Violation = {
  path: string;
  line: number;
  selector: string;
  replacementHint: string;
};

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const componentsRoot = path.join(packageRoot, "src", "components");

const stateSelectorRules: StateSelectorRule[] = [
  {
    paths: [
      "src/components/stable/accordion.tsx",
      "src/components/patterns/disclosure-panel.tsx",
      "src/components/stable/dialog.tsx",
      "src/components/stable/alert-dialog.tsx",
      "src/components/stable/sheet.tsx",
      "src/components/stable/popover.tsx",
      "src/components/stable/hover-card.tsx",
      "src/components/stable/select.tsx",
      "src/components/stable/dropdown-menu.tsx",
      "src/components/stable/context-menu.tsx",
      "src/components/stable/menubar.tsx",
      "src/components/stable/tooltip.tsx",
      "src/components/stable/drawer.tsx",
      "src/components/stable/mobile-slide.tsx",
      "src/components/stable/navigation-menu.tsx",
      "src/components/stable/sidebar.tsx",
    ],
    forbidden: ["data-open", "data-closed", "group-data-open", "peer-data-open"],
    replacementHint: "Use data-[state=open] / data-[state=closed] variants.",
  },
  {
    paths: ["src/components/stable/navigation-menu.tsx"],
    forbidden: ["data-popup-open", "group-data-popup-open"],
    replacementHint: 'Radix NavigationMenu trigger uses data-state="open".',
  },
  {
    paths: ["src/components/stable/tabs.tsx"],
    forbidden: [
      "data-active",
      "group-data-[variant=default]/tabs-list:data-active",
      "group-data-[variant=line]/tabs-list:data-active",
    ],
    replacementHint: 'Radix Tabs trigger uses data-state="active".',
  },
  {
    paths: [
      "src/components/stable/switch.tsx",
      "src/components/stable/checkbox.tsx",
      "src/components/stable/radio-group.tsx",
      "src/components/stable/field.tsx",
    ],
    forbidden: ["data-checked", "data-unchecked", "has-data-checked"],
    replacementHint: "Use data-[state=checked] / data-[state=unchecked] variants.",
  },
];

const componentFiles = new Set(collectComponentFiles(componentsRoot));
const violations: Violation[] = [];

for (const rule of stateSelectorRules) {
  const forbidden = [...rule.forbidden].sort((left, right) => right.length - left.length);

  for (const relativePath of rule.paths) {
    const absolutePath = path.join(packageRoot, relativePath);

    if (!componentFiles.has(absolutePath) && !existsSync(absolutePath)) {
      violations.push({
        path: relativePath,
        line: 1,
        selector: "(missing file)",
        replacementHint: "Update verify-state-selectors.ts if this component moved.",
      });
      continue;
    }

    const source = readFileSync(absolutePath, "utf8");
    const lines = source.split(/\r?\n/);

    lines.forEach((lineSource, index) => {
      for (const token of extractSelectorTokens(lineSource)) {
        const matchedForbidden = forbidden.find((selector) => token.includes(selector));

        if (matchedForbidden) {
          violations.push({
            path: relativePath,
            line: index + 1,
            selector: token,
            replacementHint: rule.replacementHint,
          });
        }
      }
    });
  }
}

if (violations.length > 0) {
  console.error("@moritzbrantner/ui state selector verification failed:");

  for (const violation of violations) {
    console.error(
      `- ${violation.path}:${violation.line}: ${violation.selector} -> ${violation.replacementHint}`,
    );
  }

  process.exit(1);
}

console.log("@moritzbrantner/ui state selectors verified");

function collectComponentFiles(directory: string): string[] {
  const files: string[] = [];

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...collectComponentFiles(entryPath));
      continue;
    }

    if (entry.isFile() && /\.(?:ts|tsx)$/.test(entry.name)) {
      files.push(entryPath);
    }
  }

  return files;
}

function extractSelectorTokens(lineSource: string): string[] {
  return lineSource
    .split(/[\s"'`{},()]+/)
    .map((token) => token.trim())
    .filter(Boolean);
}
