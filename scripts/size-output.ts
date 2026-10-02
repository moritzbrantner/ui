import {
  closeSync,
  lstatSync,
  mkdirSync,
  openSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

export function assertSizeOutput(root: string, file: string): void {
  const relative = path.relative(root, file);
  if (
    !relative ||
    relative === ".." ||
    path.isAbsolute(relative) ||
    relative.startsWith(`..${path.sep}`)
  ) {
    throw new Error("Size output must stay inside its repository.");
  }
  let current = root;
  for (const part of relative.split(path.sep)) {
    current = path.join(current, part);
    if (lstatSync(current, { throwIfNoEntry: false })?.isSymbolicLink()) {
      throw new Error("Size output cannot cross a symlink boundary.");
    }
  }
}
export function writeSizeOutput(root: string, file: string, contents: string): void {
  assertSizeOutput(root, file);
  mkdirSync(path.dirname(file), { recursive: true });
  const temporary = `${file}.${process.pid}.tmp`;
  const descriptor = openSync(temporary, "wx");
  try {
    try {
      writeFileSync(descriptor, contents);
    } finally {
      closeSync(descriptor);
    }
    renameSync(temporary, file);
  } finally {
    rmSync(temporary, { force: true });
  }
}
