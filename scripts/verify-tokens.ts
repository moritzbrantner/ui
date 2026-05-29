import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { uiTokenMetadata } from "../src/token-metadata.js";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tokenFiles = [
  "styles.css",
  "bobba/styles.css",
  "zleek/styles.css",
  "atlas/styles.css",
  "studio/styles.css",
  "paper/styles.css",
];
const requiredPublicUiTokens = uiTokenMetadata
  .filter((token) => token.name.startsWith("--ui-") || token.name.startsWith("--glass-"))
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

      if (!tokens.dark.has(token)) {
        errors.push(`${relativeFile}: .dark is missing public UI token ${token}`);
      }
    }
  }
}

const scopedThemeSource = readFileSync(path.join(packageRoot, "theme-scopes.css"), "utf8");

for (const themeName of ["bobba", "zleek", "atlas", "studio", "paper", "custom"]) {
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
