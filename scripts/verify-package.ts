import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

type PackageModule = Record<string, any>;
type PackageFile = {
  path: string;
};
type PackageMetadata = {
  files: PackageFile[];
};

const root = await importPackage("@moritzbrantner/ui");
assert.equal(typeof root.Button, "function", "root export should include Button");
assert.equal(typeof root.DataGrid, "function", "root export should include DataGrid");
assert.equal(typeof root.cn, "function", "root export should include cn");
assert.equal(typeof root.UiTheme, "function", "root export should include UiTheme");
assert.equal(Object.hasOwn(root, "DataTable"), false, "root export should not include DataTable");
assert.equal(
  Object.hasOwn(root, "WorkflowBuilder"),
  false,
  "root export should not include labs components",
);

const server = await importPackage("@moritzbrantner/ui/server");
assert.equal(typeof server.cn, "function", "server export should include cn");
assert.equal(server.themeConfig.bobba.name, "bobba", "server export should expose theme metadata");
assert.equal(
  Object.hasOwn(server, "Button"),
  false,
  "server export should not expose client components",
);

const client = await importPackage("@moritzbrantner/ui/client");
assert.equal(typeof client.Button, "function", "client export should include Button");
assert.equal(typeof client.DataGrid, "function", "client export should include DataGrid");
assert.equal(typeof client.Dialog, "function", "client export should include Dialog");
assert.equal(
  Object.hasOwn(client, "DataTable"),
  false,
  "client export should not expose legacy components",
);

const stable = await importPackage("@moritzbrantner/ui/stable");
assert.equal(typeof stable.Button, "function", "stable entry should expose Button");
assert.equal(typeof stable.Dialog, "function", "stable entry should expose Dialog");

const patterns = await importPackage("@moritzbrantner/ui/patterns");
assert.equal(typeof patterns.DataGrid, "function", "patterns entry should expose DataGrid");
assert.equal(typeof patterns.ActionMenu, "function", "patterns entry should expose ActionMenu");
assert.equal(
  Object.hasOwn(patterns, "Chat"),
  false,
  "patterns entry should not expose social components",
);

const social = await importPackage("@moritzbrantner/ui/social");
assert.equal(typeof social.Chat, "function", "social entry should expose Chat");
assert.equal(typeof social.SocialActionGroup, "function", "social entry should expose social actions");
assert.equal(typeof social.SocialPost, "function", "social entry should expose social feed");
assert.equal(typeof social.ProfileSummary, "function", "social entry should expose ProfileSummary");
assert.equal(
  Object.hasOwn(social, "Chat" + "Box"),
  false,
  "social entry should not expose the removed chat box API",
);

const labs = await importPackage("@moritzbrantner/ui/labs");
assert.equal(typeof labs.Timeline, "function", "labs entry should expose Timeline");
assert.equal(
  Object.hasOwn(labs, "WorkflowBuilder"),
  false,
  "labs entry should not expose workflow editor components",
);

const legacy = await importPackage("@moritzbrantner/ui/legacy");
assert.equal(typeof legacy.DataTable, "function", "legacy entry should expose DataTable");

const zleek = await importPackage("@moritzbrantner/ui/zleek");
assert.equal(zleek.uiTheme.name, "zleek", "zleek entry should expose zleek uiTheme");
assert.equal(typeof zleek.ZleekTheme, "function", "zleek entry should expose ZleekTheme");

const bobba = await importPackage("@moritzbrantner/ui/bobba");
assert.equal(bobba.uiTheme.name, "bobba", "bobba entry should expose bobba uiTheme");
assert.equal(typeof bobba.BobbaTheme, "function", "bobba entry should expose BobbaTheme");

const atlas = await importPackage("@moritzbrantner/ui/atlas");
assert.equal(atlas.uiTheme.name, "atlas", "atlas entry should expose atlas uiTheme");
assert.equal(typeof atlas.AtlasTheme, "function", "atlas entry should expose AtlasTheme");

const studio = await importPackage("@moritzbrantner/ui/studio");
assert.equal(studio.uiTheme.name, "studio", "studio entry should expose studio uiTheme");
assert.equal(typeof studio.StudioTheme, "function", "studio entry should expose StudioTheme");

const paper = await importPackage("@moritzbrantner/ui/paper");
assert.equal(paper.uiTheme.name, "paper", "paper entry should expose paper uiTheme");
assert.equal(typeof paper.PaperTheme, "function", "paper entry should expose PaperTheme");

const serverThemeEntries = [
  {
    specifier: "@moritzbrantner/ui/zleek/server",
    exportName: "zleekTheme",
    expectedName: "zleek",
  },
  {
    specifier: "@moritzbrantner/ui/bobba/server",
    exportName: "bobbaTheme",
    expectedName: "bobba",
  },
  {
    specifier: "@moritzbrantner/ui/atlas/server",
    exportName: "atlasTheme",
    expectedName: "atlas",
  },
  {
    specifier: "@moritzbrantner/ui/studio/server",
    exportName: "studioTheme",
    expectedName: "studio",
  },
  {
    specifier: "@moritzbrantner/ui/paper/server",
    exportName: "paperTheme",
    expectedName: "paper",
  },
] as const;

