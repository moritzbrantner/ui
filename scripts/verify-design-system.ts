import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  componentRegistry,
  type ComponentRegistryEntry,
  type ComponentTier,
} from "../src/component-registry.js";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const componentsDir = path.join(packageRoot, "src", "components");
const srcDir = path.join(packageRoot, "src");
const packageJsonPath = path.join(packageRoot, "package.json");
const indexPath = path.join(packageRoot, "src", "index.ts");
const serverPath = path.join(packageRoot, "src", "server.ts");
const clientPath = path.join(packageRoot, "src", "client.ts");
const stablePath = path.join(packageRoot, "src", "stable.ts");
const patternsPath = path.join(packageRoot, "src", "patterns.ts");
const labsPath = path.join(packageRoot, "src", "labs.ts");
const legacyPath = path.join(packageRoot, "src", "legacy.ts");
const errors: string[] = [];
const publicTiers = ["stable", "patterns", "labs", "legacy"] as const;
const rootExportTiers = new Set<ComponentTier>(["stable", "patterns"]);
const tierBarrelPaths = {
  stable: stablePath,
  patterns: patternsPath,
  labs: labsPath,
  legacy: legacyPath,
} as const;
const contractAllowlist = new Map([
  [
    "aspect-ratio",
    "Radix primitive wrapper: className and DOM props are carried by the wrapped primitive API.",
  ],
  [
    "collapsible",
    "Radix primitive wrapper: className and DOM props are carried by the wrapped primitive API.",
  ],
  [
    "direction",
    "Provider-only Radix wrapper: it establishes context and does not render a stylable DOM node.",
  ],
  ["menu-actions", "Typed menu action schema and helpers; it does not render DOM."],
]);
const clientComponentPatterns = [
  /\bReact\.use[A-Z]/,
  /\buse(State|Effect|LayoutEffect|Memo|Callback|Ref|Id|Reducer)\b/,
  /from\s+["'](?:@base-ui\/react|cmdk|embla-carousel-react|input-otp|motion\/react|radix-ui|react-day-picker|react-resizable-panels|sonner|vaul)/,
  /\b(window|document|navigator)\b/,
];

const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8")) as Record<string, any>;
const indexSource = readFileSync(indexPath, "utf8");
const serverSource = readFileSync(serverPath, "utf8");
const clientSource = readFileSync(clientPath, "utf8");
const registryEntries: readonly ComponentRegistryEntry[] = componentRegistry;
const tierBarrelSources = Object.fromEntries(
  publicTiers.map((tier) => [tier, readFileSync(tierBarrelPaths[tier], "utf8")]),
) as Record<(typeof publicTiers)[number], string>;
const registryByName = new Map<string, ComponentRegistryEntry>(
  registryEntries.map((entry) => [entry.name, entry]),
);

verifyPackageMetadata();
verifyTierLayout();
verifyComponentRegistry();
verifyEntrypointBoundaries();
verifyComponentContracts();
verifyStoryContracts();
verifyClientDirectives();
verifyConsumerExample();

if (errors.length > 0) {
  console.error("@moritzbrantner/ui design-system verification failed:");

  for (const error of errors) {
    console.error(`- ${error}`);
  }

  process.exit(1);
}

console.log("@moritzbrantner/ui design-system contract verified");

function verifyPackageMetadata() {
  expectEqual(
    packageJson.name,
    "@moritzbrantner/ui",
    "package name must remain @moritzbrantner/ui",
  );
  expectEqual(packageJson.version, "0.8.0", "package version must match tiered API release");
  expectEqual(packageJson.private, false, "package must stay publishable");
  expectArrayIncludes(packageJson.files, "dist", "package files must include dist");
  expectArrayIncludes(packageJson.files, "styles.css", "package files must include styles.css");
  expectArrayIncludes(
    packageJson.files,
    "theme-scopes.css",
    "package files must include theme-scopes.css",
  );
  expectArrayIncludes(packageJson.sideEffects, "*.css", "CSS files must be retained by bundlers");
  expectObject(packageJson.peerDependencies, "peerDependencies must be declared");
  expectObject(packageJson.dependencies, "dependencies must be declared");
  expectObject(packageJson.exports, "exports must be declared");
  expectObjectPath(packageJson, ["peerDependencies", "react"], "react must be a peer dependency");
  expectObjectPath(
    packageJson,
    ["peerDependencies", "react-dom"],
    "react-dom must be a peer dependency",
  );

  expectExport(".", "./dist/index.js", "./dist/index.d.ts");
  expectExport("./server", "./dist/server.js", "./dist/server.d.ts");
  expectExport("./client", "./dist/client.js", "./dist/client.d.ts");
  expectExport("./stable", "./dist/stable.js", "./dist/stable.d.ts");
  expectExport("./patterns", "./dist/patterns.js", "./dist/patterns.d.ts");
  expectExport("./labs", "./dist/labs.js", "./dist/labs.d.ts");
  expectExport("./legacy", "./dist/legacy.js", "./dist/legacy.d.ts");
  expectExport("./themes", "./dist/themes.js", "./dist/themes.d.ts");
  expectExport("./lib/cn", "./dist/lib/cn.js", "./dist/lib/cn.d.ts");
  expectExport(
    "./components/stable/*",
    "./dist/components/stable/*.js",
    "./dist/components/stable/*.d.ts",
  );
  expectExport(
    "./components/patterns/*",
    "./dist/components/patterns/*.js",
    "./dist/components/patterns/*.d.ts",
  );
  expectExport(
    "./components/labs/*",
    "./dist/components/labs/*.js",
    "./dist/components/labs/*.d.ts",
  );
  expectExport(
    "./components/legacy/*",
    "./dist/components/legacy/*.js",
    "./dist/components/legacy/*.d.ts",
  );

  if (packageJson.exports?.["./components/*"]) {
    errors.push("package exports must not expose the removed flat ./components/* wildcard");
  }

  for (const themeName of ["zleek", "bobba", "atlas", "studio", "paper"]) {
    expectExport(`./${themeName}`, `./dist/${themeName}.js`, `./dist/${themeName}.d.ts`);
    expectExport(
      `./${themeName}/server`,
      `./dist/${themeName}/server.js`,
      `./dist/${themeName}/server.d.ts`,
    );
    expectEqual(
      packageJson.exports[`./${themeName}/styles.css`],
      `./${themeName}/styles.css`,
      `${themeName} stylesheet must be exported`,
    );
  }

  expectEqual(packageJson.exports["./styles.css"], "./styles.css", "stylesheet must be exported");
  expectEqual(
    packageJson.exports["./theme-scopes.css"],
    "./theme-scopes.css",
    "scoped theme stylesheet must be exported",
  );
}

function verifyTierLayout() {
  const allowedTopLevelEntries = new Set([...publicTiers, "internal"]);

  for (const entry of readdirSync(componentsDir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!allowedTopLevelEntries.has(entry.name as any)) {
        errors.push(`src/components/${entry.name}: unexpected component tier directory`);
      }
      continue;
    }

    errors.push(`src/components/${entry.name}: public components must live in a tier directory`);
  }

  for (const tier of publicTiers) {
    if (!existsSync(path.join(componentsDir, tier))) {
      errors.push(`missing src/components/${tier}`);
    }
  }

  if (!existsSync(path.join(componentsDir, "internal"))) {
    errors.push("missing src/components/internal");
  }
}

