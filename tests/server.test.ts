import { test } from "node:test";
import http from "node:http";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, rm, mkdir, symlink } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import { startServer } from "../scripts/serve.mjs";
test("local server confines files, rejects foreign hosts/origins and supports video ranges", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "portal-server-"));
  await mkdir(path.join(root, "site"));
  await writeFile(
    path.join(root, "site/index.html"),
    "<h1>Fictional demo</h1>",
  );
  await writeFile(path.join(root, "site/clip.webm"), "0123456789");
  await writeFile(path.join(root, "outside.txt"), "fixture only");
  const server = await startServer({
      directory: path.join(root, "site"),
      port: 0,
      basePath: "/demo",
    }),
    address = server.address();
  assert.ok(address && typeof address !== "string");
  const url = `http://127.0.0.1:${address.port}`;
  try {
    assert.equal((await fetch(url + "/demo/")).status, 200);
    assert.equal((await fetch(url + "/")).status, 404);
    const foreignHost = await new Promise<number | undefined>(
      (resolve, reject) => {
        const req = http.get(
          url + "/demo/",
          { headers: { Host: "example.invalid" } },
          (response) => {
            response.resume();
            resolve(response.statusCode);
          },
        );
        req.on("error", reject);
      },
    );
    assert.equal(foreignHost, 403);
    assert.equal(
      (
        await fetch(url + "/demo/", {
          headers: { Origin: "https://example.invalid" },
        })
      ).status,
      403,
    );
    assert.equal((await fetch(url + "/demo/", { method: "POST" })).status, 405);
    assert.equal((await fetch(url + "/demo/%2e%2e/outside.txt")).status, 404);
    const range = await fetch(url + "/demo/clip.webm", {
      headers: { Range: "bytes=2-4" },
    });
    assert.equal(range.status, 206);
    assert.equal(await range.text(), "234");
    assert.equal(
      (
        await fetch(url + "/demo/clip.webm", {
          headers: { Range: "bytes=30-" },
        })
      ).status,
      416,
    );
    if (process.platform !== "win32") {
      await symlink(
        path.join(root, "outside.txt"),
        path.join(root, "site/link.txt"),
      );
      assert.equal((await fetch(url + "/demo/link.txt")).status, 404);
    }
    if (process.platform !== "win32") {
      await symlink(
        path.join(root, "outside.txt"),
        path.join(root, "site/404.html"),
      );
      const missing = await fetch(url + "/demo/missing");
      assert.equal(missing.status, 404);
      assert.equal(await missing.text(), "Page not found");
      const head = await fetch(url + "/demo/missing", { method: "HEAD" });
      assert.equal(head.status, 404);
      assert.equal(await head.text(), "");
    }
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await rm(root, { recursive: true, force: true });
  }
});
