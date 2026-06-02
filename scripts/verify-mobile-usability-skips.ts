import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

type StorySkip = {
  filePath: string;
  exportName: string;
  reason: string | null;
  block: string;
};

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const storyFiles = listStoryFiles(path.join(packageRoot, "src"));
const errors: string[] = [];
const acceptedSkips: StorySkip[] = [];

for (const filePath of storyFiles) {
  const source = readFileSync(filePath, "utf8");

  for (const skip of findStorySkips(filePath, source)) {
    const relativeFile = path.relative(packageRoot, filePath);
    const label = `${relativeFile}:${skip.exportName}`;

    if (!skip.reason || skip.reason.trim().length === 0) {
      errors.push(`${label} uses mobileUsability.skip without a reason.`);
      continue;
    }

    if (skip.reason.trim().length < 20) {
      errors.push(`${label} uses a mobileUsability.skip reason shorter than 20 characters.`);
      continue;
    }

    if (!hasApprovedDesktopOnlyIntent(skip)) {
      errors.push(
        `${label} uses mobileUsability.skip without desktop/web-only intent in the story or reason.`,
      );
      continue;
    }

    acceptedSkips.push(skip);
  }
}

if (errors.length > 0) {
  console.error("@moritzbrantner/ui mobile usability skip verification failed:");

  for (const error of errors) {
    console.error(`- ${error}`);
  }

  process.exit(1);
}

if (acceptedSkips.length === 0) {
  console.log("@moritzbrantner/ui mobile usability skips verified: no skips found");
} else {
  console.log("@moritzbrantner/ui mobile usability skips verified:");

  for (const skip of acceptedSkips) {
    const relativeFile = path.relative(packageRoot, skip.filePath);

    console.log(`- ${relativeFile}:${skip.exportName} - ${skip.reason}`);
  }
}

function listStoryFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return listStoryFiles(filePath);
    }

    return statSync(filePath).isFile() && entry.name.endsWith(".stories.tsx") ? [filePath] : [];
  });
}

function findStorySkips(filePath: string, source: string): StorySkip[] {
  const skips: StorySkip[] = [];
  const exportPattern = /export\s+const\s+([A-Za-z0-9_]+)[^=]*=\s*\{/g;

  for (const match of source.matchAll(exportPattern)) {
    const exportName = match[1];
    const objectStart = source.indexOf("{", match.index ?? 0);
    const objectEnd = findMatchingBrace(source, objectStart);

    if (objectStart === -1 || objectEnd === -1) {
      continue;
    }

    const block = source.slice(objectStart, objectEnd + 1);

    if (!/mobileUsability\s*:\s*\{[\s\S]*?skip\s*:\s*true/.test(block)) {
      continue;
    }

    skips.push({
      filePath,
      exportName,
      reason: extractReason(block),
      block,
    });
  }

  return skips;
}

function extractReason(block: string) {
  return block.match(/reason\s*:\s*["'`]([^"'`]+)["'`]/)?.[1]?.trim() ?? null;
}

function hasApprovedDesktopOnlyIntent(skip: StorySkip) {
  return /desktop|web|Desktop-only|Web-only|Pointer-only|Large-screen/i.test(
    `${skip.exportName}\n${skip.reason ?? ""}\n${skip.block}`,
  );
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
