import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const storybookStaticDir = path.join(packageRoot, "storybook-static");
const port = Number(process.env.UNLIGHTHOUSE_PORT ?? "6008");
const host = "127.0.0.1";
const localSite = `http://${host}:${port}`;
const site = process.env.UNLIGHTHOUSE_SITE ?? localSite;
const chromePath = process.env.CHROME_PATH ?? chromium.executablePath();

if (!process.env.UNLIGHTHOUSE_SITE && !existsSync(path.join(storybookStaticDir, "index.html"))) {
  console.error(
    "@moritzbrantner/ui Unlighthouse requires built Storybook output. Run `bun run build-storybook` first.",
  );
  process.exit(1);
}

if (!existsSync(chromePath)) {
  console.error(
    `@moritzbrantner/ui Unlighthouse could not find Chromium at ${chromePath}. Run \`bunx playwright install chromium\` first.`,
  );
  process.exit(1);
}

const server = process.env.UNLIGHTHOUSE_SITE
  ? undefined
  : await startStaticServer(storybookStaticDir, port);

try {
  const result = await runCommand(
    path.join(
      packageRoot,
      "node_modules",
      ".bin",
      process.platform === "win32" ? "unlighthouse-ci.cmd" : "unlighthouse-ci",
    ),
    ["--config-file", "unlighthouse.config.ts"],
    {
      CHROME_PATH: chromePath,
      UNLIGHTHOUSE_SITE: site,
    },
  );

  process.exitCode = result;
} finally {
  await new Promise<void>((resolve, reject) => {
    if (!server) {
      resolve();
      return;
    }

    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

async function startStaticServer(root: string, serverPort: number) {
  const server = createServer((request, response) => {
    const requestUrl = new URL(request.url ?? "/", localSite);
    const filePath = resolveStaticPath(root, requestUrl.pathname);

    if (!filePath) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "Content-Type": contentTypeForPath(filePath),
    });
    createReadStream(filePath).pipe(response);
  });

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(serverPort, host, () => {
      server.off("error", reject);
      resolve();
    });
  });

  return server;
}

function resolveStaticPath(root: string, pathname: string) {
  const decodedPath = decodeURIComponent(pathname);
  const normalizedPath = path.normalize(decodedPath).replace(/^(\.\.[/\\])+/, "");
  const requestedPath = path.join(root, normalizedPath);
  const candidatePath = requestedPath.endsWith(path.sep)
    ? path.join(requestedPath, "index.html")
    : requestedPath;

  if (!candidatePath.startsWith(root)) {
    return null;
  }

  if (existsSync(candidatePath) && statSync(candidatePath).isFile()) {
    return candidatePath;
  }

  const indexPath = path.join(candidatePath, "index.html");
  if (existsSync(indexPath) && statSync(indexPath).isFile()) {
    return indexPath;
  }

  return null;
}

function contentTypeForPath(filePath: string) {
  switch (path.extname(filePath)) {
    case ".css":
      return "text/css";
    case ".html":
      return "text/html";
    case ".js":
      return "text/javascript";
    case ".json":
      return "application/json";
    case ".svg":
      return "image/svg+xml";
    case ".woff2":
      return "font/woff2";
    default:
      return "application/octet-stream";
  }
}

function runCommand(command: string, args: string[], env: Record<string, string>) {
  return new Promise<number>((resolve) => {
    let resolved = false;
    const resolveOnce = (code: number) => {
      if (resolved) {
        return;
      }

      resolved = true;
      resolve(code);
    };
    const child = spawn(command, args, {
      cwd: packageRoot,
      env: {
        ...process.env,
        ...env,
      },
      shell: false,
      stdio: "inherit",
    });

    child.on("error", (error) => {
      console.error(error);
      resolveOnce(1);
    });

    child.on("close", (code) => {
      resolveOnce(code ?? 1);
    });
  });
}
