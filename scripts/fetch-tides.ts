import { readFile } from "node:fs/promises";
import path from "node:path";
import { fetchTideData, writeTideData } from "../src/lib/tide-fetch";

async function main() {
  const [config, output, ...extra] = process.argv.slice(2);
  if (!config || !output || extra.length) {
    console.log(
      "Usage: npm run fetch-tides -- YOUR-CONFIG.json NEW-TIDES.json\nExplicitly downloads NOAA predictions and optional solar data. Never runs during install, build or demo.",
    );
    process.exitCode = config && config !== "--help" ? 1 : 0;
    return;
  }
  if (path.resolve(config) === path.resolve(output))
    throw new Error("Config and output must be different files");
  const candidate = await fetchTideData(
    JSON.parse(await readFile(config, "utf8")),
  );
  await writeTideData(output, candidate);
  console.log(
    `Saved validated predictions to ${output}. Review them before replacing your trip's tides.json.`,
  );
}
main().catch((error) => {
  console.error(
    error instanceof Error ? error.message : "Tide acquisition failed",
  );
  process.exitCode = 1;
});
