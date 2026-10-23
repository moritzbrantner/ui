// Design-system drift report.
//
// Diagnostics (reported, never failing): arbitrary Tailwind spacing/radius/shadow/duration values,
// unused tokens, duplicate aliases, component tokens that never diverge from their default, and
// per-theme override coverage. They establish a baseline instead of failing on historical debt.
//
// Blocking (fails `--check`, wired into `bun run lint`): raw color literals in stable and pattern
// component sources. Colors there must come from theme tokens; the few reasoned exceptions live in
// `rawColorAllowlist` below.
//
// Usage:
//   bun ./scripts/report-design-drift.ts           write benchmark-results/design-drift.{json,md}
//   bun ./scripts/report-design-drift.ts --check   print blocking findings and exit 1 if any
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  uiThemeTokenValues,
  uiTokenCategories,
  uiTokenMetadata,
  type UiTokenCategory,
} from "../src/token-metadata.js";

type Finding = {
  rule: string;
  file: string;
  line: number;
  value: string;
};

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const checkOnly = process.argv.includes("--check");
const outputDir = path.join(packageRoot, "benchmark-results");
const blockingTiers = ["stable", "patterns"] as const;
const builtInThemes = ["zleek", "atlas", "studio", "paper", "scholia", "pop", "pulse"] as const;

// Files allowed to keep raw color literals, with the reason. Keep this list short: new entries need
// a reason that a theme token cannot express the color.
const rawColorAllowlist = new Map<string, string>([
  [
    "src/components/stable/language-switcher.tsx",
    "Flag artwork: national flag colors are fixed and must not follow the theme.",
  ],
  [
    "src/components/stable/button-variants.ts",
    "Historical debt: ghost-variant hover shadow predates --ui-shadow-* tokens.",
  ],
  [
    "src/components/stable/angle-input.tsx",
    "Historical debt: dial bevel highlight/shadow predates --glass-* tokens.",
  ],
  [
    "src/components/stable/keyboard.tsx",
    "Historical debt: key press shadow predates --ui-shadow-* tokens.",
  ],
  [
    "src/components/stable/theme-mode-switch.tsx",
    "Historical debt: thumb shadow predates --ui-shadow-* tokens.",
  ],
  [
    "src/components/patterns/connection-status.tsx",
    "Historical debt: status glow colors predate --success/--destructive shadow tokens.",
  ],
]);

// Literal colors only; `hsl(var(--x))` / `oklch(from var(--x) ...)` are token-backed.
const rawColorPattern =
  /#[0-9a-fA-F]{3,8}\b|(?<![a-zA-Z])(?:rgba?|hsla?|oklch|oklab|lab|lch)\((?!\s*(?:var\(|from\b))[^)]*\)/g;
const arbitraryValueRules: ReadonlyArray<[rule: string, pattern: RegExp]> = [
  [
    "arbitrary-spacing",
    /(?<![\w-])-?(?:p[xytrbl]?|m[xytrbl]?|gap(?:-[xy])?|space-[xy]|inset(?:-[xy])?|top|right|bottom|left)-\[(?!var\()[^\]]+\]/g,
  ],
  ["arbitrary-radius", /(?<![\w-])rounded(?:-[a-z]{1,2})?-\[(?!var\()[^\]]+\]/g],
  ["arbitrary-shadow", /(?<![\w-])shadow-\[(?!var\()[^\]]+\]/g],
  ["arbitrary-duration", /(?<![\w-])duration-\[(?!var\()[^\]]+\]/g],
];

const componentFiles = listFiles(path.join(packageRoot, "src", "components")).filter(
  (file) => /\.tsx?$/.test(file) && !/\.(test|stories)\.tsx?$/.test(file),
);

const rawColors: Finding[] = [];
const arbitraryValues: Finding[] = [];

for (const absolute of componentFiles) {
  const file = relative(absolute);
  const lines = readFileSync(absolute, "utf8").split("\n");

  lines.forEach((text, index) => {
    for (const match of text.matchAll(rawColorPattern)) {
      rawColors.push({ rule: "raw-color", file, line: index + 1, value: match[0] });
    }
    for (const [rule, pattern] of arbitraryValueRules) {
      for (const match of text.matchAll(pattern)) {
        arbitraryValues.push({ rule, file, line: index + 1, value: match[0] });
      }
    }
  });
}

