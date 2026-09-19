import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests",
  testMatch: "browser.spec.ts",
  workers: 1,
  timeout: 90000,
  use: { headless: true },
  reporter: "list",
  outputDir: "artifacts/browser",
});