function verifyComponentRegistry() {
  const sourceComponents = new Map<string, ComponentTier>();

  for (const tier of publicTiers) {
    const tierDir = path.join(componentsDir, tier);

    for (const fileName of readdirSync(tierDir)) {
      if (
        !fileName.endsWith(".tsx") ||
        fileName.endsWith(".stories.tsx") ||
        fileName.endsWith(".test.tsx")
      ) {
        continue;
      }

      const componentName = fileName.replace(/\.tsx$/, "");
      sourceComponents.set(componentName, tier);
    }
  }

  for (const [componentName, tier] of sourceComponents) {
    const registryEntry = registryByName.get(componentName);

    if (!registryEntry) {
      errors.push(`${componentName}: missing component registry entry`);
      continue;
    }

    if (registryEntry.tier !== tier) {
      errors.push(`${componentName}: registry tier ${registryEntry.tier} does not match ${tier}`);
    }
  }

  for (const entry of registryEntries) {
    const sourcePath = path.join(componentsDir, entry.tier, `${entry.fileName}.tsx`);

    if (!existsSync(sourcePath)) {
      errors.push(`${entry.name}: registry points at missing ${sourcePath}`);
    }

    if (!sourceComponents.has(entry.name)) {
      errors.push(`${entry.name}: registry entry does not match a source component`);
    }

    const expectedRootExport = rootExportTiers.has(entry.tier);

    if (entry.rootExport !== expectedRootExport) {
      errors.push(`${entry.name}: rootExport must be ${expectedRootExport} for ${entry.tier}`);
    }

    if (entry.publicSubpath !== `@moritzbrantner/ui/components/${entry.tier}/${entry.fileName}`) {
      errors.push(`${entry.name}: publicSubpath must use the tiered component path`);
    }

    const tierExportLine = `export * from "./components/${entry.tier}/${entry.fileName}";`;

    if (!tierBarrelSources[entry.tier].includes(tierExportLine)) {
      errors.push(`${entry.name}: missing export in src/${entry.tier}.ts`);
    }

    const rootHasExport = indexSource.includes(tierExportLine);

    if (entry.rootExport && !indexSource.includes(`export * from "./${entry.tier}";`)) {
      errors.push(`src/index.ts must export the ${entry.tier} barrel`);
    }

    if (!entry.rootExport && rootHasExport) {
      errors.push(`${entry.name}: ${entry.tier} components must not be root-exported`);
    }

    if (entry.tier === "stable" || entry.tier === "patterns") {
      if (entry.storyFiles.length === 0) {
        errors.push(`${entry.name}: ${entry.tier} entries must list Storybook coverage`);
      }

      if (entry.testFiles.length === 0) {
        errors.push(`${entry.name}: ${entry.tier} entries must list test coverage`);
      }
    }

    for (const relativeFile of [...entry.storyFiles, ...entry.testFiles]) {
      if (!existsSync(path.join(packageRoot, relativeFile))) {
        errors.push(`${entry.name}: registry file ${relativeFile} does not exist`);
      }
    }

    if (entry.tier === "legacy") {
      if (!entry.deprecatedSince || !entry.migration) {
        errors.push(`${entry.name}: legacy entries require deprecatedSince and migration`);
      }

      if (entry.rootExport) {
        errors.push(`${entry.name}: legacy entries must not be root-exported`);
      }
    }
  }

  for (const forbiddenRootExport of ['export * from "./labs";', 'export * from "./legacy";']) {
    if (indexSource.includes(forbiddenRootExport)) {
      errors.push(`src/index.ts must not contain ${forbiddenRootExport}`);
    }
  }
}