for (const themeEntry of serverThemeEntries) {
  const themeServer = await importPackage(themeEntry.specifier);

  assert.equal(
    themeServer.uiTheme.name,
    themeEntry.expectedName,
    `${themeEntry.specifier} should expose the matching uiTheme`,
  );
  assert.equal(
    themeServer[themeEntry.exportName].name,
    themeEntry.expectedName,
    `${themeEntry.specifier} should expose ${themeEntry.exportName}`,
  );
  assert.equal(
    Object.hasOwn(themeServer, "Button"),
    false,
    `${themeEntry.specifier} should not expose client components`,
  );
  assert.equal(
    Object.hasOwn(themeServer, `${capitalize(themeEntry.expectedName)}Theme`),
    false,
    `${themeEntry.specifier} should not expose client theme providers`,
  );
}

await assert.rejects(
  () => importPackage("@moritzbrantner/ui/components/button"),
  "old flat component subpaths should not be importable",
);

const button = await importPackage("@moritzbrantner/ui/components/stable/button");
assert.equal(typeof button.Button, "function", "button subpath should expose Button");

const dataGrid = await importPackage("@moritzbrantner/ui/components/patterns/data-grid");
assert.equal(typeof dataGrid.DataGrid, "function", "data-grid subpath should expose DataGrid");

const dialog = await importPackage("@moritzbrantner/ui/components/stable/dialog");
assert.equal(typeof dialog.Dialog, "function", "dialog subpath should expose Dialog");

const socialChat = await importPackage("@moritzbrantner/ui/components/social/chat");
assert.equal(
  typeof socialChat.Chat,
  "function",
  "social chat subpath should expose Chat",
);

const dataTable = await importPackage("@moritzbrantner/ui/components/legacy/data-table");
assert.equal(
  typeof dataTable.DataTable,
  "function",
  "legacy data-table subpath should expose DataTable",
);

const cn = await importPackage("@moritzbrantner/ui/lib/cn");
assert.equal(typeof cn.cn, "function", "cn subpath should expose cn");

const themes = await importPackage("@moritzbrantner/ui/themes");
assert.equal(themes.themeConfig.zleek.name, "zleek", "themes subpath should expose themeConfig");
assert.equal(themes.themeConfig.bobba.name, "bobba", "themes subpath should expose themeConfig");
assert.equal(themes.themeConfig.atlas.name, "atlas", "themes subpath should expose themeConfig");
assert.equal(themes.themeConfig.studio.name, "studio", "themes subpath should expose themeConfig");
assert.equal(themes.themeConfig.paper.name, "paper", "themes subpath should expose themeConfig");

const pack = spawnSync("npm", ["pack", "--dry-run", "--ignore-scripts", "--json"], {
  encoding: "utf8",
});

if (pack.error) {
  throw pack.error;
}

assert.equal(pack.status, 0, pack.stderr);

const [packageMetadata] = JSON.parse(pack.stdout) as PackageMetadata[];
const packageFiles = new Set(packageMetadata.files.map((file) => file.path));
const requiredPackageFiles = [
  "dist/index.js",
  "dist/index.d.ts",
  "dist/server.js",
  "dist/server.d.ts",
  "dist/client.js",
  "dist/client.d.ts",
  "dist/stable.js",
  "dist/stable.d.ts",
  "dist/patterns.js",
  "dist/patterns.d.ts",
  "dist/social.js",
  "dist/social.d.ts",
  "dist/labs.js",
  "dist/labs.d.ts",
  "dist/legacy.js",
  "dist/legacy.d.ts",
  "dist/zleek/server.js",
  "dist/zleek/server.d.ts",
  "dist/bobba/server.js",
  "dist/bobba/server.d.ts",
  "dist/atlas/server.js",
  "dist/atlas/server.d.ts",
  "dist/studio/server.js",
  "dist/studio/server.d.ts",
  "dist/paper/server.js",
  "dist/paper/server.d.ts",
  "dist/components/stable/button.js",
  "dist/components/stable/button.d.ts",
  "dist/components/stable/dialog.js",
  "dist/components/stable/dialog.d.ts",
  "dist/components/patterns/data-grid.js",
  "dist/components/patterns/data-grid.d.ts",
  "dist/components/social/chat.js",
  "dist/components/social/chat.d.ts",
  "dist/components/legacy/data-table.js",
  "dist/components/legacy/data-table.d.ts",
  "dist/lib/cn.js",
  "dist/themes.js",
  "styles.css",
  "theme-scopes.css",
  "bobba/styles.css",
  "zleek/styles.css",
  "atlas/styles.css",
  "studio/styles.css",
  "paper/styles.css",
];

for (const requiredFile of requiredPackageFiles) {
  assert.equal(packageFiles.has(requiredFile), true, `package must include ${requiredFile}`);
}

for (const filePath of packageFiles) {
  assert.equal(
    /(^|\/)(src|tests|\.storybook|storybook-static|coverage|visual|bench)\//.test(filePath),
    false,
    `package must not include development-only file ${filePath}`,
  );
  assert.equal(
    filePath.endsWith(".stories.tsx"),
    false,
    `package must not include story source ${filePath}`,
  );
}

console.log("@moritzbrantner/ui package exports and npm package contents verified");

function importPackage(specifier: string): Promise<PackageModule> {
  return import(specifier) as Promise<PackageModule>;
}

function capitalize(value: string): string {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}
