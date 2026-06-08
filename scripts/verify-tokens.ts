import { readFileSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { uiTokenMetadata } from "../src/token-metadata.js";
import { uiThemeTokenValues } from "../src/token-metadata.js";
import { uiTokenNames } from "../src/token-names.js";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tokenFiles = [
  "styles.css",
  "bobba/styles.css",
  "zleek/styles.css",
  "atlas/styles.css",
  "studio/styles.css",
  "paper/styles.css",
  "pop/styles.css",
  "pulse/styles.css",
];
const themeStylesheets = [
  "bobba/styles.css",
  "zleek/styles.css",
  "atlas/styles.css",
  "studio/styles.css",
  "paper/styles.css",
  "pop/styles.css",
  "pulse/styles.css",
];
const generatedArtifactFiles = [
  "base.css",
  "styles.css",
  "component-sources.css",
  "theme-scopes.css",
  ...themeStylesheets,
];
const simpleThemeNames = ["bobba", "atlas", "studio", "paper"] as const;
const simpleThemeStylesheets = simpleThemeNames.map((themeName) => `${themeName}/styles.css`);
const maxSimpleThemeCssBytes = 16 * 1024;
const componentSourceDirectives = [
  '@source "./dist/**/*.{js,mjs}";',
  '@source "./src/**/*.{ts,tsx}";',
] as const;
const requiredPublicUiTokens = uiTokenMetadata
  .filter((token) => token.name.startsWith("--ui-") || token.name.startsWith("--glass-"))
  .map((token) => token.name);
const requiredPublicDarkTokens = uiTokenMetadata
  .filter((token) => token.category === "color" || token.name.startsWith("--glass-"))
  .map((token) => token.name);
const tokenBackedComponents = [
  ["src/components/stable/button.tsx", "--ui-button-height-md"],
  ["src/components/stable/input.tsx", "--ui-input-height"],
  ["src/components/stable/card.tsx", "--ui-card-radius"],
  ["src/components/stable/select.tsx", "--ui-input-height"],
  ["src/components/stable/tabs.tsx", "--ui-tabs-radius"],
  ["src/components/stable/dialog.tsx", "--ui-overlay-radius"],
  ["src/components/stable/popover.tsx", "--ui-overlay-radius"],
  ["src/components/stable/dropdown-menu.tsx", "--ui-menu-item-radius"],
  ["src/components/shell/app-layout.tsx", "--ui-radius-surface"],
  ["src/components/stable/toolbar.tsx", "--ui-toolbar-min-height"],
];
const errors: string[] = [];
const metadataTokenNames = uiTokenMetadata.map((token) => token.name);

if (metadataTokenNames.join("\n") !== uiTokenNames.join("\n")) {
  errors.push("src/token-names.ts must match token names from src/token-metadata.ts");
}

const generatedCheck = spawnSync("bun", ["./scripts/generate-theme-css.ts", "--check"], {
  cwd: packageRoot,
  encoding: "utf8",
  stdio: "pipe",
});

if (generatedCheck.status !== 0) {
  errors.push((generatedCheck.stderr || generatedCheck.stdout).trim());
}

verifyCssImportTopology();
verifyCssSourceTopology();
verifySimpleThemeStylesheets();
verifyTokenContrast();

const baseTokens = readTokens(path.join(packageRoot, "styles.css"));
const requiredTokens = intersection(baseTokens.root, baseTokens.dark);

for (const relativeFile of tokenFiles) {
  const filePath = path.join(packageRoot, relativeFile);
  const source = readFileSync(filePath, "utf8");
  const tokens = readTokens(filePath);

  if (
    tokens.root.size === 0 &&
    tokens.dark.size === 0 &&
    /^\s*@import\s+["']\.\.\/styles\.css["'];?\s*$/m.test(source)
  ) {
    continue;
  }

  for (const token of requiredTokens) {
    if (!tokens.root.has(token)) {
      errors.push(`${relativeFile}: :root is missing ${token}`);
    }

    if (!tokens.dark.has(token)) {
      errors.push(`${relativeFile}: .dark is missing ${token}`);
    }
  }

  if (tokens.root.size > 0 || tokens.dark.size > 0) {
    for (const token of requiredPublicUiTokens) {
      if (!tokens.root.has(token)) {
        errors.push(`${relativeFile}: :root is missing public UI token ${token}`);
      }
    }

    for (const token of requiredPublicDarkTokens) {
      if (!tokens.dark.has(token)) {
        errors.push(`${relativeFile}: .dark is missing public dark token ${token}`);
      }
    }
  }
}

const scopedThemeSource = readFileSync(path.join(packageRoot, "theme-scopes.css"), "utf8");

for (const themeName of ["bobba", "zleek", "atlas", "studio", "paper", "pop", "pulse", "custom"]) {
  if (!scopedThemeSource.includes(`[data-ui-theme="${themeName}"]`)) {
    errors.push(`theme-scopes.css: missing scoped selector for ${themeName}`);
  }
}

for (const [relativeFile, expectedToken] of tokenBackedComponents) {
  const source = readFileSync(path.join(packageRoot, relativeFile), "utf8");

  if (!source.includes(expectedToken)) {
    errors.push(`${relativeFile}: expected token-backed styling with ${expectedToken}`);
  }
}

if (errors.length > 0) {
  console.error("@moritzbrantner/ui token verification failed:");

  for (const error of errors) {
    console.error(`- ${error}`);
  }

  process.exit(1);
}

console.log(`@moritzbrantner/ui token contract verified (${requiredTokens.length} shared tokens)`);

function readTokens(filePath: string): { root: Set<string>; dark: Set<string> } {
  const source = readFileSync(filePath, "utf8");

  return {
    root: extractCustomProperties(extractBlock(source, ":root")),
    dark: extractCustomProperties(extractBlock(source, ".dark")),
  };
}

function extractBlock(source: string, selector: string): string {
  const selectorMatch = new RegExp(`(^|\\n)\\s*${escapeRegExp(selector)}\\s*\\{`, "m").exec(source);

  if (!selectorMatch || selectorMatch.index === undefined) {
    return "";
  }

  const selectorIndex = selectorMatch.index + selectorMatch[0].lastIndexOf(selector);
  const blockStart = source.indexOf("{", selectorIndex);

  if (blockStart === -1) {
    return "";
  }

  let depth = 0;

  for (let index = blockStart; index < source.length; index += 1) {
    const character = source[index];

    if (character === "{") {
      depth += 1;
    } else if (character === "}") {
      depth -= 1;

      if (depth === 0) {
        return source.slice(blockStart + 1, index);
      }
    }
  }

  return "";
}

function extractCustomProperties(block: string): Set<string> {
  return new Set([...block.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((match) => match[1]));
}

function intersection(left: Set<string>, right: Set<string>): string[] {
  return [...left].filter((value) => right.has(value)).sort((a, b) => a.localeCompare(b));
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function verifyTokenContrast() {
  const builtInThemeNames = ["bobba", "zleek", "atlas", "studio", "paper", "pop", "pulse"] as const;
  const textContrastPairs = [
    ["--background", "--foreground"],
    ["--card", "--card-foreground"],
    ["--popover", "--popover-foreground"],
    ["--primary", "--primary-foreground"],
    ["--secondary", "--secondary-foreground"],
    ["--accent", "--accent-foreground"],
    ["--success", "--success-foreground"],
    ["--warning", "--warning-foreground"],
    ["--info", "--info-foreground"],
    ["--sidebar", "--sidebar-foreground"],
    ["--sidebar-primary", "--sidebar-primary-foreground"],
    ["--sidebar-accent", "--sidebar-accent-foreground"],
  ] as const;
  const focusContrastPairs = [
    ["--background", "--ring"],
    ["--card", "--ring"],
    ["--popover", "--ring"],
  ] as const;

  for (const themeName of builtInThemeNames) {
    for (const mode of ["light", "dark"] as const) {
      const tokens = uiThemeTokenValues[themeName][mode];

      for (const [backgroundToken, foregroundToken] of textContrastPairs) {
        verifyContrastPair({
          backgroundToken,
          foregroundToken,
          minimumRatio: 4.5,
          mode,
          themeName,
          tokens,
        });
      }

      for (const [backgroundToken, foregroundToken] of focusContrastPairs) {
        verifyContrastPair({
          backgroundToken,
          foregroundToken,
          minimumRatio: 3,
          mode,
          themeName,
          tokens,
        });
      }
    }
  }
}

function verifyContrastPair({
  backgroundToken,
  foregroundToken,
  minimumRatio,
  mode,
  themeName,
  tokens,
}: {
  backgroundToken: string;
  foregroundToken: string;
  minimumRatio: number;
  mode: "light" | "dark";
  themeName: string;
  tokens: Record<string, string>;
}) {
  const background = parseOpaqueOklch(tokens[backgroundToken]);
  const foreground = parseOpaqueOklch(tokens[foregroundToken]);

  if (!background || !foreground) {
    return;
  }

  const ratio = contrastRatio(relativeLuminance(background), relativeLuminance(foreground));

  if (ratio < minimumRatio) {
    errors.push(
      `${themeName}/${mode}: ${foregroundToken} on ${backgroundToken} contrast ${ratio.toFixed(
        2,
      )} is below ${minimumRatio}`,
    );
  }
}

function parseOpaqueOklch(value: string | undefined): { l: number; c: number; h: number } | null {
  if (!value) {
    return null;
  }

  const match =
    /^oklch\(\s*([0-9.]+%?)\s+([0-9.]+)\s+([0-9.]+)(?:deg)?(?:\s*\/\s*([^)]+))?\s*\)$/.exec(value);

  if (!match) {
    return null;
  }

  const alpha = match[4]?.trim();

  if (alpha && alpha !== "1" && alpha !== "100%") {
    return null;
  }

  const lightness = match[1].endsWith("%")
    ? Number.parseFloat(match[1]) / 100
    : Number.parseFloat(match[1]);

  return {
    l: lightness,
    c: Number.parseFloat(match[2]),
    h: Number.parseFloat(match[3]),
  };
}

function relativeLuminance(color: { l: number; c: number; h: number }): number {
  const hueRadians = (color.h * Math.PI) / 180;
  const a = color.c * Math.cos(hueRadians);
  const b = color.c * Math.sin(hueRadians);
  const long = color.l + 0.3963377774 * a + 0.2158037573 * b;
  const medium = color.l - 0.1055613458 * a - 0.0638541728 * b;
  const short = color.l - 0.0894841775 * a - 1.291485548 * b;
  const longLinear = long ** 3;
  const mediumLinear = medium ** 3;
  const shortLinear = short ** 3;
  const red = clamp(
    4.0767416621 * longLinear - 3.3077115913 * mediumLinear + 0.2309699292 * shortLinear,
  );
  const green = clamp(
    -1.2684380046 * longLinear + 2.6097574011 * mediumLinear - 0.3413193965 * shortLinear,
  );
  const blue = clamp(
    -0.0041960863 * longLinear - 0.7034186147 * mediumLinear + 1.707614701 * shortLinear,
  );

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrastRatio(left: number, right: number): number {
  const lighter = Math.max(left, right);
  const darker = Math.min(left, right);

  return (lighter + 0.05) / (darker + 0.05);
}

function clamp(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function verifyCssImportTopology() {
  const stylesSource = readFileSync(path.join(packageRoot, "styles.css"), "utf8");
  const themeScopesSource = readFileSync(path.join(packageRoot, "theme-scopes.css"), "utf8");

  if (!hasCssImport(stylesSource, "./base.css")) {
    errors.push("styles.css must import ./base.css");
  }

  if (!hasCssImport(themeScopesSource, "./base.css")) {
    errors.push("theme-scopes.css must import ./base.css");
  }

  if (hasCssImport(themeScopesSource, "./styles.css")) {
    errors.push("theme-scopes.css must not import ./styles.css");
  }

  for (const relativeFile of themeStylesheets) {
    const source = readFileSync(path.join(packageRoot, relativeFile), "utf8");

    if (!hasCssImport(source, "../base.css")) {
      errors.push(`${relativeFile} must import ../base.css`);
    }

    if (hasCssImport(source, "../styles.css")) {
      errors.push(`${relativeFile} must not import ../styles.css`);
    }

    if (hasCssImport(source, "../component-sources.css")) {
      errors.push(`${relativeFile} must not import ../component-sources.css`);
    }
  }
}

function verifyCssSourceTopology() {
  for (const relativeFile of generatedArtifactFiles) {
    const filePath = path.join(packageRoot, relativeFile);

    try {
      readFileSync(filePath, "utf8");
    } catch {
      errors.push(`${relativeFile}: generated artifact is missing`);
    }
  }

  for (const relativeFile of ["base.css", "styles.css", "theme-scopes.css", ...themeStylesheets]) {
    const source = readFileSync(path.join(packageRoot, relativeFile), "utf8");

    if (/@source\s+/.test(source)) {
      errors.push(`${relativeFile} must not declare Tailwind @source`);
    }
  }

  const componentSources = readFileSync(path.join(packageRoot, "component-sources.css"), "utf8");

  for (const directive of componentSourceDirectives) {
    if (!componentSources.includes(directive)) {
      errors.push(`component-sources.css must include ${directive}`);
    }
  }
}

function verifySimpleThemeStylesheets() {
  for (const relativeFile of simpleThemeStylesheets) {
    const themeName = relativeFile.split("/")[0];
    const filePath = path.join(packageRoot, relativeFile);
    const source = readFileSync(filePath, "utf8");
    const bytes = statSync(filePath).size;

    if (bytes > maxSimpleThemeCssBytes) {
      errors.push(
        `${relativeFile}: simple theme stylesheet is ${bytes} bytes, above ${maxSimpleThemeCssBytes} byte budget`,
      );
    }

    for (const siblingThemeName of tokenFiles
      .map((fileName) => fileName.split("/")[0])
      .filter(
        (candidateThemeName) =>
          candidateThemeName !== "styles.css" && candidateThemeName !== themeName,
      )) {
      if (source.includes(`[data-ui-theme="${siblingThemeName}"]`)) {
        errors.push(`${relativeFile}: must not include sibling theme selector ${siblingThemeName}`);
      }

      if (source.includes(`${siblingThemeName}/styles.css`)) {
        errors.push(
          `${relativeFile}: must not reference sibling theme stylesheet ${siblingThemeName}`,
        );
      }
    }

    expectTokenValue(relativeFile, source, "--glass-blur", "0px");
    expectTokenValue(relativeFile, source, "--glass-surface-gradient", "none");
    expectTokenValue(relativeFile, source, "--glass-overlay-gradient", "none");

    for (const tokenName of [
      "--glass-shadow",
      "--glass-interactive-shadow",
      "--glass-raised-shadow",
      "--glass-inset-shadow",
    ]) {
      const value = readTokenValue(source, tokenName);

      if (value && value.includes(",")) {
        errors.push(`${relativeFile}: ${tokenName} must stay single-layer for simple themes`);
      }
    }
  }
}

function expectTokenValue(
  relativeFile: string,
  source: string,
  tokenName: string,
  expectedValue: string,
) {
  const value = readTokenValue(source, tokenName);

  if (value !== expectedValue) {
    errors.push(
      `${relativeFile}: expected ${tokenName}: ${expectedValue}, found ${value ?? "missing"}`,
    );
  }
}

function readTokenValue(source: string, tokenName: string): string | undefined {
  const match = new RegExp(`${escapeRegExp(tokenName)}\\s*:\\s*([^;]+);`).exec(source);

  return match?.[1]?.trim();
}

function hasCssImport(source: string, importPath: string) {
  return new RegExp(`^\\s*@import\\s+["']${escapeRegExp(importPath)}["'];?\\s*$`, "m").test(source);
}
