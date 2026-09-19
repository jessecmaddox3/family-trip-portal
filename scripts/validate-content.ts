import { validateContent } from "../src/lib/content";
validateContent()
  .then((years) => console.log(`Content valid: ${years.join(", ")}`))
  .catch((error) => {
    console.error(error instanceof Error ? error.message : "Invalid content");
    process.exitCode = 1;
  });