const blocking = rawColors.filter(
  (finding) =>
    blockingTiers.some((tier) => finding.file.startsWith(`src/components/${tier}/`)) &&
    !rawColorAllowlist.has(finding.file),
);

if (checkOnly) {
  if (blocking.length > 0) {
    console.error("Design drift: raw color literals in stable/pattern components:");
    for (const finding of blocking) {
      console.error(`- ${finding.file}:${finding.line} ${finding.value}`);
    }
    console.error(
      "Use a theme token (var(--...)) or add a reasoned entry to rawColorAllowlist in scripts/report-design-drift.ts.",
    );
    process.exit(1);
  }
  console.log("@moritzbrantner/ui design drift verified (no blocking findings)");
  process.exit(0);
}

const report = {
  blocking: { rule: "raw-color in stable/patterns components", findings: blocking },
  allowlist: Object.fromEntries([...rawColorAllowlist].sort(([a], [b]) => a.localeCompare(b))),
  diagnostics: {
    rawColors: summarizeByFile(rawColors),
    arbitraryValues: countBy(arbitraryValues, (finding) => finding.rule),
    arbitraryValuesByFile: summarizeByFile(arbitraryValues),
    unusedTokens: findUnusedTokens(),
    duplicateAliases: findDuplicateAliases(),
    nonDivergingComponentTokens: findNonDivergingComponentTokens(),
    themeOverrideCoverage: themeOverrideCoverage(),
  },
};

mkdirSync(outputDir, { recursive: true });
writeFileSync(path.join(outputDir, "design-drift.json"), `${JSON.stringify(report, null, 2)}\n`);
writeFileSync(path.join(outputDir, "design-drift.md"), renderMarkdown());
console.log(
  `Design drift: ${blocking.length} blocking, ${rawColors.length} raw colors, ${arbitraryValues.length} arbitrary values, ${report.diagnostics.unusedTokens.length} unused tokens. Wrote benchmark-results/design-drift.{json,md}`,
);

function findUnusedTokens(): string[] {
  const corpus = [
    ...listFiles(path.join(packageRoot, "src")).filter((file) => /\.(tsx?|css)$/.test(file)),
    path.join(packageRoot, "base.css"),
    ...builtInThemes.map((theme) => path.join(packageRoot, theme, "styles.css")),
  ]
    .map((file) => readFileSync(file, "utf8"))
    .join("\n");

  return uiTokenMetadata
    .map((token) => token.name)
    .filter((name) => !new RegExp(`var\\(\\s*${escapeRegExp(name)}\\s*[,)]`).test(corpus))
    .sort();
}

function allThemeModes() {
  return ["bobba", ...builtInThemes].flatMap((theme) => {
    const set = uiThemeTokenValues[theme as keyof typeof uiThemeTokenValues];
    return [
      { theme, mode: "light", tokens: set.light as Record<string, string> },
      { theme, mode: "dark", tokens: set.dark as Record<string, string> },
    ];
  });
}

// Token groups that alias the same `var(--x)` in every theme and mode: one of them is redundant.
function findDuplicateAliases(): Array<{ target: string; tokens: string[] }> {
  const modes = allThemeModes();
  const groups = new Map<string, string[]>();

  for (const { name } of uiTokenMetadata) {
    const values = modes.map(({ tokens }) => tokens[name]);
    if (values.some((value) => value === undefined || !/^var\(--[\w-]+\)$/.test(value))) {
      continue;
    }
    const key = values.join("|");
    groups.set(key, [...(groups.get(key) ?? []), name]);
  }

  return [...groups]
    .filter(([, tokens]) => tokens.length > 1)
    .map(([key, tokens]) => ({ target: key.split("|")[0]!, tokens: tokens.sort() }))
    .sort((left, right) => left.target.localeCompare(right.target));
}

// Component tokens with the same value in every theme and mode never express a theme decision.
function findNonDivergingComponentTokens(): Array<{ token: string; value: string }> {
  const modes = allThemeModes();

  return uiTokenMetadata
    .filter((token) => token.category === "component")
    .flatMap(({ name }) => {
      const values = new Set(modes.map(({ tokens }) => tokens[name]));
      const [value] = values;
      return values.size === 1 && value !== undefined ? [{ token: name, value }] : [];
    })
    .sort((left, right) => left.token.localeCompare(right.token));
}

