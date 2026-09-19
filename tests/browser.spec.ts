import { test, expect } from "@playwright/test";
import { startServer } from "../scripts/serve.mjs";
import { promises as fs } from "node:fs";
let server: Awaited<ReturnType<typeof startServer>>, origin: string;
const prefix = process.env.PORTAL_TEST_BASE_PATH || "";
test.beforeAll(async () => {
  server = await startServer({
    directory: process.env.PORTAL_TEST_DIR || "out",
    port: 0,
    basePath: prefix,
  });
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("No test port");
  origin = `http://127.0.0.1:${address.port}`;
  await fs.mkdir("artifacts/screenshots", { recursive: true });
});
test.afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
});
test("all ten route types render at four widths, without external requests or overflow", async ({
  browser,
}) => {
  const context = await browser.newContext(),
    page = await context.newPage(),
    errors: string[] = [],
    external: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await context.route("**/*", async (r) => {
    if (new URL(r.request().url()).origin !== origin) {
      external.push(r.request().url());
      await r.abort();
    } else await r.continue();
  });
  const paths = [
    "/",
    "/history/",
    ...["2033", "2034"].flatMap((y) =>
      [
        "",
        "schedule/",
        "tides/",
        "meals/",
        "packing/",
        "guide/",
        "people/",
        "photos/",
      ].map((s) => `/trip/${y}/${s}`),
    ),
  ];
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const path of paths) {
      const response = await page.goto(origin + prefix + path);
      expect(response?.status(), path).toBe(200);
      await page.locator("h1").waitFor();
      await page.evaluate(() => document.fonts.ready);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        `${width} ${path}`,
      ).toBe(true);
      if (width === 390 || width === 1440)
        if (
          [
            "/",
            "/history/",
            "/trip/2034/tides/",
            "/trip/2034/photos/",
          ].includes(path)
        )
          await page.screenshot({
            path: `artifacts/screenshots/${width}-${path.replaceAll("/", "_") || "home"}.png`,
            fullPage: true,
            animations: "disabled",
          });
    }
  }
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
  await context.close();
});
test("navigation, history, all tide days and local video work", async ({
  browser,
}) => {
  const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
    }),
    page = await context.newPage();
  await context.route("**/*", (r) =>
    new URL(r.request().url()).origin === origin ? r.continue() : r.abort(),
  );
  await page.goto(origin + prefix + "/trip/2033/meals/");
  await page.getByRole("button", { name: "Toggle menu" }).click();
  await expect(
    page
      .locator("#portal-mobile-menu")
      .getByRole("link", { name: "Packing", exact: true }),
  ).toHaveAttribute("href", prefix + "/trip/2033/packing/");
  await page
    .locator("#portal-mobile-menu")
    .getByRole("link", { name: "Packing", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Packing List" }),
  ).toBeVisible();
  await page.goto(origin + prefix + "/history/");
  expect(await page.locator('a[href*="/trip/2031"]').count()).toBe(0);
  await page.getByRole("button", { name: "More details" }).nth(1).click();
  await expect(
    page.getByText("Imaginary putting lawn", { exact: false }),
  ).toContainText("$0/player");
  await page.goto(origin + prefix + "/trip/2034/tides/");
  for (const button of await page.locator("button[aria-pressed]").all()) {
    await button.click();
    expect(await button.getAttribute("aria-pressed")).toBe("true");
    await expect(
      page.getByRole("heading", { name: "Organizer's Timing Preferences" }),
    ).toBeVisible();
    expect(
      await page
        .locator("svg")
        .evaluateAll((nodes) => nodes.some((n) => n.outerHTML.includes("NaN"))),
    ).toBe(false);
  }
  await expect(
    page.getByText("Sunrise: unavailable", { exact: true }),
  ).toBeVisible();
  await page.getByText("Read curve values as a table", { exact: true }).click();
  await expect(page.getByRole("table")).toBeVisible();
  await page.goto(origin + prefix + "/trip/2034/photos/");
  const video = page.locator("video");
  await video.evaluate(async (v: HTMLVideoElement) => {
    v.muted = true;
    await v.play();
  });
  await expect
    .poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime))
    .toBeGreaterThan(0);
  expect(await video.evaluate((v: HTMLVideoElement) => v.videoWidth)).toBe(640);
  await video.evaluate((v: HTMLVideoElement) => v.pause());
  const missing = await page.goto(origin + prefix + "/trip/2034oops/");
  expect(missing?.status()).toBe(404);
  await context.close();
});
test("the trip timezone controls chart labels in different browser zones", async ({
  browser,
}) => {
  const rendered: string[] = [];
  for (const timezoneId of ["UTC", "America/Los_Angeles", "Asia/Tokyo"]) {
    const context = await browser.newContext({ timezoneId }),
      page = await context.newPage();
    await context.route("**/*", (r) =>
      new URL(r.request().url()).origin === origin ? r.continue() : r.abort(),
    );
    await page.goto(origin + prefix + "/trip/2034/tides/");
    await page
      .getByRole("heading", { name: "Organizer's Timing Preferences" })
      .waitFor();
    rendered.push(await page.locator("#main-content").innerText());
    await context.close();
  }
  expect(rendered[1]).toBe(rendered[0]);
  expect(rendered[2]).toBe(rendered[0]);
});
