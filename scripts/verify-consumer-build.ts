import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { formatKb, getAssetSizeReport } from "./asset-size-report.js";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const consumerRoot = path.join(packageRoot, "examples", "consumer");
const tempWorkspace = mkdtempSync(path.join(tmpdir(), "ui-consumer-"));
const tempConsumerRoot = path.join(tempWorkspace, "examples", "consumer");
const rootBudget = {
  // Compatibility smoke test: root imports intentionally exercise the broad public surface.
  maxChunkBytes: 750 * 1024,
  maxTotalBytes: 900 * 1024,
  maxCssBytes: 330 * 1024,
};
const subpathBudget = {
  // Bundle-sensitive fixture: scoped theme metadata + DataGrid + Dialog is about 409 KB.
  // Keep the hard budget close enough to catch regressions while preserving current behavior.
  maxChunkBytes: 450 * 1024,
  maxTotalBytes: 465 * 1024,
  maxCssBytes: 330 * 1024,
};
const singleThemeBudget = {
  // Minimal React app + one theme wrapper. This catches accidental broad UI package imports.
  maxChunkBytes: 225 * 1024,
  maxTotalBytes: 240 * 1024,
  maxCssBytes: 80 * 1024,
};
const simpleThemeFixtures = ["bobba", "atlas", "studio", "paper"] as const;

rmSync(path.join(consumerRoot, "node_modules"), { recursive: true, force: true });
rmSync(path.join(consumerRoot, "dist"), { recursive: true, force: true });

try {
  const tarballPath = packPackage(tempWorkspace);
  const rootPackageJson = JSON.parse(readFileSync(path.join(packageRoot, "package.json"), "utf8"));

  mkdirSync(tempConsumerRoot, { recursive: true });
  cpSync(
    path.join(packageRoot, "tsconfig.base.json"),
    path.join(tempWorkspace, "tsconfig.base.json"),
  );
  cpSync(path.join(consumerRoot, "src"), path.join(tempConsumerRoot, "src"), { recursive: true });
  cpSync(path.join(consumerRoot, "index.html"), path.join(tempConsumerRoot, "index.html"));
  cpSync(path.join(consumerRoot, "tsconfig.json"), path.join(tempConsumerRoot, "tsconfig.json"));
  cpSync(path.join(consumerRoot, "vite.config.ts"), path.join(tempConsumerRoot, "vite.config.ts"));

  const packageJson = JSON.parse(readFileSync(path.join(consumerRoot, "package.json"), "utf8"));
  packageJson.dependencies["@moritzbrantner/ui"] = `file:${tarballPath}`;
  packageJson.devDependencies["@types/react"] ??= rootPackageJson.devDependencies["@types/react"];
  packageJson.devDependencies["@types/react-dom"] ??=
    rootPackageJson.devDependencies["@types/react-dom"];
  writeFileSync(
    path.join(tempConsumerRoot, "package.json"),
    `${JSON.stringify(packageJson, null, 2)}\n`,
  );

  run("bun", ["install"], tempConsumerRoot);
  run("bun", ["run", "check-types"], tempConsumerRoot);
  verifyConsumerSource(tempConsumerRoot);
  buildConsumerFixture(tempConsumerRoot, {
    name: "root",
    entry: "/src/main-root.tsx",
    budget: rootBudget,
  });
  buildConsumerFixture(tempConsumerRoot, {
    name: "subpath",
    entry: "/src/main-subpath.tsx",
    budget: subpathBudget,
  });
  for (const themeName of simpleThemeFixtures) {
    buildConsumerFixture(tempConsumerRoot, {
      name: `single-${themeName}`,
      entry: `/src/main-single-${themeName}.tsx`,
      budget: singleThemeBudget,
    });
  }
} finally {
  rmSync(tempWorkspace, { recursive: true, force: true });
}

console.log("@moritzbrantner/ui consumer example verified");

function packPackage(destination: string): string {
  const result = spawnSync(
    "bun",
    ["pm", "pack", "--ignore-scripts", "--destination", destination],
    {
      cwd: packageRoot,
      shell: false,
      encoding: "utf8",
    },
  );

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.stdout.write(result.stdout);
    process.stderr.write(result.stderr);
    process.exit(result.status ?? 1);
  }

  const tarballFilename = result.stdout
    .trim()
    .split(/\r?\n/)
    .map((line) => line.trim())
    .reverse()
    .find((line) => line.endsWith(".tgz"));

  if (!tarballFilename) {
    process.stdout.write(result.stdout);
    throw new Error("bun pm pack did not report a tarball filename");
  }

  return path.isAbsolute(tarballFilename)
    ? tarballFilename
    : path.join(destination, tarballFilename);
}

