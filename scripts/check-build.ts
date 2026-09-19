import { readFile } from "node:fs/promises";
import config from "../next.config";
import { outputHashes } from "./stamp-build";
const expected = await config.generateBuildId?.();
const actual = (await readFile(".next/BUILD_ID", "utf8")).trim();
const receipt = JSON.parse(
  await readFile("artifacts/build-receipt.json", "utf8"),
);
if (
  expected !== actual ||
  receipt.buildId !== actual ||
  JSON.stringify(receipt.files) !== JSON.stringify(await outputHashes())
)
  throw new Error(
    "The source/content or export changed after the last build. Run npm run build before packaging.",
  );
console.log("Static build matches current source and root-path configuration.");
