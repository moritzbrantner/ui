import { statSync } from "node:fs";

import { listFiles } from "./list-files.js";

export type AssetSizeReport = {
  totalBytes: number;
  maxChunkBytes: number;
};

export function getAssetSizeReport(assetsDir: string, extension: ".css" | ".js"): AssetSizeReport {
  const assetFiles = listFiles(assetsDir).filter((filePath) => filePath.endsWith(extension));

  if (assetFiles.length === 0) {
    throw new Error(`consumer build did not emit any ${extension} chunks`);
  }

  const sizes = assetFiles.map((filePath) => statSync(filePath).size);

  return {
    totalBytes: sizes.reduce((total, size) => total + size, 0),
    maxChunkBytes: Math.max(...sizes),
  };
}

export function formatKb(bytes: number): string {
  return `${Math.round(bytes / 1024)} KB`;
}