// Per theme and category: how many tokens differ from the Bobba default (light or dark).
function themeOverrideCoverage() {
  const defaults = uiThemeTokenValues.bobba;

  return builtInThemes.map((theme) => {
    const set = uiThemeTokenValues[theme];
    const byCategory = Object.fromEntries(
      uiTokenCategories.map((category) => {
        const tokens = uiTokenMetadata.filter((token) => token.category === category);
        const overridden = tokens.filter(
          ({ name }) =>
            (set.light as Record<string, string>)[name] !==
              (defaults.light as Record<string, string>)[name] ||
            (set.dark as Record<string, string>)[name] !==
              (defaults.dark as Record<string, string>)[name],
        ).length;
        return [category, { overridden, total: tokens.length }];
      }),
    ) as Record<UiTokenCategory, { overridden: number; total: number }>;
    const untouched = uiTokenCategories.filter((category) => byCategory[category].overridden === 0);
    return { theme, byCategory, untouchedCategories: untouched };
  });
}

function renderMarkdown(): string {
  const { diagnostics } = report;
  const lines = [
    "# Design Drift Report",
    "",
    "Generated by `bun run report:design-drift`. Diagnostics only, except **Blocking**.",
    "",
    "## Blocking",
    "",
    blocking.length === 0
      ? "None."
      : blocking.map((f) => `- \`${f.file}:${f.line}\` ${f.value}`).join("\n"),
    "",
    "## Raw colors by file",
    "",
    "| File | Count | Allowlisted |",
    "| --- | ---: | --- |",
    ...Object.entries(diagnostics.rawColors).map(
      ([file, count]) => `| \`${file}\` | ${count} | ${rawColorAllowlist.has(file) ? "yes" : ""} |`,
    ),
    "",
    "## Arbitrary values",
    "",
    "| Rule | Count |",
    "| --- | ---: |",
    ...Object.entries(diagnostics.arbitraryValues).map(([rule, count]) => `| ${rule} | ${count} |`),
    "",
    "## Unused tokens",
    "",
    diagnostics.unusedTokens.length === 0
      ? "None."
      : diagnostics.unusedTokens.map((token) => `- \`${token}\``).join("\n"),
    "",
    "## Duplicate aliases",
    "",
    diagnostics.duplicateAliases.length === 0
      ? "None."
      : diagnostics.duplicateAliases
          .map(
            ({ target, tokens }) => `- ${tokens.map((t) => `\`${t}\``).join(", ")} → \`${target}\``,
          )
          .join("\n"),
    "",
    "## Component tokens that never diverge",
    "",
    diagnostics.nonDivergingComponentTokens.length === 0
      ? "None."
      : diagnostics.nonDivergingComponentTokens
          .map(({ token, value }) => `- \`${token}\`: \`${value}\``)
          .join("\n"),
    "",
    "## Theme override coverage",
    "",
    `| Theme | ${uiTokenCategories.join(" | ")} |`,
    `| --- | ${uiTokenCategories.map(() => "---:").join(" | ")} |`,
    ...diagnostics.themeOverrideCoverage.map(
      ({ theme, byCategory }) =>
        `| ${theme} | ${uiTokenCategories
          .map((category) => `${byCategory[category].overridden}/${byCategory[category].total}`)
          .join(" | ")} |`,
    ),
    "",
  ];
  return lines.join("\n");
}

function summarizeByFile(findings: Finding[]): Record<string, number> {
  return countBy(findings, (finding) => finding.file);
}

function countBy<T>(items: T[], key: (item: T) => string): Record<string, number> {
  const counts = new Map<string, number>();
  for (const item of items) {
    counts.set(key(item), (counts.get(key(item)) ?? 0) + 1);
  }
  return Object.fromEntries([...counts].sort(([a], [b]) => a.localeCompare(b)));
}

function listFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const full = path.join(directory, entry.name);
      return entry.isDirectory() ? listFiles(full) : [full];
    })
    .sort();
}

function relative(file: string): string {
  return path.relative(packageRoot, file).split(path.sep).join("/");
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
