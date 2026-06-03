import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const outputDir = process.argv[2] ?? "storybook-static";
const rawBuildId =
  process.env.STORYBOOK_PAGES_BUILD_ID ??
  process.env.GITHUB_SHA ??
  process.env.GITHUB_RUN_ID ??
  String(Date.now());
const buildId = rawBuildId.replace(/[^a-zA-Z0-9._-]/g, "").slice(0, 64);

if (!buildId) {
  throw new Error("Could not derive a Storybook Pages build id.");
}

const htmlFiles = ["index.html", "iframe.html"];
const stampableAssetPattern =
  /(["'])(\.\/(?:(?:(?:assets|sb-addons|sb-manager|sb-preview)\/[^"'?#]+)|vite-inject-mocker-entry)\.(?:js|css))(?:\?[^"']*)?\1/g;

let stampedReferences = 0;

for (const fileName of htmlFiles) {
  const filePath = path.join(outputDir, fileName);

  if (!existsSync(filePath)) {
    throw new Error(`Expected Storybook output file at ${filePath}.`);
  }

  const source = readFileSync(filePath, "utf8");
  const stamped = source.replace(stampableAssetPattern, (match, quote, assetPath) => {
    stampedReferences += 1;

    return `${quote}${assetPath}?v=${buildId}${quote}`;
  });

  if (stamped === source) {
    throw new Error(`No Storybook asset references were stamped in ${filePath}.`);
  }

  writeFileSync(filePath, stamped);
}

console.log(
  `Stamped ${stampedReferences} Storybook Pages asset references with build id ${buildId}.`,
);
