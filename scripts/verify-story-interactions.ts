import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

type StoryInteractionIssue = {
  exportName: string;
  filePath: string;
};

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const storyFiles = listStoryFiles(path.join(packageRoot, "src"));
const issues: StoryInteractionIssue[] = [];

for (const filePath of storyFiles) {
  const source = readFileSync(filePath, "utf8");

  if (!isTestedStoryFile(source)) {
    continue;
  }

  issues.push(...findHoverTextAssertionIssues(filePath, source));
}

if (issues.length > 0) {
  console.error("@moritzbrantner/ui Storybook interaction verification failed:");

  for (const issue of issues) {
    console.error(
      `- ${path.relative(packageRoot, issue.filePath)}:${issue.exportName} asserts text immediately after userEvent.hover(). Use waitFor() or findByText() for hover-triggered content.`,
    );
  }

  process.exit(1);
}

console.log("@moritzbrantner/ui Storybook interactions verified");

function listStoryFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return listStoryFiles(filePath);
    }

    return statSync(filePath).isFile() && entry.name.endsWith(".stories.tsx") ? [filePath] : [];
  });
}

function isTestedStoryFile(source: string): boolean {
  return /tags\s*:\s*\[[\s\S]*?["'`](test|ai-generated)["'`]/.test(source);
}

function findHoverTextAssertionIssues(filePath: string, source: string): StoryInteractionIssue[] {
  const foundIssues: StoryInteractionIssue[] = [];
  const exportPattern = /export\s+const\s+([A-Za-z0-9_]+)[^=]*=\s*\{/g;

  for (const match of source.matchAll(exportPattern)) {
    const exportName = match[1];
    const objectStart = source.indexOf("{", match.index ?? 0);
    const objectEnd = findMatchingBrace(source, objectStart);

    if (objectStart === -1 || objectEnd === -1) {
      continue;
    }

    const storyBlock = source.slice(objectStart, objectEnd + 1);
    const playBlock = extractPlayBlock(storyBlock);

    if (!playBlock || !/userEvent\.hover\s*\(/.test(playBlock)) {
      continue;
    }

    if (hasImmediateHoverTextAssertion(playBlock)) {
      foundIssues.push({ exportName, filePath });
    }
  }

  return foundIssues;
}

function extractPlayBlock(storyBlock: string): string | null {
  const playMatch = /play\s*:\s*async\s*\([^)]*\)\s*=>\s*\{/.exec(storyBlock);

  if (!playMatch || playMatch.index === undefined) {
    return null;
  }

  const blockStart = storyBlock.indexOf("{", playMatch.index);
  const blockEnd = findMatchingBrace(storyBlock, blockStart);

  if (blockStart === -1 || blockEnd === -1) {
    return null;
  }

  return storyBlock.slice(blockStart, blockEnd + 1);
}

function hasImmediateHoverTextAssertion(playBlock: string): boolean {
  const hoverPattern = /await\s+userEvent\.hover\s*\([\s\S]*?\)\s*;/g;

  for (const match of playBlock.matchAll(hoverPattern)) {
    const afterHover = playBlock.slice((match.index ?? 0) + match[0].length);
    const nextMeaningfulLine = afterHover
      .split("\n")
      .map((line) => line.trim())
      .find((line) => line.length > 0 && !line.startsWith("//"));

    if (
      !nextMeaningfulLine ||
      /^await\s+(waitFor|screen\.findByText|canvas\.findByText)\b/.test(nextMeaningfulLine)
    ) {
      continue;
    }

    if (/(screen|canvas)\.get(All)?ByText\s*\(/.test(nextMeaningfulLine)) {
      return true;
    }
  }

  return false;
}

function findMatchingBrace(source: string, start: number) {
  if (start < 0 || source[start] !== "{") {
    return -1;
  }

  let depth = 0;
  let quote: "'" | '"' | "`" | null = null;
  let escaped = false;

  for (let index = start; index < source.length; index += 1) {
    const char = source[index];

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === quote) {
        quote = null;
      }

      continue;
    }

    if (char === "'" || char === '"' || char === "`") {
      quote = char;
      continue;
    }

    if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;

      if (depth === 0) {
        return index;
      }
    }
  }

  return -1;
}
