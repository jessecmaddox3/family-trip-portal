#!/usr/bin/env node
import http from "node:http";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
export function openBrowser(url) {
  const command =
    process.platform === "darwin"
      ? "open"
      : process.platform === "win32"
        ? "cmd"
        : "xdg-open";
  const args = process.platform === "win32" ? ["/c", "start", "", url] : [url];
  const child = spawn(command, args, { stdio: "ignore" });
  child.on("error", () => console.log(`Open ${url} in your browser.`));
  child.unref();
}
export async function startServer({
  directory,
  port = 5050,
  basePath = "",
  open = false,
}) {
  const root = await fs.realpath(directory);
  const mime = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json",
    ".txt": "text/plain; charset=utf-8",
    ".png": "image/png",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
    ".webm": "video/webm",
    ".vtt": "text/vtt; charset=utf-8",
  };
  const server = http.createServer(async (req, res) => {
    const address = server.address(),
      host = req.headers.host;
    if (
      !address ||
      typeof address === "string" ||
      ![`127.0.0.1:${address.port}`, `localhost:${address.port}`].includes(host)
    ) {
      res.writeHead(403).end();
      return;
    }
    if (
      req.headers.origin &&
      ![
        `http://127.0.0.1:${address.port}`,
        `http://localhost:${address.port}`,
      ].includes(req.headers.origin)
    ) {
      res.writeHead(403).end();
      return;
    }
    if (!["GET", "HEAD"].includes(req.method)) {
      res.writeHead(405, { Allow: "GET, HEAD" }).end();
      return;
    }
    try {
      const url = new URL(req.url, "http://localhost");
      let pathname = decodeURIComponent(url.pathname);
      if (basePath) {
        if (pathname === basePath) {
          res.writeHead(302, { Location: basePath + "/" }).end();
          return;
        }
        if (!pathname.startsWith(basePath + "/"))
          throw new Error("outside base path");
        pathname = pathname.slice(basePath.length);
      }
      if (
        pathname.includes("\\") ||
        pathname.includes("\0") ||
        pathname.split("/").includes("..")
      )
        throw new Error("invalid path");
      let file = path.resolve(root, "." + pathname);
      if (file !== root && !file.startsWith(root + path.sep))
        throw new Error("outside root");
      let stat = await fs.stat(file);
      if (stat.isDirectory()) {
        file = path.join(file, "index.html");
        stat = await fs.stat(file);
      }
      const real = await fs.realpath(file);
      if (real !== root && !real.startsWith(root + path.sep))
        throw new Error("outside root");
      if (!stat.isFile()) throw new Error("not a file");
      const data = await fs.readFile(real),
        headers = {
          "Content-Type":
            mime[path.extname(file)] || "application/octet-stream",
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
          "Referrer-Policy": "no-referrer",
          "Content-Length": data.length,
        };
      // Local media playback can request byte ranges.
      const range = req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
      if (range) {
        const start = Number(range[1]),
          end = range[2]
            ? Math.min(Number(range[2]), data.length - 1)
            : data.length - 1;
        if (start > end || start >= data.length) {
          res
            .writeHead(416, { "Content-Range": `bytes */${data.length}` })
            .end();
          return;
        }
        res.writeHead(206, {
          ...headers,
          "Accept-Ranges": "bytes",
          "Content-Range": `bytes ${start}-${end}/${data.length}`,
          "Content-Length": end - start + 1,
        });
        res.end(
          req.method === "HEAD" ? undefined : data.subarray(start, end + 1),
        );
        return;
      }
      res.writeHead(200, headers);
      res.end(req.method === "HEAD" ? undefined : data);
    } catch {
      res.writeHead(404, {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      });
      if (req.method === "HEAD") {
        res.end();
        return;
      }
      try {
        const fallback = await fs.realpath(path.join(root, "404.html"));
        if (
          !fallback.startsWith(root + path.sep) ||
          !(await fs.stat(fallback)).isFile()
        )
          throw new Error("outside root");
        res.end(await fs.readFile(fallback));
      } catch {
        res.end("Page not found");
      }
    }
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", resolve);
  });
  const address = server.address(),
    url = `http://127.0.0.1:${address.port}${basePath}/`;
  console.log(
    `Family Trip Portal: ${url}\nKeep this window open. Press Ctrl+C to stop.`,
  );
  if (open) openBrowser(url);
  return server;
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  if (Number(process.versions.node.split(".")[0]) < 22)
    throw new Error("Install Node.js 22 or newer from https://nodejs.org");
  const args = process.argv.slice(2),
    get = (name, fallback) => {
      const i = args.indexOf(name);
      return i < 0 ? fallback : args[i + 1];
    };
  const port = Number(get("--port", "5050")),
    basePath = get("--base-path", "");
  if (
    !Number.isInteger(port) ||
    port < 0 ||
    port > 65535 ||
    (basePath && !/^\/[a-zA-Z0-9/_-]+$/.test(basePath)) ||
    basePath.endsWith("/")
  )
    throw new Error("Invalid port or base path");
  startServer({
    directory: get("--dir", path.resolve("out")),
    port,
    basePath,
    open: args.includes("--open") && !args.includes("--no-open"),
  }).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
