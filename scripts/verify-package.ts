import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

type PackageModule = Record<string, any>;

const root = await importPackage("@moritzbrantner/ui");
assert.equal(typeof root.Button, "function", "root export should include Button");
assert.equal(
  Object.hasOwn(root, "DataGrid"),
  false,
  "root export should not include data components",
);
assert.equal(typeof root.cn, "function", "root export should include cn");
assert.equal(typeof root.UiTheme, "function", "root export should include UiTheme");
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
assert.equal(
  Object.hasOwn(client, "DataGrid"),
  false,
  "client export should not include data components",
);
assert.equal(typeof client.Dialog, "function", "client export should include Dialog");

const stable = await importPackage("@moritzbrantner/ui/stable");
assert.equal(typeof stable.Button, "function", "stable entry should expose Button");
assert.equal(typeof stable.Dialog, "function", "stable entry should expose Dialog");

const patterns = await importPackage("@moritzbrantner/ui/patterns");
assert.equal(typeof patterns.ActionMenu, "function", "patterns entry should expose ActionMenu");
assert.equal(
  Object.hasOwn(patterns, "Chat"),
  false,
  "patterns entry should not expose social components",
);
assert.equal(
  Object.hasOwn(patterns, "DataGrid"),
  false,
  "patterns entry should not expose data components",
);

const data = await importPackage("@moritzbrantner/ui/data");
assert.equal(typeof data.DataGrid, "function", "data entry should expose DataGrid");
assert.equal(typeof data.ResourceList, "function", "data entry should expose ResourceList");
assert.equal(typeof data.FilterBar, "function", "data entry should expose FilterBar");

const shell = await importPackage("@moritzbrantner/ui/shell");
assert.equal(typeof shell.PageShell, "function", "shell entry should expose PageShell");
assert.equal(typeof shell.Navbar, "function", "shell entry should expose Navbar");

const social = await importPackage("@moritzbrantner/ui/social");
assert.equal(typeof social.Chat, "function", "social entry should expose Chat");
assert.equal(
  typeof social.SocialActionGroup,
  "function",
  "social entry should expose social actions",
);
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

const media = await importPackage("@moritzbrantner/ui/media");
assert.equal(typeof media.AnimatedImage, "function", "media entry should expose AnimatedImage");
assert.equal(typeof media.ImageCarousel, "function", "media entry should expose ImageCarousel");
assert.equal(typeof media.ImageCropper, "function", "media entry should expose ImageCropper");
assert.equal(
  typeof media.ImageFilterEditor,
  "function",
  "media entry should expose ImageFilterEditor",
);
assert.equal(typeof media.ImageGallery, "function", "media entry should expose ImageGallery");
assert.equal(
  typeof media.ImageThumbnailStrip,
  "function",
  "media entry should expose ImageThumbnailStrip",
);

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

