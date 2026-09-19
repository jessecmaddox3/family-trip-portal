import { promises as fs } from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import config from "../next.config";
export async function outputHashes() {
  const files: { path: string; sha256: string }[] = [];
  async function walk(directory: string) {
    for (const name of (await fs.readdir(directory)).sort()) {
      const file = path.join(directory, name),
        stat = await fs.lstat(file);
      if (stat.isSymbolicLink()) throw new Error("Export contains a symlink");
      if (stat.isDirectory()) await walk(file);
      else if (stat.isFile())
        files.push({
          path: path.relative("out", file).replaceAll(path.sep, "/"),
          sha256: createHash("sha256")
            .update(await fs.readFile(file))
            .digest("hex"),
        });
    }
  }
  await walk("out");
  return files;
}
export async function stamp() {
  const expected = await config.generateBuildId?.(),
    actual = (await fs.readFile(".next/BUILD_ID", "utf8")).trim();
  if (expected !== actual)
    throw new Error("Build ID differs from current source");
  await fs.mkdir("artifacts", { recursive: true });
  await fs.writeFile(
    "artifacts/build-receipt.json",
    JSON.stringify({ buildId: actual, files: await outputHashes() }, null, 2) +
      "\n",
  );
}
if (process.argv[1]?.endsWith("stamp-build.ts")) await stamp();
