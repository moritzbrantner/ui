import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors: string[] = [];

for (const filePath of listMarkdownFiles(packageRoot)) {
  const source = readFileSync(filePath, "utf8");
  const relativeFile = path.relative(packageRoot, filePath);

  for (const match of source.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    const target = match[1];

    if (
      target.startsWith("http://") ||
      target.startsWith("https://") ||
      target.startsWith("#") ||
      target.startsWith("mailto:")
    ) {
      continue;
    }

    const cleanTarget = target.split("#")[0];

    if (!cleanTarget) {
      continue;
    }

    const resolved = path.resolve(path.dirname(filePath), cleanTarget);

    if (!resolved.startsWith(packageRoot) || !existsSync(resolved)) {
      errors.push(`${relativeFile}: broken local docs link ${target}`);
    }
  }
}

if (errors.length > 0) {
  console.error("@moritzbrantner/ui docs link verification failed:");

  for (const error of errors) {
    console.error(`- ${error}`);
  }

  process.exit(1);
}

console.log("@moritzbrantner/ui docs links verified");

function listMarkdownFiles(directory: string): string[] {
  const ignored = new Set([
    "node_modules",
    "dist",
    "coverage",
    "storybook-static",
    "playwright-report",
    "test-results",
  ]);

  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return ignored.has(entry.name) ? [] : listMarkdownFiles(filePath);
    }

    return statSync(filePath).isFile() && entry.name.endsWith(".md") ? [filePath] : [];
  });
}
