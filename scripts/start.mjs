#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { promises as fs } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { startServer } from "./serve.mjs";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(root);
if (Number(process.versions.node.split(".")[0]) < 22) {
  console.error(
    "Install Node.js 22 or newer from https://nodejs.org, then open this launcher again.",
  );
  process.exit(1);
}
process.env.NEXT_TELEMETRY_DISABLED = "1";
function npm(args) {
  const result = spawnSync(
    process.platform === "win32" ? "npm.cmd" : "npm",
    args,
    {
      cwd: root,
      stdio: "inherit",
      env: process.env,
      shell: process.platform === "win32",
    },
  );
  if (result.error) throw result.error;
  if (result.status !== 0)
    throw new Error(
      `npm ${args[0]} failed. The message above explains what to fix.`,
    );
}
try {
  const lock = await fs.readFile("package-lock.json"),
    digest = createHash("sha256").update(lock).digest("hex");
  let installed = "";
  try {
    installed = await fs.readFile("node_modules/.portal-lock-sha256", "utf8");
  } catch {}
  if (installed !== digest) {
    console.log(
      "First setup (or updated dependencies): downloading the locked project packages. This step needs internet.",
    );
    npm(["ci", "--ignore-scripts", "--no-fund"]);
    await fs.writeFile("node_modules/.portal-lock-sha256", digest);
  }
  npm(["run", "build"]);
  await startServer({
    directory: path.join(root, "out"),
    port: 5050,
    basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
    open: !process.argv.includes("--no-open"),
  });
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