const pop = await importPackage("@moritzbrantner/ui/pop");
assert.equal(pop.uiTheme.name, "pop", "pop entry should expose pop uiTheme");
assert.equal(typeof pop.PopTheme, "function", "pop entry should expose PopTheme");

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
  {
    specifier: "@moritzbrantner/ui/pop/server",
    exportName: "popTheme",
    expectedName: "pop",
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

const dataGrid = await importPackage("@moritzbrantner/ui/components/data/data-grid");
assert.equal(typeof dataGrid.DataGrid, "function", "data-grid subpath should expose DataGrid");

const dialog = await importPackage("@moritzbrantner/ui/components/stable/dialog");
assert.equal(typeof dialog.Dialog, "function", "dialog subpath should expose Dialog");

const socialChat = await importPackage("@moritzbrantner/ui/components/social/chat");
assert.equal(typeof socialChat.Chat, "function", "social chat subpath should expose Chat");

const imageCropper = await importPackage("@moritzbrantner/ui/components/media/image-cropper");
assert.equal(
  typeof imageCropper.ImageCropper,
  "function",
  "media image-cropper subpath should expose ImageCropper",
);

const animatedImage = await importPackage("@moritzbrantner/ui/components/media/animated-image");
assert.equal(
  typeof animatedImage.AnimatedImage,
  "function",
  "media animated-image subpath should expose AnimatedImage",
);

const imageCarousel = await importPackage("@moritzbrantner/ui/components/media/image-carousel");
assert.equal(
  typeof imageCarousel.ImageCarousel,
  "function",
  "media image-carousel subpath should expose ImageCarousel",
);

const imageGallery = await importPackage("@moritzbrantner/ui/components/media/image-gallery");
assert.equal(
  typeof imageGallery.ImageGallery,
  "function",
  "media image-gallery subpath should expose ImageGallery",
);

const imageThumbnailStrip = await importPackage(
  "@moritzbrantner/ui/components/media/image-thumbnail-strip",
);
assert.equal(
  typeof imageThumbnailStrip.ImageThumbnailStrip,
  "function",
  "media image-thumbnail-strip subpath should expose ImageThumbnailStrip",
);

const cn = await importPackage("@moritzbrantner/ui/lib/cn");
assert.equal(typeof cn.cn, "function", "cn subpath should expose cn");

const themes = await importPackage("@moritzbrantner/ui/themes");
assert.equal(themes.themeConfig.zleek.name, "zleek", "themes subpath should expose themeConfig");
assert.equal(themes.themeConfig.bobba.name, "bobba", "themes subpath should expose themeConfig");
assert.equal(themes.themeConfig.atlas.name, "atlas", "themes subpath should expose themeConfig");
assert.equal(themes.themeConfig.studio.name, "studio", "themes subpath should expose themeConfig");
assert.equal(themes.themeConfig.paper.name, "paper", "themes subpath should expose themeConfig");
assert.equal(themes.themeConfig.pop.name, "pop", "themes subpath should expose themeConfig");

const scopedThemeEntries = [
  ["@moritzbrantner/ui/themes/zleek", "ZleekTheme", "zleek"],
  ["@moritzbrantner/ui/themes/bobba", "BobbaTheme", "bobba"],
  ["@moritzbrantner/ui/themes/atlas", "AtlasTheme", "atlas"],
  ["@moritzbrantner/ui/themes/studio", "StudioTheme", "studio"],
  ["@moritzbrantner/ui/themes/paper", "PaperTheme", "paper"],
  ["@moritzbrantner/ui/themes/pop", "PopTheme", "pop"],
] as const;

for (const [specifier, componentName, themeName] of scopedThemeEntries) {
  const scopedTheme = await importPackage(specifier);

  assert.equal(scopedTheme.uiTheme.name, themeName, `${specifier} should expose uiTheme`);
  assert.equal(
    typeof scopedTheme[componentName],
    "function",
    `${specifier} should expose ${componentName}`,
  );
  assert.equal(
    Object.hasOwn(scopedTheme, "Button"),
    false,
    `${specifier} should not expose broad component barrels`,
  );
}

const pack = spawnSync("bun", ["pm", "pack", "--dry-run", "--ignore-scripts"], {
  encoding: "utf8",
});

if (pack.error) {
  throw pack.error;
}

assert.equal(pack.status, 0, pack.stderr);

const packageFiles = new Set(
  pack.stdout
    .split(/\r?\n/)
    .map((line) => /^packed\s+\S+\s+(.+)$/.exec(line)?.[1])
    .filter((file): file is string => Boolean(file)),
);
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
  "dist/data.js",
  "dist/data.d.ts",
  "dist/shell.js",
  "dist/shell.d.ts",
  "dist/social.js",
  "dist/social.d.ts",
  "dist/media.js",
  "dist/media.d.ts",
  "dist/labs.js",
  "dist/labs.d.ts",
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
  "dist/pop/server.js",
  "dist/pop/server.d.ts",
  "dist/components/stable/button.js",
  "dist/components/stable/button.d.ts",
  "dist/components/stable/dialog.js",
  "dist/components/stable/dialog.d.ts",
  "dist/components/data/data-grid.js",
  "dist/components/data/data-grid.d.ts",
  "dist/components/shell/navbar.js",
  "dist/components/shell/navbar.d.ts",
  "dist/components/social/chat.js",
  "dist/components/social/chat.d.ts",
  "dist/components/media/animated-image.js",
  "dist/components/media/animated-image.d.ts",
  "dist/components/media/image-carousel.js",
  "dist/components/media/image-carousel.d.ts",
  "dist/components/media/image-cropper.js",
  "dist/components/media/image-cropper.d.ts",
  "dist/components/media/image-gallery.js",
  "dist/components/media/image-gallery.d.ts",
  "dist/components/media/image-thumbnail-strip.js",
  "dist/components/media/image-thumbnail-strip.d.ts",
  "dist/components/media/media-gallery-types.js",
  "dist/components/media/media-gallery-types.d.ts",
  "dist/lib/cn.js",
  "dist/themes.js",
  "dist/themes/atlas.js",
  "dist/themes/atlas.d.ts",
  "dist/themes/bobba.js",
  "dist/themes/bobba.d.ts",
  "dist/themes/paper.js",
  "dist/themes/paper.d.ts",
  "dist/themes/pop.js",
  "dist/themes/pop.d.ts",
  "dist/themes/studio.js",
  "dist/themes/studio.d.ts",
  "dist/themes/zleek.js",
  "dist/themes/zleek.d.ts",
  "base.css",
  "styles.css",
  "theme-scopes.css",
  "bobba/styles.css",
  "zleek/styles.css",
  "atlas/styles.css",
  "studio/styles.css",
  "paper/styles.css",
  "pop/styles.css",
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

console.log("@moritzbrantner/ui package exports and package contents verified");

function importPackage(specifier: string): Promise<PackageModule> {
  return import(specifier) as Promise<PackageModule>;
}

function capitalize(value: string): string {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}
