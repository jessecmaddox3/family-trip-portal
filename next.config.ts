import type { NextConfig } from "next";
import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
async function contentBuildId() {
  const hash = createHash("sha256");
  async function add(name: string, logical = name) {
    const st = await fs.stat(name);
    if (st.isDirectory()) {
      for (const f of (await fs.readdir(name)).sort())
        await add(path.join(name, f), path.join(logical, f));
    } else {
      hash.update(logical.replaceAll(path.sep, "/"));
      hash.update(await fs.readFile(name));
    }
  }
  for (const name of [
    "src",
    "public",
    "package-lock.json",
    "package.json",
    "next.config.ts",
    "postcss.config.mjs",
    "tsconfig.json",
  ])
    await add(name);
  await add(process.env.PORTAL_CONTENT_DIR || "content", "content");
  await add(
    process.env.PORTAL_CONFIG || "portal.config.json",
    "portal.config.json",
  );
  hash.update(basePath);
  return hash.digest("hex").slice(0, 20);
}
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
if (basePath && !/^\/[a-zA-Z0-9/_-]+$/.test(basePath))
  throw new Error(
    "NEXT_PUBLIC_BASE_PATH must be a simple absolute path, without a trailing slash",
  );
if (basePath.endsWith("/"))
  throw new Error("Remove the trailing slash from NEXT_PUBLIC_BASE_PATH");
const config: NextConfig = {
  output: "export",
  generateBuildId: contentBuildId,
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
  poweredByHeader: false,
};
export default config;
