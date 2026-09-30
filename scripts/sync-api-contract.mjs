import { writeFile } from "node:fs/promises";
import { join } from "node:path";

const sourceUrl = "https://raw.githubusercontent.com/mpalus-git/FixFlow.Api/main/openapi/v1.json";
const contractPath = join(import.meta.dirname, "..", "openapi", "fixflow-api.v1.json");

const response = await fetch(sourceUrl);
if (!response.ok) {
  console.error(`Failed to download ${sourceUrl}: ${String(response.status)}`);
  process.exit(1);
}

await writeFile(contractPath, await response.text());
console.log(`Updated ${contractPath}`);