function run(command: string, args: string[], cwd: string): void {
  const result = spawnSync(command, args, {
    cwd,
    shell: false,
    stdio: "inherit",
  });

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function verifyConsumerSource(root: string): void {
  const appSource = readFileSync(path.join(root, "src", "App.tsx"), "utf8");
  const subpathSource = readFileSync(path.join(root, "src", "SubpathApp.tsx"), "utf8");
  const subpathEntrySource = readFileSync(path.join(root, "src", "main-subpath.tsx"), "utf8");
  const serverSource = readFileSync(path.join(root, "src", "server-entry.ts"), "utf8");

  for (const expected of [
    'from "@moritzbrantner/ui"',
    'import "@moritzbrantner/ui/component-sources.css";',
    "Navbar",
    "PageShell",
    "DataGrid",
    "CommandPalette",
    "Toaster",
  ]) {
    if (!appSource.includes(expected)) {
      throw new Error(`consumer App.tsx must exercise ${expected}`);
    }
  }

  for (const expected of [
    'from "@moritzbrantner/ui/components/stable/button"',
    'from "@moritzbrantner/ui/components/data/data-grid"',
    'from "@moritzbrantner/ui/components/stable/dialog"',
    'from "@moritzbrantner/ui/themes/atlas"',
    'from "@moritzbrantner/ui/server"',
    'import "@moritzbrantner/ui/atlas/styles.css";',
    'import "@moritzbrantner/ui/component-sources.css";',
  ]) {
    if (
      !subpathSource.includes(expected) &&
      !subpathEntrySource.includes(expected) &&
      !serverSource.includes(expected)
    ) {
      throw new Error(`consumer fixtures must exercise ${expected}`);
    }
  }

  for (const forbiddenImport of [
    'from "@moritzbrantner/ui"',
    'from "@moritzbrantner/ui/client"',
    'from "@moritzbrantner/ui/stable"',
    'from "@moritzbrantner/ui/data"',
    'from "@moritzbrantner/ui/shell"',
    'from "@moritzbrantner/ui/atlas"',
    'from "@moritzbrantner/ui/atlas/server"',
  ]) {
    if (subpathSource.includes(forbiddenImport)) {
      throw new Error(`SubpathApp.tsx must avoid broad import ${forbiddenImport}`);
    }
  }

  for (const themeName of simpleThemeFixtures) {
    const fixturePath = path.join(root, "src", `main-single-${themeName}.tsx`);
    const source = readFileSync(fixturePath, "utf8");
    const expectedCssImport = `import "@moritzbrantner/ui/${themeName}/styles.css";`;
    const expectedThemeImport = `from "@moritzbrantner/ui/${themeName}"`;

    if (!source.includes(expectedCssImport)) {
      throw new Error(`single theme fixture ${themeName} must import ${expectedCssImport}`);
    }

    if (!source.includes(expectedThemeImport)) {
      throw new Error(`single theme fixture ${themeName} must import ${expectedThemeImport}`);
    }

    if (source.includes("@moritzbrantner/ui/component-sources.css")) {
      throw new Error(`single theme fixture ${themeName} must not import component-sources.css`);
    }

    for (const siblingThemeName of simpleThemeFixtures.filter(
      (candidate) => candidate !== themeName,
    )) {
      if (source.includes(`@moritzbrantner/ui/${siblingThemeName}`)) {
        throw new Error(
          `single theme fixture ${themeName} must not import sibling theme ${siblingThemeName}`,
        );
      }
    }
  }
}

function buildConsumerFixture(
  root: string,
  fixture: {
    name: "root" | "subpath" | `single-${(typeof simpleThemeFixtures)[number]}`;
    entry: string;
    budget: {
      maxChunkBytes: number;
      maxTotalBytes: number;
      maxCssBytes: number;
    };
  },
): void {
  writeFileSync(
    path.join(root, "index.html"),
    [
      "<!doctype html>",
      '<html lang="en">',
      "  <head>",
      '    <meta charset="UTF-8" />',
      '    <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
      "  </head>",
      "  <body>",
      '    <div id="root"></div>',
      `    <script type="module" src="${fixture.entry}"></script>`,
      "  </body>",
      "</html>",
      "",
    ].join("\n"),
  );
  rmSync(path.join(root, "dist"), { recursive: true, force: true });
  run("bun", ["run", "build"], root);

  const assetsDir = path.join(root, "dist", "assets");
  const report = getAssetSizeReport(assetsDir, ".js");
  const cssReport = getAssetSizeReport(assetsDir, ".css");
  console.log(
    `consumer ${fixture.name} build: JS total ${formatKb(report.totalBytes)}, JS max chunk ${formatKb(report.maxChunkBytes)}, CSS total ${formatKb(cssReport.totalBytes)}, CSS max chunk ${formatKb(cssReport.maxChunkBytes)}`,
  );

  if (report.maxChunkBytes > fixture.budget.maxChunkBytes) {
    throw new Error(
      `consumer ${fixture.name} build exceeded max JS chunk budget: ${formatKb(report.maxChunkBytes)} > ${formatKb(fixture.budget.maxChunkBytes)}`,
    );
  }

  if (report.totalBytes > fixture.budget.maxTotalBytes) {
    throw new Error(
      `consumer ${fixture.name} build exceeded total JS budget: ${formatKb(report.totalBytes)} > ${formatKb(fixture.budget.maxTotalBytes)}`,
    );
  }

  if (cssReport.totalBytes > fixture.budget.maxCssBytes) {
    throw new Error(
      `consumer ${fixture.name} build exceeded total CSS budget: ${formatKb(cssReport.totalBytes)} > ${formatKb(fixture.budget.maxCssBytes)}`,
    );
  }
}