function verifyEntrypointBoundaries() {
  if (!clientSource.startsWith('"use client";')) {
    errors.push('src/client.ts must start with "use client";');
  }

  if (!clientSource.includes('export * from "./index";')) {
    errors.push("src/client.ts must cover the root public client component API");
  }

  if (serverSource.includes('"use client";')) {
    errors.push('src/server.ts must stay server-safe and must not contain "use client";');
  }

  const forbiddenServerExports = [
    /from\s+["']\.\/index["']/,
    /from\s+["']\.\/themes["']/,
    /from\s+["']\.\/components\//,
    /from\s+["'](?:@base-ui\/react|cmdk|embla-carousel-react|input-otp|motion\/react|next-themes|radix-ui|react-day-picker|react-resizable-panels|sonner|vaul)/,
  ];

  for (const pattern of forbiddenServerExports) {
    if (pattern.test(serverSource)) {
      errors.push(
        "src/server.ts must export only pure helpers, theme metadata, and types; found a client-only export pattern",
      );
      break;
    }
  }

  for (const expectedExport of ['from "./lib/cn"', 'from "./theme-metadata"']) {
    if (!serverSource.includes(expectedExport)) {
      errors.push(`src/server.ts must export server-safe API ${expectedExport}`);
    }
  }
}

function verifyComponentContracts() {
  for (const entry of registryEntries) {
    const componentPath = path.join(componentsDir, entry.tier, `${entry.fileName}.tsx`);
    const componentSource = readFileSync(componentPath, "utf8");
    const allowlistReason = contractAllowlist.get(entry.name);

    if (!allowlistReason && !/data-slot=/.test(componentSource)) {
      errors.push(`${entry.name}: public component files must expose at least one data-slot`);
    }

    if (!allowlistReason && !/\bclassName\b/.test(componentSource)) {
      errors.push(`${entry.name}: public DOM-rendering components must support className`);
    }

    if (
      !allowlistReason &&
      !/(\.\.\.props|\.\.\.\(rest as Record<string, unknown>\)|\.\.\.rest[A-Z]\w*Props|\.\.\.buttonProps)/.test(
        componentSource,
      )
    ) {
      errors.push(`${entry.name}: public DOM-rendering components must forward DOM props`);
    }
  }
}

function verifyStoryContracts() {
  const storyFiles = new Set<string>();

  for (const entry of registryEntries) {
    for (const relativeFile of entry.storyFiles) {
      storyFiles.add(relativeFile);
    }
  }

  for (const relativeFile of storyFiles) {
    const storySource = readFileSync(path.join(packageRoot, relativeFile), "utf8");

    if (!/tags:\s*\[[^\]]*["']autodocs["'][^\]]*["']test["'][^\]]*\]/s.test(storySource)) {
      errors.push(`${relativeFile}: story meta must include tags ["autodocs", "test"]`);
    }
  }
}

function verifyClientDirectives() {
  const sourceFiles = [
    ...registryEntries.map((entry) =>
      path.join(componentsDir, entry.tier, `${entry.fileName}.tsx`),
    ),
    ...listFiles(path.join(componentsDir, "internal")).filter((filePath) =>
      /\.(ts|tsx)$/.test(filePath),
    ),
  ];

  for (const sourceFile of sourceFiles) {
    const source = readFileSync(sourceFile, "utf8");

    if (
      !source.startsWith('"use client";') &&
      clientComponentPatterns.some((pattern) => pattern.test(source))
    ) {
      errors.push(
        `${path.relative(packageRoot, sourceFile)}: browser or hook-based modules must start with "use client";`,
      );
    }
  }
}

function verifyConsumerExample() {
  const appPath = path.join(packageRoot, "examples", "consumer", "src", "App.tsx");
  const subpathPath = path.join(packageRoot, "examples", "consumer", "src", "SubpathApp.tsx");

  if (!existsSync(appPath) || !existsSync(subpathPath)) {
    errors.push("consumer example must include App.tsx and SubpathApp.tsx");
    return;
  }

  const appSource = readFileSync(appPath, "utf8");
  const subpathSource = readFileSync(subpathPath, "utf8");

  if (!appSource.includes('import "@moritzbrantner/ui/styles.css";')) {
    errors.push("consumer example must import the default UI stylesheet");
  }

  if (!appSource.includes('from "@moritzbrantner/ui"')) {
    errors.push("consumer example must import stable/patterns from the public root entrypoint");
  }

  for (const expectedImport of [
    'from "@moritzbrantner/ui/components/stable/button"',
    'from "@moritzbrantner/ui/components/stable/dialog"',
    'from "@moritzbrantner/ui/components/patterns/data-grid"',
  ]) {
    if (!subpathSource.includes(expectedImport)) {
      errors.push(`consumer subpath example must exercise ${expectedImport}`);
    }
  }
}

function expectExport(exportPath: string, importPath: string, typesPath: string): void {
  expectEqual(
    packageJson.exports?.[exportPath]?.import,
    importPath,
    `${exportPath} import export must point at ${importPath}`,
  );
  expectEqual(
    packageJson.exports?.[exportPath]?.types,
    typesPath,
    `${exportPath} type export must point at ${typesPath}`,
  );
}

function expectArrayIncludes(value: unknown, expected: string, message: string): void {
  if (!Array.isArray(value) || !value.includes(expected)) {
    errors.push(message);
  }
}

function expectEqual(actual: unknown, expected: unknown, message: string): void {
  if (actual !== expected) {
    errors.push(message);
  }
}

function expectObject(value: unknown, message: string): void {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    errors.push(message);
  }
}

function expectObjectPath(source: Record<string, any>, keys: string[], message: string): void {
  let current: unknown = source;

  for (const key of keys) {
    current =
      current && typeof current === "object" ? (current as Record<string, any>)[key] : undefined;
  }

  if (!current) {
    errors.push(message);
  }
}

function listFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return listFiles(filePath);
    }

    return filePath;
  });
}
